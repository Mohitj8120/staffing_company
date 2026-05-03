"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HiOutlineSparkles, HiShieldCheck } from "react-icons/hi"

export default function LeadCapturePopup() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "+1 ",
        visa: ""
    })

    useEffect(() => {
        // Give a slight delay before showing the popup for dramatic effect and to avoid instant block
        const timer = setTimeout(() => {
            const hasSubmitted = localStorage.getItem("averion_lead_captured")
            // Temporarily ignore lockdown if running in dev and already closed once
            // Actually, we enforce it to be true to prompt unless submitted.
            if (!hasSubmitted) {
                setIsOpen(true)
                // Lock body scroll
                document.body.style.overflow = "hidden"
            }
        }, 1500)
        
        return () => clearTimeout(timer)
    }, [])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const payload = { ...formData }

            const response = await fetch("/api/submit-lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                // Success!
                localStorage.setItem("averion_lead_captured", "true")
                setIsOpen(false)
                document.body.style.overflow = "auto" // Restore scrolling
            } else {
                alert("Something went wrong. Please try again.")
            }
        } catch (error) {
            console.error(error)
            alert("Error connecting to server. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop rendering */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative w-full max-w-lg bg-[#0b132b] shadow-2xl rounded-3xl overflow-hidden border border-white/10"
                >
                    {/* Glowing Accent */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    
                    {/* Optional inner subtle glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-purple-500/20 blur-[60px] pointer-events-none" />

                    <div className="p-8 md:p-10 relative z-10">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.3)]">
                                <HiOutlineSparkles className="text-3xl text-purple-400" />
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                                Complete your profile
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Please fill in a few details before continuing to the platform.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name <span className="text-red-400">*</span></label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    required
                                    autoComplete="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-[#111836] border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 shadow-inner transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>

                            {/* Email Address */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Work Email <span className="text-red-400">*</span></label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    required
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-[#111836] border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 shadow-inner transition-colors"
                                    placeholder="john@example.com"
                                />
                            </div>

                            {/* Mobile Number */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Mobile Number <span className="text-red-400">*</span></label>
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    required
                                    autoComplete="tel-national"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-[#111836] border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 shadow-inner transition-colors"
                                    placeholder="+1 555-123-4567"
                                />
                            </div>

                            {/* Visa Dropdown */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Visa Status <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <select 
                                        name="visa"
                                        required
                                        value={formData.visa}
                                        onChange={handleChange}
                                        className="w-full bg-[#111836] border border-white/5 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 shadow-inner transition-colors appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled hidden>Select an option...</option>
                                        <option value="OPT">OPT</option>
                                        <option value="STEM OPT">STEM OPT</option>
                                        <option value="H1B">H1B</option>
                                        <option value="H4 EAD / EAD">H4 EAD / EAD</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {/* Custom Select Arrow */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <>Access Platform</>
                                )}
                            </button>
                            
                            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                                <HiShieldCheck className="text-gray-400 text-sm" /> Ensure accurate information to proceed.
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
