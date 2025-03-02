import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    // Get file ID from URL
    const fileId = request.nextUrl.searchParams.get("id");
    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Verify authentication
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get tuning file details
    const fileDetails = await executeQuery<any[]>(
      `SELECT 
        ef.id,
        ef.user_id,
        ef.original_filename,
        ef.stored_filename,
        ef.processed_filename
      FROM ecu_files ef
      WHERE ef.id = ? AND ef.user_id = ? AND ef.status = 'completed'`,
      [fileId, user.id]
    );

    if (!fileDetails || fileDetails.length === 0) {
      return NextResponse.json(
        { error: "File not found or not ready for download" },
        { status: 404 }
      );
    }

    const fileData = fileDetails[0];

    // Check if processed file exists
    if (!fileData.processed_filename) {
      return NextResponse.json(
        { error: "Processed file not available" },
        { status: 404 }
      );
    }

    // Get file path
    const uploadsDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadsDir, fileData.processed_filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found on server" },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);

    // Create response with file
    const response = new NextResponse(fileBuffer);

    // Set headers for file download
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${fileData.original_filename}"`
    );
    response.headers.set("Content-Type", "application/octet-stream");

    return response;
  } catch (error) {
    console.error("Error downloading tuning file:", error);
    return NextResponse.json(
      { error: "An error occurred while downloading the file" },
      { status: 500 }
    );
  }
}
