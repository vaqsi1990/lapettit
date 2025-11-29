"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { getCartCount } from "@/lib/cartUtils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }; 

  // Update cart count
  const updateCartCount = () => {
    const count = getCartCount();
    setCartCount(count);
  };
console.log("cartCount", cartCount);
  // Fetch cart count from localStorage
  useEffect(() => {
    // Initial load - use setTimeout to ensure localStorage is available
    const initCount = () => {
      updateCartCount();
    };
    
    // Immediate check
    initCount();
    
    // Also check after a small delay to ensure everything is loaded
    const initTimeout = setTimeout(initCount, 100);
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      updateCartCount();
    };
    
    // Listen for custom cartUpdated event
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Listen for storage changes (for multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lapettit_cart' || !e.key) {
        updateCartCount();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for focus event (when user returns to tab)
    const handleFocus = () => {
      updateCartCount();
    };
    window.addEventListener('focus', handleFocus);
    
    // Listen for page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateCartCount();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Refresh cart count periodically (in case of multiple tabs)
    const interval = setInterval(updateCartCount, 500);
    
    return () => {
      clearTimeout(initTimeout);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

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
            <div className="ml-10 flex items-baseline items-center text-center space-x-8">
            
              <Link 
                href="/cakes" 
                className="text-white  text-[16px] md:text-[20px]  px-3 py-2 rounded-md font-bold transition-colors duration-200"
              >
               ტორტები
              </Link>
          
              <Link 
              href="/contact" 
              className="text-white  block px-3 py-2 rounded-md text-[18px] font-bold transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              კონტაქტი
            </Link>

            <Link 
              href="/cart" 
              className="relative text-white px-3 py-2 rounded-md text-[18px] font-bold transition-colors duration-200 hover:text-pink-300 flex items-center justify-center"
            >
              <ShoppingCart className="w-7 h-7" />
              {cartCount > 0 ? (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 z-10 shadow-lg">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              ) : null}
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
              ტორტები
            </Link>
          
         
            <Link 
              href="/contact" 
              className="text-white  block px-3 py-2 rounded-md text-[18px] font-bold transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              კონტაქტი
            </Link>

            <Link 
              href="/cart" 
              className="relative text-white block px-3 py-2 rounded-md text-[18px] font-bold transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span>კალათა</span>
                {cartCount > 0 && (
                  <span className="bg-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
            </Link>
        
          </div>
        </div>
      )}
    </nav>
    
    </>
  );
};

export default Navbar;