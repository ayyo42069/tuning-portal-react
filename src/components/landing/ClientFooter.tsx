"use client";

import { Footer } from "./Footer";
import { useInViewAnimation } from "@/hooks/useInViewAnimation";

export function ClientFooter() {
  const { ref, inView } = useInViewAnimation({ threshold: 0.1 });

  return (
    <div ref={ref}>
      <Footer inView={inView} />
    </div>
  );
} 