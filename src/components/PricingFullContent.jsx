"use client"

import { motion } from "framer-motion"
import { HiCheck, HiOutlineSparkles, HiOutlineQuestionMarkCircle } from "react-icons/hi"
import { useState } from "react"
import Link from "next/link"

const plans = [
    {
        id: "trial",
        name: "Proxy Tool Only",
        subtitle: "One-time Payment",
        price: "125",
        billing: "one-time",
        description: "Perfect for candidates needing technical interview assistance seamlessly.",
        features: [
            "2 Proxy interview sessions",
            "Max 2 hours duration per interview",
            "100% success rate of passing",
            "Undetectable even in HackerRank",
            "Invisible while screen sharing"
        ],
        gradient: "from-blue-600 to-cyan-500",
        shadow: "shadow-cyan-500/20",
        delay: 0.1,
        featured: false,
    },
    {
        id: "marketing",
        name: "Marketing Only",
        subtitle: "Valid for 7 months",
        price: "750",
        billing: "upfront",
        description: "Direct ties with companies to secure your interview calls.",
        features: [
            "+ $920 on an offer letter acceptance(on offer letter)",
            "+ 9% in 90 days for the 1st year of post employment",
            "Direct company tie-ups",
            "Actual interview question sheets sourced from companies",
            "Targeted company-matched resume creation",
            "Dedicated Placement Manager"
        ],
        gradient: "from-indigo-600 to-purple-500",
        shadow: "shadow-indigo-500/20",
        delay: 0.2,
        featured: false,
    },
    {
        id: "combo",
        name: "3 Proxy + Marketing",
        subtitle: "Valid for 7 months",
        price: "800",
        billing: "upfront",
        description: "Combined power of guaranteed interviews and technical proxy support.",
        features: [
            "+ $920 on an offer letter acceptance(on offer letter)",
            "+ 9% in 90 days for the 1st year of post employment",
            "3 Proxy interviews support",
            "Direct company tie-ups",
            "Actual interview question sheets",
            "Dedicated Placement Manager"
        ],
        gradient: "from-purple-600 to-blue-600",
        shadow: "shadow-purple-500/40",
        delay: 0.3,
        featured: true,
    },
    {
        id: "unlimited",
        name: "Unlimited Proxy + Marketing",
        subtitle: "Valid for 7 months",
        price: "1,000",
        billing: "upfront",
        description: "The ultimate package. Unlimited support until you're formally hired.",
        features: [
            "+ $920 on an offer letter acceptance(on offer letter)",
            "+ 9% in 90 days for the 1st year of post employment",
            "Unlimited Proxy interviews support",
            "Direct company tie-ups",
            "Actual interview question sheets",
            "Dedicated Placement Manager"
        ],
        gradient: "from-pink-500 to-rose-500",
        shadow: "shadow-rose-500/20",
        delay: 0.4,
        featured: false,
    }
]

const faqs = [
    {
        q: "Is it a one-time payment?",
        a: "Yes! All of our plans represent a one-time fee for a defined outcome. There are no surprise monthly subscriptions or hidden charges."
    },
    {
        q: "How does the Proxy Tool work?",
        a: "The tool runs seamlessly alongside your interview software. It provides real-time intelligent hints and transcripts directly onto your screen, without being visible to the interviewer."
    },
    {
        q: "Do you guarantee a job placement?",
        a: "While we supercharge your visibility and support you heavily during the interview process, we do not guarantee a job. Our metrics show a 85% success rate for our combo package users within 60 days."
    },
    {
        q: "Can I upgrade my plan later?",
        a: "No, there is no upgrade policy. Need to purchase new plan"
    }
]

export default function PricingFullContent() {
    const [hoveredPlan, setHoveredPlan] = useState(null)

    return (
        <div className="min-h-screen bg-[#030014] text-white pt-24 pb-20 overflow-hidden font-sans">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                {/* Hero section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center max-w-3xl mx-auto mt-16 mb-24"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md"
                    >
                        <HiOutlineSparkles className="text-purple-400" />
                        <span className="text-sm font-medium tracking-wide text-gray-300">Level up your tech career</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                        Simple pricing for <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient-x">
                            powerful results.
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                        Accelerate your hiring journey with our bespoke job marketing strategies and cutting-edge interview copilot tool. No hidden fees.
                    </p>
                </motion.div>

                {/* Pricing Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto mb-32">
                    {plans.map((plan) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: plan.delay, ease: "easeOut" }}
                            onHoverStart={() => setHoveredPlan(plan.id)}
                            onHoverEnd={() => setHoveredPlan(null)}
                            className={`relative rounded-3xl backdrop-blur-xl transition-all duration-500 flex flex-col h-full
                                ${plan.featured ? 'bg-white/10 border-2 border-purple-500 my-0 py-8 lg:-mt-4 lg:mb-[-1rem] z-20' : 'bg-white/5 border border-white/10 p-6 xl:p-8 hover:bg-white/[0.08] hover:border-white/30 z-10'}
                            `}
                            style={{
                                boxShadow: hoveredPlan === plan.id || plan.featured
                                    ? `0 0 40px -10px ${plan.gradient.includes('purple') ? '#9333ea' : '#3b82f6'}`
                                    : 'none'
                            }}
                        >
                            {plan.featured && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center">
                                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-6 py-1.5 rounded-full text-sm shadow-[0_0_20px_rgba(147,51,234,0.5)] border border-purple-400/30 whitespace-nowrap">
                                        Best Value
                                    </div>
                                </div>
                            )}

                            <div className={plan.featured ? "px-6 xl:px-8" : ""}>
                                <h3 className="text-xl xl:text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                {plan.subtitle && <p className="text-purple-400 font-medium text-sm mb-2">{plan.subtitle}</p>}
                                <p className="text-gray-400 text-xs xl:text-sm h-12 mb-6">{plan.description}</p>

                                <div className="flex items-baseline gap-2 mb-8 relative">
                                    <span className="text-5xl lg:text-4xl xl:text-5xl font-extrabold text-white tracking-tight">${plan.price}</span>
                                    <span className="text-gray-400 font-medium">/{plan.billing}</span>
                                </div>
                            </div>

                            <div className={`flex-1 ${plan.featured ? "px-6 xl:px-8 bg-gradient-to-b from-transparent to-black/20 pt-6 rounded-b-3xl border-t border-white/5" : "pt-6 border-t border-white/10"}`}>
                                <ul className="space-y-4 mb-10">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex flex-start gap-4">
                                            <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-r ${plan.gradient}`}>
                                                <HiCheck className="text-white text-sm" />
                                            </div>
                                            <span className="text-gray-300 font-medium text-sm xl:text-base">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto">
                                    <button className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 group relative overflow-hidden
                                        ${plan.featured ? 'bg-white text-purple-900 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-white/10 text-white hover:bg-white/20'}
                                    `}>
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            Get Started
                                            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                                        </span>
                                        {plan.featured && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto border-t border-white/10 pt-20"
                >
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pricing FAQs</h2>
                        <p className="text-gray-400">Everything you need to know about our plans.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-colors"
                            >
                                <div className="flex items-start gap-4 mb-3">
                                    <HiOutlineQuestionMarkCircle className="text-purple-400 text-2xl flex-shrink-0 mt-1" />
                                    <h3 className="text-xl font-semibold text-white">{faq.q}</h3>
                                </div>
                                <p className="text-gray-400 leading-relaxed pl-10">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
                @keyframes gradient-x {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 6s ease infinite;
                }
            `}</style>
        </div>
    )
}
