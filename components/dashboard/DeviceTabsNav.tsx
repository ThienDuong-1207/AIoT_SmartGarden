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
  { label: "Overview",       icon: LayoutDashboard,    segment: "overview"     },
  { label: "Sensor Control", icon: SlidersHorizontal,  segment: "controls"     },
  { label: "AI Lab",         icon: ScanEye,            segment: "ai-lab"       },
  { label: "Plant Doctor",   icon: MessageSquareHeart, segment: "plant-doctor" },
  { label: "Settings",       icon: Settings2,          segment: "settings"     },
];

export default function DeviceTabsNav({ deviceId }: { deviceId: string }) {
  const pathname = usePathname();

  return (
    <div className="device-tabs-nav flex items-end overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      {TABS.map(({ label, icon: Icon, segment }) => {
        const href   = `/dashboard/${deviceId}/${segment}`;
        const active = pathname === href || pathname.startsWith(href + "/");

        return (
          <Link
            key={segment}
            href={href}
            className={`device-tab shrink-0${active ? " device-tab--active" : ""}`}
          >
            <Icon size={13} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
