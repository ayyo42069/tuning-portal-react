"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface CreditBalance {
  credits: number;
}

// Initialize Stripe with the publishable key from environment variables
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

if (!stripePromise) {
  console.error(
    "Stripe publishable key is missing. Check your environment variables."
  );
}

function CreditPurchaseForm() {
  const [amount, setAmount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const router = useRouter();

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    // Fetch user's credit balance
    const fetchCreditBalance = async () => {
      try {
        const response = await fetch("/api/credits/balance");
        if (response.ok) {
          const data: CreditBalance = await response.json();
          setCreditBalance(data.credits);
        }
      } catch (error) {
        console.error("Error fetching credit balance:", error);
      }
    };

    fetchCreditBalance();
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    // Get card element
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not found");
      setLoading(false);
      return;
    }

    // Create payment method
    const { error: stripeError, paymentMethod } =
      await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

    if (stripeError) {
      setError(stripeError.message || "An error occurred with your payment");
      setLoading(false);
      return;
    }

    // Process payment with backend
    try {
      const response = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          paymentMethodId: paymentMethod.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully purchased ${amount} credits!`);
        cardElement.clear();
        // Refresh the page to update credit display
        router.refresh();
      } else {
        setError(data.error || "Failed to process payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError("An error occurred during payment processing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 backdrop-filter backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <h3 className="text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white flex items-center">
        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
          Credit Balance
        </span>
      </h3>
      <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-md border border-blue-100 dark:border-blue-800 shadow-sm">
        <p className="text-base sm:text-lg font-medium text-blue-700 dark:text-blue-300">
          Current Balance:{" "}
          <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {creditBalance} credits
          </span>
        </p>
      </div>

      <h3 className="text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white">
        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
          Purchase Credits
        </span>
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md shadow-sm backdrop-blur-sm">
          <p className="flex items-center">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded-md shadow-sm backdrop-blur-sm">
          <p className="flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            {success}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
          >
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent font-medium">
              Amount of Credits
            </span>
          </label>
          <div className="relative">
            <input
              id="amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white py-2 px-3 transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
              <span className="text-sm">credits</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Card Details
          </label>
          <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 relative z-10 shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-400 dark:focus-within:ring-blue-500">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    fontSmoothing: "antialiased",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                    iconColor: "#666EE8",
                  },
                  invalid: {
                    color: "#9e2146",
                    iconColor: "#FFC7EE",
                  },
                },
                hidePostalCode: true,
              }}
              className="stripe-card-element"
            />
          </div>
          <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 sm:p-3 rounded-md">
            <p className="font-medium mb-1">
              ⚠️ Test Mode - Use Test Cards Only
            </p>
            <p>
              This payment form is in test mode. Please use one of these test
              card numbers:
            </p>
            <ul className="list-disc pl-4 sm:pl-5 mt-1 space-y-1">
              <li>
                <span className="font-mono text-xs sm:text-sm">
                  4242 4242 4242 4242
                </span>{" "}
                - Successful payment
              </li>
              <li>
                <span className="font-mono text-xs sm:text-sm">
                  4000 0000 0000 0002
                </span>{" "}
                - Declined (generic)
              </li>
              <li>
                <span className="font-mono text-xs sm:text-sm">
                  4000 0000 0000 9995
                </span>{" "}
                - Declined (insufficient funds)
              </li>
            </ul>
            <p className="mt-1">
              Use any future expiration date, any 3-digit CVC, and any postal
              code.
            </p>
          </div>
          <style jsx global>{`
            .stripe-card-element {
              width: 100%;
              padding: 8px 0;
            }
            .StripeElement {
              width: 100%;
              padding: 8px 0;
            }
            .StripeElement--focus {
              box-shadow: 0 1px 3px 0 #cfd7df;
            }
            .StripeElement--invalid {
              border-color: #fa755a;
            }
            .StripeElement--webkit-autofill {
              background-color: #fefde5 !important;
            }
            /* Fix for dark mode */
            .dark .StripeElement {
              color: white;
            }
            .dark .StripeElement--focus {
              box-shadow: 0 1px 3px 0 rgba(255, 255, 255, 0.3);
            }
          `}</style>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:translate-y-[-1px] hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Purchase Credits ($${amount}.00)`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Wrap the form with Stripe Elements
export default function CreditPurchaseWrapper() {
  return (
    <Elements stripe={stripePromise}>
      <CreditPurchaseForm />
    </Elements>
  );
}
