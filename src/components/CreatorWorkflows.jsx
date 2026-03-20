"use client"

import React from "react"
import { motion } from "framer-motion"

function Pill({ x, y, w, text, outlined }) {
    return (
        <div
            className={`absolute flex items-center justify-center rounded-3xl text-sm font-medium transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer ${outlined
                    ? "border-2 border-[#5b7fc4] text-[#1d293d] shadow-sm bg-transparent"
                    : "border border-[#e2e8f0] text-[#1d293d] shadow-sm bg-white"
                }`}
            style={{ left: x, top: y, width: w, height: 44 }}
        >
            {text}
        </div>
    )
}

export default function CreatorWorkflows() {
    return (
        <section id="workflows" className="py-16 md:py-24 bg-gradient-to-br from-[#d9e5ff] via-[#e6efff] to-[#f4f7ff] rounded-3xl md:rounded-[40px] m-4 md:m-8 overflow-hidden font-sans border border-white/50 shadow-sm relative">

            {/* Decorative top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-white/40 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 relative z-10">

                {/* Title */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-[#0f172a] tracking-tight">
                        Guaranteed <span className="font-serif italic text-blue-900 font-medium whitespace-nowrap md:whitespace-normal">Placement Workflows</span>
                    </h2>
                </div>

                {/* Flowchart Area - Scrollable on small screens */}
                <div className="w-full overflow-x-auto pb-8 hide-scrollbar">
                    <div className="relative w-[750px] h-[380px] mx-auto shrink-0">

                        {/* SVG Connectors */}
                        <svg width="100%" height="100%" viewBox="0 0 750 380" className="absolute inset-0 pointer-events-none">

                            {/* Gap 1 (Dashed lines connecting Col 1 to Col 2) */}
                            {/* x goes from col 1 right edge (140) to col 2 left edge (230) */}
                            <path
                                d="M 140 120 L 160 120 M 140 180 L 160 180 M 140 240 L 160 240 M 160 120 L 160 240 M 160 180 L 210 180 M 210 140 L 210 220 M 210 140 L 230 140 M 210 220 L 230 220"
                                stroke="#8ba6d4"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                                fill="none"
                            />

                            {/* Gap 2 (Solid and Dashed lines connecting Col 2 to Col 3) */}
                            {/* Col 2 Right edge (450), Col 3 Left edge (540) */}
                            {/* Solid part connecting the two Col 2 boxes into one main line */}
                            <path
                                d="M 450 140 L 470 140 M 450 220 L 470 220 M 470 140 L 470 220 M 470 180 L 495 180"
                                stroke="#6086c8"
                                strokeWidth="1.5"
                                fill="none"
                            />
                            {/* Dashed part branching to the 5 Col 3 boxes */}
                            <path
                                d="M 495 180 L 520 180 M 520 60 L 520 300 M 520 60 L 540 60 M 520 120 L 540 120 M 520 180 L 540 180 M 520 240 L 540 240 M 520 300 L 540 300"
                                stroke="#8ba6d4"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                                fill="none"
                            />
                        </svg>

                        {/* Column 1 Pills */}
                        <Pill x={0} y={98} w={140} text="Resume Sync" />
                        <Pill x={0} y={158} w={140} text="HR Pitching" />
                        <Pill x={0} y={218} w={140} text="ATS Bypass" />
                        <span className="absolute text-[#64748b] text-[10px] w-[140px] text-center font-medium tracking-wide uppercase" style={{ left: 0, top: 280 }}>
                            Prepare & Submit
                        </span>

                        {/* Column 2 Pills */}
                        <Pill x={230} y={118} w={220} text="Direct Interview Invites" outlined />
                        <Pill x={230} y={198} w={220} text="Invisible AI Proxy Tool" outlined />
                        <span className="absolute text-[#64748b] text-[10px] w-[220px] text-center font-medium tracking-wide uppercase" style={{ left: 230, top: 260 }}>
                            Clear Every Technical Round
                        </span>

                        {/* Column 3 Pills */}
                        <Pill x={540} y={38} w={180} text="Offer Letters" />
                        <Pill x={540} y={98} w={180} text="Salary Negotiation" />
                        <Pill x={540} y={158} w={180} text="H1B / OPT Support" />
                        <Pill x={540} y={218} w={180} text="Background Checks" />
                        <Pill x={540} y={278} w={180} text="First Day Onboarding" />
                        <span className="absolute text-[#64748b] text-[10px] w-[200px] text-center font-medium tracking-wide uppercase" style={{ left: 530, top: 340 }}>
                            Secure The Final Job
                        </span>

                    </div>
                </div>

                {/* Bottom Call to Action Section */}
                <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl mx-auto mt-8 gap-8 px-4">

                    {/* Left Text */}
                    <div className="md:w-1/2 text-center md:text-left">
                        <h3 className="text-xl md:text-2xl font-bold text-[#0f172a] mb-3">
                            Direct Tie-ups & Proxy Tech Working Together
                        </h3>
                        <p className="text-sm md:text-base text-slate-600 font-medium max-w-sm">
                            Combine our deeply integrated HR network with our invisible AI proxy to secure high-paying tech offers on autopilot.
                        </p>
                    </div>

                    {/* Right 5X Card */}
                    <div className="w-full md:w-[360px] h-auto md:h-[100px] rounded-2xl bg-gradient-to-r from-[#5ca3b8] to-[#4e4db5] flex items-center p-6 text-white shadow-xl hover:scale-105 transition-transform duration-300">
                        <span className="text-5xl font-extrabold mr-5 tracking-tighter drop-shadow-md">5X</span>
                        <p className="text-[13px] leading-tight font-medium text-white/95">
                            Candidates see up to 5X faster job placements when they use our complete Proxy strategy.
                        </p>
                    </div>

                </div>

            </div>
        </section>
    )
}
