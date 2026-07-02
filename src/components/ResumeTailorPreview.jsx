"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiUploadCloud, FiCpu, FiDownload, FiArrowRight, FiCheckCircle } from "react-icons/fi"

const stepsData = [
  {
    icon: <FiUploadCloud className="text-3xl" />,
    title: "1. Upload & Instant Parse",
    badge: "Zero-Storage Pipeline",
    desc: "Drag & drop your standard resume. Our parser instantly extracts text and structural sections, immediately deleting the original document from local disks to ensure 100% privacy.",
    visualType: "upload",
    accentColor: "from-blue-600 to-indigo-600",
    glowColor: "rgba(37, 99, 235, 0.15)"
  },
  {
    icon: <FiCpu className="text-3xl" />,
    title: "2. Neural ATS Alignment",
    badge: "Gemini Pro Powered",
    desc: "Paste the target Job Description. Our neural engine matches critical keywords, refines experience bullets, and bridges skill gaps to optimize ATS readability while keeping human review authentic.",
    visualType: "align",
    accentColor: "from-purple-600 to-indigo-600",
    glowColor: "rgba(124, 58, 237, 0.15)"
  },
  {
    icon: <FiDownload className="text-3xl" />,
    title: "3. Dynamic On-the-Fly Download",
    badge: "Optimized File Compiler",
    desc: "Download tailored versions immediately as minified, Latin-subsetted PDFs or clean MS Word (DOCX) files. Temporary files are auto-erased from memory immediately upon completion.",
    visualType: "download",
    accentColor: "from-emerald-600 to-teal-600",
    glowColor: "rgba(5, 150, 105, 0.15)"
  }
]

