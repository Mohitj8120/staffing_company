"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { FiTarget, FiUsers, FiAward, FiArrowRight, FiShield } from "react-icons/fi"

const stats = [
    { label: "Placements", value: "500+" },
    { label: "Direct HR Ties", value: "120+" },
    { label: "Successful H1B/OPTs", value: "1000+" },
    { label: "Interview Pass Rate", value: "100%" }
]

const values = [
    {
        title: "Mission-Driven",
        icon: <FiTarget className="text-3xl text-purple-600" />,
        desc: "Bridging the gap between ambitious global talent and elite US-based organizations."
    },
    {
        title: "Technological Edge",
        icon: <FiAward className="text-3xl text-blue-600" />,
        desc: "Using advanced AI proxy technology to ensure our candidates never stumble in technical rounds."
    },
    {
        title: "Direct Connect",
        icon: <FiUsers className="text-3xl text-emerald-600" />,
        desc: "Bypassing generic application queues via direct, internal HR partnerships."
    }
]

export default function AboutUsContent() {
    return (
        <div className="w-full bg-slate-50 min-h-screen font-sans overflow-hidden">
            
            {/* HERO SECTION */}
            <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 bg-gradient-to-br from-gray-900 via-purple-950 to-blue-950 text-white mx-4 md:mx-8 rounded-[40px] mt-12 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                
                {/* Glow Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 blur-[130px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 blur-[130px] rounded-full" />
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight"
                    >
                        Redefining Reality in <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Career Placement</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed mb-12"
                    >
                        We don't just "apply" for jobs. We engineer outcomes using a mix of deep HR networks and world-class AI Proxy technology.
                    </motion.p>
                </div>
            </section>

            {/* MISSION & VISION */}
            <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission is <span className="text-purple-600 italic font-serif">Absolute</span>.</h2>
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                        Averion Careers was founded on a simple realization: the traditional job application process is broken for international candidates. Between ATS filters and the high bar of technical interviews, brilliant talent often goes overlooked.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        We built a system that bypasses these hurdles. From direct HR tie-ups to our invisible AI Proxy Tool, we give you the tools to command the outcome you deserve.
                    </p>
                </motion.div>
                
                <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200 border border-gray-100 flex flex-col items-center justify-center text-center group hover:bg-purple-600 transition-colors duration-500"
                        >
                            <span className="text-3xl font-extrabold text-purple-600 mb-2 group-hover:text-white">{stat.value}</span>
                            <span className="text-sm font-semibold text-gray-500 group-hover:text-purple-200 uppercase tracking-wider">{stat.label}</span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CORE VALUES */}
            <section className="py-24 bg-white border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">What Sets Us Apart</h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">The core pillars that make Averion Careers the #1 choice for placement success.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((val, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="p-10 rounded-3xl bg-slate-50 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 group"
                            >
                                <div className="mb-6 bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    {val.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{val.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{val.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* THE SECRET SAUCE - AI PROXY TOOL */}
            <section className="py-24 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto bg-gray-900 rounded-[40px] p-10 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full" />
                    
                    <div className="flex-1 text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 font-bold mb-6 text-sm uppercase tracking-widest border border-blue-500/30"
                        >
                            <FiShield /> Built for Stealth
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                            The AI Proxy Edge
                        </h2>
                        <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                            We developed the industry's most advanced, 100% invisible AI proxy tool. It runs silently, feeding you real-time technical answers directly from our expert engine, ensuring you clear every technical round with ease.
                        </p>
                        <Link href="/proxy-tool" className="bg-white text-gray-900 px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all flex items-center gap-3 mx-auto md:mx-0 shadow-[0_0_30px_rgba(255,255,255,0.2)] w-fit">
                            Learn about the Proxy <FiArrowRight />
                        </Link>
                    </div>
                    
                    <div className="flex-1 relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                            className="w-72 h-72 md:w-96 md:h-96 border-4 border-dashed border-blue-500/30 rounded-full flex items-center justify-center relative"
                        >
                            <div className="absolute w-20 h-20 bg-blue-500 rounded-full blur-3xl opacity-50" />
                            <div className="w-[80%] h-[80%] bg-blue-900/40 backdrop-blur-xl rounded-full border border-blue-500/50 flex flex-col items-center justify-center p-12 overflow-hidden shadow-inner">
                                <span className="text-5xl font-black text-white mb-2">100%</span>
                                <span className="text-blue-300 font-bold uppercase tracking-widest text-[10px] text-center">Invisible Success Rate</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    )
}
