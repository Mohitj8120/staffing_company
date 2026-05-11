"use client"

import { motion, AnimatePresence } from "framer-motion"
import { HiLightningBolt, HiBadgeCheck, HiGlobeAlt, HiChevronRight, HiSparkles, HiPlusCircle, HiCheckCircle } from "react-icons/hi"
import { useState, useRef } from "react"
import { useSession, signIn } from "next-auth/react"

const negotiateOptions = [
    {
        id: "flex-monthly",
        title: "Hybrid Accelerator",
        subtitle: "Monthly Flexibility",
        price: 100,
        billing: "/Monthly for 7 months",
        secondaryPrice: "18%",
        secondaryLabel: "on Success",
        features: [
            "+ $920 on offer letter acceptance",
            "+ 18% in 90 days for the 1st year of post employment",
            "Direct company tie-ups",
            "Actual interview question sheets",
            "Targeted resume creation",
            "Dedicated Placement Manager"
        ],
        gradient: "from-blue-600 via-cyan-500 to-indigo-600",
        icon: <HiLightningBolt className="w-8 h-8 text-white" />,
        popular: false
    },
    {
        id: "one-time-fixed",
        title: "Elite Fixed Package",
        subtitle: "Maximum Value Plan",
        price: 100,
        billing: "One-Time",
        secondaryPrice: "25%",
        secondaryLabel: "on Success",
        features: [
            "+ $920 on offer letter acceptance",
            "+ 25% in 90 days for the 1st year of post employment",
            "Direct company tie-ups",
            "Actual interview question sheets",
            "Targeted resume creation",
            "Dedicated Placement Manager"
        ],
        gradient: "from-purple-600 via-fuchsia-500 to-pink-600",
        icon: <HiBadgeCheck className="w-8 h-8 text-white" />,
        popular: true
    },
    {
        id: "proxy-tool-only",
        title: "Proxy Tool Only",
        subtitle: "One-time Access",
        price: 125,
        billing: "one-time",
        secondaryPrice: "Instant",
        secondaryLabel: "Delivery",
        features: [
            "2 Proxy interview sessions",
            "Max 2 hours duration each",
            "100% passing success rate",
            "Undetectable in HackerRank",
            "Invisible screen sharing"
        ],
        gradient: "from-emerald-500 via-teal-400 to-blue-500",
        icon: <HiGlobeAlt className="w-8 h-8 text-white" />,
        popular: false,
        isAddonOnly: true
    }
]

