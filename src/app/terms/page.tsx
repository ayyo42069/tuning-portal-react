"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-sm shadow-xl rounded-lg overflow-hidden border border-white/20 hover:shadow-2xl transition-all duration-300 hover:border-white/30 hover:bg-white/15 dark:hover:bg-gray-900/30">
          <div className="px-6 py-8 sm:p-10 text-white">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-white mb-2">
                Terms of Service
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
                Welcome to Tuning Portal. These Terms of Service ("Terms")
                govern your access to and use of the Tuning Portal website,
                services, and applications (collectively, the "Service"). By
                accessing or using the Service, you agree to be bound by these
                Terms. If you do not agree to these Terms, you may not access or
                use the Service.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                2. Definitions
              </h2>
              <p>
                <strong>"User"</strong> refers to any individual who accesses or
                uses the Service, including registered account holders.
                <br />
                <strong>"Content"</strong> refers to any information, data,
                text, software, graphics, messages, or other materials that are
                uploaded, posted, or otherwise transmitted through the Service.
                <br />
                <strong>"Tuning Files"</strong> refers to the electronic files
                containing vehicle engine control unit (ECU) data that are
                uploaded, modified, or downloaded through the Service.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                3. Account Registration and Security
              </h2>
              <p>
                To access certain features of the Service, you must register for
                an account. When you register, you agree to provide accurate,
                current, and complete information about yourself. You are
                responsible for maintaining the confidentiality of your account
                credentials and for all activities that occur under your
                account. You agree to immediately notify Tuning Portal of any
                unauthorized use of your account or any other breach of
                security.
              </p>
              <p>
                Account registration requires email verification. You agree to
                provide a valid email address and to complete the verification
                process as instructed. Unverified accounts may have limited
                functionality.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                4. Service Description and Credits
              </h2>
              <p>
                Tuning Portal provides automotive tuning services, including but
                not limited to ECU file analysis, modification, and
                optimization. Access to certain services requires the use of
                credits, which can be purchased through the Service. Credits are
                non-refundable and non-transferable unless otherwise specified.
              </p>
              <p>
                The Service operates on a credit-based system. Users purchase
                credits that can be redeemed for specific tuning services. The
                cost in credits for each service is clearly displayed before
                purchase. Tuning Portal reserves the right to modify the credit
                cost of services at any time.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                5. User Obligations
              </h2>
              <p>
                You agree to use the Service only for lawful purposes and in
                accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>
                  Use the Service in any way that violates any applicable law or
                  regulation
                </li>
                <li>
                  Upload or transmit any Content that infringes any intellectual
                  property or other proprietary rights
                </li>
                <li>
                  Upload or transmit any Content that contains viruses, malware,
                  or other harmful code
                </li>
                <li>
                  Attempt to gain unauthorized access to any part of the Service
                </li>
                <li>
                  Interfere with or disrupt the Service or servers or networks
                  connected to the Service
                </li>
                <li>
                  Use the Service for any commercial purpose without prior
                  written consent from Tuning Portal
                </li>
                <li>
                  Create multiple accounts for abusive or fraudulent purposes
                </li>
              </ul>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                6. Tuning Files and Intellectual Property
              </h2>
              <p>
                By uploading Tuning Files to the Service, you represent and
                warrant that you have the legal right to do so. You retain
                ownership of your Tuning Files, but grant Tuning Portal a
                non-exclusive, worldwide, royalty-free license to use,
                reproduce, modify, and distribute your Tuning Files solely for
                the purpose of providing the Service to you.
              </p>
              <p>
                The Service and its original content, features, and
                functionality are owned by Tuning Portal and are protected by
                international copyright, trademark, patent, trade secret, and
                other intellectual property or proprietary rights laws.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                7. Disclaimer of Warranties
              </h2>
              <p>
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS,
                WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                TUNING PORTAL EXPRESSLY DISCLAIMS ALL WARRANTIES, WHETHER
                EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT
                LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
                FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p>
                TUNING PORTAL MAKES NO WARRANTY THAT THE SERVICE WILL MEET YOUR
                REQUIREMENTS, BE AVAILABLE ON AN UNINTERRUPTED, SECURE, OR
                ERROR-FREE BASIS, OR THAT DEFECTS WILL BE CORRECTED.
              </p>
              <p>
                TUNING PORTAL MAKES NO WARRANTY REGARDING THE QUALITY, ACCURACY,
                TIMELINESS, TRUTHFULNESS, COMPLETENESS, OR RELIABILITY OF ANY
                CONTENT OBTAINED THROUGH THE SERVICE.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                8. Limitation of Liability
              </h2>
              <p>
                IN NO EVENT SHALL TUNING PORTAL, ITS DIRECTORS, EMPLOYEES,
                PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA,
                USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR
                ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.
              </p>
              <p>
                TUNING PORTAL SPECIFICALLY DISCLAIMS ANY LIABILITY FOR ANY
                DAMAGES TO YOUR VEHICLE OR OTHER PROPERTY RESULTING FROM THE USE
                OF TUNING FILES OBTAINED THROUGH THE SERVICE. YOU ACKNOWLEDGE
                THAT VEHICLE MODIFICATIONS MAY VOID MANUFACTURER WARRANTIES AND
                COULD POTENTIALLY CAUSE DAMAGE TO YOUR VEHICLE IF IMPROPERLY
                APPLIED.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                9. Indemnification
              </h2>
              <p>
                You agree to defend, indemnify, and hold harmless Tuning Portal,
                its directors, employees, partners, agents, suppliers, and
                affiliates from and against any claims, liabilities, damages,
                judgments, awards, losses, costs, expenses, or fees (including
                reasonable attorneys' fees) arising out of or relating to your
                violation of these Terms or your use of the Service.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                10. Termination
              </h2>
              <p>
                Tuning Portal may terminate or suspend your account and access
                to the Service immediately, without prior notice or liability,
                for any reason, including without limitation if you breach these
                Terms. Upon termination, your right to use the Service will
                immediately cease.
              </p>
              <p>
                All provisions of the Terms which by their nature should survive
                termination shall survive termination, including, without
                limitation, ownership provisions, warranty disclaimers,
                indemnity, and limitations of liability.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                11. Governing Law
              </h2>
              <p>
                These Terms shall be governed and construed in accordance with
                the laws of the European Union and applicable local laws,
                without regard to its conflict of law provisions.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                12. Changes to Terms
              </h2>
              <p>
                Tuning Portal reserves the right, at its sole discretion, to
                modify or replace these Terms at any time. If a revision is
                material, Tuning Portal will provide at least 30 days' notice
                prior to any new terms taking effect. What constitutes a
                material change will be determined at Tuning Portal's sole
                discretion.
              </p>
              <p>
                By continuing to access or use the Service after those revisions
                become effective, you agree to be bound by the revised terms. If
                you do not agree to the new terms, you are no longer authorized
                to use the Service.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                13. Contact Us
              </h2>
              <p>
                If you have any questions about these Terms, please contact us
                at support@tuning-portal.eu.
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