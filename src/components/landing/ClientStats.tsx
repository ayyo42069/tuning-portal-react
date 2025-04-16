"use client";

import { Stats } from "./Stats";
import { useInViewAnimation } from "@/hooks/useInViewAnimation";

export function ClientStats() {
  const { ref, inView } = useInViewAnimation({ threshold: 0.3 });

  return (
    <div ref={ref}>
      <Stats inView={inView} />
    </div>
  );
} 