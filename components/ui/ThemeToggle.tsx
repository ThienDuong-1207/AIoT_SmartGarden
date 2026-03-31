"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <button
      onClick={toggle}
      className="btn-icon"
      title={mounted ? (theme === "dark" ? "Chuyển sang Light mode" : "Chuyển sang Dark mode") : "Toggle theme"}
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      {mounted && (theme === "dark" ? (
        <Sun size={16} style={{ color: "var(--gold-400)" }} />
      ) : (
        <Moon size={16} style={{ color: "var(--cyan-500)" }} />
      ))}
    </button>
  );
}
