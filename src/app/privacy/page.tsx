"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8 flex items-center">
          <Link
            href="/"
            className="flex items-center text-white hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-sm shadow-xl rounded-lg overflow-hidden border border-white/20 hover:shadow-2xl transition-all duration-300 hover:border-white/30 hover:bg-white/15 dark:hover:bg-gray-900/30">
          <div className="px-6 py-8 sm:p-10 text-white">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-white mb-2">
                Privacy Policy
              </h1>
              <p className="text-white/70">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="prose prose-invert max-w-none text-white/90">
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                1. Introduction
              </h2>
              <p>
                At Tuning Portal, we take your privacy seriously. This Privacy
                Policy explains how we collect, use, disclose, and safeguard
                your information when you visit our website or use our services.
                Please read this privacy policy carefully. If you do not agree
                with the terms of this privacy policy, please do not access the
                site.
              </p>
              <p>
                We reserve the right to make changes to this Privacy Policy at
                any time and for any reason. We will alert you about any changes
                by updating the "Last Updated" date of this Privacy Policy. You
                are encouraged to periodically review this Privacy Policy to
                stay informed of updates.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                2. Collection of Your Information
              </h2>
              <p>
                We may collect information about you in a variety of ways. The
                information we may collect via the Service includes:
              </p>

              <h3 className="text-lg font-semibold text-white/90 mt-6 mb-3">
                2.1 Personal Data
              </h3>
              <p>
                Personally identifiable information, such as your name, email
                address, and username, that you voluntarily give to us when you
                register with the Service or when you choose to participate in
                various activities related to the Service. You are under no
                obligation to provide us with personal information of any kind,
                however your refusal to do so may prevent you from using certain
                features of the Service.
              </p>

              <h3 className="text-lg font-semibold text-white/90 mt-6 mb-3">
                2.2 Derivative Data
              </h3>
              <p>
                Information our servers automatically collect when you access
                the Service, such as your IP address, browser type, operating
                system, access times, and the pages you have viewed directly
                before and after accessing the Service. This information is
                primarily needed to maintain the security and operation of our
                Service, and for our internal analytics and reporting purposes.
              </p>

              <h3 className="text-lg font-semibold text-white/90 mt-6 mb-3">
                2.3 Financial Data
              </h3>
              <p>
                Financial information, such as data related to your payment
                method (e.g., valid credit card number, card brand, expiration
                date) that we may collect when you purchase credits or services
                from the Service. We store only very limited, if any, financial
                information that we collect. Otherwise, all financial
                information is stored by our payment processor, Stripe, and you
                are encouraged to review their privacy policy and contact them
                directly for responses to your questions.
              </p>

              <h3 className="text-lg font-semibold text-white/90 mt-6 mb-3">
                2.4 Vehicle and Tuning Data
              </h3>
              <p>
                Information about your vehicle and ECU files that you upload to
                the Service for tuning purposes. This includes vehicle make,
                model, year, and technical specifications, as well as the ECU
                files themselves.
              </p>

              <h3 className="text-lg font-semibold text-white/90 mt-6 mb-3">
                2.5 Device Information
              </h3>
              <p>
                Device information such as your mobile device ID, model, and
                manufacturer, and information about the location of your device,
                if you access the Service from a mobile device.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                3. Use of Your Information
              </h2>
              <p>
                Having accurate information about you permits us to provide you
                with a smooth, efficient, and customized experience.
                Specifically, we may use information collected about you via the
                Service to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Create and manage your account</li>
                <li>
                  Process transactions and send you related information,
                  including confirmations and invoices
                </li>
                <li>
                  Send you technical notices, updates, security alerts, and
                  support and administrative messages
                </li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Provide, maintain, and improve the Service</li>
                <li>
                  Monitor and analyze usage and trends to improve your
                  experience with the Service
                </li>
                <li>Notify you of updates to the Service</li>
                <li>
                  Offer new products, services, and/or recommendations to you
                </li>
                <li>Perform other business activities as needed</li>
                <li>
                  Prevent fraudulent transactions, monitor against theft, and
                  protect against criminal activity
                </li>
              </ul>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                4. Disclosure of Your Information
              </h2>
              <p>
                We may share information we have collected about you in certain
                situations. Your information may be disclosed as follows:
              </p>

              <h3 className="text-lg font-semibold text-white/90 mt-6 mb-3">
                4.1 By Law or to Protect Rights
              </h3>
              <p>
                If we believe the release of information about you is necessary
                to respond to legal process, to investigate or remedy potential
                violations of our policies, or to protect the rights, property,
                and safety of others, we may share your information as permitted
                or required by any applicable law, rule, or regulation.
              </p>

              <h3 className="text-lg font-semibold text-white/90 mt-6 mb-3">
                4.2 Third-Party Service Providers
              </h3>
              <p>
                We may share your information with third parties that perform
                services for us or on our behalf, including payment processing,
                data analysis, email delivery, hosting services, customer
                service, and marketing assistance.
              </p>

              <h3 className="text-lg font-semibold text-white/90 mt-6 mb-3">
                4.3 Business Transfers
              </h3>
              <p>
                If we or our subsidiaries are involved in a merger, acquisition,
                or asset sale, your information may be transferred as part of
                that transaction. We will notify you before your information is
                transferred and becomes subject to a different Privacy Policy.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                5. Email Communications
              </h2>
              <p>
                If you choose to provide us with your email address, we may send
                you emails about our Service, updates, and promotional content.
                We may also use your email address to send you important
                information about your account, such as verification emails,
                password reset instructions, and notifications about changes to
                our terms, conditions, and policies.
              </p>
              <p>
                You can opt out of receiving promotional emails from us at any
                time by following the opt-out instructions provided in the
                emails you receive. Please note that even if you opt out of
                receiving promotional emails, we may still send you
                transactional emails that are essential to your use of the
                Service, such as account verification, purchase confirmations,
                and service announcements.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                6. Cookies and Web Beacons
              </h2>
              <p>
                We may use cookies, web beacons, tracking pixels, and other
                tracking technologies on the Service to help customize the
                Service and improve your experience. When you access the
                Service, your personal information is not collected through the
                use of tracking technology. Most browsers are set to accept
                cookies by default. You can remove or reject cookies, but be
                aware that such action could affect the availability and
                functionality of the Service.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                7. Security of Your Information
              </h2>
              <p>
                We use administrative, technical, and physical security measures
                to help protect your personal information. While we have taken
                reasonable steps to secure the personal information you provide
                to us, please be aware that despite our efforts, no security
                measures are perfect or impenetrable, and no method of data
                transmission can be guaranteed against any interception or other
                type of misuse.
              </p>
              <p>
                We implement a variety of security measures to maintain the
                safety of your personal information when you place an order or
                enter, submit, or access your personal information. These
                include:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>
                  Secure Socket Layer (SSL) technology for all data transmission
                </li>
                <li>Regular security assessments and penetration testing</li>
                <li>Encryption of sensitive personal information</li>
                <li>Strict internal data access controls</li>
                <li>Regular security updates and patches</li>
              </ul>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                8. Data Retention
              </h2>
              <p>
                We will only keep your personal information for as long as it is
                necessary for the purposes set out in this Privacy Policy,
                unless a longer retention period is required or permitted by
                law. No purpose in this policy will require us keeping your
                personal information for longer than the period of time in which
                users have an account with us.
              </p>
              <p>
                When we have no ongoing legitimate business need to process your
                personal information, we will either delete or anonymize it, or,
                if this is not possible (for example, because your personal
                information has been stored in backup archives), then we will
                securely store your personal information and isolate it from any
                further processing until deletion is possible.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                9. Your Rights Regarding Your Information
              </h2>
              <p>
                Depending on your location, you may have certain rights
                regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>
                  <strong>Right to Access</strong> - You have the right to
                  request copies of your personal information.
                </li>
                <li>
                  <strong>Right to Rectification</strong> - You have the right
                  to request that we correct any information you believe is
                  inaccurate or complete information you believe is incomplete.
                </li>
                <li>
                  <strong>Right to Erasure</strong> - You have the right to
                  request that we erase your personal information, under certain
                  conditions.
                </li>
                <li>
                  <strong>Right to Restrict Processing</strong> - You have the
                  right to request that we restrict the processing of your
                  personal information, under certain conditions.
                </li>
                <li>
                  <strong>Right to Object to Processing</strong> - You have the
                  right to object to our processing of your personal
                  information, under certain conditions.
                </li>
                <li>
                  <strong>Right to Data Portability</strong> - You have the
                  right to request that we transfer the data that we have
                  collected to another organization, or directly to you, under
                  certain conditions.
                </li>
              </ul>
              <p>
                If you make a request, we have one month to respond to you. If
                you would like to exercise any of these rights, please contact
                us at privacy@tuning-portal.eu.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                10. Children's Privacy
              </h2>
              <p>
                The Service is not directed to anyone under the age of 18. We do
                not knowingly collect or solicit personal information from
                anyone under the age of 18. If you are under 18, please do not
                attempt to register for the Service or send any personal
                information about yourself to us. If we learn that we have
                collected personal information from a child under age 18, we
                will delete that information as quickly as possible. If you
                believe that a child under 18 may have provided us personal
                information, please contact us at privacy@tuning-portal.eu.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                11. Contact Us
              </h2>
              <p>
                If you have questions or comments about this Privacy Policy,
                please contact us at:
              </p>
              <p className="mt-2">
                Tuning Portal
                <br />
                Email: privacy@tuning-portal.eu
                <br />
                Website: https://tuning-portal.eu
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>
            © {new Date().getFullYear()} Tuning Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
