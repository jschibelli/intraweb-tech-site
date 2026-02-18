"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

interface EntranceRevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}

export default function EntranceReveal({
  children,
  className = "",
  delayMs = 0,
}: EntranceRevealProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    // Respect accessibility preferences and skip animation work.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties = {
    "--entrance-delay": `${delayMs}ms`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      style={style}
      className={`entrance-reveal ${isVisible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
