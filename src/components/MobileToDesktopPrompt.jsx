"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiMonitor, FiSmartphone, FiArrowRight, FiX } from "react-icons/fi"

export default function MobileToDesktopPrompt() {
    const [showPrompt, setShowPrompt] = useState(false)

    useEffect(() => {
        // Check if device is mobile
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        
        // Check if user already dismissed the prompt
        const hasDismissed = localStorage.getItem("desktopPromptDismissed")

        // If it's a mobile device and hasn't been dismissed, show the prompt
        if (isMobileDevice && !hasDismissed) {
            // Small delay so it doesn't jump scare immediately on load
            const timer = setTimeout(() => {
                setShowPrompt(true)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem("desktopPromptDismissed", "true")
    }

    return (
        <AnimatePresence>
            {showPrompt && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    {/* Dark/Blur Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={handleDismiss}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-white rounded-[32px] w-full max-w-[400px] overflow-hidden shadow-2xl border border-white"
                    >
                        {/* Decorative Top Banner */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 h-32 w-full relative overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                            
                            {/* Icons showing Mobile -> Desktop */}
                            <div className="relative z-10 flex items-center gap-6 text-white/90">
                                <motion.div 
                                    animate={{ y: [0, -5, 0] }} 
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                >
                                    <FiSmartphone className="text-4xl" />
                                </motion.div>
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                >
                                    <FiArrowRight className="text-2xl text-white/50" />
                                </motion.div>
                                <motion.div
                                    animate={{ y: [0, 5, 0] }} 
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
                                >
                                    <FiMonitor className="text-5xl text-white" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="px-6 pt-8 pb-10 text-center relative">
                            {/* Close Button X */}
                            <button 
                                onClick={handleDismiss}
                                className="absolute top-4 right-4 bg-gray-100 text-gray-500 hover:text-gray-900 p-2 rounded-full transition-colors"
                            >
                                <FiX className="text-xl" />
                            </button>

                            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
                                Switch to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Desktop Mode</span>
                            </h2>
                            
                            <p className="text-[15px] md:text-base leading-relaxed text-gray-600 mb-8 max-w-sm mx-auto font-medium">
                                For the absolute best visibility and a premium full-featured layout, please switch your browser to <strong>Desktop Site</strong> from the menu options (⋮).
                            </p>

                            <button
                                onClick={handleDismiss}
                                className="w-full bg-gray-900 hover:bg-black text-white text-lg font-bold py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-transform active:scale-95"
                            >
                                Continue to Website
                            </button>
                            
                            <p className="mt-4 text-xs text-gray-400 font-medium">
                                You can also just continue on mobile view.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
