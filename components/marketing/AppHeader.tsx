"use client";

import { Suspense } from "react";
import AppHeaderClient from "./AppHeaderClient";

function AppHeaderSkeleton() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 md:px-6">
      <div
        className="mx-auto w-full max-w-7xl rounded-2xl"
        style={{
          background: "rgba(9,9,11,0.30)",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center justify-between px-4 md:px-6" style={{ height: "60px" }}>
          {/* Logo skeleton */}
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg skeleton" />
            <div className="h-4 w-28 rounded skeleton" />
          </div>
          {/* Nav skeleton */}
          <div className="hidden items-center gap-2 md:flex">
            {[80, 72, 88, 72].map((w, i) => (
              <div key={i} className="h-8 rounded-lg skeleton" style={{ width: w }} />
            ))}
          </div>
          {/* Right skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl skeleton" />
            <div className="h-9 w-24 rounded-xl skeleton" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AppHeader() {
  return (
    <Suspense fallback={<AppHeaderSkeleton />}>
      <AppHeaderClient />
    </Suspense>
  );
}
