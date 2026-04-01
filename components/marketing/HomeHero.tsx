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
  const sloganRef = useRef<HTMLParagraphElement | null>(null);
  const ecoRef = useRef<HTMLSpanElement | null>(null);
  const fadeOverlayRef = useRef<HTMLDivElement | null>(null);
  const techPathRef = useRef<SVGTextElement | null>(null);
  const heroTextContainerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const hero = heroRef.current;
      if (!hero) return;

      if (!isLoaded) {
        gsap.set(hero, { opacity: 0 });
        return;
      }

      const video = videoRef.current;
      const techPath = techPathRef.current;
      const eco = ecoRef.current;
      const slogan = sloganRef.current;
      const container = heroTextContainerRef.current;
      const fadeOverlay = fadeOverlayRef.current;

      if (!video || !techPath || !eco || !slogan || !container || !fadeOverlay) return;

      // 1. INITIAL SETTINGS
      gsap.set(hero, { opacity: 1 });
      gsap.set(video, { opacity: 0, scale: 1.1 });
      gsap.set(eco, { autoAlpha: 0, y: 30 });
      gsap.set(slogan, { autoAlpha: 0, y: 15 });
      gsap.set(container, { autoAlpha: 1 });
      gsap.set(fadeOverlay, { opacity: 1 }); // Start with overlay dark
      
      // Calculate stroke length for TECH
      const length = 1000; 
      gsap.set(techPath, { 
        strokeDasharray: length, 
        strokeDashoffset: length,
        fill: "rgba(255,255,255,0)",
        stroke: "rgba(255,255,255,0.8)",
        strokeWidth: 1
      });

      // 2. CINEMATIC TIMELINE (AUTOPLAY)
      const tl = gsap.timeline({ delay: 0.8 });

      tl.to(techPath, {
        strokeDashoffset: 0,
        duration: 2.5,
        ease: "power3.inOut"
      })
      .to(techPath, {
        fill: "rgba(255,255,255,0.1)",
        duration: 1,
        ease: "power2.out"
      }, "-=0.5")
      .to(eco, { 
        autoAlpha: 1, 
        y: 0, 
        duration: 1.2, 
        ease: "expo.out" 
      }, "-=1.5")
      .to(slogan, { 
        autoAlpha: 1, 
        y: 0, 
        duration: 1.2 
      }, "-=1.0")
      .to({}, { duration: 2 }) // PAUSE 2s
      .to(container, {
        autoAlpha: 0,
        filter: "blur(20px)",
        scale: 1.1,
        duration: 1.5,
        ease: "power4.inOut"
      })
      .to(video, {
        opacity: 0.9,
        scale: 1,
        duration: 2.5,
        ease: "power2.out"
      }, "-=1")
      .to(fadeOverlay, {
        opacity: 0,
        duration: 2
      }, "<");

      return () => {
        tl.kill();
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
        className="absolute inset-0 z-0 h-full w-full object-cover pointer-events-none transform-gpu will-change-transform"
        style={{
          opacity: 0,
        }}
      >
        <source src="/videos/herovideo.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Fade Overlay */}
      <div 
        ref={fadeOverlayRef}
        className="absolute inset-0 z-[1] bg-[#030005] pointer-events-none transform-gpu will-change-transform"
        style={{ opacity: 1 }}
      />

      {/* Hero Content */}
      <div 
        ref={heroTextContainerRef}
        className="hero-text-container relative z-20 flex flex-col items-center text-center px-6"
      >
        <div className="flex flex-col items-center justify-center gap-0 mb-8">
          <span
            ref={ecoRef}
            className="text-8xl md:text-[140px] font-black text-white leading-none tracking-[-0.05em] uppercase"
            style={{ willChange: "transform, opacity" }}
          >
            ECO
          </span>
          
          {/* SVG TECH for drawing effect */}
          <div className="w-[300px] md:w-[600px] -mt-4 md:-mt-8">
            <svg viewBox="0 0 600 160" className="w-full h-auto overflow-visible">
              <text
                ref={techPathRef}
                x="50%"
                y="120"
                textAnchor="middle"
                className="font-black uppercase"
                style={{
                  fontSize: "140px",
                  letterSpacing: "0.02em",
                  paintOrder: "stroke fill"
                }}
              >
                TECH
              </text>
            </svg>
          </div>
        </div>
        
        <p
          ref={sloganRef}
          className="text-xs md:text-sm font-bold tracking-[0.8em] text-cyan-400/80 uppercase"
          style={{ willChange: "transform, opacity" }}
        >
          Where Nature Meets Intelligence
        </p>
      </div>

      <div className="absolute bottom-12 z-20 animate-bounce">
        <ChevronDown className="text-white/20" size={32} />
      </div>

      {/* Bottom fade shadow (Vignette) — Smoother transition to background */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#030005] via-[#030005]/80 to-transparent z-10 pointer-events-none" />
    </section>
  );
}
