"use client";

import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 ">
          
          {/* Company Info */}
          <div
            className="lg:col-span-2"
          >
            <h3 className="text-2xl font-bold text-white mb-4"> Sweet Dreams</h3>
            <p className="text-white text-[16px] md:text-[18px] leading-relaxed mb-6 max-w-md">
              ჩვენ ვქმნით არა მხოლოდ ტორტებს, არამედ უნიკალურ გამოცდილებას, 
              რომელიც თქვენს სპეციალურ დღეს გახდის უვივი და დავიწყებადი.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className='text-[16px] md:text-[18px]'
          >
            <h4 className="text-lg font-semibold text-white mb-4">სწრაფი ბმულები</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white hover:text-pink-400 transition-colors duration-300">
                  მთავარი
                </a>
              </li>
              <li>
                <a href="#" className="text-white  hover:text-pink-400 transition-colors duration-300">
                  ჩვენი ნამუშევრები
                </a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-pink-400 transition-colors duration-300">
                  სერვისები
                </a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-pink-400 transition-colors duration-300">
                  სპეციალური შეთავაზებები
                </a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-pink-400 transition-colors duration-300">
                  კონტაქტი
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className='text-[16px] md:text-[18px]'
          >
            <h4 className=" text-[16px] md:text-[18px] font-semibold text-white mb-4">კონტაქტი</h4>
              <div className="space-y-3 text-[16px] md:text-[18px]">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-pink-400" />
                <span className="text-white text-[16px] md:text-[18px]">+995 555 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-pink-400" />
                <span className="text-white text-[16px] md:text-[18px]">info@sweetdreams.ge</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-pink-400" />
                <span className="text-white text-[16px] md:text-[18px]">თბილისი, საქართველო</span>
              </div>
            
            </div>
          </div>
        </div>

   
      </div>

   
    </footer>
  );
};

export default Footer;