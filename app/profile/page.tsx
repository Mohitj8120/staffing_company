"use client"

import { useSession, signIn } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { HiUser, HiShoppingBag, HiShieldCheck, HiArrowRight, HiOutlineSparkles, HiXCircle } from "react-icons/hi"
import { useState } from "react"
import Navbar from "../../src/components/Navbar"
import Footer from "../../src/components/Footer"

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const [isCancelling, setIsCancelling] = useState(false)

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#030014] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 mx-auto border border-white/10">
                        <HiShieldCheck className="text-purple-500 w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Access Restricted</h1>
                    <p className="text-gray-400 mb-8 max-w-sm mx-auto">Please sign in to view your profile and manage your career services.</p>
                    <button 
                        onClick={() => signIn('google')}
                        className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform"
                    >
                        Sign In with Google
                    </button>
                </motion.div>
            </div>
        )
    }

    // Purchases is now empty by default as requested. 
    // In a real implementation, this would be fetched from your database based on session.user.email
    const purchases: any[] = [] 

    return (
        <div className="bg-[#030014] min-h-screen text-white">
            <Navbar />
            
            <main className="max-w-5xl mx-auto pt-40 pb-20 px-6">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Sidebar / User Info */}
                    <div className="lg:col-span-1">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl sticky top-32"
                        >
                            <div className="relative w-24 h-24 mb-6 group">
                                <img 
                                    src={session.user?.image || ""} 
                                    alt="Profile" 
                                    className="w-full h-full rounded-3xl object-cover ring-2 ring-purple-500/20 group-hover:ring-purple-500/50 transition-all duration-500" 
                                />
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-1.5 rounded-xl border-4 border-[#030014]">
                                    <HiShieldCheck className="text-white w-4 h-4" />
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-black mb-1">{session.user?.name}</h2>
                            <p className="text-gray-500 text-sm font-medium mb-8">{session.user?.email}</p>
                            
                            <div className="space-y-2">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 group hover:bg-white/10 transition-colors cursor-pointer">
                                    <HiUser className="text-purple-400" />
                                    <span className="text-sm font-bold">Personal Details</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3 text-purple-400">
                                    <HiShoppingBag />
                                    <span className="text-sm font-bold">My Services</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-3xl font-black tracking-tight">Active Services</h3>
                                <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    {purchases.length} Active
                                </span>
                            </div>

                            {purchases.length > 0 ? (
                                <div className="space-y-4">
                                    {purchases.map((item) => (
                                        <div 
                                            key={item.id}
                                            className="group relative p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-500"
                                        >
                                            <div className="flex items-center justify-between gap-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">
                                                        {item.icon}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black mb-1">{item.name}</h4>
                                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Active since {item.date}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black mb-1">{item.price}</p>
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                                                <div className="flex gap-4">
                                                    <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">View Contract</button>
                                                </div>
                                                
                                                {item.type === 'monthly' ? (
                                                    <button 
                                                        onClick={() => setIsCancelling(true)}
                                                        className="flex items-center gap-2 text-xs font-black text-red-400 hover:text-red-300 transition-colors group/link"
                                                    >
                                                        Stop Subscription
                                                        <HiXCircle className="group-hover/link:scale-110 transition-transform" />
                                                    </button>
                                                ) : (
                                                    <button className="flex items-center gap-2 text-xs font-black text-gray-500 cursor-not-allowed">
                                                        Lifetime Access
                                                        <HiShieldCheck />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                                    <HiShoppingBag className="text-gray-600 w-16 h-16 mb-4" />
                                    <p className="text-gray-500 font-bold">You haven't purchased any packages yet.</p>
                                    <p className="text-gray-600 text-xs mt-2 uppercase tracking-widest">Select a plan from the pricing section to get started.</p>
                                </div>
                            )}

                            {/* Info Box instead of Upgrade */}
                            <div className="mt-12 p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                                        <HiOutlineSparkles className="text-purple-400" />
                                        Your Career Dashboard
                                    </h4>
                                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                                        Welcome to your professional portal. Here you can track your interview credits, placement status, and manage your active subscriptions. Our team is working 24/7 to secure your next big role.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Cancellation Modal Placeholder */}
            <AnimatePresence>
                {isCancelling && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6"
                    >
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCancelling(false)} />
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#0c0c1e] border border-white/10 p-10 rounded-[3rem] max-w-md w-full relative z-10 shadow-2xl"
                        >
                            <h3 className="text-2xl font-black mb-4">Stop Subscription?</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed">Stopping your monthly subscription will pause your HR marketing and placement assistance at the end of the current billing cycle.</p>
                            <div className="flex gap-4">
                                <button onClick={() => setIsCancelling(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-colors">Keep it</button>
                                <button className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-colors">Yes, Stop</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    )
}
