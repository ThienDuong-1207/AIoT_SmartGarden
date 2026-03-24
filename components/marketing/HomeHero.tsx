"use client";

import { useEffect, useRef, useId } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type HomeHeroProps = {
  isLoaded?: boolean;
  shouldPlayVideo?: boolean;
};

export default function HomeHero({ isLoaded = false, shouldPlayVideo = true }: HomeHeroProps) {
  const filterId = useId().replace(/:/g, "");
  const heroRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const plexusRef = useRef<HTMLDivElement | null>(null);
  const plexusGlowRef = useRef<HTMLDivElement | null>(null);
  const titleWrapRef = useRef<HTMLHeadingElement | null>(null);
  const sloganRef = useRef<HTMLParagraphElement | null>(null);
  const ecoRef = useRef<SVGTextElement | null>(null);
  const techRef = useRef<SVGTextElement | null>(null);
  const svgTitleRef = useRef<SVGSVGElement | null>(null);
  const finalTitleRef = useRef<HTMLHeadingElement | null>(null);
  const introIncludedVideoFadeRef = useRef(false);
  const shouldPlayVideoRef = useRef(shouldPlayVideo);
  shouldPlayVideoRef.current = shouldPlayVideo;

  useGSAP(
    () => {
      const hero = heroRef.current;
      if (!hero) return;

      /** isLoaded false: ép Hero đen tuyền (ẩn), không chạy intro */
      if (!isLoaded) {
        gsap.set(hero, { visibility: "hidden", opacity: 0 });
        return;
      }

      const video = videoRef.current;
      const plexus = plexusRef.current;
      const plexusGlow = plexusGlowRef.current;
      const titleWrap = titleWrapRef.current;
      const slogan = sloganRef.current;
      const eco = ecoRef.current;
      const tech = techRef.current;
      const svgTitle = svgTitleRef.current;
      const finalTitle = finalTitleRef.current;

      if (
        !video ||
        !plexus ||
        !plexusGlow ||
        !titleWrap ||
        !slogan ||
        !eco ||
        !tech ||
        !svgTitle ||
        !finalTitle
      ) {
        return;
      }

      // Khoá toàn bộ trình duyệt tránh cuộn khi đang chạy Intro
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.height = "100%";
      document.body.style.overflow = "hidden";
      document.body.style.height = "100%";

      /** Hero hiện ngay (nền đen); title ẩn cho đến 0.5s */
      gsap.set(hero, { visibility: "visible", opacity: 1 });

      gsap.set(video, {
        opacity: 0,
        visibility: "hidden",
        autoAlpha: 0,
        scale: 1.06,
        filter: "blur(8px)",
        transformOrigin: "center center",
      });
      
      gsap.set(slogan, { opacity: 0, visibility: "hidden", y: 20 });
      gsap.set(titleWrap, { opacity: 0, visibility: "hidden" });
      gsap.set(plexus, { opacity: 0, scale: 1, transformOrigin: "center center" });
      gsap.set(plexusGlow, { opacity: 0 });

      // Cài đặt cho tiêu đề "Trí tuệ nhân tạo..." ẩn hoàn toàn và mờ
      gsap.set(finalTitle, { autoAlpha: 0, filter: "blur(10px)", scale: 0.8 });

      /** Layer 2 (TECH): Setup stroke - initially hidden but stroke prepared */
      gsap.set(tech, {
        visibility: "visible",
        strokeDasharray: 2000,
        strokeDashoffset: 2000,
      });

      /** Layer 1 (ECO): initially 0 opacity, translated slightly UP */
      gsap.set(eco, {
        opacity: 0,
        y: -10,
      });

      // ---------------------------------------------------------
      // 1. TIMELINE INTRO (GIỚI THIỆU & VẼ CHỮ ECO-TECH)
      // ---------------------------------------------------------

      let scrollTl: gsap.core.Timeline;

      const unlockScroll = () => {
        document.documentElement.style.overflow = "auto";
        document.documentElement.style.height = "auto";
        document.body.style.overflow = "auto";
        document.body.style.height = "auto";
        
        // 2. Tháo xích cho ScrollTrigger Portal
        if (scrollTl && scrollTl.scrollTrigger) {
          scrollTl.scrollTrigger.enable();
        }
        
        // 3. Ép GSAP tính toán lại toàn bộ tọa độ
        ScrollTrigger.refresh();
      };

      const introTl = gsap.timeline({ 
        paused: true,
        onComplete: unlockScroll
      });

      /** 0.5s: màn đen đã hiện; hiện vùng title để vẽ */
      introTl.set(titleWrap, { autoAlpha: 1 }, 0.5);

      /** Phase 1: 0.6s - bắt đầu vẽ viền TECH (2.5s) */
      introTl.to(
        tech,
        { strokeDashoffset: 0, duration: 2.5, ease: "power2.inOut" },
        0.6
      );

      /** Phase 2: Ngay khi vẽ xong viền (0.6 + 2.5 = 3.1s) - Converge ECO */
      introTl.to(
        eco,
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", force3D: true, z: 0.01 },
        3.1
      );

      /** Phase 3: Slogan hiện lên sau khi ECO rõ nét (bắt đầu sau 3.9s) */
      introTl.to(
        slogan,
        { autoAlpha: 1, y: 0, duration: 0.65, ease: "power2.out" },
        3.9
      );

      /** 4.5s: Video Background mờ dần hiện ra; scroll mở sau khi video đã hiện */
      const playVideo = shouldPlayVideoRef.current;

      if (playVideo) {
        introIncludedVideoFadeRef.current = true;
        introTl.to(
          video,
          { autoAlpha: 0.4, filter: "blur(2px)", scale: 1.02, duration: 1.15, ease: "sine.out" },
          4.5
        );
      }
      
      introTl.to(
        plexus,
        { opacity: 0.22, scale: 1.2, duration: 1.05, ease: "sine.out" },
        4.5
      );
      introTl.to(
        plexusGlow,
        { opacity: 0.45, duration: 0.9, ease: "sine.out" },
        4.62
      );

      introTl.play();

      // ---------------------------------------------------------
      // 2. TIMELINE PORTAL (CÚ ZOOM KHI CUỘN)
      // ---------------------------------------------------------

      // Thay đổi Render Context & Hardware Offload triệt để
      gsap.set(eco, { transformOrigin: "50% 50%", transformPerspective: 1000 });

      // Cấu hình phát hiện thiết bị yếu để Fallback
      let isLowEndDevice = false;
      if (typeof window !== "undefined") {
        const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const hwConcurrency = navigator.hardwareConcurrency || 4;
        const isLowRam = (navigator as any).deviceMemory ? (navigator as any).deviceMemory <= 4 : false;
        // Bật fallback nếu ít hơn 4 lõi, hoặc RAM dưới bằng 4GB, hoặc prefers-reduced-motion
        isLowEndDevice = isReducedMotion || (hwConcurrency < 4) || isLowRam;
        console.log("[GPU Check] Render Policy:", isLowEndDevice ? "Fallback (Fade)" : "GPU Aggressive Zoom");
        console.log("[GPU Check] ECO Layer has Will-Change & Raster Filters attached.");
        
        // Đồng bộ Ticker với 60 FPS requestAnimationFrame
        gsap.ticker.fps(60); 
      }

      scrollTl = gsap.timeline({
        paused: true,
        scrollTrigger: {
          trigger: "#main-canvas",
          pin: true,
          start: "top top",
          end: "+=1000%",
          scrub: 0.5 // Tăng độ phản hồi scrub (chuyển từ 2 / 1.5 xuống 0.5)
        }
      });
      
      // 1. Vô hiệu hóa lúc khởi tạo (Disable on Init)
      if (scrollTl.scrollTrigger) {
        scrollTl.scrollTrigger.disable();
      }

      // ==== INTRO: Zoom sequence ====
      // Intervention 2: Tạm dừng hoàn toàn việc decode Video khi bắt đầu lao vào Zoom (0.1s)
      scrollTl.to({ v: 0 }, { 
        duration: 0.01, 
        onStart: () => {
          if (videoRef.current) {
            videoRef.current.pause();
            console.log("[GPU Check] Video Engine Paused.");
          }
        },
        onReverseComplete: () => { 
          if (shouldPlayVideoRef.current && videoRef.current) {
            videoRef.current.play().catch(()=>{});
            console.log("[GPU Check] Video Engine Resumed.");
          }
        }
      }, 0.1);

      scrollTl.to([tech, slogan], { autoAlpha: 0, duration: 0.2, ease: "power2.inOut", immediateRender: false }, 0);

      // Intervention 4: Phân nhánh kịch bản Zoom Fallback vs Aggressive Zoom
      if (isLowEndDevice) {
        scrollTl.to(eco, { scale: 3, autoAlpha: 0, duration: 0.5, ease: "power2.inOut", force3D: true, z: 0.01, immediateRender: false }, 0.2);
      } else {
        scrollTl.to(eco, { scale: 150, duration: 0.5, ease: "power2.inOut", force3D: true, z: 0.01, immediateRender: false }, 0.2);
        scrollTl.to(eco, { autoAlpha: 0, duration: 0.1, ease: "power2.inOut", force3D: true, z: 0.01, immediateRender: false }, 0.6);
      }

      // Hide Video by opacity & filter to fully halt browser composite computations on it
      scrollTl.to(video, { autoAlpha: 0, filter: "blur(20px)", duration: 0.2, ease: "power2.inOut", immediateRender: false }, 0.4);
      scrollTl.to([plexus, plexusGlow], { autoAlpha: 0, duration: 0.2, ease: "power2.inOut", immediateRender: false }, 0.6);
      scrollTl.to(finalTitle, { autoAlpha: 1, filter: "blur(0px)", scale: 1, duration: 0.3, ease: "power2.out", immediateRender: false }, 0.7);

      // Hold Title slightly
      scrollTl.to({}, { duration: 0.2 }, "+=0"); 

      // ==== PHASE 0: Hero Exit ====
      scrollTl.to(finalTitle, { opacity: 0, scale: 0.9, duration: 0.3, immediateRender: false }, "+=0");
      scrollTl.to(hero, { 
        autoAlpha: 0, 
        duration: 0.3, 
        immediateRender: false,
        pointerEvents: "none"
      }, "<");

      // ==== PHASE 1: Bento Grid ====
      // Provide pointerEvents auto
      scrollTl.fromTo(".bento-section", 
        { autoAlpha: 0, y: 0, pointerEvents: "none" },
        { autoAlpha: 1, y: 0, pointerEvents: "auto", duration: 0.1, immediateRender: false }, 
        "+=0.1"
      );
      
      scrollTl.fromTo(".bento-title", 
        { autoAlpha: 0, filter: "blur(10px)", letterSpacing: "0.5em" },
        { autoAlpha: 1, filter: "blur(0px)", letterSpacing: "0.2em", duration: 0.5, ease: "expo.out", immediateRender: false }, 
        "<"
      );
      scrollTl.fromTo(".bento-subtitle",
        { autoAlpha: 0, filter: "blur(4px)" },
        { autoAlpha: 1, filter: "blur(0px)", duration: 0.4, stagger: 0.1, immediateRender: false },
        "-=0.2"
      );
      // Stage 1: Wireframe (Khung dây)
      scrollTl.fromTo(".bento-card",
        { 
          autoAlpha: 0.01, 
          border: "1px dashed rgba(34, 211, 238, 0)", 
          backgroundColor: "rgba(0,0,0,0)",
          backdropFilter: "blur(0px)",
          boxShadow: "0px 0px 0px rgba(34,211,238,0)"
        },
        { 
          autoAlpha: 0.2, 
          border: "1px dashed rgba(34, 211, 238, 0.5)", 
          duration: 0.4, 
          stagger: 0.1, 
          ease: "none", 
          immediateRender: false 
        },
        "-=0.2"
      );

      // Stage 2: Light Pulse (Xung điện viền)
      scrollTl.to(".bento-card",
        { 
          boxShadow: "0px 0px 15px rgba(34,211,238,0.8)", 
          duration: 0.2, 
          stagger: 0.1, 
          yoyo: true, 
          repeat: 1, 
          immediateRender: false 
        },
        "+=0"
      );

      // Stage 3: Glass Fill (Điền kính)
      scrollTl.to(".bento-card",
        { 
          border: "1px solid rgba(34, 211, 238, 0.2)", 
          autoAlpha: 1, 
          backgroundColor: "rgba(3, 5, 9, 0.6)", 
          backdropFilter: "blur(20px)", 
          duration: 0.6, 
          stagger: 0.1, 
          ease: "power2.out", 
          immediateRender: false 
        },
        "+=0"
      );

      // Stage 4: Embedded Bento Grid Scrub Animations (Nạp Dữ liệu)
      const bentoCounter = { val87: 0, val2: 0 };
      scrollTl.to(bentoCounter, {
        val87: 87,
        val2: 2,
        duration: 0.8,
        ease: "none",
        immediateRender: false,
        onUpdate: () => {
          const el87 = document.querySelector(".bento-counter-87");
          const el2 = document.querySelector(".bento-counter-2");
          if (el87) el87.textContent = Math.floor(bentoCounter.val87).toString();
          if (el2) el2.textContent = Math.floor(bentoCounter.val2).toString();
        }
      }, "+=0.1"); // Start after glass fill finishes
      
      scrollTl.fromTo(".telemetry-path", 
        { strokeDashoffset: 400 }, 
        { strokeDashoffset: 0, duration: 0.8, ease: "none", immediateRender: false }, 
        "<"
      );
      
      scrollTl.fromTo(".vision-scan-line",
        { y: 0 },
        { y: 200, duration: 0.8, ease: "none", immediateRender: false },
        "<"
      );

      // HOLD Bento
      scrollTl.to({}, { duration: 0.6 }, "+=0");
      
      // Exit Bento
      scrollTl.fromTo(".bento-section", 
        { autoAlpha: 1, pointerEvents: "auto" },
        { autoAlpha: 0, pointerEvents: "none", duration: 0.4, immediateRender: false }, 
        "+=0"
      );

      // ==== PHASE 2: Hardware Store ====
      scrollTl.fromTo(".hardware-section", 
        { autoAlpha: 0, pointerEvents: "none" },
        { autoAlpha: 1, pointerEvents: "auto", duration: 0.1, immediateRender: false }, 
        "+=0"
      );

      scrollTl.fromTo(".hardware-title", 
        { autoAlpha: 0, filter: "blur(10px)", letterSpacing: "0.5em" },
        { autoAlpha: 1, filter: "blur(0px)", letterSpacing: "0.2em", duration: 0.5, immediateRender: false }, 
        "<"
      );
      scrollTl.fromTo(".hardware-subtitle",
        { autoAlpha: 0, filter: "blur(4px)" },
        { autoAlpha: 1, filter: "blur(0px)", duration: 0.4, stagger: 0.1, immediateRender: false },
        "-=0.3"
      );

      // Hardware Box Scan effect
      scrollTl.fromTo("#scan-plane", 
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.1, immediateRender: false }, 
        "<"
      );
      scrollTl.fromTo("#scan-plane", 
        { y: "0vh" }, 
        { y: "150vh", duration: 0.6, ease: "none", immediateRender: false }, 
        "+=0"
      );
      scrollTl.fromTo("#scan-plane", 
        { autoAlpha: 1 },
        { autoAlpha: 0, duration: 0.2, immediateRender: false }, 
        "+=0"
      );
      
      // Reveal product strip container
      scrollTl.fromTo("#hardware-store-section .grid",
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.2, immediateRender: false },
        "-=0.4"
      );

      // Centralized Hardware Product Card Animation
      scrollTl.fromTo(".product-dashed", 
        { autoAlpha: 0, scale: 0.95 },
        { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.1, ease: "none", immediateRender: false, overwrite: "auto" },
        "-=0"
      );
      scrollTl.fromTo(".product-card-glass",
        { autoAlpha: 0, filter: "blur(10px) brightness(2)" },
        { autoAlpha: 1, filter: "blur(0px) brightness(1)", duration: 0.6, stagger: 0.1, ease: "none", immediateRender: false, overwrite: "auto" },
        "-=0.2"
      );
      scrollTl.fromTo(".product-dashed", 
        { autoAlpha: 1, scale: 1 },
        { autoAlpha: 0, scale: 1.05, duration: 0.4, stagger: 0.1, ease: "none", immediateRender: false, overwrite: "auto" }, 
        "<"
      );

      // HOLD Hardware
      scrollTl.to({}, { duration: 0.6 }, "+=0");

      // Exit Hardware
      scrollTl.fromTo(".hardware-section", 
        { autoAlpha: 1, pointerEvents: "auto" },
        { autoAlpha: 0, pointerEvents: "none", duration: 0.4, immediateRender: false }, 
        "+=0"
      );

      // ==== PHASE 3: Terminal ====
      scrollTl.fromTo(".terminal-section", 
        { autoAlpha: 0, pointerEvents: "none" },
        { autoAlpha: 1, pointerEvents: "auto", duration: 0.1, immediateRender: false }, 
        "+=0"
      );
      
      scrollTl.fromTo(".term-title",
        { autoAlpha: 0, filter: "blur(10px)", letterSpacing: "0.5em" },
        { autoAlpha: 1, filter: "blur(0px)", letterSpacing: "0.2em", duration: 0.5, immediateRender: false },
        "<"
      );
      scrollTl.fromTo(".term-subtitle",
        { autoAlpha: 0, filter: "blur(4px)" },
        { autoAlpha: 1, filter: "blur(0px)", duration: 0.4, stagger: 0.1, immediateRender: false },
        "-=0.3"
      );
      scrollTl.fromTo(".term-box",
        { autoAlpha: 0, clipPath: "inset(50% 0 50% 0)" },
        { autoAlpha: 1, clipPath: "inset(0% 0 0% 0)", duration: 0.6, immediateRender: false },
        "-=0.2"
      );

      // Terminal Scrub Typewriter & Effects
      const termObj = { char: 0 };
      const targetCmd = "./initialize_garden.sh";
      scrollTl.to(termObj, {
        char: targetCmd.length,
        duration: 0.8,
        ease: "none",
        immediateRender: false,
        onUpdate: () => {
          const el = document.getElementById("term-cmd");
          if (el) el.textContent = targetCmd.slice(0, Math.floor(termObj.char));
        }
      }, "+=0.1");

      scrollTl.fromTo(".term-cursor", 
        { autoAlpha: 1 },
        { autoAlpha: 0, duration: 0.1, immediateRender: false }, 
        "+=0"
      );

      scrollTl.fromTo(".term-output-1", 
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.2, immediateRender: false }, 
        "+=0.1"
      );
      scrollTl.fromTo(".term-output-2", 
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.2, immediateRender: false }, 
        "+=0.1"
      );
      scrollTl.fromTo(".term-output-3", 
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.2, immediateRender: false }, 
        "+=0.1"
      );

      scrollTl.fromTo([".term-input-row", ".term-input-hint"], 
        { autoAlpha: 0, y: 15 },
        { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.1, immediateRender: false }, 
        "+=0.2"
      );

      // HOLD Terminal State
      scrollTl.to({}, { duration: 0.6 }, "+=0");

      return () => {
        document.documentElement.style.overflow = "";
        document.documentElement.style.height = "";
        document.body.style.overflow = "";
        document.body.style.height = "";
        introTl.kill();
        if (scrollTl) scrollTl.kill();
      };
    },
    { dependencies: [isLoaded], revertOnUpdate: true }
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!shouldPlayVideo || !video || introIncludedVideoFadeRef.current) return;

    gsap.to(video, {
      autoAlpha: 0.4,
      filter: "blur(2px)",
      scale: 1.02,
      duration: 1.2,
      ease: "sine.out",
    });
    introIncludedVideoFadeRef.current = true;
  }, [shouldPlayVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (shouldPlayVideo) {
      void video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [shouldPlayVideo]);

  return (
    <section
      ref={heroRef}
      className="absolute inset-0 w-full overflow-hidden bg-transparent"
    >
      {/* Z-10: Môi trường Thực (Reality - Video) */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        className="absolute inset-0 z-10 h-full w-full object-cover will-change-transform"
        style={{
          opacity: 0,
          visibility: "hidden",
          willChange: "transform, opacity, filter",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,1) 36%, rgba(0,0,0,0.28) 72%, rgba(0,0,0,0.06) 92%)",
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,1) 36%, rgba(0,0,0,0.28) 72%, rgba(0,0,0,0.06) 92%)",
        }}
      >
        <source src="/videos/video_plant.mp4" type="video/mp4" />
      </video>

      <div
        className="absolute inset-0 z-[11]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0, 0, 0, 0) 38%, rgba(0,0,0,0.42) 72%, rgba(0,0,0,0.78) 100%)",
        }}
      />

      {/* Z-[20]: Lớp Mạng Lưới (Plexus/Data Nodes) của Hero (sẽ mờ đi khi zoom) */}
      <div
        ref={plexusRef}
        className="absolute inset-0 z-[20] overflow-hidden"
        style={{
          opacity: 0,
          willChange: "transform, opacity",
          background:
            "radial-gradient(circle at 50% 42%, rgba(80, 112, 255, 0.18) 0%, rgba(31, 41, 84, 0.12) 26%, rgba(5, 7, 16, 0.93) 64%, rgba(4, 5, 11, 0.98) 100%)",
        }}
      >
        <svg
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full opacity-80"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id={`nodeGlow-${filterId}`} cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(120,208,255,0.98)" />
              <stop offset="100%" stopColor="rgba(120,208,255,0.06)" />
            </radialGradient>
          </defs>
          <g stroke="rgba(118,196,255,0.22)" strokeWidth="1.2">
            <line x1="160" y1="210" x2="370" y2="190" />
            <line x1="370" y1="190" x2="580" y2="250" />
            <line x1="580" y1="250" x2="760" y2="170" />
            <line x1="760" y1="170" x2="980" y2="240" />
            <line x1="250" y1="420" x2="430" y2="360" />
            <line x1="430" y1="360" x2="620" y2="420" />
            <line x1="620" y1="420" x2="820" y2="360" />
            <line x1="820" y1="360" x2="980" y2="470" />
            <line x1="370" y1="190" x2="430" y2="360" />
            <line x1="580" y1="250" x2="620" y2="420" />
            <line x1="760" y1="170" x2="820" y2="360" />
            <line x1="250" y1="420" x2="160" y2="210" />
          </g>
          <g fill={`url(#nodeGlow-${filterId})`}>
            <circle cx="160" cy="210" r="4.4" />
            <circle cx="370" cy="190" r="4.8" />
            <circle cx="580" cy="250" r="5.1" />
            <circle cx="760" cy="170" r="4.6" />
            <circle cx="980" cy="240" r="4.4" />
            <circle cx="250" cy="420" r="5.2" />
            <circle cx="430" cy="360" r="4.9" />
            <circle cx="620" cy="420" r="5.1" />
            <circle cx="820" cy="360" r="4.7" />
            <circle cx="980" cy="470" r="4.1" />
          </g>
        </svg>
      </div>

      <div
        ref={plexusGlowRef}
        className="absolute inset-0 z-[20]"
        style={{
          opacity: 0,
          willChange: "opacity",
          background:
            "radial-gradient(circle at 50% 45%, rgba(137, 203, 255, 0.18) 0%, rgba(67, 88, 172, 0.12) 22%, rgba(3, 5, 12, 0) 58%)",
        }}
      />

      {/* Z-[40]: Lớp Tương Tác Chính - Tiêu đề mồi ECO-TECH */}
      <div 
        className="pointer-events-none absolute inset-0 z-[40] flex flex-col items-center justify-center px-6 text-center"
        style={{ perspective: "1000px", backfaceVisibility: "hidden" }}
      >
        <h1
          ref={titleWrapRef}
          className="m-0 flex w-full max-w-5xl justify-center"
          style={{
            opacity: 0,
            visibility: "hidden",
          }}
        >
          <svg
            ref={svgTitleRef}
            viewBox="0 0 800 300"
            className="mx-auto h-auto w-full max-w-4xl overflow-visible"
            role="img"
            aria-label="ECO-TECH"
            preserveAspectRatio="xMidYMid meet"
            shapeRendering="geometricPrecision"
          >
            <title>ECO-TECH</title>
            
            {/* Lớp 2 (TECH - Outline Trắng) */}
            <text
              ref={techRef}
              x="400"
              y="210"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5px"
              style={{
                visibility: "hidden",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontSize: 120,
                fontWeight: 900,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              TECH
            </text>

            {/* Lớp 1 (ECO - Solid White) sẽ zoom xuyên không */}
            <text
              ref={ecoRef}
              x="400"
              y="90"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              opacity={0}
              style={{
                stroke: "none",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontSize: 120,
                fontWeight: 900,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                willChange: "transform, opacity",
                // Tuyệt chiêu CSS Rasterization offload to GPU Texture Cache
                transform: "translateZ(0)",
                isolation: "isolate", 
                filter: "drop-shadow(0 0 0 transparent)", // Bắt buộc coi là Bitmap/Texture thay vì tính toán Vector lúc zoom khổng lồ
              }}
            >
              ECO
            </text>
          </svg>
        </h1>

        <p
          ref={sloganRef}
          className="mt-6 max-w-3xl text-sm font-medium uppercase tracking-[0.2em] text-zinc-100/90 md:text-base"
          style={{
            opacity: 0,
            visibility: "hidden",
            transform: "translateY(18px)",
            willChange: "transform, opacity",
          }}
        >
          Where Nature Meets Intelligent Automation
        </p>
      </div>

      {/* Z-[50]: Đích đến cốt lõi (Core AI Convergence) */}
      <div className="pointer-events-none absolute inset-0 z-[50] flex flex-col items-center justify-center px-6 text-center">
        <h2
          ref={finalTitleRef}
          className="text-4xl font-extrabold uppercase tracking-widest text-[#ffffff] md:text-5xl lg:text-7xl"
          style={{
            opacity: 0,
            visibility: "hidden",
            textShadow: "0px 0px 30px rgba(100,200,255,0.4)",
          }}
        >
          Trí tuệ nhân tạo<br className="md:hidden" /> hội tụ.
        </h2>
      </div>

      <div
        className="absolute inset-0 z-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(3,4,9,0.38) 0%, rgba(4,5,11,0.18) 40%, rgba(4,5,11,0.72) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 z-40 h-44 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(4,5,11,0.88), rgba(4,5,11,0))",
        }}
      />
    </section>
  );
}
