"use client";

import React, { useState, useEffect } from "react";
import { History, AlertCircle, CheckCircle, XCircle, Hash, FileText, Layers } from "lucide-react";
import { CertificateRecord } from "@/lib/types";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { useRouter } from "next/navigation";
import { getRecentCertificatesAPI } from "@/lib/actions/blockChainService";
import GlassCard from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { maskName } from "@/lib/maskname";
import SingleIssuer from "@/components/issuer/SingleIssuer";
import BulkIssuer from "@/components/issuer/BulkIssuer";

const IssuerPage: React.FC = () => {
  const { session, isLoading } = useSupabase();
  const router = useRouter();
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [history, setHistory] = useState<CertificateRecord[]>([]);

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/login");
    }
  }, [session, isLoading, router]);

  const refreshHistory = async () => {
    const response = await getRecentCertificatesAPI(1, 5);
    setHistory(response.data);
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

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

      <div className="flex justify-center">
        <div className="bg-white/5 p-1 rounded-xl border border-white/10 inline-flex shadow-lg">
          <button
            onClick={() => setMode('single')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${mode === 'single' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white'}`}
          >
            <FileText className="w-4 h-4" /> Single Upload
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${mode === 'bulk' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white'}`}
          >
            <Layers className="w-4 h-4" /> Bulk Upload
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {mode === 'single' ? (
            <SingleIssuer userId={session?.user?.id || ''} onSuccess={refreshHistory} />
          ) : (
            <BulkIssuer userId={session?.user?.id || ''} onSuccess={refreshHistory} />
          )}
        </div>

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
                          {record.metadata.eventName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          {record.metadata.institution}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${record.isValid ? "bg-green-500/20 text-green-400 border border-green-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"}`}>
                        {record.isValid ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
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