"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./slider.css";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Slide {
  id: number;
  leftImage: string;
  title?: string;
  subtitle?: string;
}

const ElegantHeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const params = useParams();
  const locale = params.locale as string;

  const slides: Slide[] = [
    {
      id: 1,
      leftImage: "/hero/1.png",
      title: "გემო, რომელიც გახდის დღეს განსაკუთრებულს",
      subtitle: "ხელნაკეთ, გემრიელ ტორტები ნებისმიერი შემთხვევისთვის"
    },
    {
      id: 2,
      leftImage: "/hero/2.png",
      title: "შექმენი შენი ოცნების ტორტი",
      subtitle: "პერსონალიზებული დიზაინი და უნიკალური გემო"
    },
    {
      id: 3,
      leftImage: "/hero/3.png",
      title: "სპეციალური დღეებისთვის",
      subtitle: "დაბადების დღე, ქორწილი, განსაკუთრებული დღესასწაული"
    },
  ];

  // Preload images for smoother transitions
  useEffect(() => {
    slides.forEach((slide) => {
      const img = document.createElement('img');
      img.src = slide.leftImage;
    });
  }, []);

  // Auto-advance slides every 8 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 8000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  // Pause auto-play on user interaction
  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  const goToSlide = (index: number) => {
    pauseAutoPlay();
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    pauseAutoPlay();
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    pauseAutoPlay();
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] overflow-hidden">
      {/* Main Slider Container - Reduced Height */}
      <div className="relative w-full h-[70vh] md:h-[86vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Background Image with Parallax Effect */}
            <motion.div
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <div className="relative w-full h-full">
                <Image
                  src={slides[currentSlide].leftImage}
                  alt=""
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Content Overlay - Left aligned like before */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute inset-0 flex items-start justify-start z-20 px-4 sm:px-6 md:px-8 lg:px-12 pt-16 sm:pt-20 md:pt-24"
        >
          <div className="max-w-lg sm:max-w-xl md:max-w-2xl text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentSlide}-${locale}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-start"
              >
                <h1 className="drop-shadow-2xl md:text-[38px] text-[22px] font-serif font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl">
                  გემო, რომელიც გახდის დღეს განსაკუთრებულს
                </h1>

                <p className="md:text-[20px] text-[16px] font-serif italic text-white mb-6 sm:mb-8 md:mb-10 max-w-lg leading-relaxed drop-shadow-lg">
                  გთავაზობთ ხელნაკეთ, გემრიელ ტორტებს ნებისმიერი შემთხვევისთვის – დაბადების დღე, ქორწილი, განსაკუთრებული დღესასწაული. შეუკვეთე ტორტი ონლაინ და მიიღე სწრაფად
                </p>
                <div className="w-full mb-20 sm:mb-24 md:mb-14 md:w-[70%]">
                  <Link
                    href="/cakes"
                    className="block text-center md:text-[20px] text-[18px] w-full bg-[#d90b6b] text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    დაათვალიერეთ ჩვენი ტორტები
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>


        {/* Slide Indicators - Bottom Center */}
        <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-[#d90b6b] w-8'
                  : 'bg-white/50 hover:bg-white/80 w-2'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute top-20 right-20 w-32 h-32 bg-[#f3983e]/10 rounded-full blur-3xl hidden md:block"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-20 left-20 w-24 h-24 bg-[#d90b6b]/10 rounded-full blur-3xl hidden md:block"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </section>
  );
};

export default ElegantHeroSlider;
