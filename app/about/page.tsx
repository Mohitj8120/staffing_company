import Navbar from "@/src/components/Navbar"
import Footer from "@/src/components/Footer"
import AboutUsContent from "@/src/components/AboutUsContent"

export const metadata = {
  title: "About Us | Averion Group",
  description: "Learn about Averion Group's mission, technology, and why we are the leaders in US career placement."
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <AboutUsContent />
      <Footer />
    </>
  )
}
