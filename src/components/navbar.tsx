"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
    <nav className="bg-gradient-to-r from-pink-50 to-rose-100 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4  md:px-8">
        <div className="flex  justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
            <Image  src='/logo.jpg' alt="logo" width={70} height={70} className="rounded-full" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
            
              <Link 
                href="/cakes" 
                className="text-black  text-[16px] md:text-[18px] hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
               ნამუშევრები
              </Link>
             
              <Link 
                href="/custom" 
                className="text-black text-[16px] md:text-[18px] hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
              მორგებული შეკვეთები
              </Link>
              <Link 
                href="/about" 
                className="text-black text-[16px] md:text-[18px] hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                ჩვენს შესახებ
              </Link>
              <Link 
                href="/contact" 
                className="text-black text-[16px] md:text-[18px] hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
               კონტაქტი
              </Link>
            </div>
          </div>
          

      

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-black hover:text-pink-600 focus:outline-none focus:text-pink-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 text-[16px] md:text-[18px] h-screen text-center pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-r from-pink-50 to-rose-100 border-t border-pink-200">
        
        
            <Link 
              href="/cakes" 
              className="text-black hover:text-pink-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              ნამუშევრები
            </Link>

            <Link 
              href="/custom" 
              className="text-black hover:text-pink-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              მორგებული შეკვეთები
            </Link>
            <Link 
              href="/about" 
              className="text-black hover:text-pink-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              ჩვენს შესახებ
            </Link>
            <Link 
              href="/contact" 
              className="text-black hover:text-pink-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              კონტაქტი
            </Link>
        
          </div>
        </div>
      )}
    </nav>
    
    </>
  );
};

export default Navbar;