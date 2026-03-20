// "use client"

// import { motion } from "framer-motion"
// import { useState } from "react"

// export default function Pricing(){

// const [active,setActive]=useState(1)

// const plans=[
// {
// name:"Traditional Agency",
// price:"$1000 + $1000 + 12%"
// },
// {
// name:"Your Plan",
// price:"$650 + $600 + 11%"
// }
// ]

// return(

// <section className="py-28 bg-white">

// <div className="max-w-6xl mx-auto text-center">

// <h2 className="text-4xl font-bold">
// Transparent Pricing
// </h2>

// <div className="grid md:grid-cols-2 gap-10 mt-16">

// {plans.map((plan,i)=>(
// <motion.div
// key={i}
// whileHover={{scale:1.05}}
// onClick={()=>setActive(i)}
// className={`p-10 rounded-xl border cursor-pointer transition shadow-lg
// ${active===i?"border-purple-600":"border-gray-200"}
// `}>

// <h3 className="text-xl font-semibold">
// {plan.name}
// </h3>

// <p className="text-4xl font-bold mt-4 text-purple-600">
// {plan.price}
// </p>

// { i===1 &&
// <button className="mt-6 bg-linear-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl">
// Get Started
// </button>
// }

// </motion.div>
// ))}

// </div>

// </div>

// </section>

// )

// }
