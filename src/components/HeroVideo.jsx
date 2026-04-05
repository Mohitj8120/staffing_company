"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function HeroVideo() {

    return (

        <section className="relative overflow-hidden bg-gradient-to-b from-blue-800 via-blue-700 to-gray-100 text-white pt-28 md:pt-40 pb-20 md:pb-32 m-4 md:m-8 rounded-3xl md:rounded-[40px] border border-white/20 shadow-sm">

            {/* background blur clouds */}

            <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-white opacity-20 blur-3xl rounded-full" />
            <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-white opacity-20 blur-3xl rounded-full" />

            <div className="max-w-6xl mx-auto text-center px-6">

                {/* main title */}

                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-6xl font-semibold leading-tight px-2">

                    Launch your career toolkit

                </motion.h1>

                {/* subtitle */}

                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl md:text-4xl italic font-light mt-3 text-blue-200">

                    to Grow and Monetize

                </motion.h2>

                {/* description */}

                <p className="mt-6 text-blue-100 max-w-xl mx-auto">

                    Grow your reach, earn more, and save time so you can focus on delivering<br className="hidden md:block"/> real value to your audience.

                </p>

                {/* button */}
                <Link href="/pricing" className="mt-8 inline-block">
                    <button className="bg-white text-black px-6 py-3 rounded-full flex items-center gap-2 mx-auto shadow-lg hover:scale-105 transition">
                        → Get Started
                    </button>
                </Link>

                {/* video label */}

                <h3 className="mt-16 md:mt-20 text-gray-700 text-lg md:text-xl font-semibold px-4">

                    Watch how we help students get jobs faster

                </h3>

                {/* video */}

                <div className="mt-6 max-w-4xl mx-auto rounded-2xl overflow-hidden border-4 border-white shadow-2xl">

                    <iframe
                        className="w-full aspect-video"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        allowFullScreen
                    />

                </div>

            </div>

        </section>

    )

}
