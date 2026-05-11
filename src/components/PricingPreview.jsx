"use client"

import { motion } from "framer-motion"
import { HiCheckCircle, HiStar, HiSparkles } from "react-icons/hi"
import { useRef, useEffect, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
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
            "Actual interview question sheets",
            "Dedicated Placement Manager"
        ],
        gradient: "from-pink-500 to-rose-500",
        shadow: "hover:shadow-rose-500/30",
        popular: false
    }
]

const RazorpayButton = ({ buttonId, children, isSelected, onSelect }) => {
    const { data: session } = useSession();
    const router = useRouter();
    const containerRef = useRef(null);
    const rzpButtonRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = '';

        const script = document.createElement('script');
        script.src = "https://checkout.razorpay.com/v1/payment-button.js";
        script.setAttribute('data-payment_button_id', buttonId);
        script.async = true;

        const form = document.createElement('form');
        form.appendChild(script);
        
        // Use opacity and absolute positioning instead of display:none
        form.style.position = 'absolute';
        form.style.opacity = '0';
        form.style.pointerEvents = 'none';
        form.style.width = '1px';
        form.style.height = '1px';
        form.style.overflow = 'hidden';
        
        containerRef.current.appendChild(form);

        const findButton = () => {
            const btn = containerRef.current.querySelector('button');
            if (btn) {
                rzpButtonRef.current = btn;
                return true;
            }
            return false;
        };

        const observer = new MutationObserver(() => {
            if (findButton()) observer.disconnect();
        });

        observer.observe(containerRef.current, { childList: true, subtree: true });

        const interval = setInterval(() => {
            if (findButton()) clearInterval(interval);
        }, 500);

        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    }, [buttonId]);

    const handleTrigger = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!isSelected) {
            onSelect();
            return;
        }

        if (!session) {
            router.push('/auth/signin');
            return;
        }
        
        if (rzpButtonRef.current) {
            rzpButtonRef.current.click();
        } else {
            console.warn("Razorpay button is initializing, please try again in a second.");
        }
    };

    return (
        <div className="w-full relative">
            <div ref={containerRef} className="absolute inset-0 pointer-events-none opacity-0" />
            <div onClick={handleTrigger} className="cursor-pointer">
                {children}
            </div>
        </div>
    );
};

export default function PricingPreview() {
    const { data: session } = useSession()
    const router = useRouter()
    const [selectedPlanName, setSelectedPlanName] = useState("3 Proxy + Marketing")
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
                            Select the plan that fits your career goals. <br />
                            Only one active package allowed per selection.
                        </p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto items-stretch">
                    {plans.map((plan, index) => {
                        const isSelected = selectedPlanName === plan.name;
                        
                        return (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: index * 0.1 }}
                                onClick={() => setSelectedPlanName(plan.name)}
                                className={`group relative flex flex-col h-full bg-white rounded-[2rem] border transition-all duration-500 overflow-hidden cursor-pointer ${
                                    isSelected 
                                    ? 'border-purple-400 shadow-[0_20px_50px_rgba(147,51,234,0.15)] scale-105 z-20 md:-translate-y-2' 
                                    : 'border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-10'
                                }`}
                            >
                                {plan.popular && !isSelected && (
                                    <div className="absolute top-0 left-0 w-full">
                                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-2 text-center">
                                            <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5">
                                                <HiStar className="text-yellow-300 animate-pulse" /> Most Popular
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className={`p-8 ${plan.popular || isSelected ? 'pt-12' : ''} flex-1`}>
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className={`text-xl font-black ${isSelected ? 'text-purple-900' : 'text-slate-800'}`}>{plan.name}</h3>
                                            {isSelected && <HiCheckCircle className="text-purple-600 text-2xl" />}
                                        </div>
                                        <p className="text-slate-400 text-sm font-medium leading-snug min-h-[40px]">{plan.description}</p>
                                    </div>
                                    
                                    <div className={`mb-8 p-6 rounded-2xl border transition-colors duration-300 ${isSelected ? 'bg-purple-50 border-purple-100' : 'bg-slate-50/50 border-slate-100 group-hover:bg-white group-hover:border-purple-100'}`}>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-black text-slate-900 tracking-tighter">${plan.price}</span>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{plan.subtitle}</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 group/item">
                                                <div className={`mt-1 p-0.5 rounded-full bg-gradient-to-r ${plan.gradient} shadow-sm transition-transform ${isSelected ? 'scale-110' : 'group-hover/item:scale-110'}`}>
                                                    <HiCheckCircle className="text-white text-lg" />
                                                </div>
                                                <span className={`font-semibold text-sm leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="px-8 pb-8 mt-auto">
                                    {plan.name === 'Marketing Only' ? (
                                        <RazorpayButton 
                                            buttonId="pl_So2gTMvs2tajA1"
                                            isSelected={isSelected}
                                            onSelect={() => setSelectedPlanName(plan.name)}
                                        >
                                            <button 
                                                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 overflow-hidden relative
                                                ${isSelected 
                                                    ? 'bg-slate-900 text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)]' 
                                                    : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                                }
                                            `}>
                                                <span className="relative z-10 flex items-center justify-center gap-2">
                                                    {isSelected ? (session ? 'Pay & Start Your Career' : 'Login to Pay') : 'Select Plan'}
                                                </span>
                                            </button>
                                        </RazorpayButton>
                                    ) : (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isSelected) {
                                                    setSelectedPlanName(plan.name);
                                                } else if (!session) {
                                                    router.push('/auth/signin');
                                                } else {
                                                    router.push('/pricing');
                                                }
                                            }}
                                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 overflow-hidden relative
                                                ${isSelected 
                                                    ? 'bg-slate-900 text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)]' 
                                                    : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                                }
                                            `}>
                                                <span className="relative z-10 flex items-center justify-center gap-2">
                                                    {isSelected ? (session ? 'Pay & Start Your Career' : 'Login to Pay') : 'Select Plan'}
                                                </span>
                                            </button>
                                    )}

                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            scrollToNegotiation();
                                        }}
                                        className="w-full mt-4 py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] text-slate-400 hover:text-purple-600 bg-slate-50 border border-slate-200 hover:border-purple-200 transition-all duration-500 relative overflow-hidden group/neg"
                                    >
                                        <span className="relative z-10">Check our Negotiation Plan also</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 -translate-x-full group-hover/neg:translate-x-full transition-transform duration-1000" />
                                    </button>
                                </div>

                                {/* Background accent glow on hover */}
                                <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${plan.gradient} ${isSelected ? 'opacity-10' : 'opacity-0 group-hover:opacity-[0.03]'} blur-3xl transition-opacity duration-700 rounded-full`} />
                            </motion.div>
                        );
                    })}
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
