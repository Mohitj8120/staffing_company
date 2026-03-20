import Navbar from "../src/components/Navbar"
import HeroVideo from "../src/components/HeroVideo"
import Partners from "../src/components/Partners"
import ServicesSection from "../src/components/ServicesSection"
import WhyUsPremium from "../src/components/WhyUsPremium"
import PlacementGraph from "../src/components/PlacementGraph"
// import Pricing from "../src/components/Pricing"
import CreatorWorkflows from "../src/components/CreatorWorkflows"
import Integrations from "../src/components/Integrations"
import FAQ from "../src/components/FAQ"
import Footer from "../src/components/Footer"
import VisaPathwaysPreview from "../src/components/VisaPathwaysPreview"

export default function Home() {

    return (

        <>
            <Navbar />
            <div id="home">
                <HeroVideo />
                <Partners />
                <VisaPathwaysPreview />
                <ServicesSection />
                <PlacementGraph />
                <WhyUsPremium />
                <CreatorWorkflows />
                <Integrations />
                <FAQ />
                {/* <Pricing/> */}
            </div>
            <Footer />
        </>

    )

}
