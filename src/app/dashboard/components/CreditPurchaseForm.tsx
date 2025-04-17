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
const stripePromise = process.env.STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.STRIPE_PUBLISHABLE_KEY)
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
    <div className="relative bg-white/80 dark:bg-gray-800/80 p-4 sm:p-6 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-filter backdrop-blur-md overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 dark:from-blue-500/20 dark:to-indigo-600/20 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            backgroundImage: "url('/patterns/hexagons.svg')",
            backgroundSize: "300px",
          }}
        ></div>
      </div>

      <h3 className="text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white flex items-center">
        <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg mr-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-600 dark:text-blue-400"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
        </div>
        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
          Credit Balance
        </span>
      </h3>
      <div className="mb-5 sm:mb-6 p-4 sm:p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200/50 dark:border-blue-700/50 shadow-md">
        <p className="text-base sm:text-lg font-medium text-blue-700 dark:text-blue-300">
          Current Balance:{" "}
          <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {creditBalance} credits
          </span>
        </p>
      </div>

      <h3 className="text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white flex items-center">
        <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg mr-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-indigo-600 dark:text-indigo-400"
          >
            <path d="M5 11a7 7 0 0 1 14 0" />
            <path d="M5 19a7 7 0 0 0 14 0" />
            <circle cx="12" cy="11" r="3" />
            <circle cx="12" cy="19" r="3" />
          </svg>
        </div>
        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
          Purchase Credits
        </span>
      </h3>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-md shadow-md backdrop-blur-sm relative z-10">
          <p className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-red-500"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-500/10 border-l-4 border-green-500 text-green-700 dark:text-green-300 rounded-md shadow-md backdrop-blur-sm relative z-10">
          <p className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-green-500"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {success}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
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
              className="w-full rounded-lg border border-gray-300/70 dark:border-gray-600/70 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:bg-gray-800/90 dark:text-white py-3 px-4 transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500 dark:text-gray-400">
              <span className="text-sm font-medium">credits</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent font-medium">
              Card Details
            </span>
          </label>
          <div className="p-4 border border-gray-300/70 dark:border-gray-600/70 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm relative z-10 shadow-sm hover:shadow-md transition-all duration-300 focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-400/50 dark:focus-within:ring-blue-500/50">
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
          <div className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-50/80 dark:bg-gray-900/80 p-3 sm:p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
            <div className="flex items-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-500 mr-2"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
              <p className="font-medium text-amber-700 dark:text-amber-400">
                Test Mode - Use Test Cards Only
              </p>
            </div>
            <p>
              This payment form is in test mode. Please use one of these test
              card numbers:
            </p>
            <ul className="list-disc pl-4 sm:pl-5 mt-2 space-y-1.5">
              <li className="flex items-center">
                <span className="font-mono text-xs sm:text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded mr-2 border border-gray-200 dark:border-gray-700">
                  4242 4242 4242 4242
                </span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Successful payment
                </span>
              </li>
              <li className="flex items-center">
                <span className="font-mono text-xs sm:text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded mr-2 border border-gray-200 dark:border-gray-700">
                  4000 0000 0000 0002
                </span>
                <span className="text-red-600 dark:text-red-400 font-medium">
                  Declined (generic)
                </span>
              </li>
              <li className="flex items-center">
                <span className="font-mono text-xs sm:text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded mr-2 border border-gray-200 dark:border-gray-700">
                  4000 0000 0000 9995
                </span>
                <span className="text-red-600 dark:text-red-400 font-medium">
                  Declined (insufficient funds)
                </span>
              </li>
            </ul>
            <p className="mt-2 bg-blue-50 dark:bg-blue-900/30 p-2 rounded border-l-2 border-blue-400 dark:border-blue-600">
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

        <div className="pt-3">
          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full flex justify-center items-center py-3 sm:py-4 px-6 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl relative overflow-hidden group"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400/20 to-indigo-400/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            {loading ? (
              <span className="flex items-center relative z-10">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
              <span className="flex items-center relative z-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 18V6" />
                </svg>
                Purchase Credits ($${amount}.00)
              </span>
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
