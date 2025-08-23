'use client'

import React from 'react'
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectCards, EffectCoverflow } from 'swiper/modules'
import { ChevronLeft, ChevronRight, } from 'lucide-react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-coverflow'

const Swiper = () => {
    const images = [
        {
            id: 2,
            src: '/hero/3.png',
            title: 'Beach Paradise',
            location: 'Maldives',
            rating: 4.9,
            price: '$599'
        },
        {
            id: 3,
            src: '/hero/2.png',
            title: 'City Exploration',
            location: 'Tokyo, Japan',
            rating: 4.7,
            price: '$399'
        },
        {
            id: 4,
            src: '/hero/1.png',
            title: 'Desert Safari',
            location: 'Dubai, UAE',
            rating: 4.6,
            price: '$199'
        },
        {
            id: 5,
            src: '/catalog/1.jpg',
            title: 'Forest Retreat',
            location: 'Amazon Rainforest',
            rating: 4.5,
            price: '$249'
        },
        {
            id: 6,
            src: '/catalog/2.jpg',
            title: 'Island Hopping',
            location: 'Greek Islands',
            rating: 4.9,
            price: '$499'
        }
    ]

    return (
        <div className="w-full py-16">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-[20px] md:text-[30px] font-bold text-black mb-6">
                       დაათვალიერეთ ჩვენი ტორტები
                    </h2>
                </div>

                {/* Main Swiper */}
                <div className="relative">
                    <SwiperComponent
                        modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
                        effect="coverflow"
                        grabCursor={true}
                        centeredSlides={true}
                        loop={true}
                        slidesPerView={1}
                        breakpoints={{
                            640: {
                                slidesPerView: 2,
                                spaceBetween: 20,
                            },
                            768: {
                                slidesPerView: 2,
                                spaceBetween: 30,
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 40,
                            },
                        }}
                        coverflowEffect={{
                            rotate: 0,
                            stretch: 0,
                            depth: 100,
                            modifier: 1,
                            slideShadows: false,
                        }}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true,
                        }}
                        navigation={{
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        }}
                        className="h-[500px] w-full"
                    >
                        {images.map((image) => (
                            <SwiperSlide key={image.id} className="h-full">
                                <div className="relative pb-10 pt-10 h-full group cursor-pointer">
                                    {/* Image Container */}
                                    <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-2xl">
                                        <img
                                            src={image.src}
                                            alt={image.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                        {/* Content */}
                                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                            <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                                            <p className="text-sm opacity-90">{image.location}</p>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </SwiperComponent>

                    {/* Custom Navigation Buttons */}
                    <button className="swiper-button-prev absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white text-black p-3 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg">
                        <ChevronLeft className="w-6 h-6 text-black" />
                    </button>

                    <button className="swiper-button-next absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white text-black p-3 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg">
                        <ChevronRight className="w-6 h-6 text-black" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Swiper