"use client"

import { motion } from "framer-motion"
import { FiCheckCircle, FiShield, FiEyeOff, FiMonitor, FiArrowRight, FiUnlock } from "react-icons/fi"
import { BsCpuFill, BsLightningChargeFill } from "react-icons/bs"
import { FaGhost } from "react-icons/fa"

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
            <FaGhost className="text-xl" /> Undetectable Interview Proxy Tool
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
          >
            Never Fail a <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-400 via-pink-400 to-purple-400">Interview Again</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed"
          >
            Our intelligent AI Proxy listens to your interviewer and feeds you <strong className="text-white">real-time, highly accurate answers</strong> directly on your screen—completely invisible to screen monitoring.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <button className="bg-linear-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(225,29,72,0.5)] transition-all hover:-translate-y-1 flex items-center justify-center gap-3">
              Get Started Now <FiArrowRight className="text-xl" />
            </button>
            <button className="bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md text-white px-10 py-4 rounded-xl font-bold text-lg transition-all hover:-translate-y-1 flex items-center justify-center gap-3">
              Watch Demo
            </button>
          </motion.div>

          {/* VIDEO PLACEHOLDER */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-20 w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/20 aspect-video bg-gray-900 flex items-center justify-center relative group cursor-pointer"
          >
            <div className="absolute inset-0 bg-linear-to-tr from-rose-900/30 via-transparent to-purple-900/30"></div>
            
            {/* Play Button */}
            <div className="w-24 h-24 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full flex items-center justify-center z-20 group-hover:scale-110 group-hover:bg-rose-500/30 group-hover:border-rose-500/50 transition-all duration-300 shadow-[0_0_40px_rgba(225,29,72,0.3)]">
              <div className="w-0 h-0 border-t-[14px] border-t-transparent border-l-[24px] border-l-white border-b-[14px] border-b-transparent ml-2"></div>
            </div>
            
            <div className="absolute bottom-6 left-8 z-20 text-left">
              <h3 className="text-2xl font-bold text-white mb-1">Proxy Tool in Action</h3>
              <p className="text-gray-400 text-sm">See how invisible the software truly is under screen share.</p>
            </div>
          </motion.div>
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
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Proxy Tool Access</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Get exclusive access to the smartest interview preparation tool. Stop paying high upfront placement fees and easily secure the job yourself.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-black text-white tracking-tighter">$250</span>
              <span className="text-xl text-gray-500 font-medium whitespace-nowrap">/ 5 Interviews</span>
            </div>
            <div className="hidden md:block w-px h-16 bg-white/10"></div>
            <div className="text-left text-gray-300 font-medium">
              <span className="block text-emerald-400 font-bold mb-1">✓ No Time Limit</span>
              <span className="block">Use your 5 credits anytime</span>
            </div>
          </div>
          
          <button className="w-full sm:w-auto bg-white text-gray-950 hover:bg-gray-200 px-12 py-5 rounded-2xl font-black text-xl shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all hover:scale-105">
            Purchase Access Now
          </button>
          
          <p className="mt-8 text-sm text-gray-500 max-w-md mx-auto">
            100% secure checkout. Your proxy tool dashboard credentials will be instantly delivered via email.
          </p>
        </motion.div>
      </section>

    </div>
  )
}
