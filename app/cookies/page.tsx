import Navbar from "@/src/components/Navbar"
import Footer from "@/src/components/Footer"
import CookiesContent from "@/src/components/CookiesContent"

export const metadata = {
  title: "Cookies Policy | CareerLaunch",
  description: "Details on how CareerLaunch uses cookies and tracking technologies."
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
