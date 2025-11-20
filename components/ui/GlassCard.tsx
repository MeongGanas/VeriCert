"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  hoverEffect = false,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={`glass-panel rounded-2xl p-6 shadow-xl ${className}`}
      whileHover={
        hoverEffect
          ? { scale: 1.02, borderColor: "rgba(16, 185, 129, 0.3)" }
          : {}
      }
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
