"use client";

import React, { useState, Suspense, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

const CustomCakeOrderContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  // Get custom cake details from URL params
  const design = searchParams.get('design');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const size = searchParams.get('size');
  const flavor = searchParams.get('flavor');
  const filling = searchParams.get('filling');
  const frosting = searchParams.get('frosting');
  const shape = searchParams.get('shape');
  const decorations = searchParams.get('decorations');
  const price = searchParams.get('price');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [orderRejected, setOrderRejected] = useState(false);

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

  const handleInputChange = (field: string, value: string) => {
    setOrderForm(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderForm.customerEmail) {
      showToast('error', 'გთხოვთ შეიყვანოთ ელ-ფოსტა OTP-ის მისაღებად');
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log('Sending OTP to email:', orderForm.customerEmail);
      
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
      
      console.log('OTP send response status:', response.status);

      if (response.ok) {
        setOtpSent(true);
        
        // Store OTP locally as backup
        const responseData = await response.json();
        if (responseData.otp) {
          localStorage.setItem('backup_otp', responseData.otp);
          localStorage.setItem('backup_otp_timestamp', Date.now().toString());
        }
        
        showToast('success', 'ერთჯერადი კოდი გაიგზავნა თქვენს ელ-ფოსტაზე! გთხოვთ დაელოდოთ 2-3 წამი კოდის მისაღებამდე.');
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

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      showToast('error', 'გთხოვთ შეიყვანოთ 6-ნიშნა კოდი');
      return;
    }

    if (isSubmitting) {
      showToast('warning', 'გთხოვთ დაელოდოთ, ვერიფიკაცია მიმდინარეობს...');
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log('Verifying OTP for email:', orderForm.customerEmail, 'OTP:', otp);
      
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
      
      console.log('OTP verification response status:', response.status);

      if (response.ok) {
        console.log('OTP verified successfully for custom cake order');
        
        // OTP verified, now submit the custom cake order
        const customCakeData = {
          design: design || '',
          flavor: flavor || '',
          filling: filling || '',
          glaze: frosting || '', // Note: API expects 'glaze' not 'frosting'
          shape: shape || '',
          decorations: decorations ? decorations.split(',') : [],
          text: '', // Add empty text field if needed
          quantity: 1, // Default quantity
          deliveryDate: date || '',
          deliveryTime: time || '',
          totalPrice: parseFloat(price || '0'),
          customerName: orderForm.customerName,
          lastName: orderForm.lastName,
          customerPhone: orderForm.customerPhone,
          customerEmail: orderForm.customerEmail,
          address: orderForm.address,
          city: orderForm.city,
          zipCode: orderForm.zipCode,
          notes: orderForm.notes
        };

        console.log('Submitting custom cake order with data:', customCakeData);
        
        // Submit custom cake order
        const orderResponse = await fetch('/api/custom-cake', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customCakeData),
        });

        if (orderResponse.ok) {
          const orderResult = await orderResponse.json();
          if (orderResult.success && orderResult.orderId) {
            const newOrderId = orderResult.orderId;
            setOrderId(newOrderId);
            showToast('success', 'თქვენი კასტომ ტორტის შეკვეთა წარმატებით გაიგზავნა! ადმინი განიხილავს თქვენს შეკვეთას და დაგიკავშირდებათ.');
            setOrderSubmitted(true);
            
            // Start polling for order status with the new order ID
            startOrderStatusPolling(newOrderId);
          } else {
            showToast('error', 'შეკვეთის გაგზავნა ვერ მოხერხდა. სცადეთ თავიდან.');
          }
        } else {
          showToast('error', 'შეკვეთის გაგზავნა ვერ მოხერხდა. სცადეთ თავიდან.');
        }
      } else {
        showToast('error', 'არასწორი ერთჯერადი კოდი. სცადეთ თავიდან.');
        setOtp('');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      showToast('error', 'ერთჯერადი კოდის დადასტურება ვერ მოხერხდა. სცადეთ მოგვიანებით.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-color ">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/custom" className="inline-flex md:text-[20px] text-[18px] font-semibold items-center text-[#d90b6b] hover:text-pink-700 mb-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              დაბრუნდი უკან
            </Link>
            <h1 className="md:text-[20px] text-[18px] font-bold text-black mb-2">მორგებული ტორტის შეკვეთა</h1>
            <p className="text-black">შეიყვანეთ თქვენი ინფორმაცია </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Custom Cake Details */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="  md:text-[24px] text-[20px] font-bold text-black mb-4 flex items-center gap-2">ტორტის დეტალები</h2>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-xl">
                  <h3 className=" md:text-[24px] text-[20px] font-semibold text-black mb-4">თქვენი არჩევანი</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="md:text-[20px] text-[18px] text-black">დიზაინი:</span>
                      <span className="font-medium md:text-[18px] text-[16px] text-black">{design}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="md:text-[20px] text-[18px] text-black">თარიღი:</span>
                      <span className="font-medium md:text-[18px] text-[16px] text-black">{date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="md:text-[20px] text-[18px] text-black">დრო:</span>
                      <span className="font-medium md:text-[18px] text-[16px] text-black">{time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="md:text-[20px] text-[18px] text-black">ზომა:</span>
                      <span className="font-medium md:text-[18px] text-[16px] text-black">{size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="md:text-[20px] text-[18px] text-black">გემო:</span>
                      <span className="font-medium md:text-[18px] text-[16px] text-black">{flavor}</span>
                    </div>
                    {filling && (
                      <div className="flex justify-between">
                        <span className="md:text-[20px] text-[18px] text-black">ფილინგი:</span>
                        <span className="font-medium md:text-[18px] text-[16px] text-black">{filling}</span>
                      </div>
                    )}
                    {frosting && (
                      <div className="flex justify-between">
                        <span className="md:text-[20px] text-[18px] text-black">გლაზურა:</span>
                        <span className="font-medium md:text-[18px] text-[16px] text-black">{frosting}</span>
                      </div>
                    )}
                    {shape && (
                      <div className="flex justify-between">
                        <span className="md:text-[20px] text-[18px] text-black">ფორმა:</span>
                        <span className="font-medium md:text-[18px] text-[16px] text-black">{shape}</span>
                      </div>
                    )}
                    {decorations && (
                      <div className="flex justify-between">
                        <span className="md:text-[20px] text-[18px] text-black">დეკორაციები:</span>
                        <span className="font-medium md:text-[18px] text-[16px] text-black">{decorations}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="md:text-[24px] text-[20px] font-medium text-black">ფასი:</span>
                      <span className="md:text-[24px] text-[20px] font-bold text-[#d90b6b]">₾{price}</span>
                    </div>
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
              <h2 className="md:text-[24px] text-[20px] font-bold text-black mb-6">შეკვეთის ინფორმაცია</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="md:text-[20px] text-[18px] block text-black font-medium mb-1">სახელი *</label>
                                         <input
                       type="text"
                       value={orderForm.customerName}
                       onChange={(e) => handleInputChange("customerName", e.target.value)}
                       disabled={orderSubmitted}
                       className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-black rounded-lg focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       placeholder="სახელი"
                       required
                     />
                  </div>

                  <div>
                    <label className="block text-black md:text-[20px] text-[18px] font-medium mb-1">გვარი</label>
                                         <input
                       type="text"
                       value={orderForm.lastName}
                       onChange={(e) => handleInputChange("lastName", e.target.value)}
                       disabled={orderSubmitted}
                       className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-black rounded-lg focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       placeholder="გვარი"
                     />
                  </div>
                </div>

                <div>
                  <label className="block md:text-[20px] text-[18px] font-medium mb-1">ტელეფონი *</label>
                                     <input
                     type="tel"
                     value={orderForm.customerPhone}
                     onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                     disabled={orderSubmitted}
                     className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-black rounded-lg focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     placeholder="ტელეფონი"
                     required
                   />
                </div>

                <div>
                  <label className="block text-black md:text-[20px] text-[18px] font-medium mb-1">ელ-ფოსტა *</label>
                                                          <input
                       type="email"
                       value={orderForm.customerEmail}
                       onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                       disabled={orderSubmitted}
                       className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-black rounded-lg focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       placeholder="ელ-ფოსტა"
                       required
                     />
                  <p className="text-sm text-gray-500 mt-1">ერთჯერადი კოდი გაიგზავნება ამ ელ-ფოსტაზე</p>
                </div>

                <div>
                  <label className="block text-black md:text-[20px] text-[18px] font-medium mb-1">მისამართი *</label>
                                     <input
                     type="text"
                     value={orderForm.address}
                     onChange={(e) => handleInputChange("address", e.target.value)}
                     disabled={orderSubmitted}
                     className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-black rounded-lg focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     placeholder="მისამართი"
                     required
                   />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-black md:text-[20px] text-[18px] font-medium mb-1">ქალაქი</label>
                                         <input
                       type="text"
                       value={orderForm.city}
                       onChange={(e) => handleInputChange("city", e.target.value)}
                       disabled={orderSubmitted}
                       className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-black rounded-lg focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       placeholder="ქალაქი"
                     />
                  </div>

                  <div>
                    <label className="block text-black md:text-[20px] text-[18px] font-medium mb-1">პოსტის კოდი</label>
                                         <input
                       type="text"
                       value={orderForm.zipCode}
                       onChange={(e) => handleInputChange("zipCode", e.target.value)}
                       disabled={orderSubmitted}
                       className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-black rounded-lg focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       placeholder="პოსტის კოდი"
                     />
                  </div>
                </div>

                <div className=" mx-auto">
                  <label className="block text-black md:text-[20px] text-[18px] font-medium mb-1">დამატებითი ინფორმაცია</label>
                                     <textarea
                     value={orderForm.notes}
                     onChange={(e) => handleInputChange("notes", e.target.value)}
                     disabled={orderSubmitted}
                     className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-black rounded-lg focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <h2 className="text-2xl font-bold text-black mb-2">მორგებული ტორტის შეკვეთა წარმატებით გაიგზავნა!</h2>
                  <p className="text-black text-lg mb-6">
                    თქვენი მორგებული ტორტის შეკვეთა მიღებულია და ადმინი განიხილავს მას
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">რა მოხდება შემდეგ?</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                      <p className="text-blue-700">ადმინი გადახედავს თქვენს მორგებულ ტორტის შეკვეთას</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                      <p className="text-blue-700">თქვენ დაგიკავშირდებათ დიზაინის დეტალების გასარკვევად</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                      <p className="text-blue-700">მორგებული ტორტის შექმნა დაიწყება მას შემდეგ, რაც დადასტურდება</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">მაღაზიიდან მალე დაგიკავშირდებათ</h3>
                  <p className="text-yellow-700">
                    ჩვენი გუნდი მალე დაგიკავშირდებათ თქვენს ტელეფონზე ან ელ-ფოსტაზე დიზაინის დეტალების გასარკვევად
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/" 
                    className="bg-[#d90b6b] text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors font-semibold"
                  >
                    დაბრუნდი მთავარ გვერდზე
                  </Link>
                  <Link 
                    href="/custom" 
                    className="border-2 border-[#d90b6b] text-[#d90b6b] px-8 py-3 rounded-lg hover:bg-[#d90b6b] hover:text-white transition-colors font-semibold"
                  >
                    ახალი მორგებული ტორტი
                  </Link>
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
                    სამწუხაროდ, თქვენი მორგებული ტორტის შეკვეთა ვერ დაეთანხმა ტექნიკური მიზეზების გამო
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
                    ახალი მორგებული ტორტი
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

const CustomCakeOrderPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-color pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">იტვირთება...</p>
        </div>
      </div>
    }>
      <CustomCakeOrderContent />
    </Suspense>
  );
};

export default CustomCakeOrderPage;
