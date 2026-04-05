import Navbar from "@/src/components/Navbar"
import Footer from "@/src/components/Footer"
import PrivacyContent from "@/src/components/PrivacyContent"

export const metadata = {
  title: "Privacy Policy | Talentra",
  description: "How Talentra handles your data, resumes, and interview records."
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <PrivacyContent />
      <Footer />
    </>
  )
}
