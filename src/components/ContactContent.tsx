"use client"

import { motion } from "framer-motion"
import { HiOutlineMail, HiOutlineLocationMarker, HiOutlinePhone, HiSparkles } from "react-icons/hi"
import { FaWhatsapp } from "react-icons/fa6"

const ContactContent = () => {
    return (
        <section className="py-32 relative overflow-hidden bg-[#030014]">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* Left Column: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                            <HiSparkles className="text-yellow-400" />
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/80">Get In Touch</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
                            Let's Build Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">Future Together.</span>
                        </h1>
                        <p className="text-gray-400 text-lg mb-12 max-w-lg leading-relaxed">
                            Have questions about our placement program or the AI Proxy Tool? Our experts are here to help you navigate your career path.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                                    <HiOutlineMail size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-1">Email Us</h4>
                                    <p className="text-gray-400">hello@averiongroup.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-green-400 group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
                                    <FaWhatsapp size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-1">WhatsApp</h4>
                                    <p className="text-gray-400">+91 98765 43210</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                    <HiOutlineLocationMarker size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-1">Visit Us</h4>
                                    <p className="text-gray-400 leading-relaxed">
                                        Sector 62, Noida, <br />
                                        Uttar Pradesh, India — 201301
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-[100px] rounded-full -z-10" />
                        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl">
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-2">Full Name</label>
                                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-2">Email Address</label>
                                        <input type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="john@example.com" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-2">Subject</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none">
                                        <option className="bg-gray-900">Placement Program</option>
                                        <option className="bg-gray-900">AI Proxy Tool</option>
                                        <option className="bg-gray-900">Visa Pathway</option>
                                        <option className="bg-gray-900">General Inquiry</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-2">Message</label>
                                    <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="How can we help you?"></textarea>
                                </div>
                                <button className="w-full py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-purple-600 hover:text-white transition-all duration-500 shadow-xl">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style jsx>{`
                @keyframes gradient-x {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 8s ease infinite;
                }
            `}</style>
        </section>
    )
}

export default ContactContent
