// import React, { useState, useEffect } from 'react';
// import { Upload, FileText, CheckCircle, Sparkles, Loader2, AlertCircle } from 'lucide-react';
// import { CertificateMetadata, GemAIStatus, CertificateRecord } from '@/lib/types';

// export const IssuerDashboard: React.FC = () => {
//     const [file, setFile] = useState<File | null>(null);
//     const [isMinting, setIsMinting] = useState(false);
//     const [aiStatus, setAiStatus] = useState<GemAIStatus>(GemAIStatus.IDLE);
//     const [history, setHistory] = useState<CertificateRecord[]>([]);

//     // Form State
//     const [formData, setFormData] = useState<CertificateMetadata>({
//         studentName: '',
//         studentId: '',
//         institution: '',
//         graduationDate: '',
//         degree: '',
//         description: ''
//     });

//     useEffect(() => {
//         setHistory(getIssuedCertificates().reverse());
//     }, [isMinting]);

//     const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             const selectedFile = e.target.files[0];
//             setFile(selectedFile);

//             if (selectedFile.type.startsWith('image/')) {
//                 await runAIExtraction(selectedFile);
//             }
//         }
//     };

//     const runAIExtraction = async (imageFile: File) => {
//         setAiStatus(GemAIStatus.ANALYZING);
//         try {
//             const details = await extractCertificateDetails(imageFile);
//             setFormData(prev => ({
//                 ...prev,
//                 ...details
//             }));
//             setAiStatus(GemAIStatus.SUCCESS);
//         } catch (error) {
//             console.error(error);
//             setAiStatus(GemAIStatus.ERROR);
//         }
//     };

//     const handleMint = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!file) return;

//         setIsMinting(true);
//         try {
//             const hash = await calculateFileHash(file);
//             await issueCertificateOnChain(formData, hash);

//             setFile(null);
//             setFormData({
//                 studentName: '',
//                 studentId: '',
//                 institution: '',
//                 graduationDate: '',
//                 degree: '',
//                 description: ''
//             });
//             setAiStatus(GemAIStatus.IDLE);
//             alert("Certificate successfully anchored to the blockchain!");
//         } catch (error: any) {
//             alert(error.message || "Failed to issue certificate");
//         } finally {
//             setIsMinting(false);
//         }
//     };

//     return (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//             <div className="mb-8">
//                 <h1 className="text-2xl font-bold text-gray-900">Issuer Dashboard</h1>
//                 <p className="text-gray-600 mt-1">Register new academic credentials on the blockchain.</p>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 <div className="space-y-6">
//                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//                         <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
//                             <Upload className="w-5 h-5 text-primary-600" />
//                             Upload Certificate
//                         </h2>

//                         <div className="mb-6">
//                             <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${file ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}>
//                                 <input
//                                     type="file"
//                                     id="cert-upload"
//                                     className="hidden"
//                                     accept=".pdf,.png,.jpg,.jpeg"
//                                     onChange={handleFileChange}
//                                 />
//                                 <label htmlFor="cert-upload" className="cursor-pointer flex flex-col items-center">
//                                     {file ? (
//                                         <>
//                                             <FileText className="w-12 h-12 text-primary-600 mb-2" />
//                                             <span className="font-medium text-gray-900">{file.name}</span>
//                                             <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
//                                         </>
//                                     ) : (
//                                         <>
//                                             <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
//                                                 <Upload className="w-6 h-6 text-gray-400" />
//                                             </div>
//                                             <span className="text-gray-900 font-medium">Click to upload</span>
//                                             <span className="text-gray-500 text-sm mt-1">PDF, PNG, or JPG (Max 10MB)</span>
//                                             <div className="mt-2 inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
//                                                 <Sparkles className="w-3 h-3 mr-1" />
//                                                 AI Auto-fill available for Images
//                                             </div>
//                                         </>
//                                     )}
//                                 </label>
//                             </div>

//                             {aiStatus === GemAIStatus.ANALYZING && (
//                                 <div className="mt-3 flex items-center text-sm text-purple-600 animate-pulse">
//                                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                                     Gemini is extracting details...
//                                 </div>
//                             )}
//                             {aiStatus === GemAIStatus.SUCCESS && (
//                                 <div className="mt-3 flex items-center text-sm text-green-600">
//                                     <Sparkles className="w-4 h-4 mr-2" />
//                                     Details auto-filled by AI
//                                 </div>
//                             )}
//                         </div>

//                         <form onSubmit={handleMint} className="space-y-4">
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
//                                     <input
//                                         type="text"
//                                         required
//                                         value={formData.studentName}
//                                         onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
//                                         placeholder="e.g. John Doe"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Student ID / NIM</label>
//                                     <input
//                                         type="text"
//                                         required
//                                         value={formData.studentId}
//                                         onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
//                                         placeholder="e.g. 12345678"
//                                     />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
//                                 <input
//                                     type="text"
//                                     required
//                                     value={formData.institution}
//                                     onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
//                                     placeholder="e.g. Institute of Technology"
//                                 />
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
//                                     <input
//                                         type="text"
//                                         required
//                                         value={formData.degree}
//                                         onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
//                                         placeholder="e.g. B.S. Computer Science"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Date</label>
//                                     <input
//                                         type="text"
//                                         required
//                                         value={formData.graduationDate}
//                                         onChange={(e) => setFormData({ ...formData, graduationDate: e.target.value })}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
//                                         placeholder="YYYY-MM-DD"
//                                     />
//                                 </div>
//                             </div>

//                             <button
//                                 type="submit"
//                                 disabled={!file || isMinting}
//                                 className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                             >
//                                 {isMinting ? (
//                                     <>
//                                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                                         Hashing & Minting...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <CheckCircle className="w-4 h-4 mr-2" />
//                                         Issue to Blockchain
//                                     </>
//                                 )}
//                             </button>
//                         </form>
//                     </div>
//                 </div>

//                 {/* Right Column: Recent History */}
//                 <div>
//                     <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Issued</h2>
//                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                         {history.length === 0 ? (
//                             <div className="p-8 text-center text-gray-500">
//                                 <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
//                                 <p>No certificates issued yet.</p>
//                             </div>
//                         ) : (
//                             <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
//                                 {history.map((record) => (
//                                     <li key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
//                                         <div className="flex justify-between items-start">
//                                             <div>
//                                                 <p className="text-sm font-medium text-gray-900">{record.metadata.studentName}</p>
//                                                 <p className="text-xs text-gray-500">{record.metadata.degree}</p>
//                                                 <p className="text-xs text-gray-400 mt-1">{record.metadata.institution}</p>
//                                             </div>
//                                             <div className="text-right">
//                                                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
//                                                     On-chain
//                                                 </span>
//                                                 <p className="text-xs text-gray-400 mt-1 font-mono" title={record.txHash}>
//                                                     Tx: {record.txHash.substring(0, 6)}...{record.txHash.substring(record.txHash.length - 4)}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </li>
//                                 ))}
//                             </ul>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };