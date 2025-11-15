'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, X, ChevronLeft, ChevronRight } from 'lucide-react'

const Swiper = () => {
    const [hoveredId, setHoveredId] = useState<number | null>(null)
    const [selectedImage, setSelectedImage] = useState<number | null>(null)

    const images = [
        {
            id: 2,
            src: '/swiper/1.jpg',
            likes: 124,
            comments: 8,
        },
        {
            id: 3,
            src: '/swiper/2.jpg',
            likes: 89,
            comments: 5,
        },
        {
            id: 4,
            src: '/swiper/3.jpg',
            likes: 156,
            comments: 12,
        },
        {
            id: 5,
            src: '/swiper/4.jpg',
            likes: 203,
            comments: 15,
        },
        {
            id: 6,
            src: '/swiper/5.jpg',
            likes: 98,
            comments: 7,
        },
        {
            id: 7,
            src: '/swiper/6.jpg',
            likes: 167,
            comments: 9,
        },
        {
            id: 8,
            src: '/swiper/1.jpg',
            likes: 134,
            comments: 11,
        },
        {
            id: 9,
            src: '/swiper/2.jpg',
            likes: 112,
            comments: 6,
        },
        {
            id: 10,
            src: '/swiper/3.jpg',
            likes: 189,
            comments: 14,
        },
    ]

    return (
        <div className="w-full mt-20 mb-20">
            <div className="max-w-7xl mx-auto px-4">
                {/* Instagram-like Grid Gallery */}
                <motion.h2 className="text-[20px] md:text-[30px] text-center mb-10 font-bold text-[#d90b6b] mb-4">გალერია</motion.h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                    {images.map((image, index) => (
                        <motion.div
                            key={image.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            viewport={{ once: true }}
                            className="relative aspect-square overflow-hidden group cursor-pointer"
                            onMouseEnter={() => setHoveredId(image.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => setSelectedImage(image.id)}
                        >
                            {/* Image */}
                            <div className="relative w-full h-full bg-gray-100">
                                <Image
                                    src={image.src}
                                    alt={`Gallery image ${image.id}`}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>

                            {/* Instagram-like Overlay on Hover */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ 
                                    opacity: hoveredId === image.id ? 1 : 0 
                                }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center gap-6"
                            >
                                {/* Like Icon & Count */}
                              

                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        {/* Close Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedImage(null)
                            }}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        {/* Navigation Buttons */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        const currentIndex = images.findIndex(img => img.id === selectedImage)
                                        const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
                                        setSelectedImage(images[prevIndex].id)
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        const currentIndex = images.findIndex(img => img.id === selectedImage)
                                        const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
                                        setSelectedImage(images[nextIndex].id)
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}

                        {/* Full Size Image */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="relative w-full h-full max-w-7xl max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {selectedImage && (
                                <Image
                                    src={images.find(img => img.id === selectedImage)?.src || ''}
                                    alt="Full size gallery image"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Swiper