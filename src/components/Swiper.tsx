'use client'

import React from 'react'
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectCards, EffectCoverflow } from 'swiper/modules'
import { ChevronLeft, ChevronRight, } from 'lucide-react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'

import 'swiper/css/effect-cards'
import 'swiper/css/effect-coverflow'

const Swiper = () => {
    const images = [
      
        {
            id: 2,
            src: '/hero/528840499_1341682604631620_4000600754266452299_n.jpg',
            title: 'Beach Paradise',
            location: 'Maldives',
            rating: 4.9,
            price: '$599'
        },
        {
            id: 3,
            src: '/hero/530248860_1343671131099434_2511349373577876023_n.jpg',
            title: 'City Exploration',
            location: 'Tokyo, Japan',
            rating: 4.7,
            price: '$399'
        },
        {
            id: 4,
            src: '/hero/534472152_1350659393733941_4241408366837870335_n.jpg',
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
        <div className="w-full py-16 ">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
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
                                          


                                            
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </SwiperComponent>

                    {/* Custom Navigation Buttons */}
                    <button className="absolute left-4 top-[50%] transform -translate-y-1/2 z-10 bg-white backdrop-blur-sm text-white p-3 rounded-full cursor-pointer">
                        <ChevronLeft className=" text-gray-800 group-hover:scale-110 transition-transform duration-300" />
                    </button>

                    <button className="absolute right-4 top-[50%] transform -translate-y-1/2 z-10 bg-white backdrop-blur-sm text-white p-3 rounded-full cursor-pointer">
                        <ChevronRight className=" text-gray-800 group-hover:scale-110 transition-transform duration-300" />
                    </button>

                    
                </div>

              
            </div>
        </div>
    )
}

export default Swiper