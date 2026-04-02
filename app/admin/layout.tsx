"use client";

import { ReactNode, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/45 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <AdminSidebar isMobile={true} isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* Desktop sidebar + main */}
      <div className="hidden flex-col lg:flex lg:flex-row w-full">
        <AdminSidebar isMobile={false} />
        <div className="flex flex-1 flex-col">
          <AdminHeader onMenuClick={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex flex-1 flex-col lg:hidden w-full">
        <AdminHeader onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
