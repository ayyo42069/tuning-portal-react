import { NextRequest, NextResponse } from "next/server";
import { executeQuery, pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Stripe from "stripe";
import { RowDataPacket } from "mysql2";

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("Missing STRIPE_SECRET_KEY environment variable");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

interface PurchaseRequest {
  amount: number;
  paymentMethodId: string;
}

export async function POST(request: NextRequest) {
  let connection;
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

    const body: PurchaseRequest = await request.json();
    const { amount, paymentMethodId } = body;

    if (!amount || amount <= 0 || !paymentMethodId) {
      return NextResponse.json(
        { error: "Invalid purchase request" },
        { status: 400 }
      );
    }

    // Calculate price (e.g., 1 credit = $1)
    const priceInCents = amount * 100;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceInCents,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      metadata: {
        user_id: user.id.toString(),
        credit_amount: amount.toString(),
      },
    });

    if (paymentIntent.status === "succeeded") {
      // Get a connection from the pool
      connection = await pool.getConnection();

      try {
        // Start transaction using direct query
        await connection.query("START TRANSACTION");

        // Record the transaction first
        await connection.query(
          "INSERT INTO credit_transactions (user_id, amount, transaction_type, stripe_payment_id, created_at) VALUES (?, ?, 'purchase', ?, CURRENT_TIMESTAMP)",
          [user.id, amount, paymentIntent.id]
        );

        // Update user's credit balance
        // First check if the user already has a credit entry
        const [existingCredit] = await connection.query(
          "SELECT id FROM user_credits WHERE user_id = ?",
          [user.id]
        );

        let updateResult;
        if (existingCredit) {
          // Update existing credit record
          updateResult = await connection.query(
            "UPDATE user_credits SET credits = credits + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
            [amount, user.id]
          );
          console.log(`Updated existing credits for user ${user.id}:`, updateResult);
        } else {
          // Create new credit record
          updateResult = await connection.query(
            "INSERT INTO user_credits (user_id, credits, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
            [user.id, amount]
          );
          console.log(`Created new credits record for user ${user.id}:`, updateResult);
        }

        // Verify the update was successful
        const [verifyUpdate] = await connection.query<RowDataPacket[]>(
          "SELECT credits FROM user_credits WHERE user_id = ?",
          [user.id]
        );
        
        if (!verifyUpdate?.[0]?.credits) {
          throw new Error("Failed to verify credit update");
        }
        console.log(`Verified updated credits:`, verifyUpdate[0].credits);

        // Get updated credit balance for confirmation
        const [updatedCredits] = await connection.query<RowDataPacket[]>(
          "SELECT credits FROM user_credits WHERE user_id = ?",
          [user.id]
        );

        // Commit transaction
        await connection.query("COMMIT");
        console.log(`Transaction committed successfully for user ${user.id}`);

        return NextResponse.json({
          success: true,
          credits: amount,
          totalCredits: updatedCredits?.[0]?.credits || amount,
          message: "Credits purchased successfully",
        });
      } catch (error) {
        // Rollback on error
        if (connection) {
          await connection.query("ROLLBACK");
        }
        throw error;
      } finally {
        // Always release the connection back to the pool
        if (connection) {
          connection.release();
        }
      }
    } else {
      return NextResponse.json(
        {
          error: "Payment failed",
          status: paymentIntent.status,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      { error: "An error occurred during credit purchase" },
      { status: 500 }
    );
  }
}
