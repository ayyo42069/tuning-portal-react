import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

interface TuningFileDetails {
  id: number;
  user_id: number;
  file_name: string;
  original_filename: string;
  stored_filename: string;
  processed_filename: string | null;
  vehicle_info: string;
  manufacturer_name: string;
  model_name: string;
  production_year: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  credits_used: number;
  admin_message: string | null;
  tuning_options: {
    id: number;
    name: string;
    description: string;
    credit_cost: number;
  }[];
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
        ef.original_filename as file_name,
        ef.original_filename,
        ef.stored_filename,
        ef.processed_filename,
        CONCAT(m.name, ' ', vm.name, ' (', ef.production_year, ')') as vehicle_info,
        m.name as manufacturer_name,
        vm.name as model_name,
        ef.production_year,
        ef.status,
        ef.created_at,
        ef.updated_at,
        ef.message as admin_message,
        COALESCE(ef.priority, 0) as priority,
        0 as credits_used
      FROM ecu_files ef
      JOIN manufacturers m ON ef.manufacturer_id = m.id
      JOIN vehicle_models vm ON ef.model_id = vm.id
      WHERE ef.id = ? AND ef.user_id = ?`,
      [fileId, user.id]
    );

    if (!fileDetails || fileDetails.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get tuning options for this file
    const tuningOptions = await executeQuery<any[]>(
      `SELECT 
        opt.id, 
        opt.name, 
        opt.description, 
        opt.credit_cost
      FROM tuning_options opt
      JOIN ecu_file_tuning_options efto ON opt.id = efto.tuning_option_id
      WHERE efto.ecu_file_id = ?`,
      [fileId]
    );

    const fileData = {
      ...fileDetails[0],
      tuning_options: tuningOptions || [],
    };

    return NextResponse.json({
      success: true,
      tuningFile: fileData,
    });
  } catch (error) {
    console.error("Error fetching tuning file details:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching tuning file details" },
      { status: 500 }
    );
  }
}
