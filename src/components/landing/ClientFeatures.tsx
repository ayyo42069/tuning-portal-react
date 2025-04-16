"use client";

import { Features } from "./Features";
import { useInViewAnimation } from "@/hooks/useInViewAnimation";

export function ClientFeatures() {
  const { ref, inView } = useInViewAnimation({ threshold: 0.2 });

  return (
    <div ref={ref}>
      <Features inView={inView} />
    </div>
  );
} 