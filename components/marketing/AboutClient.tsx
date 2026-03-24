"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Leaf, Eye, Heart, Cpu, ScanEye, Droplets, LayoutDashboard, ChevronDown } from "lucide-react";
import SiteFooter from "@/components/marketing/SiteFooter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ────────────────────────────────────────────────────────────────────────────
   MOCK DATA
──────────────────────────────────────────────────────────────────────────── */
const PILLARS = [
  { icon: Leaf, iconColor: "var(--emerald-400)", iconBg: "rgba(16,185,129,0.10)", title: "Sứ mệnh", desc: "Giúp bất kì ai có thể trồng rau sạch, nuôi trồng thủy canh tại nhà một cách dễ dàng và tự động hóa." },
  { icon: Eye, iconColor: "var(--blue-400)", iconBg: "rgba(59,130,246,0.10)", title: "Tầm nhìn", desc: "Trở thành nền tảng hàng đầu trong kỹ thuật canh tác thông minh tại Đông Nam Á." },
  { icon: Heart, iconColor: "var(--gold-400)", iconBg: "rgba(245,158,11,0.10)", title: "Giá trị", desc: "Chất lượng, độ tin cậy, tính sáng tạo và sự quan tâm đến cộng đồng nông dân." },
];

const TECH_STACK = [
  { icon: Cpu, color: "var(--blue-400)", label: "Cảm biến IoT", desc: "Đo TDS, pH, nhiệt độ, độ ẩm theo thời gian thực" },
  { icon: ScanEye, color: "var(--emerald-400)", label: "AI Diagnosis", desc: "Phân tích ảnh lá cây để phát hiện bệnh và gợi ý xử lý" },
  { icon: Droplets, color: "var(--blue-400)", label: "Thủy canh", desc: "Hệ thống NFT, DWC tối ưu cho leafy greens" },
  { icon: LayoutDashboard, color: "var(--gold-400)", label: "Dashboard Web", desc: "Giám sát thông số và điều khiển từ xa" },
];

const JOURNEY = [
  { year: "2024 / KHỞI NGUỒN", title: "Văn Lang Uni Lab", desc: "Nghiên cứu nguyên lý thủy canh kết hợp IoT cơ bản tại phòng Lab VLU, tối ưu năng suất không gian hẹp." },
  { year: "2025 / BỨT PHÁ", title: "Hackathon AIoT", desc: "Đưa mô hình AI nhận diện bệnh lá vào luồng Camera ESP32-CAM, thiết lập Dashboard UI Cinematic." },
  { year: "2026 / HOÀN THIỆN", title: "Smart Garden AIoT", desc: "Thương mại hóa hệ sinh thái với MQTT realtime, cảnh báo Firebase và châm dinh dưỡng tự động." },
];

const TEAM = [
  { id: "01", name: "Hồ Du Tuấn Đạt", role: "AI & System Lead", image: "/window.svg" },
  { id: "02", name: "Nguyễn Minh Chính", role: "Software Engineer / Backend", image: "/window.svg" },
  { id: "03", name: "Dương Ngọc Linh Đan", role: "Software Engineer / BA", image: "/window.svg" },
  { id: "04", name: "Dương Chí Thiện", role: "Hardware Engineer / IoT", image: "/window.svg" },
];

/* ────────────────────────────────────────────────────────────────────────────
   COMPONENTS
──────────────────────────────────────────────────────────────────────────── */

function SystemLoadTracker() {
  const [hex, setHex] = useState("0x00A0");
  useEffect(() => {
    const int = setInterval(() => {
      setHex(`0x${Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0')}`);
    }, 1500);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="fixed top-24 right-4 pointer-events-none z-50 mix-blend-screen opacity-40">
      <p className="font-mono text-[8px] text-[var(--cyan-400)] tracking-widest text-right">
        [ SYS_LOAD: {hex} ]<br/>
        [ NODE: ABOUT_US ]
      </p>
    </div>
  );
}

function HudCorners() {
  const c = "absolute w-2 h-2 border-[1.5px] border-[rgba(34,211,238,0.5)] pointer-events-none z-20";
  return (
    <>
      <div className={`${c} top-[-1px] left-[-1px] border-r-0 border-b-0`} />
      <div className={`${c} top-[-1px] right-[-1px] border-l-0 border-b-0`} />
      <div className={`${c} bottom-[-1px] left-[-1px] border-r-0 border-t-0`} />
      <div className={`${c} bottom-[-1px] right-[-1px] border-l-0 border-t-0`} />
    </>
  );
}

// SVG Background Radar Chart purely decorative for team cards
function RadarSkillChart() {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none -z-10">
      <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="rgba(34,211,238,0.05)" stroke="cyan" strokeWidth="0.5" />
      <polygon points="50,25 75,40 75,60 50,75 25,60 25,40" fill="none" stroke="rgba(34,211,238,0.5)" strokeWidth="0.5" />
      <line x1="50" y1="50" x2="50" y2="10" stroke="rgba(34,211,238,0.3)" strokeWidth="0.5" />
      <line x1="50" y1="50" x2="90" y2="30" stroke="rgba(34,211,238,0.3)" strokeWidth="0.5" />
      <line x1="50" y1="50" x2="10" y2="70" stroke="rgba(34,211,238,0.3)" strokeWidth="0.5" />
    </svg>
  );
}

