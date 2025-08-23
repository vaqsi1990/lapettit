"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Phone, Mail, MapPin,  Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2"
          >
            <h3 className="text-2xl font-bold text-white mb-4"> Sweet Dreams</h3>
            <p className="text-white leading-relaxed mb-6 max-w-md">
              ჩვენ ვქმნით არა მხოლოდ ტორტებს, არამედ უნიკალურ გამოცდილებას, 
              რომელიც თქვენს სპეციალურ დღეს გახდის უვივი და დავიწყებადი.
            </p>
            <div className="flex space-x-4">
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href="#"
                className="w-10 h-10 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href="#"
                className="w-10 h-10 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href="#"
                className="w-10 h-10 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors duration-300"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
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
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold text-white mb-4">კონტაქტი</h4>
              <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-pink-400" />
                <span className="text-white text-sm">+995 555 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-pink-400" />
                <span className="text-white text-sm">info@sweetdreams.ge</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-pink-400" />
                <span className="text-white text-sm">თბილისი, საქართველო</span>
              </div>
            
            </div>
          </motion.div>
        </div>

   
      </div>

   
    </footer>
  );
};

export default Footer;