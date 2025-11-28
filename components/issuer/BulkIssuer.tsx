"use client";

import React, { useState, useRef, useEffect } from "react";
import { Layers, Loader2, CheckCircle, XCircle, File, Trash2, Hash, Save, Eye, X } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { CertificateMetadata } from "@/lib/types";
import extractCertificateDetailsAPI from "@/lib/actions/geminiServices";
import { calculateFileHash, issueCertificateAPI } from "@/lib/actions/blockChainService";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

interface BulkItem {
    id: string;
    file: File;
    status: 'extracting' | 'review' | 'issuing' | 'success' | 'error';
    metadata: CertificateMetadata;
    message?: string;
    txHash?: string;
}

interface BulkIssuerProps {
    userId: string;
    onSuccess: () => void;
}

export default function BulkIssuer({ userId, onSuccess }: BulkIssuerProps) {
    const bulkInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [bulkQueue, setBulkQueue] = useState<BulkItem[]>([]);
    const [isBulkIssuing, setIsBulkIssuing] = useState(false);
    const [bulkProgress, setBulkProgress] = useState(0);

    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (previewFile) {
            const url = URL.createObjectURL(previewFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [previewFile]);

    const handleBulkFiles = async (files: File[]) => {
        const newItems: BulkItem[] = files.map(f => ({
            id: Math.random().toString(36).substring(7),
            file: f,
            status: 'extracting',
            metadata: {
                name: '',
                institution: '',
                eventName: '',
                predicate: '',
                eventDate: new Date().toISOString().split('T')[0],
                description: 'Bulk Upload'
            }
        }));

        setBulkQueue(prev => [...prev, ...newItems]);
        newItems.forEach(item => processExtraction(item));
    };

    const processExtraction = async (item: BulkItem) => {
        try {
            let aiDetails: Partial<CertificateMetadata> = {};
            try {
                if (item.file.type.startsWith('image/') || item.file.type === 'application/pdf') {
                    aiDetails = await extractCertificateDetailsAPI(item.file);
                }
            } catch (e) {
                console.warn("AI fail", e);
            }

            setBulkQueue(prev => prev.map(p => {
                if (p.id !== item.id) return p;
                return {
                    ...p,
                    status: 'review',
                    metadata: {
                        ...p.metadata,
                        name: aiDetails.name || item.file.name.replace(/\.[^/.]+$/, ""),
                        eventName: aiDetails.eventName || "title",
                        predicate: aiDetails.predicate || "predikat",
                        institution: aiDetails.institution || "Unknown Institution",
                        eventDate: aiDetails.eventDate || p.metadata.eventDate,
                        description: aiDetails.description || p.metadata.description
                    }
                };
            }));
        } catch (error) {
            setBulkQueue(prev => prev.map(p => p.id === item.id ? { ...p, status: 'review' } : p));
        }
    };

    const handleBulkChange = (id: string, field: keyof CertificateMetadata, value: string) => {
        setBulkQueue(prev => prev.map(item => {
            if (item.id !== id) return item;
            return {
                ...item,
                metadata: { ...item.metadata, [field]: value }
            };
        }));
    };

    const issueBulkItems = async () => {
        if (!userId) return;
        setIsBulkIssuing(true);
        setBulkProgress(0);

        const itemsToIssue = bulkQueue.filter(i => i.status === 'review');
        let processedCount = 0;

        for (const item of itemsToIssue) {
            setBulkQueue(prev => prev.map(p => p.id === item.id ? { ...p, status: 'issuing' } : p));

            try {
                const hash = await calculateFileHash(item.file);
                const finalMeta = { ...item.metadata };
                if (!finalMeta.name) finalMeta.name = "Recipient";

                const result = await issueCertificateAPI(finalMeta, hash, userId, item.file);

                setBulkQueue(prev => prev.map(p => p.id === item.id ? {
                    ...p,
                    status: 'success',
                    txHash: result.txHash
                } : p));

            } catch (error: any) {
                setBulkQueue(prev => prev.map(p => p.id === item.id ? {
                    ...p,
                    status: 'error',
                    message: error.message
                } : p));
                toast.error(error.message || "Proses upload gagal!");
            }

            processedCount++;
            setBulkProgress((processedCount / itemsToIssue.length) * 100);
        }

        setIsBulkIssuing(false);
        onSuccess();
        toast.success("Proses batch selesai!");
    };

    const removeItem = (id: string) => {
        setBulkQueue(prev => prev.filter(i => i.id !== id));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files) {
            handleBulkFiles(Array.from(e.dataTransfer.files));
        }
    };

    return (
        <>
            <GlassCard className="relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px) bg-length:24px_24px pointer-events-none"></div>

                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => bulkInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer z-10 mb-6 ${isDragOver ? "border-primary bg-primary/5" : "border-white/10 hover:border-primary/50"}`}
                >
                    <input type="file" ref={bulkInputRef} className="hidden" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => e.target.files && handleBulkFiles(Array.from(e.target.files))} />
                    <Layers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-base font-medium text-white">Drop banyak file di sini</p>
                    <p className="text-xs text-gray-500">Kami akan mengekstrak data secara otomatis menggunakan AI</p>
                </div>

                <div className="space-y-4 mb-6 max-h-[600px] overflow-y-auto custom-scrollbar relative z-10 px-1">
                    {bulkQueue.length === 0 && (
                        <p className="text-center text-gray-500 text-sm py-8 border border-white/5 rounded-lg bg-white/5">Antrean kosong. Upload file untuk memulai.</p>
                    )}

                    {bulkQueue.map((item) => (
                        <div key={item.id} className={`relative bg-white/5 p-4 rounded-xl border transition-all ${item.status === 'error' ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 hover:border-white/20'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-black/40 rounded-lg border border-white/10">
                                        <File className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white truncate" title={item.file.name}>{item.file.name}</p>
                                        <p className="text-[10px] text-gray-500">{(item.file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPreviewFile(item.file)}
                                        className="p-1.5 hover:bg-primary/20 rounded-md text-gray-400 hover:text-primary transition-colors"
                                        title="Preview File"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>

                                    {item.status === 'extracting' && <span className="text-xs text-accent flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> AI Extracting...</span>}
                                    {item.status === 'issuing' && <span className="text-xs text-primary flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Minting...</span>}
                                    {item.status === 'success' && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Done</span>}
                                    {item.status === 'error' && <span className="text-xs text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> Failed</span>}

                                    {item.status !== 'issuing' && (
                                        <button onClick={() => removeItem(item.id)} className="p-1.5 hover:bg-red-500/20 rounded-md text-gray-500 hover:text-red-400 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {(item.status === 'review' || item.status === 'issuing' || item.status === 'success' || item.status === 'error') && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="col-span-2 md:col-span-1 space-y-1">
                                        <label className="text-[10px] text-gray-500 font-mono">Judul Kegiatan / Sertifikat</label>
                                        <input
                                            disabled={item.status === 'success' || item.status === 'issuing'}
                                            value={item.metadata.eventName || ""}
                                            onChange={(e) => handleBulkChange(item.id, 'eventName', e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:border-primary/50 outline-none disabled:opacity-50"
                                            placeholder="Nama Event"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1 space-y-1">
                                        <label className="text-[10px] text-gray-500 font-mono">Predikat / Pencapaian</label>
                                        <input
                                            disabled={item.status === 'success' || item.status === 'issuing'}
                                            value={item.metadata.predicate || ""}
                                            onChange={(e) => handleBulkChange(item.id, 'predicate', e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:border-primary/50 outline-none disabled:opacity-50"
                                            placeholder="Juara 1 / Peserta"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 font-mono">Nama Penerima</label>
                                        <input
                                            disabled={item.status === 'success' || item.status === 'issuing'}
                                            value={item.metadata.name}
                                            onChange={(e) => handleBulkChange(item.id, 'name', e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:border-primary/50 outline-none disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 font-mono">Institusi</label>
                                        <input
                                            disabled={item.status === 'success' || item.status === 'issuing'}
                                            value={item.metadata.institution}
                                            onChange={(e) => handleBulkChange(item.id, 'institution', e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:border-primary/50 outline-none disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 font-mono">Tanggal</label>
                                        <input
                                            type="date"
                                            disabled={item.status === 'success' || item.status === 'issuing'}
                                            value={item.metadata.eventDate}
                                            onChange={(e) => handleBulkChange(item.id, 'eventDate', e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:border-primary/50 outline-none disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 font-mono">Deskripsi</label>
                                        <input
                                            disabled={item.status === 'success' || item.status === 'issuing'}
                                            value={item.metadata.description || ""}
                                            onChange={(e) => handleBulkChange(item.id, 'description', e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:border-primary/50 outline-none disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                            )}

                            {item.txHash && (
                                <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded flex items-center gap-2">
                                    <Hash className="w-3 h-3 text-green-400" />
                                    <p className="text-[10px] font-mono text-green-300 truncate">{item.txHash}</p>
                                </div>
                            )}

                            {item.status === "error" && (
                                <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2">
                                    <Hash className="w-3 h-3 text-red-400" />
                                    <p className="text-[10px] font-mono text-red-300 truncate">{item.message}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {bulkQueue.length > 0 && (
                    <div className="relative z-10 border-t border-white/10 pt-4 flex flex-col gap-3">
                        {isBulkIssuing && (
                            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                <div className="bg-primary h-full transition-all duration-300" style={{ width: `${bulkProgress}%` }}></div>
                            </div>
                        )}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setBulkQueue([])}
                                className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white text-xs transition-colors"
                                disabled={isBulkIssuing}
                            >
                                Bersihkan Semua
                            </button>
                            <NeonButton
                                onClick={issueBulkItems}
                                disabled={isBulkIssuing || bulkQueue.filter(i => i.status === 'review').length === 0}
                                isLoading={isBulkIssuing}
                                className="px-6 py-2 text-sm"
                            >
                                {isBulkIssuing ? "Memproses Antrean..." : `Terbitkan (${bulkQueue.filter(i => i.status === 'review').length})`}
                            </NeonButton>
                        </div>
                    </div>
                )}
            </GlassCard>

            <AnimatePresence>
                {previewFile && previewUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setPreviewFile(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-4xl h-[85vh] flex flex-col relative shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/20 rounded-lg">
                                        <File className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">{previewFile.name}</h3>
                                        <p className="text-gray-400 text-xs">{(previewFile.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPreviewFile(null)}
                                    className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 bg-black/50 overflow-hidden flex items-center justify-center p-4">
                                {previewFile.type.startsWith('image/') ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="max-w-full max-h-full object-contain rounded shadow-lg"
                                    />
                                ) : (
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-full rounded bg-white"
                                        title="PDF Preview"
                                    />
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}