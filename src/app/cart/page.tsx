"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getCart, updateCartItem, removeCartItem, clearCart, getCartTotal, getCartCount, type CartItem } from '@/lib/cartUtils';

interface CartData {
  items: CartItem[];
  total: number;
  count: number;
}

const CartPage = () => {
  const router = useRouter();
  const [cartData, setCartData] = useState<CartData>({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Fetch cart items from localStorage and enrich with product details
  const fetchCart = async () => {
    try {
      setLoading(true);
      const cartItems = getCart();
      
      if (cartItems.length === 0) {
        setCartData({ items: [], total: 0, count: 0 });
        setLoading(false);
        return;
      }

      // Fetch product details from API
      const itemsJson = encodeURIComponent(JSON.stringify(cartItems));
      const response = await fetch(`/api/cart?items=${itemsJson}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCartData(result.data);
        } else {
          // Fallback to localStorage data if API fails
          const total = getCartTotal();
          const count = getCartCount();
          setCartData({ items: cartItems, total, count });
        }
      } else {
        // Fallback to localStorage data if API fails
        const total = getCartTotal();
        const count = getCartCount();
        setCartData({ items: cartItems, total, count });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Fallback to localStorage data
      const cartItems = getCart();
      const total = getCartTotal();
      const count = getCartCount();
      setCartData({ items: cartItems, total, count });
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    try {
      setUpdating(itemId);
      updateCartItem(itemId, { quantity: newQuantity });
      // Refresh cart data
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(null);
    }
  };

  // Remove item from cart
  const removeItem = (itemId: string) => {
    try {
      setUpdating(itemId);
      removeCartItem(itemId);
      // Refresh cart data
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(null);
    }
  };

  // Clear entire cart
  const handleClearCart = () => {
    if (!confirm('ნამდვილად გსურთ კალათის გასუფთავება?')) {
      return;
    }

    try {
      clearCart();
      setCartData({ items: [], total: 0, count: 0 });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">იტვირთება კალათა...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-black hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-[18px] font-medium">დაბრუნება</span>
            </Link>
            <h1 className="text-[28px] md:text-[36px] font-bold text-black">კალათა</h1>
          </div>
          {cartData.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 text-[16px] font-medium transition-colors"
            >
              კალათის გასუფთავება
            </button>
          )}
        </div>

        {cartData.items.length === 0 ? (
          // Empty Cart
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center"
          >
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-[24px] md:text-[30px] font-bold text-black mb-4">
              კალათა ცარიელია
            </h2>
            <p className="text-gray-600 mb-8 text-[16px] md:text-[18px]">
              დაამატეთ პროდუქტები კალათაში შესაძენად
            </p>
            <Link
              href="/"
              className="inline-block bg-[#d90b6b] text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              პროდუქტების ნახვა
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartData.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Product Image */}
                    <div className="relative w-full md:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={item.productImage || '/catalog/1.jpg'}
                        alt={item.productName || 'Product'}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-[20px] font-bold text-black mb-1">
                          {item.productName}
                        </h3>
                        
                        {/* Customization Details */}
                        <div className="space-y-1 text-[14px] text-gray-600">
                          {item.pieces && (
                            <p>{item.pieces} ნაჭერი</p>
                          )}
                          {item.topping && (
                            <p>
                              {item.topping === 'marzipan' ? 'მარცეპანი' : 'კრემი'}
                            </p>
                          )}
                          {item.filling && (
                            <p>შიგთავსი: {item.filling}</p>
                          )}
                          {item.cakeName && (
                            <p>სახელი: {item.cakeName}</p>
                          )}
                          {item.age && (
                            <p>ასაკი: {item.age}</p>
                          )}
                          {item.position && (
                            <p>
                              პოზიცია: {
                                item.position === 'bottom' ? 'ქვევით' :
                                item.position === 'center' ? 'ცენტრში' : 'ზევით'
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Price and Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="text-[20px] font-bold text-pink-600">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 border-2 border-gray-200 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updating === item.id}
                              className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 text-[16px] font-medium text-black min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updating === item.id}
                              className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={updating === item.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="წაშლა"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sticky top-24"
              >
                <h2 className="text-[24px] font-bold text-black mb-6">შეკვეთის შინაარსი</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-[16px] text-gray-600">
                    <span>პროდუქტების რაოდენობა:</span>
                    <span className="font-medium text-black">{cartData.count}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[20px] font-bold text-black">ჯამი:</span>
                      <span className="text-[24px] font-bold text-pink-600">
                        {formatPrice(cartData.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="w-full bg-[#d90b6b] text-white py-3 px-6 rounded-xl font-semibold hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-center block text-[18px]"
                  >
                    შეკვეთის გაფორმება
                  </Link>
                  
                  <Link
                    href="/"
                    className="w-full bg-gray-200 text-black py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors text-center block text-[16px]"
                  >
                    გაგრძელება შეძენის
                  </Link>
                </div>

                {/* Features */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-2 text-[14px] text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>უფასო მიწოდება ბათუმში</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>მაღალი ხარისხის ინგრედიენტები</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

