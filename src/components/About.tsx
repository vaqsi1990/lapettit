"use client"
import React from 'react'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

const About = () => {
    return (
        <section className="relative py-20 md:py-24">
            <div className="container mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    viewport={{ once: true, amount: 0.4 }}
                >
                    {/* <p className="tracking-widest text-sm text-rose-400/80 mb-4">
                EMBRACING EXCELLENCE
            </p> */}
                    <h2 className="font-[Cormorant_Garamond] text-3xl md:text-5xl leading-tight text-[#5a2e2e] mb-6">
                        მოგზაურობა ჩვენს ხედვაში,
                        <br /> ღირებულებებსა და
                        <br /> ტკბილ ერთგულებაში
                    </h2>
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
                        ჩვენი გზა ბევრ წლის წინ დაიწყო და მას შემდეგ, უამრავი კლიენტის უნიკალური საჭიროებებისა
                        და სურვილების განხორციელება ჩვენს დიდი სიამოვნებად იქცა. წარმატებას ვაღწევთ არა მხოლოდ
                        გამოცდილებით, არამედ იმ ზრუნვით, რომელსაც თითოეული შეკვეთის მიმართ ვაკეთებთ.
                    </p>

                    {/* <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-3 text-gray-800">
              <Check className="mt-1 h-5 w-5 text-[#c23b6d]" />
              <span>პრემიუმ სერვისებისკენ მიმავალი გზა — გამორჩეული გამოცდილებით</span>
            </li>
            <li className="flex items-start gap-3 text-gray-800">
              <Check className="mt-1 h-5 w-5 text-[#c23b6d]" />
              <span>წარმატებულ იდეებად ქცეული გამოწვევები და შესაძლებლობები</span>
            </li>
          </ul> */}

                    {/* <a
            href="/services"
            className="inline-block border border-[#c23b6d] text-[#c23b6d] hover:bg-[#c23b6d] hover:text-white transition-colors rounded-md px-6 py-3 text-sm tracking-wide"
          >
            ALL SERVICES
          </a> */}
                </motion.div>

                {/* Right collage */}
                <div className="relative">
                    <div className="grid grid-cols-3 gap-5 md:gap-8 items-start">
                        {/* Column 1: single tall image */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                className="relative h-[22rem] md:h-[28rem] rounded-xl overflow-hidden shadow-lg"
                            >
                                <Image src="/catalog/1.jpg" alt="Tall cake" fill className="object-cover" />
                            </motion.div>
                        </motion.div>

                        {/* Column 2: top portrait + bottom wide */}
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.75, delay: 0.1, ease: 'easeOut' }}
                                viewport={{ once: true, amount: 0.3 }}
                                className="relative h-72 md:h-[22rem] rounded-xl overflow-hidden shadow-lg"
                            >
                                <Image src="/catalog/2.jpg" alt="Portrait cake" fill className="object-cover" />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.75, delay: 0.2, ease: 'easeOut' }}
                                viewport={{ once: true, amount: 0.3 }}
                                whileHover={{ scale: 1.03 }}
                                className="relative h-44 md:h-56 rounded-xl overflow-hidden shadow-lg mt-6"
                            >
                                <Image src="/hero/534472152_1350659393733941_4241408366837870335_n.jpg" alt="Wide slice" fill className="object-cover" />
                            </motion.div>
                        </div>

                        {/* Column 3: single tall image, slightly lower */}
                        <motion.div
                            className="mt-10"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                className="relative h-[22rem] md:h-[28rem] rounded-xl overflow-hidden shadow-lg"
                            >
                                <Image src="/catalog/3.jpg" alt="Cupcakes column" fill className="object-cover" />
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default About
