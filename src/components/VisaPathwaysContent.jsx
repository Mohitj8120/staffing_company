"use client"

import { motion } from "framer-motion"
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
  return (
    <div className="w-full bg-slate-50 min-h-screen font-sans overflow-hidden pt-12 md:pt-16">
      
      {/* DISCALIMER BANNER REMOVED AS REQUESTED - PLACED MORE SUBTLY IN CONTENT */}

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-linear-to-br from-gray-900 via-blue-950 to-purple-950 text-white mx-4 md:mx-8 rounded-[40px]">
        
        {/* Animated Background Blobs */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 8 }} className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px]" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }} transition={{ repeat: Infinity, duration: 10, delay: 2 }} className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600 rounded-full blur-[150px]" />

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
            Navigate Your US Career Journey <br className="hidden md:block"/>
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
            <button className="bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all flex items-center gap-3">
              Start Your Journey Today <FiArrowRight className="text-xl" />
            </button>
          </motion.div>

          {/* VIDEO PLACEHOLDER */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 aspect-video bg-gray-800 flex items-center justify-center relative group cursor-pointer"
          >
            <div className="absolute inset-0 bg-linear-to-t from-gray-900/90 via-transparent to-transparent z-10"></div>
            
            {/* Play Button */}
            <div className="w-20 h-20 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full flex items-center justify-center z-20 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
              <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[22px] border-l-white border-b-[12px] border-b-transparent ml-2"></div>
            </div>
            
            <div className="absolute bottom-6 left-8 z-20 text-left">
              <h3 className="text-xl font-bold text-white mb-1">Visa Strategy Masterclass</h3>
              <p className="text-gray-300 text-sm">Watch how we navigate US job placements</p>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* VISA TYPES GRID */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Our Support Across Visa Types</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Mera visa jo bhi hai, we have a clear, actionable plan to get you hired securely and quickly.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visaTypes.map((visa, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={visa.id}
              className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group"
            >
              {/* Top Gradient Bar */}
              <div className={`absolute top-0 left-0 right-0 h-2 bg-linear-to-r ${visa.colorFrom} ${visa.colorTo} opacity-80 group-hover:opacity-100 transition-opacity`} />
              
              <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                {visa.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{visa.title}</h3>
              
              <ul className="space-y-3 mb-8">
                {visa.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <FiCheckCircle className="text-green-500 mt-1 shrink-0" />
                    <span className="leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <FiTarget className="text-blue-500" /> GOAL:
                </p>
                <p className="text-sm text-gray-600 mt-1">{visa.goal}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW WE WORK (Workflow) */}
      <section className="py-24 bg-linear-to-b from-gray-900 to-gray-950 text-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How We Work</h2>
            <p className="text-xl text-gray-400">A seamless transition from evaluation to your first day.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {workflows.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                key={idx}
                className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700 relative"
              >
                <div className="text-5xl font-black text-white/5 absolute top-4 right-4">{item.step}</div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-500/30 mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 relative z-10">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed relative z-10">{item.desc}</p>
              </motion.div>
            ))}
          </div>
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
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3 mx-auto lg:mx-0"
            >
              Get Started Now <FiArrowRight className="text-xl" />
            </motion.button>
          </div>
          
        </div>
      </section>

    </div>
  )
}
