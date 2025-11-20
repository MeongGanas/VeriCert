"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  Hash,
  History,
  XCircle,
} from "lucide-react";
import {
  CertificateMetadata,
  CertificateRecord,
  GemAIStatus,
} from "@/lib/types";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { useRouter } from "next/navigation";
import extractCertificateDetailsAPI from '@/lib/actions/geminiServices';
import { calculateFileHash, issueCertificateAPI, getRecentCertificatesAPI } from '@/lib/actions/blockChainService';
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { motion, AnimatePresence } from "framer-motion";
import { maskName } from "@/lib/maskname";

const FormInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
}) => (
  <div className="group">
    <label className="block text-xs font-mono text-gray-500 mb-1 group-focus-within:text-primary transition-colors">
      {label}
    </label>
    <input
      type={type}
      required
      value={value}
      onChange={onChange}
      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-700"
      placeholder={placeholder}
    />
  </div>
);

const IssuerPage: React.FC = () => {
  const { supabase, session, isLoading } = useSupabase();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [aiStatus, setAiStatus] = useState<GemAIStatus>(GemAIStatus.IDLE);
  const [history, setHistory] = useState<CertificateRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CertificateMetadata>({
    name: '',
    description: '',
    institution: '',
    eventDate: '',
    achievment: '',
  });

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/login");
    }
  }, [session, isLoading, router]);

  const refreshHistory = async () => {
    const response = await getRecentCertificatesAPI(1, 4)
    setHistory(response.data);
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  const handleFileSelection = async (selectedFile: File) => {
    setFile(selectedFile);
    if (selectedFile.type.startsWith("image/")) {
      await runAIExtraction(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const runAIExtraction = async (imageFile: File) => {
    setAiStatus(GemAIStatus.ANALYZING);
    try {
      const details = await extractCertificateDetailsAPI(imageFile);
      setFormData((prev) => ({
        ...prev,
        name: details.name || prev.name,
        achievment: details.achievment || prev.achievment,
        eventDate: details.eventDate || prev.eventDate,
        institution: details.institution || prev.institution,
        description: details.description || prev.description,
        // Serial number biasanya tidak diekstrak AI, tapi jika ada bisa ditambahkan
      }));
      setAiStatus(GemAIStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setAiStatus(GemAIStatus.ERROR);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !session) return;

    setIsMinting(true);
    try {
      const hash = await calculateFileHash(file);

      // Generate serial number jika kosong (opsional, tergantung logic Anda)
      // const finalData = { ...formData, serialNumber: formData.serialNumber || generateSerial() };

      await issueCertificateAPI(formData, hash, session.user.id, file);

      setFile(null);
      setFormData({
        name: '',
        description: '',
        institution: '',
        eventDate: '',
        achievment: '',
      });
      setAiStatus(GemAIStatus.IDLE);
      await refreshHistory();
      alert("Sertifikat berhasil diamankan di Blockchain!");
    } catch (error: any) {
      alert(error.message || "Gagal menerbitkan sertifikat");
    } finally {
      setIsMinting(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Dasbor Penerbit
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-mono">
            Node ID: {session?.user?.id?.substring(0, 12)}...
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium animate-pulse w-fit">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Jaringan Aktif
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <GlassCard className="relative overflow-hidden">
            {/* FIX 2: Tambahkan pointer-events-none agar background tidak menghalangi klik */}
            <div className="absolute inset-0 opacity-10 bg-linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px) bg-length:24px_24px pointer-events-none"></div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer group z-10
                ${isDragOver
                  ? "border-primary bg-primary/5 scale-[0.99]"
                  : "border-white/10 hover:border-primary/50 hover:bg-white/5"
                }
              `}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) =>
                  e.target.files && handleFileSelection(e.target.files[0])
                }
              />

              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/10 group-hover:border-primary/50 shadow-lg shadow-black/50">
                      <Upload
                        className={`w-8 h-8 ${isDragOver
                          ? "text-primary"
                          : "text-gray-400 group-hover:text-white"
                          }`}
                      />
                    </div>
                    <p className="text-lg font-medium text-white">
                      Klik atau Seret File ke Sini
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      PDF, PNG, or JPG (Maks 10MB)
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/20 rounded-lg text-primary">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-white">{file.name}</p>
                        <p className="text-xs text-gray-400 font-mono">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setAiStatus(GemAIStatus.IDLE);
                      }}
                      className="p-2 hover:bg-red-500/20 rounded-full text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 h-6 flex justify-center">
                {aiStatus === GemAIStatus.ANALYZING && (
                  <div className="flex items-center gap-2 text-accent text-sm font-mono">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="animate-pulse">
                      Gemini AI sedang membaca data...
                    </span>
                  </div>
                )}
                {aiStatus === GemAIStatus.SUCCESS && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-primary text-sm font-mono"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Data berhasil diekstrak</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Form Input sekarang menggunakan component yang didefinisikan di luar */}
            <form onSubmit={handleMint} className="mt-8 space-y-5 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="Nama Penerima"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nama lengkap penerima"
                />
                <FormInput
                  label="Tanggal Terbit"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) =>
                    setFormData({ ...formData, eventDate: e.target.value })
                  }
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <FormInput
                  label="Judul Sertifikat / Gelar"
                  value={formData.achievment}
                  onChange={(e) =>
                    setFormData({ ...formData, achievment: e.target.value })
                  }
                  placeholder="Contoh: Sarjana Komputer / Sertifikat Kompetensi Web3"
                />

                <FormInput
                  label="Institusi / Penyelenggara"
                  value={formData.institution}
                  onChange={(e) =>
                    setFormData({ ...formData, institution: e.target.value })
                  }
                  placeholder="Nama Universitas atau Lembaga"
                />
              </div>

              <div className="group">
                <label className="block text-xs font-mono text-gray-500 mb-1 group-focus-within:text-primary transition-colors">
                  Deskripsi / Info Tambahan (Nilai/Predikat/No. SK)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 h-28 text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-700"
                  placeholder={"Contoh: IPK 3.80 atau Predikat Sangat Baik"}
                ></textarea>
              </div>

              <div className="pt-4">
                <NeonButton
                  type="submit"
                  disabled={!file || isMinting}
                  isLoading={isMinting}
                  className="w-full py-4 text-lg"
                >
                  {isMinting
                    ? "Mencatat ke Blockchain..."
                    : "Terbitkan & Amankan Sertifikat"}
                </NeonButton>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Sidebar History */}
        <div className="space-y-6">
          <GlassCard className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-white border-b border-white/10 pb-4">
              <History className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-bold">Riwayat Penerbitan</h2>
            </div>

            <div className="grow overflow-y-auto pr-2 space-y-3 max-h-[600px] custom-scrollbar">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 border border-dashed border-white/10 rounded-xl">
                  <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Belum ada riwayat.</p>
                </div>
              ) : (
                history.map((record, i) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="max-w-2/3">
                        <p className="text-sm sm:text-base font-bold text-white group-hover:text-primary transition-colors">
                          {maskName(record.metadata.name)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          {record.metadata.achievment}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          {record.metadata.institution}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${record.isValid ? "bg-green-500/20 text-green-400 border border-green-500/20 shadow-lg shadow-green-900/20" : "bg-red-500/20 text-red-400 border border-red-500/20 shadow-lg shadow-red-900/20"}`}>
                        {record.isValid ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            On-chain
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Error Block
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-2">
                      <Hash className="w-3 h-3 text-gray-600" />
                      <p
                        className="text-[10px] font-mono text-gray-500 truncate w-full"
                        title={record.txHash}
                      >
                        {record.txHash}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default IssuerPage;