"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const faqs = [
    {
        q: "What is CareerLaunch?",
        a: "CareerLaunch is a premium staffing and placement platform that connects talented professionals with top companies across various industries."
    },
    {
        q: "Who is CareerLaunch for?",
        a: "CareerLaunch is for job seekers looking for career opportunities and companies seeking skilled professionals to fill their open positions."
    },
    {
        q: "How does the placement process work?",
        a: "We match candidates with suitable opportunities through our AI-powered matching system, followed by interviews and onboarding support."
    },
    {
        q: "Is CareerLaunch free to use?",
        a: "For job seekers, our basic services are completely free. Premium career coaching and resume services are available at affordable rates."
    },
    {
        q: "What industries do you cover?",
        a: "We cover IT, Healthcare, Finance, Marketing, Engineering, Education, and many more industries with a growing network of partner companies."
    },
    {
        q: "How long does the hiring process take?",
        a: "On average, our placement process takes 2-4 weeks from application to offer, depending on the role and company requirements."
    },
    {
        q: "Do you offer remote job placements?",
        a: "Yes! We have a large selection of remote, hybrid, and on-site positions available across multiple geographies."
    },
    {
        q: "What support do you provide after placement?",
        a: "We offer 90-day post-placement support including onboarding assistance, performance check-ins, and career mentoring."
    },
    {
        q: "How can companies partner with CareerLaunch?",
        a: "Companies can reach out through our Get Started page or contact our business team directly to discuss partnership and staffing solutions."
    },
    {
        q: "What makes CareerLaunch different?",
        a: "Our AI-driven matching, dedicated career coaches, and 95%+ placement success rate set us apart from traditional staffing agencies."
    },
    {
        q: "Can I track my application status?",
        a: "Yes, our dashboard gives you real-time updates on your application status, interview schedules, and feedback from employers."
    },
    {
        q: "Do you provide interview preparation?",
        a: "Absolutely! We offer mock interviews, resume reviews, and personalized coaching to help you ace your interviews."
    },
    {
        q: "What types of roles do you fill?",
        a: "We fill roles across all levels — from entry-level positions and internships to senior management and C-suite executive placements."
    },
    {
        q: "Do you offer contract staffing?",
        a: "Yes, we provide both permanent placements and flexible contract staffing solutions tailored to your business needs."
    },
    {
        q: "How do you ensure candidate quality?",
        a: "Every candidate goes through a rigorous screening process including skill assessments, background checks, and reference verification."
    },
    {
        q: "Can I update my resume on the platform?",
        a: "Yes! You can upload, update, and manage multiple versions of your resume directly from your CareerLaunch dashboard."
    },
    {
        q: "Is there a mobile app available?",
        a: "We are working on a mobile app. Currently, our platform is fully responsive and works seamlessly on all mobile browsers."
    },
    {
        q: "How do I contact support?",
        a: "You can reach our support team via email at support@careerlaunch.io or through the live chat feature available on our website."
    },
]

function FAQItem({ question, answer }) {
    const [open, setOpen] = useState(false)

    return (
        <div
            className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow duration-300"
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center px-5 py-4 text-left gap-3 cursor-pointer"
            >
                <span className="text-sm font-medium text-gray-800">{question}</span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-400 text-lg shrink-0"
                >
                    ▾
                </motion.span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function FAQ() {
    // Split FAQs into 3 columns
    const colSize = Math.ceil(faqs.length / 3)
    const col1 = faqs.slice(0, colSize)
    const col2 = faqs.slice(colSize, colSize * 2)
    const col3 = faqs.slice(colSize * 2)

    return (
        <section id="faq" className="py-28 px-6 bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
                        💬 Frequently Asked Questions
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
                        Questions? <span className="text-purple-600">Answers!</span>
                    </h2>
                </motion.div>

                {/* 3-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Column 1 */}
                    <div className="flex flex-col gap-4">
                        {col1.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                            >
                                <FAQItem question={faq.q} answer={faq.a} />
                            </motion.div>
                        ))}
                    </div>

                    {/* Column 2 */}
                    <div className="flex flex-col gap-4">
                        {col2.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                            >
                                <FAQItem question={faq.q} answer={faq.a} />
                            </motion.div>
                        ))}
                    </div>

                    {/* Column 3 */}
                    <div className="flex flex-col gap-4">
                        {col3.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                            >
                                <FAQItem question={faq.q} answer={faq.a} />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-center text-gray-400 text-sm mt-10"
                >
                    📩 Feel free to mail us for any enquiries — <a href="mailto:support@careerlaunch.io" className="text-purple-500 hover:underline">support@careerlaunch.io</a>
                </motion.p>

            </div>
        </section>
    )
}
