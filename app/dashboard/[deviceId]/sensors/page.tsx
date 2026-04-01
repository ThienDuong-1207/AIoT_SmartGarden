"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SensorsLegacyRedirectPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (deviceId) {
      router.replace(`/dashboard/${deviceId}/controls`);
    }
  }, [deviceId, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin" style={{ color: "var(--emerald-400)" }} />
    </div>
  );
}
