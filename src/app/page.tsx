"use client";

import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { useInViewAnimation } from "@/hooks/useInViewAnimation";

export default function Home() {
  const { ref: heroRef, inView: heroInView } = useInViewAnimation({ threshold: 0.1 });
  const { ref: statsRef, inView: statsInView } = useInViewAnimation({ threshold: 0.3 });
  const { ref: featuresRef, inView: featuresInView } = useInViewAnimation({ threshold: 0.2 });
  const { ref: footerRef, inView: footerInView } = useInViewAnimation({ threshold: 0.1 });

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Header />

      <div ref={heroRef}>
        <Hero inView={heroInView} />
      </div>

      <div ref={statsRef}>
        <Stats inView={statsInView} />
      </div>

      <div ref={featuresRef}>
        <Features inView={featuresInView} />
      </div>

      <div ref={footerRef}>
        <Footer inView={footerInView} />
      </div>

      <CookieConsent />
    </div>
  );
}
