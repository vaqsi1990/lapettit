"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { getCakeById } from '@/lib/action';
import { mapCakeToGalleryImage, type GalleryImage } from '@/lib/utils';
import { submitOrder, type OrderFormData } from '@/lib/orderActions';
import { Plus, Minus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

const OrderPage = () => {
  const params = useParams();
  const router = useRouter();
  const cakeId = parseInt(params.cakeId as string);
  const { showToast } = useToast();

  const [cake, setCake] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [orderForm, setOrderForm] = useState({
    customerName: '',
    lastName: '',
    customerPhone: '',
    customerEmail: '',
    address: '',
    city: '',
    zipCode: '',
    notes: ''
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [orderRejected, setOrderRejected] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      showToast('error', 'გთხოვთ შეიყვანოთ 6-ნიშნა კოდი');
      return;
    }

    if (!cake) {
      showToast('error', 'ტორტის ინფორმაცია ვერ მოიძებნა');
      return;
    }

    if (isSubmitting) {
      showToast('warning', 'გთხოვთ დაელოდოთ, ვერიფიკაცია მიმდინარეობს...');
      return;
    }

    try {
      setIsSubmitting(true);

      // Verify OTP
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: orderForm.customerEmail,
          otp: otp
        }),
      });

      if (response.ok) {
        // OTP verified, now submit the order
        const orderData: OrderFormData = {
          cakeId: cake.id,
          quantity: quantity,
          customerName: orderForm.customerName,
          lastName: orderForm.lastName,
          customerPhone: orderForm.customerPhone,
          customerEmail: orderForm.customerEmail,
          address: orderForm.address,
          city: orderForm.city,
          zipCode: orderForm.zipCode,
          notes: orderForm.notes,
          totalPrice: cake.price * quantity
        };

        const orderResult = await submitOrder(orderData);
        
        if (orderResult.success && orderResult.orderId) {
          const newOrderId = orderResult.orderId;
          setOrderId(newOrderId);
          showToast('success', 'თქვენი შეკვეთა წარმატებით გაიგზავნა! ადმინი განიხილავს თქვენს შეკვეთას და დაგიკავშირდებათ.');
          setOrderSubmitted(true);
          
          // Start polling for order status with the new order ID
          startOrderStatusPolling(newOrderId);
        } else {
          showToast('error', 'შეკვეთის გაგზავნა ვერ მოხერხდა. სცადეთ თავიდან.');
        }
      } else {
        showToast('error', 'არასწორი ერთჯერადი კოდი. სცადეთ თავიდან.');
        setOtp('');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      showToast('error', 'OTP-ის დადასტურება ვერ მოხერხდა. სცადეთ მოგვიანებით.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start polling for order status
  const startOrderStatusPolling = (currentOrderId: number) => {
    if (!orderForm.customerEmail) return;

    const interval = setInterval(async () => {
      try {
        console.log('Polling order status for email:', orderForm.customerEmail, 'orderId:', currentOrderId);
        const response = await fetch(`/api/orders/customer?email=${encodeURIComponent(orderForm.customerEmail)}`);
        if (response.ok) {
          const result = await response.json();
          console.log('Polling result:', result);
          if (result.success && result.data.length > 0) {
            const latestOrder = result.data[0];
            console.log('Latest order:', latestOrder);
            console.log('Checking if order is rejected:', latestOrder.id === currentOrderId, latestOrder.status === 'REJECTED');
            
            // Check if this is our order and if it's been rejected or approved
            if (latestOrder.id === currentOrderId) {
              if (latestOrder.status === 'REJECTED') {
                console.log('Order rejected! Showing toast and redirecting');
                showToast('error', 'თქვენი შეკვეთა ვერ იქნა მიღებული. მაღაზიიდან მალე დაგიკავშირდებათ დეტალების გასარკვევად.');
                
                // Stop polling
                if (pollingInterval) {
                  clearInterval(pollingInterval);
                  setPollingInterval(null);
                }
                
                // Redirect to main page after 3 seconds
                setTimeout(() => {
                  router.push('/');
                }, 3000);
              } else if (latestOrder.status === 'APPROVED') {
                console.log('Order approved! Showing toast and redirecting');
                showToast('success', 'თქვენი შეკვეთა დადასტურებულია! მაღაზიიდან მალე დაგიკავშირდებათ.');
                
                // Stop polling
                if (pollingInterval) {
                  clearInterval(pollingInterval);
                  setPollingInterval(null);
                }
                
                // Redirect to main page after 3 seconds
                setTimeout(() => {
                  router.push('/');
                }, 3000);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error polling order status:', error);
      }
    }, 5000); // Check every 5 seconds for better responsiveness

    setPollingInterval(interval);
  };

  // Stop polling when component unmounts
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Fetch cake details
  useEffect(() => {
    const fetchCake = async () => {
      try {
        setLoading(true);
        const result = await getCakeById(cakeId);

        if (result.success && result.data) {
          const mappedCake = mapCakeToGalleryImage(result.data);
          setCake(mappedCake);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching cake:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (cakeId) {
      fetchCake();
    }
  }, [cakeId, router]);

  const handleInputChange = (field: string, value: string) => {
    setOrderForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cake) return;

    // Check if email is provided for OTP
    if (!orderForm.customerEmail) {
      showToast('warning', 'გთხოვთ შეიყვანოთ ელ-ფოსტა OTP-ის მისაღებად');
      return;
    }

    try {
      setIsSubmitting(true);

      // Send OTP to email
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: orderForm.customerEmail,
          customerName: orderForm.customerName
        }),
      });

      if (response.ok) {
        setOtpSent(true);

        // Store OTP locally as backup (for development mode issues)
        const responseData = await response.json();
        if (responseData.otp) {
          localStorage.setItem('backup_otp', responseData.otp);
          localStorage.setItem('backup_otp_timestamp', Date.now().toString());
        }

        showToast('success', 'ერთჯერადი  კოდი გაიგზავნა თქვენს ელ-ფოსტაზე! გთხოვთ დაელოდოთ 2-3 წამი კოდის მისაღებამდე.');
        // Small delay to ensure OTP is properly stored
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        showToast('error', 'ერთჯერადი კოდის გაგზავნა ვერ მოხერხდა. სცადეთ თავიდან.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      showToast('error', 'ერთჯერადი კოდის გაგზავნა ვერ მოხერხდა. სცადეთ მოგვიანებით.');
    } finally {
      setIsSubmitting(false);
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

  if (!cake) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">ტორტი ვერ მოიძებნა</h1>
          <Link href="/" className="bg-[#d90b6b] text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors">
            დაბრუნდი მთავარ გვერდზე
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-color">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex md:text-[20px] text-[18px] font-semibold items-center text-[#d90b6b] hover:text-pink-700 mb-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              დაბრუნდი უკან
            </Link>
            <h1 className="md:text-[20px] text-[18px] font-bold text-black mb-2">შეკვეთის ფორმა</h1>
            <p className="text-black">შეიყვანეთ თქვენი ინფორმაცია ტორტის შეკვეთისთვის</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Cake Details */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className=" md:text-[24px] text-[20px] font-bold text-black mb-4 flex items-center gap-2">ტორტის დეტალები</h2>

              <div className="space-y-4">
                <div className="relative h-64 overflow-hidden rounded-xl">
                  <img
                    src={cake.src}
                    alt={cake.titleGeorgian}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">{cake.titleGeorgian}</h3>
                  <p className="text-black mb-3">{cake.descriptionGeorgian}</p>
                
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <label className="md:text-[20px] text-[18px] block text-black font-medium mb-1">რაოდენობა:</label>
                    <div className="flex items-center rounded-lg">
                                             <button
                         onClick={() => setQuantity(Math.max(1, quantity - 1))}
                         disabled={orderSubmitted}
                         className="p-2 md:p-3 cursor-pointer bg-pink-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         <Minus className="w-5 h-5 text-pink-600 md:w-6 md:h-6" />
                       </button>
                      <span className="text-base md:text-lg lg:text-xl font-bold text-black min-w-[2.5rem] md:min-w-[3rem] text-center">
                        {quantity}
                      </span>
                                             <button
                         onClick={() => setQuantity(quantity + 1)}
                         disabled={orderSubmitted}
                         className="p-2 md:p-3 cursor-pointer rounded-full bg-pink-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         <Plus className="w-5 h-5 text-pink-600 md:w-6 md:h-6" />
                       </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-gray-200">
                    <span className="md:text-[20px] text-[18px] block text-black font-medium mb-1">სულ:</span>
                    <span className="text-2xl font-bold text-[#d90b6b]">₾{(cake.price * quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="md:text-[24px] text-[20px] font-bold text-black mb-6 flex items-center gap-2">შეკვეთის ინფორმაცია</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="md:text-[20px] text-[18px] block text-black font-medium mb-1">სახელი *</label>
                                         <input
                       type="text"
                       value={orderForm.customerName}
                       onChange={(e) => handleInputChange("customerName", e.target.value)}
                       disabled={orderSubmitted}
                       className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       placeholder="სახელი"
                       required
                     />
                  </div>

                  <div>
                    <label className="md:text-[20px] text-[18px] block text-black font-medium mb-1">გვარი</label>
                                         <input
                       type="text"
                       value={orderForm.lastName}
                       onChange={(e) => handleInputChange("lastName", e.target.value)}
                       disabled={orderSubmitted}
                       className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       placeholder="გვარი"
                     />
                  </div>
                </div>

                <div>
                  <label className="md:text-[20px] text-[18px] block text-black font-medium mb-1">ტელეფონი *</label>
                                     <input
                     type="tel"
                     value={orderForm.customerPhone}
                     onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                     disabled={orderSubmitted}
                     className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     placeholder="ტელეფონი"
                     required
                   />
                </div>

                <div>
                  <label className="md:text-[20px] text-[18px] block text-black font-medium mb-1">ელ-ფოსტა *</label>
                                     <input
                     type="email"
                     value={orderForm.customerEmail}
                     onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                     disabled={orderSubmitted}
                     className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     placeholder="ელ-ფოსტა"
                     required
                   />
                  <p className="text-sm text-black mt-1">ერთჯერადი კოდი გაიგზავნება ამ ელ-ფოსტაზე</p>
                </div>

                <div>
                  <label className="md:text-[20px] text-[18px] block text-black font-medium mb-1">მისამართი *</label>
                                     <input
                     type="text"
                     value={orderForm.address}
                     onChange={(e) => handleInputChange("address", e.target.value)}
                     disabled={orderSubmitted}
                     className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     placeholder="მისამართი"
                     required
                   />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="md:text-[20px] text-[18px] block text-black font-medium mb-1">ქალაქი</label>
                                         <input
                       type="text"
                       value={orderForm.city}
                       onChange={(e) => handleInputChange("city", e.target.value)}
                       disabled={orderSubmitted}
                       className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       placeholder="ქალაქი"
                     />
                  </div>

                  <div>
                    <label className="md:text-[20px] text-[18px] block text-black font-medium mb-1">პოსტის კოდი</label>
                                         <input
                       type="text"
                       value={orderForm.zipCode}
                       onChange={(e) => handleInputChange("zipCode", e.target.value)}
                       disabled={orderSubmitted}
                       className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       placeholder="პოსტის კოდი"
                     />
                  </div>
                </div>

                <div>
                  <label className="md:text-[20px] text-[18px] block text-black font-medium mb-1">დამატებითი ინფორმაცია</label>
                                     <textarea
                     value={orderForm.notes}
                     onChange={(e) => handleInputChange("notes", e.target.value)}
                     disabled={orderSubmitted}
                     className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     placeholder="დამატებითი ინფორმაცია (არასავალდებულო)"
                     rows={3}
                   />
                </div>

                                 {!otpSent ? (
                   <button
                     type="submit"
                     disabled={isSubmitting || orderSubmitted}
                     className="w-full flex justify-center md:w-[300px] mx-auto  cursor-pointer md:text-[20px] text-[18px] bg-[#d90b6b] hover:from-pink-600 hover:to-rose-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isSubmitting ? "იგზავნება..." : orderSubmitted ? "შეკვეთა გაიგზავნა" : "შეკვეთის გაგზავნა"}
                   </button>
                 ) : (
                   <div className="space-y-4">
                     <div className="bg-white  rounded-lg p-3 mb-4">
                       <p className="md:text-[20px] text-[18px] font-bold  text-[#d90b6b]">
                         ერთჯერადი კოდი გაიგზავნა! გთხოვთ შეამოწმოთ თქვენი ელ-ფოსტა და შეიყვანოთ 6-ნიშნა კოდი.
                       </p>
                     </div>
                     <label className="block text-center mb-3 text-black md:text-[20px] text-[18px] font-medium mb-1">
                       შეიყვანე კოდი ელფოსტიდან
                     </label>
                     <input
                       type="text"
                       value={otp}
                       onChange={(e) => setOtp(e.target.value)}
                       disabled={orderSubmitted}
                       className="w-full md:w-[300px] mx-auto flex justify-center items-center text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                       placeholder={orderSubmitted ? "შეკვეთა უკვე გაიგზავნა" : "6-ნიშნა კოდი"}
                     />
                     <div className="flex flex-col  gap-3">
                       <button
                         onClick={handleVerifyOtp}
                         disabled={isSubmitting || orderSubmitted}
                         className="w-full md:w-[300px] mx-auto flex justify-center items-center  cursor-pointer md:text-[20px] text-[18px] bg-[#d90b6b] hover:from-pink-600 hover:to-rose-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {isSubmitting ? "დადასტურება..." : orderSubmitted ? "შეკვეთა გაიგზავნა" : "დადასტურება"}
                       </button>
                       <button
                         onClick={async () => {
                           try {
                             setIsSubmitting(true);
                             const response = await fetch('/api/send-otp', {
                               method: 'POST',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({
                                 email: orderForm.customerEmail,
                                 customerName: orderForm.customerName
                               }),
                             });
                             if (response.ok) {
                               showToast('success', 'ახალი ერთჯერადი კოდი გაიგზავნა!');
                               setOtp('');
                             } else {
                               showToast('error', 'ერთჯერადი კოდის ხელახლა გაგზავნა ვერ მოხერხდა.');
                             }
                           } catch (error) {
                             console.log(error);
                             showToast('error', 'ერთჯერადი კოდის ხელახლა გაგზავნა ვერ მოხერხდა.');
                           } finally {
                             setIsSubmitting(false);
                           }
                         }}
                         disabled={isSubmitting || orderSubmitted}
                         className="w-full md:w-[300px] mx-auto flex justify-center items-center md:text-[20px] text-[18px] text-[#d90b6b] border border-[#d90b6b] cursor-pointer border-2 bg-white  px-4 py-3   py-3 px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         ხელახლა გაგზავნა
                       </button>
                     </div>
                   </div>
                 )}

              </form>
            </motion.div>
          </div>

          {/* Order Submitted Waiting Message */}
          {orderSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white rounded-2xl shadow-xl p-8 text-center"
            >
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-2">შეკვეთა წარმატებით გაიგზავნა!</h2>
                  <p className="text-black text-lg mb-6">
                    თქვენი შეკვეთა მიღებულია და ადმინი განიხილავს მას
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">რა მოხდება შემდეგ?</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                      <p className="text-blue-700">ადმინი გადახედავს თქვენს შეკვეთას</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                      <p className="text-blue-700">თქვენ დაგიკავშირდებათ დეტალების გასარკვევად</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                      <p className="text-blue-700">შეკვეთა დაიწყება მას შემდეგ, რაც დადასტურდება</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">მაღაზიიდან მალე დაგიკავშირდებათ</h3>
                  <p className="text-yellow-700">
                    ჩვენი გუნდი მალე დაგიკავშირდებათ თქვენს ტელეფონზე ან ელ-ფოსტაზე დეტალების გასარკვევად
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/" 
                    className="bg-[#d90b6b] text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors font-semibold"
                  >
                    დაბრუნდი მთავარ გვერდზე
                  </Link>
                  <button 
                    onClick={() => {
                      setOrderSubmitted(false);
                      setOtpSent(false);
                      setOtp('');
                      setOrderForm({
                        customerName: '',
                        lastName: '',
                        customerPhone: '',
                        customerEmail: '',
                        address: '',
                        city: '',
                        zipCode: '',
                        notes: ''
                      });
                    }}
                    className="border-2 border-[#d90b6b] text-[#d90b6b] px-8 py-3 rounded-lg hover:bg-[#d90b6b] hover:text-white transition-colors font-semibold"
                  >
                    ახალი შეკვეთა
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Order Rejected Message */}
          {orderRejected && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white rounded-2xl shadow-xl p-8 text-center"
            >
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-2">შეკვეთა ვერ იქნა მიღებული</h2>
                  <p className="text-black text-lg mb-6">
                    სამწუხაროდ, თქვენი შეკვეთა ვერ დაეთანხმა ტექნიკური მიზეზების გამო
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">რა მოხდება შემდეგ?</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                      <p className="text-red-700">მაღაზიიდან მალე დაგიკავშირდებათ</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                      <p className="text-red-700">დეტალები განიხილება და ალტერნატიული ვარიანტები შემოგთავაზებთ</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                      <p className="text-red-700">თუ გსურთ, შეგიძლიათ ახალი შეკვეთა გააკეთოთ</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">დაგვიკავშირდით</h3>
                  <p className="text-blue-700">
                    თუ გაქვთ კითხვები ან გსურთ ალტერნატიული ვარიანტების განხილვა, გთხოვთ დაგვიკავშირდით:
                  </p>
                  <div className="mt-3 text-sm text-blue-600">
                    <p><strong>ტელეფონი:</strong> +995 555 123 456</p>
                    <p><strong>ელ-ფოსტა:</strong> Lappetit2019@gmail.com</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/" 
                    className="bg-[#d90b6b] text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors font-semibold"
                  >
                    დაბრუნდი მთავარ გვერდზე
                  </Link>
                  <button 
                    onClick={() => {
                      setOrderId(null);
                      setOrderRejected(false);
                      setOtpSent(false);
                      setOtp('');
                      setOrderForm({
                        customerName: '',
                        lastName: '',
                        customerPhone: '',
                        customerEmail: '',
                        address: '',
                        city: '',
                        zipCode: '',
                        notes: ''
                      });
                    }}
                    className="border-2 border-[#d90b6b] text-[#d90b6b] px-8 py-3 rounded-lg hover:bg-[#d90b6b] hover:text-white transition-colors font-semibold"
                  >
                    ახალი შეკვეთა
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
