"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface SpecialOffer {
    id: number;
    name: string;
    nameGeorgian: string;
    oldPrice: number;
    newPrice: number;
    discountType: 'percentage' | 'fixed' | 'bogo';
    discountValue: number;
    image: string;
    endDate: string;
    category: string;
    description: string;
    descriptionGeorgian: string;
}

const SpecialOffers = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // Sample special offers data
    const specialOffers: SpecialOffer[] = [
        {
            id: 1,
            name: "Chocolate Dream Deluxe",
            nameGeorgian: "შოკოლადის ოცნების დელუქსი",
            oldPrice: 60,
            newPrice: 45,
            discountType: 'percentage',
            discountValue: 25,
            image: "/catalog/1.jpg",
            endDate: "2024-12-31",
            category: "birthday",
            description: "Premium chocolate cake with gold decorations",
            descriptionGeorgian: "პრემიუმ შოკოლადის ტორტი ოქროს დეკორაციებით"
        },
        {
            id: 2,
            name: "Wedding Elegance",
            nameGeorgian: "ქორწილის ელეგანტურობა",
            oldPrice: 120,
            newPrice: 95,
            discountType: 'fixed',
            discountValue: 25,
            image: "/catalog/2.jpg",
            endDate: "2024-12-31",
            category: "wedding",
            description: "Luxury wedding cake with floral design",
            descriptionGeorgian: "ფუფუნების ქორწილის ტორტი ყვავილოვანი დიზაინით"
        },
        {
            id: 3,
            name: "Mini Cakes Bundle",
            nameGeorgian: "მინი ტორტების კომპლექტი",
            oldPrice: 80,
            newPrice: 40,
            discountType: 'bogo',
            discountValue: 50,
            image: "/catalog/3.jpg",
            endDate: "2024-12-31",
            category: "celebration",
            description: "Take 2, Pay 1 - Perfect for small gatherings",
            descriptionGeorgian: "აიღე 2, გადაიხადე 1 - იდეალურია პატარა შეკრებებისთვის"
        }
    ];

    // Countdown timer effect - one week from component load
    useEffect(() => {
        const startTime = new Date().getTime();
        const oneWeekInMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        const endTime = startTime + oneWeekInMs;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            } else {
                // Timer has ended
                setTimeLeft({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const getDiscountLabel = (offer: SpecialOffer) => {
        switch (offer.discountType) {
            case 'percentage':
                return `-${offer.discountValue}%`;
            case 'fixed':
                return `-₾${offer.discountValue}`;
            case 'bogo':
                return '2x1';
            default:
                return '';
        }
    };

    const getDiscountColor = (offer: SpecialOffer) => {
        switch (offer.discountType) {
            case 'percentage':
                return 'bg-red-500';
            case 'fixed':
                return 'bg-pink-500';
            case 'bogo':
                return 'bg-purple-500';
            default:
                return 'bg-pink-500';
        }
    };

    return (
        <section className="relative mt-15 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 overflow-hidden">
          

            <div className="relative z-10 container mx-auto px-4">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-[20px] md:text-[30px] font-bold text-black mb-6">
                        სპეციალური შეთავაზებები
                    </h2>
                    <p className="text-[18px] md:text-[20px] text-black mb-8 max-w-2xl mx-auto">
                        მხოლოდ ამ კვირას • შეზღუდული რაოდენობა • სეზონური ფასდაკლება
                    </p>
                    
                    {/* Countdown Timer */}
                    <div className="flex justify-center space-x-4 mb-8">
                        <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
                            <div className="text-2xl font-bold text-pink-600">{timeLeft.days}</div>
                            <div className="text-sm text-black">დღე</div>
                        </div>
                        <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
                            <div className="text-2xl font-bold text-pink-600">{timeLeft.hours}</div>
                            <div className="text-sm text-black">საათი</div>
                        </div>
                        <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
                            <div className="text-2xl font-bold text-pink-600">{timeLeft.minutes}</div>
                            <div className="text-sm text-black">წუთი</div>
                        </div>
                        <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
                            <div className="text-2xl font-bold text-pink-600">{timeLeft.seconds}</div>
                            <div className="text-sm text-black">წამი</div>
                        </div>
                    </div>
                </motion.div>

                {/* Special Offers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {specialOffers.map((offer, index) => (
                        <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="group"
                        >
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                {/* Product Image */}
                                <div className="relative h-64 overflow-hidden">
                                    <Image
                                        src={offer.image}
                                        alt={offer.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    
                                  
                                 
                                </div>

                                {/* Product Info */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-black mb-2">
                                        {offer.nameGeorgian}
                                    </h3>
                                    <p className="text-black text-sm mb-4 line-clamp-2">
                                        {offer.descriptionGeorgian}
                                    </p>
                                    
                                    {/* Pricing */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl font-bold text-pink-600">
                                                ₾{offer.newPrice}
                                            </span>
                                            <span className="text-lg text-black line-through">
                                                ₾{offer.oldPrice}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Offer Details */}
                                    <div className="bg-pink-50 rounded-lg p-3 mb-4">
                                        <p className="text-sm text-pink-700 font-medium">
                                            {offer.discountType === 'bogo' ? 'აიღე 2, გადაიხადე 1' : 
                                             offer.discountType === 'percentage' ? `ფასდაკლება ${offer.discountValue}%` : 
                                             `ფასდაკლება ₾${offer.discountValue}`}
                                        </p>
                                    </div>

                                    {/* CTA Button */}
                                    <Link
                                        href={`/order/${offer.id}`}
                                        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 px-6 rounded-xl font-semibold text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl block"
                                    >
                                        შეკვეთე ახლა
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.7; }
                    50% { opacity: 0.3; }
                }
                .animate-pulse {
                    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </section>
    );
};

export default SpecialOffers;
