"use client"

import { motion } from "framer-motion"
import { HiCheckCircle, HiStar, HiSparkles } from "react-icons/hi"
import { useRef, useEffect } from "react"
import Link from "next/link"
import NegotiationSection from "./NegotiationSection"

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
        shadow: "hover:shadow-cyan-500/30",
        popular: false
    },
    {
        name: "Marketing Only",
        price: "750",
        subtitle: "Valid for 7 months",
        description: "Direct ties with companies to secure your interview calls.",
        features: [
            "+ $920 on offer letter acceptance",
            "+ 9% in 90 days (post employment)",
            "Direct company tie-ups",
            "Actual interview question sheets",
            "Dedicated Placement Manager"
        ],
        gradient: "from-indigo-600 to-purple-500",
        shadow: "hover:shadow-indigo-500/30",
        popular: false
    },
    {
        name: "3 Proxy + Marketing",
        price: "800",
        subtitle: "Valid for 7 months",
        description: "Combined power of guaranteed interviews and technical proxy support.",
        features: [
            "+ $920 on offer letter acceptance",
            "+ 9% in 90 days (post employment)",
            "3 Proxy interviews support",
            "Direct company tie-ups",
            "Dedicated Placement Manager"
        ],
        gradient: "from-purple-600 to-blue-600",
        shadow: "hover:shadow-purple-500/40",
        popular: true
    },
    {
        name: "Unlimited Proxy + Marketing",
        price: "1,000",
        subtitle: "Valid for 7 months",
        description: "The ultimate package. Unlimited support until you're formally hired.",
        features: [
            "+ $920 on offer letter acceptance",
            "+ 9% in 90 days (post employment)",
            "Unlimited Proxy support",
            "Direct company tie-ups",
            "Dedicated Placement Manager"
        ],
        gradient: "from-pink-500 to-rose-500",
        shadow: "hover:shadow-rose-500/30",
        popular: false
    }
]

const RazorpayButton = ({ buttonId }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear existing button if any
        containerRef.current.innerHTML = '';

        const script = document.createElement('script');
        script.src = "https://checkout.razorpay.com/v1/payment-button.js";
        script.setAttribute('data-payment_button_id', buttonId);
        script.async = true;

        const form = document.createElement('form');
        form.appendChild(script);
        
        containerRef.current.appendChild(form);
    }, [buttonId]);

    return <div ref={containerRef} className="w-full flex justify-center" />;
};

export default function PricingPreview() {
    const negotiationRef = useRef(null)

    const scrollToNegotiation = () => {
        negotiationRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <section className="py-28 relative overflow-hidden bg-[#fcfaff]" id="pricing-preview">
            {/* Soft decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-200/40 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-200/30 blur-[100px] rounded-full" />
                <div className="absolute -bottom-[5%] left-[20%] w-[35%] h-[35%] bg-rose-100/40 blur-[100px] rounded-full" />
            </div>
            
            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-purple-100 mb-6">
                            <HiSparkles className="text-purple-500" />
                            <span className="text-purple-700 font-bold text-xs tracking-wider uppercase">
                                Invest in your future
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                            Simple Pricing, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 animate-gradient-x">
                                Massive ROI.
                            </span>
                        </h2>
                        <p className="mt-6 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                            No hidden fees. No subscriptions. Just transparent pricing for the tools and support you need to land your dream job.
                        </p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto items-stretch">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className={`group relative flex flex-col h-full bg-white rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                                plan.popular 
                                ? 'border-purple-200 shadow-[0_20px_50px_rgba(147,51,234,0.12)] scale-105 z-20 md:-translate-y-2' 
                                : 'border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-10'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-0 w-full">
                                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-2 text-center">
                                        <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5">
                                            <HiStar className="text-yellow-300 animate-pulse" /> Most Popular Choice
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className={`p-8 ${plan.popular ? 'pt-12' : ''} flex-1`}>
                                <div className="mb-6">
                                    <h3 className={`text-xl font-black ${plan.popular ? 'text-purple-900' : 'text-slate-800'} mb-2`}>{plan.name}</h3>
                                    <p className="text-slate-400 text-sm font-medium leading-snug min-h-[40px]">{plan.description}</p>
                                </div>
                                
                                <div className="mb-8 p-6 rounded-2xl bg-slate-50/50 border border-slate-100 group-hover:bg-white group-hover:border-purple-100 transition-colors duration-300">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-slate-900 tracking-tighter">${plan.price}</span>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{plan.subtitle}</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 group/item">
                                            <div className={`mt-1 p-0.5 rounded-full bg-gradient-to-r ${plan.gradient} shadow-sm group-hover/item:scale-110 transition-transform`}>
                                                <HiCheckCircle className="text-white text-lg" />
                                            </div>
                                            <span className="text-slate-600 font-semibold text-sm leading-tight">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="px-8 pb-8 mt-auto">
                                {plan.name === 'Marketing Only' ? (
                                    <div className="w-full min-h-[56px] flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden py-2 border border-slate-100">
                                        <RazorpayButton buttonId="pl_So2gTMvs2tajA1" />
                                    </div>
                                ) : (
                                    <Link href="/pricing" className="block group/btn">
                                        <button className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 overflow-hidden relative
                                            ${plan.popular 
                                                ? 'bg-slate-900 text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)]' 
                                                : 'bg-slate-100 text-slate-900 hover:bg-slate-900 hover:text-white'
                                            }
                                        `}>
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                Pay & Start Your Career
                                                <span className="translate-x-0 group-hover/btn:translate-x-1 transition-transform">→</span>
                                            </span>
                                        </button>
                                    </Link>
                                )}

                                <button 
                                    onClick={scrollToNegotiation}
                                    className="w-full mt-4 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-purple-600 bg-slate-50 border border-slate-200 hover:border-purple-200 hover:shadow-[0_10px_25px_rgba(147,51,234,0.1)] transition-all duration-500 relative overflow-hidden group/neg"
                                >
                                    <span className="relative z-10">Proceed to Pay & Secure Job</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 -translate-x-full group-hover/neg:translate-x-full transition-transform duration-1000" />
                                </button>
                            </div>

                            {/* Background accent glow on hover */}
                            <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-[0.03] blur-3xl transition-opacity duration-700 rounded-full`} />
                        </motion.div>
                    ))}
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-20 text-center"
                >
                    <Link href="/pricing" className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-full text-slate-600 font-bold hover:text-purple-600 hover:border-purple-200 hover:shadow-xl transition-all duration-500 overflow-hidden">
                        <span className="relative z-10">Compare all features and services</span>
                        <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </Link>
                </motion.div>

                <div ref={negotiationRef} className="mt-32">
                    <NegotiationSection />
                </div>
            </div>

            <style jsx>{`
                @keyframes gradient-x {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 10s ease infinite;
                }
            `}</style>
        </section>
    )
}

