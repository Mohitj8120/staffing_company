"use client"

import { motion } from "framer-motion"
import { HiCheck, HiOutlineSparkles, HiOutlineQuestionMarkCircle } from "react-icons/hi"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import NegotiationSection from "./NegotiationSection"

const plans = [
    {
        id: "proxy",
        name: "Proxy Tool Only",
        price: "125",
        subtitle: "One-time Only",
        description: "Perfect for candidates who need technical assistance during live interviews.",
        features: [
            "2 Proxy interview sessions",
            "Max 2 hours duration per interview",
            "100% success rate of passing",
            "Undetectable even in HackerRank",
            "Invisible while screen sharing",
            "Support for 20+ technologies"
        ],
        featured: false,
        color: "blue"
    },
    {
        id: "marketing",
        name: "Marketing Only",
        price: "750",
        subtitle: "Valid for 7 months",
        description: "Direct ties with major companies to secure your interview calls.",
        features: [
            "+ $920 on offer letter acceptance",
            "+ 9% in 90 days for the 1st year of post employment",
            "Direct company tie-ups",
            "Actual interview question sheets",
            "Dedicated Placement Manager",
            "Weekly mock interviews"
        ],
        featured: false,
        color: "indigo"
    },
    {
        id: "combo",
        name: "3 Proxy + Marketing",
        price: "800",
        subtitle: "Valid for 7 months",
        description: "Combined power of guaranteed interviews and technical proxy support.",
        features: [
            "+ $920 on offer letter acceptance",
            "+ 9% in 90 days for the 1st year of post employment",
            "3 Proxy interviews support",
            "Direct company tie-ups",
            "Actual interview question sheets",
            "Dedicated Placement Manager"
        ],
        featured: true,
        color: "purple"
    },
    {
        id: "unlimited",
        name: "Unlimited Proxy + Marketing",
        price: "1,000",
        subtitle: "Valid for 7 months",
        description: "The ultimate package. Unlimited support until you're formally hired.",
        features: [
            "+ $920 on offer letter acceptance",
            "+ 9% in 90 days for the 1st year of post employment",
            "Unlimited Proxy support",
            "Direct company tie-ups",
            "Actual interview question sheets",
            "Dedicated Placement Manager"
        ],
        featured: false,
        color: "rose"
    }
]

const faqs = [
    {
        q: "What is the Proxy Interview Tool?",
        a: "Our tool allows experts to assist you during technical interviews seamlessly. It's invisible to screen-sharing software and undetectable by platforms like HackerRank."
    },
    {
        q: "How does the 'Marketing Only' plan work?",
        a: "We leverage our direct partnerships with HRs and technical leads at top firms to get your resume to the top of the pile and guarantee interview calls."
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

const RazorpayButton = ({ buttonId, children }) => {
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

export default function PricingFullContent() {
    const [selectedPlanId, setSelectedPlanId] = useState("combo") // Default selection
    const [hoveredPlan, setHoveredPlan] = useState(null)
    const negotiationRef = useRef(null)

    const scrollToNegotiation = () => {
        negotiationRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="bg-[#030014] min-h-screen text-white pt-32 pb-20 overflow-hidden selection:bg-purple-500/30">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-xl"
                    >
                        <HiOutlineSparkles className="text-purple-400" />
                        <span className="text-xs font-black tracking-widest uppercase">Premium Plans</span>
                    </motion.div>
                    <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter">
                        Transparent <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400">
                            Professional Support.
                        </span>
                    </h1>
                    <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
                        Select a package to view details and proceed. <br />
                        One plan per selection for maximum focus.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
                    {plans.map((plan, index) => {
                        const isSelected = selectedPlanId === plan.id;
                        
                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onHoverStart={() => setHoveredPlan(plan.id)}
                                onHoverEnd={() => setHoveredPlan(null)}
                                onClick={() => setSelectedPlanId(plan.id)}
                                className={`relative group p-8 rounded-[2.5rem] border backdrop-blur-2xl transition-all duration-700 cursor-pointer h-full flex flex-col
                                    ${isSelected 
                                        ? 'bg-white/10 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)] ring-1 ring-purple-500/30' 
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }
                                `}
                            >
                                {plan.featured && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                        Best Value
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`text-xl font-black ${isSelected ? 'text-white' : 'text-gray-400'}`}>{plan.name}</h3>
                                        {isSelected && <HiCheck className="text-purple-400 text-2xl" />}
                                    </div>
                                    <div className="flex items-baseline gap-1 mb-2">
                                        <span className="text-5xl font-black tracking-tighter">${plan.price}</span>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{plan.subtitle}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium leading-relaxed min-h-[60px]">
                                        {plan.description}
                                    </p>
                                </div>

                                <ul className="space-y-4 mb-10 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className={`mt-1 p-0.5 rounded-full ${isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-600'} transition-colors duration-300`}>
                                                <HiCheck className="text-sm" />
                                            </div>
                                            <span className={`text-sm font-semibold transition-colors duration-300 ${isSelected ? 'text-gray-200' : 'text-gray-500'}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto">
                                    {plan.id === 'marketing' ? (
                                        <RazorpayButton buttonId="pl_So2gTMvs2tajA1">
                                            <button className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 group relative overflow-hidden
                                                ${isSelected 
                                                    ? 'bg-white text-purple-900 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                                                    : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                                }
                                            `}>
                                                <span className="relative z-10 flex items-center justify-center gap-2">
                                                    {isSelected ? 'Pay & Start Your Career' : 'Select Plan'}
                                                    {isSelected && <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>}
                                                </span>
                                            </button>
                                        </RazorpayButton>
                                    ) : (
                                        <button className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 group relative overflow-hidden
                                            ${isSelected 
                                                ? 'bg-white text-purple-900 shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                                                : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                            }
                                        `}>
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {isSelected ? 'Pay & Start Your Career' : 'Select Plan'}
                                                {isSelected && <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>}
                                            </span>
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            )}
                                        </button>
                                    )}

                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            scrollToNegotiation();
                                        }}
                                        className="w-full mt-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors duration-300"
                                    >
                                        Negotiate with us
                                    </button>
                                </div>

                                {/* Background accent glow on select */}
                                <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500 to-blue-500 blur-3xl transition-opacity duration-700 rounded-full
                                    ${isSelected ? 'opacity-[0.08]' : 'opacity-0'}
                                `} />
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-32 mb-40">
                    <div className="flex items-center gap-4 mb-16">
                        <div className="h-px flex-1 bg-white/10" />
                        <h2 className="text-4xl font-black tracking-tighter">Frequently Asked Questions</h2>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <HiOutlineQuestionMarkCircle className="text-xl" />
                                    </div>
                                    <h4 className="font-bold text-lg">{faq.q}</h4>
                                </div>
                                <p className="text-gray-400 leading-relaxed font-medium">
                                    {faq.a}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div ref={negotiationRef}>
                    <NegotiationSection />
                </div>
            </div>
        </div>
    )
}
