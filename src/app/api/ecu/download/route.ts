import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Get file ID from URL
    const fileId = request.nextUrl.searchParams.get('id');
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Get file details from database
    const files = await executeQuery<any[]>(
      'SELECT stored_filename, original_filename FROM ecu_files WHERE id = ?',
      [fileId]
    );

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = files[0];
    const uploadDir = join(process.cwd(), 'uploads');
    const filePath = join(uploadDir, file.stored_filename);

    // Read file from disk
    const fileBuffer = await readFile(filePath);

    // Create response with file
    const response = new NextResponse(fileBuffer);
    
    // Set appropriate headers
    response.headers.set('Content-Disposition', `attachment; filename=${file.original_filename}`);
    response.headers.set('Content-Type', 'application/octet-stream');

    return response;
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'An error occurred during file download' },
      { status: 500 }
    );
  }
}