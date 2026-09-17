import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  active?: boolean;
}

export const SparkleAura: React.FC<Props> = ({ children, active = true }) => {
  if (!active) return <>{children}</>;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Floating Sparkles around the item */}
      
      {/* Top Left Sparkle */}
      <div className="absolute -top-2.5 -left-2.5 pointer-events-none text-amber-400 animate-twinkle">
        <Sparkles className="w-5 h-5 fill-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
      </div>

      {/* Top Right Star */}
      <div className="absolute -top-1.5 -right-3 pointer-events-none text-orange-400 animate-twinkle-delayed">
        <span className="text-base select-none drop-shadow-[0_0_8px_rgba(249,115,22,0.9)]">✨</span>
      </div>

      {/* Bottom Left Star */}
      <div className="absolute -bottom-2 -left-3 pointer-events-none text-yellow-400 animate-twinkle-fast">
        <span className="text-sm select-none drop-shadow-[0_0_6px_rgba(234,179,8,0.8)]">⭐</span>
      </div>

      {/* Bottom Right Sparkle */}
      <div className="absolute -bottom-2.5 -right-2.5 pointer-events-none text-amber-500 animate-twinkle">
        <Sparkles className="w-4 h-4 fill-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
      </div>

      {/* Center Aura Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400/20 via-orange-300/20 to-yellow-300/20 blur-md pointer-events-none -z-10 animate-pulse" />

      {/* Child Element (e.g. Target Letter Circle) */}
      {children}
    </div>
  );
};
