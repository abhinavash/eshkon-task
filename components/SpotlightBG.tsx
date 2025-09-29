"use client";

import React, { useEffect, useRef } from "react";

export default function SpotlightBG() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      if (ref.current) {
        ref.current.style.setProperty("--mx", `${x}%`);
        ref.current.style.setProperty("--my", `${y}%`);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return <div ref={ref} className="spotlightBg" aria-hidden />;
}
