"use client"

export default function Partners() {

    const companies = [
        "Google",
        "Amazon",
        "Microsoft",
        "Infosys",
        "Accenture",
        "TCS",
        "Cognizant",
        "Oracle",
        "Deloitte",
        "IBM"
    ]

    return (

        <section className="py-12 md:py-24 bg-white m-4 md:m-8 rounded-[30px] md:rounded-[40px] shadow-sm border border-gray-100">

            <div className="max-w-6xl mx-auto px-6 text-center">

                <p className="text-gray-800 tracking-widest text-sm font-bold uppercase">

                    OUR PARTNER COMPANIES

                </p>

                <div className="mt-12 overflow-hidden">

                    <div className="flex gap-8 md:gap-16 animate-marquee whitespace-nowrap">

                        {companies.concat(companies).map((c, i) => (
                            <h3 key={i} className="text-xl md:text-2xl font-semibold text-black">
                                {c}
                            </h3>
                        ))}

                    </div>

                </div>

            </div>

        </section>

    )

}
