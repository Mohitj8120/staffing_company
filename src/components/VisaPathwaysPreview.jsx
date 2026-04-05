"use client"

import { motion } from "framer-motion"
import { FiArrowRight, FiCheckCircle } from "react-icons/fi"
import { FaGraduationCap, FaUserTie } from "react-icons/fa"
import { BsShieldFillCheck } from "react-icons/bs"
import Link from "next/link"

const previewVisas = [
  {
    title: "OPT (Optional Practical Training)",
    icon: <FaGraduationCap className="text-3xl text-purple-400" />,
    desc: "Fast-track job placement within 30–45 days and resume optimization.",
    color: "from-purple-500 to-indigo-500"
  },
  {
    title: "STEM OPT (Extension)",
    icon: <BsShieldFillCheck className="text-3xl text-blue-400" />,
    desc: "Placement in E-Verify companies with I-983 training plan guidance.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "H1B Visa",
    icon: <FaUserTie className="text-3xl text-emerald-400" />,
    desc: "Transfer opportunities & direct client connections for high-paying roles.",
    color: "from-emerald-500 to-teal-500"
  }
]

export default function VisaPathwaysPreview() {
  return (
    <section id="visa-pathways" className="py-16 md:py-24 px-4 bg-white relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-8 md:gap-6">
        <div className="max-w-2xl">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4"
          >
            Explore Your <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Visa Pathways</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-gray-600 mt-2 md:mt-0"
          >
            Whether you are on OPT, STEM OPT, H1B, H4 EAD/EAD, we have a clear, actionable plan to get you hired securely and quickly.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Link href="/visa-pathways">
            <button className="group bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all shadow-lg shadow-gray-200">
              Know More <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {previewVisas.map((visa, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15 }}
            className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 group"
          >
            <div className="bg-gray-50 w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 border border-gray-100 group-hover:bg-white group-hover:scale-110 transition-all duration-300">
              {visa.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{visa.title}</h3>
            <p className="text-gray-600 leading-relaxed mb-6 italic text-sm">{visa.desc}</p>
            
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
              <FiCheckCircle /> Specialized Support
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
