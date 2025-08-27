"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { getCakeById } from '@/lib/action';
import { mapCakeToGalleryImage, type GalleryImage } from '@/lib/utils';
import { submitOrder, type OrderFormData } from '@/lib/orderActions';
import { Plus, Minus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const OrderPage = () => {
  const params = useParams();
  const router = useRouter();
  const cakeId = parseInt(params.cakeId as string);

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

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      alert('გთხოვთ შეიყვანოთ 6-ნიშნა კოდი');
      return;
    }

    if (!cake) {
      alert('ტორტის ინფორმაცია ვერ მოიძებნა');
      return;
    }

    if (isSubmitting) {
      alert('გთხოვთ დაელოდოთ, ვერიფიკაცია მიმდინარეობს...');
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

        await submitOrder(orderData);
        
        // Send receipt email
        try {
          const receiptResponse = await fetch('/api/send-receipt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: orderForm.customerEmail,
              customerName: orderForm.customerName,
              orderData: orderData,
              cake: cake
            }),
          });
          
          if (receiptResponse.ok) {
            alert('თქვენი შეკვეთა წარმატებით გაიგზავნა! ქვითარი გაიგზავნა თქვენს ელ-ფოსტაზე.');
          } else {
            alert('თქვენი შეკვეთა წარმატებით გაიგზავნა! ქვითრის გამოიგზავნაა.');
          }
        } catch (error) {
          console.error('Error sending receipt:', error);
          alert('თქვენი შეკვეთა წარმატებით გაიგზავნა! ქვითრის გაგზავნა ვერ მოხერხდა.');
        }
        
        router.push('/');
      } else {
        alert('არასწორი OTP კოდი. სცადეთ თავიდან.');
        setOtp('');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('OTP-ის დადასტურება ვერ მოხერხდა. სცადეთ მოგვიანებით.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      alert('გთხოვთ შეიყვანოთ ელ-ფოსტა OTP-ის მისაღებად');
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
         
         alert('OTP კოდი გაიგზავნა თქვენს ელ-ფოსტაზე! გთხოვთ დაელოდოთ 2-3 წამი კოდის მისაღებამდე.');
         // Small delay to ensure OTP is properly stored
         await new Promise(resolve => setTimeout(resolve, 2000));
       } else {
         alert('OTP-ის გაგზავნა ვერ მოხერხდა. სცადეთ თავიდან.');
       }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('OTP-ის გაგზავნა ვერ მოხერხდა. სცადეთ მოგვიანებით.');
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
    <div className="min-h-screen bg-color pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-[#d90b6b] hover:text-pink-700 mb-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              დაბრუნდი უკან
            </Link>
            <h1 className="text-3xl font-bold text-black mb-2">შეკვეთის ფორმა</h1>
            <p className="text-gray-600">შეიყვანეთ თქვენი ინფორმაცია ტორტის შეკვეთისთვის</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Cake Details */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-black mb-4">ტორტის დეტალები</h2>

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
                  <p className="text-gray-600 mb-3">{cake.descriptionGeorgian}</p>
                  <p className="text-2xl font-bold text-[#d90b6b]">₾{cake.price}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-black font-medium">რაოდენობა:</label>
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

                  <div className="flex items-center justify-between py-3 border-t border-gray-200">
                    <span className="text-lg font-medium text-gray-700">სულ:</span>
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
              <h2 className="text-xl font-bold text-black mb-6">შეკვეთის ინფორმაცია</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-black font-medium mb-1">სახელი *</label>
                    <input
                      type="text"
                      value={orderForm.customerName}
                      onChange={(e) => handleInputChange("customerName", e.target.value)}
                      className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                      placeholder="სახელი"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-black font-medium mb-1">გვარი</label>
                    <input
                      type="text"
                      value={orderForm.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                      placeholder="გვარი"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-black font-medium mb-1">ტელეფონი *</label>
                  <input
                    type="tel"
                    value={orderForm.customerPhone}
                    onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                    className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                    placeholder="ტელეფონი"
                    required
                  />
                </div>

                <div>
                  <label className="block text-black font-medium mb-1">ელ-ფოსტა *</label>
                  <input
                    type="email"
                    value={orderForm.customerEmail}
                    onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                    className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                    placeholder="ელ-ფოსტა"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">OTP კოდი გაიგზავნება ამ ელ-ფოსტაზე</p>
                </div>

                <div>
                  <label className="block text-black font-medium mb-1">მისამართი *</label>
                  <input
                    type="text"
                    value={orderForm.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                    placeholder="მისამართი"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-black font-medium mb-1">ქალაქი</label>
                    <input
                      type="text"
                      value={orderForm.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                      placeholder="ქალაქი"
                    />
                  </div>

                  <div>
                    <label className="block text-black font-medium mb-1">პოსტის კოდი</label>
                    <input
                      type="text"
                      value={orderForm.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                      placeholder="პოსტის კოდი"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-black font-medium mb-1">დამატებითი ინფორმაცია</label>
                  <textarea
                    value={orderForm.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                    placeholder="დამატებითი ინფორმაცია (არასავალდებულო)"
                    rows={3}
                  />
                </div>

                {!otpSent ? (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#d90b6b] hover:bg-pink-700 text-white py-3 px-6 rounded-xl font-bold transition-all"
                  >
                    {isSubmitting ? "იგზავნება..." : "შეკვეთის გაგზავნა"}
                  </button>
                                 ) : (
                   <div className="space-y-4">
                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                       <p className="text-sm text-blue-800">
                         ✅ OTP კოდი გაიგზავნა! გთხოვთ შეამოწმოთ თქვენი ელ-ფოსტა და შეიყვანოთ 6-ნიშნა კოდი.
                       </p>
                     </div>
                     <label className="block text-black font-medium mb-1">
                       შეიყვანე კოდი ელფოსტიდან
                     </label>
                     <input
                       type="text"
                       value={otp}
                       onChange={(e) => setOtp(e.target.value)}
                       className="w-full text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500"
                       placeholder="6-ნიშნა კოდი"
                     />
                     <div className="flex gap-3">
                       <button
                         onClick={handleVerifyOtp}
                         disabled={isSubmitting}
                         className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-bold transition-all disabled:opacity-50"
                       >
                         {isSubmitting ? "დადასტურება..." : "დადასტურება"}
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
                               alert('ახალი OTP კოდი გაიგზავნა!');
                               setOtp('');
                             } else {
                               alert('OTP-ის ხელახლა გაგზავნა ვერ მოხერხდა.');
                             }
                           } catch (error) {
                             alert('OTP-ის ხელახლა გაგზავნა ვერ მოხერხდა.');
                           } finally {
                             setIsSubmitting(false);
                           }
                         }}
                         disabled={isSubmitting}
                         className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                       >
                         ხელახლა გაგზავნა
                       </button>
                     </div>
                   </div>
                 )}

              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
