"use client";

import { useRef, useState, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  intensity?: number;
};

export function TiltCard({ children, className, intensity = 3.5 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rX = ((y - cy) / cy) * -intensity;
    const rY = ((x - cx) / cx) * intensity;
    setStyle({
      transform: `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg) scale3d(1.012, 1.012, 1.012)`,
      transition: "transform 0.08s ease-out"
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
    });
  };

  return (
    <div
      ref={ref}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("will-change-transform", className)}
    >
      {children}
    </div>
  );
}
