"use client"

import { motion } from "framer-motion"
import { HiCheckCircle, HiStar } from "react-icons/hi"
import Link from "next/link"

const plans = [
    {
        name: "Proxy Tool Only",
        price: "125",
        subtitle: "One-time",
        description: "Perfect for candidates needing technical interview assistance seamlessly.",
        features: [
            "2 Proxy interview sessions",
            "Max 2 hours duration per interview",
            "100% success rate of passing",
            "Undetectable even in HackerRank",
            "Invisible while screen sharing"
        ],
        gradient: "from-blue-600 to-cyan-500",
        shadow: "hover:shadow-cyan-500/40",
        popular: false
    },
    {
        name: "Marketing Only",
        price: "600",
        subtitle: "Upfront",
        description: "We secure your interviews with our direct company network.",
        features: [
            "+ $920 after interview call",
            "+ 9% success placement fee",
            "Direct company tie-ups",
            "Valid for 7 full months"
        ],
        gradient: "from-indigo-600 to-purple-500",
        shadow: "hover:shadow-indigo-500/40",
        popular: false
    },
    {
        name: "3 Proxy + Marketing",
        price: "800",
        subtitle: "Upfront",
        description: "Combined power of interview calls and technical proxy support.",
        features: [
            "+ $920 after interview call",
            "+ 9% success placement fee",
            "3 Proxy tool interviews",
            "Valid for 7 full months"
        ],
        gradient: "from-purple-600 to-blue-600",
        shadow: "hover:shadow-purple-500/50",
        popular: true
    },
    {
        name: "Unlimited Proxy + Marketing",
        price: "1,000",
        subtitle: "Upfront",
        description: "The ultimate package. Unlimited support until you're hired.",
        features: [
            "+ $920 after interview call",
            "+ 9% success placement fee",
            "Unlimited Proxy interviews",
            "Valid for 7 full months"
        ],
        gradient: "from-pink-500 to-rose-500",
        shadow: "hover:shadow-rose-500/40",
        popular: false
    }
]

export default function PricingPreview() {
    return (
        <section className="py-24 relative overflow-hidden bg-white" id="pricing-preview">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-50/50 via-white to-white pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm tracking-wide uppercase shadow-sm border border-purple-200">
                            Transparent Pricing
                        </span>
                        <h2 className="mt-6 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                            Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">career growth</span>
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            Choose the plan that best fits your needs. Get full access to our premium tools or expert marketing services.
                        </p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            whileHover={{ y: -8 }}
                            className={`relative bg-white rounded-3xl border-2 transition-all duration-300 ${
                                plan.popular ? 'border-purple-500 shadow-2xl shadow-purple-500/20 z-10' : 'border-gray-100 shadow-xl'
                            } ${plan.shadow} flex flex-col h-full`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-max">
                                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                                        <HiStar className="text-yellow-300" /> Best Value
                                    </span>
                                </div>
                            )}

                            <div className="p-6 xl:p-8 flex-1">
                                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                <p className="mt-2 text-xs xl:text-sm text-gray-500 h-10">{plan.description}</p>
                                
                                <div className="mt-6 mb-8 flex items-baseline gap-1">
                                    <span className="text-4xl lg:text-3xl xl:text-4xl font-extrabold text-gray-900">${plan.price}</span>
                                    <span className="text-sm font-semibold text-gray-500 uppercase">/ {plan.subtitle}</span>
                                </div>

                                <ul className="space-y-4">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <HiCheckCircle className={`text-xl mt-0.5 shrink-0 bg-clip-text text-transparent bg-gradient-to-r ${plan.gradient}`} style={{ WebkitTextFillColor: "transparent", fill: "url(#gradient)" }} />
                                            {/* Note: WebkitTextFillColor for react-icons doesn't always work perfectly, so standard coloring below */}
                                            <svg width="0" height="0" className="hidden">
                                              <linearGradient id={`${plan.gradient.replace(/\s+/g, '-')}`} x1="100%" y1="100%" x2="0%" y2="0%">
                                                <stop stopColor={plan.gradient.includes('purple') ? '#9333ea' : '#2563eb'} offset="0%" />
                                                <stop stopColor={plan.gradient.includes('blue') ? '#3b82f6' : '#06b6d4'} offset="100%" />
                                              </linearGradient>
                                            </svg>
                                            <span className="text-gray-700 font-medium text-sm xl:text-base">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-6 xl:p-8 pt-0 mt-auto">
                                <Link href="/pricing" className="block w-full">
                                    <button className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 hover:shadow-lg bg-gradient-to-r ${plan.gradient} hover:scale-105`}>
                                        View Full Details
                                    </button>
                                </Link>
                            </div>
                            
                            {/* Adding the styling for icons manually to ensure gradient works */}
                            <style jsx>{`
                                .text-xl.mt-0\\.5 {
                                    fill: url(#${plan.gradient.replace(/\s+/g, '-')});
                                    color: ${plan.popular ? '#9333ea' : '#2563eb'};
                                }
                            `}</style>
                        </motion.div>
                    ))}
                </div>
                
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 text-center"
                >
                    <Link href="/pricing" className="inline-flex items-center gap-2 text-purple-600 font-bold hover:text-purple-800 transition-colors group">
                        See all features and comparisons
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