export default function NegotiationSection() {
    const { data: session } = useSession()
    const [selectedId, setSelectedId] = useState("one-time-fixed") 
    const [hasProxyAddon, setHasProxyAddon] = useState(false)
    const containerRef = useRef(null)

    const handleSelectPlan = (id) => {
        setSelectedId(id);
        // If switching plans, we might want to keep or clear the addon. 
        // User said "ek baar m ek", so if they switch to a different plan, 
        // the addon remains attached to the NEW selection, OR we clear it.
        // Let's keep it for the new selection if it's a main plan.
        if (id === 'proxy-tool-only') {
            setHasProxyAddon(false); // Standalone doesn't have an addon (it IS the tool)
        }
    }

    const toggleAddon = (e) => {
        e.stopPropagation();
        setHasProxyAddon(!hasProxyAddon);
    }
    
    return (
        <section id="negotiate" ref={containerRef} className="py-32 relative overflow-hidden bg-[#030014]">
            {/* Ultra-Premium Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-1/4 w-[800px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full" />
                <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-pink-600/5 blur-[120px] rounded-full" />
                
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-2xl shadow-2xl"
                    >
                        <HiSparkles className="text-yellow-400 animate-pulse" />
                        <span className="text-xs font-black tracking-[0.3em] uppercase text-white/80">Tailored For You</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]"
                    >
                        Flexible <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
                            Negotiation.
                        </span>
                    </motion.h2>
                    <p className="text-gray-400 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed font-medium">
                        Select one package to proceed. <br className="hidden md:block" /> 
                        Your selection is exclusive.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 xl:gap-12 max-w-5xl mx-auto">
                    {negotiateOptions.filter(p => !p.isAddonOnly).map((plan, idx) => {
                        const isSelected = selectedId === plan.id;
                        const isProxyAdded = isSelected && hasProxyAddon;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: idx * 0.1 }}
                                whileHover={{ rotateX: 2, rotateY: -2, scale: isSelected ? 1 : 1.02 }}
                                onClick={() => handleSelectPlan(plan.id)}
                                className="relative h-full flex perspective-1000 cursor-pointer"
                            >
                                {(plan.popular || isSelected) && <div className={`popular-card-border ${isSelected ? 'opacity-100' : 'opacity-40'}`} />}
                                <div className={`relative flex flex-col w-full bg-white/[0.03] backdrop-blur-3xl border rounded-[3rem] p-8 lg:p-12 transition-all duration-700 overflow-hidden group
                                    ${isSelected ? 'border-purple-500 bg-white/[0.08] shadow-[0_0_80px_rgba(168,85,247,0.2)]' : 'border-white/10 hover:border-white/20 opacity-50 hover:opacity-100'}
                                `}>
                                    
                                    {/* Selection Indicator */}
                                    <div className={`absolute top-10 left-10 flex items-center gap-2 transition-all duration-500 ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                            <HiCheckCircle className="text-white w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Selected Path</span>
                                    </div>

                                    {/* Background glow on hover/select */}
                                    <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${plan.gradient} ${isSelected ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'} blur-[80px] transition-opacity duration-700 rounded-full`} />

                                    {plan.popular && !isSelected && (
                                        <div className="absolute top-10 right-10">
                                            <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-purple-500/30">
                                                Most Popular
                                            </div>
                                        </div>
                                    )}

                                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-10 mt-6 shadow-2xl relative overflow-hidden transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        {plan.icon}
                                    </div>

                                    <div className="mb-10">
                                        <h3 className="text-4xl font-black text-white mb-2 tracking-tight transition-all">
                                            {plan.title}
                                        </h3>
                                        <p className="text-white/40 font-bold text-sm uppercase tracking-widest">{plan.subtitle}</p>
                                    </div>

                                    {/* Premium Price Section */}
                                    <div className="mb-12 flex flex-col gap-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="relative inline-flex items-baseline gap-2">
                                                <span className="text-7xl font-black text-white tracking-tighter">${plan.price}</span>
                                                <span className="text-white/30 text-lg font-bold uppercase tracking-widest">{plan.billing}</span>
                                            </div>
                                            
                                            <AnimatePresence>
                                                {isProxyAdded && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0, x: -20 }}
                                                        animate={{ opacity: 1, height: "auto", x: 0 }}
                                                        exit={{ opacity: 0, height: 0, x: -20 }}
                                                        className="flex items-center gap-2 text-emerald-400 font-black text-xl tracking-tighter"
                                                    >
                                                        <span>+ $125</span>
                                                        <span className="text-[10px] uppercase tracking-[0.2em] opacity-60">(One-time Proxy Tool)</span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-white/[0.05] border border-white/5 relative overflow-hidden group/price">
                                            <div className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} opacity-0 group-hover/price:opacity-10 transition-opacity duration-500`} />
                                            <div className="flex flex-col">
                                                <span className={`text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r ${plan.gradient}`}>
                                                    {plan.secondaryPrice}
                                                </span>
                                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                                                    {plan.secondaryLabel}
                                                </span>
                                            </div>
                                            <div className="h-8 w-px bg-white/10" />
                                            <span className="text-xs font-medium text-white/60 leading-tight">Flexible Payment <br /> Option Available</span>
                                        </div>
                                    </div>

                                    {/* Add-on Upsell */}
                                    <div className={`mb-12 transition-all duration-500 ${isSelected ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden pointer-events-none'}`}>
                                        <div 
                                            onClick={toggleAddon}
                                            className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 flex items-center justify-between group/addon
                                                ${hasProxyAddon 
                                                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                                                    : 'bg-white/5 border-white/10 hover:border-white/30'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${hasProxyAddon ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'}`}>
                                                    {hasProxyAddon ? <HiCheckCircle className="w-7 h-7" /> : <HiPlusCircle className="w-7 h-7" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`font-black text-sm uppercase tracking-widest ${hasProxyAddon ? 'text-emerald-400' : 'text-white'}`}>Add Proxy Tool</span>
                                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">One-time payment only (+$125)</span>
                                                </div>
                                            </div>
                                            {hasProxyAddon && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500 font-black text-xs uppercase tracking-widest">Added</motion.div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-5 mb-12 flex-1">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-4 group/item">
                                                <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center shadow-lg transform group-hover/item:scale-125 transition-transform`}>
                                                    <HiChevronRight className="text-white text-xs" />
                                                </div>
                                                <span className={`text-white/70 text-base font-semibold leading-snug group-hover/item:text-white transition-colors ${isSelected ? 'text-white/90' : ''}`}>
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!session) {
                                                signIn('google', { callbackUrl: window.location.href });
                                            } else {
                                                // Handle actual payment here
                                            }
                                        }}
                                        className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all duration-500 relative overflow-hidden group/btn shadow-2xl
                                        ${isSelected 
                                            ? 'bg-white text-black hover:shadow-purple-500/40' 
                                            : 'bg-white/10 text-white/40 border border-white/5 cursor-not-allowed'
                                        }
                                    `}>
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            {isSelected ? (session ? 'Proceed to Pay & Secure Job' : 'Login to Proceed') : 'Select Plan'}
                                            {isSelected && <HiSparkles className="transition-transform duration-500 group-hover/btn:rotate-45 text-purple-600" />}
                                        </span>
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-700 ease-expo" />
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Proxy Tool Standalone at Bottom */}
                <div className="max-w-3xl mx-auto mt-20">
                    {negotiateOptions.filter(p => p.isAddonOnly).map((plan) => {
                         const isSelected = selectedId === plan.id;
                         
                         return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                onClick={() => handleSelectPlan(plan.id)}
                                className={`backdrop-blur-2xl border rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 group transition-all duration-500 cursor-pointer
                                    ${isSelected 
                                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.1)]' 
                                        : 'bg-white/5 border-white/10 hover:border-white/20 opacity-50 hover:opacity-100'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-2xl relative`}>
                                        {isSelected && (
                                            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[#030014]">
                                                <HiCheckCircle className="text-white w-4 h-4" />
                                            </div>
                                        )}
                                        {plan.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-white tracking-tight">{plan.title}</h4>
                                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{plan.subtitle} — $125 One-time</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!session) {
                                            signIn('google', { callbackUrl: window.location.href });
                                        } else {
                                            // Handle actual payment here
                                        }
                                    }}
                                    className={`px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500
                                    ${isSelected 
                                        ? 'bg-white text-black shadow-lg' 
                                        : 'bg-white/10 text-white/40 border border-white/10'
                                    }
                                `}>
                                    {isSelected ? (session ? 'Pay & Deploy Tool' : 'Login to Pay') : 'Select Tool'}
                                </button>
                            </motion.div>
                         );
                    })}
                </div>
                
                <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-20 text-center text-white/30 font-bold text-sm tracking-widest uppercase"
                >
                    Still undecided? <span className="text-purple-400 cursor-pointer hover:text-white transition-colors underline decoration-purple-400/30 underline-offset-8">Talk to our career expert</span>
                </motion.p>
            </div>

            <style jsx>{`
                @keyframes border-beam {
                    0% { offset-distance: 0%; }
                    100% { offset-distance: 100%; }
                }
                .popular-card-border {
                    position: absolute;
                    inset: 0;
                    border-radius: 3rem;
                    padding: 2px;
                    background: linear-gradient(to right, transparent, rgba(168,85,247,0.5), transparent);
                    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    mask-composite: exclude;
                    pointer-events: none;
                }
                .ease-expo {
                    transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes gradient-x {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 8s ease infinite;
                }
                .bg-grid-white {
                    background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                                    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
                }
            `}</style>
        </section>
    )
}