function TeamCard({ member }: { member: any }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -15; // Max 15 degree tilt
    const rotateY = ((x - centerX) / centerX) * 15;

    gsap.to(cardRef.current, {
      rotateX,
      rotateY,
      duration: 0.5,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 1,
      ease: "power3.out"
    });
  };

  return (
    <div className="group relative perspective-1000">
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="wireframe-card group-hover:animate-cyan-pulse relative flex flex-col items-center justify-center p-6 h-[260px] rounded-2xl overflow-hidden cursor-pointer"
        style={{
          background: "transparent",
          border: "1px dashed rgba(34, 211, 238, 0.3)",
          transformStyle: "preserve-3d",
          transformOrigin: "center center"
        }}
      >
        <HudCorners />
        <RadarSkillChart />

        {/* Hidden Barcode / Info */}
        <div 
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="flex gap-0.5 h-6">
            {[2,1,3,1,2,1,1,2,4,1].map((w, j) => (
              <div key={j} className="h-full bg-[var(--cyan-500)]" style={{ width: `${w}px` }} />
            ))}
          </div>
          <p className="font-mono text-[8px] text-[var(--cyan-400)] mt-1">{member.id}·UX</p>
        </div>

        {/* Avatar Hologram lift */}
        <div 
          className="w-24 h-24 rounded-full overflow-hidden border border-[rgba(34,211,238,0.2)] bg-[rgba(0,0,0,0.4)] mb-5 transition-all duration-500 ease-out flex items-center justify-center group-hover:shadow-[0_0_25px_rgba(34,211,238,0.8)]"
          style={{ transform: "translateZ(0px)" }}
        >
          <Image src={member.image} alt={member.name} width={96} height={96} className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Info block */}
        <div className="text-center w-full transition-transform duration-500" style={{ transform: "translateZ(0px)" }}>
          <h3 className="text-base font-bold text-white uppercase tracking-wider">{member.name}</h3>
          <p className="text-[10px] font-mono mt-1.5 px-2 py-0.5 rounded text-[var(--cyan-400)] bg-[rgba(34,211,238,0.08)] inline-block border border-[rgba(34,211,238,0.15)]">
            {member.role}
          </p>
        </div>

        {/* Scanline on hover */}
        <div className="absolute top-0 inset-x-0 h-px bg-[var(--cyan-400)] opacity-0 group-hover:opacity-100 group-hover:animate-scan transition-opacity pointer-events-none" style={{ boxShadow: "0 0 10px 2px var(--cyan-400)" }} />
      </div>
    </div>
  );
}

