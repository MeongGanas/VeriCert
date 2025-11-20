import { getRecentCertificatesAPI } from "@/lib/actions/blockChainService";
import { CertificateRecord } from "@/lib/types";
import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { CheckCircle, ChevronLeft, ChevronRight, Database, Hash, Loader2, XCircle } from "lucide-react";
import { maskName } from "@/lib/maskname";

export default function Table({ itemVariants }: { itemVariants: Variants }) {
    const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 8;

    const fetchData = async (pageNumber: number) => {
        setLoading(true);
        try {
            const response = await getRecentCertificatesAPI(pageNumber, limit);
            setCertificates(response.data);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const handleNext = () => {
        if (page < totalPages) setPage(prev => prev + 1);
    };

    const handlePrev = () => {
        if (page > 1) setPage(prev => prev - 1);
    };

    return (
        <motion.div variants={itemVariants} className="w-full max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Database className="text-primary h-6 w-6" />
                    Public Ledger Live Feed
                </h2>
                <span className="text-sm text-gray-400 font-mono bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    Syncing...
                </span>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Penerima</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Judul Sertifikat</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">TX Hash</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading Ledger Data...
                                    </td>
                                </tr>
                            ) : certificates.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No records found on chain.</td>
                                </tr>
                            ) : (
                                certificates.map((record) => (
                                    <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-xs font-mono text-gray-500 whitespace-nowrap">
                                            {new Date(record.timestamp).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: '2-digit'
                                            })} <br />
                                            <span className="text-gray-600">{new Date(record.timestamp).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-bold text-white">{maskName(record.metadata.name)}</p>
                                            <p className="text-xs text-gray-500">{record.metadata.institution}</p>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">
                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs border border-primary/20">
                                                {record.metadata.achievment}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-gray-500 group-hover:text-gray-300 transition-colors">
                                                <Hash className="w-3 h-3" />
                                                <span className="text-xs font-mono truncate max-w-[120px] cursor-help" title={record.txHash}>
                                                    {record.txHash}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border ${record.isValid
                                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                : "bg-red-500/10 text-red-400 border-red-500/20"
                                                }`}>
                                                {record.isValid ? (
                                                    <><CheckCircle className="w-3 h-3 mr-1" /> Valid</>
                                                ) : (
                                                    <><XCircle className="w-3 h-3 mr-1" /> Error</>
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/5">
                    <p className="text-xs text-gray-500">
                        Showing page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrev}
                            disabled={page === 1 || loading}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 text-white transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={page === totalPages || loading}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 text-white transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}