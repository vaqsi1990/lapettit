"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cake, 
  Heart, 
  Star, 
  Award, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  Instagram,
  Facebook,
  Clock,
  CheckCircle
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-color">
      {/* Hero Section */}
      <section className="relative py-10 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Cake className="w-12 h-12 text-pink-600" />
            </div>
            <h1 className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-6">
              ჩვენს შესახებ
            </h1>
            <p className="text-[18px] md:text-[20px] text-black mb-8 max-w-3xl mx-auto">
              ჩვენ ვქმნით არა მხოლოდ ტორტებს, არამედ უნიკალურ მომენტებს, 
              რომლებიც ყოველთვის დარჩება თქვენს მეხსიერებაში
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-10 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-6">
                ჩვენი ისტორია
              </h2>
              <p className="text-[18px] md:text-[20px] text-black mb-8 max-w-3xl mx-auto">
                2018 წელს, ჩვენი ოჯახის სამზარეულოში დაიწყო ტორტების ცხობა. 
                რაც დაწყება იყო მარტივი ჰობით, დღეს გახდა ჩვენი ცხოვრების მიზანი.
              </p>
              <p className="text-[18px] md:text-[20px] text-black mb-8 max-w-3xl mx-auto">
                ყოველი ტორტი ჩვენთვის არის ნამუშევარი, რომელიც იქმნება სიყვარულით, 
                ყურადღებით და უნიკალური ინგრედიენტებით. ჩვენ ვწერთ თქვენს ისტორიას 
                ყოველ ნაჭერში.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-pink-600" />
                  <span className="text-black text-[18px] md:text-[20px] text-black">5+ წლის გამოცდილება</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-pink-600" />
                  <span className="text-black text-[18px] md:text-[20px] text-black">1000+ ბედნიერი კლიენტი</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-pink-100 text-pink-600  group-hover:scale-110 transition-transform duration-300">
                      <Heart className="w-8 h-8 text-pink-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">სიყვარული</h3>
                    <p className="text-gray-600">ყოველი ტორტი იქმნება სიყვარულით</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-pink-100 text-pink-600  group-hover:scale-110 transition-transform duration-300">
                      <Star className="w-8 h-8 text-pink-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">ხარისხი</h3>
                    <p className="text-gray-600">მხოლოდ საუკეთესო ინგრედიენტები</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center  bg-pink-100 text-pink-600 group-hover:scale-110 transition-transform duration-300">
                      <Award className="w-8 h-8 text-pink-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">ცნობადობა</h3>
                    <p className="text-gray-600">ქალაქის საუკეთესო კონდიტერი</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-pink-100 text-pink-600 group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-8 h-8 text-pink-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">გუნდი</h3>
                    <p className="text-gray-600">პროფესიონალები თავიანთ საქმეში</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>




      {/* Team Section */}
      <section className="py-10 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-8">
              ჩვენი გუნდი
            </h2>
            <p className="text-[18px] md:text-[20px] text-black mb-8 max-w-3xl mx-auto">
              ჩვენი გუნდი შედგება პროფესიონალი კონდიტერებისგან, 
              რომლებიც ყოველდღე ქმნიან უნიკალურ ტორტებს
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Cake className="w-8 h-8 " />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">ვალერიან მარგალიტაძე</h3>
              <p className=" text-black text-[18px] mb-4 line-clamp-2">მთავარი კონდიტერი</p>
              
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Heart className="w-8 h-8 " />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">ნინო ბერიძე</h3>
              <p className=" text-black text-[18px] mb-4 line-clamp-2">დეკორატორი</p>
             
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Star className="w-8 h-8 " />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">ლევან მაისურაძე</h3>
              <p className=" text-black text-[18px] mb-4 line-clamp-2">პასტრი ფაბრიკა</p>
              
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact & Info Section */}
      <section className="py-10 px-4 ">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-8">
                დაგვიკავშირდით
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
                    <Phone className="w-8 h-8 " />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[18px] md:text-[20px] ">ტელეფონი</h3>
                    <p className="text-black text-[18px] md:text-[20px]">+995 599 123 456</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 " />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[18px] md:text-[20px]">ელ-ფოსტა</h3>
                    <p className="text-black text-[18px] md:text-[20px]">info@cakes.ge</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 " />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[18px] md:text-[20px]">მისამართი</h3>
                    <p className="text-black text-[18px] md:text-[20px]">რუსთავის გზატკეცილი 123, თბილისი</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 " />
                  </div>
                  <div>
                    <h3 className="font-semibold ">სამუშაო საათები</h3>
                    <p className="text-black text-[18px] md:text-[20px]">ორშაბათი - შაბათი: 9:00 - 20:00</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-bold text-[20px] md:text-[30px] text-[#d90b6b] mb-4">გამოგვყევით</h3>
                <div className="flex gap-4">
                  <a href="#" className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center hover:bg-pink-200 transition-colors">
                    <Instagram className="w-8 h-8 " />
                  </a>
                  <a href="#" className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center hover:bg-pink-200 transition-colors">
                    <Facebook className="w-8 h-8 " />
                  </a>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8"
            >
              <h3 className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-6">რატომ ვირჩევთ ჩვენ?</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-pink-600" />
                  <span className="text-black text-[18px] md:text-[20px] text-black">უნიკალური დიზაინები თქვენი იდეების მიხედვით</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-pink-600" />
                  <span className="text-black text-[18px] md:text-[20px] text-black">მხოლოდ ბუნებრივი და ხარისხიანი ინგრედიენტები</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-pink-600" />
                  <span className="text-black text-[18px] md:text-[20px] text-black">სწრაფი მიწოდება თბილისის მთელ ტერიტორიაზე</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-pink-600" />
                  <span className="text-black text-[18px] md:text-[20px] text-black">24/7 მხარდაჭერა და კონსულტაცია</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-pink-600" />
                  <span className="text-black text-[18px] md:text-[20px] text-black">გარანტია ხარისხზე და გემოზე</span>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-white rounded-2xl">
                <h4 className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-3">სპეციალური შეთავაზება</h4>
                <p className="text-black text-[18px] md:text-[20px] text-black mb-4">
                  პირველი შეკვეთისთვის მიიღეთ 15% ფასდაკლება!
                </p>
                <button className="w-full md:mt-12  md:w-[300px] mx-auto cursor-pointer md:text-[20px] text-[18px] bg-[#d90b6b] hover:from-pink-600 hover:to-rose-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  შეუკვეთეთ ახლა
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;