import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { isBuildTimeRequest } from "@/lib/buildAuth";

interface TuningFile {
  id: number;
  user_id: number;
  file_name: string;
  vehicle_info: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  credits_used: number;
  tuning_options: string;
}

export async function GET(request: NextRequest) {
  try {
    // Check if this is a build-time request
    const isBuild = await isBuildTimeRequest();
    
    if (!isBuild) {
      // Verify authentication for non-build requests
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

      // Get user's tuning files with detailed information
      const tuningFiles = await executeQuery<TuningFile[]>(
        `SELECT 
          ef.id,
          ef.user_id,
          ef.original_filename as file_name,
          CONCAT(m.name, ' ', vm.name, ' (', ef.production_year, ')') as vehicle_info,
          ef.status,
          ef.created_at,
          ef.updated_at,
          GROUP_CONCAT(to2.name SEPARATOR ', ') as tuning_options,
          SUM(to2.credit_cost) as credits_used
         FROM ecu_files ef
         JOIN manufacturers m ON ef.manufacturer_id = m.id
         JOIN vehicle_models vm ON ef.model_id = vm.id
         LEFT JOIN ecu_file_tuning_options efto ON ef.id = efto.ecu_file_id
         LEFT JOIN tuning_options to2 ON efto.tuning_option_id = to2.id
         WHERE ef.user_id = ?
         GROUP BY ef.id, ef.user_id, ef.original_filename, m.name, vm.name, ef.production_year, ef.status, ef.created_at, ef.updated_at
         ORDER BY ef.created_at DESC`,
        [user.id]
      );

      return NextResponse.json({
        success: true,
        tuningFiles: tuningFiles || [],
      });
    }

    // For build-time requests, return empty array
    return NextResponse.json({
      success: true,
      tuningFiles: [],
    });
  } catch (error) {
    console.error("Error fetching tuning history:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching tuning history" },
      { status: 500 }
    );
  }
}