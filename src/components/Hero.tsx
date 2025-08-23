"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./slider.css";

import { useParams } from "next/navigation";
import Link from "next/link";

interface Slide {
  id: number;
  leftImage: string;
}

const ElegantHeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const params = useParams();
  const locale = params.locale as string;

  const slides: Slide[] = [
    {
      id: 1,
      leftImage: "/hero/1.png"

    },
    {
      id: 2,
      leftImage: "/hero/2.png"


    },
    {
      id: 3,
      leftImage: "/hero/3.png"

    },


  ];

  // Auto-advance slides every 8 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 10000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  // Pause auto-play on user interaction
  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    // Resume auto-play after 15 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };



  const nextSlide = () => {
    pauseAutoPlay();
    if (currentSlide === slides.length - 1) {
      setCurrentSlide(0);
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    pauseAutoPlay();
    if (currentSlide === 0) {
      setCurrentSlide(slides.length - 1);
    } else {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    pauseAutoPlay();
    setCurrentSlide(index);
  };



  return (
    <section className="relative 
     min-h-[500px]  md:min-h-[600px]  overflow-hidden ">

      {/* Main Slider Container */}
      <div className="relative max-w-7xl mx-auto h-full min-h-[500px]  md:h-[500px] ">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}

            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Shutters Overlay */}
            <div className="shutters-animate" />

            {/* Single Large Image */}
            <motion.div

              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-full h-full sm relative overflow-hidden"
            >
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat "
                style={{
                  backgroundImage: `url('${slides[currentSlide].leftImage}')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
            </motion.div>
          </motion.div>
        </AnimatePresence>




        {/* Enhanced Central Promotional Overlay */}
        <motion.div

          transition={{ duration: 1, delay: 0.4 }}
          className="absolute inset-0 flex items-start justify-start z-20 px-4 sm:px-6 md:px-8 lg:px-12 pt-16 sm:pt-20 md:pt-24"
        >
          <div className="max-w-lg sm:max-w-xl md:max-w-2xl text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentSlide}-${locale}`}

                transition={{ duration: 0.6 }}
                className="flex flex-col items-start"
              >
                <h1 className="drop-shadow-2xl md:text-[38px] text-[24px]  font-serif font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl">
                  გემო, რომელიც გახდის დღეს განსაკუთრებულს
                </h1>

                <p className=" md:text-[20px] text-[18px] font-serif italic text-white mb-8 sm:mb-10 max-w-lg leading-relaxed drop-shadow-lg">
                  გთავაზობთ ხელნაკეთ, გემრიელ ტორტებს ნებისმიერი შემთხვევისთვის – დაბადების დღე, ქორწილი, განსაკუთრებული დღესასწაული. შეუკვეთე ტორტი ონლაინ და მიიღე სწრაფად
                </p>
                <div className="bg-gradient-to-br rounded-xl from-pink-50 via-rose-50 to-purple-50">

                  <Link
                    href="/list"
                    className=" text-center    md:text-[20px] text-[18px] w-full md:w-[70%] border-radius:20px  px-4 sm:px-6 md:px-8 py-2 text-white rounded-xl font-bold  transition-all duration-300 transform shadow-lg bg-gradient-to-r from-pink-500 to-rose-500   "
                  >
                    საუკეთესო ტორტი შენთვის

                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 cursor-pointer h-3 rounded-full transition-all duration-300 ${index === currentSlide
                ? 'bg-pink-600 scale-110'
                : 'bg-white/50 hover:bg-white/80'
                }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Floating Accent Elements */}
      <motion.div
        className="absolute top-16 sm:top-20 md:top-24 right-8 sm:right-16 md:right-24 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-[#f3983e]/20 rounded-full blur-3xl"

        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-16 sm:bottom-20 md:bottom-24 left-8 sm:left-16 md:left-24 w-16  sm:h-20 md:w-28 md:h-28 bg-[#f3983e]/15 rounded-full blur-3xl"

        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />
    </section>
  );
};

export default ElegantHeroSlider;