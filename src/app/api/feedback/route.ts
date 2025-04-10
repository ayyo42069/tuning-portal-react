import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

interface FeedbackRecord {
  id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user_name: string;
}

// Helper function to get user ID from request
function getUserIdFromRequest(req: NextRequest): string | null {
  // In a real application, you would get the user ID from the session or token
  // For this example, we'll use a header or query parameter
  const userId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId");
  return userId;
}

// GET handler to fetch feedback for an ECU file
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ecuFileId = searchParams.get("ecuFileId");
    
    if (!ecuFileId) {
      return NextResponse.json(
        { success: false, message: "ECU file ID is required" },
        { status: 400 }
      );
    }
    
    // Fetch feedback for the ECU file
    const feedbackQuery = `
      SELECT 
        f.id, 
        f.user_id, 
        f.rating, 
        f.comment, 
        f.created_at,
        u.name as user_name
      FROM 
        ecu_file_feedback f
      LEFT JOIN 
        users u ON f.user_id = u.id
      WHERE 
        f.ecu_file_id = ?
      ORDER BY 
        f.created_at DESC
    `;
    
    const feedback = await executeQuery(feedbackQuery, [ecuFileId]) as FeedbackRecord[];
    
    return NextResponse.json({ 
      success: true, 
      feedback 
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

// POST handler to submit feedback for an ECU file
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid authentication token" },
        { status: 401 }
      );
    }
    
    const { ecuFileId, rating, comment } = await request.json();
    
    if (!ecuFileId || !rating) {
      return NextResponse.json(
        { success: false, message: "ECU file ID and rating are required" },
        { status: 400 }
      );
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }
    
    // Check if the user has already submitted feedback for this ECU file
    const existingFeedbackQuery = `
      SELECT id FROM ecu_file_feedback 
      WHERE ecu_file_id = ? AND user_id = ?
    `;
    
    const existingFeedback = await executeQuery(existingFeedbackQuery, [ecuFileId, user.id]) as { id: number }[];
    
    if (existingFeedback && existingFeedback.length > 0) {
      // Update existing feedback
      const updateQuery = `
        UPDATE ecu_file_feedback 
        SET rating = ?, comment = ?, updated_at = NOW() 
        WHERE ecu_file_id = ? AND user_id = ?
      `;
      
      await executeQuery(updateQuery, [rating, comment, ecuFileId, user.id]);
      
      return NextResponse.json({ 
        success: true, 
        message: "Feedback updated successfully" 
      });
    } else {
      // Insert new feedback
      const insertQuery = `
        INSERT INTO ecu_file_feedback (ecu_file_id, user_id, rating, comment, created_at, updated_at) 
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;
      
      await executeQuery(insertQuery, [ecuFileId, user.id, rating, comment]);
      
      return NextResponse.json({ 
        success: true, 
        message: "Feedback submitted successfully" 
      });
    }
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit feedback" },
      { status: 500 }
    );
  }
} 