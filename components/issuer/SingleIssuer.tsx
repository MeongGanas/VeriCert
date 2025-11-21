"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, Sparkles, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { CertificateMetadata, GemAIStatus } from "@/lib/types";
import extractCertificateDetailsAPI from "@/lib/actions/geminiServices";
import { calculateFileHash, issueCertificateAPI } from "@/lib/actions/blockChainService";
import FormInput from "@/components/FormInput";
import toast from "react-hot-toast";

interface SingleIssuerProps {
    userId: string;
    onSuccess: () => void;
}

export default function SingleIssuer({ userId, onSuccess }: SingleIssuerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [aiStatus, setAiStatus] = useState<GemAIStatus>(GemAIStatus.IDLE);
    const [enableAutofill, setEnableAutofill] = useState<boolean>(true);

    const [formData, setFormData] = useState<CertificateMetadata>({
        name: '',
        description: '',
        institution: '',
        eventDate: '',
        eventName: '',
        predicate: '',
    });

    const handleFileSelection = async (selectedFile: File) => {
        setFile(selectedFile);
        if (enableAutofill && selectedFile) {
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
                eventName: details.eventName || prev.eventName,
                eventDate: details.eventDate || prev.eventDate,
                institution: details.institution || prev.institution,
                predicate: details.predicate || prev.predicate,
                description: details.description || prev.description,
            }));
            setAiStatus(GemAIStatus.SUCCESS);
        } catch (error) {
            console.error(error);
            setAiStatus(GemAIStatus.ERROR);
        }
    };

    const handleMint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !userId) return;

        setIsMinting(true);
        try {
            const hash = await calculateFileHash(file);
            await issueCertificateAPI(formData, hash, userId, file);

            setFile(null);
            setFormData({ name: '', description: '', institution: '', eventDate: '', eventName: '', predicate: '' });
            setAiStatus(GemAIStatus.IDLE);

            onSuccess();

            toast.success("Sertifikat berhasil diamankan di Blockchain!");
        } catch (error: any) {
            toast.error(error.message || "Gagal menerbitkan sertifikat");
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <GlassCard className="relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px) bg-length:24px_24px pointer-events-none"></div>

            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer group z-10 ${isDragOver ? "border-primary bg-primary/5 scale-[0.99]" : "border-white/10 hover:border-primary/50 hover:bg-white/5"}`}
            >
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])} />

                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/10 group-hover:border-primary/50 shadow-lg shadow-black/50">
                                <Upload className={`w-8 h-8 ${isDragOver ? "text-primary" : "text-gray-400 group-hover:text-white"}`} />
                            </div>
                            <p className="text-lg font-medium text-white">Klik atau Seret File ke Sini</p>
                            <p className="text-sm text-gray-500 mt-2">PDF, PNG, or JPG (Maks 10MB)</p>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/20 rounded-lg text-primary"><FileText className="w-8 h-8" /></div>
                                <div className="text-left">
                                    <p className="font-medium text-white">{file.name}</p>
                                    <p className="text-xs text-gray-400 font-mono">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setFile(null); setAiStatus(GemAIStatus.IDLE); }} className="p-2 hover:bg-red-500/20 rounded-full text-gray-400 hover:text-red-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-6 h-6 flex justify-center">
                    {aiStatus === GemAIStatus.ANALYZING && (
                        <div className="flex items-center gap-2 text-accent text-sm font-mono">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="animate-pulse">Gemini AI sedang membaca data...</span>
                        </div>
                    )}
                    {aiStatus === GemAIStatus.SUCCESS && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-primary text-sm font-mono">
                            <Sparkles className="w-4 h-4" /> <span>Data berhasil diekstrak</span>
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 mt-2 relative z-10">
                <input type="checkbox" checked={enableAutofill} name="enableAutofill" onChange={() => setEnableAutofill(!enableAutofill)} id="enableAutofill" className="w-4 h-4" />
                <label className="block text-xs sm:text-base font-mono text-gray-500 group-focus-within:text-primary transition-colors" htmlFor="enableAutofill">
                    Izinkan AI mengakses dokumen untuk pengisian data otomatis.
                </label>
            </div>

            <form onSubmit={handleMint} className="mt-8 space-y-5 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInput label="Nama Penerima" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nama lengkap penerima" />
                    <FormInput label="Tanggal Terbit" type="date" value={formData.eventDate} onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })} />
                </div>
                <FormInput label="Judul Sertifikat" value={formData.eventName} onChange={(e) => setFormData({ ...formData, eventName: e.target.value })} placeholder="Contoh: Ijazah" />

                <div className="grid sm:grid-cols-2 gap-5">
                    <FormInput label="Predikat" value={formData.predicate} onChange={(e) => setFormData({ ...formData, predicate: e.target.value })} placeholder="Contoh: Sarjana Komputer" />
                    <FormInput label="Institusi / Penyelenggara" value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} placeholder="Nama Universitas" />
                </div>
                <div className="group">
                    <label className="block text-xs font-mono text-gray-500 mb-1 group-focus-within:text-primary transition-colors">
                        Deskripsi / Info Tambahan
                    </label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 h-28 text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-700" placeholder="Contoh: IPK 3.80"></textarea>
                </div>
                <div className="pt-4">
                    <NeonButton type="submit" disabled={!file || isMinting} isLoading={isMinting} className="w-full cursor-pointer">
                        {isMinting ? "Mencatat ke Blockchain..." : "Terbitkan & Amankan Sertifikat"}
                    </NeonButton>
                </div>
            </form>
        </GlassCard>
    );
}