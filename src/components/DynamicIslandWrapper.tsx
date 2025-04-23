"use client";

import { usePathname } from "next/navigation";
import { useState } from 'react';
import EcuUploadForm from './EcuUploadForm';

export default function DynamicIslandWrapper() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');
  const [isEcuUploadOpen, setIsEcuUploadOpen] = useState(false);

  if (isDashboard) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/10 backdrop-blur-md rounded-b-2xl p-4 shadow-xl border border-white/20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEcuUploadOpen(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Upload ECU
            </button>
          </div>
        </div>
      </div>

      {isEcuUploadOpen && (
        <EcuUploadForm onClose={() => setIsEcuUploadOpen(false)} />
      )}
    </>
  );
} 