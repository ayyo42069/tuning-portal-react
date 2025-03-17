import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const token = request.cookies.get("auth_token")?.value;
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

    // Get all tuning requests with details
    const requests = await executeQuery<any[]>(
      `SELECT 
        ef.id,
        ef.user_id,
        ef.original_filename as file_name,
        ef.original_filename,
        ef.stored_filename,
        CONCAT(m.name, ' ', vm.name, ' (', ef.production_year, ')') as vehicle_info,
        m.name as manufacturer_name,
        vm.name as model_name,
        ef.production_year,
        COALESCE(ef.status, 'pending') as status,
        ef.created_at,
        ef.updated_at,
        ef.message as admin_message,
        ef.estimated_time,
        COALESCE(ef.priority, 0) as priority
      FROM ecu_files ef
      JOIN manufacturers m ON ef.manufacturer_id = m.id
      JOIN vehicle_models vm ON ef.model_id = vm.id
      ORDER BY ef.created_at DESC`
    );

    // For each request, get the tuning options
    const requestsWithOptions = await Promise.all(
      requests.map(async (request) => {
        const tuningOptions = await executeQuery<any[]>(
          `SELECT 
            opt.id, 
            opt.name, 
            opt.description, 
            opt.credit_cost
          FROM tuning_options opt
          JOIN ecu_file_tuning_options efto ON opt.id = efto.tuning_option_id
          WHERE efto.ecu_file_id = ?`,
          [request.id]
        );

        return {
          ...request,
          tuning_options: tuningOptions || [],
        };
      })
    );

    return NextResponse.json({
      success: true,
      requests: requestsWithOptions,
    });
  } catch (error) {
    console.error("Error fetching tuning requests:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching tuning requests" },
      { status: 500 }
    );
  }
}
