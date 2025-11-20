"use client";

import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute inset-0"
      >
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-screen filter blur-[150px] opacity-40 animate-blob" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full mix-blend-screen filter blur-[150px] opacity-40 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-purple-500/20 rounded-full mix-blend-screen filter blur-[180px] opacity-40 animate-blob animation-delay-4000" />
        <div className="absolute bottom-1/3 right-1/2 w-[300px] h-[300px] bg-pink-500/20 rounded-full mix-blend-screen filter blur-[130px] opacity-40 animate-blob animation-delay-6000" />
      </motion.div>

      <div
        className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] 
        background-size:24px_24px opacity-10"
      ></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute top-[10%] left-[20%] w-2 h-2 rounded-full bg-primary/50 animate-pulse-dot"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-[20%] right-[15%] w-3 h-3 rounded-full bg-accent/50 animate-pulse-dot animation-delay-2000"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute top-[30%] right-[10%] w-2 h-2 rounded-full bg-purple-500/50 animate-pulse-dot animation-delay-4000"
      />
    </div>
  );
}
