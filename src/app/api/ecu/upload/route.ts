import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

interface UploadRequest {
  manufacturerId: number;
  modelId: number;
  productionYear: number;
  tuningOptions: number[];
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const data = JSON.parse(formData.get('data') as string) as UploadRequest;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!data.manufacturerId || !data.modelId || !data.productionYear || !data.tuningOptions?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.bin')) {
      return NextResponse.json({ error: 'Only .bin files are allowed' }, { status: 400 });
    }

    // Calculate total credit cost
    const tuningOptionsQuery = await executeQuery<any>(
      'SELECT SUM(credit_cost) as total_cost FROM tuning_options WHERE id IN (?)',
      [data.tuningOptions.join(',')]
    );
    
    const totalCreditCost = tuningOptionsQuery[0]?.total_cost || 0;

    // Check if user has enough credits
    const [userCredits] = await executeQuery<any>(
      'SELECT credits FROM user_credits WHERE user_id = ?',
      [user.id]
    );

    const availableCredits = userCredits?.credits || 0;

    if (availableCredits < totalCreditCost) {
      return NextResponse.json(
        { error: `Insufficient credits. Required: ${totalCreditCost}, Available: ${availableCredits}` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const uniqueFilename = `${uuidv4()}.bin`;
    const uploadDir = join(process.cwd(), 'uploads');
    
    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    const filePath = join(uploadDir, uniqueFilename);

    // Save file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Start transaction
    await executeTransaction('START TRANSACTION');

    try {
      // Insert file record into database
      const result = await executeQuery<any>(
        'INSERT INTO ecu_files (user_id, manufacturer_id, model_id, production_year, original_filename, stored_filename, file_size, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user.id, data.manufacturerId, data.modelId, data.productionYear, file.name, uniqueFilename, file.size, data.message || null]
      );

      const fileId = result.insertId;

      // Insert tuning options
      for (const optionId of data.tuningOptions) {
        await executeQuery(
          'INSERT INTO ecu_file_tuning_options (ecu_file_id, tuning_option_id) VALUES (?, ?)',
          [fileId, optionId]
        );
      }

      // Deduct credits from user's account
      await executeQuery(
        'UPDATE user_credits SET credits = credits - ? WHERE user_id = ?',
        [totalCreditCost, user.id]
      );

      // Record credit transaction
      await executeQuery(
        'INSERT INTO credit_transactions (user_id, amount, transaction_type) VALUES (?, ?, ?)',
        [user.id, -totalCreditCost, 'usage']
      );

      // Commit transaction
      await executeTransaction('COMMIT');

      return NextResponse.json({
        success: true,
        fileId,
        creditCost: totalCreditCost,
        remainingCredits: availableCredits - totalCreditCost,
        message: 'File uploaded successfully'
      }, { status: 201 });

    } catch (error) {
      // Rollback on error
      await executeTransaction('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'An error occurred during file upload' },
      { status: 500 }
    );
  }
}