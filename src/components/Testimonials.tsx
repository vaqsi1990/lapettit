"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Quote } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'ნინო ბერიძე',
      text: 'ულამაზესი ტორტი! ყველაფერი იყო სრულყოფილი - გემო, დიზაინი და სერვისი. ჩვენი დღესასწაული ნამდვილად გახდა განსაკუთრებული.',
    },
    {
      id: 2,
      name: 'მარიამ კვარაცხელია',
      text: 'ძალიან კმაყოფილი ვარ! ტორტი იყო არა მხოლოდ ლამაზი, არამედ უგემრიელესი. რეკომენდაციას ვაძლევ ყველას.',
    },
    {
      id: 3,
      name: 'თამარ მელაძე',
      text: 'პროფესიონალური მიდგომა და უმაღლესი ხარისხი. ჩვენი შეკვეთა ზუსტად იმდენად მოგვეწონა, რამდენადაც ოცნებობდით.',
    },
    {
      id: 4,
      name: 'ანა ხარაძე',
      text: 'შესანიშნავი სამუშაო! ყველა დეტალი იყო გათვალისწინებული და ტორტი ზუსტად იმდენად გამოიყურებოდა, როგორც ვიოცნებეთ.',
    },
    {
      id: 5,
      name: 'ეკა ლომიძე',
      text: 'ყველაზე ლამაზი ტორტი, რაც კი ოდესმე გვქონდა! გემო უბრალოდ ზეციური იყო. დიდი მადლობა!',
    },
  ];

  return (
    <section className="relative overflow-hidden mt-20 mb-20 md:py-32">
      {/* Background decorative elements - same as Services */}
      <div className="shape_wrapper shape_one">
        <div className="shape_inner shape_two" style={{ backgroundImage: `url(${'napoleon.jpg'})` }}>
          <div className="overlay"></div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 md:px-8 relative z-20">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center md:mt-0 mt-10 mb-16"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="font-[Cormorant_Garamond] text-[22px] md:text-[30px] font-bold text-white mb-4"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
          >
            კლიენტების მიმოხილვები
          </motion.h2>
        </motion.div>

        {/* Testimonials Carousel - Centered like Bellaria */}
        <div className="relative max-w-4xl mx-auto">
          <SwiperComponent
            modules={[Navigation, Pagination, Autoplay]}
            slidesPerView={1}
            spaceBetween={50}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={{
              nextEl: '.testimonials-button-next',
              prevEl: '.testimonials-button-prev',
            }}
            className="testimonials-swiper mb-12 md:mb-0 relative z-30"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={testimonial.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center px-4 md:px-8"
                >
                 

                  {/* Testimonial Text - Large, elegant typography */}
                  <p className=" text-[18px] md:text-[20px] md:text-2xl text-white max-w-4xl mx-auto leading-relaxed" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                    {testimonial.text}
                  </p>

                  {/* Author Name - Elegant separator */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-px w-12 bg-white/40"></div>
                    <p className="text-white font-semibold text-lg md:text-xl relative z-30 uppercase tracking-wider" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                      {testimonial.name}
                    </p>
                    <div className="h-px w-12 bg-white/40"></div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </SwiperComponent>

          {/* Navigation Buttons - Subtle and elegant */}
      
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

