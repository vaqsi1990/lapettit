"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cake, 
  Palette, 
  Heart, 
  Star, 
  Flower, 
  Crown, 
  Gift, 
  Sparkles,
  Plus,
  Minus,
  ShoppingCart,
  Save,
  Upload,
  Trash2,
  Check,
  X,
  Calendar,
  Clock
} from 'lucide-react';

interface CakeDesign {
  id: string;
  name: string;
  nameGeorgian: string;
  description: string;
  descriptionGeorgian: string;
  basePrice: number;
  image: string;
}

interface CustomizationOption {
  id: string;
  name: string;
  nameGeorgian: string;
  price: number;
  category: 'flavor' | 'filling' | 'frosting' | 'decoration' | 'size' | 'shape';
}

const Custom = () => {
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [selectedFilling, setSelectedFilling] = useState<string>('');
  const [selectedFrosting, setSelectedFrosting] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedShape, setSelectedShape] = useState<string>('');
  const [selectedDecorations, setSelectedDecorations] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [messagePosition, setMessagePosition] = useState({ x: 50, y: 80 }); // Default position (percentage)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cakeDesigns: CakeDesign[] = [
    {
      id: 'classic',
      name: 'Classic Round',
      nameGeorgian: 'კლასიკური მრგვალი',
      description: 'Traditional round cake perfect for any occasion',
      descriptionGeorgian: 'ტრადიციული მრგვალი ტორტი ნებისმიერი შემთხვევისთვის',
      basePrice: 45,
      image: '/catalog/1.jpg'
    },
    {
      id: 'square',
      name: 'Modern Square',
      nameGeorgian: 'თანამედროვე კვადრატული',
      description: 'Contemporary square design with clean lines',
      descriptionGeorgian: 'თანამედროვე კვადრატული დიზაინი სუფთა ხაზებით',
      basePrice: 50,
      image: '/catalog/2.jpg'
    },
    {
      id: 'heart',
      name: 'Romantic Heart',
      nameGeorgian: 'რომანტიული გული',
      description: 'Heart-shaped cake for romantic celebrations',
      descriptionGeorgian: 'გულის ფორმის ტორტი რომანტიული დღესასწაულებისთვის',
      basePrice: 55,
      image: '/catalog/3.jpg'
    },
    {
      id: 'tiered',
      name: 'Elegant Tiered',
      nameGeorgian: 'ელეგანტური მრავალშრიანი',
      description: 'Multi-tier cake for special celebrations',
      descriptionGeorgian: 'მრავალშრიანი ტორტი სპეციალური დღესასწაულებისთვის',
      basePrice: 80,
      image: '/hero/528840499_1341682604631620_4000600754266452299_n.jpg'
    }
  ];

  const customizationOptions: CustomizationOption[] = [
    // Flavors
    { id: 'vanilla', name: 'Vanilla', nameGeorgian: 'ვანილა', price: 0, category: 'flavor' },
    { id: 'chocolate', name: 'Chocolate', nameGeorgian: 'შოკოლადი', price: 5, category: 'flavor' },
    { id: 'red-velvet', name: 'Red Velvet', nameGeorgian: 'წითელი ბარხატი', price: 8, category: 'flavor' },
    { id: 'strawberry', name: 'Strawberry', nameGeorgian: 'მარწყვი', price: 6, category: 'flavor' },
    { id: 'lemon', name: 'Lemon', nameGeorgian: 'ლიმონი', price: 4, category: 'flavor' },
    
    // Fillings
    { id: 'cream', name: 'Cream', nameGeorgian: 'კრემი', price: 0, category: 'filling' },
    { id: 'chocolate-ganache', name: 'Chocolate Ganache', nameGeorgian: 'შოკოლადის განაში', price: 7, category: 'filling' },
    { id: 'fruit-jam', name: 'Fruit Jam', nameGeorgian: 'ხილის ჯემი', price: 5, category: 'filling' },
    { id: 'caramel', name: 'Caramel', nameGeorgian: 'კარამელი', price: 6, category: 'filling' },
    
    // Frostings
    { id: 'buttercream', name: 'Buttercream', nameGeorgian: 'კარაქის კრემი', price: 0, category: 'frosting' },
    { id: 'fondant', name: 'Fondant', nameGeorgian: 'ფონდანი', price: 12, category: 'frosting' },
    { id: 'cream-cheese', name: 'Cream Cheese', nameGeorgian: 'ყველის კრემი', price: 8, category: 'frosting' },
    { id: 'whipped-cream', name: 'Whipped Cream', nameGeorgian: 'შპრიცის კრემი', price: 4, category: 'frosting' },
    
    // Sizes
    { id: 'small', name: 'Small (6")', nameGeorgian: 'პატარა (6")', price: 0, category: 'size' },
    { id: 'medium', name: 'Medium (8")', nameGeorgian: 'საშუალო (8")', price: 15, category: 'size' },
    { id: 'large', name: 'Large (10")', nameGeorgian: 'დიდი (10")', price: 25, category: 'size' },
    { id: 'extra-large', name: 'Extra Large (12")', nameGeorgian: 'ძალიან დიდი (12")', price: 35, category: 'size' },
    
    // Shapes
    { id: 'round', name: 'Round', nameGeorgian: 'მრგვალი', price: 0, category: 'shape' },
    { id: 'square', name: 'Square', nameGeorgian: 'კვადრატული', price: 5, category: 'shape' },
    { id: 'heart', name: 'Heart', nameGeorgian: 'გული', price: 8, category: 'shape' },
    { id: 'oval', name: 'Oval', nameGeorgian: 'ოვალური', price: 6, category: 'shape' },
    
    // Decorations
    { id: 'fresh-flowers', name: 'Fresh Flowers', nameGeorgian: 'ახალი ყვავილები', price: 20, category: 'decoration' },
    { id: 'edible-gold', name: 'Edible Gold', nameGeorgian: 'ჭამადი ოქრო', price: 15, category: 'decoration' },
    { id: 'chocolate-shavings', name: 'Chocolate Shavings', nameGeorgian: 'შოკოლადის ნაჭრები', price: 8, category: 'decoration' },
    { id: 'sprinkles', name: 'Sprinkles', nameGeorgian: 'საფრთხილები', price: 5, category: 'decoration' },
    { id: 'custom-figurine', name: 'Custom Figurine', nameGeorgian: 'ინდივიდუალური ფიგურა', price: 25, category: 'decoration' }
  ];

  useEffect(() => {
    calculateTotal();
  }, [selectedDesign, selectedFlavor, selectedFilling, selectedFrosting, selectedSize, selectedShape, selectedDecorations, quantity]);

  const calculateTotal = () => {
    let total = 0;
    
    // Base design price
    const design = cakeDesigns.find(d => d.id === selectedDesign);
    if (design) total += design.basePrice;
    
    // Customization options
    if (selectedFlavor) {
      const flavor = customizationOptions.find(o => o.id === selectedFlavor);
      if (flavor) total += flavor.price;
    }
    
    if (selectedFilling) {
      const filling = customizationOptions.find(o => o.id === selectedFilling);
      if (filling) total += filling.price;
    }
    
    if (selectedFrosting) {
      const frosting = customizationOptions.find(o => o.id === selectedFrosting);
      if (frosting) total += frosting.price;
    }
    
    if (selectedSize) {
      const size = customizationOptions.find(o => o.id === selectedSize);
      if (size) total += size.price;
    }
    
    if (selectedShape) {
      const shape = customizationOptions.find(o => o.id === selectedShape);
      if (shape) total += shape.price;
    }
    
    // Decorations
    selectedDecorations.forEach(decorationId => {
      const decoration = customizationOptions.find(o => o.id === decorationId);
      if (decoration) total += decoration.price;
    });
    
    setTotalPrice(total * quantity);
  };

  const handleDecorationToggle = (decorationId: string) => {
    setSelectedDecorations(prev => 
      prev.includes(decorationId) 
        ? prev.filter(id => id !== decorationId)
        : [...prev, decorationId]
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!customMessage) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !customMessage) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Keep text within cake boundaries
    const clampedX = Math.max(10, Math.min(90, x));
    const clampedY = Math.max(10, Math.min(90, y));
    
    setMessagePosition({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!selectedDesign) {
      alert('გთხოვთ აირჩიოთ ტორტის დიზაინი');
      return;
    }
    
    if (!selectedDate) {
      alert('გთხოვთ აირჩიოთ მიწოდების თარიღი');
      return;
    }
    
    if (!selectedTime) {
      alert('გთხოვთ აირჩიოთ მიწოდების დრო');
      return;
    }

    // Check if date is at least 24 hours in advance
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const now = new Date();
    const timeDifference = selectedDateTime.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 3600);
    
    if (hoursDifference < 24) {
      alert('მინიმალური შეკვეთის დრო არის 24 საათი წინასწარ');
      return;
    }

 
    
    // Show success message or redirect
    alert('თქვენი ტორტის შეკვეთა წარმატებით გაიგზავნა!');
  };

  const getOptionByCategory = (category: string) => {
    return customizationOptions.filter(option => option.category === category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      {/* Header */}
      <div className="  top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl pb-10 font-bold text-center bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"
          >
            შექმენით თქვენი ტორტი
          </motion.h1>
          
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Design Options */}
          <div className="space-y-8">
            {/* Cake Design Selection */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <h2 className=" md:text-[20px] text-[18px] font-bold text-black mb-4 flex items-center gap-2">
                <Cake className="w-6 h-6 text-pink-500" />
                ტორტის დიზაინი
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {cakeDesigns.map((design) => (
                  <motion.div
                    key={design.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedDesign === design.id
                        ? 'border-pink-500 shadow-lg'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                    onClick={() => setSelectedDesign(design.id)}
                  >
                    <img src={design.image} alt={design.name} className="w-full h-42 object-cover" />
                    <div className="p-3 bg-white/90">
                      <h3 className="font-semibold text-black text-[16px] md:text-[18px]">{design.nameGeorgian}</h3>
                      <p className="text-xs text-black">{design.name}</p>
                      <p className="text-pink-600 font-bold text-[16px] md:text-[18px]">₾{design.basePrice}</p>
                    </div>
                    {selectedDesign === design.id && (
                      <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Basic Customizations */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20"
            >
                <h2 className=" md:text-[20px] text-[18px] font-bold text-black mb-4 flex items-center gap-2">
             
                ძირითადი ოფციები
              </h2>
              
              {/* Flavor */}
              <div className="mb-6">
                <label className="block text-[16px] md:text-[18px] font-medium text-black mb-2">გემო</label>
                <div className="grid grid-cols-2 gap-2">
                  {getOptionByCategory('flavor').map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedFlavor(option.id)}
                      className={`p-2 rounded-lg text-[16px] md:text-[18px] font-medium transition-all duration-300 ${
                        selectedFlavor === option.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-black hover:bg-purple-100'
                      }`}
                    >
                      {option.nameGeorgian}
                      {option.price > 0 && <span className="text-xs ml-1">+₾{option.price}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filling */}
              <div className="mb-6">
                <label className="block text-[16px] md:text-[18px] font-medium text-black mb-2">შევსება</label>
                <div className="grid grid-cols-2 gap-2">
                  {getOptionByCategory('filling').map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedFilling(option.id)}
                      className={`p-2 rounded-lg text-[16px] md:text-[18px] font-medium transition-all duration-300 ${
                        selectedFilling === option.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-black hover:bg-purple-100'
                      }`}
                    >
                      {option.nameGeorgian}
                      {option.price > 0 && <span className="text-xs ml-1">+₾{option.price}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frosting */}
              <div className="mb-6">
                <label className="block text-[16px] md:text-[18px] font-medium text-black mb-2">გლაზური</label>
                <div className="grid grid-cols-2 gap-2">
                  {getOptionByCategory('frosting').map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedFrosting(option.id)}
                      className={`p-2 rounded-lg text-[16px] md:text-[18px] font-medium transition-all duration-300 ${
                        selectedFrosting === option.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-black hover:bg-purple-100'
                      }`}
                    >
                      {option.nameGeorgian}
                      {option.price > 0 && <span className="text-xs ml-1">+₾{option.price}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size and Shape */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[16px] md:text-[18px] font-medium text-black mb-2">ზომა</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">აირჩიეთ ზომა</option>
                    {getOptionByCategory('size').map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.nameGeorgian} {option.price > 0 && `(+₾${option.price})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[16px] md:text-[18px] font-medium text-black y-700 mb-2">ფორმა</label>
                  <select
                    value={selectedShape}
                    onChange={(e) => setSelectedShape(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">აირჩიეთ ფორმა</option>
                    {getOptionByCategory('shape').map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.nameGeorgian} {option.price > 0 && `(+₾${option.price})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Decorations */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <h2 className=" md:text-[20px] text-[18px] font-bold text-black mb-4 flex items-center gap-2">
             
                დეკორაციები
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {getOptionByCategory('decoration').map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleDecorationToggle(option.id)}
                    className={`p-3 rounded-lg text-[16px] md:text-[18px] font-medium transition-all duration-300 flex items-center justify-between ${
                      selectedDecorations.includes(option.id)
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-black hover:bg-yellow-100'
                    }`}
                  >
                    <span>{option.nameGeorgian}</span>
                    <span className="text-xs">+₾{option.price}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Custom Message & Instructions */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20"
            >
                    <h2 className=" md:text-[20px] text-[18px] font-bold text-black mb-4 flex items-center gap-2">
             
                პერსონალიზაცია
              </h2>
              
              <div className="mb-4">
                <label className="block text-[16px] md:text-[18px] font-medium text-black mb-2">პერსონალური შეტყობინება</label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="დაწერეთ თქვენი შეტყობინება ტორტზე..."
                  className="w-full p-3 border border-black rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                />
                                 {customMessage && (
                   <div className="mt-2">
                     <p className="text-sm text-black">
                       💡 ტექსტის გადასატანად უბრალოდ დააწკაპეთ და გადაიტანეთ ტორტზე
                     </p>
                   </div>
                 )}
              </div>

              <div className="mb-4">
                <label className="block text-[16px] md:text-[18px] font-medium text-black mb-2">სპეციალური მითითებები</label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="დამატებითი მითითებები ან სურვილები..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Date and Time Selection */}
              <div className="mb-4">
                    <label className="block text-[16px] md:text-[18px] font-medium text-black mb-2">მიწოდების თარიღი და დრო</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[16px] md:text-[18px] text-black mb-1">თარიღი</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[16px] md:text-[18px] text-black mb-1">დრო</label>
                    <div className="relative">
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      >
                        <option value="">აირჩიეთ დრო</option>
                        <option value="09:00">09:00 - დილა</option>
                        <option value="10:00">10:00 - დილა</option>
                        <option value="11:00">11:00 - დილა</option>
                        <option value="12:00">12:00 - შუადღე</option>
                        <option value="13:00">13:00 - შუადღე</option>
                        <option value="14:00">14:00 - შუადღე</option>
                        <option value="15:00">15:00 - შუადღე</option>
                        <option value="16:00">16:00 - შუადღე</option>
                        <option value="17:00">17:00 - საღამო</option>
                        <option value="18:00">18:00 - საღამო</option>
                        <option value="19:00">19:00 - საღამო</option>
                        <option value="20:00">20:00 - საღამო</option>
                      </select>
                      <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-black mt-2">
                  ⚠️ მინიმალური შეკვეთის დრო: 3 თვით ადრე
                </p>
              </div>

              {/* Reference Image Upload */}
              <div>
                <label className="block text-[16px] md:text-[18px] font-medium text-black mb-2">რეფერენსის სურათი</label>
                <div className="border-2 border-dashed border-black rounded-lg p-4 text-center hover:border-pink-300 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 text-black hover:text-pink-500 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    ატვირთეთ სურათი
                  </button>
                  {uploadedImage && (
                    <div className="mt-3 relative">
                      <img src={uploadedImage} alt="Reference" className="w-20 h-20 object-cover rounded-lg mx-auto" />
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Preview & Order */}
          <div className="  space-y-6">
            {/* Cake Preview */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20  top-32"
            >
                <h2 className=" md:text-[20px] text-[18px] font-bold text-black mb-4 flex items-center gap-2">
              
                ტორტის ნახვა
              </h2>
              
                             {selectedDesign ? (
                 <div className="text-center">
                                       <div 
                      className={`relative mb-4 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                     <img 
                       src={cakeDesigns.find(d => d.id === selectedDesign)?.image} 
                       alt="Cake Preview" 
                       className="w-full h-FULL object-cover rounded-lg"
                     />
                     <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                       <div className="text-white text-center">
                         <h3 className=" md:text-[18px] text-[16px] font-semibold">
                           {cakeDesigns.find(d => d.id === selectedDesign)?.nameGeorgian}
                         </h3>
                         <p className=" md:text-[16px] text-[14px] opacity-90">
                           {cakeDesigns.find(d => d.id === selectedDesign)?.descriptionGeorgian}
                         </p>
                       </div>
                     </div>
                                           {/* Custom Message Overlay */}
                      {customMessage && (
                        <div 
                          className="absolute bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg cursor-grab active:cursor-grabbing select-none"
                          style={{
                            left: `${messagePosition.x}%`,
                            top: `${messagePosition.y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <p className="text-black font-semibold text-sm md:text-base break-words max-w-[200px] text-center">
                            {customMessage}
                          </p>
                        </div>
                      )}
                   </div>    
                  
                  {/* Selected Options Summary */}
                  <div className="text-left space-y-2 text-[16px] md:text-[18px]">
                    {selectedFlavor && (
                      <div className="flex justify-between">
                        <span className="text-black">გემო:</span>
                        <span className="font-medium">
                          {customizationOptions.find(o => o.id === selectedFlavor)?.nameGeorgian}
                        </span>
                      </div>
                    )}
                    {selectedFilling && (
                      <div className="flex justify-between">
                        <span className="text-black">შევსება:</span>
                        <span className="font-medium">
                          {customizationOptions.find(o => o.id === selectedFilling)?.nameGeorgian}
                        </span>
                      </div>
                    )}
                    {selectedFrosting && (
                      <div className="flex justify-between">
                        <span className="text-black">გლაზური:</span>
                        <span className="font-medium">
                          {customizationOptions.find(o => o.id === selectedFrosting)?.nameGeorgian}
                        </span>
                      </div>
                    )}
                    {selectedSize && (
                      <div className="flex justify-between">
                        <span className="text-black">ზომა:</span>
                        <span className="font-medium">
                          {customizationOptions.find(o => o.id === selectedSize)?.nameGeorgian}
                        </span>
                      </div>
                    )}
                    {selectedShape && (
                      <div className="flex justify-between">
                        <span className="text-black">ფორმა:</span>
                        <span className="font-medium">
                          {customizationOptions.find(o => o.id === selectedShape)?.nameGeorgian}
                        </span>
                      </div>
                    )}
                    {selectedDecorations.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-black">დეკორაციები:</span>
                        <span className="font-medium text-right">
                          {selectedDecorations.map(id => 
                            customizationOptions.find(o => o.id === id)?.nameGeorgian
                          ).join(', ')}
                        </span>
                      </div>
                    )}
                    {selectedDate && (
                      <div className="flex justify-between">
                        <span className="text-black">თარიღი:</span>
                        <span className="font-medium">
                          {new Date(selectedDate).toLocaleDateString('ka-GE')}
                        </span>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="flex justify-between">
                        <span className="text-black">დრო:</span>
                        <span className="font-medium">
                          {selectedTime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-black md:text-[20px]">
                  <Cake className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>აირჩიეთ ტორტის დიზაინი დასაწყისისთვის</p>
                </div>
              )}
            </motion.div>

            {/* Quantity & Price */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <h2 className=" md:text-[20px] text-[18px] font-bold text-black mb-4 flex items-center gap-2">
              
                შეკვეთა
              </h2>
              
              {/* Quantity */}
              <div className="mb-6">
                    <label className="block text-[16px] md:text-[18px] font-medium text-black mb-2">რაოდენობა</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className=" md:text-[18px] text-[16px] font-bold text-black min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center md:text-[18px] text-[16px] font-bold text-black mb-4">
                  <span>საერთო ფასი:</span>
                  <span className=" md:text-[18px] text-[16px] text-pink-600">₾{totalPrice}</span>
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={!selectedDesign || !selectedDate || !selectedTime}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
                    selectedDesign && selectedDate && selectedTime
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 inline mr-2" />
                  შეუკვეთე ახლა
                </button>
                
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  disabled={!selectedDesign}
                  className={`w-full mt-3 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                    selectedDesign
                      ? 'border-2 border-pink-500 text-pink-600 hover:bg-pink-50'
                      : 'border-2 border-gray-300 text-black cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  შეინახე დიზაინი
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">დიზაინი შენახულია!</h3>
              <p className="text-black mb-6">
                თქვენი ტორტის დიზაინი წარმატებით შენახულია. შეგიძლიათ მოგვიანებით გააგრძელოთ ან შეუკვეთოთ.
              </p>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-pink-600 transition-colors"
              >
                კარგი
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Custom;