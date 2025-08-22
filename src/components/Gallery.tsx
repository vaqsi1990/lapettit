"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useTransform, AnimatePresence, useScroll } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: string;
  categoryGeorgian: string;
  title: string;
  titleGeorgian: string;
  description: string;
  descriptionGeorgian: string;
  likes?: number;
  comments?: number;
}

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  
  // Always call useScroll and useTransform hooks
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const categories = [
    { id: 'all', name: 'ყველა', nameGeorgian: 'ყველა' },
    { id: 'birthday', name: 'Birthday', nameGeorgian: 'დაბადების დღე' },
    { id: 'wedding', name: 'Wedding', nameGeorgian: 'ქორწილი' },
    { id: 'celebration', name: 'Celebration', nameGeorgian: 'დღესასწაული' },
    { id: 'custom', name: 'Custom', nameGeorgian: 'ინდივიდუალური' }
  ];

  const galleryImages: GalleryImage[] = [
    {
      id: 1,
      src: "/hero/534472152_1350659393733941_4241408366837870335_n.jpg",
      alt: "Birthday Cake with Flowers",
      category: "birthday",
      categoryGeorgian: "დაბადების დღე",
      title: "Floral Birthday Delight",
      titleGeorgian: "ყვავილოვანი დაბადების დღის სიამოვნება",
      description: "Beautiful birthday cake decorated with fresh flowers and pastel colors",
      descriptionGeorgian: "ლამაზი დაბადების დღის ტორტი, დეკორირებული ახალი ყვავილებით და პასტელის ფერებით",
      likes: 128,
      comments: 24
    },
    {
      id: 2,
      src: "/hero/528840499_1341682604631620_4000600754266452299_n.jpg",
      alt: "Elegant Wedding Cake",
      category: "wedding",
      categoryGeorgian: "ქორწილი",
      title: "Wedding Elegance",
      titleGeorgian: "ქორწილის ელეგანტურობა",
      description: "Multi-tier wedding cake with intricate fondant work and gold accents",
      descriptionGeorgian: "მრავალშრიანი ქორწილის ტორტი რთული ფონდანის სამუშაოთი და ოქროს აქცენტებით",
      likes: 256,
      comments: 42
    },
    {
      id: 3,
      src: "/hero/530248860_1343671131099434_2511349373577876023_n.jpg",
      alt: "Custom Design Cake",
      category: "custom",
      categoryGeorgian: "ინდივიდუალური",
      title: "Custom Creation",
      titleGeorgian: "ინდივიდუალური შექმნა",
      description: "Unique custom cake designed according to client's specific requirements",
      descriptionGeorgian: "უნიკალური ინდივიდუალური ტორტი, შექმნილი კლიენტის კონკრეტული მოთხოვნების მიხედვით",
      likes: 89,
      comments: 15
    },
    {
      id: 4,
      src: "/catalog/1.jpg",
      alt: "Chocolate Celebration Cake",
      category: "celebration",
      categoryGeorgian: "დღესასწაული",
      title: "Chocolate Celebration",
      titleGeorgian: "შოკოლადის დღესასწაული",
      description: "Rich chocolate cake perfect for any celebration or special occasion",
      descriptionGeorgian: "მდიდარი შოკოლადის ტორტი, იდეალური ნებისმიერი დღესასწაულისთვის ან სპეციალური შემთხვევისთვის",
      likes: 167,
      comments: 31
    },
    {
      id: 5,
      src: "/catalog/2.jpg",
      alt: "Vanilla Dream Cake",
      category: "birthday",
      categoryGeorgian: "დაბადების დღე",
      title: "Vanilla Dream",
      titleGeorgian: "ვანილის ოცნება",
      description: "Delicate vanilla cake with fresh berries and cream decoration",
      descriptionGeorgian: "ნაზი ვანილის ტორტი ახალი კენკრით და კრემის დეკორაციით",
      likes: 94,
      comments: 18
    },
    {
      id: 6,
      src: "/catalog/3.jpg",
      alt: "Red Velvet Special",
      category: "celebration",
      categoryGeorgian: "დღესასწაული",
      title: "Red Velvet Magic",
      titleGeorgian: "წითელი ბარხატის ჯადო",
      description: "Classic red velvet cake with cream cheese frosting and elegant design",
      descriptionGeorgian: "კლასიკური წითელი ბარხატი ყველის კრემით და ელეგანტური დიზაინით",
      likes: 203,
      comments: 37
    }
  ];

  const filteredImages = selectedCategory === 'all'
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedCategory);

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image);
    setCurrentImageIndex(galleryImages.findIndex(img => img.id === image.id));
  };

  const closeLightbox = () => setSelectedImage(null);

  const nextImage = () => {
    const nextIndex = (currentImageIndex + 1) % galleryImages.length;
    setCurrentImageIndex(nextIndex);
    setSelectedImage(galleryImages[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = currentImageIndex === 0 ? galleryImages.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(prevIndex);
    setSelectedImage(galleryImages[prevIndex]);
  };

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Create parallax transforms with proper fallbacks
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const y5 = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const y6 = useTransform(scrollYProgress, [0, 1], [0, -120]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <section ref={containerRef} className="relative min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 overflow-hidden">
      {/* Parallax Background Elements */}
      {isMounted && (
        <>
          <motion.div style={{ y: y1 }} className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full mix-blend-multiply filter blur-2xl" />
          <motion.div style={{ y: y2 }} className="absolute top-40 right-20 w-40 h-40 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-2xl" />
          <motion.div style={{ y: y3 }} className="absolute bottom-20 left-1/2 w-36 h-36 bg-rose-200/30 rounded-full mix-blend-multiply filter blur-2xl" />
          <motion.div style={{ y: y4 }} className="absolute top-1/2 left-20 w-24 h-24 bg-yellow-200/30 rounded-full mix-blend-multiply filter blur-2xl" />
          <motion.div style={{ y: y5 }} className="absolute bottom-40 right-1/3 w-28 h-28 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-2xl" />
          <motion.div style={{ y: y6 }} className="absolute top-1/3 right-1/4 w-20 h-20 bg-green-200/30 rounded-full mix-blend-multiply filter blur-2xl" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} className="text-center mb-20">
          <motion.h2 className="text-5xl md:text-7xl font-bold text-gray-800 mb-8">ჩვენი ნამუშევრები</motion.h2>
          <motion.p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            გაიხილეთ ჩვენი ტორტების კოლექცია და აირჩიეთ თქვენი იდეალური დიზაინი
          </motion.p>
        </motion.div>

        {/* Category Filter */}
        <motion.div className="flex justify-center mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-xl border border-white/20">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 mx-1 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {category.nameGeorgian}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Gallery Grid */}
        <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
          <AnimatePresence mode="wait">
            {filteredImages.map((image, index) => {
              const parallaxY = [y1, y2, y3, y4, y5, y6][index % 6];
              return (
                <motion.div key={image.id} className="break-inside-avoid group cursor-pointer mb-6" onClick={() => openLightbox(image)}>
                  <motion.div style={isMounted ? { y: parallaxY } : {}} className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                    <div className="relative aspect-square overflow-hidden">
                      <Image src={image.src} alt={image.alt} fill className="object-cover group-hover:scale-110 transition-transform duration-700" priority={index < 4} />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{image.categoryGeorgian}</div>
                      <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Filter className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-medium">დაათვალიერეთ</p>
                        </div>
                      </motion.div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">{image.titleGeorgian}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{image.descriptionGeorgian}</p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={closeLightbox} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="relative max-w-6xl max-h-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <button onClick={closeLightbox} className="absolute top-4 right-4 z-10 bg-black/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/40"><X className="w-5 h-5" /></button>
              <button onClick={prevImage} className="absolute left-4 top-[60%] transform -translate-y-1/2 z-10 bg-black/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/40"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={nextImage} className="absolute right-4 top-[60%] transform -translate-y-1/2 z-10 bg-black/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/40"><ChevronRight className="w-5 h-5" /></button>
              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 relative">
                  <Image src={selectedImage.src} alt={selectedImage.alt} width={800} height={800} className="w-full h-auto object-cover" />
                </div>
                <div className="w-full lg:w-96 bg-white p-8 border-l border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{selectedImage.titleGeorgian}</h3>
                      <p className="text-sm text-gray-500">{selectedImage.categoryGeorgian}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">{selectedImage.descriptionGeorgian}</p>
                  
                  <div className="space-y-3">
                    <button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300">შეუკვეთე ახლა</button>
                    <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300">დეტალების ნახვა</button>
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
