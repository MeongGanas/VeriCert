"use client";

import React, { useState, useRef } from "react";
import {
  Search,
  Upload,
  FileCheck,
  FileX,
  Loader2,
  Hash,
  ShieldCheck,
  Calendar,
  Award,
  User,
  Building2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { calculateFileHash, verifyCertificateAPI } from '@/lib/actions/blockChainService';
import { CertificateRecord } from "@/lib/types";

export default function VerifyPage() {
  const { supabase } = useSupabase();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CertificateRecord | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "valid" | "invalid"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVerification = async (file: File) => {
    setIsLoading(true);
    setResult(null);
    setVerificationStatus("idle");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const fileHash = await calculateFileHash(file);
      console.log("File Hash:", fileHash);

      const record = await verifyCertificateAPI(fileHash);

      if (record) {
        setResult(record);
        setVerificationStatus("valid");
      } else {
        setVerificationStatus("invalid");
      }
    } catch (error) {
      console.error("Verification Error:", error);
      setVerificationStatus("invalid");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVerification(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen py-20 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-20 left-10 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 px-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono text-accent-glow uppercase tracking-wider">
            Verifikasi Publik
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Cek Keaslian <span className="text-gradient">Dokumen</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-lg">
          Unggah file sertifikat atau ijazah untuk memverifikasi validitasnya
          secara langsung di jaringan Blockchain.
        </p>
      </motion.div>

      <div className="w-full max-w-3xl px-4 relative z-10">
        <GlassCard className="overflow-hidden border-accent/20">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group
              ${isDragOver
                ? "border-accent bg-accent/10 scale-[0.99]"
                : "border-white/10 hover:border-accent/50 hover:bg-white/5"
              }
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) =>
                e.target.files && handleVerification(e.target.files[0])
              }
            />

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-8"
                >
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-white/10 rounded-full animate-spin border-t-accent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Search className="w-8 h-8 text-accent animate-pulse" />
                    </div>
                  </div>
                  <p className="mt-6 text-lg font-medium text-white animate-pulse">
                    Sedang Memindai Blockchain...
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-6"
                >
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                    <Upload
                      className={`w-10 h-10 ${isDragOver ? "text-white" : "text-accent"
                        }`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Klik atau Seret File ke Sini
                  </h3>
                  <p className="text-sm text-gray-400 max-w-xs mx-auto">
                    Mendukung format PDF, JPG, PNG. Sistem akan mencocokkan hash
                    file dengan catatan on-chain.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>

        <AnimatePresence>
          {verificationStatus !== "idle" && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8"
            >
              {verificationStatus === "valid" && result ? (
                <GlassCard className="border-primary/50 bg-primary/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <ShieldCheck className="w-32 h-32 text-primary" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6 border-b border-primary/20 pb-4">
                      <div className="p-3 bg-primary/20 rounded-full border border-primary/50">
                        <FileCheck className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          Terverifikasi Valid
                        </h2>
                        <p className="text-primary-glow text-sm font-mono">
                          Dokumen Asli & Terdaftar
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <InfoItem
                            icon={User}
                            label="Nama Penerima"
                            value={result.metadata.name}
                          />
                          <InfoItem
                            icon={Award}
                            label="Judul Sertifikat"
                            value={result.metadata.achievment}
                          />
                        </div>
                        <div className="space-y-4">
                          <InfoItem
                            icon={Building2}
                            label="Penerbit"
                            value={result.metadata.institution}
                          />
                          <InfoItem
                            icon={Calendar}
                            label="Tanggal Terbit"
                            value={result.metadata.eventDate}
                          />
                        </div>
                      </div>
                      {result.metadata.description && (
                        <InfoItem
                          icon={Hash}
                          label="Info Tambahan"
                          value={result.metadata.description}
                        />
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-primary/20">
                      <p className="text-xs text-gray-400 font-mono mb-1">
                        Blockchain Transaction Hash:
                      </p>
                      <p className="text-xs text-primary break-all bg-primary/10 p-2 rounded border border-primary/20">
                        {result.txHash}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Timestamp:{" "}
                        {new Date(result.timestamp).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard className="border-red-500/50 bg-red-500/5 flex flex-col items-center text-center py-10">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
                    <FileX className="w-10 h-10 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Dokumen Tidak Ditemukan
                  </h2>
                  <p className="text-gray-400 max-w-md">
                    File ini tidak terdaftar di dalam blockchain kami, atau file
                    telah dimodifikasi dari versi aslinya. Harap periksa kembali
                    file Anda.
                  </p>
                  <NeonButton
                    variant="secondary"
                    onClick={() => setVerificationStatus("idle")}
                    className="mt-6"
                  >
                    Coba Lagi
                  </NeonButton>
                </GlassCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 w-full">
    <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-white font-medium">{value || "-"}</p>
    </div>
  </div>
);
