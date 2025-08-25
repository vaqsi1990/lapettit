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
    <nav className="bg-header  shadow-lg sticky top-0 z-50">
      <div className="mx-auto px-14  md:px-8">
        <div className="flex  justify-between items-center h-[70px] md:h-[100px]">
          {/* Logo */}
          <div className="flex-shrink-0 hidden md:block md:ml-5 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
            <Image  src='/logo.jpg' alt="logo" width={90} height={90} className="rounded-full" />
            </Link>
          </div>

          <div className="flex-shrink-0 md:hidden md:ml-5 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
            <Image  src='/logo.jpg' alt="logo" width={50} height={50} className="rounded-full" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
            
              <Link 
                href="/cakes" 
                className="text-white  text-[16px] md:text-[20px]  px-3 py-2 rounded-md font-bold transition-colors duration-200"
              >
               ნამუშევრები
              </Link>
             
              <Link 
                href="/custom" 
                className="text-white  md:text-[20px] px-3 py-2 rounded-md  font-bold transition-colors duration-200"
              >
              მორგებული შეკვეთები
              </Link>
              <Link 
                href="/about" 
                className="text-white  md:text-[20px] px-3 py-2 rounded-md  font-bold transition-colors duration-200"
              >
                ჩვენს შესახებ
              </Link>
              <Link 
                href="/contact" 
                className="text-white md:text-[20px] px-3 py-2 rounded-md  font-bold transition-colors duration-200"
              >
               კონტაქტი
              </Link>
            </div>
          </div>
          

      

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-pink-600 focus:outline-none focus:text-pink-600"
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
          <div className="px-2 text-[16px] md:text-[18px] h-screen text-center pt-2 pb-3 space-y-1 sm:px-3 bg-header ">
        
        
            <Link 
              href="/cakes" 
              className="text-white block px-3 py-2 rounded-md  text-[18px] font-bold transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              ნამუშევრები
            </Link>

            <Link 
              href="/custom" 
              className="text-white  block px-3 py-2 rounded-md text-[18px] font-bold transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              მორგებული შეკვეთები
            </Link>
            <Link 
              href="/about" 
              className="text-white  block px-3 py-2 rounded-md text-[18px] font-bold transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              ჩვენს შესახებ
            </Link>
            <Link 
              href="/contact" 
              className="text-white  block px-3 py-2 rounded-md text-[18px] font-bold transition-colors duration-200"
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