"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Clock, Award, Users, Shield } from 'lucide-react';

const Why = () => {
  const reasons = [
    {
      icon: <Star className="w-8 h-8 text-pink-600" />,
      title: "Premium Quality",
      titleGeorgian: "პრემიუმ ხარისხი",
      description: "We use only the finest ingredients and follow strict quality standards",
      descriptionGeorgian: "ჩვენ ვიყენებთ მხოლოდ საუკეთესო ინგრედიენტებს და ვიცავთ მაღალი ხარისხის სტანდარტებს"
    },
    {
      icon: <Heart className="w-8 h-8 text-pink-600" />,
      title: "Made with Love",
      titleGeorgian: "სიყვარულით დამზადებული",
      description: "Every cake is crafted with passion and attention to detail",
      descriptionGeorgian: "ყველა ტორტი მზადდება სიყვარულით და დეტალებზე ყურადღებით"
    },
    {
      icon: <Clock className="w-8 h-8 text-pink-600" />,
      title: "Fast Delivery",
      titleGeorgian: "სწრაფი მიწოდება",
      description: "Express delivery available for urgent orders and special occasions",
      descriptionGeorgian: "ექსპრეს მიწოდება ხელმისაწვდომია გადაუდებელი შეკვეთებისთვის"
    },
    {
      icon: <Award className="w-8 h-8 text-pink-600" />,
      title: "Award Winning",
      titleGeorgian: "ხალხის სიყვარული",
      description: "Recognized for excellence in cake design and customer satisfaction",
      descriptionGeorgian: "ჩვენთვის პირველ ადგილზე მყიდველია"
    },
    {
      icon: <Users className="w-8 h-8 text-pink-600" />,
      title: "Expert Team",
      titleGeorgian: "ექსპერტ გუნდი",
      description: "Professional bakers and decorators with years of experience",
      descriptionGeorgian: "პროფესიონალი მცხობელები და დეკორატორები მრავალწლიანი გამოცდილებით"
    },
    {
      icon: <Shield className="w-8 h-8 text-pink-600" />,
      title: "100% Guarantee",
      titleGeorgian: "100% გარანტია",
      description: "Complete satisfaction guaranteed or your money back",
      descriptionGeorgian: "სრული კმაყოფილება გარანტირებულია ან თქვენი ფული დაბრუნდება"
    }
  ];

  const stats = [
    { number: "500+", label: "Happy Customers", labelGeorgian: "კმაყოფილი კლიენტი" },
    { number: "1000+", label: "Cakes Delivered", labelGeorgian: "მიწოდებული ტორტი" },
    { number: "5+", label: "Years Experience", labelGeorgian: "წლის გამოცდილება" },
    { number: "24/7", label: "Customer Support", labelGeorgian: "კლიენტების მხარდაჭერა" }
  ];

  return (
    <section className="relative mt-10  overflow-hidden">
 
      <div className="relative z-10 container mx-auto px-4">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <motion.h2 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-8"
          >
            რატომ აირჩიოთ ჩვენ?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-[18px] md:text-[20px] text-black max-w-4xl mx-auto leading-relaxed"
          >
            ჩვენ ვქმნით არა მხოლოდ ტორტებს, არამედ უნიკალურ გამოცდილებას, 
            რომელიც თქვენს სპეციალურ დღეს გახდის უვივი
          </motion.p>
        </motion.div>

        {/* Main Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500"
            >
              <div className="text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  {reason.icon}
                </motion.div>
                
                <h3 className="text-[20px] md:text-[24px] font-bold text-black mb-4">
                  {reason.titleGeorgian}
                </h3>
                
                <p className="text-black text-[14px] md:text-[16px] leading-relaxed">
                  {reason.descriptionGeorgian}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Statistics Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20 mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-4">
              ჩვენი მიღწევები
            </h3>
            <p className="text-[18px] md:text-[20px] text-black">
              რიცხვები, რომლებიც საუბრობენ თავად
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 1 + index * 0.1 }}
                  className=" font-bold  text-[24px] md:text-[30px] text-[#d90b6b]  mb-2"
                >
                  {stat.number}
                </motion.div>
                <p className="text-black text-[16px] md:text-[16px] font-medium">
                  {stat.labelGeorgian}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Delivery Info Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className=" mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-4">
              მიწოდების სერვისი
            </h3>
            <p className="text-[18px] md:text-[20px] text-black">
              ჩვენ ვიზრუნებთ, რომ თქვენი ტორტი უსაფრთხოდ და დროულად მივიდეს
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Delivery Areas */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="bg-white rounded-2xl p-6  hover:shadow-xl transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-50 to-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-black mb-3">მიწოდების ზონები</h4>
                <p className="text-black text-[14px] md:text-[16px] leading-relaxed">
                  თბილისი, რუსთავი, ქუთაისი, ბათუმი, გორი, ზუგდიდი
                </p>
              </div>
            </motion.div>

            {/* Delivery Times */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="bg-white rounded-2xl p-6  hover:shadow-xl transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-50 to-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-black mb-3">მიწოდების დრო</h4>
                  <p className="text-black text-[14px] md:text-[16px] leading-relaxed">
                  სტანდარტული: 2-3 საათი<br/>
                  ექსპრეს: 1-2 საათი<br/>
                  ურგენტი: 30-60 წუთი
                </p>
              </div>
            </motion.div>

            {/* Delivery Cost */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="bg-white rounded-2xl p-6  hover:shadow-xl transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-50 to-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-black mb-3">მიწოდების ღირებულება</h4>
                <p className="text-black text-[14px] md:text-[16px] leading-relaxed">
                  თბილისში: უფასო<br/>
                  რეგიონებში: 5-15₾<br/>
                  ექსპრესი: +3₾
                </p>
              </div>
            </motion.div>
          </div>

          {/* Additional Delivery Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="mt-8 text-center"
          >
            <div className="bg-white/80 rounded-2xl p-6 ">
              <h5 className="text-[18px] md:text-[20px] font-semibold text-black mb-4">მიწოდების პირობები</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[16px] md:text-[18px] text-black">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[14px] md:text-[16px]">უსაფრთხო შეფუთვა</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>ტემპერატურის კონტროლი</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[14px] md:text-[16px]">საკონტაქტო მიწოდება</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[14px] md:text-[16px]">24/7 მხარდაჭერა</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

    

   
      </div>
    </section>
  );
};

export default Why;