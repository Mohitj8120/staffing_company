"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function Navbar() {

    return (

        <motion.header
            initial={{ y: -80 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed top-2 md:top-4 left-4 right-4 md:left-8 md:right-8 z-50 backdrop-blur-xl bg-white/70 border border-white/40 shadow-sm rounded-3xl">

            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                <h1 className="text-xl font-bold text-purple-700">
                    CareerLaunch
                </h1>

                <nav className="hidden md:flex gap-8 text-black">

                    <Link href="/#home">Home</Link>
                    <Link href="/visa-pathways">Visa Pathways</Link>
                    <Link href="/proxy-tool">AI Interview Tool</Link>
                    <Link href="#">Pricing</Link>
                    <Link href="#">FAQ</Link>

                </nav>

                <button className="bg-linear-to-r from-purple-600 to-blue-600 text-white px-5 py-2 rounded-xl shadow-lg hover:scale-105 transition">
                    Get Started
                </button>

            </div>

        </motion.header>

    )

}
