import React, { useRef } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  spotlightColor
}) => {
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!divRef.current) return;

    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty("--mouse-x", `${x}px`);
    divRef.current.style.setProperty("--mouse-y", `${y}px`);
    
    // Only set spotlight color if explicitly provided, otherwise rely on CSS var
    if (spotlightColor) {
      divRef.current.style.setProperty("--spotlight-override", spotlightColor);
    }
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "spotlight-card relative overflow-hidden rounded-[25px] flex flex-col items-start p-6 transition-colors duration-300",
        "bg-gray-900/90 backdrop-blur-sm border border-gray-800 text-white",
        "before:content-[''] before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:ease-in-out before:z-0",
        "hover:before:opacity-100",
        "[&>*]:relative [&>*]:z-10",
        className
      )}
      style={{
        "--mouse-x": "0px",
        "--mouse-y": "0px",
        "--spotlight-color": spotlightColor || "rgba(59, 130, 246, 0.15)",
      } as React.CSSProperties}
    >
      <style jsx>{`
        .spotlight-card::before {
          background: radial-gradient(
            600px circle at var(--mouse-x) var(--mouse-y),
            var(--spotlight-color),
            transparent 80%
          );
        }
      `}</style>
      {children}
    </div>
  );
};