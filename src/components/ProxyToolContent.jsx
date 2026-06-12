"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { FiCheckCircle, FiShield, FiEyeOff, FiMonitor, FiArrowRight, FiUnlock } from "react-icons/fi"
import { BsCpuFill, BsLightningChargeFill } from "react-icons/bs"
import { FaGhost } from "react-icons/fa"
import { FaWhatsapp } from "react-icons/fa6"

const features = [
  {
    icon: <FiEyeOff className="text-4xl text-rose-400" />,
    title: "100% Invisible",
    desc: "Our proprietary tool runs completely unseen. Even during full-screen sharing, the interviewer sees nothing but your standard environment.",
    colorFrom: "from-rose-500",
    colorTo: "to-pink-500"
  },
  {
    icon: <BsCpuFill className="text-4xl text-purple-400" />,
    title: "Real-Time AI Answers",
    desc: "As the interviewer speaks, the tool listens and instantly projects highly accurate, context-aware answers directly onto your screen.",
    colorFrom: "from-purple-500",
    colorTo: "to-indigo-500"
  },
  {
    icon: <FiShield className="text-4xl text-emerald-400" />,
    title: "Zero Anxiety, 100% Confidence",
    desc: "Transform stressful technical interviews into simple reading exercises. You stay calm, answer flawlessly, and clear every technical round.",
    colorFrom: "from-emerald-500",
    colorTo: "to-teal-500"
  }
]

