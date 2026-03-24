"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type LoadingScreenProps = {
  onComplete?: () => void;
};

const PARTICLE_COUNT = 48;

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const coreRef = useRef<HTMLDivElement | null>(null);
  const laserRef = useRef<HTMLDivElement | null>(null);
  const solidRef = useRef<SVGPathElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const particles = useMemo(() => Array.from({ length: PARTICLE_COUNT }), []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      const core = coreRef.current;
      const laser = laserRef.current;
      const solid = solidRef.current;
      const percent = progressRef.current;
      if (!root || !core || !laser || !solid || !percent) return;

      const particleNodes = gsap.utils.toArray<HTMLElement>(".scan-particle", root);
      const boxes = gsap.utils.toArray<HTMLElement>(".scan-box", root);

      gsap.set(root, { opacity: 1, filter: "blur(0px)" });
      gsap.set(core, { scale: 1, transformOrigin: "50% 50%" });
      gsap.set(laser, { bottom: "0%" });
      gsap.set(solid, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(particleNodes, { x: 0, y: 0, scale: 0.2, opacity: 0 });
      gsap.set(boxes, { opacity: 0.16 });

      const flicker = gsap.to(boxes, {
        opacity: 0.7,
        duration: 0.2,
        repeat: -1,
        yoyo: true,
        stagger: 0.05,
        ease: "power1.inOut",
      });

      const driver = { value: 0 };
      const scanTween = gsap.to(driver, {
        value: 100,
        duration: 3.2,
        ease: "power2.inOut",
        onUpdate: () => {
          const value = Math.round(driver.value);
          setProgress(value);
          gsap.set(solid, { clipPath: `inset(${100 - value}% 0% 0% 0%)` });
          gsap.set(laser, { bottom: `${value}%` });
        },
        onComplete: () => {
          const tl = gsap.timeline({
            onComplete: () => {
              document.body.style.overflow = "auto";
              onComplete?.();
            },
          });

          tl.to(
            core,
            {
              opacity: 1,
              duration: 0.08,
              repeat: 3,
              yoyo: true,
              ease: "power4.inOut",
            },
            0
          )
            .to(
              core,
              {
                scale: 10,
                z: 400,
                duration: 0.65,
                ease: "power4.in",
              },
              0.16
            )
            .to(
              particleNodes,
              {
                opacity: 1,
                scale: "random(1.5,4.2)",
                x: "random(-460,460)",
                y: "random(-380,380)",
                duration: 0.7,
                ease: "expo.out",
                stagger: {
                  amount: 0.2,
                  from: "random",
                },
              },
              0.18
            )
            .to(
              root,
              {
                filter: "blur(20px)",
                duration: 0.35,
                ease: "power2.out",
              },
              0.25
            )
            .to(
              root,
              {
                opacity: 0,
                duration: 0.45,
                ease: "power2.inOut",
              },
              0.42
            );
        },
      });

      return () => {
        flicker.kill();
        scanTween.kill();
      };
    },
    { scope: rootRef, dependencies: [onComplete] }
  );

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden"
      style={{
        background: "#050505",
        perspective: "1100px",
      }}
      aria-label="Loading screen"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(38, 205, 175, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(38, 205, 175, 0.12) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div ref={coreRef} className="relative flex h-[320px] w-[320px] items-center justify-center">
        <svg viewBox="0 0 240 240" className="h-[240px] w-[240px]">
          <path
            d="M120 30 C84 52, 70 90, 76 129 C82 172, 109 203, 120 214 C131 203, 158 172, 164 129 C170 90, 156 52, 120 30 Z"
            fill="none"
            stroke="rgba(132, 255, 226, 0.7)"
            strokeWidth="2"
            strokeDasharray="7 5"
          />
          <path
            ref={solidRef}
            d="M120 30 C84 52, 70 90, 76 129 C82 172, 109 203, 120 214 C131 203, 158 172, 164 129 C170 90, 156 52, 120 30 Z"
            fill="url(#plantGradient)"
          />
          <defs>
            <linearGradient id="plantGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1df3bf" />
              <stop offset="100%" stopColor="#4bd6ff" />
            </linearGradient>
          </defs>
        </svg>

        <div
          ref={laserRef}
          className="pointer-events-none absolute left-1/2 h-[3px] w-[190px] -translate-x-1/2 rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, #33ffe4, transparent)",
            boxShadow: "0 0 24px rgba(59, 255, 228, 0.92)",
          }}
        />

        <div className="scan-box absolute left-8 top-8 h-12 w-12 border border-cyan-300/60" />
        <div className="scan-box absolute right-8 top-12 h-10 w-14 border border-emerald-300/60" />
        <div className="scan-box absolute bottom-10 left-12 h-12 w-16 border border-cyan-200/50" />

        <div
          ref={progressRef}
          className="absolute text-center font-mono text-3xl font-bold tracking-wider text-cyan-200"
        >
          {progress}%
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0">
        {particles.map((_, index) => (
          <span
            key={index}
            className="scan-particle absolute left-1/2 top-1/2 block h-1.5 w-1.5 rounded-[1px] bg-cyan-200 shadow-[0_0_14px_rgba(52,255,227,0.8)]"
          />
        ))}
      </div>
    </div>
  );
}
