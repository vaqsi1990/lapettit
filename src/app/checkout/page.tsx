"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getCart, getCartTotal, getCartCount, clearCart, type CartItem } from '@/lib/cartUtils';
import { useToast } from '@/components/Toast';
import { UploadButton } from '@/utils/uploadthing';

interface CartData {
  items: CartItem[];
  total: number;
  count: number;
}

const CheckoutPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [cartData, setCartData] = useState<CartData>({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    lastName: '',
    customerPhone: '',
    customerEmail: '',
    address: '',
    city: '',
    notes: ''
  });
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [orderIds, setOrderIds] = useState<number[]>([]);

  // Fetch cart items from localStorage and enrich with product details
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const cartItems = getCart();
        
        if (cartItems.length === 0) {
          router.push('/cart');
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
        if (cartItems.length === 0) {
          router.push('/cart');
          return;
        }
        const total = getCartTotal();
        const count = getCartCount();
        setCartData({ items: cartItems, total, count });
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartData.items.length === 0) {
      showToast('error', 'კალათა ცარიელია', 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order for each cart item
      const orderPromises = cartData.items.map(async (item) => {
        const orderData = {
          cakeId: item.cakeId,
          quantity: item.quantity,
          customerName: `${orderForm.customerName} ${orderForm.lastName}`.trim(),
          customerPhone: orderForm.customerPhone,
          customerEmail: orderForm.customerEmail || undefined,
          address: `${orderForm.address}, ${orderForm.city}`.trim().replace(/^,\s*/, ''),
          notes: orderForm.notes || undefined,
          totalPrice: item.price * item.quantity,
          cakeName: item.cakeName,
          age: item.age,
          position: item.position
        };

        const response = await fetch('/api/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        return response.json();
      });

      const results = await Promise.all(orderPromises);
      
      // Check if all orders were successful
      const allSuccess = results.every(result => result.success !== false);
      
      if (allSuccess) {
        // Store order IDs for receipt upload
        const ids = results.map(r => r.orderId).filter(id => id !== undefined);
        setOrderIds(ids);
        
        // If receipt is already uploaded, confirm orders immediately
        if (receiptImage) {
          await confirmOrdersWithReceipt(ids, receiptImage);
        } else {
          // Show message that receipt upload is needed
          showToast('info', 'შეკვეთა შექმნილია. გთხოვთ ატვირთოთ ჩეკის სურათი დადასტურებისთვის.', 5000);
          // Don't clear cart yet - wait for receipt upload
        }
      } else {
        showToast('error', 'შეცდომა შეკვეთის გაგზავნისას. გთხოვთ სცადოთ თავიდან.', 5000);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      showToast('error', 'შეცდომა შეკვეთის გაგზავნისას. გთხოვთ სცადოთ თავიდან.', 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm orders when receipt is uploaded
  const confirmOrdersWithReceipt = async (orderIds: number[], receiptUrl: string) => {
    try {
      const confirmPromises = orderIds.map(async (orderId) => {
        const response = await fetch('/api/orders/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            receiptImageUrl: receiptUrl
          }),
        });
        return response.json();
      });

      const results = await Promise.all(confirmPromises);
      const allConfirmed = results.every(result => result.success !== false);

      if (allConfirmed) {
        // Clear cart from localStorage
        clearCart();
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Show success toast
        showToast('success', 'შეკვეთა დადასტურებულია! ჩვენ მალე დაგიკავშირდებით.', 5000);
        
        // Redirect to home after a short delay
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        showToast('error', 'შეცდომა შეკვეთის დადასტურებისას.', 5000);
      }
    } catch (error) {
      console.error('Error confirming orders:', error);
      showToast('error', 'შეცდომა შეკვეთის დადასტურებისას.', 5000);
    }
  };

  // Handle receipt upload
  const handleReceiptUpload = async (res: { url: string; name: string }[]) => {
    if (res && res.length > 0) {
      setIsUploadingReceipt(false);
      const imageUrl = res[0].url;
      setReceiptImage(imageUrl);
      
      // If orders are already created, confirm them immediately
      if (orderIds.length > 0) {
        await confirmOrdersWithReceipt(orderIds, imageUrl);
      } else {
        showToast('success', 'ჩეკის სურათი ატვირთულია. შეკვეთის შექმნის შემდეგ დადასტურდება.', 3000);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">იტვირთება...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/cart"
            className="flex items-center gap-2 text-black hover:text-pink-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[18px] font-medium">დაბრუნება კალათაში</span>
          </Link>
          <h1 className="text-[28px] md:text-[36px] font-bold text-black">შეკვეთის გაფორმება</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-[24px] font-bold text-black mb-6">კონტაქტის ინფორმაცია</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[16px] font-medium text-black mb-2">
                      სახელი *
                    </label>
                    <input
                      type="text"
                      required
                      value={orderForm.customerName}
                      onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors text-black"
                      placeholder="სახელი"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[16px] font-medium text-black mb-2">
                      გვარი
                    </label>
                    <input
                      type="text"
                      value={orderForm.lastName}
                      onChange={(e) => setOrderForm({ ...orderForm, lastName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors text-black"
                      placeholder="გვარი"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-black mb-2">
                    ტელეფონი *
                  </label>
                  <input
                    type="tel"
                    required
                    value={orderForm.customerPhone}
                    onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors text-black"
                    placeholder="555 123 456"
                  />
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-black mb-2">
                    ელ. ფოსტა
                  </label>
                  <input
                    type="email"
                    value={orderForm.customerEmail}
                    onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors text-black"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-black mb-2">
                    მისამართი *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderForm.address}
                    onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors text-black"
                    placeholder="მისამართი"
                  />
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-black mb-2">
                    ქალაქი
                  </label>
                  <input
                    type="text"
                    value={orderForm.city}
                    onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors text-black"
                    placeholder="ბათუმი"
                  />
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-black mb-2">
                    დამატებითი შენიშვნები
                  </label>
                  <textarea
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors text-black"
                    placeholder="დამატებითი ინფორმაცია..."
                  />
                </div>

                {/* Payment Instructions */}
                <div className="  rounded-xl p-4 md:p-6 space-y-4">
                  <h3 className="text-[18px] md:text-[20px] font-bold text-black">
                    გადახდის ინსტრუქცია
                  </h3>
                  <p className="text-[14px] md:text-[16px] text-gray-700 leading-relaxed">
                    გთხოვთ ჩარიცხეთ ნახევარი მოცემულ ანგარიშიდან ერთ ერთზე, გამოგვიგზავნეთ ჩეკი რის შემდეგაც დაგიკავშირდებით.
                  </p>
                  
                  {/* Receipt Upload */}
                  <div className="space-y-2">
                    <label className="block text-[16px] font-medium text-black">
                      ჩეკის სურათის ატვირთვა *
                    </label>
                    {!receiptImage ? (
                      <div className="rounded-lg w-full md:w-1/2 mx-auto p-4 transition-colors">
                        {isUploadingReceipt ? (
                          <div className="flex items-center justify-center gap-3 py-4">
                            <div className="w-6 h-6  border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[14px] text-gray-600">იტვირთება...</span>
                          </div>
                        ) : (
                          <UploadButton
                            endpoint="imageUploader"
                            onUploadBegin={() => setIsUploadingReceipt(true)}
                            onClientUploadComplete={handleReceiptUpload}
                            onUploadError={(error) => {
                              setIsUploadingReceipt(false);
                              showToast('error', `შეცდომა ატვირთვისას: ${error.message}`, 5000);
                            }}
                            className="w-full"
                            content={{
                              button: (
                                <div className="flex items-center justify-center gap-2 text-[16px] font-bold text-white">
                                  <Upload className="w-5 h-5" />
                                  <span>აირჩიეთ  სურათი</span>
                                </div>
                              ),
                              allowedContent: "ატვირთეთ სურათი (JPG, PNG, GIF)"
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="relative  rounded-lg p-3 ">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[18px] text-green-500 font-bold">✓ სურათი ატვირთულია</span>
                          <button
                            type="button"
                            onClick={() => {
                              setReceiptImage(null);
                              setOrderIds([]);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                          <Image
                            src={receiptImage}
                            alt="Receipt"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
<div className="w-full md:w-1/2 mx-auto">

                <button
                  type="submit"
                  disabled={isSubmitting || cartData.items.length === 0 || !receiptImage}
                  className="w-full bg-[#d90b6b] w-1/2 mx-auto cursor-pointer text-white py-3 px-6 rounded-xl font-semibold hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-[18px]"
                >
                  {isSubmitting ? 'იგზავნება...' : receiptImage ? 'შეკვეთის დადასტურება' : 'შეკვეთის შექმნა'}
                </button>
</div>
              </form>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sticky top-24"
            >
              <h2 className="text-[24px] font-bold text-black mb-6">შეკვეთის შინაარსი</h2>
              
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                {cartData.items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-200 last:border-0">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.productImage || '/catalog/1.jpg'}
                        alt={item.productName || 'Product'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-black truncate">
                        {item.productName}
                      </p>
                      <p className="text-[12px] text-gray-600">
                        რაოდენობა: {item.quantity}
                      </p>
                      <p className="text-[14px] font-bold text-pink-600">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[18px] font-bold text-black">ჯამი:</span>
                  <span className="text-[24px] font-bold text-pink-600">
                    {formatPrice(cartData.total)}
                  </span>
                </div>
              </div>

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
      </div>
    </div>
  );
};

export default CheckoutPage;

