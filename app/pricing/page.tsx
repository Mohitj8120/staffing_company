import Navbar from "../../src/components/Navbar"
import Footer from "../../src/components/Footer"
import PricingFullContent from "../../src/components/PricingFullContent"

export const metadata = {
    title: "Pricing | Averion Group",
    description: "Simple pricing for powerful results. Choose the plan that accelerates your tech career."
}

export default function PricingPage() {
    return (
        <main className="bg-[#030014] min-h-screen">
            <Navbar />
            <PricingFullContent />
            {/* Using a dark footer version or wrapping default footer in white bg if needed, 
                but since the full page is dark, let's keep the dark tone to the bottom and let 
                the standard footer sit in its standard container.
            */}
            <div className="bg-white">
                <Footer />
            </div>
        </main>
    )
}
