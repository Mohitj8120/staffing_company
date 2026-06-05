import Navbar from "@/src/components/Navbar"
import Footer from "@/src/components/Footer"
import CookiesContent from "@/src/components/CookiesContent"

export const metadata = {
  title: "Cookies Policy | Averion Careers",
  description: "Details on how Averion Careers uses cookies and tracking technologies."
}

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <CookiesContent />
      <Footer />
    </>
  )
}