export default function ResumeTailorPreview() {
  const [activeStep, setActiveStep] = useState(0)

  // Autoplay slides every 6 seconds unless user interacts
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % stepsData.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-20 md:py-28 px-4 bg-gray-50/50 border-y border-gray-100 relative overflow-hidden">
      {/* Background radial soft light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-16 md:mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="px-4 py-1.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-4"
          >
            AI Resume Tailoring
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4"
          >
            Match Any Job Description <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-blue-700">In 3 Quick Steps</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto"
          >
            Stand out in any hiring pipeline with our privacy-first, ultra-optimized resume re-builder.
          </motion.p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Interactive Step Selectors */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {stepsData.map((step, idx) => {
              const isActive = idx === activeStep
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`text-left p-6 rounded-3xl border transition-all duration-500 relative flex items-start gap-4 focus:outline-none ${
                    isActive 
                      ? "bg-white border-purple-200 shadow-xl shadow-purple-500/5 translate-x-2" 
                      : "bg-transparent border-transparent hover:bg-white/40 hover:border-gray-200"
                  }`}
                >
                  {/* Step Accent Glow Indicator */}
                  {isActive && (
                    <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-purple-600 to-blue-600 rounded-l-full" />
                  )}

                  {/* Icon */}
                  <div className={`p-3.5 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                    isActive 
                      ? "bg-gradient-to-br text-white shadow-md " + step.accentColor
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {step.icon}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className={`font-bold text-lg transition-colors duration-500 ${
                        isActive ? "text-gray-900" : "text-gray-600"
                      }`}>
                        {step.title}
                      </h3>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full border border-purple-100">
                          {step.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed transition-colors duration-500 ${
                      isActive ? "text-gray-600" : "text-gray-500"
                    }`}>
                      {step.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Right Column: Visual Animation Screen */}
          <div className="lg:col-span-7">
            <div 
              className="bg-gray-900 rounded-[32px] p-6 md:p-8 aspect-[16/10] relative flex items-center justify-center overflow-hidden border border-gray-800 shadow-2xl transition-all duration-700"
              style={{ boxShadow: `0 30px 60px -15px rgba(0,0,0,0.5), 0 0 40px ${stepsData[activeStep].glowColor}` }}
            >
              {/* Virtual Editor Shell header */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs font-semibold text-gray-500 select-none">neural_optimization_engine.py</span>
                <div className="w-8" />
              </div>

              {/* Animate Contents of Active Slide */}
              <div className="w-full h-full pt-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {activeStep === 0 && (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, scale: 0.9, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -15 }}
                      transition={{ duration: 0.4 }}
                      className="w-full flex flex-col items-center justify-center text-center px-4"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5 relative">
                        <FiUploadCloud className="text-4xl animate-pulse" />
                        <div className="absolute -inset-1.5 border border-blue-500/20 rounded-3xl animate-ping" style={{ animationDuration: '3s' }} />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Resume_Mohit_Jain.docx</h4>
                      <p className="text-gray-400 text-sm max-w-sm mb-4">Parsing template components & extracting full profile layout...</p>
                      
                      {/* Extraction Status Bar Mock */}
                      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1.8, ease: "easeInOut" }}
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" 
                        />
                      </div>
                      
                      <div className="flex gap-4 text-xs font-bold text-emerald-400">
                        <span className="flex items-center gap-1"><FiCheckCircle /> Work Experience</span>
                        <span className="flex items-center gap-1"><FiCheckCircle /> Tech Skills</span>
                        <span className="flex items-center gap-1"><FiCheckCircle /> Education</span>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 1 && (
                    <motion.div
                      key="align"
                      initial={{ opacity: 0, scale: 0.9, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -15 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full flex flex-col justify-center px-4"
                    >
                      <div className="grid grid-cols-2 gap-4 h-[80%] items-center">
                        {/* Target JD */}
                        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 h-[90%] flex flex-col justify-between">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Required Job Description</span>
                          <div className="space-y-1.5 my-2 text-xs">
                            <p className="text-gray-400 font-semibold text-[11px]">Backend Architect Role:</p>
                            <p className="text-gray-500 text-[10px]">• Deploy REST APIs with FastAPI</p>
                            <p className="text-gray-500 text-[10px]">• Optimize query speed in Postgres</p>
                            <p className="text-gray-500 text-[10px]">• Build distributed cache with Redis</p>
                          </div>
                          <div className="text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                            <span>Initial Score:</span>
                            <span>42%</span>
                          </div>
                        </div>

                        {/* Tailored Output */}
                        <div className="bg-gray-950 border border-purple-500/40 rounded-2xl p-4 h-[90%] flex flex-col justify-between relative shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <FiCpu className="animate-spin" style={{ animationDuration: '4s' }} /> Optimized Resume
                          </span>
                          <div className="space-y-1.5 my-2 text-[10px]">
                            <p className="text-white font-semibold text-[11px]">Experience Optimized:</p>
                            <p className="text-purple-300 font-medium">• "Architected high-performance FastAPI backend endpoints..."</p>
                            <p className="text-purple-300 font-medium">• "Optimized PostgreSQL speed with multi-column indexes..."</p>
                            <p className="text-purple-300 font-medium">• "Integrated Upstash Redis server queue processing..."</p>
                          </div>
                          <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                            <span>Tailored Match:</span>
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1] }}
                              transition={{ duration: 1 }}
                            >
                              98%
                            </motion.span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 2 && (
                    <motion.div
                      key="download"
                      initial={{ opacity: 0, scale: 0.9, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -15 }}
                      transition={{ duration: 0.4 }}
                      className="w-full flex flex-col items-center justify-center text-center px-4"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 relative">
                        <FiDownload className="text-4xl animate-bounce" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Compilation Completed Successfully</h4>
                      <p className="text-gray-400 text-sm max-w-sm mb-6">Latin subsetting applied. PDF size reduced by 66%. Original files deleted from storage server.</p>
                      
                      <div className="flex gap-4">
                        <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/20">
                          <FiDownload /> Resume_Tailored.pdf
                        </button>
                        <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 border border-gray-700">
                          <FiDownload /> Resume_Tailored.docx
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button CTA */}
        <div className="text-center mt-16 md:mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <a href="http://localhost:5173/" target="_blank" rel="noopener noreferrer" className="inline-block">
              <button className="group bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-800 hover:to-blue-800 text-white px-10 py-5 rounded-[20px] font-extrabold text-lg flex items-center gap-3 transition-all shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.03]">
                Try AI Resume Tailor Now <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
