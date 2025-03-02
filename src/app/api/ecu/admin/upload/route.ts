import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { verifyToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const originalFileId = formData.get('originalFileId') as string;
    const message = formData.get('message') as string;

    if (!file || !(file instanceof File) || !originalFileId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.bin')) {
      return NextResponse.json({ error: 'Only .bin files are allowed' }, { status: 400 });
    }

    // Get original file details
    const originalFiles = await executeQuery<any[]>(
      'SELECT user_id FROM ecu_files WHERE id = ?',
      [originalFileId]
    );

    if (!originalFiles || originalFiles.length === 0) {
      return NextResponse.json({ error: 'Original file not found' }, { status: 404 });
    }

    const originalFile = originalFiles[0];
    
    // Generate unique filename
    const uniqueFilename = `${uuidv4()}.bin`;
    const uploadDir = join(process.cwd(), 'uploads');
    const filePath = join(uploadDir, uniqueFilename);

    // Save file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Update original file status and add processed file info
    await executeQuery(
      'UPDATE ecu_files SET status = ?, processed_filename = ?, admin_message = ? WHERE id = ?',
      ['completed', uniqueFilename, message || null, originalFileId]
    );

    return NextResponse.json({
      success: true,
      message: 'File processed and uploaded successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Admin upload error:', error);
    return NextResponse.json(
      { error: 'An error occurred during file processing' },
      { status: 500 }
    );
  }
}