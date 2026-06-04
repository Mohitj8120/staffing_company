"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { FiCheckCircle, FiBriefcase, FiTarget, FiArrowRight } from "react-icons/fi"
import { BsShieldFillCheck } from "react-icons/bs"
import { FaGraduationCap, FaUserTie } from "react-icons/fa"

const visaTypes = [
  {
    id: "opt",
    title: "OPT (Optional Practical Training)",
    icon: <FaGraduationCap className="text-4xl text-purple-400" />,
    features: [
      "Fast-track job placement within 30–45 days",
      "Resume optimization (US standards)",
      "Daily job applications & recruiter outreach",
      "Interview preparation"
    ],
    goal: "Get you employed before unemployment limit hits",
    colorFrom: "from-purple-500",
    colorTo: "to-indigo-500"
  },
  {
    id: "stem-opt",
    title: "STEM OPT (Extension)",
    icon: <BsShieldFillCheck className="text-4xl text-blue-400" />,
    features: [
      "Placement in E-Verify companies",
      "I-983 training plan guidance",
      "Long-term project/job stability",
      "Backup job support if needed"
    ],
    goal: "Secure your 2-year extension safely",
    colorFrom: "from-blue-500",
    colorTo: "to-cyan-500"
  },
  {
    id: "h1b",
    title: "H1B Visa",
    icon: <FiBriefcase className="text-4xl text-emerald-400" />,
    features: [
      "Transfer opportunities (better salary roles)",
      "Direct client & vendor connections",
      "High-paying contract/full-time roles"
    ],
    goal: "Career growth + stable long-term position",
    colorFrom: "from-emerald-500",
    colorTo: "to-teal-500"
  },
  {
    id: "h4-ead",
    title: "H4 EAD / EAD",
    icon: <FaUserTie className="text-4xl text-pink-400" />,
    features: [
      "Career restart support",
      "Flexible job placements",
      "Quick onboarding roles"
    ],
    goal: "Help you re-enter workforce smoothly",
    colorFrom: "from-pink-500",
    colorTo: "to-rose-500"
  }
]

const workflows = [
  { step: "01", title: "Company-Matched Prep", desc: "We build your resume on your target company's exact template so it feels familiar to their recruiters." },
  { step: "02", title: "Direct HR Setup", desc: "No random 'Easy Applies'. We bypass the queue using our direct tie-ups to land your resume on the hiring manager's desk." },
  { step: "03", title: "Proxy Interview Tool", desc: "100% Guaranteed Success. Our intelligent, invisible proxy tool feeds you real-time answers directly on your screen." },
  { step: "04", title: "Exact Question Sheets", desc: "Never be surprised. We provide you with the exact interview questions sourced directly from the company beforehand." },
  { step: "05", title: "Guaranteed Offers", desc: "With our proxy support, we ensure you clear every round perfectly, driving you straight to the offer letter phase." }
]

const whyChooseUs = [
  "Crack any interview 100% without a doubt using our invisible AI Proxy Tool",
  "We provide Exact Company Match Resumes & Direct HR Question Sheets",
  "We don't do random applications; we have immediate direct company tie-ups",
  "Pay significantly less upfront. You only pay the balance when results happen"
]

