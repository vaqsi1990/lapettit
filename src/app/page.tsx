
import Hero from "../components/Hero";
import SpecialOffers from "../components/SpecialOffers";
import Services from "../components/Services";
import Why from "@/components/Why";

import Gallery from "@/components/Gallery";

export default function Home() {
  return (
    <>
      <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <Hero />
        <Services />
        <Gallery />

        <SpecialOffers />
        <Why />
      </div>
    </>
  );
}
