"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 dark:from-blue-950 dark:to-blue-900 py-12 relative overflow-hidden">
      {/* SVG Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/patterns/hexagons.svg')",
            backgroundSize: "30px",
            filter: "blur(0.5px)",
          }}
        ></div>
      </div>

      {/* Circuit board pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/patterns/circuit-board.svg')",
            backgroundSize: "300px",
          }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8 flex items-center">
          <Link
            href="/"
            className="flex items-center text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm shadow-xl rounded-lg overflow-hidden border border-white/20 hover:shadow-2xl transition-all duration-300 hover:border-white/30 hover:bg-white/25 dark:hover:bg-gray-900/30">
          <div className="px-6 py-8 sm:p-10 text-gray-800 dark:text-white">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Cookie Policy
              </h1>
              <p className="text-gray-600 dark:text-white/70">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="prose max-w-none text-gray-700 dark:prose-invert dark:text-white/90">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">
                1. Introduction
              </h2>
              <p>
                This Cookie Policy explains how Tuning Portal ("we", "us", and
                "our") uses cookies and similar technologies to recognize you
                when you visit our website. It explains what these technologies
                are and why we use them, as well as your rights to control our
                use of them.
              </p>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">
                2. What Are Cookies?
              </h2>
              <p>
                Cookies are small data files that are placed on your computer or
                mobile device when you visit a website. Cookies are widely used
                by website owners in order to make their websites work, or to
                work more efficiently, as well as to provide reporting
                information.
              </p>
              <p>
                Cookies set by the website owner (in this case, Tuning Portal)
                are called "first-party cookies". Cookies set by parties other
                than the website owner are called "third-party cookies".
                Third-party cookies enable third-party features or functionality
                to be provided on or through the website (e.g., advertising,
                interactive content, and analytics). The parties that set these
                third-party cookies can recognize your computer both when it
                visits the website in question and also when it visits certain
                other websites.
              </p>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">
                3. Why Do We Use Cookies?
              </h2>
              <p>
                We use first-party and third-party cookies for several reasons.
                Some cookies are required for technical reasons in order for our
                website to operate, and we refer to these as "essential" or
                "strictly necessary" cookies. Other cookies also enable us to
                track and target the interests of our users to enhance the
                experience on our website. Third parties serve cookies through
                our website for advertising, analytics, and other purposes.
              </p>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">
                4. Types of Cookies We Use
              </h2>
              <p>
                The specific types of first and third-party cookies served
                through our website and the purposes they perform include:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>
                  <strong>Essential website cookies:</strong> These cookies are
                  strictly necessary to provide you with services available
                  through our website and to use some of its features, such as
                  access to secure areas.
                </li>
                <li>
                  <strong>Performance and functionality cookies:</strong> These
                  cookies are used to enhance the performance and functionality
                  of our website but are non-essential to their use. However,
                  without these cookies, certain functionality may become
                  unavailable.
                </li>
                <li>
                  <strong>Analytics and customization cookies:</strong> These
                  cookies collect information that is used either in aggregate
                  form to help us understand how our website is being used or
                  how effective our marketing campaigns are, or to help us
                  customize our website for you.
                </li>
                <li>
                  <strong>Advertising cookies:</strong> These cookies are used
                  to make advertising messages more relevant to you. They
                  perform functions like preventing the same ad from
                  continuously reappearing, ensuring that ads are properly
                  displayed for advertisers, and in some cases selecting
                  advertisements that are based on your interests.
                </li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">
                5. How Can You Control Cookies?
              </h2>
              <p>
                You have the right to decide whether to accept or reject
                cookies. You can exercise your cookie preferences by clicking on
                the appropriate opt-out links provided in the cookie banner on
                our website.
              </p>
              <p>
                You can also set or amend your web browser controls to accept or
                refuse cookies. If you choose to reject cookies, you may still
                use our website though your access to some functionality and
                areas of our website may be restricted. As the means by which
                you can refuse cookies through your web browser controls vary
                from browser-to-browser, you should visit your browser's help
                menu for more information.
              </p>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">
                6. How Often Will We Update This Cookie Policy?
              </h2>
              <p>
                We may update this Cookie Policy from time to time in order to
                reflect, for example, changes to the cookies we use or for other
                operational, legal, or regulatory reasons. Please therefore
                re-visit this Cookie Policy regularly to stay informed about our
                use of cookies and related technologies.
              </p>
              <p>
                The date at the top of this Cookie Policy indicates when it was
                last updated.
              </p>

              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">
                7. Where Can You Get Further Information?
              </h2>
              <p>
                If you have any questions about our use of cookies or other
                technologies, please email us at support@tuningportal.com or use
                our contact form on the website.
              </p>
            </div>

            {/* Back to Top Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Back to Top
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
