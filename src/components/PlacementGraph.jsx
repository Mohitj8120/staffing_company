"use client"

import { motion } from "framer-motion"

export default function PlacementGraph() {

    return (

        <section className="py-16 md:py-32 bg-white m-4 md:m-8 rounded-[30px] md:rounded-[40px] shadow-sm border border-gray-100">

            <div className="max-w-4xl mx-auto text-center">

                <h2 className="text-3xl md:text-4xl font-semibold mb-10 md:mb-16 px-4">
                    Our Placement Conversion Rate
                </h2>

                <div className="bg-gray-100 p-6 md:p-10 rounded-3xl mx-4 md:mx-0">

                    <div className="h-8 bg-gray-300 rounded-full overflow-hidden">

                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "85%" }}
                            transition={{ duration: 2 }}
                            className="h-full bg-linear-to-r from-purple-500 to-pink-500"
                        />

                    </div>

                    <p className="mt-4 text-lg font-semibold">
                        85% Placement Success
                    </p>

                </div>

            </div>

        </section>

    )

}