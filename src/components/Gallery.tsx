"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useTransform, useScroll, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getCakes } from '@/lib/action';
import { mapCakeToGalleryImage, type GalleryImage, formatPrice } from '@/lib/utils';

// Separate component for parallax effects to avoid hydration issues
const ParallaxBackground = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const y5 = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const y6 = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <>
      <motion.div style={{ y: y1 }} className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full mix-blend-multiply filter blur-2xl" />
      <motion.div style={{ y: y2 }} className="absolute top-40 right-20 w-40 h-40 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-2xl" />
      <motion.div style={{ y: y3 }} className="absolute bottom-20 left-1/2 w-36 h-36 bg-rose-200/30 rounded-full mix-blend-multiply filter blur-2xl" />
      <motion.div style={{ y: y4 }} className="absolute top-1/2 left-20 w-24 h-24 bg-yellow-200/30 rounded-full mix-blend-multiply filter blur-2xl" />
      <motion.div style={{ y: y5 }} className="absolute bottom-40 right-1/3 w-28 h-28 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-2xl" />
      <motion.div style={{ y: y6 }} className="absolute top-1/3 right-1/4 w-20 h-20 bg-green-200/30 rounded-full mix-blend-multiply filter blur-2xl" />
    </>
  );
};

const Gallery = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch cakes from database
  const fetchCakes = async () => {
    try {
      setIsLoading(true);
      const result = await getCakes();

      if (result.success && result.data) {
        const mappedImages = result.data.map(mapCakeToGalleryImage);
        setGalleryImages(mappedImages);
      }
    } catch (error) {
      console.error('Error fetching cakes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show only SET products (ნაკრები) - latest added items
  const filteredImages = galleryImages
    .filter(image => image.productType === 'SET')
    .slice(0, 8);

  // Custom carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Calculate slides per view based on screen size
  useEffect(() => {
    const updateSlidesPerView = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setSlidesPerView(4);
      } else if (width >= 768) {
        setSlidesPerView(3);
      } else if (width >= 640) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(1);
      }
    };

    updateSlidesPerView();
    window.addEventListener('resize', updateSlidesPerView);
    return () => window.removeEventListener('resize', updateSlidesPerView);
  }, []);

  const maxIndex = Math.max(0, filteredImages.length - slidesPerView);
  const totalPages = Math.ceil(filteredImages.length / slidesPerView);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToPage = (page: number) => {
    setCurrentIndex(page * slidesPerView);
  };





  useEffect(() => {
    setIsMounted(true);
    fetchCakes();
  }, []);

  if (isLoading) {
    return (
      <div className=" flex items-center justify-center ">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">იტვირთევა გალერეა...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <section ref={containerRef} className="relative  mt-20  overflow-hidden">
      {/* Parallax Background Elements */}
      {isMounted && <ParallaxBackground containerRef={containerRef} />}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 ">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} className="text-center mb-10">
          <motion.h2 className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-4">ტორტები</motion.h2>
          <motion.p className="text-[18px] md:text-[20px]  text-black max-w-4xl mx-auto leading-relaxed">
            დაათვალიერეთ ჩვენი ტორტების კოლექცია და აირჩიეთ თქვენი იდეალური დიზაინი
          </motion.p>
        </motion.div>

        {/* Custom Carousel */}
        <div className="relative w-full">
          {/* Navigation Arrows */}
          {filteredImages.length > slidesPerView && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous slide"
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next slide"
                disabled={currentIndex >= maxIndex}
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}

          {/* Carousel Container */}
          <div className="px-0 md:px-10 overflow-hidden" ref={carouselRef}>
            <motion.div
              className="flex gap-4 md:gap-6"
              animate={{
                x: `-${currentIndex * (100 / slidesPerView)}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              drag="x"
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;

                if (swipe < -10000 && currentIndex < maxIndex) {
                  goToNext();
                } else if (swipe > 10000 && currentIndex > 0) {
                  goToPrev();
                }
              }}
            >
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  className="flex-shrink-0"
                  style={{
                    width: `${100 / slidesPerView}%`,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 h-full md:h-[450px] flex flex-col border border-gray-100">
                    {/* Image */}
                    <div className="relative w-full h-60 sm:h-72 md:h-80 overflow-hidden bg-gray-100">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        priority={index < 4}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-base md:text-lg font-bold text-center text-gray-900 mb-2 line-clamp-1">
                        {image.titleGeorgian}
                      </h3>
                      <div className="mb-4 h-6 md:h-7 flex items-center justify-center">
                        {image.price ? (
                          <span className="text-base md:text-lg font-bold text-gray-900">
                            {formatPrice(image.price)}
                          </span>
                        ) : (
                          <span className="invisible select-none">0</span>
                        )}
                      </div>
                      <Link
                        href={`/product/${image.id}`}
                        className="w-full md:w-[200px] mx-auto cursor-pointer md:text-[20px] text-[18px] bg-[#d90b6b] hover:from-pink-600 hover:to-rose-600 text-white py-2 px-4 text-center rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        დეტალები
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Pagination Dots */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 pb-4">
              {Array.from({ length: totalPages }).map((_, index) => {
                const isActive = Math.floor(currentIndex / slidesPerView) === index;
                return (
                  <button
                    key={index}
                    onClick={() => goToPage(index)}
                    className={`transition-all duration-300 rounded-full ${
                      isActive
                        ? 'w-10 h-3 bg-[#d90b6b]'
                        : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to page ${index + 1}`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Additional Cakes Link - Centered */}
        <div className="flex pb-4 justify-center mt-8 md:mt-12">
          <Link href="/cakes" className="cursor-pointer md:text-[20px] text-[18px] bg-[#d90b6b] hover:from-pink-600 hover:to-rose-600 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">დაათვალიერეთ ჩვენი კოლექცია</Link>
        </div>
      </div>




    </section>
  );
};

export default Gallery;
