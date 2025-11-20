"use client";

import React from "react";
import {
  ArrowRight,
  Building2,
  Database,
  Lock,
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import Table from "@/components/Table";

const Home: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center max-w-4xl px-4"
      >
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-xs font-mono text-primary-glow uppercase tracking-wider">
            Protokol Verifikasi Terdesentralisasi
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-white"
        >
          Kredensial Aman
          <br />
          di <span className="text-gradient">Blockchain</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto"
        >
          Masa depan integritas akademik. Terbitkan sertifikat digital
          anti-rusak yang terhubung ke buku besar terdesentralisasi. Bebas
          penipuan. 100% Kepercayaan.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-center gap-6 mb-20"
        >
          <Link href="/issuer">
            <GlassCard
              hoverEffect
              className="p-8 flex flex-col items-center text-center min-w-[280px] cursor-pointer border-primary/20 group"
            >
              <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-primary/20">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Untuk Institusi
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Terbitkan dan kelola ijazah digital.
              </p>
              <div className="flex items-center text-primary text-sm font-mono group-hover:translate-x-1 transition-transform">
                Luncurkan Dasbor <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </GlassCard>
          </Link>

          <Link href="/verify">
            <GlassCard
              hoverEffect
              className="p-8 flex flex-col items-center text-center min-w-[280px] cursor-pointer border-accent/20 group"
            >
              <div className="h-14 w-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-accent/20">
                <Search className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Untuk Verifikator
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Validasi kredensial kandidat.
              </p>
              <div className="flex items-center text-accent text-sm font-mono group-hover:translate-x-1 transition-transform">
                Mulai Verifikasi <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </GlassCard>
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mb-20"
        >
          {[
            {
              icon: Lock,
              title: "Immutable",
              desc: "Catatan tidak dapat diubah setelah di-hash secara on-chain.",
              color: "text-purple-400",
              bg: "bg-purple-500/10",
            },
            {
              icon: Database,
              title: "Permanent",
              desc: "Kredensial bertahan selamanya, terlepas dari server.",
              color: "text-blue-400",
              bg: "bg-blue-500/10",
            },
            {
              icon: ShieldCheck,
              title: "Fraud-Proof",
              desc: "Hashing kriptografi memastikan integritas 100%.",
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
            },
          ].map((feature, idx) => (
            <GlassCard key={idx} className="flex flex-col items-start p-6">
              <div className={`p-3 ${feature.bg} rounded-xl mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </GlassCard>
          ))}
        </motion.div>

        <Table itemVariants={itemVariants} />
      </motion.div>
    </div>
  );
};

export default Home;
