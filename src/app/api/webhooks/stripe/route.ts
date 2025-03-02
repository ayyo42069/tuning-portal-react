import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import Stripe from "stripe";

// Initialize Stripe with the secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "Missing required STRIPE_SECRET_KEY environment variable. Please check your environment configuration."
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

// Webhook secret for verifying webhook events
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook secret is not configured" },
        { status: 500 }
      );
    }

    // Get the signature from the headers
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Get the raw body
    const body = await request.text();

    // Verify the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`
        );

        // Process the successful payment
        // This is handled in the purchase API, but we could add additional logic here
        // such as sending confirmation emails or updating order status
        break;

      case "charge.succeeded":
        const charge = event.data.object as Stripe.Charge;
        console.log(`Charge for ${charge.amount} was successful!`);
        break;

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(
          `Payment failed: ${failedPaymentIntent.last_payment_error?.message}`
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "An error occurred processing the webhook" },
      { status: 500 }
    );
  }
}
