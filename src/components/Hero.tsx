"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import Link from 'next/link';
import Image from 'next/image';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

const Hero = () => {
    const heroRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const descriptionRef = useRef(null);
    const ctaRef = useRef(null);
    const backgroundRef = useRef(null);
    const imageSliderRef = useRef(null);
    const [isClient, setIsClient] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Cake images array
    const cakeImages = [
        {
            src: '/hero/534472152_1350659393733941_4241408366837870335_n.jpg',
            alt: 'Beautiful Birthday Cake',
            title: 'დაბადებისდღის ტორტები '
        },
        {
            src: '/hero/528840499_1341682604631620_4000600754266452299_n.jpg',
            alt: 'Wedding Cake',
            title: 'Wedding Elegance'
        },
        {
            src: '/hero/530248860_1343671131099434_2511349373577876023_n.jpg',
            alt: 'Custom Design Cake',
            title: 'Custom Creations'
        }
    ];

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        const ctx = gsap.context(() => {
            // Initial animation timeline
            const tl = gsap.timeline();

            tl.fromTo(titleRef.current,
                { y: 100, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
            )
                .fromTo(subtitleRef.current,
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, "-=0.8"
                )
                .fromTo(descriptionRef.current,
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, "-=0.6"
                )
                .fromTo(ctaRef.current,
                    { y: 30, opacity: 0, scale: 0.8 },
                    { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" }, "-=0.4"
                );

            // Parallax background effect
            gsap.to(backgroundRef.current, {
                yPercent: -50,
                ease: "none",
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });

            // Image slider entrance animation
            gsap.fromTo(imageSliderRef.current,
                { x: 100, opacity: 0, rotation: 15 },
                { x: 0, opacity: 1, rotation: 0, duration: 1.5, ease: "power3.out", delay: 0.8 }
            );

            // Text reveal on scroll
            gsap.fromTo(".reveal-text",
                { y: 100, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power2.out",
                    stagger: 0.2,
                    scrollTrigger: {
                        trigger: ".reveal-text",
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse"
                    }
                }
            );

        }, heroRef);

        return () => ctx.revert();
    }, [isClient]);

    // Auto-rotate images
    useEffect(() => {
        if (!isClient) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % cakeImages.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [isClient, cakeImages.length]);

    // Image change animation
    useEffect(() => {
        if (!isClient) return;

        gsap.to(".cake-image", {
            opacity: 0,
            scale: 0.8,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                gsap.to(".cake-image", {
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: "back.out(1.7)"
                });
            }
        });
    }, [currentImageIndex, isClient]);

    return (
        <section ref={heroRef} className="relative   overflow-hidden">
            {/* Animated Background */}
            <div ref={backgroundRef} className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100/30 via-rose-100/30 to-purple-100/30" />
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-pink-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
                    <div className="absolute top-40 right-20 w-96 h-96 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000" />
                    <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-rose-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000" />
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-4 ">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
                    {/* Text Content */}
                    <div className="space-y-8  md:mt-0 mt-10">
                        {/* Main Title */}
                        <div ref={titleRef} className="space-y-4">
                            <h1 className="  md:text-[48px] text-[28px] font-bold text-gray-800 leading-tight">
                                სადაც ყველა {' '}
                                ნაჭერი

                                <br />
                                ისტორიას ყვება
                            </h1>
                        </div>

                        {/* Subtitle */}
                        <div ref={subtitleRef}>
                            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700">
                                ხელით დამზადებულია სიყვარულით
                            </h2>
                        </div>



                        {/* CTA Buttons */}
                        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link
                                href="/order"
                                className="group bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-block text-center relative overflow-hidden"
                            >
                                <span className="relative z-10">შეუკვეთე</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                            </Link>

                            <Link
                                href="/cakes"
                                className="border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 inline-block text-center backdrop-blur-sm"
                            >
                                დაათვალიერე
                            </Link>
                        </div>
                    </div>

                    {/* Image Slider Section */}
                    <div ref={imageSliderRef} className="relative group">
                        {/* Main Image Container */}
                        <div className="relative w-full h-[500px]">
                            <Image
                                fill
                                src={cakeImages[currentImageIndex].src}
                                alt={cakeImages[currentImageIndex].alt}
                                className="object-contain duration-700"
                                priority
                            />
                        </div>

                        {/* Slider Navigation Dots */}
                        <div className="flex justify-center space-x-2 mt-6">
                            {cakeImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-3 h-3 cursor-pointer rounded-full transition-all duration-300 ${index === currentImageIndex
                                        ? 'bg-pink-500 scale-125'
                                        : 'bg-pink-300 hover:bg-pink-400'
                                        }`}
                                />
                            ))}
                        </div>


                    </div>
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
      `}</style>
        </section>
    );
};

export default Hero;