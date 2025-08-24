
import Hero from "../components/Hero";
import SpecialOffers from "../components/SpecialOffers";
import Services from "../components/Services";
import Why from "@/components/Why";
import Swiper from "@/components/Swiper";
import Gallery from "@/components/Gallery";

export default function Home() {
  return (
    <>
      <div className="bg-color">
        <Hero />
        <Services />
        <Gallery />
        <Swiper />
        <SpecialOffers />
        <Why />
      </div>
    </>
  );
}
