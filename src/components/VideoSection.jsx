"use client"

import { motion } from "framer-motion"

export default function VideoSection(){

return(

<section className="py-28 bg-gray-100">

<div className="max-w-5xl mx-auto text-center px-6">

<motion.h2
initial={{opacity:0,y:40}}
whileInView={{opacity:1,y:0}}
viewport={{once:true}}
className="text-4xl font-bold">

How It Works

</motion.h2>

<p className="text-gray-600 mt-4">
Watch how we help students get jobs faster
</p>

<div className="mt-10 rounded-xl overflow-hidden shadow-xl">

<video
className="w-full aspect-video object-cover"
controls
controlsList="nodownload"
playsInline
src="/my-video.mp4"
/>

</div>

</div>

</section>

)

}