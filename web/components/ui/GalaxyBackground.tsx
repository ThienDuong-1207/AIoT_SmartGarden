"use client";

import { useId } from "react";

export default function GalaxyBackground() {
  const filterId = useId().replace(/:/g, "");

  return (
    <div
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none"
      style={{ backgroundColor: "#000000" }}
      aria-hidden="true"
    >
      {/* Nền Gradient mờ ảo tập trung giữa màn hình */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, rgba(4,8,18,1) 0%, rgba(1,2,5,1) 100%)",
        }}
      />

      {/* Lớp các vì sao (Cyan/Blue stars mờ) */}
      <div 
        className="absolute inset-0 mix-blend-screen opacity-40"
        style={{
          backgroundImage: "radial-gradient(rgba(34, 211, 238, 0.45) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          backgroundPosition: "0 0, 24px 24px",
          transform: "translateZ(0) scale(1.5)",
          animation: "galaxy-drift 120s linear infinite"
        }}
      />

      {/* Lớp Mạng Lưới (Plexus/Data Nodes) tĩnh - Có thể dùng làm background texture */}
      <div className="absolute inset-0 opacity-[0.15]">
        <svg
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <defs>
            <radialGradient id={`globalNodeGlow-${filterId}`} cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(34,211,238,0.98)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.06)" />
            </radialGradient>
          </defs>
          <g stroke="rgba(34,211,238,0.22)" strokeWidth="0.8">
            <line x1="10%" y1="20%" x2="30%" y2="15%" />
            <line x1="30%" y1="15%" x2="50%" y2="25%" />
            <line x1="50%" y1="25%" x2="70%" y2="10%" />
            <line x1="70%" y1="10%" x2="90%" y2="20%" />
            <line x1="20%" y1="50%" x2="40%" y2="40%" />
            <line x1="40%" y1="40%" x2="60%" y2="50%" />
            <line x1="60%" y1="50%" x2="80%" y2="40%" />
            <line x1="80%" y1="40%" x2="95%" y2="60%" />
            <line x1="30%" y1="15%" x2="40%" y2="40%" />
            <line x1="50%" y1="25%" x2="60%" y2="50%" />
            <line x1="70%" y1="10%" x2="80%" y2="40%" />
            <line x1="20%" y1="50%" x2="10%" y2="20%" />
          </g>
          <g fill={`url(#globalNodeGlow-${filterId})`}>
            {/* Các Node phát sáng nhỏ */}
            <circle cx="10%" cy="20%" r="3" />
            <circle cx="30%" cy="15%" r="4" />
            <circle cx="50%" cy="25%" r="3" />
            <circle cx="70%" cy="10%" r="4" />
            <circle cx="90%" cy="20%" r="3" />
            <circle cx="20%" cy="50%" r="4" />
            <circle cx="40%" cy="40%" r="3" />
            <circle cx="60%" cy="50%" r="4" />
            <circle cx="80%" cy="40%" r="3" />
            <circle cx="95%" cy="60%" r="3" />
          </g>
        </svg>
      </div>

      <style>{`
        @keyframes galaxy-drift {
          0% { background-position: 0 0; }
          100% { background-position: -400px 400px; }
        }
      `}</style>
    </div>
  );
}
