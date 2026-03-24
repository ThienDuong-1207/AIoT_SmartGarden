"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  SlidersHorizontal,
  ScanEye,
  MessageSquareHeart,
  Settings2,
} from "lucide-react";

const TABS = [
  { label: "Overview",      icon: LayoutDashboard,    segment: "overview"      },
  { label: "Sensor Control",icon: SlidersHorizontal,  segment: "sensors"       },
  { label: "AI Lab",        icon: ScanEye,            segment: "ai-lab"        },
  { label: "Plant Doctor",  icon: MessageSquareHeart, segment: "plant-doctor"  },
  { label: "Settings",      icon: Settings2,          segment: "settings"      },
];

export default function DeviceTabsNav({ deviceId }: { deviceId: string }) {
  const pathname = usePathname();

  return (
    <div
      className="flex items-center gap-0.5 overflow-x-auto"
      style={{ scrollbarWidth: "none" }}
    >
      {TABS.map(({ label, icon: Icon, segment }) => {
        const href   = `/dashboard/${deviceId}/${segment}`;
        const active = pathname === href || pathname.startsWith(href + "/");

        return (
          <Link
            key={segment}
            href={href}
            className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-150"
            style={
              active
                ? {
                    background: "rgba(16,185,129,0.12)",
                    color: "var(--emerald-400)",
                    border: "1px solid rgba(16,185,129,0.22)",
                  }
                : {
                    background: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid transparent",
                  }
            }
          >
            <Icon size={13} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
