"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { HiMenu, HiX, HiUserCircle, HiLogout, HiUser } from "react-icons/hi"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Navbar() {
    const { data: session } = useSession()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isAccountOpen, setIsAccountOpen] = useState(false)
    const [imageError, setImageError] = useState(false)
    const resumeBuilderUrl = process.env.NEXT_PUBLIC_RESUME_BUILDER_URL || "http://localhost:5173/"

    const toggleMenu = () => setIsOpen(!isOpen)
    const toggleAccount = () => setIsAccountOpen(!isAccountOpen)

    return (
        <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed top-2 lg:top-4 left-2 right-2 lg:left-6 lg:right-6 xl:left-8 xl:right-8 z-50 backdrop-blur-xl bg-white/70 border border-white/40 shadow-sm rounded-3xl"
        >
            <div className="max-w-7xl mx-auto px-3 lg:px-4 xl:px-6 py-3 lg:py-4 flex justify-between items-center">
                <Link href="/">
                    <h1 className="text-lg lg:text-xl xl:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-blue-700 cursor-pointer whitespace-nowrap">
                        Averion Careers
                    </h1>
                </Link>

                {/* Desktop Nav — show at lg (1024px) and above */}
                <nav className="hidden lg:flex gap-3 xl:gap-5 2xl:gap-7 text-gray-800 font-medium items-center">
                    <Link href="/#home" className="text-sm xl:text-base hover:text-purple-600 transition-colors whitespace-nowrap">Home</Link>
                    <Link href="/visa-pathways" className="text-sm xl:text-base hover:text-purple-600 transition-colors whitespace-nowrap">Visa Pathways</Link>
                    <Link href="/proxy-tool" className="text-sm xl:text-base hover:text-purple-600 transition-colors whitespace-nowrap">AI Interview Tool</Link>
                    <a href={resumeBuilderUrl} target="_blank" rel="noopener noreferrer" className="text-sm xl:text-base hover:text-purple-600 transition-colors whitespace-nowrap">AI Resume Tailoring</a>
                    <Link href="/pricing" className="text-sm xl:text-base hover:text-purple-600 transition-colors whitespace-nowrap">Pricing</Link>
                    <Link href="/contact" className="text-sm xl:text-base hover:text-purple-600 transition-colors whitespace-nowrap">Contact</Link>
                    <Link href="/#faq" className="text-sm xl:text-base hover:text-purple-600 transition-colors whitespace-nowrap">FAQ</Link>
                </nav>

                <div className="hidden lg:flex items-center gap-2 xl:gap-3">
                    {/* User Account Icon */}
                    <div className="relative">
                        <button 
                            onClick={session ? toggleAccount : () => router.push('/auth/signin?callbackUrl=/profile')}
                            className="flex items-center justify-center w-9 h-9 xl:w-10 xl:h-10 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                        >
                            {session?.user?.image && !imageError ? (
                                <img 
                                    src={session.user.image} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover" 
                                    onError={() => setImageError(true)} 
                                />
                            ) : (
                                <HiUserCircle className="w-7 h-7 xl:w-8 xl:h-8 text-purple-600" />
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
                        <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-4 xl:px-6 py-2 xl:py-2.5 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 text-sm xl:text-base whitespace-nowrap">
                            Get Started
                        </button>
                    </Link>
                </div>

                {/* Mobile Menu Toggle — show below lg (1024px) */}
                <button
                    className="lg:hidden p-2 text-purple-700 focus:outline-none"
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
                        className="lg:hidden overflow-hidden bg-white/95 rounded-b-3xl border-t border-gray-100"
                    >
                        <nav className="flex flex-col gap-1 px-5 pt-3 pb-5 text-gray-800 font-medium">
                            <Link href="/#home" onClick={toggleMenu} className="hover:text-purple-600 transition-colors py-3 border-b border-gray-100 text-[15px]">Home</Link>
                            <Link href="/visa-pathways" onClick={toggleMenu} className="hover:text-purple-600 transition-colors py-3 border-b border-gray-100 text-[15px]">Visa Pathways</Link>
                            <Link href="/proxy-tool" onClick={toggleMenu} className="hover:text-purple-600 transition-colors py-3 border-b border-gray-100 text-[15px]">AI Interview Tool</Link>
                            <a href={resumeBuilderUrl} target="_blank" rel="noopener noreferrer" onClick={toggleMenu} className="hover:text-purple-600 transition-colors py-3 border-b border-gray-100 block text-[15px]">AI Resume Tailoring</a>
                            <Link href="/pricing" onClick={toggleMenu} className="hover:text-purple-600 transition-colors py-3 border-b border-gray-100 text-[15px]">Pricing</Link>
                            <Link href="/contact" onClick={toggleMenu} className="hover:text-purple-600 transition-colors py-3 border-b border-gray-100 text-[15px]">Contact</Link>
                            <Link href="/#faq" onClick={toggleMenu} className="hover:text-purple-600 transition-colors py-3 border-b border-gray-100 text-[15px]">FAQ</Link>
                            
                            {/* Mobile User Section */}
                            <div className="py-3 border-b border-gray-100">
                                {session ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {session.user.image && !imageError ? (
                                                <img 
                                                    src={session.user.image} 
                                                    alt="Profile" 
                                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0" 
                                                    onError={() => setImageError(true)}
                                                />
                                            ) : (
                                                <HiUserCircle className="w-10 h-10 text-purple-600 flex-shrink-0" />
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{session.user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => signOut()} className="p-2 text-red-500 flex-shrink-0">
                                            <HiLogout size={24} />
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => router.push('/auth/signin?callbackUrl=/profile')}
                                        className="flex items-center gap-3 w-full py-2 text-purple-700 font-bold"
                                    >
                                        <HiUserCircle size={24} />
                                        Sign In with Google
                                    </button>
                                )}
                            </div>

                            <Link href="/pricing" onClick={toggleMenu} className="mt-2">
                                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg">
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
