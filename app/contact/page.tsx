import ContactContent from "../../src/components/ContactContent";
import Navbar from "../../src/components/Navbar";
import Footer from "../../src/components/Footer";

export const metadata = {
  title: "Contact Us | Averion Careers",
  description: "Get in touch with Averion Careers for placement assistance, AI proxy tools, and visa pathways.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#030014]">
      <Navbar />
      <ContactContent />
      <Footer />
    </main>
  );
}
