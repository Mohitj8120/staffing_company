"use client"

export default function ServicesSection() {

    const services = [
        {
            title: "Company-Matched Resume",
            desc: "We don't build random resumes. We collect the exact resume template your target company uses and craft yours to match — giving you the insider edge from day one.",
            icon: "📋"
        },
        {
            title: "LinkedIn Optimization",
            desc: "We optimize your LinkedIn profile to attract top US recruiters — from headline and summary to skills and endorsements, making you stand out in every search.",
            icon: "in"
        },
        {
            title: "Proxy Interview Tool",
            desc: "Never fail an interview again. Our smart tool feeds you real-time answers directly on your screen — completely invisible during screen sharing. The interviewer sees nothing, you answer everything.",
            icon: "🛡️"
        },
        {
            title: "Company Question Sheets",
            desc: "We provide actual interview question sheets sourced directly from companies. The real questions come from these sheets — prepare with the exact material that matters.",
            icon: "📝"
        },
        {
            title: "Dedicated Process Support",
            desc: "You're never alone in the journey. We stay in touch through every step via calls and emails — from application to offer letter, we've got your back.",
            icon: "📞"
        },
        {
            title: "Direct Company Placement",
            desc: "We don't randomly apply to jobs. We have direct tie-ups with companies and send your resume straight to their hiring teams — no middlemen, faster results.",
            icon: "🤝"
        }
    ]

    return (

        <section id="services" className="py-36 bg-[#0b1730] relative m-4 md:m-8 rounded-[40px] overflow-hidden shadow-sm">

            {/* grid background */}

            <div className="absolute inset-0 opacity-10 
bg-[linear-gradient(#ffffff_1px,transparent_1px),linear-gradient(to_right,#ffffff_1px,transparent_1px)]
bg-size-[70px_70px]"></div>

            <div className="container-main relative">

                {/* heading */}

                <h2 className="text-center text-5xl text-white font-semibold">
                    Why We Lead in Placements
                </h2>

                <p className="text-center text-blue-200 mt-3">
                    The highest placement conversion rate in the industry — here's what powers it
                </p>

                {/* cards */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">

                    {services.map((item, i) => (
                        <div key={i}
                            className="rounded-2xl p-7 text-center
bg-linear-to-b from-pink-400 via-pink-200 to-white
shadow-[0_15px_30px_rgba(255,105,180,0.35)]
hover:-translate-y-3 hover:shadow-[0_25px_50px_rgba(255,105,180,0.5)]
transition duration-300
max-w-80 mx-auto">

                            {/* icon */}

                            <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center
bg-linear-to-br from-purple-600 to-pink-500 text-white text-xl mb-5 shadow-lg">
                                {item.icon}
                            </div>

                            {/* title */}

                            <h3 className="text-lg font-bold text-gray-900">
                                {item.title}
                            </h3>

                            {/* description */}

                            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                                {item.desc}
                            </p>

                        </div>
                    ))}

                </div>

            </div>

        </section>

    )

}