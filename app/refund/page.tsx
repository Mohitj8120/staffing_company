import RefundContent from "../../src/components/RefundContent";
import Navbar from "../../src/components/Navbar";
import Footer from "../../src/components/Footer";

export const metadata = {
  title: "Refund Policy | Averion Group",
  description: "Read about Averion Group's refund policy and subscription cancellation terms.",
};

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-[#030014]">
      <Navbar />
      <RefundContent />
      <Footer />
    </main>
  );
}
