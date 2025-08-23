"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Cake,
    Heart,
    Gift,
    Star,
    Users,
    Clock,
    Palette,
    Truck
} from 'lucide-react';

interface Service {
    id: number;
    icon: React.ReactNode;
    title: string;
    titleGeorgian: string;
    description: string;
    descriptionGeorgian: string;
    features: string[];
    featuresGeorgian: string[];
    price: string;
    popular?: boolean;
}

const Services = () => {
    const services: Service[] = [
        {
            id: 1,
            icon: <Cake className="w-8 h-8" />,
            title: "Birthday Cakes",
            titleGeorgian: "დაბადების დღის ტორტები",
            description: "Custom birthday cakes for all ages",
            descriptionGeorgian: "პერსონალიზებული დაბადების დღის ტორტები ყველა ასაკისთვის",
            features: [
                "Personalized designs",
                "Age-appropriate themes",
                "Fresh ingredients",
                "24-hour notice"
            ],
            featuresGeorgian: [
                "პერსონალიზებული დიზაინი",
                "ასაკის შესაფერისი თემები",
                "ახალი ინგრედიენტები",
                "24 საათის წინასწარი შეკვეთა"
            ],
            price: "₾45+"
        },
        {
            id: 2,
            icon: <Heart className="w-8 h-8" />,
            title: "Wedding Cakes",
            titleGeorgian: "ქორწილის ტორტები",
            description: "Elegant wedding cakes for your special day",
            descriptionGeorgian: "ელეგანტური ქორწილის ტორტები თქვენი განსაკუთრებული დღისთვის",
            features: [
                "Multi-tier designs",
                "Wedding consultation",
                "Delivery & setup",
                "1-week notice"
            ],
            featuresGeorgian: [
                "მრავალშრიანი დიზაინი",
                "ქორწილის კონსულტაცია",
                "მიწოდება და მონტაჟი",
                "1 კვირის წინასწარი შეკვეთა"
            ],
            price: "₾120+",
            popular: true
        },
        {
            id: 3,
            icon: <Gift className="w-8 h-8" />,
            title: "Celebration Cakes",
            titleGeorgian: "დღესასწაულის ტორტები",
            description: "Special cakes for all celebrations",
            descriptionGeorgian: "გემრიელი და მხიარული ტორტები, რომლებიც თქვენს დღესასწაულს განსაკუთრებულად აქცევს",
            features: [
                "Holiday themes",
                "Corporate events",
                "Anniversary cakes",
                "48-hour notice"
            ],
            featuresGeorgian: [
                "საახალწლო თემები",
                "კორპორატიული ღონისძიებები",
                "იუბილეს ტორტები",
                "48 საათის წინასწარი შეკვეთა"
            ],
            price: "₾60+"
        },
        {
            id: 4,
            icon: <Star className="w-8 h-8" />,
            title: "Custom Designs",
            titleGeorgian: "ინდივიდუალური დიზაინი",
            description: "Unique cakes designed just for you",
            descriptionGeorgian: "უნიკალური ტორტები, რომლებიც მხოლოდ თქვენთვის არის შექმნილი",
            features: [
                "3D designs",
                "Edible images",
                "Fondant art",
                "1-week notice"
            ],
            featuresGeorgian: [
                "3D დიზაინი",
                "საჭმელი სურათები",
                "ფონდანის ხელოვნება",
                "1 კვირის წინასწარი შეკვეთა"
            ],
            price: "₾80+"
        },
        {
            id: 5,
            icon: <Users className="w-8 h-8" />,
            title: "Cupcake Towers",
            titleGeorgian: "ტარტები",
            description: "Beautiful cupcake arrangements",
            descriptionGeorgian: "ნაზი, ხრაშუნა ფუძე და ბალახუნივით ჰაეროვანი კრემი ჩვენი ტარტები ბედნიერების ტკბილი ნაჭერია",
            features: [
                "24-48 cupcakes",
                "Various flavors",
                "Decorative stands",
                "Same-day service"
            ],
            featuresGeorgian: [
                "24-48 კაპკეიქი",
                "სხვადასხვა გემო",
                "დეკორატიული სადგამები",
                "იმავე დღის სერვისი"
            ],
            price: "₾35+"
        },
        {
            id: 6,
            icon: <Palette className="w-8 h-8" />,
            title: "Cake Decorating",
            titleGeorgian: "ტორტის დეკორირება",
            description: "Professional cake decoration services",
            descriptionGeorgian: "პროფესიონალური ტორტის დეკორირების სერვისები",
            features: [
                "Fondant work",
                "Buttercream piping",
                "Sugar flowers",
                "On-site decoration"
            ],
            featuresGeorgian: [
                "ფონდანის სამუშაო",
                "ბატერკრიმის მილები",
                "შაქრის ყვავილები",
                "ადგილზე დეკორირება"
            ],
            price: "₾25+"
        }
    ];

    const additionalServices = [
        {
            icon: <Clock className="w-6 h-6" />,
            title: "Express Service",
            titleGeorgian: "ექსპრეს სერვისი",
            description: "სწრაფი შეკვეთები"
        },
        {
            icon: <Truck className="w-6 h-6" />,
            title: "Delivery",
            titleGeorgian: "მიწოდება",
            description: "უფასო მიტანა ქალაქის ფარგლებში"
        }
    ];

    return (
        <section className="relative  mt-20  overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0">
                <div className="absolute top-20 right-10 w-40 h-40 bg-pink-100/50 rounded-full mix-blend-multiply filter blur-3xl" />
                <div className="absolute bottom-20 left-10 w-60 h-60 bg-purple-100/50 rounded-full mix-blend-multiply filter blur-3xl" />
            </div>

            <div className="relative z-10 container mx-auto px-4">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-[20px] md:text-[30px] font-bold text-black mb-6">
                        ჩვენი სერვისები
                    </h2>
                    <p className="text-[18px] md:text-[20px] text-black mb-8 max-w-3xl mx-auto">
                        ყველა სახის ტორტი და ნამცხვარი თქვენი განსაკუთრებული დღისთვის
                    </p>
                </motion.div>

                {/* Main Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="group h-full"
                        >
                            <div className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 h-full flex flex-col`}>

                                {/* Service Header */}
                                <div className="p-6 text-center flex-shrink-0">
                                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${service.popular
                                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                                            : 'bg-pink-100 text-pink-600'
                                        } group-hover:scale-110 transition-transform duration-300`}>
                                        {service.icon}
                                    </div>

                                    <h3 className="text-[18px] md:text-[20px] font-bold text-black mb-2">
                                        {service.titleGeorgian}
                                    </h3>
                                    <p className="text-black text-[14px] md:text-[16px] mb-4 line-clamp-3">
                                        {service.descriptionGeorgian}
                                    </p>

                                    {/* Price */}
                                    <div className="text-[18px] md:text-[20px] font-bold text-pink-600 mb-4">
                                        {service.price}
                                    </div>
                                </div>

                                {/* Features List */}
                                <div className="px-6 pb-6 flex-grow">
                                    <ul className="space-y-2">
                                        {service.featuresGeorgian.map((feature, idx) => (
                                            <li key={idx} className="flex items-center text-[14px] md:text-[16px] text-black">
                                                <div className="w-2 h-2 bg-pink-400 rounded-full mr-3 flex-shrink-0" />
                                                <span className="line-clamp-2">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* CTA Button */}
                                <div className="px-6 pb-6 flex-shrink-0">
                                    <button className="w-full cursor-pointer md:text-[20px] text-[18px] bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                                        შეუკვეთე ახლა
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Services */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className=" rounded-3xl  mt-20"
                >
                    <h3 className="text-[20px] md:text-[30px] font-bold text-black mb-8 font-bold text-center mb-4 md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
                        დამატებითი სერვისები
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {additionalServices.map((service, index) => (
                            <div key={index} className="flex items-center space-x-4 bg-white rounded-xl p-4 shadow-md">
                                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
                                    {service.icon}
                                </div>
                                <div>
                                    <h4 className="font-semibold md:text-[20px] text-[18px] text-black">{service.titleGeorgian}</h4>
                                    <p className="text-[14px] md:text-[16px] text-black mb-8 max-w-3xl mx-auto text-black">{service.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>


            </div>
        </section>
    );
};

export default Services;
