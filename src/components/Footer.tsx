"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Facebook, Instagram, Mail, Phone, MapPin, Heart } from "lucide-react";
import Link from "next/link";
import { getCakes } from "@/lib/action";
import { mapCakeToGalleryImage, type GalleryImage } from "@/lib/utils";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const Footer = () => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    const fetchCakes = async () => {
      try {
        const result = await getCakes();
        if (result.success && result.data) {
          const mappedImages = result.data.map(mapCakeToGalleryImage);
          setGalleryImages(mappedImages.slice(0, 12));
        }
      } catch (error) {
        console.error("Error fetching cakes for footer gallery:", error);
      }
    };
    fetchCakes();
  }, []);

  return (
    <footer className=" bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
   

      {/* 🎂 Main Footer Content */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-6">
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-[Cormorant_Garamond] font-bold mb-4">
              Lappetit
            </h3>
            <p className="text-white mb-6 leading-relaxed text-[16px]">
              ჩვენ ვქმნით არა მხოლოდ ტორტებს, არამედ ტკბილ ემოციებს — ყოველი შეკვეთა სიყვარულითა და დახვეწილობით.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/lappetitbatumy"
                target="_blank"
                className="w-10 h-10 rounded-full bg-[#c23b6d] flex items-center justify-center text-white hover:bg-[#a5305b] transition-all"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.instagram.com/lappetitbatumi"
                target="_blank"
                className="w-10 h-10 rounded-full bg-[#c23b6d] flex items-center justify-center text-white hover:bg-[#a5305b] transition-all"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-[Cormorant_Garamond] font-semibold text-white mb-4">
              სწრაფი ბმულები
            </h4>
            <ul className="space-y-2 text-[16px]">
              <li>
                <Link href="/" className="hover:text-[#c23b6d] transition-colors">
                  მთავარი
                </Link>
              </li>
              <li>
                <Link href="/cakes" className="hover:text-[#c23b6d] transition-colors">
                  ტორტები
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#c23b6d] transition-colors">
                  კონტაქტი
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-[Cormorant_Garamond] font-semibold text-white mb-4">
              კონტაქტი
            </h4>
            <ul className="space-y-3 text-[16px]">
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#c23b6d]" />
                <span>+995 599 332 050</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#c23b6d]" />
                <span>Lappetit2019@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-[#c23b6d]" />
                <span>67 ლერმონტოვის ქუჩა, ბათუმი</span>
              </li>
            </ul>
          </div>

          {/* Gallery */}
          <div>
            <h4 className="text-xl font-[Cormorant_Garamond] font-semibold text-white mb-4">
              გალერეა
            </h4>
            {galleryImages.length > 0 && (
              <SwiperComponent
                modules={[Autoplay]}
                slidesPerView={1}
                loop
                autoplay={{
                  delay: 6000,
                  disableOnInteraction: false,
                }}
                className="rounded-xl overflow-hidden shadow-lg"
              >
                {galleryImages.map((image) => (
                  <SwiperSlide key={image.id}>
                    <Link href={`/product/${image.id}`}>
                      <div className="relative w-full h-44 rounded-xl overflow-hidden group">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </SwiperComponent>
            )}
          </div>
        </div>
      </div>

     
    </footer>
  );
};

export default Footer;
