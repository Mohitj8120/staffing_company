"use client"

import { motion } from "framer-motion"
import { FiFileText, FiClock, FiShield } from "react-icons/fi"

export default function LegalContent({ title, lastUpdated, children }) {
    return (
        <div className="w-full bg-slate-50 min-h-screen font-sans pt-32 pb-24">
            <div className="max-w-4xl mx-auto px-6">
                
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl shadow-gray-200 border border-gray-100 mb-12 relative overflow-hidden"
                >
                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-50" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-600 font-bold text-xs uppercase tracking-widest mb-4">
                                <FiShield /> Official Policy
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
                                {title}
                            </h1>
                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                <FiClock /> Last Updated: {lastUpdated}
                            </div>
                        </div>
                        <div className="hidden md:flex w-20 h-20 bg-slate-50 rounded-3xl items-center justify-center text-gray-400">
                            <FiFileText size={40} />
                        </div>
                    </div>
                </motion.div>

                {/* Content Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="prose prose-lg prose-slate max-w-none bg-white rounded-[32px] p-8 md:p-16 shadow-xl shadow-gray-100 border border-gray-100"
                >
                    <div className="legal-content">
                        {children}
                    </div>
                </motion.div>

                {/* Footer Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 text-center text-gray-400 text-sm"
                >
                    If you have any questions regarding our policies, please contact us at <a href="mailto:legal@careerlaunch.io" className="text-purple-600 font-bold hover:underline">legal@careerlaunch.io</a>
                </motion.div>
            </div>

            <style jsx global>{`
                .legal-content h2 {
                    color: #111827;
                    font-weight: 800;
                    font-size: 1.875rem;
                    margin-top: 2.5rem;
                    margin-bottom: 1.25rem;
                    border-left: 4px solid #9333ea;
                    padding-left: 1rem;
                }
                .legal-content h3 {
                    color: #1f2937;
                    font-weight: 700;
                    font-size: 1.25rem;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                }
                .legal-content p {
                    color: #4b5563;
                    line-height: 1.8;
                    margin-bottom: 1.5rem;
                }
                .legal-content ul, .legal-content ol {
                    margin-bottom: 1.5rem;
                    padding-left: 1.5rem;
                    color: #4b5563;
                }
                .legal-content li {
                    margin-bottom: 0.5rem;
                }
                .legal-content strong {
                    color: #111827;
                }
            `}</style>
        </div>
    )
}
