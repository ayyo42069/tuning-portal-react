"use client";

import { Hero } from "./Hero";
import { useInViewAnimation } from "@/hooks/useInViewAnimation";

export function ClientHero() {
  const { ref, inView } = useInViewAnimation({ threshold: 0.1 });

  return (
    <div ref={ref}>
      <Hero inView={inView} />
    </div>
  );
} 