// Reusable Glass Card Component - Matching Login Page Design
"use client";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6 ${className}`}>
      {children}
    </div>
  );
}

