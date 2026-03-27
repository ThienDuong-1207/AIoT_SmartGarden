"use client";

import { useEffect, useRef, useId, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";

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
  const ecoRef = useRef<HTMLSpanElement | null>(null);
  const techRef = useRef<HTMLSpanElement | null>(null);
  const finalTitleRef = useRef<HTMLHeadingElement | null>(null);
  const fadeOverlayRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const hero = heroRef.current;
      if (!hero) return;

      /** isLoaded false: ẩn Hero */
      if (!isLoaded) {
        gsap.set(hero, { opacity: 0 });
        return;
      }

      const video = videoRef.current;
      const plexus = plexusRef.current;
      const plexusGlow = plexusGlowRef.current;
      const titleWrap = titleWrapRef.current;
      const slogan = sloganRef.current;
      const eco = ecoRef.current;
      const tech = techRef.current;
      const finalTitle = finalTitleRef.current;

      if (!video || !plexus || !plexusGlow || !titleWrap || !slogan || !eco || !tech || !finalTitle) return;

      // 1. INITIAL SETTINGS
      gsap.set(hero, { opacity: 1 });
      gsap.set(video, { opacity: 0, scale: 1.05 });
      gsap.set(fadeOverlayRef.current, { opacity: 0 });
      gsap.set(slogan, { opacity: 0, y: 20 });
      gsap.set(titleWrap, { opacity: 0 });
      gsap.set(plexus, { opacity: 0, scale: 0.9 });
      gsap.set(plexusGlow, { opacity: 0 });
      gsap.set(finalTitle, { opacity: 0, y: 20 });

      gsap.set(tech, { opacity: 0, y: 30 });
      gsap.set(eco, { opacity: 0, y: -30 });

      // 2. INTRO TIMELINE
      const introTl = gsap.timeline({ delay: 0.5 });

      introTl
        .to(titleWrap, { opacity: 1, duration: 0.5 })
        .to(eco, { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }, "-=0.2")
        .to(tech, { opacity: 0.6, y: 0, duration: 0.8, ease: "back.out(1.7)" }, "-=0.6")
        .to(slogan, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
        .to(video, { opacity: 0.4, scale: 1, duration: 1.2 }, "-=0.5")
        .to([plexus, plexusGlow], { opacity: 0.3, scale: 1, duration: 1 }, "<")
        .to(finalTitle, { opacity: 1, y: 0, duration: 0.8 }, "-=0.2");
      
      // 3. SCROLL ANIMATION (Performance-optimized Fade)
      gsap.to(fadeOverlayRef.current, {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom center",
          scrub: true,
        }
      });

      return () => {
        introTl.kill();
      };
    },
    { dependencies: [isLoaded] }
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldPlayVideo) return;
    
    video.play().catch(() => {});
  }, [shouldPlayVideo]);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen min-h-[700px] overflow-hidden bg-transparent flex flex-col items-center justify-center"
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover pointer-events-none"
        style={{
          WebkitMaskImage: "radial-gradient(circle at center, black 30%, transparent 90%)",
          maskImage: "radial-gradient(circle at center, black 30%, transparent 90%)",
          willChange: "opacity"
        }}
      >
        <source src="/videos/video_plant.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Fade Overlay (Solid color instead of backdrop-blur to avoid repaint lag) */}
      <div 
        ref={fadeOverlayRef}
        className="absolute inset-0 z-[1] bg-transparent pointer-events-none"
        style={{ willChange: "opacity" }}
      />

      {/* Decorative Plexus Overlay */}
      <div
        ref={plexusRef}
        className="absolute inset-0 z-10 opacity-30 pointer-events-none"
      >
        <svg viewBox="0 0 1200 800" className="h-full w-full">
          <g stroke="rgba(34,211,238,0.2)" strokeWidth="1">
            <line x1="100" y1="100" x2="300" y2="200" />
            <line x1="300" y1="200" x2="500" y2="150" />
            <line x1="500" y1="150" x2="200" y2="400" />
            <line x1="200" y1="400" x2="100" y2="100" />
          </g>
        </svg>
      </div>

      <div
        ref={plexusGlowRef}
        className="absolute inset-0 z-10 bg-radial-[at_50%_50%] from-cyan-500/10 via-transparent to-transparent pointer-events-none"
      />

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center text-center px-6">
        <div ref={titleWrapRef} className="max-w-4xl">
          <div
            className="flex flex-col items-center justify-center gap-4 mb-10"
            aria-label="ECO-TECH"
          >
            <span
              ref={ecoRef}
              className="text-7xl md:text-9xl font-black text-white leading-none tracking-[0.1em]"
              style={{ willChange: "transform, opacity" }}
            >
              ECO
            </span>
            <span
              ref={techRef}
              className="text-7xl md:text-9xl font-black leading-none tracking-[0.1em] text-transparent"
              style={{
                WebkitTextStroke: "2px rgba(255,255,255,0.8)",
                willChange: "transform, opacity"
              }}
            >
              TECH
            </span>
          </div>
          
          <p
            ref={sloganRef}
            className="text-lg md:text-xl font-medium tracking-[0.3em] text-white/80 uppercase mb-8"
            style={{ willChange: "transform, opacity" }}
          >
            Where Nature Meets Intelligence
          </p>

          <h2
            ref={finalTitleRef}
            className="text-4xl md:text-6xl font-black text-white uppercase leading-tight"
            style={{ willChange: "transform, opacity" }}
          >
            Trí tuệ nhân tạo<br />hội tụ xanh.
          </h2>
        </div>

        <div className="mt-12 animate-bounce">
          <ChevronDown className="text-white/40" size={32} />
        </div>
      </div>

      {/* Bottom fade shadow */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-transparent to-transparent z-30" />
    </section>
  );
}
