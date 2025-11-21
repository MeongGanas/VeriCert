"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface NeonButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
  isLoading?: boolean;
}

export default function NeonButton({
  variant = "primary",
  children,
  className = "",
  isLoading,
  ...props
}: NeonButtonProps) {
  const baseStyles =
    "relative px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group cursor-pointer";

  const variants = {
    primary:
      "bg-primary/10 text-primary border border-primary/50 hover:bg-primary hover:text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]",
    secondary:
      "bg-accent/10 text-accent border border-accent/50 hover:bg-accent hover:text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]",
    danger:
      "bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${className} ${isLoading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
