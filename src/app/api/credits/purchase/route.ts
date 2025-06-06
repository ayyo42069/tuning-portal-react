import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeTransaction } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Stripe from "stripe";

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
      // Start transaction
      await executeTransaction("START TRANSACTION");

      try {
        // Check if this payment has already been processed
        const [existingTransaction] = await executeQuery<any>(
          "SELECT id FROM credit_transactions WHERE stripe_payment_id = ?",
          [paymentIntent.id]
        );

        if (existingTransaction) {
          console.log(
            `Payment ${paymentIntent.id} already processed, returning success`
          );
          await executeTransaction("COMMIT");
          return NextResponse.json({
            success: true,
            credits: amount,
            message: "Credits already added to your account",
          });
        }

        console.log(
          `Processing payment ${paymentIntent.id} for user ${user.id}, adding ${amount} credits`
        );

        // Add credits to user's account
        await executeQuery(
          "INSERT INTO credit_transactions (user_id, amount, transaction_type, stripe_payment_id) VALUES (?, ?, ?, ?)",
          [user.id, amount, "purchase", paymentIntent.id]
        );

        // Update user's credit balance
        // First check if the user already has a credit entry
        const [existingCredit] = await executeQuery<any>(
          "SELECT id FROM user_credits WHERE user_id = ?",
          [user.id]
        );

        let updateResult;
        if (existingCredit) {
          // Update existing credit record
          updateResult = await executeQuery(
            "UPDATE user_credits SET credits = credits + ? WHERE user_id = ?",
            [amount, user.id]
          );
        } else {
          // Create new credit record
          updateResult = await executeQuery(
            "INSERT INTO user_credits (user_id, credits) VALUES (?, ?)",
            [user.id, amount]
          );
        }

        console.log(`Credit update result:`, updateResult);

        // Get updated credit balance for confirmation
        const [updatedCredits] = await executeQuery<any>(
          "SELECT credits FROM user_credits WHERE user_id = ?",
          [user.id]
        );

        // Commit transaction
        await executeTransaction("COMMIT");

        return NextResponse.json({
          success: true,
          credits: amount,
          totalCredits: updatedCredits?.credits || amount,
          message: "Credits purchased successfully",
        });
      } catch (error) {
        // Rollback on error
        await executeTransaction("ROLLBACK");
        throw error;
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
