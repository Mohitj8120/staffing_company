"use client"

import { motion } from "framer-motion"

const RefundContent = () => {
    return (
        <section className="py-24 bg-[#030014] min-h-screen">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                        Refund <span className="text-purple-500">Policy</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Our commitment to transparency and fairness.</p>
                </motion.div>

                <div className="space-y-12 text-gray-300 leading-relaxed">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl"
                    >
                        <h2 className="text-2xl font-bold text-white mb-4">1. One-Time Payments</h2>
                        <p>
                            All one-time payments, including the Elite Fixed Package, Proxy Tool Access, and standalone tool purchases, are 
                            <span className="text-white font-bold"> non-refundable</span>. Once payment is processed and access is granted to our 
                            premium resources, tools, or placement network, we cannot issue a refund under any circumstances. 
                            We encourage all candidates to review our platform and success stories before making a commitment.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl"
                    >
                        <h2 className="text-2xl font-bold text-white mb-4">2. Monthly Subscription Plans</h2>
                        <p>
                            For candidates enrolled in our Hybrid Accelerator (Monthly) plans, we offer a flexible subscription model. 
                            You have the <span className="text-white font-bold">freedom to stop your subscription at any time</span>. 
                            Upon cancellation, you will retain access until the end of your current billing period, and no further 
                            charges will be applied. However, please note that we do not offer refunds or credits for any partial 
                            months or past payments.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl"
                    >
                        <h2 className="text-2xl font-bold text-white mb-4">3. Success Fee Negotiation</h2>
                        <p>
                            Negotiated success fees (e.g., the 18% or 25% post-employment percentages) are only payable after 
                            you have successfully secured an offer letter and completed the 90-day post-employment period. 
                            These fees are based on performance and results delivered by Averion Careers and are therefore 
                            non-refundable once the target outcome (job placement) has been achieved.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-center pt-8 border-t border-white/10"
                    >
                        <p className="text-sm text-gray-500">
                            By using our services, you agree to these terms. If you have any questions regarding our 
                            refund policy, please contact our support team.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default RefundContent
