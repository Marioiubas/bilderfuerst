"use client";
// Aceternity "Spotlight (new)". Motion (motion/react) owns this element; never animate it with Anime.
// variant "pair": the original two mirrored beams (optional slow drift).
// variant "enlarger": one static cone of light from above — the enlarger head over the
// light table in the home hero. No endless drift by default; fades in once.
import React from "react";
import { motion } from "motion/react";

type SpotlightProps = {
  gradientFirst?: string;
  gradientSecond?: string;
  gradientThird?: string;
  translateY?: number;
  width?: number;
  height?: number;
  smallWidth?: number;
  duration?: number;
  xOffset?: number;
  /** "pair" (original) or "enlarger" (single vertical cone). */
  variant?: "pair" | "enlarger";
  /** Endless horizontal drift of the beams (original behaviour). */
  drift?: boolean;
  /** enlarger: horizontal position of the lamp in % of the container. */
  origin?: number;
  /** enlarger: cone opening angle in degrees. */
  spread?: number;
  /** enlarger: light colour as an "r g b" triplet and its peak alpha. */
  color?: string;
  intensity?: number;
  className?: string;
};

export const Spotlight = ({
  gradientFirst = "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 100%, 85%, .08) 0, hsla(210, 100%, 55%, .02) 50%, hsla(210, 100%, 45%, 0) 80%)",
  gradientSecond = "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .06) 0, hsla(210, 100%, 55%, .02) 80%, transparent 100%)",
  gradientThird = "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .04) 0, hsla(210, 100%, 45%, .02) 80%, transparent 100%)",
  translateY = -350,
  width = 560,
  height = 1380,
  smallWidth = 240,
  duration = 7,
  xOffset = 100,
  variant = "pair",
  drift = true,
  origin = 50,
  spread = 34,
  color = "244 238 226",
  intensity = 0.1,
  className = "",
}: SpotlightProps = {}) => {
  if (variant === "enlarger") {
    // Conic cone from a point just above the top edge, faded towards the floor; the radial
    // `gradientFirst` adds the hot spot under the lamp, `gradientSecond` the pool on the table.
    const half = spread / 2;
    const light = `rgb(${color} / ${intensity})`;
    const soft = `rgb(${color} / ${intensity * 0.45})`;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.62, 0, 0.32, 1] }}
        className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      >
        <div
          style={{
            position: "absolute",
            top: "-6%",
            left: `${origin}%`,
            width: "120%",
            height: "112%",
            transform: "translateX(-50%)",
            background: `conic-gradient(from ${180 - half - 8}deg at 50% 0%, transparent 0deg, ${soft} 8deg, ${light} ${8 + half}deg, ${soft} ${8 + spread}deg, transparent ${16 + spread}deg)`,
            WebkitMaskImage: "linear-gradient(to bottom, #000 0%, rgb(0 0 0 / .8) 38%, transparent 96%)",
            maskImage: "linear-gradient(to bottom, #000 0%, rgb(0 0 0 / .8) 38%, transparent 96%)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: gradientFirst }} />
        <div style={{ position: "absolute", inset: 0, background: gradientSecond }} />
      </motion.div>
    );
  }
  const loop = drift
    ? { duration, repeat: Infinity, repeatType: "reverse" as const, ease: "easeInOut" as const }
    : { duration: 0 };
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 1.5,
      }}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <motion.div
        animate={{
          x: drift ? [0, xOffset, 0] : 0,
        }}
        transition={loop}
        className="absolute top-0 left-0 w-screen h-screen z-40 pointer-events-none"
      >
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(-45deg)`,
            background: gradientFirst,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0`}
        />

        <div
          style={{
            transform: "rotate(-45deg) translate(5%, -50%)",
            background: gradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0 origin-top-left`}
        />

        <div
          style={{
            transform: "rotate(-45deg) translate(-180%, -70%)",
            background: gradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0 origin-top-left`}
        />
      </motion.div>

      <motion.div
        animate={{
          x: drift ? [0, -xOffset, 0] : 0,
        }}
        transition={loop}
        className="absolute top-0 right-0 w-screen h-screen z-40 pointer-events-none"
      >
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(45deg)`,
            background: gradientFirst,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0`}
        />

        <div
          style={{
            transform: "rotate(45deg) translate(-5%, -50%)",
            background: gradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0 origin-top-right`}
        />

        <div
          style={{
            transform: "rotate(45deg) translate(180%, -70%)",
            background: gradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0 origin-top-right`}
        />
      </motion.div>
    </motion.div>
  );
};
