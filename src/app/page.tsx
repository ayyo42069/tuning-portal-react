import { CookieConsent } from "@/components/CookieConsent";
import { ClientHero } from "@/components/landing/ClientHero";
import { ClientStats } from "@/components/landing/ClientStats";
import { ClientFeatures } from "@/components/landing/ClientFeatures";
import { ClientFooter } from "@/components/landing/ClientFooter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <ClientHero />
      
      <ClientStats />
      
      <ClientFeatures />
      
      <ClientFooter />

      <CookieConsent />
    </div>
  );
}
