"use client";

import { useInView } from "react-intersection-observer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Features } from "@/components/landing/Features";
import { CookieConsent } from "@/components/CookieConsent";

export default function Home() {
  const [heroRef, heroInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [statsRef, statsInView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const [featuresRef, featuresInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

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

      <CookieConsent />
    </div>
  );
}
