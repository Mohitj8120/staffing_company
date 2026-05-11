"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { HiMenu, HiX, HiUserCircle, HiLogout, HiUser } from "react-icons/hi"
import { useSession, signIn, signOut } from "next-auth/react"

export default function Navbar() {
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [isAccountOpen, setIsAccountOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)
    const toggleAccount = () => setIsAccountOpen(!isAccountOpen)

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
                    <Link href="/contact" className="hover:text-purple-600 transition-colors">Contact</Link>
                    <Link href="/#faq" className="hover:text-purple-600 transition-colors">FAQ</Link>
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    {/* User Account Icon */}
                    <div className="relative">
                        <button 
                            onClick={session ? toggleAccount : () => signIn('google')}
                            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                        >
                            {session?.user?.image ? (
                                <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <HiUserCircle className="w-8 h-8 text-purple-600" />
                            )}
                        </button>

                        <AnimatePresence>
                            {isAccountOpen && session && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-100 shadow-xl overflow-hidden z-50 p-2"
                                >
                                    <div className="px-4 py-3 border-b border-gray-50 mb-2">
                                        <p className="text-sm font-bold text-gray-900 truncate">{session.user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                                    </div>
                                    <Link 
                                        href="/profile" 
                                        onClick={() => setIsAccountOpen(false)}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors mb-1"
                                    >
                                        <HiUser className="w-5 h-5 text-purple-600" />
                                        My Profile
                                    </Link>
                                    <button 
                                        onClick={() => signOut()}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <HiLogout className="w-5 h-5" />
                                        Sign Out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

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
                            <Link href="/contact" onClick={toggleMenu} className="hover:text-purple-600 transition-colors py-2 border-b border-gray-100">Contact</Link>
                            <Link href="/#faq" onClick={toggleMenu} className="hover:text-purple-600 transition-colors py-2 border-b border-gray-100">FAQ</Link>
                            
                            {/* Mobile User Section */}
                            <div className="py-4 border-b border-gray-100">
                                {session ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={session.user.image} alt="Profile" className="w-10 h-10 rounded-full" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{session.user.name}</p>
                                                <p className="text-xs text-gray-500">{session.user.email}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => signOut()} className="p-2 text-red-500">
                                            <HiLogout size={24} />
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => signIn('google')}
                                        className="flex items-center gap-3 w-full py-2 text-purple-700 font-bold"
                                    >
                                        <HiUserCircle size={24} />
                                        Sign In with Google
                                    </button>
                                )}
                            </div>

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
