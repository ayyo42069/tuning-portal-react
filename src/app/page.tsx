import { CookieConsent } from "@/components/CookieConsent";
import { ClientHero } from "@/components/landing/ClientHero";
import { ClientStats } from "@/components/landing/ClientStats";
import { ClientFeatures } from "@/components/landing/ClientFeatures";
import { ClientFooter } from "@/components/landing/ClientFooter";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Header variant="landing" />
      
      <ClientHero />
      
      <ClientStats />
      
      <ClientFeatures />
      
      <ClientFooter />

      <CookieConsent />
    </div>
  );
}
