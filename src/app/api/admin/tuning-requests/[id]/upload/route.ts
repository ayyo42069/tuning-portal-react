import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication and admin role
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get file ID from URL
    const params = await context.params;
    const fileId = params.id;
    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Check if the file exists
    const files = await executeQuery<any[]>(
      "SELECT id FROM ecu_files WHERE id = ?",
      [fileId]
    );

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith(".bin")) {
      return NextResponse.json(
        { error: "Only .bin files are allowed" },
        { status: 400 }
      );
    }

    // Generate unique filename for processed file
    const uniqueFilename = `processed_${uuidv4()}.bin`;
    const uploadDir = join(process.cwd(), "uploads");

    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, uniqueFilename);

    // Save file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Update file record in database
    await executeQuery(
      `UPDATE ecu_files 
       SET processed_filename = ?, status = 'completed', updated_at = NOW() 
       WHERE id = ?`,
      [uniqueFilename, fileId]
    );

    return NextResponse.json({
      success: true,
      message: "Processed file uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading processed file:", error);
    return NextResponse.json(
      { error: "An error occurred while uploading the processed file" },
      { status: 500 }
    );
  }
}