export default function ProxyToolContent() {
  return (
    <div className="w-full bg-[#030614] min-h-screen font-sans overflow-hidden pt-16 md:pt-20">

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 overflow-hidden bg-[#0a0f24] text-white mx-4 md:mx-8 mt-4 rounded-[40px] border border-white/5 shadow-[0_0_100px_rgba(225,29,72,0.1)]">

        {/* Animated Background Gradients & Grid */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(#ffffff_1px,transparent_1px),linear-gradient(to_right,#ffffff_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ repeat: Infinity, duration: 8 }} className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-rose-600 rounded-full blur-[150px]" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }} transition={{ repeat: Infinity, duration: 12, delay: 2 }} className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] bg-purple-600 rounded-full blur-[180px]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-rose-500/50 bg-rose-500/10 text-rose-300 font-semibold mb-8 tracking-wide shadow-[0_0_15px_rgba(225,29,72,0.4)]"
          >
            <FaGhost className="text-xl" /> Garuda - Undetectable Interview Copilot
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
          >
            Never Fail a <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-400 via-pink-400 to-purple-400">Interview Again</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed"
          >
            Our intelligent Garuda AI listens to your interviewer and feeds you <strong className="text-white">real-time, highly accurate answers</strong> directly on your screen—completely invisible to screen monitoring.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link href="/pricing">
              <button className="bg-linear-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(225,29,72,0.5)] transition-all hover:-translate-y-1 flex items-center justify-center gap-3">
                Get Started Now <FiArrowRight className="text-xl" />
              </button>
            </Link>
          </motion.div>

          {/* STEP-BY-STEP PROCESS */}
          <div className="mt-32 w-full max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">How The Magic Happens</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">A seamless, real-time workflow designed to get you the offer without breaking a sweat.</p>
            </div>

            <div className="space-y-32">
              
              {/* STEP 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="flex flex-col lg:flex-row items-center gap-12"
              >
                <div className="flex-1 order-2 lg:order-1 text-left">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 font-black text-xl mb-6 border border-rose-500/50 shadow-[0_0_20px_rgba(225,29,72,0.3)]">1</div>
                  <h3 className="text-3xl font-bold text-white mb-4">The Interviewer Asks A Question</h3>
                  <p className="text-xl text-gray-400 leading-relaxed">
                    The moment the interviewer speaks, our advanced audio recognition instantly captures the technical question with <strong className="text-rose-400">zero latency</strong>.
                  </p>
                </div>
                <div className="flex-1 order-1 lg:order-2 w-full relative group">
                  <div className="absolute inset-0 bg-rose-600/20 blur-[80px] rounded-full group-hover:bg-rose-600/30 transition-all duration-700" />
                  <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 md:p-8 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform duration-500 hover:-translate-y-2">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden relative border border-gray-600">
                         <div className="absolute inset-0 bg-linear-to-b from-gray-500 to-gray-800"></div>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">Interviewer</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1 items-end h-3">
                            <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-rose-500 rounded-full"></motion.div>
                            <motion.div animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-rose-500 rounded-full"></motion.div>
                            <motion.div animate={{ height: [4, 8, 4] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1 bg-rose-500 rounded-full"></motion.div>
                          </div>
                          <span className="text-xs text-rose-400 font-mono tracking-widest uppercase">Capturing Audio...</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-xl"></div>
                      <p className="text-gray-200 font-medium text-lg leading-relaxed">"Can you explain how you would optimize a React application that is experiencing rendering bottlenecks?"</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* STEP 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="flex flex-col lg:flex-row items-center gap-12"
              >
                <div className="flex-1 w-full relative group">
                  <div className="absolute inset-0 bg-blue-600/20 blur-[80px] rounded-full group-hover:bg-blue-600/30 transition-all duration-700" />
                  <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 md:p-8 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] h-[300px] flex flex-col transform transition-transform duration-500 hover:-translate-y-2">
                     {/* Screen Analysis Mock */}
                     <div className="h-8 border-b border-gray-800 flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                        <span className="ml-2 text-xs text-gray-600 font-mono">App.jsx</span>
                     </div>
                     <div className="flex-1 relative font-mono text-sm text-gray-500 overflow-hidden">
                       <p><span className="text-purple-400">import</span> React, {'{'} useMemo {'}'} <span className="text-purple-400">from</span> 'react';</p>
                       <p className="mt-2"><span className="text-blue-400">const</span> <span className="text-yellow-200">ExpensiveComponent</span> = () =&gt; {'{'}</p>
                       <p className="pl-4 mt-2 text-gray-600 italic">// Active Screen Context</p>
                       <p className="pl-4">...</p>
                       
                       {/* Scanner Animation */}
                       <motion.div 
                          initial={{ top: 0 }}
                          animate={{ top: "100%" }}
                          transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                          className="absolute left-0 right-0 h-1 bg-blue-400/80 shadow-[0_0_20px_rgba(96,165,250,1)] z-10"
                       />
                       <div className="absolute top-4 right-4 bg-blue-500/20 border border-blue-500/50 text-blue-300 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2 backdrop-blur-md">
                         <BsCpuFill /> Analyzing Code
                       </div>
                     </div>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 font-black text-xl mb-6 border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]">2</div>
                  <h3 className="text-3xl font-bold text-white mb-4">Real-Time Screen Analysis</h3>
                  <p className="text-xl text-gray-400 leading-relaxed">
                    It doesn't just listen to audio. The tool <strong className="text-blue-400">analyzes your screen context</strong>, instantly reading the code in your IDE to ensure the generated solution perfectly matches your specific environment and variables.
                  </p>
                </div>
              </motion.div>

              {/* STEP 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="flex flex-col lg:flex-row items-center gap-12"
              >
                <div className="flex-1 order-2 lg:order-1 text-left">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 font-black text-xl mb-6 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]">3</div>
                  <h3 className="text-3xl font-bold text-white mb-4">Instant AI Code & Answers</h3>
                  <p className="text-xl text-gray-400 leading-relaxed">
                    Within milliseconds after the question finishes, <strong className="text-purple-400">exact code snippets and perfectly scripted conversational answers</strong> float directly onto your screen. No delays, no awkward pauses.
                  </p>
                </div>
                <div className="flex-1 order-1 lg:order-2 w-full relative group">
                  <div className="absolute inset-0 bg-purple-600/20 blur-[80px] rounded-full group-hover:bg-purple-600/30 transition-all duration-700" />
                  <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 md:p-8 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform duration-500 hover:-translate-y-2">
                     <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-purple-500/50 p-6 shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-purple-500 via-pink-500 to-rose-500"></div>
                       <div className="flex items-center gap-2 mb-4">
                         <BsLightningChargeFill className="text-purple-400 text-lg" />
                         <span className="text-purple-300 font-bold tracking-widest text-xs uppercase">Generated Solution</span>
                       </div>
                       <p className="text-white text-lg leading-relaxed mb-6 font-medium">
                         "To fix the bottleneck, I would wrap the expensive child components in <span className="text-purple-300 font-mono text-base">React.memo()</span> and use <span className="text-purple-300 font-mono text-base">useMemo()</span> to cache the expensive calculation..."
                       </p>
                       <div className="bg-black/60 rounded-xl p-4 border border-gray-700/50 relative overflow-hidden">
                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                         <code className="text-green-400 text-sm font-mono block">
                           <span className="text-blue-400">const</span> cachedValue = useMemo(() =&gt; computeExpensiveValue(a, b), [a, b]);
                         </code>
                       </div>
                     </div>
                  </div>
                </div>
              </motion.div>

              {/* STEP 4 */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="flex flex-col lg:flex-row items-center gap-12"
              >
                <div className="flex-1 w-full relative group">
                  <div className="absolute inset-0 bg-emerald-600/20 blur-[80px] rounded-full group-hover:bg-emerald-600/30 transition-all duration-700" />
                  <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 md:p-8 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform duration-500 hover:-translate-y-2">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                      <span className="text-gray-300 font-bold flex items-center gap-3"><FiMonitor className="text-xl" /> Interviewer's Display</span>
                      <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 text-xs font-bold tracking-widest uppercase rounded-full border border-emerald-800 flex items-center gap-2">
                        <FiCheckCircle /> 100% Clean
                      </span>
                    </div>
                    <div className="bg-[#1e293b] rounded-xl h-[180px] flex items-center justify-center border border-gray-700 relative overflow-hidden">
                       <span className="text-gray-500 font-mono text-sm flex items-center gap-2">
                          <FiEyeOff /> Standard Screen Share View
                       </span>
                       <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250px_250px] animate-shimmer pointer-events-none"></div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-4">
                       <div className="w-20 h-20 bg-emerald-500/20 backdrop-blur-md rounded-full flex items-center justify-center border border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                         <FiShield className="text-emerald-400 text-3xl" />
                       </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xl mb-6 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]">4</div>
                  <h3 className="text-3xl font-bold text-white mb-4">100% Invisible to Interviewer</h3>
                  <p className="text-xl text-gray-400 leading-relaxed">
                    Even while sharing your entire screen, <strong className="text-emerald-400">the interviewer sees absolutely nothing</strong>. The overlay is completely undetected by Teams, Zoom, WebEx, or any advanced proctoring software.
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* CORE MECHANICS GRID */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Designed specifically for complex technical interviews. Stay completely undetected while maintaining a 100% success rate.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              key={idx}
              className="bg-[#0f172a] rounded-3xl p-8 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors"
            >
              {/* Feature Glow Bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${feature.colorFrom} ${feature.colorTo} opacity-50 group-hover:opacity-100 transition-opacity`} />

              <div className="bg-[#1e293b] w-20 h-20 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white/5">
                {feature.icon}
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-lg">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-20 px-6 max-w-5xl mx-auto relative mb-32">
        {/* Glow behind pricing */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-rose-600/20 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-linear-to-b from-[#1e293b] to-[#0f172a] rounded-[40px] border border-white/10 p-10 md:p-16 text-center shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold tracking-wider uppercase mb-8 border border-emerald-500/20">
            <BsLightningChargeFill /> Pay Per Interview Package
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Garuda Access</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Get exclusive access to the smartest interview preparation tool. Stop paying high upfront placement fees and easily secure the job yourself.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-black text-white tracking-tighter">$125</span>
              <span className="text-xl text-gray-500 font-medium whitespace-nowrap">/ 2 Interviews</span>
            </div>
            <div className="hidden md:block w-px h-16 bg-white/10"></div>
            <div className="text-left text-gray-300 font-medium">
              <span className="block text-emerald-400 font-bold mb-1">✓ No Time Limit</span>
              <span className="block">Use your 2 credits anytime</span>
            </div>
          </div>

          <button 
            onClick={() => {
              const whatsappText = `Hi! I'm interested in the Garuda Access ($125 for 2 Interviews) and want to start my career now. Please guide me on how to pay.`;
              window.open(`https://wa.me/15068055727?text=${encodeURIComponent(whatsappText)}`, '_blank');
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:via-teal-400 hover:to-emerald-500 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.5)] transition-all hover:scale-105 flex items-center justify-center gap-3 mx-auto"
          >
            <FaWhatsapp className="text-2xl animate-pulse" />
            Pay on WhatsApp & Start Your Career Now
          </button>

          <p className="mt-8 text-sm text-gray-500 max-w-md mx-auto">
            100% secure checkout. Your Garuda dashboard credentials will be instantly delivered via email.
          </p>
        </motion.div>
      </section>

    </div>
  )
}
