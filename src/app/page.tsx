"use client";

import { CookieConsent } from "@/components/CookieConsent";
import { ClientHero } from "@/components/landing/ClientHero";
import { ClientStats } from "@/components/landing/ClientStats";
import { ClientFeatures } from "@/components/landing/ClientFeatures";
import { ClientFooter } from "@/components/landing/ClientFooter";
import DynamicIsland from "@/components/DynamicIsland";

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Dynamic Island */}
      <DynamicIsland variant="landing" />

      {/* Main Content */}
      <ClientHero />
      <ClientStats />
      <ClientFeatures />
      <ClientFooter />

      {/* Cookie Consent */}
      <CookieConsent />
    </div>
  );
}

export default function Home() {
  return <LandingPage />;
}
