"use client"

import { signIn, useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { HiShieldCheck, HiSparkles } from "react-icons/hi"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import Link from "next/link"

function SignInContent() {
    const { status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/'

    useEffect(() => {
        if (status === "authenticated") {
            router.push(callbackUrl)
        }
    }, [status, router, callbackUrl])

    return (
        <div className="min-h-screen bg-[#030014] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 blur-[120px] rounded-full" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full" />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 relative z-10 shadow-2xl"
            >
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/20">
                        <HiShieldCheck className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Secure Access</h1>
                    <p className="text-gray-400 font-medium">Join Averion Group to manage your placements and support tools.</p>
                </div>

                <div className="space-y-4">
                    <button 
                        onClick={() => signIn('google', { callbackUrl })}
                        className="w-full flex items-center justify-center gap-4 bg-white py-5 rounded-2xl font-black text-black hover:bg-gray-100 transition-all duration-300 shadow-xl"
                    >
                        <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-6 h-6" />
                        Continue with Google
                    </button>
                    
                    <div className="relative py-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                            <span className="bg-[#030014] px-4 text-gray-500">Trusted by Professionals</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                            <HiSparkles className="text-purple-400 mx-auto mb-2 text-xl" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 leading-tight">Fast Onboarding</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                            <HiShieldCheck className="text-blue-400 mx-auto mb-2 text-xl" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 leading-tight">Secure Payments</p>
                        </div>
                    </div>
                </div>

                <p className="mt-12 text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
                    By continuing, you agree to our <br />
                    <Link href="/terms" className="text-white/40 underline underline-offset-4 cursor-pointer hover:text-white">Terms of Service</Link> and <Link href="/privacy" className="text-white/40 underline underline-offset-4 cursor-pointer hover:text-white">Privacy Policy</Link>
                </p>
            </motion.div>
        </div>
    )
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#030014] flex items-center justify-center text-white font-bold">Loading Auth...</div>}>
            <SignInContent />
        </Suspense>
    )
}