export default function AboutClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGLineElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Initial Page Fade-in
    gsap.to(containerRef.current, { opacity: 1, duration: 1.2, ease: "power2.out" });

    // 2. Wireframe-to-Glass Sequential Entry via Stagger/Batch
    ScrollTrigger.batch(".wireframe-card", {
      start: "top 80%",
      onEnter: (elements) => {
        gsap.fromTo(elements,
          { background: "transparent", backdropFilter: "blur(0px)", borderColor: "rgba(34, 211, 238, 0.3)" },
          { 
            background: "rgba(255, 255, 255, 0.03)", 
            backdropFilter: "blur(20px)", 
            borderColor: "rgba(34, 211, 238, 0.15)", 
            boxShadow: "0 0 20px rgba(34, 211, 238, 0.05)",
            borderStyle: "solid",
            duration: 0.8, 
            stagger: 0.15, 
            ease: "power2.out" 
          }
        );
      }
    });

    // 3. The Journey Timeline (Scrub-to-Draw using scaleY)
    if (pathRef.current) {
      gsap.fromTo(pathRef.current, 
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: timelineContainerRef.current,
            start: "top center",
            end: "bottom center",
            scrub: 1
          }
        }
      );
    }

    // 4. Timeline Event blur reveals
    gsap.utils.toArray(".timeline-event").forEach((el: any) => {
      gsap.fromTo(el,
        { filter: "blur(8px)", opacity: 0.2, scale: 0.95 },
        { 
          filter: "blur(0px)", 
          opacity: 1, 
          scale: 1,
          scrollTrigger: { trigger: el, start: "top 70%", end: "top 40%", scrub: true } 
        }
      );
    });

    // 5. Team Card Hologram Lift styling fix (CSS selectors can be tricky via class injections, handle directly in React/CSS)
    const teamCards = gsap.utils.toArray(".perspective-1000");
    teamCards.forEach((card: any) => {
      const avatar = card.querySelector(".rounded-full.overflow-hidden");
      const info = card.querySelector(".text-center.w-full");
      
      card.addEventListener("mouseenter", () => {
        gsap.to(avatar, { z: 60, duration: 0.5, ease: "back.out(1.7)" });
        gsap.to(info, { z: 20, duration: 0.5, ease: "power2.out" });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(avatar, { z: 0, duration: 0.5, ease: "power2.out" });
        gsap.to(info, { z: 0, duration: 0.5, ease: "power2.out" });
      });
    });

  }, { scope: containerRef });

  return (
    <main
      ref={containerRef}
      className="flex flex-col opacity-0 relative bg-transparent overflow-hidden"
      style={{ minHeight: "100dvh" }}
    >
      <SystemLoadTracker />

      {/* ── Custom CSS for complex effects ── */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        @keyframes scan {
          0% { transform: translateY(-10px); }
          100% { transform: translateY(260px); }
        }
        .group-hover\\:animate-scan { animation: scan 2s linear infinite; }
        @keyframes cyan-pulse {
          0% { box-shadow: 0 0 10px rgba(34,211,238,0.2) inset, 0 0 10px rgba(34,211,238,0.2); border-color: rgba(34,211,238,0.4); }
          50% { box-shadow: 0 0 20px rgba(34,211,238,0.6) inset, 0 0 30px rgba(34,211,238,0.5); border-color: rgba(34,211,238,0.8); }
          100% { box-shadow: 0 0 10px rgba(34,211,238,0.2) inset, 0 0 10px rgba(34,211,238,0.2); border-color: rgba(34,211,238,0.4); }
        }
        .group-hover\\:animate-cyan-pulse { animation: cyan-pulse 2s infinite ease-in-out !important; }
      `}</style>

      {/* ── Ambient Light Orbs ── */}
      <div className="pointer-events-none fixed inset-0 z-[-1]">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] animate-soft-float" style={{ background: "rgba(34,211,238,0.03)" }} />
        <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] animate-soft-float" style={{ background: "rgba(16,185,129,0.02)", animationDelay: "-3s" }} />
      </div>

      {/* ── Hero section ── */}
      <section className="relative pt-32 pb-16 border-b border-[rgba(34,211,238,0.1)]">
        <div className="container-app relative z-10 flex flex-col items-center text-center">
          <span
            className="font-mono text-[10px] font-bold mb-4 px-3 py-1.5 rounded-full border border-[rgba(34,211,238,0.2)]"
            style={{ color: "var(--cyan-400)", background: "rgba(34,211,238,0.05)", backdropFilter: "blur(8px)" }}
          >
            [ SYSTEM_INFO: ABOUT_US ]
          </span>
          <h1 className="mt-4 text-4xl font-black md:text-5xl lg:text-6xl text-white uppercase tracking-tight">
            Về Smart Garden <span className="text-gradient-cyan">AIoT</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: "var(--text-secondary)" }}>
            Hệ sinh thái kết hợp hình thái nông nghiệp thủy canh cổ điển với công nghệ IoT và Thị giác máy tính (AI Vision), mang đến một không gian xanh tự động hóa cho kỹ sư và người yêu cây.
          </p>
          
          <div className="mt-12 flex items-center justify-center animate-bounce opacity-50">
            <ChevronDown size={24} style={{ color: "var(--cyan-400)" }} />
          </div>
        </div>
      </section>

      {/* ── Grid: Core & Tech Stack ── */}
      <section className="container-app py-16 z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left: Tầm nhìn sứ mệnh */}
          <div className="flex flex-col gap-5">
            <div className="mb-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--emerald-500)]">
                // PLATFORM_CORE
              </span>
              <h2 className="text-2xl font-bold mt-1 text-white">Nền tảng cốt lõi</h2>
            </div>
            
            <div className="flex flex-col gap-4">
              {PILLARS.map(({ icon: Icon, iconColor, iconBg, title, desc }) => (
                <div
                  key={title}
                  className="wireframe-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 relative transition-all rounded-2xl"
                  style={{ background: "transparent", border: "1px dashed rgba(34, 211, 238, 0.3)" }}
                >
                  <HudCorners />
                  <div
                    className="flex shrink-0 h-14 w-14 items-center justify-center rounded-xl"
                    style={{ background: iconBg, color: iconColor, border: `1px solid ${iconColor}40` }}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Tech Stack */}
          <div className="flex flex-col gap-5">
            <div className="mb-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--cyan-500)]">
                // SYSTEM_ARCHITECTURE
              </span>
              <h2 className="text-2xl font-bold mt-1 text-white">Công nghệ tích hợp</h2>
            </div>

            <div
              className="wireframe-card flex flex-col h-full relative overflow-hidden rounded-2xl p-6 lg:p-8"
              style={{ background: "transparent", border: "1px dashed rgba(34, 211, 238, 0.3)" }}
            >
              <HudCorners />
              <div className="mb-6 flex items-center justify-between pb-4 border-b border-[rgba(34,211,238,0.15)]">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500 opacity-80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 opacity-80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 opacity-80" />
                  <span className="ml-3 font-mono text-[11px] text-[var(--text-muted)]">tech-stack.sh</span>
                </div>
                <span className="font-mono text-[9px] text-[var(--cyan-400)] border border-[var(--cyan-500)] px-2 py-0.5 rounded uppercase pulse-fast">Executing</span>
              </div>

              <div className="flex-1 grid gap-4 grid-cols-1 sm:grid-cols-2">
                {TECH_STACK.map(({ icon: Icon, color, label, desc }, i) => (
                  <div
                    key={label}
                    className="flex flex-col gap-2 rounded-xl p-4 transition-all"
                    style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} style={{ color }} />
                      <p className="font-mono text-xs font-bold text-white uppercase">{label}</p>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">{desc}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-[rgba(34,211,238,0.1)]">
                <p className="font-mono text-[10px] text-[var(--cyan-500)] flex items-center gap-2">
                  <span className="animate-pulse font-bold">_</span> Cấu trúc vi dịch vụ đảm bảo độ trễ {"<"} 100ms
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Journey Timeline ── */}
      <section className="container-app py-16 z-10 flex flex-col items-center relative">
        <div className="mb-14 text-center">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--gold-400)]">
            // PROJECT_TIMELINE
          </span>
          <h2 className="text-3xl font-bold mt-2 text-white">Tiến trình phát triển</h2>
        </div>

        <div ref={timelineContainerRef} className="w-full max-w-3xl flex flex-col gap-32 relative py-10">
          
          {/* Vertical SVG Path for Scrub-to-Draw */}
          <svg className="absolute top-0 bottom-0 left-[23px] sm:left-1/2 sm:-ml-[2px] w-[4px] h-full z-[-1]" preserveAspectRatio="none">
            {/* Background thin dashed line */}
            <line x1="2" y1="0" x2="2" y2="100%" stroke="rgba(34,211,238,0.1)" strokeWidth="1" strokeDasharray="4 4" />
            {/* Foreground Solid Path animated via GSAP scaleY */}
            <line
              ref={pathRef as React.RefObject<SVGLineElement>}
              x1="2" y1="0" x2="2" y2="100%"
              stroke="var(--cyan-400)"
              strokeWidth="2"
              style={{ transformOrigin: "top", filter: "drop-shadow(0 0 6px cyan)" }}
            />
          </svg>

          {JOURNEY.map((item, idx) => (
            <div key={idx} className={`timeline-event relative flex flex-col sm:flex-row items-start sm:items-center gap-6 ${idx % 2 === 0 ? "sm:flex-row-reverse" : ""}`}>
              {/* Center Dot */}
              <div className="absolute left-[19px] sm:left-1/2 sm:-translate-x-1/2 w-4 h-4 rounded-full bg-[var(--bg-base)] border-[2px] border-[var(--cyan-400)] shadow-[0_0_12px_var(--cyan-500)] flex items-center justify-center z-10">
                 <div className="w-1.5 h-1.5 bg-[var(--cyan-300)] rounded-full animate-pulse" />
              </div>
              
              <div className="w-12 sm:w-1/2" /> {/* Spacer */}
              
              <div className={`w-full sm:w-1/2 pl-14 sm:pl-0 ${idx % 2 === 0 ? "sm:pr-10 sm:text-right" : "sm:pl-10"}`}>
                <div 
                  className="wireframe-card p-6 rounded-2xl relative"
                  style={{ background: "transparent", border: "1px dashed rgba(34, 211, 238, 0.3)" }}
                >
                  <HudCorners />
                  <span className="font-mono text-[11px] font-bold text-[var(--cyan-400)] tracking-widest">{item.year}</span>
                  <h3 className="text-xl font-bold text-white mt-2 uppercase tracking-wide">{item.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Core Team members ── */}
      <section className="container-app py-16 z-10 pb-24 border-t border-[rgba(34,211,238,0.1)]">
        <div className="mb-14 text-center">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--blue-400)]">
            // GROUP_01_ARCHITECTS
          </span>
          <h2 className="text-3xl font-bold mt-2 text-white">The Architects</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
