"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useTransform, AnimatePresence, useScroll } from 'framer-motion';
import { X,  } from 'lucide-react';
import Link from 'next/link';
import { getCakes} from '@/lib/action';
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
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

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

  // Show latest added items (already sorted by createdAt desc from getCakes)
  const filteredImages = galleryImages.slice(0, 4);










  useEffect(() => {
    setIsMounted(true);
    fetchCakes();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">იტვირთევა გალერეა...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <section ref={containerRef} className="relative min-h-screen mt-20  overflow-hidden">
      {/* Parallax Background Elements */}
      {isMounted && <ParallaxBackground containerRef={containerRef} />}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 ">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} className="text-center mb-10">
          <motion.h2 className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-4">ტორტები</motion.h2>
          <motion.p className="text-[18px] md:text-[20px] md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
            დაათვალიერეთ ჩვენი ტორტების კოლექცია და აირჩიეთ თქვენი იდეალური დიზაინი
          </motion.p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="wait">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                className="group cursor-pointer"
              
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] h-full">
                  <div className="relative w-full aspect-[4/5] overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      priority={index < 4}
                    />
                  </div>
                  <div className="p-4 flex flex-col h-44 gap-2">
                    <h3 className="text-[18px] md:text-[20px] font-semibold text-black  line-clamp-1">
                      {image.titleGeorgian}
                    </h3>
                    {image.price && (
                      <div className="text-[16px] md:text-[18px] font-bold ">
                   ფასი:     {formatPrice(image.price)}
                      </div>
                    )}
                    <Link href={`/product/${image.id}`} className="w-full cursor-pointer md:text-[20px] text-[18px] bg-[#d90b6b] hover:from-pink-600 hover:to-rose-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">დეტალები</Link>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Additional Cakes Link - Centered */}
        <div className="flex pb-4 justify-center mt-8 md:mt-12">
          <Link href="/cakes" className="cursor-pointer md:text-[20px] text-[18px] bg-[#d90b6b] hover:from-pink-600 hover:to-rose-600 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">დამატებითი ტორტები</Link>
        </div>
      </div>

 

     
    </section>
  );
};

export default Gallery;
