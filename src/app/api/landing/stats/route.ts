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
    // Try to create the ecu_file_feedback table if it doesn't exist
    try {
      await executeQuery<any[]>(createEcuFileFeedbackTableSQL, [], { cache: false });
      console.log("Successfully created or verified ecu_file_feedback table");
    } catch (error) {
      console.error("Error creating ecu_file_feedback table:", error);
      // Continue execution even if table creation fails
    }

    // Get total users
    const usersResult = await executeQuery<any[]>(
      "SELECT COUNT(*) as total FROM users WHERE role = 'user'",
      [],
      { cache: true, cacheTTL: 300000 } // 5 minutes
    );
    const totalUsers = usersResult[0]?.total || 0;

    // Get total files
    const filesResult = await executeQuery<any[]>(
      "SELECT COUNT(*) as total FROM ecu_files",
      [],
      { cache: true, cacheTTL: 300000 } // 5 minutes
    );
    const totalFiles = filesResult[0]?.total || 0;

    // Get satisfaction rate - handle case when ecu_file_feedback table doesn't exist
    let satisfactionPercent = 0;
    try {
      // First check if the ecu_file_feedback table exists
      const tableExistsResult = await executeQuery<any[]>(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'tuning_portal' AND table_name = 'ecu_file_feedback'",
        [],
        { cache: true, cacheTTL: 300000 } // 5 minutes
      );
      
      const tableExists = tableExistsResult[0]?.count > 0;
      
      if (tableExists) {
        // If table exists, use the original query
        const satisfactionResult = await executeQuery<any[]>(
          `SELECT 
            ROUND(AVG(rating) * 20) as satisfaction_percent 
           FROM (
             SELECT rating FROM ticket_responses WHERE rating IS NOT NULL
             UNION ALL
             SELECT rating FROM ecu_file_feedback WHERE rating IS NOT NULL
           ) as ratings`,
          [],
          { cache: true, cacheTTL: 300000 } // 5 minutes
        );
        satisfactionPercent = satisfactionResult[0]?.satisfaction_percent || 0;
      } else {
        // If table doesn't exist, only use ticket_responses
        const satisfactionResult = await executeQuery<any[]>(
          `SELECT 
            ROUND(AVG(rating) * 20) as satisfaction_percent 
           FROM ticket_responses 
           WHERE rating IS NOT NULL`,
          [],
          { cache: true, cacheTTL: 300000 } // 5 minutes
        );
        satisfactionPercent = satisfactionResult[0]?.satisfaction_percent || 0;
      }
    } catch (error) {
      console.error("Error fetching satisfaction rate:", error);
      // Fallback to 0 if there's an error
      satisfactionPercent = 0;
    }

    // Get vehicle manufacturers count
    let totalManufacturers = 0;
    try {
      const manufacturersResult = await executeQuery<any[]>(
        "SELECT COUNT(*) as total FROM manufacturers",
        [],
        { cache: true, cacheTTL: 300000 } // 5 minutes
      );
      totalManufacturers = manufacturersResult[0]?.total || 0;
    } catch (error) {
      console.error("Error fetching manufacturers count:", error);
      // Continue with default value
    }

    // Get vehicle models count
    let totalModels = 0;
    try {
      const modelsResult = await executeQuery<any[]>(
        "SELECT COUNT(*) as total FROM models",
        [],
        { cache: true, cacheTTL: 300000 } // 5 minutes
      );
      totalModels = modelsResult[0]?.total || 0;
    } catch (error) {
      console.error("Error fetching models count:", error);
      // Continue with default value
    }

    // Get completed tuning files count
    let completedFiles = 0;
    try {
      const completedFilesResult = await executeQuery<any[]>(
        "SELECT COUNT(*) as total FROM ecu_files WHERE status = 'completed'",
        [],
        { cache: true, cacheTTL: 300000 } // 5 minutes
      );
      completedFiles = completedFilesResult[0]?.total || 0;
    } catch (error) {
      console.error("Error fetching completed files count:", error);
      // Continue with default value
    }

    // Get average processing time for completed files
    let avgProcessingTime = 0;
    try {
      const processingTimeResult = await executeQuery<any[]>(
        `SELECT 
          ROUND(AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at))) as avg_hours 
         FROM ecu_files 
         WHERE status = 'completed' AND updated_at IS NOT NULL`,
        [],
        { cache: true, cacheTTL: 300000 } // 5 minutes
      );
      avgProcessingTime = processingTimeResult[0]?.avg_hours || 0;
    } catch (error) {
      console.error("Error fetching processing time:", error);
      // Continue with default value
    }

    // Get top 3 manufacturers by file count
    let topManufacturers = [];
    try {
      const topManufacturersResult = await executeQuery<any[]>(
        `SELECT 
          m.name, 
          COUNT(ef.id) as file_count 
         FROM manufacturers m
         JOIN models md ON m.id = md.manufacturer_id
         JOIN ecu_files ef ON md.id = ef.model_id
         GROUP BY m.id, m.name
         ORDER BY file_count DESC
         LIMIT 3`,
        [],
        { cache: true, cacheTTL: 300000 } // 5 minutes
      );
      topManufacturers = topManufacturersResult || [];
    } catch (error) {
      console.error("Error fetching top manufacturers:", error);
      // Continue with default value
    }

    return NextResponse.json({
      users: totalUsers,
      files: totalFiles,
      satisfaction: satisfactionPercent,
      manufacturers: totalManufacturers,
      models: totalModels,
      completedFiles: completedFiles,
      avgProcessingTime: avgProcessingTime,
      topManufacturers: topManufacturers,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching landing stats:", error);
    // Return fallback data in case of error
    return NextResponse.json({
      users: 0,
      files: 0,
      satisfaction: 0,
      manufacturers: 0,
      models: 0,
      completedFiles: 0,
      avgProcessingTime: 0,
      topManufacturers: [],
      lastUpdated: new Date().toISOString()
    });
  }
} 