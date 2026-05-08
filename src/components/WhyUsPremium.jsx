"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { HiChevronRight } from "react-icons/hi"

const blocks = [
    {
        title: "We're Cheaper — And Still the Best",
        desc: "Most staffing agencies charge heavy upfront costs with no guaranteed results. We've flipped the model. You pay less upfront, and the majority of the cost comes only when you start seeing real results. No hidden charges, no surprise fees — just honest, transparent pricing that respects your budget.",
        color: "from-purple-500 to-pink-500",
        hasTable: true,
        image: "/image1.jpeg"
    },
    {
        title: "Direct Company Tie-Ups, Not Random Applications",
        desc: "Here's the truth about most agencies — they hire one person who opens LinkedIn, sends connection requests, and applies to jobs randomly on your behalf. You'll see application confirmation emails flooding your inbox and feel like progress is happening. But weeks pass, and you get zero interview calls. That's because random mass applications don't work.\n\nWe do it completely different. We have direct tie-ups with companies and their HR teams. Your resume goes straight to the hiring manager's desk — not into a black hole of thousands of applications. That's why our interview call ratio is the highest in the industry. We don't just apply — we place.",
        color: "from-blue-500 to-indigo-500",
        image: "/image2.png"
    },
    {
        title: "Proxy Interview Tool — Never Fail Again",
        desc: "Interviews can be nerve-wracking, especially when they're technical. Our proprietary proxy tool gives you real-time answers directly on your screen during the interview. The best part? It's completely invisible during screen sharing — the interviewer sees nothing. You stay calm, answer confidently, and clear every round. This isn't a hack, it's the smartest preparation you can have.",
        color: "from-pink-500 to-red-500",
        image: "/image3.png"
    },
    {
        title: "Interview Questions — Straight from the Company",
        desc: "We don't give you generic 'Top 50 Interview Questions' from the internet. Once you receive a company call, inform us immediately. We connect with the company and extract the latest question sheet for the exact position you're interviewing for. The questions in your interview will come from this sheet. You'll walk in already knowing what they're going to ask — that's the Averion Group advantage.",
        color: "from-indigo-500 to-purple-500",
        image: "/image4.png"
    },
    {
        title: "Company-Matched Resume — Not a Generic Template",
        desc: "Most agencies use one-size-fits-all resume templates. We don't. When you tell us your target company, we reach out and get the actual resume format that company prefers. If you're applying to an operations role at Amazon, your resume will be built on the exact template Amazon's hiring team is used to reviewing. This means your resume doesn't just pass ATS — it feels familiar to the recruiter, instantly increasing your chances of getting shortlisted.",
        color: "from-pink-600 to-purple-600",
        image: "/image5.png"
    },
    {
        title: "Dedicated Support — Every Step, Every Day",
        desc: "From the moment you sign up until the day you receive your offer letter, we're with you. Not through an automated chatbot or a generic email thread — through real calls and personal emails. Need help preparing for tomorrow's call? Ring us. Got a question at midnight about your application status? Email us. We assign a dedicated placement manager to every candidate who knows your profile, your target companies, and your timeline inside out.",
        color: "from-purple-600 to-blue-600",
        image: "/image6.png"
    },
    {
        title: "What Others Do vs What We Do",
        desc: "Let's be honest about what typical staffing agencies actually do — they assign someone who spends 10 minutes editing your LinkedIn, sends out random connection requests, and bulk-applies to jobs through 'Easy Apply'. You get a flood of emails saying 'Applied', but you never get an interview call because it's all automated noise.\n\nWe don't waste your time with random clicks. We have direct, official tie-ups with companies where your resume is sent directly to the internal hiring team. We don't just 'apply' — we bypass the queue and get your profile on the right desk immediately. That's the Averion Group difference.",
        color: "from-red-500 to-pink-600",
        image: "/image7.png"
    }
]

const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 100, damping: 20 }
    }
};

function CostComparisonTable() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 w-full"
        >
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="bg-white/5">
                            <th className="px-6 py-5 text-white/40 font-black uppercase text-[10px] tracking-[0.2em]">Fee Structure</th>
                            <th className="px-6 py-5 text-red-400/80 font-black uppercase text-[10px] tracking-[0.2em] text-center bg-red-500/5">Other Agencies</th>
                            <th className="px-6 py-5 text-green-400 font-black uppercase text-[10px] tracking-[0.2em] text-center bg-green-500/10 shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]">Averion Group</th>
                        </tr>
                    </thead>
                    <tbody className="text-white/80">
                        <tr className="border-b border-white/5 group/row hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4 font-bold text-white/90">Registration Fee</td>
                            <td className="px-6 py-4 text-center text-red-400/60 font-black line-through opacity-50">$1,500</td>
                            <td className="px-6 py-4 text-center text-green-400 font-black text-lg bg-green-500/5">$750</td>
                        </tr>
                        <tr className="border-b border-white/5 group/row hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4 font-bold text-white/90">After Interview Call</td>
                            <td className="px-6 py-4 text-center text-red-400/60 font-black line-through opacity-50">$1,000</td>
                            <td className="px-6 py-4 text-center text-green-400 font-black text-lg bg-green-500/5">$920</td>
                        </tr>
                        <tr className="border-b border-white/5 group/row hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4 font-bold text-white/90">Success Fee</td>
                            <td className="px-6 py-4 text-center text-red-400/60 font-black line-through opacity-50">12%</td>
                            <td className="px-6 py-4 text-center text-green-400 font-black text-lg bg-green-500/5">9%</td>
                        </tr>
                        <tr className="bg-white/5">
                            <td className="px-6 py-6 font-black text-white uppercase tracking-wider">Total Upfront</td>
                            <td className="px-6 py-6 text-center text-red-500 font-black text-xl">$1,500</td>
                            <td className="px-6 py-6 text-center text-green-500 font-black text-2xl bg-green-500/10 shadow-[inset_0_0_30px_rgba(34,197,94,0.2)]">$750*</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="text-white/40 text-xs mt-3 text-center italic">
                *$920 is charged only after you receive an offer letter — you pay the rest only when we deliver results. All plans are valid for 7 months.
            </p>
            <div className="mt-8 flex justify-center">
                <Link href="/pricing#negotiate" className="group relative py-4 px-8 rounded-full border border-purple-500/30 bg-purple-500/5 overflow-hidden transition-all duration-500 hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                    <div className="relative z-10 flex items-center gap-3">
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-purple-300 group-hover:text-white transition-colors">Flexible budget? Check out negotiating plan</span>
                        <HiChevronRight className="text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-purple-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Link>
            </div>
        </motion.div>
    )
}

