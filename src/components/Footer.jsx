"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube, FaWhatsapp } from "react-icons/fa6"
import { HiOutlineMail, HiOutlineLocationMarker } from "react-icons/hi"

export default function Footer() {
    return (
        <footer className="relative overflow-hidden">

            {/* CTA Section */}
            <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 py-16 md:py-24 px-6">
                {/* Decorative blurred circles */}
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative text-center"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">
                        Try <span className="text-yellow-300">Averion Group</span> today
                    </h2>
                    <p className="text-purple-200 mb-8 text-base italic">
                        Transparent pricing. No hidden fees.
                    </p>
                    <Link
                        href="/pricing"
                        className="inline-block bg-white text-purple-700 font-bold px-10 py-3.5 rounded-full hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg"
                    >
                        Get Started Now
                    </Link>
                </motion.div>
            </div>

            {/* Multi-Column Footer Content */}
            <div className="bg-gray-900 text-gray-300">
                <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12 md:pt-16 pb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">

                        {/* Brand Column */}
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Averion <span className="text-purple-400">Group</span>
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Empowering careers and connecting top talent with leading companies. Your dream job is just one launch away.
                            </p>
                            <div className="flex gap-3">
                                <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-purple-600 hover:text-white transition-all duration-300">
                                    <FaInstagram size={16} />
                                </a>
                                <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-purple-600 hover:text-white transition-all duration-300">
                                    <FaLinkedinIn size={16} />
                                </a>
                                <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-purple-600 hover:text-white transition-all duration-300">
                                    <FaXTwitter size={16} />
                                </a>
                                <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-purple-600 hover:text-white transition-all duration-300">
                                    <FaYoutube size={16} />
                                </a>
                            </div>
                        </div>

                        {/* Product Column */}
                        <div>
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Product</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/#workflows" className="hover:text-purple-400 transition-colors">Resume Sync & Optimization</Link></li>
                                <li><Link href="/proxy-tool" className="hover:text-purple-400 transition-colors">AI Proxy Tool</Link></li>
                                <li><Link href="/visa-pathways" className="hover:text-purple-400 transition-colors">Visa Pathways</Link></li>
                                <li><Link href="/#services" className="hover:text-purple-400 transition-colors">Guaranteed Placement</Link></li>
                                <li><Link href="/#integrations" className="hover:text-purple-400 transition-colors">AI Interview Support</Link></li>
                            </ul>
                        </div>

                        {/* Company Column */}
                        <div>
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Company</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/about" className="hover:text-purple-400 transition-colors">About Us</Link></li>
                                <li><Link href="/#faq" className="hover:text-purple-400 transition-colors">FAQ</Link></li>
                                <li><Link href="/terms" className="hover:text-purple-400 transition-colors">Terms & Conditions</Link></li>
                                <li><Link href="/privacy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/refund" className="hover:text-purple-400 transition-colors">Refund Policy</Link></li>
                                <li><Link href="/cookies" className="hover:text-purple-400 transition-colors">Cookies Policy</Link></li>
                            </ul>
                        </div>

                        {/* Contact Column */}
                        <div>
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Contact</h4>
                            <ul className="space-y-4 text-sm">
                                <li className="flex items-center gap-3">
                                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600/20 text-green-400 shrink-0">
                                        <FaWhatsapp size={16} />
                                    </span>
                                    <a href="https://wa.me/15068055727" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">+1 506 805 5727</a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-600/20 text-purple-400 shrink-0">
                                        <HiOutlineMail size={16} />
                                    </span>
                                    <a href="mailto:hello@averiongroup.com" className="hover:text-purple-400 transition-colors">hello@averiongroup.com</a>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600/20 text-red-400 shrink-0 mt-0.5">
                                        <HiOutlineLocationMarker size={16} />
                                    </span>
                                    <span>Sector 62, Noida, Uttar Pradesh, India — 201301</span>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-lg">
                    <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">
                            © {new Date().getFullYear()} <span className="font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Averion Group</span>. All rights reserved.
                        </p>
                        <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-400">
                            <Link href="/pricing" className="hover:text-purple-400 hover:scale-105 transition-all duration-300">Pricing</Link>
                            <Link href="/#faq" className="hover:text-purple-400 hover:scale-105 transition-all duration-300">Help</Link>
                            <Link href="/terms" className="hover:text-purple-400 hover:scale-105 transition-all duration-300">Terms</Link>
                            <Link href="/privacy" className="hover:text-purple-400 hover:scale-105 transition-all duration-300">Privacy Policy</Link>
                        </nav>
                    </div>
                </div>
            </div>

        </footer>
    )
}
