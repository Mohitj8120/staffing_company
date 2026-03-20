"use client"

import { motion } from "framer-motion"

export default function Hero(){

return(

<section className="relative min-h-screen flex items-center bg-linear-to-br from-purple-800 via-blue-700 to-gray-900 text-white overflow-hidden">

{/* animated blobs */}

<motion.div
animate={{scale:[1,1.2,1]}}
transition={{repeat:Infinity,duration:8}}
className="absolute top-0 left-0 w-125 h-125 bg-purple-500 opacity-30 rounded-full blur-3xl"
/>

<motion.div
animate={{scale:[1,1.3,1]}}
transition={{repeat:Infinity,duration:10}}
className="absolute bottom-0 right-0 w-100 h-100 bg-blue-500 opacity-30 rounded-full blur-3xl"
/>

<div className="max-w-7xl mx-auto px-6">

<motion.h1
initial={{opacity:0,y:50}}
animate={{opacity:1,y:0}}
transition={{duration:1}}
className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">

Launch Your Career  
<br/>

<span className="text-yellow-300 italic">
in the USA
</span>

</motion.h1>

<motion.p
initial={{opacity:0}}
animate={{opacity:1}}
transition={{delay:0.5}}
className="mt-6 text-lg max-w-xl text-gray-200">

We help international students land jobs faster with resume building,
LinkedIn optimization and job placement support.

</motion.p>

<motion.div
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
transition={{delay:0.8}}
className="mt-8 flex flex-col sm:flex-row gap-4">

<button className="bg-white text-black px-6 py-3.5 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all text-center">
See Plans
</button>

<button className="border border-white/50 bg-white/5 backdrop-blur-sm px-6 py-3.5 rounded-xl font-bold text-lg hover:bg-white/20 transition-all text-center">
Book Call
</button>

</motion.div>

</div>

</section>

)

}
