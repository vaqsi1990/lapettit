"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  
  Send,
  Instagram,
  Facebook,
 
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Here you would typically send the data to your backend
    console.log('Contact form submitted:', formData);
    
    // Show success message
    alert('თქვენი შეტყობინება წარმატებით გაიგზავნა! ჩვენ მალე დაგიკავშირდებით.');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-color">
      {/* Hero Section */}
      <section className="relative py-10 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
           
            <h1 className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-6">
              დაგვიკავშირდით
            </h1>
            <p className="text-[18px] md:text-[20px] text-black mb-8 max-w-3xl mx-auto">
              გვაქვთ კითხვები? გვინდა თქვენი შეკვეთის შესახებ საუბარი? 
              ჩვენ აქ ვართ დაგეხმაროთ!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information & Form Section */}
      <section className="py-10 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-6">
                ჩვენი კონტაქტები
              </h2>
              
              <div className="space-y-8">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-8 h-8 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-[18px] md:text-[20px] font-semibold  mb-2">ტელეფონი</h3>
                    <p className=" text-[18px] md:text-[20px]">+995 599 123 456</p>
                    <p className=" text-[18px] md:text-[20px]">ორშაბათი - შაბათი: 9:00 - 20:00</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-8 h-8 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-[18px] md:text-[20px] font-semibold  mb-2">ელ-ფოსტა</h3>
                    <p className=" text-[18px] md:text-[20px]">info@cakes.ge</p>
                    <p className="">პასუხს მოგცემთ 24 საათის განმავლობაში</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-8 h-8 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-[18px] md:text-[20px] font-semibold  mb-2">მისამართი</h3>
                    <p className=" text-[18px] md:text-[20px]">რუსთავის გზატკეცილი 123</p>
                    <p className=" text-[18px] md:text-[20px]">თბილისი, საქართველო</p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-8 h-8 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-[18px] md:text-[20px] font-semibold  mb-2">სამუშაო საათები</h3>
                    <p className=" text-[18px] md:text-[20px]">ორშაბათი - პარასკევი: 9:00 - 20:00</p>
                    <p className=" text-[18px] md:text-[20px]">შაბათი: 10:00 - 18:00</p>
                    <p className=" text-[18px] md:text-[20px]">კვირა: დახურული</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-12">
                <h3 className="text-[18px] md:text-[20px] font-semibold  mb-4">გამოგვყევით</h3>
                <div className="flex gap-4">
                  <a 
                    href="#" 
                    className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center transition-colors duration-300"
                  >
                    <Instagram className="w-8 h-8 text-pink-600" />
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center transition-colors duration-300"
                  >
                    <Facebook className="w-8 h-8 text-pink-600" />
                  </a>
                </div>
              </div>

           
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-2xl p-8"
            >
              <h2 className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-6">გამოგვიგზავნეთ შეტყობინება</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    სახელი და გვარი *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                    placeholder="შეიყვანეთ თქვენი სახელი"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ელ-ფოსტა *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                    placeholder="example@email.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ტელეფონის ნომერი
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                    placeholder="+995 5XX XX XX XX"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    თემა *
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                  >
                    <option value="">აირჩიეთ თემა</option>
                    <option value="order">შეკვეთის შესახებ</option>
                    <option value="custom">მორგებული ტორტი</option>
                    <option value="delivery">მიწოდების შესახებ</option>
                    <option value="pricing">ფასების შესახებ</option>
                    <option value="other">სხვა</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    შეტყობინება *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors resize-none"
                    placeholder="დაწერეთ თქვენი შეტყობინება..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-pink-500 hover:bg-pink-600 hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      გაგზავნა...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      გაგზავნა
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-10 px-4 ">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-6">
              ჩვენი მდებარეობა
            </h2>
            <p className="text-[18px] md:text-[20px] text-black max-w-2xl mx-auto">
              მოგვძებნეთ რუსთავის გზატკეცილზე, ცენტრალური ბაზრის მახლობლად
            </p>
          </motion.div>
          
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d527.1025800521865!2d41.62764887947295!3d41.63969768360113!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4067871122c1e471%3A0x5eefe1050b5746b4!2zTEFwcGV0aXQgUGFzdHJ5IFNob3AgLyDhg5rhg5Dhg57hg5Thg6Lhg5jhg6Lhg5gg4YOh4YOQ4YOZ4YOd4YOc4YOT4YOY4YOi4YOg4YOd!5e0!3m2!1ska!2sge!4v1756110215499!5m2!1ska!2sge" 
              width="100%" 
              height="400" 
              style={{border:0}} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Lapettit Pastry Shop Location"
              className="w-full h-96 md:h-[450px]"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-10 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-[20px] md:text-[30px] font-bold text-[#d90b6b] mb-8">
              ხშირად დასმული კითხვები
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                რამდენი დრო სჭირდება ტორტის მომზადებას?
              </h3>
              <p className="text-gray-600">
                მორგებული ტორტებისთვის საჭიროა მინიმუმ 3-5 დღე. 
                მარტივი ტორტებისთვის - 1-2 დღე.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                მიწოდება ხდება თბილისის მთელ ტერიტორიაზე?
              </h3>
              <p className="text-gray-600">
                კი, ჩვენ ვმიწოდებთ თბილისის მთელ ტერიტორიაზე. 
                მიწოდების ფასი დამოკიდებულია მანძილზე.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                შეგვიძლია ტორტი მოვამზადოთ თქვენი ფოტოს მიხედვით?
              </h3>
              <p className="text-gray-600">
                რა თქმა უნდა! ჩვენ ვქმნით ტორტებს თქვენი ფოტოს ან 
                ნახატის მიხედვით. უბრალოდ გაგვიგზავნეთ ინსპირაცია!
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                რა ინგრედიენტები იყენებთ?
              </h3>
              <p className="text-gray-600">
                ჩვენ ვიყენებთ მხოლოდ ბუნებრივ და ხარისხიან ინგრედიენტებს. 
                ყველა პროდუქტი ფრეში და ხარისხიანია.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;