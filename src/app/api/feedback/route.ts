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

interface FeedbackEvent {
  type: "success" | "error" | "info" | "warning";
  message: string;
  userId?: number;
  action?: string;
  metadata?: Record<string, any>;
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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "10");

    let query = "SELECT * FROM feedback_events WHERE 1=1";
    const params: any[] = [];

    if (userId) {
      query += " AND user_id = ?";
      params.push(userId);
    }

    if (type) {
      query += " AND type = ?";
      params.push(type);
    }

    query += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);

    const events = await executeQuery(query, params);

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching feedback events:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback events" },
      { status: 500 }
    );
  }
}

// POST handler to submit feedback for an ECU file
export async function POST(request: NextRequest) {
  try {
    const body: FeedbackEvent = await request.json();
    const { type, message, userId, action, metadata } = body;

    // Log the feedback event to the database
    await executeQuery(
      `INSERT INTO feedback_events (type, message, user_id, action, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [type, message, userId || null, action || null, JSON.stringify(metadata || {})]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging feedback:", error);
    return NextResponse.json(
      { error: "Failed to log feedback event" },
      { status: 500 }
    );
  }
} 