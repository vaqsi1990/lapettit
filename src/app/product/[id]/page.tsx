"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Product data interface matching Gallery component
interface Product {
    id: number;
    src: string;
    alt: string;
    category: string;
    categoryGeorgian: string;
    title: string;
    titleGeorgian: string;
    description: string;
    descriptionGeorgian: string;
    likes?: number;
    comments?: number;
}

const ProductPage = () => {
    const params = useParams();
    const productId = parseInt(params.id as string);
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [loading, setLoading] = useState(true);

    // Product data from Gallery component
    const galleryProducts: Product[] = [
        {
            id: 1,
            src: "/hero/534472152_1350659393733941_4241408366837870335_n.jpg",
            alt: "Birthday Cake with Flowers",
            category: "birthday",
            categoryGeorgian: "დაბადების დღე",
            title: "Floral Birthday Delight",
            titleGeorgian: "ყვავილოვანი დაბადების დღის სიამოვნება",
            description: "Beautiful birthday cake decorated with fresh flowers and pastel colors",
            descriptionGeorgian: "ლამაზი დაბადების დღის ტორტი, დეკორირებული ახალი ყვავილებით და პასტელის ფერებით",
            likes: 128,
            comments: 24
        },
        {
            id: 2,
            src: "/hero/528840499_1341682604631620_4000600754266452299_n.jpg",
            alt: "Elegant Wedding Cake",
            category: "wedding",
            categoryGeorgian: "ქორწილი",
            title: "Wedding Elegance",
            titleGeorgian: "ქორწილის ელეგანტურობა",
            description: "Multi-tier wedding cake with intricate fondant work and gold accents",
            descriptionGeorgian: "მრავალშრიანი ქორწილის ტორტი რთული ფონდანის სამუშაოთი და ოქროს აქცენტებით",
            likes: 256,
            comments: 42
        },
        {
            id: 3,
            src: "/hero/530248860_1343671131099434_2511349373577876023_n.jpg",
            alt: "Custom Design Cake",
            category: "custom",
            categoryGeorgian: "ინდივიდუალური",
            title: "Custom Creation",
            titleGeorgian: "ინდივიდუალური შექმნა",
            description: "Unique custom cake designed according to client's specific requirements",
            descriptionGeorgian: "უნიკალური ინდივიდუალური ტორტი, შექმნილი კლიენტის კონკრეტული მოთხოვნების მიხედვით",
            likes: 89,
            comments: 15
        },
        {
            id: 4,
            src: "/catalog/1.jpg",
            alt: "Chocolate Celebration Cake",
            category: "celebration",
            categoryGeorgian: "დღესასწაული",
            title: "Chocolate Celebration",
            titleGeorgian: "შოკოლადის დღესასწაული",
            description: "Rich chocolate cake perfect for any celebration or special occasion",
            descriptionGeorgian: "მდიდარი შოკოლადის ტორტი, იდეალური ნებისმიერი დღესასწაულისთვის ან სპეციალური შემთხვევისთვის",
            likes: 167,
            comments: 31
        },
        {
            id: 5,
            src: "/catalog/2.jpg",
            alt: "Vanilla Dream Cake",
            category: "birthday",
            categoryGeorgian: "დაბადების დღე",
            title: "Vanilla Dream",
            titleGeorgian: "ვანილის ოცნება",
            description: "Delicate vanilla cake with fresh berries and cream decoration",
            descriptionGeorgian: "ნაზი ვანილის ტორტი ახალი კენკრით და კრემის დეკორაციით",
            likes: 94,
            comments: 18
        },
        {
            id: 6,
            src: "/catalog/3.jpg",
            alt: "Red Velvet Special",
            category: "celebration",
            categoryGeorgian: "დღესასწაული",
            title: "Red Velvet Magic",
            titleGeorgian: "წითელი ბარხატის ჯადო",
            description: "Classic red velvet cake with cream cheese frosting and elegant design",
            descriptionGeorgian: "კლასიკური წითელი ბარხატი ყველის კრემით და ელეგანტური დიზაინით",
            likes: 203,
            comments: 37
        }
    ];

    // Find product by ID
    useEffect(() => {
        const foundProduct = galleryProducts.find(p => p.id === productId);
        if (foundProduct) {
            setProduct(foundProduct);
        }
        setLoading(false);
    }, [productId]);

    // Generate related products (same category, excluding current product)
    const relatedProducts = galleryProducts
        .filter(p => p.id !== productId && p.category === product?.category)
        .slice(0, 4);

    // If no related products in same category, show random products
    const fallbackRelatedProducts = galleryProducts
        .filter(p => p.id !== productId)
        .slice(0, 4);

    const finalRelatedProducts = relatedProducts.length > 0 ? relatedProducts : fallbackRelatedProducts;



    // Calculate price based on product category
    const getProductPrice = (product: Product) => {
        const basePrices = {
            birthday: 45,
            wedding: 80,
            custom: 100,
            celebration: 55
        };
        return basePrices[product.category as keyof typeof basePrices] || 50;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-pink-500  rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-black">იტვირთევა პროდუქტი...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
                <div className="text-center">
                    <h1 className="text-[20px] md:text-[30px] font-bold text-black mb-4">პროდუქტი ვერ მოიძებნა</h1>
                    <p className="text-black mb-6">მითითებული ID-ით პროდუქტი არ არსებობს</p>
                    <Link href="/gallery" className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors">
                        დაბრუნდი გალერეაში
                    </Link> 
                </div>
            </div>
        );
    }

    const productPrice = getProductPrice(product);

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">



            {/* Product Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Left Column - Product Images */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative w-full h-[350px] group"
                        >
                            <Image
                                fill
                                src={product.src}
                                alt={product.titleGeorgian}
                                className="object-cover shadow-lg"
                            />
                        </motion.div>


                        {/* Additional product images */}
                        <div className="grid grid-cols-3 gap-3">
                            {[product.src, product.src, product.src].map((image, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                    <img
                                        src={image}
                                        alt={`${product.titleGeorgian} ${index + 1}`}
                                        className="w-full h-20 object-cover rounded-lg  transition-colors"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Product Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <h1 className="text-[20px] md:text-[30px] font-bold text-black mb-2">
                                {product.titleGeorgian}
                            </h1>

                        </div>

                        <div className="flex items-center gap-4">
                                <span className="text-[20px] md:text-[30px] font-bold text-pink-600">₾{productPrice}</span>
                        </div>

                        <p className="text-black    leading-relaxed text-[16px] md:text-[18px]    ">
                            {product.descriptionGeorgian}
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="text-black font-medium">რაოდენობა:</label>
                                <div className="flex items-center border rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-3 py-2  transition-colors"
                                    >
                                        -
                                    </button>
                                        <span className="px-4 py-2 border-x">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="px-3 py-2  transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <button className="w-full md:w-[50%] bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 px-6 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 flex items-center justify-center gap-2">

                                კალათაში დამატება
                            </button>
                        </div>


                    </motion.div>
                </div>


            </div>

            {/* Related Products */}
            <div className=" py-16">
                <div className="container mx-auto px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[20px] md:text-[30px] font-bold text-center text-black mb-12"
                    >
                        მსგავსი პროდუქტები
                    </motion.h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {finalRelatedProducts.map((relatedProduct, index) => (
                            <motion.div
                                key={relatedProduct.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
                            >
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={relatedProduct.src}
                                        alt={relatedProduct.titleGeorgian}
                                        className="w-full h-48 object-cover"
                                    />
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="font-semibold text-black mb-2 text-[16px] md:text-[18px] line-clamp-2 min-h-[2.5rem] flex items-center">
                                        {relatedProduct.titleGeorgian}
                                    </h3>

                                    <div className="flex items-center gap-2 mb-3 mt-auto">
                                        <span className="text-pink-600 font-bold text-lg">₾{getProductPrice(relatedProduct)}</span>
                                    </div>
                                    <Link
                                        href={`/product/${relatedProduct.id}`}
                                        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-300 block text-center mt-auto"
                                    >
                                        დეტალების ნახვა
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>




        </div>
    );
};

export default ProductPage;
