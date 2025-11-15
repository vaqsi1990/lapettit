
import Hero from "../components/Hero";
import SpecialOffers from "../components/SpecialOffers";
import Services from "../components/Services";
import Why from "@/components/Why";
import Swiper from "@/components/Swiper";
import Gallery from "@/components/Gallery";
import About from "@/components/About";
import Recipes from "@/components/Recipes";

export default function Home() {
  return (
    <>
      <div className="bg-color">
        <Hero />
        <Gallery />
        <Services />
        <Swiper />
        <Recipes />
        <About />
        {/* <SpecialOffers /> */}
      
      </div>
    </>
  );
}
