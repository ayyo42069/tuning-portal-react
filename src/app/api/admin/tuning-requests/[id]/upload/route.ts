import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import { Readable } from "stream";

// Define custom request type for multer
interface MulterRequest extends Request {
  storedFilename?: string;
  file?: any;
}

// Configure multer storage
const uploadDir = join(process.cwd(), "uploads");

// Create a multer storage configuration
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        return cb(new Error("Failed to create upload directory"), "");
      }
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `processed_${uuidv4()}.bin`;
    // Store the filename on the request object to access it later
    (req as unknown as MulterRequest).storedFilename = uniqueFilename;
    cb(null, uniqueFilename);
  },
});

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only .bin files
    if (!file.originalname.endsWith(".bin")) {
      return cb(new Error("Only .bin files are allowed"));
    }
    cb(null, true);
  },
});

// Helper function to convert NextRequest to Node's IncomingMessage
function bufferToStream(buffer: Buffer) {
  const readable = new Readable();
  readable._read = () => {}; // _read is required but you can noop it
  readable.push(buffer);
  readable.push(null);
  return readable;
}

// Promisify multer middleware
function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

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

    // Create a mock request and response for multer
    const buffer = await req.arrayBuffer();
    const stream = bufferToStream(Buffer.from(buffer));
    const mockReq: any = {
      headers: Object.fromEntries(req.headers),
      method: req.method,
      url: req.url,
      body: {},
    };

    // Add the stream to the request
    mockReq.pipe = function () {
      return stream.pipe.apply(
        stream,
        arguments as unknown as [NodeJS.WritableStream]
      );
    };
    mockReq.unpipe = function () {
      // Convert IArguments to an array and cast to the expected type
      const args = Array.from(arguments) as unknown as [NodeJS.WritableStream?];
      return stream.unpipe.apply(stream, args);
    };
    mockReq.on = stream.on.bind(stream);
    mockReq.headers["content-type"] = req.headers.get("content-type") || "";

    const mockRes: any = {
      setHeader: () => {},
      status: () => mockRes,
      json: () => mockRes,
      send: () => mockRes,
      end: () => {},
    };

    try {
      // Run multer middleware
      await runMiddleware(mockReq, mockRes, upload.single("file"));

      // If we get here, file upload was successful
      const file = mockReq.file;

      if (!file) {
        return NextResponse.json(
          { error: "No file uploaded" },
          { status: 400 }
        );
      }

      // Update file record in database
      await executeQuery(
        `UPDATE ecu_files 
         SET processed_filename = ?, status = 'completed', updated_at = NOW() 
         WHERE id = ?`,
        [file.filename, fileId]
      );

      return NextResponse.json({
        success: true,
        message: "Processed file uploaded successfully",
      });
    } catch (multerError: any) {
      return NextResponse.json(
        { error: multerError.message || "File upload failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error uploading processed file:", error);
    return NextResponse.json(
      { error: "An error occurred while uploading the processed file" },
      { status: 500 }
    );
  }
}
