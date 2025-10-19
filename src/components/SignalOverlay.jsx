// src/components/SignalOverlay.jsx
import React from "react";

export default function SignalOverlay({ intensity = 0 }) {
  // intensity: 0..1
  const opacity = 0.02 + intensity * 0.12;
  const translate = intensity * 6;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40">
      <div style={{ opacity }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.05),transparent_40%)] mix-blend-screen" />
      <div style={{ transform: `translateX(${translate}px)` }} className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01),transparent)]" />
      {/* thin scanlines */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg, rgba(255,255,255,0.00), rgba(255,255,255,0.00) 1px, rgba(255,255,255,0.01) 2px)] opacity-60" />
    </div>
  );
}
