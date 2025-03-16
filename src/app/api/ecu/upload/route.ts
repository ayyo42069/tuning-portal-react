import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeTransaction } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import multer from "multer";
import { Readable } from "stream";

interface UploadRequest {
  manufacturerId: number;
  modelId: number;
  productionYear: number;
  tuningOptions: number[];
  message?: string;
}

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
    const uniqueFilename = `${uuidv4()}.bin`;
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

export async function POST(request: NextRequest) {
  try {
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

    // Create a mock request and response for multer
    const buffer = await request.arrayBuffer();
    const stream = bufferToStream(Buffer.from(buffer));
    const mockReq: any = {
      headers: Object.fromEntries(request.headers),
      method: request.method,
      url: request.url,
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
    mockReq.headers["content-type"] = request.headers.get("content-type") || "";

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
      const data = JSON.parse(mockReq.body.data) as UploadRequest;

      if (!file) {
        return NextResponse.json(
          { error: "No file uploaded" },
          { status: 400 }
        );
      }

      if (
        !data.manufacturerId ||
        !data.modelId ||
        !data.productionYear ||
        !data.tuningOptions?.length
      ) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Calculate total credit cost
      // Using FIND_IN_SET for proper handling of multiple IDs
      let totalCreditCost = 0;

      // If there are tuning options selected
      if (data.tuningOptions && data.tuningOptions.length > 0) {
        // Query each option individually to avoid IN clause issues with joined strings
        for (const optionId of data.tuningOptions) {
          const [option] = await executeQuery<any>(
            "SELECT credit_cost FROM tuning_options WHERE id = ?",
            [optionId]
          );

          if (option && option.credit_cost) {
            totalCreditCost += parseInt(option.credit_cost);
          }
        }
      }

      // Log the calculation for debugging
      console.log(
        `Calculated credit cost for options ${JSON.stringify(
          data.tuningOptions
        )}: ${totalCreditCost}`
      );

      // Ensure minimum cost of 1 credit
      if (totalCreditCost <= 0) {
        totalCreditCost = 1;
      }

      // Check if user has enough credits
      const [userCredits] = await executeQuery<any>(
        "SELECT credits FROM user_credits WHERE user_id = ?",
        [user.id]
      );

      const availableCredits = userCredits?.credits || 0;

      if (availableCredits < totalCreditCost) {
        return NextResponse.json(
          {
            error: `Insufficient credits. Required: ${totalCreditCost}, Available: ${availableCredits}`,
          },
          { status: 400 }
        );
      }

      // Start transaction
      await executeTransaction("START TRANSACTION");

      try {
        // Insert file record into database
        const result = await executeQuery<any>(
          "INSERT INTO ecu_files (user_id, manufacturer_id, model_id, production_year, original_filename, stored_filename, file_size, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            user.id,
            data.manufacturerId,
            data.modelId,
            data.productionYear,
            file.originalname,
            file.filename,
            file.size,
            data.message || null,
          ]
        );

        const fileId = result.insertId;

        // Insert tuning options
        for (const optionId of data.tuningOptions) {
          await executeQuery(
            "INSERT INTO ecu_file_tuning_options (ecu_file_id, tuning_option_id) VALUES (?, ?)",
            [fileId, optionId]
          );
        }

        // Deduct credits from user's account
        await executeQuery(
          "UPDATE user_credits SET credits = credits - ? WHERE user_id = ?",
          [totalCreditCost, user.id]
        );

        // Record credit transaction with detailed information
        await executeQuery(
          "INSERT INTO credit_transactions (user_id, amount, transaction_type, stripe_payment_id) VALUES (?, ?, ?, ?)",
          [user.id, -totalCreditCost, "usage", `ecu_file_${fileId}`]
        );

        // Log the credit transaction for debugging
        console.log(
          `Deducted ${totalCreditCost} credits from user ${user.id} for ECU file ${fileId}`
        );
        console.log(
          `Selected tuning options: ${JSON.stringify(data.tuningOptions)}`
        );

        // Verify the credit deduction was successful
        const [verifyCredits] = await executeQuery<any>(
          "SELECT credits FROM user_credits WHERE user_id = ?",
          [user.id]
        );
        console.log(
          `User ${user.id} now has ${
            verifyCredits?.credits || 0
          } credits remaining`
        );

        // Commit transaction
        await executeTransaction("COMMIT");

        return NextResponse.json(
          {
            success: true,
            fileId,
            creditCost: totalCreditCost,
            remainingCredits: availableCredits - totalCreditCost,
            message: "File uploaded successfully",
          },
          { status: 201 }
        );
      } catch (error) {
        // Rollback on error
        await executeTransaction("ROLLBACK");
        throw error;
      }
    } catch (multerError: any) {
      return NextResponse.json(
        { error: multerError.message || "File upload failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "An error occurred during file upload" },
      { status: 500 }
    );
  }
}
