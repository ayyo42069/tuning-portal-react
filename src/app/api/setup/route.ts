import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// SQL script to create the ecu_file_feedback table
const createEcuFileFeedbackTableSQL = `
CREATE TABLE IF NOT EXISTS ecu_file_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ecu_file_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ecu_file_id) REFERENCES ecu_files(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_file_feedback (user_id, ecu_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

export async function GET(req: NextRequest) {
  try {
    // Check if the ecu_file_feedback table exists
    const tableExistsResult = await executeQuery<any[]>(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'tuning_portal' AND table_name = 'ecu_file_feedback'",
      [],
      { cache: false }
    );
    
    const tableExists = tableExistsResult[0]?.count > 0;
    
    if (tableExists) {
      return NextResponse.json({
        success: true,
        message: "Table 'ecu_file_feedback' already exists",
        tableExists: true
      });
    }
    
    // Create the ecu_file_feedback table
    await executeQuery<any[]>(createEcuFileFeedbackTableSQL, [], { cache: false });
    
    return NextResponse.json({
      success: true,
      message: "Table 'ecu_file_feedback' created successfully",
      tableExists: false
    });
  } catch (error) {
    console.error("Error setting up ecu_file_feedback table:", error);
    return NextResponse.json({
      success: false,
      message: "Error creating table: " + (error instanceof Error ? error.message : String(error)),
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 