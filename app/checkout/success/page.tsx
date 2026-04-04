import { Suspense } from "react";
import CheckoutSuccessClient from "./CheckoutSuccessClient";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-16" style={{ background: "var(--bg-base)", paddingTop: "88px" }}>
          <div className="w-full max-w-lg rounded-3xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", minHeight: 420 }} />
        </main>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  );
}
