"use client";

import React from 'react';
import { motion } from 'framer-motion';

const Services = () => {

  return (
    <section className="relative mt-20 overflow-hidden py-20 md:py-32">
      {/* Background decorative elements */}
      <div className="shape_wrapper shape_one">
        <div className="shape_inner shape_two" style={{ backgroundImage: `url(${'/serv/1.jpg'})` }}>
          <div className="overlay"></div>
        </div>
      </div>

      {/* Content */}
      <div className="serv-container relative z-20">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="font-[Cormorant_Garamond] text-[20px] md:text-[30px] font-bold text-white mb-4 relative z-30"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
          >
            რატომ ჩვენ?
          </motion.h2>
        </motion.div>
        
        {/* Four Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-8 mb-12">
          {/* Tradition */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center relative z-30"
          >

            {/* Title */}
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-white text-xl md:text-2xl font-bold mb-4 drop-shadow-lg relative z-30"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              ტრადიცია
            </motion.h3>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-white md:text-[20px] text-[18px] leading-relaxed px-2 relative z-30"
              style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}
            >
              ჩვენი ტრადიციები და რეცეპტები თაობიდან თაობამდე გადაეცემა, რაც გვაძლევს უნიკალურ გემოს და ხარისხს.
            </motion.p>
          </motion.div>

          {/* Quality */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-center relative z-30"
          >


            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-white text-xl md:text-2xl font-bold mb-4 drop-shadow-lg relative z-30"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              ხარისხი
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-white md:text-[20px] text-[16px] leading-relaxed px-2 relative z-30"
              style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}
            >
              ჩვენ ვიყენებთ მხოლოდ უმაღლესი ხარისხის ინგრედიენტებს
            </motion.p>
          </motion.div>

          {/* Creativity */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center relative z-30"
          >


            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-white text-xl md:text-2xl font-bold mb-4 drop-shadow-lg relative z-30"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              კრეატიულობა
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-white md:text-[20px] text-[18px] leading-relaxed px-2 relative z-30"
              style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}
            >
              თითოეული ტორტი არის ხელოვნების ნამუშევარი, რომელიც შექმნილია თქვენი უნიკალური ოცნებების შესაბამისად
            </motion.p>
          </motion.div>

          {/* Passion */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center relative z-30"
          >


            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-white text-xl md:text-2xl font-bold mb-4 drop-shadow-lg relative z-30"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              სიყვარული
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              viewport={{ once: true }}
              className="text-white md:text-[20px] text-[18px] leading-relaxed px-2 relative z-30"
              style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}
            >
              ყველა ტორტი მზადდება სიყვარულით და ზრუნვით, რათა თქვენი სპეციალური დღე გახდეს უვივი
            </motion.p>
          </motion.div>
        </div>


      </div>
    </section>
  );
};

export default Services;
