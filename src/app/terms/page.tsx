import Link from "next/link";
import { termsOfService } from "@/utils/termsUtils";

export const metadata = {
  title: "Terms of Service | Tuning Portal",
  description: "Tuning Portal terms of service and legal information",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Terms of Service
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Last updated: {termsOfService.lastUpdated}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 md:p-8">
            <div className="prose dark:prose-invert max-w-none">
              {termsOfService.sections.map((section, index) => (
                <div key={index} className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {section.title}
                  </h2>
                  {section.paragraphs.map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      className="text-gray-700 dark:text-gray-300 mb-4"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                If you have any questions about these Terms, please{" "}
                <Link
                  href="/contact"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  contact us
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
