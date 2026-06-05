import Navbar from "@/src/components/Navbar"
import Footer from "@/src/components/Footer"
import TermsContent from "@/src/components/TermsContent"

export const metadata = {
  title: "Terms & Conditions | Averion Careers",
  description: "The official terms and conditions for using Averion Careers services and AI Proxy technology."
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <TermsContent />
      <Footer />
    </>
  )
}
