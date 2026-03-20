
"use client"

import React from "react"
import { motion } from "framer-motion"
import { SiGooglemeet, SiZoom, SiHackerrank, SiLeetcode, SiSlack, SiGithub } from "react-icons/si"
import { BsMicrosoftTeams } from "react-icons/bs"
import { FaCode } from "react-icons/fa"
import { FaGhost } from "react-icons/fa6"

const apps = [
    { name: "Zoom", icon: <SiZoom className="w-7 h-7 text-[#2D8CFF]" />, bg: "from-blue-50 to-blue-100/80" },
    { name: "Teams", icon: <BsMicrosoftTeams className="w-7 h-7 text-[#6264A7]" />, bg: "from-purple-50 to-purple-100/80" },
    { name: "Meet", icon: <SiGooglemeet className="w-7 h-7 text-[#00832D]" />, bg: "from-green-50 to-green-100/80" },
    { name: "HackerRank", icon: <SiHackerrank className="w-7 h-7 text-[#00EA64]" />, bg: "from-emerald-50 to-emerald-100/80" },
    { name: "LeetCode", icon: <SiLeetcode className="w-7 h-7 text-[#FFA116]" />, bg: "from-amber-50 to-orange-100/80" },
    { name: "CoderPad", icon: <FaCode className="w-7 h-7 text-[#1d293d]" />, bg: "from-slate-50 to-slate-200/80" },
    { name: "Slack", icon: <SiSlack className="w-7 h-7 text-[#E01E5A]" />, bg: "from-pink-50 to-pink-100/80" },
    { name: "GitHub", icon: <SiGithub className="w-7 h-7 text-[#181717]" />, bg: "from-gray-50 to-gray-200/80" },
]

export default function Integrations() {

    const orbitRadius = 220  // px – distance from center to icon center

    return (
        <section id="integrations" className="py-16 md:py-28 bg-gradient-to-b from-[#f0f0ff] via-white to-[#f0eeff] m-4 md:m-8 rounded-3xl md:rounded-[40px] shadow-sm border border-white/60 relative overflow-hidden flex flex-col items-center">

            {/* ───── Large soft radial glow behind orbit ───── */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[15%] w-[700px] h-[700px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(200,180,255,0.35) 0%, rgba(220,210,255,0.15) 40%, transparent 70%)" }}
            />

            {/* ───── Typography ───── */}
            <div className="relative z-10 text-center max-w-2xl px-6 mb-20">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-3xl md:text-5xl font-bold text-[#0f172a] mb-2 tracking-tight"
                >
                    100% Invisible across all
                </motion.h2>
                <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className="text-4xl md:text-6xl text-rose-600 font-serif italic mb-6 shadow-rose-500/20"
                >
                    Interview Platforms
                </motion.h3>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-slate-500 font-medium mb-8 text-sm md:text-base leading-relaxed"
                >
                    Our Proxy Tool runs undetected even during full screen sharing.<br className="hidden md:block" />
                    — Perfectly integrated with your entire interview stack.
                </motion.p>
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-gray-900 hover:bg-black text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95"
                >
                    Get Proxy Access
                </motion.button>
            </div>

            {/* ───── Orbit Arena ───── */}
            <div className="relative flex items-center justify-center transform scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 origin-center -my-10 md:my-0" style={{ width: 520, height: 520 }}>

                {/* Outermost decorative ring */}
                <div className="absolute rounded-full border border-gray-200/60" style={{ width: 500, height: 500, top: 10, left: 10 }} />

                {/* Middle decorative ring */}
                <div className="absolute rounded-full border border-gray-200/40" style={{ width: 360, height: 360, top: 80, left: 80 }} />

                {/* Inner glow ring */}
                <div className="absolute rounded-full" style={{ width: 260, height: 260, top: 130, left: 130, background: "radial-gradient(circle, rgba(190,170,255,0.18) 0%, transparent 70%)" }} />

                {/* Innermost decorative ring */}
                <div className="absolute rounded-full border border-gray-200/30" style={{ width: 220, height: 220, top: 150, left: 150 }} />

                {/* ───── Central Logo ───── */}
                <div className="absolute z-20 flex items-center justify-center" style={{ width: 110, height: 110, top: 205, left: 205 }}>
                    {/* Multi-layer glow */}
                    <div className="absolute inset-[-20px] rounded-full bg-gradient-to-tr from-rose-200/40 via-purple-200/40 to-blue-200/40 blur-2xl" />
                    <div className="absolute inset-[-8px] rounded-3xl bg-white/60 blur-md" />
                    <div className="w-full h-full bg-slate-900 shadow-2xl rounded-3xl flex items-center justify-center relative border border-white/80"
                        style={{ boxShadow: "0 8px 40px rgba(225,29,72,0.25), 0 2px 10px rgba(0,0,0,0.1)" }}
                    >
                        <FaGhost className="w-12 h-12 text-rose-500 drop-shadow-lg" />
                    </div>
                </div>

                {/* ───── Rotating orbit track with icons ───── */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                    className="absolute"
                    style={{ width: 500, height: 500, top: 10, left: 10 }}
                >
                    {apps.map((app, i) => {
                        const angle = (i * 360) / apps.length
                        return (
                            <div
                                key={i}
                                className="absolute"
                                style={{
                                    width: 56,
                                    height: 56,
                                    top: "50%",
                                    left: "50%",
                                    marginLeft: -28,
                                    marginTop: -28,
                                    transform: `rotate(${angle}deg) translateY(-${orbitRadius}px)`,
                                }}
                            >
                                {/* Counter-rotate the static angle */}
                                <div style={{ transform: `rotate(${-angle}deg)` }} className="w-full h-full">
                                    {/* Counter-rotate the continuous orbit animation */}
                                    <motion.div
                                        animate={{ rotate: -360, rotateY: [0, 0, -360, -360, 0, 0] }}
                                        transition={{
                                            rotate: { repeat: Infinity, duration: 30, ease: "linear" },
                                            rotateY: {
                                                duration: apps.length * 1,
                                                delay: i * 1,
                                                repeat: Infinity,
                                                repeatDelay: 0,
                                                times: [0, 0.02, 0.08, 0.10, 0.16, 1],
                                                ease: "easeInOut",
                                            },
                                        }}
                                        className={`w-full h-full bg-gradient-to-br ${app.bg} backdrop-blur-sm shadow-lg border border-white/70 rounded-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300`}
                                        style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)", perspective: 600 }}
                                    >
                                        {app.icon}
                                    </motion.div>
                                </div>
                            </div>
                        )
                    })}
                </motion.div>

                {/* Subtle connecting lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.12]" viewBox="0 0 520 520">
                    {apps.map((_, i) => {
                        const angle = ((i * 360) / apps.length - 90) * (Math.PI / 180)
                        const cx = 260
                        const cy = 260
                        const ix = cx + orbitRadius * Math.cos(angle)
                        const iy = cy + orbitRadius * Math.sin(angle)
                        return <line key={i} x1={cx} y1={cy} x2={ix} y2={iy} stroke="#94a3b8" strokeWidth="0.8" />
                    })}
                </svg>

            </div>

        </section>
    )
}
