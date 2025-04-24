"use client";

import { usePathname } from "next/navigation";
import DynamicIsland from "./DynamicIsland";

export default function DynamicIslandWrapper() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');
  const isLandingPage = pathname === '/' || pathname === '/about' || pathname === '/privacy' || pathname === '/terms';

  if (isDashboard) {
    return <DynamicIsland variant="dashboard" />;
  }

  if (isLandingPage) {
    return <DynamicIsland variant="landing" />;
  }

  return null;
} 