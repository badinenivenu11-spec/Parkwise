import React from 'react';

export default function MotionBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#0A0F1D]">
      {/* Animated subtle grid pattern */}
      <div className="absolute inset-0 motion-grid-bg opacity-70" />

      {/* Floating Aurora Blur Orb 1 - Emerald / Mint (Top Left) */}
      <div
        className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full animate-orb-1"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(16, 185, 129, 0.03) 60%, transparent 80%)',
          filter: 'blur(70px)',
          willChange: 'transform',
        }}
      />

      {/* Floating Aurora Blur Orb 2 - Electric Blue / Cyan (Bottom Right) */}
      <div
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full animate-orb-2"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(14, 165, 233, 0.04) 60%, transparent 80%)',
          filter: 'blur(80px)',
          willChange: 'transform',
        }}
      />

      {/* Floating Aurora Blur Orb 3 - Deep Purple / Indigo (Center Left) */}
      <div
        className="absolute top-1/3 -left-48 w-[500px] h-[500px] rounded-full animate-orb-3"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(139, 92, 246, 0.03) 60%, transparent 80%)',
          filter: 'blur(75px)',
          willChange: 'transform',
        }}
      />

      {/* Floating Aurora Blur Orb 4 - Amber / Teal accent (Top Right) */}
      <div
        className="absolute top-10 right-1/4 w-[420px] h-[420px] rounded-full animate-orb-4"
        style={{
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, rgba(245, 158, 11, 0.04) 50%, transparent 75%)',
          filter: 'blur(65px)',
          willChange: 'transform',
        }}
      />

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-radial-vignette opacity-50" />
    </div>
  );
}
