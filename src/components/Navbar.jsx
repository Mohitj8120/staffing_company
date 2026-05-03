"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { HiMenu, HiX } from "react-icons/hi"

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)

    return (
        <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed top-2 md:top-4 left-2 right-2 md:left-8 md:right-8 z-50 backdrop-blur-xl bg-white/70 border border-white/40 shadow-sm rounded-3xl"
        >
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
                <Link href="/">
                    <h1 className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-blue-700 cursor-pointer">
                        Averion Group
                    </h1>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-8 text-gray-800 font-medium items-center">
                    <Link href="/#home" className="hover:text-purple-600 transition-colors">Home</Link>
                    <Link href="/visa-pathways" className="hover:text-purple-600 transition-colors">Visa Pathways</Link>
                    <Link href="/proxy-tool" className="hover:text-purple-600 transition-colors">AI Interview Tool</Link>
                    <Link href="/pricing" className="hover:text-purple-600 transition-colors">Pricing</Link>
                    <Link href="/#faq" className="hover:text-purple-600 transition-colors">FAQ</Link>
                </nav>

                <div className="hidden md:block">
                    <Link href="/pricing">
                        <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300">
                            Get Started
                        </button>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-purple-700 focus:outline-none"
                    onClick={toggleMenu}
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden overflow-hidden bg-white/95 rounded-b-3xl border-t border-gray-100"
                    >
                        <nav className="flex flex-col gap-4 px-6 pt-4 pb-6 text-gray-800 font-medium">
                            <Link href="/#home" onClick={toggleMenu} className="hover:text-purple-600 transition-colors py-2 border-b border-gray-100">Home</Link>
                            <Link href="/visa-pathways" onClick={toggleMenu} className="hover:text-purple-600 transition-colors py-2 border-b border-gray-100">Visa Pathways</Link>
                            <Link href="/proxy-tool" onClick={toggleMenu} className="hover:text-purple-600 transition-colors py-2 border-b border-gray-100">AI Interview Tool</Link>
                            <Link href="/pricing" onClick={toggleMenu} className="hover:text-purple-600 transition-colors py-2 border-b border-gray-100">Pricing</Link>
                            <Link href="/#faq" onClick={toggleMenu} className="hover:text-purple-600 transition-colors py-2 border-b border-gray-100">FAQ</Link>
                            <Link href="/pricing" onClick={toggleMenu}>
                                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg mt-2">
                                    Get Started
                                </button>
                            </Link>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    )
}
