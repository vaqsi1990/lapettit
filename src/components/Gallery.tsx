"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useTransform, AnimatePresence, useScroll } from 'framer-motion';
import { X,  } from 'lucide-react';
import Link from 'next/link';
import { getCakes} from '@/lib/action';
import { mapCakeToGalleryImage, createCategories, updateCategoryCounts, type GalleryImage, type Category } from '@/lib/utils';

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
  const [selectedCategory, setSelectedCategory] = useState('birthday'); // Default to birthday instead of 'all'
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch cakes from database
  const fetchCakes = async () => {
    try {
      setIsLoading(true);
      const result = await getCakes();
      
      if (result.success && result.data) {
        const mappedImages = result.data.map(mapCakeToGalleryImage);
        setGalleryImages(mappedImages);
        
        // Update categories with counts
        const baseCategories = createCategories();
        const updatedCategories = updateCategoryCounts(baseCategories, result.data);
        setCategories(updatedCategories);
      }
    } catch (error) {
      console.error('Error fetching cakes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter images based on selected category and limit to 6 items
  const filteredImages = galleryImages
    .filter(img => img.category === selectedCategory)
    .slice(0, 6);

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image);
    setCurrentImageIndex(galleryImages.findIndex(img => img.id === image.id));
  };

  const closeLightbox = () => setSelectedImage(null);





  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // No need to fetch again - just filter locally
  };

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
          <motion.h2 className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-4">ჩვენი ნამუშევრები</motion.h2>
          <motion.p className="text-[18px] md:text-[20px] md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
            გაიხილეთ ჩვენი ტორტების კოლექცია და აირჩიეთ თქვენი იდეალური დიზაინი
          </motion.p>
        </motion.div>

        {/* Category Filter */}
        <motion.div className="flex justify-center mb-8 md:mb-16 ">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1 md:p-2 shadow-xl border border-white/20 w-full max-w-7xl">
            <div className="flex flex-col md:flex-row flex-wrap justify-center gap-2 md:gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 font-bold cursor-pointer px-5 md:px-6 py-3 rounded-2xl md:text-[20px] text-[18px] font-medium transition-all duration-300 whitespace-nowrap ${selectedCategory === category.id
                      ? 'bg-[#d90b6b] text-white shadow-lg'
                      : 'text-black hover:bg-white/50'
                    }`}
                >
                  {category.nameGeorgian} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Gallery Grid */}
        <div className="columns-1 sm:columns-2 md:columns-4 gap-6 space-y-6">
          <AnimatePresence mode="wait">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                className="break-inside-avoid group cursor-pointer mb-6"
                onClick={() => openLightbox(image)}
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
                  <div className="p-4 flex flex-col h-32">
                    <h3 className="text-[18px] md:text-[20px] font-semibold text-black mb-2 line-clamp-1">
                      {image.titleGeorgian}
                    </h3>
                    <p className="text-black text-[14px] md:text-[16px] mb-2 line-clamp-2 flex-1">
                      {image.descriptionGeorgian}
                    </p>
                    <p className="text-[#d90b6b] text-[18px] md:text-[20px] font-bold mt-auto">
                      ₾{image.price}
                    </p>
                  </div>
                </motion.div>
              </motion.div>

            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={closeLightbox} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="relative max-w-6xl max-h-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <button onClick={closeLightbox} className="absolute top-4 right-4 z-10 bg-black/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/40"><X className="w-5 h-5" /></button>
             
              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 relative">
                  <Image src={selectedImage.src} alt={selectedImage.alt} width={800} height={800} className="w-full h-auto object-cover" />
                </div>
                <div className="w-full lg:w-96 bg-white p-8 border-l border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div>
                      <h3 className="font-semibold text-black text-[18px] md:text-[20px]">{selectedImage.titleGeorgian}</h3>
                      <p className="text-[16px] md:text-[18px] font-bold text-pink-600 mb-2">{selectedImage.categoryGeorgian}</p>
                      <p className="text-[20px] md:text-[24px] font-bold text-[#d90b6b] mb-4">₾{selectedImage.price}</p>
                    </div>
                  </div>
                  <p className="text-black mb-6 leading-relaxed">{selectedImage.descriptionGeorgian}</p>

                  <div className="space-y-3">
                    <Link 
                      href={`/order/${selectedImage.id}`}
                      className="w-full bg-[#d90b6b] text-white py-3 px-4 rounded-lg md:text-[20px] text-[18px] font-semibold hover:bg-pink-700 transition-all duration-300 text-center block"
                    >
                      შეუკვეთე ახლა
                    </Link>
                    <Link href={`/product/${selectedImage.id}`} className="w-full border border-gray-300 text-black py-3 md:text-[20px] text-[18px] px-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 block text-center">
                      დეტალების ნახვა
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </section>
  );
};

export default Gallery;
