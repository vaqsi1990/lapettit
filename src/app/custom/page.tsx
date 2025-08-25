"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cake, 
  Plus,
  Minus,
  ShoppingCart,
  Save,
  Upload,
  Check,
  X
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
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client form state
  const [clientForm, setClientForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    notes: ''
  });

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
    { id: 'vanilla', name: 'Vanilla', nameGeorgian: 'ვანილა', price: 10, category: 'flavor' },
    { id: 'chocolate', name: 'Chocolate', nameGeorgian: 'შოკოლადი', price: 5, category: 'flavor' },
    { id: 'red-velvet', name: 'Red Velvet', nameGeorgian: 'წითელი ბარხატი', price: 8, category: 'flavor' },
    { id: 'strawberry', name: 'Strawberry', nameGeorgian: 'მარწყვი', price: 6, category: 'flavor' },
    { id: 'lemon', name: 'Lemon', nameGeorgian: 'ლიმონი', price: 4, category: 'flavor' },

    // Fillings
    { id: 'cream', name: 'Cream', nameGeorgian: 'კრემი', price: 10, category: 'filling' },
    { id: 'chocolate-ganache', name: 'Chocolate Ganache', nameGeorgian: 'შოკოლადის განაში', price: 7, category: 'filling' },
    { id: 'fruit-jam', name: 'Fruit Jam', nameGeorgian: 'ხილის ჯემი', price: 5, category: 'filling' },
    { id: 'caramel', name: 'Caramel', nameGeorgian: 'კარამელი', price: 6, category: 'filling' },

    // Frostings
    { id: 'buttercream', name: 'Buttercream', nameGeorgian: 'კარაქის კრემი', price: 10, category: 'frosting' },
    { id: 'fondant', name: 'Fondant', nameGeorgian: 'ფონდანი', price: 12, category: 'frosting' },
    { id: 'cream-cheese', name: 'Cream Cheese', nameGeorgian: 'ყველის კრემი', price: 8, category: 'frosting' },
    { id: 'whipped-cream', name: 'Whipped Cream', nameGeorgian: 'შპრიცის კრემი', price: 4, category: 'frosting' },

    // Sizes
    { id: 'small', name: 'Small (6")', nameGeorgian: 'პატარა (6")', price: 0, category: 'size' },
    { id: 'medium', name: 'Medium (8")', nameGeorgian: 'საშუალო (8")', price: 15, category: 'size' },
    { id: 'large', name: 'Large (10")', nameGeorgian: 'დიდი (10")', price: 25, category: 'size' },
    { id: 'extra-large', name: 'Extra Large (12")', nameGeorgian: 'ძალიან დიდი (12")', price: 35, category: 'size' },

    // Shapes
    { id: 'round', name: 'Round', nameGeorgian: 'მრგვალი', price: 10, category: 'shape' },
    { id: 'square', name: 'Square', nameGeorgian: 'კვადრატული', price: 5, category: 'shape' },
    { id: 'heart', name: 'Heart', nameGeorgian: 'გული', price: 8, category: 'shape' },
    { id: 'oval', name: 'Oval', nameGeorgian: 'ოვალური', price: 6, category: 'shape' },

    // Decorations
    { id: 'fresh-flowers', name: 'Fresh Flowers', nameGeorgian: 'ახალი ყვავილები', price: 20, category: 'decoration' },
    { id: 'edible-gold', name: 'Edible Gold', nameGeorgian: 'ოქრო', price: 15, category: 'decoration' },
    { id: 'chocolate-shavings', name: 'Chocolate Shavings', nameGeorgian: 'შოკოლადის ნაჭრები', price: 8, category: 'decoration' },
    { id: 'sprinkles', name: 'Sprinkles', nameGeorgian: 'საფრთხილები', price: 5, category: 'decoration' },
    { id: 'custom-figurine', name: 'Custom Figurine', nameGeorgian: 'ინდივიდუალური ფიგურა', price: 25, category: 'decoration' }
  ];

  useEffect(() => {
    calculateTotal();
  }, [selectedDesign, selectedFlavor, selectedFilling, selectedFrosting, selectedSize, selectedShape, selectedDecorations, quantity]);

    const calculateTotal = useCallback(() => {
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
  }, [selectedDesign, selectedFlavor, selectedFilling, selectedFrosting, selectedSize, selectedShape, selectedDecorations, quantity]);

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

    // Show client information form popup instead of alert
    setIsClientFormOpen(true);
  };

  const handleClientFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!clientForm.firstName || !clientForm.lastName || !clientForm.phone || !clientForm.address || !clientForm.city) {
      alert('გთხოვთ შეავსოთ ყველა სავალდებულო ველი');
      return;
    }

    // Here you would typically send the data to your backend
    console.log('Order submitted:', {
      cakeDetails: {
        design: selectedDesign,
        flavor: selectedFlavor,
        filling: selectedFilling,
        frosting: selectedFrosting,
        size: selectedSize,
        shape: selectedShape,
        decorations: selectedDecorations,
        customMessage,
        specialInstructions,
        quantity,
        selectedDate,
        selectedTime,
        totalPrice
      },
      clientInfo: clientForm
    });

    // Show success message
    alert('თქვენი ტორტის შეკვეთა წარმატებით გაიგზავნა!');

    // Close the popup
    setIsClientFormOpen(false);

    // Reset form
    setClientForm({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      zipCode: '',
      notes: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setClientForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getOptionByCategory = (category: string) => {
    return customizationOptions.filter(option => option.category === category);
  };

  return (
    <div className="min-h-screen bg-color">
      {/* Header */}
      <div className="  top-0 z-50">
        <div className="container  mx-auto px-4 py-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[20px] md:text-[30px] pb-5 mt-10 font-bold text-center text-[#d90b6b]"
          >
            შექმენით თქვენი ტორტი
          </motion.h1>

        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column - Design Options */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Cake Design Selection */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-white/20"
            >
              <h2 className="text-lg md:text-xl font-bold text-black mb-4 flex items-center gap-2">
                <Cake className="w-5 h-5 md:w-6 md:h-6 text-pink-500" />
                ტორტის დიზაინი
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {cakeDesigns.map((design) => (
                  <motion.div
                    key={design.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative cursor-pointer rounded-xl overflow-hidden border-1 transition-all duration-300 ${selectedDesign === design.id
                        ? 'border-pink-500 shadow-lg'
                        : ''
                      }`}
                    onClick={() => setSelectedDesign(design.id)}
                  >
                    <img src={design.image} alt={design.name} className="w-full h-32 sm:h-36 md:h-40 object-cover" />
                    <div className="p-2 md:p-3 bg-white/90">
                      <h3 className="font-semibold text-black text-[18px] md:text-[20px] font-semibold text-black mb-2 line-clamp-1">{design.nameGeorgian}</h3>
                      <p className=" text-[18px] md:text-[20px] text-black">{design.name}</p>
                      <p className="text-pink-600 font-bold  text-black text-2xl font-bold text-pink-600  line-clamp-3">₾{design.basePrice}</p>
                    </div>
                    {selectedDesign === design.id && (
                      <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-1">
                        <Check className="w-3 h-3 md:w-4 md:h-4" />
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
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-white/20"
            >
              <h2 className=" md:text-[24px] text-[20px] font-bold text-black mb-4 flex items-center gap-2">

                ძირითადი ოფციები
              </h2>

              {/* Flavor */}
              <div className="mb-4 md:mb-6">
                <label className="block md:text-[20px] text-[18px] font-medium text-black mb-2">გემო</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getOptionByCategory('flavor').map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedFlavor(option.id)}
                      className={`p-2 md:p-3 cursor-pointer rounded-lg md:text-[20px] text-[18px] font-medium transition-all duration-300 ${selectedFlavor === option.id
                          ? 'bg-[#d90b6b] text-white'
                          : ' border-1 border-black text-black '
                        }`}
                    >
                      {option.nameGeorgian}
                      {option.price > 0 && <span className=" md:text-[18px] text-[16px] font-medium ml-1">+₾{option.price}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filling */}
              <div className="mb-4 md:mb-6">
                <label className="block md:text-[20px] text-[18px] font-medium text-black mb-2">შევსება</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getOptionByCategory('filling').map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedFilling(option.id)}
                      className={`p-2 md:p-3 cursor-pointer rounded-lg md:text-[20px] text-[18px] font-medium transition-all duration-300 ${selectedFilling === option.id
                          ? 'bg-[#d90b6b] text-white'
                          : ' border-1 border-black text-black '
                        }`}
                    >
                      {option.nameGeorgian}
                      {option.price > 0 && <span className=" md:text-[18px] text-[16px] font-medium ml-1">+₾{option.price}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frosting */}
              <div className="mb-4 md:mb-6">
                <label className="block md:text-[20px] text-[18px] font-medium text-black mb-2">გლაზური</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getOptionByCategory('frosting').map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedFrosting(option.id)}
                      className={`p-2 md:p-3 cursor-pointer rounded-lg md:text-[20px] text-[18px] font-medium transition-all duration-300 ${selectedFrosting === option.id
                          ? 'bg-[#d90b6b] text-white'
                          : ' border-1 border-black text-black '
                        }`}
                    >
                      {option.nameGeorgian}
                      {option.price > 0 && <span className=" md:text-[18px] text-[16px] font-medium ml-1">+₾{option.price}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size and Shape */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block md:text-[20px] text-[18px] font-medium text-black mb-2">ზომა</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full p-2 md:p-3 border border-black rounded-lg text-[18px] md:text-[20px] font-medium"
                  >
                    <option className=" md:text-[18px] text-[16px] font-medium" value="">აირჩიეთ ზომა</option>
                    {getOptionByCategory('size').map((option) => (
                      <option className=" md:text-[18px] text-[16px] font-medium" key={option.id} value={option.id}>
                        {option.nameGeorgian} {option.price > 0 && `(+₾${option.price})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block md:text-[20px] text-[18px] font-medium text-black mb-2">ფორმა</label>
                  <select
                    value={selectedShape}
                    onChange={(e) => setSelectedShape(e.target.value)}
                    className="w-full p-2 md:p-3 border border-black rounded-lg text-[18px] md:text-[20px] font-medium"
                  >
                    <option className=" md:text-[18px] text-[16px] font-medium" value="">აირჩიეთ ფორმა</option>
                    {getOptionByCategory('shape').map((option) => (
                      <option className=" md:text-[18px] text-[16px] font-medium" key={option.id} value={option.id}>
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
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-white/20"
            >
              <h2 className=" md:text-[24px] text-[20px] font-bold text-black mb-4 flex items-center gap-2">

                დეკორაციები
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                {getOptionByCategory('decoration').map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleDecorationToggle(option.id)}
                    className={`p-2 md:p-3 cursor-pointer rounded-lg md:text-[20px] text-[18px] font-medium transition-all duration-300 flex items-center justify-between ${selectedDecorations.includes(option.id)
                        ? 'bg-[#d90b6b] text-white'
                        : ' border-1 border-black text-black '
                      }`}
                  >
                    <span>{option.nameGeorgian}</span>
                    <span className=" md:text-[18px] text-[16px] font-medium">+₾{option.price}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Custom Message & Instructions */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-white/20"
            >
              <h2 className=" md:text-[24px] text-[20px] font-bold text-black mb-4 flex items-center gap-2">

                პერსონალიზაცია
              </h2>

              <div className="mb-4">
                <label className="block md:text-[20px] text-[18px] font-medium text-black mb-2">პერსონალური შეტყობინება</label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="დაწერეთ თქვენი შეტყობინება ტორტზე..."
                  className="w-full p-2 border-2 focus:border-pink-500 focus:outline-none md:p-3 border border-black rounded-lg "
                  rows={3}
                />
                {customMessage && (
                  <div className="mt-2">
                    <p className=" md:text-[20px] text-[18px] font-bold  text-[#d90b6b]">
                      ტექსტის გადასატანად უბრალოდ დააწკაპეთ და გადაიტანეთ ტორტზე
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block md:text-[20px] text-[18px] font-medium text-black mb-2">სპეციალური მითითებები</label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="დამატებითი მითითებები ან სურვილები..."
                  className="w-full p-2 border-2 focus:border-pink-500 focus:outline-none md:p-3 border md:p-3 border border-black rounded-lg "
                  rows={3}
                />
              </div>

              {/* Date and Time Selection */}
              <div className="mb-4">
                <label className="block md:text-[20px] text-[18px] font-medium text-black mb-2">მიწოდების თარიღი და დრო</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block md:text-[18px] text-[16px] text-black mb-1">თარიღი</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full md:text-[20px] text-[16px] h-[50px] p-2 md:p-3 border-2 focus:border-pink-500 focus:outline-none md:p-3 borderlack rounded-lg "
                      />

                    </div>
                  </div>
                  <div>
                    <label className="block md:text-[18px] text-[16px] text-black mb-1">დრო</label>
                    <div className="relative">
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full md:text-[20px] text-[16px]  h-[50px] p-2 md:p-3 border-2 focus:border-pink-500 focus:outline-none md:p-3 border rounded-lg "
                      >
                        <option className=" md:text-[20px] text-[16px] font-medium" value="">აირჩიეთ დრო</option>
                        <option className=" md:text-[20px] text-[16px] font-medium" value="09:00">09:00 - დილა</option>
                        <option className=" md:text-[20px] text-[16px] font-medium" value="10:00">10:00 - დილა</option>
                        <option className=" md:text-[20px] text-[16px] font-medium" value="11:00">11:00 - დილა</option>
                        <option className=" md:text-[20px] text-[16px] font-medium" value="12:00">12:00 - შუადღე</option>
                        <option className=" md:text-[20px] text-[16px] font-medium" value="13:00">13:00 - შუადღე</option>
                        <option className=" md:text-[20px] text-[16px] font-medium" value="14:00">14:00 - შუადღე</option>
                        <option className=" md:text-[20px] text-[16px] font-medium" value="15:00">15:00 - შუადღე</option>
                        <option className=" md:text-[20px] text-[16px] font-medium" value="16:00">16:00 - შუადღე</option>
                        <option className=" md:text-[20px] text-[16px] font-medium" value="17:00">17:00 - საღამო</option>
                        <option className=" md:text-[20px] text-[16px] font-medium" value="18:00">18:00 - საღამო</option>
                        <option className=" md:text-[20px] text-[16px] font-medium" value="19:00">19:00 - საღამო</option>
                        <option className=" md:text-[20px] text-[16px] font-medium" value="20:00">20:00 - საღამო</option>
                      </select>

                    </div>
                  </div>
                </div>
                <p className=" md:text-[20px] text-[18px] font-bold text-[#d90b6b] mt-2">
                  მინიმალური შეკვეთის დრო: 3 თვით ადრე
                </p>
              </div>

              {/* Reference Image Upload */}
              <div>
                <label className="block md:text-[20px] text-[18px] font-medium text-black mb-2">რეფერენსის სურათი</label>
                <div className="border-2 border-dashed border-black rounded-lg p-3 md:p-4 text-center ">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 text-black hover:text-pink-500 transition-colors md:text-[20px] text-[18px] font-medium"
                  >
                    <Upload className="w-4 h-4 md:w-5 md:h-5" />
                    ატვირთეთ სურათი
                  </button>
                  {uploadedImage && (
                    <div className="mt-3 relative">
                      <img src={uploadedImage} alt="Reference" className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg mx-auto" />
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-2 h-2 md:w-3 md:h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Preview & Order */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-6 self-start space-y-4 md:space-y-6">
            {/* Cake Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-white/20"
            >
              <h2 className=" md:text-[24px] text-[20px] font-bold text-black mb-4 flex items-center gap-2">

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
                      className="w-full h-48 md:h-56 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <h3 className="text-sm md:text-base lg:text-lg font-semibold">
                          {cakeDesigns.find(d => d.id === selectedDesign)?.nameGeorgian}
                        </h3>
                        <p className="text-xs md:text-sm opacity-90">
                          {cakeDesigns.find(d => d.id === selectedDesign)?.descriptionGeorgian}
                        </p>
                      </div>
                    </div>
                    {/* Custom Message Overlay */}
                    {customMessage && (
                      <div
                        className="absolute md:text-[20px] text-[18px] bg-white/90 backdrop-blur-sm rounded-lg px-3 md:px-4 py-2 shadow-lg cursor-grab active:cursor-grabbing select-none md:text-[20px] text-[18px] font-medium"
                        style={{
                          left: `${messagePosition.x}%`,
                          top: `${messagePosition.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <p className="text-black md:text-[20px] text-[18px] font-semibold text-xs md:text-sm lg:text-base break-words max-w-[150px] md:max-w-[200px] text-center">
                          {customMessage}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Selected Options Summary */}
                  <div className="text-left space-y-2 md:text-[18px] text-[16px] font-medium">
                    {selectedFlavor && (
                      <div className="flex justify-between">
                        <span className="text-black">გემო:</span>
                        <span className="font-medium ">
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
                        <span className=" md:text-[18px] text-[16px] text-black">ზომა:</span>
                        <span className="  font-medium">
                          {customizationOptions.find(o => o.id === selectedSize)?.nameGeorgian}
                        </span>
                      </div>
                    )}
                    {selectedShape && (
                      <div className="flex justify-between">
                        <span className=" md:text-[18px] text-[16px] text-black">ფორმა:</span>
                        <span className=" font-medium">
                          {customizationOptions.find(o => o.id === selectedShape)?.nameGeorgian}
                        </span>
                      </div>
                    )}
                    {selectedDecorations.length > 0 && (
                      <div className="flex justify-between">
                        <span className=" md:text-[18px] text-[16px] text-black">დეკორაციები:</span>
                        <span className="  font-medium text-right">
                          {selectedDecorations.map(id =>
                            customizationOptions.find(o => o.id === id)?.nameGeorgian
                          ).join(', ')}
                        </span>
                      </div>
                    )}
                    {selectedDate && (
                      <div className="flex justify-between">
                        <span className=" md:text-[20px] text-[18px] text-black">თარიღი:</span>
                        <span className=" md:text-[18px] text-[16px] font-medium">
                          <input type="date" value={selectedDate} readOnly className="w-full p-2 md:p-3 border border-black rounded-lg " />
                        </span>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="flex justify-between">
                        <span className=" md:text-[20px] text-[18px] text-black">დრო:</span>
                        <span className=" md:text-[18px] text-[16px] font-medium">
                          {selectedTime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 md:py-12 text-black text-base md:text-lg lg:text-xl">
                  <Cake className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
                  <p>აირჩიეთ ტორტის დიზაინი დასაწყისისთვის</p>
                </div>
              )}
            </motion.div>

            {/* Quantity & Price */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-white/20"
            >
              <h2 className=" md:text-[24px] text-[20px] font-bold text-black mb-4 flex items-center gap-2">

                შეკვეთა
              </h2>

              {/* Quantity */}
              <div className="mb-4 md:mb-6">
                <label className="block md:text-[20px] text-[18px] font-medium text-black mb-2">რაოდენობა</label>
                <div className="flex items-center gap-3 md:gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 md:p-3 cursor-pointer bg-pink-100 rounded-full   transition-colors"
                  >
                    <Minus className="w-5 h-5 text-pink-600  md:w-6 md:h-6" />
                  </button>
                  <span className="text-base md:text-lg lg:text-xl font-bold text-black min-w-[2.5rem] md:min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 md:p-3 cursor-pointer rounded-full bg-pink-100  transition-colors"
                  >
                    <Plus className="w-5  text-pink-600 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="border-t border-gray-200 pt-4 flex flex-col ">
                <div className="flex justify-between items-center text-base md:text-lg lg:text-xl font-bold text-black mb-4">
                  <span>საერთო ფასი:</span>
                  <span className="text-pink-600 text-2xl">₾{totalPrice}</span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!selectedDesign || !selectedDate || !selectedTime}
                  className={`w-full md:w-[300px] mx-auto md:text-[20px] text-[18px] cursor-pointer py-2 md:py-3 px-4 md:px-6 rounded-lg font-bold text-white transition-all duration-300 text-sm md:text-base ${selectedDesign && selectedDate && selectedTime
                      ? 'bg-[#d90b6b] md:text-[20px] text-[18px] text-white'
                      : 'bg-gray-300 md:text-[20px] text-[18px] cursor-not-allowed'
                    }`}
                >
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
                  შეუკვეთე ახლა
                </button>

                <button
                  onClick={() => setIsPreviewOpen(true)}
                  disabled={!selectedDesign}
                  className={`w-full w-full md:w-[300px] mx-auto  md:text-[20px] text-[18px] cursor-pointer mt-3 py-2 px-3 md:px-4 rounded-lg font-bold transition-all duration-300 text-sm md:text-base ${selectedDesign
                      ? 'border-2 '
                      : 'border-2 border-gray-300 text-black cursor-not-allowed'
                    }`}
                >
                  <Save className="w-3 h-3 md:w-4 md:h-4 inline mr-2" />
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
              className="bg-white rounded-2xl   w-full text-center"
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

      {/* Client Information Form */}
      <AnimatePresence>
        {isClientFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsClientFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl text-center mt-10 font-bold text-black mb-4">შეავსეთ ინფორმაცია</h3>
              <form onSubmit={handleClientFormSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1">
                  <label className="block  md:text-[20px] text-[18px] font-medium  mb-1">სახელი</label>
                  <input
                    type="text"
                    value={clientForm.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-pink-500 focus:outline-none outline-none transition"
                    placeholder="სახელი"
                    required
                  />
                </div>  

                <div className="col-span-1">
                  <label className="block  md:text-[20px] text-[18px] font-medium  mb-1">გვარი</label>
                  <input
                    type="text"
                    value={clientForm.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-pink-500 focus:outline-none outline-none transition"
                    placeholder="გვარი"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block  md:text-[20px] text-[18px] font-medium  mb-1">ტელეფონი</label>
                  <input
                    type="tel"
                    value={clientForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-pink-500 focus:outline-none outline-none transition"
                    placeholder="ტელეფონი"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block  md:text-[20px] text-[18px] font-medium  mb-1">ელ-ფოსტა</label>
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition"
                    placeholder="ელ-ფოსტა"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block  md:text-[20px] text-[18px] font-medium  mb-1">მისამართი</label>
                  <input
                    type="text"
                    value={clientForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition"
                    placeholder="მისამართი"
                    required
                  />
                </div>

                <div className="col-span-1">
                      <label className="block  md:text-[20px] text-[18px] font-medium  mb-1">ქალაქი</label>
                  <input
                    type="text"
                    value={clientForm.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition"
                    placeholder="ქალაქი"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block  md:text-[20px] text-[18px] font-medium  mb-1">პოსტის კოდი</label>
                  <input
                    type="text"
                    value={clientForm.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition"
                    placeholder="პოსტის კოდი"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block  md:text-[20px] text-[18px] font-medium  mb-1">შეტყობინება</label>
                  <textarea
                    value={clientForm.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition"
                    placeholder="შეტყობინება (არასავალდებულო)"
                    rows={3}
                  />
                </div>

                <div className="col-span-2 flex justify-center">
                  <button
                    type="submit"
                    className="w-full md:w-[250px] md:text-[20px] text-[18px] py-3 px-6 rounded-xl font-bold cursor-pointer text-white text-lg 
        bg-[#d90b6b] hover:scale-105 transform transition-all shadow-md"
                  >
                    <ShoppingCart className="w-5 h-5 inline mr-2" />
                    შეკვეთა
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Custom;