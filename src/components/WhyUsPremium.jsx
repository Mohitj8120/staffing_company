"use client"

import { motion } from "framer-motion"

const blocks = [
    {
        title: "We're Cheaper — And Still the Best",
        desc: "Most staffing agencies charge heavy upfront costs with no guaranteed results. We've flipped the model. You pay less upfront, and the majority of the cost comes only when you start seeing real results. No hidden charges, no surprise fees — just honest, transparent pricing that respects your budget.",
        color: "from-purple-500 to-pink-500",
        hasTable: true
    },
    {
        title: "Direct Company Tie-Ups, Not Random Applications",
        desc: "Here's the truth about most agencies — they hire one person who opens LinkedIn, sends connection requests, and applies to jobs randomly on your behalf. You'll see application confirmation emails flooding your inbox and feel like progress is happening. But weeks pass, and you get zero interview calls. That's because random mass applications don't work.\n\nWe do it completely different. We have direct tie-ups with companies and their HR teams. Your resume goes straight to the hiring manager's desk — not into a black hole of thousands of applications. That's why our interview call ratio is the highest in the industry. We don't just apply — we place.",
        color: "from-blue-500 to-indigo-500"
    },
    {
        title: "Proxy Interview Tool — Never Fail Again",
        desc: "Interviews can be nerve-wracking, especially when they're technical. Our proprietary proxy tool gives you real-time answers directly on your screen during the interview. The best part? It's completely invisible during screen sharing — the interviewer sees nothing. You stay calm, answer confidently, and clear every round. This isn't a hack, it's the smartest preparation you can have.",
        color: "from-pink-500 to-red-500"
    },
    {
        title: "Interview Questions — Straight from the Company",
        desc: "We don't give you generic 'Top 50 Interview Questions' from the internet. Once you receive a company call, inform us immediately. We connect with the company and extract the latest question sheet for the exact position you're interviewing for. The questions in your interview will come from this sheet. You'll walk in already knowing what they're going to ask — that's the Talentra advantage.",
        color: "from-indigo-500 to-purple-500"
    },
    {
        title: "Company-Matched Resume — Not a Generic Template",
        desc: "Most agencies use one-size-fits-all resume templates. We don't. When you tell us your target company, we reach out and get the actual resume format that company prefers. If you're applying to an operations role at Amazon, your resume will be built on the exact template Amazon's hiring team is used to reviewing. This means your resume doesn't just pass ATS — it feels familiar to the recruiter, instantly increasing your chances of getting shortlisted.",
        color: "from-pink-600 to-purple-600"
    },
    {
        title: "Dedicated Support — Every Step, Every Day",
        desc: "From the moment you sign up until the day you receive your offer letter, we're with you. Not through an automated chatbot or a generic email thread — through real calls and personal emails. Need help preparing for tomorrow's call? Ring us. Got a question at midnight about your application status? Email us. We assign a dedicated placement manager to every candidate who knows your profile, your target companies, and your timeline inside out.",
        color: "from-purple-600 to-blue-600"
    },
    {
        title: "What Others Do vs What We Do",
        desc: "Let's be honest about what typical staffing agencies actually do — they assign someone who spends 10 minutes editing your LinkedIn, sends out random connection requests, and bulk-applies to jobs through 'Easy Apply'. You get a flood of emails saying 'Applied', but you never get an interview call because it's all automated noise.\n\nWe don't waste your time with random clicks. We have direct, official tie-ups with companies where your resume is sent directly to the internal hiring team. We don't just 'apply' — we bypass the queue and get your profile on the right desk immediately. That's the Talentra difference.",
        color: "from-red-500 to-pink-600"
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
            <div className="overflow-x-auto rounded-2xl border border-white/20 bg-black/30 backdrop-blur-md">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="px-5 py-4 text-white/60 font-semibold uppercase text-xs tracking-wider">Fee Structure</th>
                            <th className="px-5 py-4 text-red-300 font-semibold uppercase text-xs tracking-wider text-center">Other Agencies</th>
                            <th className="px-5 py-4 text-green-300 font-semibold uppercase text-xs tracking-wider text-center">Talentra</th>
                        </tr>
                    </thead>
                    <tbody className="text-white/80">
                        <tr className="border-b border-white/5">
                            <td className="px-5 py-3.5 font-medium">Registration Fee</td>
                            <td className="px-5 py-3.5 text-center text-red-300 font-bold">$1,500</td>
                            <td className="px-5 py-3.5 text-center text-green-300 font-bold">$750</td>
                        </tr>
                        <tr className="border-b border-white/5">
                            <td className="px-5 py-3.5 font-medium">After Interview Call</td>
                            <td className="px-5 py-3.5 text-center text-red-300 font-bold">$1,000</td>
                            <td className="px-5 py-3.5 text-center text-green-300 font-bold">$920</td>
                        </tr>
                        <tr className="border-b border-white/5">
                            <td className="px-5 py-3.5 font-medium">Success Fee</td>
                            <td className="px-5 py-3.5 text-center text-red-300 font-bold">12%</td>
                            <td className="px-5 py-3.5 text-center text-green-300 font-bold">9%</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 font-bold text-white">Total Upfront</td>
                            <td className="px-5 py-4 text-center text-red-400 font-extrabold text-base">$1,500</td>
                            <td className="px-5 py-4 text-center text-green-400 font-extrabold text-base">$750 *</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="text-white/40 text-xs mt-3 text-center italic">
                *$920 is charged only after you receive an offer letter — you pay the rest only when we deliver results. All plans are valid for 7 months.
            </p>
        </motion.div>
    )
}

export default function WhyUsPremium() {

    return (

        <section className="py-20 md:py-32 bg-[#0b1730] m-4 md:m-8 rounded-[30px] md:rounded-[40px] border border-white/10 shadow-sm overflow-hidden">

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
                                className={`relative overflow-hidden flex-[2] p-10 lg:p-16 text-white flex flex-col justify-center
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

                            {/* VIDEO BOX */}
                            <motion.div
                                variants={cardVariants}
                                className="shrink-0 w-full min-h-[250px] md:min-h-0 md:w-[40%] bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center text-white/50 text-sm overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_60px_rgba(255,255,255,0.05)] group-hover:-translate-y-1 relative"
                            >
                                {/* Pulse Effect for Video Placeholder */}
                                <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent group-hover:animate-pulse" />

                                <span className="relative z-10 font-medium tracking-widest uppercase text-white/40">Video</span>

                            </motion.div>

                        </motion.div>

                    )

                })}

            </div>

        </section>

    )

}