export default function VisaPathwaysContent() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 1], [0.8, 0.2])

  return (
    <div className="w-full bg-slate-50 min-h-screen font-sans overflow-hidden pt-12 md:pt-16">

      {/* DISCALIMER BANNER REMOVED AS REQUESTED - PLACED MORE SUBTLY IN CONTENT */}

      {/* HERO SECTION */}
      <section ref={containerRef} className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-gray-900 text-white mx-4 md:mx-8 rounded-[40px] shadow-2xl border border-white/10">
        
        {/* Parallax Hero Background */}
        <motion.div 
          style={{ y, opacity, backgroundImage: 'url(/images/hero_visa_bg.png)' }} 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 z-0 bg-linear-to-b from-gray-900/60 via-gray-900/40 to-gray-900/90" />
        <div className="absolute inset-0 z-0 bg-linear-to-r from-blue-950/30 to-purple-950/30" />

        {/* Animated Background Blobs */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 8 }} className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] z-0 pointer-events-none" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }} transition={{ repeat: Infinity, duration: 10, delay: 2 }} className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600 rounded-full blur-[150px] z-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-5 py-2 rounded-full border border-blue-400 bg-blue-500/10 text-blue-300 font-semibold mb-6 tracking-wide"
          >
            US Career Placement Experts
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
          >
            Navigate Your US Career Journey <br className="hidden md:block" />
            with the <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-400">Right Visa Strategy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-2xl text-gray-300 max-w-4xl mx-auto mb-10 font-light leading-relaxed"
          >
            We don’t provide visas — we help you <strong className="text-white">secure jobs aligned with your visa status</strong> and move forward securely in your career.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center"
          >
            <Link href="/pricing">
              <button className="bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all flex items-center gap-3">
                Start Your Journey Today <FiArrowRight className="text-xl" />
              </button>
            </Link>
          </motion.div>

          {/* INTERACTIVE VISA PATHWAYS DIAGRAM */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 w-full max-w-7xl mx-auto rounded-[40px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10 bg-gray-900/60 backdrop-blur-2xl p-4 md:p-8"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl md:text-4xl font-black text-white mb-2">Visa Strategy Visualized</h3>
              <p className="text-gray-300">Choose your visa pathway and discover how we secure your future</p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4 h-[800px] lg:h-[500px]">
              {visaTypes.map((visa, idx) => {
                const bgImages = {
                  'opt': '/images/opt_visa_bg.png',
                  'stem-opt': '/images/stem_opt_visa_bg.png',
                  'h1b': '/images/h1b_visa_bg.png',
                  'h4-ead': '/images/h4_ead_visa_bg.png'
                };
                return (
                  <motion.div 
                    key={visa.id}
                    className="relative rounded-3xl overflow-hidden flex-1 hover:flex-[2] transition-all duration-500 ease-in-out group cursor-pointer border border-white/10"
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                      style={{ backgroundImage: `url(${bgImages[visa.id]})` }}
                    />
                    <div className="absolute inset-0 bg-gray-900/50 group-hover:bg-gray-900/20 transition-colors duration-500" />
                    <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/80 to-transparent opacity-90" />
                    
                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-left z-10">
                      <div className="flex items-center gap-4 mb-4 group-hover:mb-2 transition-all">
                        <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-xl flex items-center justify-center border border-white/30 text-white shrink-0">
                          {visa.icon}
                        </div>
                        <h4 className="text-xl md:text-2xl font-bold text-white leading-tight">{visa.title}</h4>
                      </div>
                      
                      <div className="overflow-hidden max-h-0 group-hover:max-h-[300px] transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100">
                        <p className="text-cyan-300 font-semibold mb-3">{visa.goal}</p>
                        <ul className="space-y-2">
                          {visa.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-200 text-sm">
                              <FiCheckCircle className="text-cyan-400 mt-1 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>



      {/* WHY CHOOSE US & CTA */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative">
        <div className="flex flex-col lg:flex-row gap-12 items-center bg-white rounded-3xl p-8 lg:p-16 shadow-2xl border border-gray-100 relative overflow-hidden">

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-[80px] -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-[80px] -z-10" />

          <div className="lg:w-1/2 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose Us?</h2>
            <div className="space-y-4">
              {whyChooseUs.map((reason, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                  className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shrink-0">
                    <FiCheckCircle className="text-xl" />
                  </div>
                  <span className="text-gray-800 font-semibold">{reason}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 text-gray-400 bg-gray-50/50 p-4 rounded-xl border border-gray-100 italic">
              <FiTarget className="text-blue-500 shrink-0" />
              <p className="text-sm">
                <b>Note:</b> We specialize in job placement for your current visa status. Averion Group does not provide visa sponsorship directly.
              </p>
            </div>
          </div>

          <div className="lg:w-1/2 text-center lg:text-left relative z-10">
            <h3 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">Start Your Journey Today</h3>
            <p className="text-xl text-gray-600 mb-10">
              Get placed faster with a strategy tailored specifically to your visa status.
            </p>
            <Link href="/pricing">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3 mx-auto lg:mx-0"
              >
                Get Started Now <FiArrowRight className="text-xl" />
              </motion.button>
            </Link>
          </div>

        </div>
      </section>

    </div>
  )
}
