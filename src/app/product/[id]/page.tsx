"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Plus, Minus, } from 'lucide-react';
import { getCakeById, getCakes } from '@/lib/action';
import { mapCakeToGalleryImage, type GalleryImage } from '@/lib/utils';

const ProductPage = () => {
    const params = useParams();
    const productId = parseInt(params.id as string);
    const [product, setProduct] = useState<GalleryImage | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<GalleryImage[]>([]);
    const [quantity, setQuantity] = useState(1);

    const [loading, setLoading] = useState(true);
    const [selectedImage] = useState(0);

    // Fetch product and related products
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const result = await getCakeById(productId);

                if (result.success && result.data) {
                    const mappedProduct = mapCakeToGalleryImage(result.data);
                    setProduct(mappedProduct);

                    // Fetch related products
                    const allCakesResult = await getCakes();
                    if (allCakesResult.success && allCakesResult.data) {
                        const allProducts = allCakesResult.data.map(mapCakeToGalleryImage);
                        const related = allProducts
                            .filter(p => p.id !== productId && p.category === mappedProduct.category)
                            .slice(0, 4);

                        // If not enough related products, add random ones
                        if (related.length < 4) {
                            const randomProducts = allProducts
                                .filter(p => p.id !== productId && !related.find(r => r.id === p.id))
                                .slice(0, 4 - related.length);
                            setRelatedProducts([...related, ...randomProducts]);
                        } else {
                            setRelatedProducts(related);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
                    <Link href="/" className="bg-[#d90b6b] text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors">
                        დაბრუნდი მთავარ გვერდზე
                    </Link>
                </div>
            </div>
        );
    }

    // Generate additional images for the product
    const productImages = [
        product.src,
        product.src, // You can add more images here later
        product.src,
        product.src
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 pt-20">
            {/* Product Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Product Images */}
                    <div className="space-y-4">
                        {/* Main Product Image */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative w-full group overflow-hidden rounded-2xl shadow-lg bg-white"
                        >
                            <Image
                                width={500} 
                                height={300}
                                src={productImages[selectedImage]}
                                alt={product.titleGeorgian}
                                className="object-cover w-full h-auto"
                            />
                        </motion.div>
                    </div>

                    {/* Right Column - Product Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20"
                    >
                        {/* Category Badge */}
                        <div className="inline-block">
                            <span className="bg-pink-100 text-[#d90b6b] px-4 py-2 rounded-full text-sm font-medium">
                                {product.categoryGeorgian}
                            </span>
                        </div>

                        {/* Product Title */}
                        <div>
                            <h1 className="text-[24px] md:text-[32px] font-bold text-black mb-3 leading-tight">
                                {product.titleGeorgian}
                            </h1>

                        </div>



                        {/* Description */}
                        <div className="space-y-4">

                            <p className="text-gray-700 leading-relaxed text-[16px] md:text-[18px]">
                                {product.descriptionGeorgian}
                            </p>
                        </div>

                        {/* Quantity Selector */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-black font-medium text-lg">რაოდენობა:</label>
                                <div className="flex items-center rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-2 md:p-3 cursor-pointer bg-pink-100 rounded-full transition-colors"
                                    >
                                        <Minus className="w-5 h-5 text-pink-600 md:w-6 md:h-6" />
                                    </button>
                                    <span className="text-base md:text-lg lg:text-xl font-bold text-black min-w-[2.5rem] md:min-w-[3rem] text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-2 md:p-3 cursor-pointer rounded-full bg-pink-100 transition-colors"
                                    >
                                        <Plus className="w-5 h-5 text-pink-600 md:w-6 md:h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Total Price */}
                            <div className="flex items-center justify-between py-3 border-t border-gray-200">
                                <span className="text-lg font-medium text-gray-700">სულ:</span>
                                <span className="text-2xl font-bold text-[#d90b6b]">₾{(product.price * quantity).toFixed(2)}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Link href={`/order/${product.id}`} className="w-full cursor-pointer bg-[#d90b6b] hover:bg-pink-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
                                   შეუკვეთე ახლა
                                </Link>

                            </div>
                        </div>


                    </motion.div>
                </div>
            </div>

            {/* Related Products */}
            <div className="py-16 ">
                <div className="container mx-auto px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[24px] md:text-[32px] font-bold text-center text-black mb-12"
                    >
                        მსგავსი პროდუქტები
                    </motion.h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((relatedProduct, index) => (
                            <motion.div
                                key={relatedProduct.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
                            >
                                <div className="relative overflow-hidden">
                                    <div className="aspect-[4/3] relative">
                                        <Image
                                            src={relatedProduct.src}
                                            alt={relatedProduct.titleGeorgian}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>

                                </div>
                                <div className="p-4 space-y-3">
                                    <h3 className="font-semibold text-black text-lg line-clamp-2 min-h-[3rem]">
                                        {relatedProduct.titleGeorgian}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#d90b6b] font-bold text-xl">₾{relatedProduct.price}</span>
                                        <Link
                                            href={`/product/${relatedProduct.id}`}
                                            className="bg-[#d90b6b] text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors text-sm"
                                        >
                                            ნახვა
                                        </Link>
                                    </div>
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
