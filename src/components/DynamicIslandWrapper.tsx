"use client";

import { usePathname } from "next/navigation";
import DynamicIsland from "./DynamicIsland";

export default function DynamicIslandWrapper() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');

  if (isDashboard) {
    return null;
  }

  return <DynamicIsland variant="landing" />;
} 