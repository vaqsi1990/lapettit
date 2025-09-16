"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Plus, Minus, } from 'lucide-react';
import { getCakeById, getCakes } from '@/lib/action';
import { mapCakeToGalleryImage, type GalleryImage, calculateTotalPrice, formatPrice } from '@/lib/utils';

const ProductPage = () => {
    const params = useParams();
    const productId = parseInt(params.id as string);
    const [product, setProduct] = useState<GalleryImage | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<GalleryImage[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedPieces, setSelectedPieces] = useState(8);
    const [totalPrice, setTotalPrice] = useState(0);
    const [selectedTopping, setSelectedTopping] = useState<'marzipan' | 'cream' | null>(null);
    const [selectedFilling, setSelectedFilling] = useState<string>('');
    const [cakeName, setCakeName] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [position, setPosition] = useState<'bottom' | 'center' | 'top'>('center');

    const [loading, setLoading] = useState(true);
    const [selectedImage] = useState(0);

    // Dynamic piece size options based on product data
    const getPieceOptions = () => {
        if (!product) return [];

        const minPieces = product?.pieces || 8; // This is the minimum pieces required

        // Calculate base price from selected topping
        let basePrice = 100; // Default fallback
        if (selectedTopping === 'marzipan' && product.marzipanPrice) {
            basePrice = product.marzipanPrice;
        } else if (selectedTopping === 'cream' && product.creamPrice) {
            basePrice = product.creamPrice;
        } else if (product.marzipanPrice) {
            basePrice = product.marzipanPrice; // Default to marzipan if available
        } else if (product.creamPrice) {
            basePrice = product.creamPrice; // Fallback to cream
        }

        // Function to calculate price based on piece count
        const calculatePriceForPieces = (pieces: number) => {
            const productPieces = product?.pieces || 8;
            
            // If selected pieces equals product pieces, use base price (no addition)
            if (pieces === productPieces) {
                return basePrice;
            }
            
            // Calculate additional price based on difference from product pieces
            const difference = pieces - productPieces;
            
            if (difference <= 0) {
                return basePrice; // Smaller or equal to product pieces
            } else if (difference <= 8) {
                return basePrice + 30; // 1-8 pieces more
            } else if (difference <= 15) {
                return basePrice + 60; // 9-15 pieces more
            } else {
                return basePrice + 90; // 16+ pieces more
            }
        };

        // Function to generate coverage based on pieces
        const generateCoverage = (pieces: number) => {
            if (pieces <= 8) return "15-20 სმ";
            if (pieces <= 15) return "18-20 სმ";
            if (pieces <= 18) return "25-30 სმ";
            if (pieces <= 25) return "30-35 სმ";
            return "35+ სმ";
        };

        // Generate multiple size options with dynamic pricing
        const allOptions = [
            { pieces: 8, label: `8 ნაჭერი`, coverage: generateCoverage(8), price: calculatePriceForPieces(8) },
            { pieces: 10, label: `10 ნაჭერი`, coverage: generateCoverage(10), price: calculatePriceForPieces(10) },
            // Only show 15-piece option if product.pieces is exactly 15
            ...(product?.pieces === 15 ? [{ pieces: 15, label: `15 ნაჭერი`, coverage: generateCoverage(15), price: calculatePriceForPieces(15) }] : []),
            { pieces: 18, label: `18 ნაჭერი`, coverage: generateCoverage(18), price: calculatePriceForPieces(18) },
            { pieces: 25, label: `25 ნაჭერი`, coverage: generateCoverage(25), price: calculatePriceForPieces(25) }
        ];

        // Filter out options smaller than product pieces
        return allOptions.filter(option => option.pieces >= (product?.pieces || 8));
    };

    // Predefined filling options
    const fillingOptions = [
        {
            id: 'fruit',
            name: 'ხილის ტორტი',
            description: 'კლასიკური ბისკვიტით, მოხარშული შუს კრემით და სხვადასვა სეზონური ხილით (მარწყვი, ბანანი და კენკრის მიქსი)'
        },
        {
            id: 'chocolate',
            name: 'შოკოლადის ტორტი',
            description: 'შოკოლადის ბისკვიტით, ნიგვზით, ბეზეთი და კარამელით'
        },
        {
            id: 'pistachio',
            name: 'ფისტის საფირმო ტორტი',
            description: 'კლასიკური ბისკვიტით, შოკოლადის პუდინგით, ნაღების კრემით, ფისტის კრემით და ჟოლოთი'
        },
        {
            id: 'black',
            name: 'შავი საფირმო ტორტი',
            description: 'შოკოლადის ბისკვიტი, ნაღების კრემი, შავი პუდინგი, ნუთელას კრემი, მარწყვი და ბანანით'
        }
    ];

    // Set default topping and pieces when product loads
    useEffect(() => {
        if (product) {
            // Set default pieces to product's base pieces
            setSelectedPieces(product.pieces || 8);

            // Set default topping
            if (product.hasMarzipan && product.hasCream) {
                setSelectedTopping('marzipan');
            } else if (product.hasMarzipan) {
                setSelectedTopping('marzipan');
            } else if (product.hasCream) {
                setSelectedTopping('cream');
            } else {
                setSelectedTopping(null);
            }
        }
    }, [product]);

    // Update total price when pieces, quantity, or topping changes
    useEffect(() => {
        if (product) {
            if (product.isCustomizable) {
                // For customizable cakes, use the piece-based pricing
                const pieceOptions = getPieceOptions();
                const selectedOption = pieceOptions.find(option => option.pieces === selectedPieces);
                if (selectedOption) {
                    setTotalPrice(calculateTotalPrice(selectedOption.price, quantity));
                } else {
                    // If no size options available (large cakes), use base price
                    let basePrice = 100; // Default fallback
                    if (selectedTopping === 'marzipan' && product.marzipanPrice) {
                        basePrice = product.marzipanPrice;
                    } else if (selectedTopping === 'cream' && product.creamPrice) {
                        basePrice = product.creamPrice;
                    } else if (product.marzipanPrice) {
                        basePrice = product.marzipanPrice; // Default to marzipan if available
                    } else if (product.creamPrice) {
                        basePrice = product.creamPrice; // Fallback to cream
                    }
                    setTotalPrice(calculateTotalPrice(basePrice, quantity));
                }
            } else {
                // For non-customizable cakes, use the standard price
                if (product.price) {
                    setTotalPrice(calculateTotalPrice(product.price, quantity));
                }
            }
        }
    }, [selectedPieces, quantity, selectedTopping, product]);

    // Save customization to API
    const saveCustomization = async () => {
        if (!product) return null;

        try {
            const customizationData = {
                cakeId: product.id,
                price: totalPrice,
                pieces: selectedPieces,
                topping: selectedTopping,
                filling: selectedFilling,
                cakeName: cakeName,
                age: age,
                position: position
            };

            const response = await fetch('/api/customization', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customizationData),
            });

            if (response.ok) {
                const result = await response.json();
                const customizationId = result.customizationId;
                
                // Also store in localStorage as backup
                localStorage.setItem(`customization_${customizationId}`, JSON.stringify(customizationData));
                
                return customizationId;
            }
        } catch (error) {
            console.error('Error saving customization:', error);
        }
        return null;
    };

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
console.log(product);

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
                            <span className="bg-pink-100 text-[#d90b6b] md:text-[20px] text-[16px] px-4 py-2 rounded-full text-sm font-medium">
                                {product.categoryGeorgian}
                            </span>
                        </div>

                        {/* Product Title */}
                        <div>
                            <h1 className="text-[24px] md:text-[32px] font-bold text-black mb-3 leading-tight">
                                {product.titleGeorgian}
                            </h1>
                            {/* <div className="text-[18px] text-gray-600 mb-4">
                                {product.pieces} ნაჭერი
                            </div> */}
                        </div>



                        {(product.hasMarzipan || product.hasCream) && (
                            <div className="space-y-3">
                                <label className="text-[20px] font-medium text-black">აირჩიეთ ტორტის ტიპი:</label>
                                <div className={`grid gap-2 ${product.hasMarzipan && product.hasCream ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {product.hasMarzipan && (
                                        <button
                                            onClick={() => setSelectedTopping('marzipan')}
                                            className={`p-3 rounded-lg text-black border-2 transition-all duration-200 ${selectedTopping === 'marzipan'
                                                    ? 'border-pink-500 bg-pink-100 text-pink-700'
                                                    : 'border-gray-200 bg-white text-black hover:border-pink-300'
                                                }`}
                                        >
                                            <div className="text-[18px] font-medium">მარცეპანი</div>
                                            <div className="text-[16px] text-black">ჩართულია ფასში</div>
                                        </button>
                                    )}

                                    {product.hasCream && (
                                        <button
                                            onClick={() => setSelectedTopping('cream')}
                                            className={`p-3 rounded-lg text-black border-2 transition-all duration-200 ${selectedTopping === 'cream'
                                                    ? 'border-pink-500 bg-pink-100 text-pink-700'
                                                    : 'border-gray-200 text-black bg-white hover:border-pink-300'
                                                }`}
                                        >
                                            <div className="text-[18px] font-medium">კრემი</div>
                                            <div className="text-[16px] text-black">ჩართულია ფასში</div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}



                        {/* Standard Price Display for Non-Customizable Cakes */}
                        {!product.isCustomizable && product.price && (
                            <div className="">
                                <h3 className="text-[18px] md:text-[20px] font-semibold text-black mb-4">სტანდარტული ფასი: {formatPrice(product.price)}</h3>
                            
                               
                            </div>
                        )}

                        {/* Customization Options */}
                        {product.isCustomizable && (
                            <div className=" p-4 rounded-xl ">
                                <h3 className="text-[18px] md:text-[20px] font-semibold text-black mb-4"> ტორტის ნაჭრების  არჩევა</h3>

                                {/* Piece Size Selection - Only show if product.pieces is 18 or less */}
                                {product?.pieces && product.pieces <= 18 ? (
                                    <div className="space-y-3 mb-4">
                                        <label className="text-[20px] font-medium text-black">აირჩიეთ ზომა:</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {getPieceOptions().map((option) => (
                                                <button
                                                    key={option.pieces}
                                                    onClick={() => setSelectedPieces(option.pieces)}
                                                    className={`p-3 rounded-lg text-black border-2 transition-all duration-200 ${selectedPieces === option.pieces
                                                            ? 'border-pink-500 bg-pink-100 text-pink-700'
                                                            : 'border-gray-200 text-black bg-white hover:border-pink-300'
                                                        }`}
                                                >
                                                    <div className="text-[18px] font-medium">{option.label}</div>
                                                    <div className="text-[16px] text-black">{option.coverage}</div>
                                                    <div className="text-[16px] font-bold text-pink-600">{formatPrice(option.price)}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-lg text-center w-[50%] text-black border-2 transition-all duration-200 border-pink-500 bg-pink-100 text-pink-700">
                                        {product.pieces} ნაჭერი
                                    </div>
                                )}

                                {/* Topping Selection */}

                                {/* Filling Selection */}
                                <div className="space-y-3 mt-4">
                                    <label className="text-[20px] font-medium text-black">აირჩიეთ შიგთავსი:</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {fillingOptions.map((filling) => (
                                            <button
                                                key={filling.id}
                                                onClick={() => setSelectedFilling(selectedFilling === filling.id ? '' : filling.id)}
                                                className={`p-3 rounded-lg text-black border-2 transition-all duration-200 text-left ${selectedFilling === filling.id
                                                        ? 'border-pink-500 bg-pink-100 text-pink-700'
                                                        : 'border-gray-200 text-black bg-white hover:border-pink-300'
                                                    }`}
                                            >
                                                <div className="text-[18px] font-medium mb-1">{filling.name}</div>
                                                <div className="text-[16px] text-black line-clamp-2">{filling.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cake Personalization - Only for customizable cakes */}
                        {product.isCustomizable && (
                            <div className="">
                                <h3 className="text-[18px] md:text-[20px] font-semibold text-black mb-4">ტორტის პერსონალიზაცია</h3>
                                
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-[18px] font-medium text-black">სახელი ტორტზე:</label>
                                    <input
                                        type="text"
                                        value={cakeName}
                                        onChange={(e) => setCakeName(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors text-black placeholder:text-black"
                                        placeholder="შეიყვანეთ სახელი"
                                        maxLength={20}
                                    />
                                </div>

                                {/* Age Input */}
                                <div className="space-y-2">
                                    <label className="text-[18px] font-medium text-black">ასაკი ტორტზე:</label>
                                    <input
                                        type="text"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors text-black placeholder:text-black"
                                        placeholder="მაგ: 2 წლის, 18 წლის"
                                        maxLength={15}
                                    />
                                </div>

                                {/* Position Selection */}
                                <div className="space-y-3">
                                    <label className="text-[18px] font-medium text-black">პოზიცია ტორტზე:</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => setPosition('bottom')}
                                            className={`p-3 rounded-lg text-black border-2 transition-all duration-200 ${position === 'bottom'
                                                    ? 'border-pink-500 bg-pink-100 text-pink-700'
                                                    : 'border-gray-200 text-black bg-white hover:border-pink-300'
                                                }`}
                                        >
                                            <div className="text-[16px] text-black font-medium">ქვევით</div>
                                        </button>
                                        <button
                                            onClick={() => setPosition('center')}
                                            className={`p-3 rounded-lg text-black border-2 transition-all duration-200 ${position === 'center'
                                                    ? 'border-pink-500 bg-pink-100 text-pink-700'
                                                    : 'border-gray-200 bg-white text-black hover:border-pink-300'
                                                }`}
                                        >
                                            <div className="text-[16px] text-black font-medium">ცენტრში</div>
                                        </button>
                                        <button
                                            onClick={() => setPosition('top')}
                                            className={`p-3 rounded-lg text-black border-2 transition-all duration-200 ${position === 'top'
                                                    ? 'border-pink-500 bg-pink-100 text-pink-700'
                                                    : 'border-gray-200 bg-white text-black hover:border-pink-300'
                                                }`}
                                        >
                                            <div className="text-[16px] text-black font-medium">ზევით</div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Product Features */}
                        <div className="bg-white p-4 rounded-xl">
                            <h3 className="text-[18px] md:text-[20px] font-semibold text-black mb-3">პროდუქტის მახასიათებლები</h3>
                            <div className="grid text-black grid-cols-1 md:grid-cols-2 gap-3 text-[14px] md:text-[16px]">
                                <div className="flex items-center gap-2">
                                    <span className="text-black">✓</span>
                                    <span>მაღალი ხარისხის ინგრედიენტები</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-black">✓</span>
                                    <span>უფასო მიწოდება ბათუმში</span>
                                </div>

                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="space-y-4">
                           

                            {/* Total Price Display */}
                            <div className="bg-pink-100 p-4 rounded-xl border border-pink-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-[18px] font-semibold text-black">სულ:</span>
                                    <span className="text-[24px] font-bold text-pink-600">{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="text-[16px] text-black mt-1">
                                    {product.isCustomizable ? (
                                        <>
                                            {getPieceOptions().find(option => option.pieces === selectedPieces)?.label} ({getPieceOptions().find(option => option.pieces === selectedPieces)?.coverage}) × {quantity}
                                        </>
                                    ) : (
                                        <span>რაოდენობა: {quantity}</span>
                                    )}
                                </div>
                                <div className="text-[15px] text-black mt-1">
                                    {product.isCustomizable ? (
                                        <>
                                            {selectedTopping === 'marzipan' ? 'მარცეპანით' : selectedTopping === 'cream' ? 'კრემით' : ''}
                                            {selectedFilling && ` • ${fillingOptions.find(f => f.id === selectedFilling)?.name}`}
                                            {cakeName && ` • სახელი: ${cakeName}`}
                                            {age && ` • ასაკი: ${age}`}
                                            {position && ` • პოზიცია: ${position === 'bottom' ? 'ქვევით' : position === 'center' ? 'ცენტრში' : 'ზევით'}`}
                                        </>
                                    ) : (
                                        <span>სტანდარტული ტორტი</span>
                                    )}
                                </div>
                            </div>


                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {product.isCustomizable ? (
                                    <div className="space-y-2">
                                        <button 
                                            onClick={async () => {
                                                // Store customization data in sessionStorage
                                                const customizationData = {
                                                    cakeId: product.id,
                                                    price: totalPrice,
                                                    pieces: selectedPieces,
                                                    topping: selectedTopping,
                                                    filling: selectedFilling,
                                                    cakeName: cakeName,
                                                    age: age,
                                                    position: position
                                                };
                                                
                                                sessionStorage.setItem(`customization_${product.id}`, JSON.stringify(customizationData));
                                                
                                                // Navigate to order page without URL parameters
                                                window.location.href = `/order/${product.id}`;
                                            }}
                                            className="w-full md:w-[30%] cursor-pointer md:text-[20px] text-[18px] bg-[#d90b6b] hover:from-pink-600 hover:to-rose-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center block"
                                        >
                                            შეუკვეთე ახლა
                                        </button>

                                    </div>
                                ) : (
                                    <button 
                                        onClick={async () => {
                                            // Store standard cake data in sessionStorage
                                            const cakeData = {
                                                cakeId: product.id,
                                                price: totalPrice,
                                                isStandard: true
                                            };
                                            
                                            sessionStorage.setItem(`cake_${product.id}`, JSON.stringify(cakeData));
                                            
                                            // Navigate to order page
                                            window.location.href = `/order/${product.id}`;
                                        }}
                                        className="w-full md:w-[30%]  cursor-pointer md:text-[20px] text-[18px] bg-[#d90b6b] hover:from-pink-600 hover:to-rose-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center block"
                                    >
                                        შეუკვეთე ახლა
                                    </button>
                                )}
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

                                        <Link
                                            href={`/product/${relatedProduct.id}`}
                                            className="bg-[#d90b6b] text-white px-4 py-2 rounded-lg font-bold hover:bg-pink-700 transition-colors md:text-[20px] text-[16px]"
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
