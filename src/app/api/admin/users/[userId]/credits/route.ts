import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeTransaction } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// Handler for both PUT and POST requests
async function handleCreditsUpdate(
  request: NextRequest,
  params: Promise<{ userId: string }>
) {
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

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get the user ID from the URL
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.userId);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Get the credits amount from the request body
    const body = await request.json();
    const { amount, reason } = body;

    if (typeof amount !== "number" || isNaN(amount)) {
      return NextResponse.json(
        { error: "Invalid amount. Must be a number" },
        { status: 400 }
      );
    }

    // Start a transaction
    await executeTransaction("START TRANSACTION");

    try {
      // Update or insert user credits
      await executeQuery(
        `INSERT INTO user_credits (user_id, credits)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE credits = credits + ?`,
        [userId, amount, amount]
      );

      // Record the transaction
      await executeQuery(
        `INSERT INTO credit_transactions 
         (user_id, amount, transaction_type, stripe_payment_id)
         VALUES (?, ?, ?, ?)`,
        [
          userId,
          amount,
          amount > 0 ? "admin_add" : "admin_deduct",
          reason || null,
        ]
      );

      // Commit the transaction
      await executeTransaction("COMMIT");

      return NextResponse.json({
        success: true,
        message: `Credits ${amount > 0 ? "added" : "deducted"} successfully`,
      });
    } catch (error) {
      // Rollback on error
      await executeTransaction("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error updating user credits:", error);
    return NextResponse.json(
      { error: "An error occurred while updating user credits" },
      { status: 500 }
    );
  }
}

// Support both PUT and POST methods with the same implementation
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  return handleCreditsUpdate(request, context.params);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  return handleCreditsUpdate(request, context.params);
}