export default function WhyUsPremium() {
    const [selectedImage, setSelectedImage] = useState(null)

    return (

        <section className="py-20 md:py-32 bg-[#0b1730] m-4 md:m-8 rounded-[30px] md:rounded-[40px] border border-white/10 shadow-sm overflow-hidden relative">

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-white to-white/70 mb-6 leading-tight"
                >
                    Why Us? Because We Deliver 85%+ Placement Conversions.
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-center text-blue-200/70 text-lg max-w-3xl mx-auto mb-20"
                >
                    Most agencies promise results. We prove them. Here's exactly why our candidates get placed faster, cheaper, and more reliably than anywhere else.
                </motion.p>

            </div>

            <div className="space-y-16 w-full pb-12 overflow-hidden">

                {blocks.map((item, i) => {

                    const reverse = i % 2 !== 0

                    return (

                        <motion.div
                            key={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={{
                                visible: { transition: { staggerChildren: 0.2 } },
                                hidden: {}
                            }}
                            className={`flex flex-col md:flex-row items-stretch gap-6 md:gap-4 w-full group ${reverse ? "md:flex-row-reverse" : ""}`}
                        >

                            {/* TEXT CARD */}
                            <motion.div
                                variants={cardVariants}
                                className={`relative overflow-hidden flex-[1.4] p-10 lg:p-16 text-white flex flex-col justify-center
bg-linear-to-r ${item.color} animate-gradientMove
transition-all duration-500
group-hover:shadow-[0_0_80px_rgba(255,255,255,0.15)]
group-hover:-translate-y-2 rounded-3xl`}
                            >

                                {/* Gorgeous Watermark Number */}
                                <div className="absolute -bottom-6 md:-bottom-10 right-4 text-[120px] md:text-[180px] font-black italic text-white/10 pointer-events-none select-none leading-none">
                                    0{i + 1}
                                </div>

                                <div className="relative z-10 w-full">
                                    <h3 className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-md">
                                        {item.title}
                                    </h3>

                                    {item.desc.split('\n\n').map((paragraph, pi) => (
                                        <p key={pi} className="text-white/90 text-lg md:text-xl leading-relaxed font-medium mb-4 last:mb-0">
                                            {paragraph}
                                        </p>
                                    ))}

                                    {/* Cost Comparison Table for first block */}
                                    {item.hasTable && <CostComparisonTable />}
                                </div>

                                {/* Inner glow for premium feel */}
                                <div className="absolute inset-0 rounded-3xl border border-white/20 pointer-events-none" />

                            </motion.div>

                            {/* IMAGE BOX */}
                            <motion.div
                                variants={cardVariants}
                                onClick={() => setSelectedImage(item.image || "/premium-abstract.png")}
                                className="shrink-0 w-full min-h-[300px] md:min-h-0 md:w-[48%] bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden transition-all duration-700 group-hover:shadow-[0_0_80px_rgba(255,255,255,0.15)] group-hover:-translate-y-2 relative cursor-zoom-in"
                            >
                                {/* Glowing backdrop for image */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" />

                                {/* The Actual Image */}
                                <img
                                    src={item.image || "/premium-abstract.png"}
                                    alt={item.title}
                                    className="w-full h-full object-contain rounded-3xl transition-transform duration-700 ease-out relative z-10"
                                />

                                {/* Subtle overlay to blend it cleanly */}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-20 pointer-events-none" />

                                {/* Fullscreen Icon Indicator */}
                                <div className="absolute top-5 right-5 z-30 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 shadow-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <polyline points="9 21 3 21 3 15"></polyline>
                                        <line x1="21" y1="3" x2="14" y2="10"></line>
                                        <line x1="3" y1="21" x2="10" y2="14"></line>
                                    </svg>
                                </div>

                            </motion.div>

                        </motion.div>

                    )

                })}

            </div>

            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
                    >
                        <motion.img
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            src={selectedImage}
                            alt="Full Screen"
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                        />
                        <button 
                            className="absolute top-6 right-6 text-white text-3xl hover:scale-110 transition"
                            onClick={() => setSelectedImage(null)}
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

        </section>

    )

}