"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';
import ImageUpload from '@/components/CloudinaryUploader';

const CakeCategory = {
  BIRTHDAY: 'BIRTHDAY',
  WEDDING: 'WEDDING',
  ANNIVERSARY: 'ANNIVERSARY',
  CUSTOM: 'CUSTOM',
  Desserts: 'Desserts'
} as const;

interface Cake {
  id: number;
  name: string;
  imageUrl: string | null;
  category: string;
  pieces: number | null;
  marzipanPrice: number | null;
  creamPrice: number | null;
  hasMarzipan: boolean;
  hasCream: boolean;
  fillings: string[];
  isCustomizable: boolean;
  available: boolean;
  price?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface EditCakeFormProps {
  cake: Cake;
  onUpdate: (cake: Cake) => void;
  onCancel: () => void;
}

const EditCakeForm: React.FC<EditCakeFormProps> = ({ cake, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    name: cake.name,
    imageUrl: cake.imageUrl || '',
    category: cake.category,
    price: cake.price?.toString() || '',
    pieces: cake.pieces?.toString() || '',
    marzipanPrice: cake.marzipanPrice?.toString() || '',
    creamPrice: cake.creamPrice?.toString() || '',
    hasMarzipan: cake.hasMarzipan,
    hasCream: cake.hasCream,
    fillings: [...cake.fillings],
    isCustomizable: cake.isCustomizable,
    available: cake.available,
    gallery: cake.imageUrl ? [cake.imageUrl] : [] // Initialize with existing image
  });

  const [fillingInput, setFillingInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };


  const addFilling = () => {
    if (fillingInput.trim() && !formData.fillings.includes(fillingInput.trim())) {
      setFormData(prev => ({
        ...prev,
        fillings: [...prev.fillings, fillingInput.trim()]
      }));
      setFillingInput('');
    }
  };

  const removeFilling = (filling: string) => {
    setFormData(prev => ({
      ...prev,
      fillings: prev.fillings.filter(a => a !== filling)
    }));
  };

  const handleGalleryChange = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      gallery: urls,
      imageUrl: urls.length > 0 ? urls[0] : '' // Set first image as main image
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
             const updatedCake: Cake = {
         ...cake,
         name: formData.name,
         imageUrl: formData.imageUrl,
         category: formData.category,
         price: formData.isCustomizable ? null : (formData.price ? Math.round(parseFloat(formData.price) * 100) / 100 : null),
         pieces: formData.pieces ? parseInt(formData.pieces) : null,
         marzipanPrice: formData.hasMarzipan && formData.marzipanPrice ? Math.round(parseFloat(formData.marzipanPrice) * 100) / 100 : null,
         creamPrice: formData.hasCream && formData.creamPrice ? Math.round(parseFloat(formData.creamPrice) * 100) / 100 : null,
         hasMarzipan: formData.hasMarzipan,
         hasCream: formData.hasCream,
         fillings: formData.fillings,
         isCustomizable: formData.isCustomizable,
         available: formData.available
       };

      onUpdate(updatedCake);
    } catch (error) {
      console.error('Error updating cake:', error);
      showToast('error', 'ტორტის განახლებისას მოხდა შეცდომა');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[16px] text-black placeholder:text-black font-medium text-gray-700 mb-2">
            ტორტის სახელი *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
            placeholder="მაგ: შოკოლადის ტორტი"
          />
        </div>

        <div>
          <label className="block text-[16px] text-black placeholder:text-black font-medium text-gray-700 mb-2">
            კატეგორია *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
          >
            <option className='text-black ' value={CakeCategory.BIRTHDAY}>დაბადების დღე</option>
            <option className='text-black ' value={CakeCategory.WEDDING}>ქორწილი</option>
            <option className='text-black ' value={CakeCategory.ANNIVERSARY}>იუბილე</option>
            <option className='text-black ' value={CakeCategory.CUSTOM}>ინდივიდუალური</option>
            <option className='text-black ' value={CakeCategory.Desserts}>დესერტები</option>
          </select>
        </div>
      </div>

      {/* Cake Type Selection */}
      <div className="bg-white p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">ტორტის ტიპი</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              name="isCustomizable"
              value="false"
              checked={!formData.isCustomizable}
              onChange={(e) => setFormData(prev => ({ ...prev, isCustomizable: false }))}
              className="w-5 h-5 text-pink-600 border-gray-300 focus:ring-pink-500"
            />
            <label className="text-[16px] text-black placeholder:text-black font-medium text-gray-700">
              სტანდარტული ტორტი (ფიქსირებული ფასი)
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              name="isCustomizable"
              value="true"
              checked={formData.isCustomizable}
              onChange={(e) => setFormData(prev => ({ ...prev, isCustomizable: true }))}
              className="w-5 h-5 text-pink-600 border-gray-300 focus:ring-pink-500"
            />
            <label className="text-[16px] text-black placeholder:text-black font-medium text-gray-700">
              კასტომიზებადი ტორტი (ფასი კონფიგურაციის მიხედვით)
            </label>
          </div>
        </div>
      </div>

      {/* Price Field - Only for non-customizable cakes */}
      {!formData.isCustomizable && (
        <div>
          <label className="block text-[16px] text-black placeholder:text-black font-medium text-gray-700 mb-2">
            ფასი (₾) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required={!formData.isCustomizable}
            step="0.01"
            min="0"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
            placeholder="მაგ: 45.99"
          />
        </div>
      )}

      {/* Pieces Field */}
      <div>
        <label className="block text-[16px] text-black placeholder:text-black font-medium text-gray-700 mb-2">
          ნაჭრები
        </label>
        <input
          type="number"
          name="pieces"
          value={formData.pieces}
          onChange={handleInputChange}
          min="1"
          className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
          placeholder="მაგ: 8, 12, 16"
        />
      </div>

      {/* Marzipan Options */}
      <div className="bg-white p-6 rounded-xl">
        <div className="flex items-center space-x-3 mb-4">
          <input
            type="checkbox"
            name="hasMarzipan"
            checked={formData.hasMarzipan}
            onChange={handleInputChange}
            className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
          />
          <label className="text-[16px] text-black placeholder:text-black font-medium text-gray-700">
            მარცეპანი ხელმისაწვდომია
          </label>
        </div>
        {formData.hasMarzipan && (
          <div>
            <label className="block text-[16px] text-black placeholder:text-black font-medium text-gray-700 mb-2">
              მარცეპანის ფასი (₾)
            </label>
            <input
              type="number"
              name="marzipanPrice"
              value={formData.marzipanPrice}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="მაგ: 15.00"
            />
          </div>
        )}
      </div>

      {/* Cream Options */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <div className="flex items-center space-x-3 mb-4">
          <input
            type="checkbox"
            name="hasCream"
            checked={formData.hasCream}
            onChange={handleInputChange}
            className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
          />
          <label className="text-[16px] text-black placeholder:text-black font-medium text-gray-700">
            კრემი ხელმისაწვდომია
          </label>
        </div>
        {formData.hasCream && (
          <div>
            <label className="block text-[16px] text-black placeholder:text-black font-medium text-gray-700 mb-2">
              კრემის ფასი (₾)
            </label>
            <input
              type="number"
              name="creamPrice"
              value={formData.creamPrice}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="მაგ: 10.00"
            />
          </div>
        )}
      </div>


      {/* Fillings */}
      <div>
        <label className="block text-[16px] text-black placeholder:text-black font-medium text-gray-700 mb-2">
          შიგთავსი
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={fillingInput}
            onChange={(e) => setFillingInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFilling())}
            className="flex-1 text-black placeholder:text-black px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
            placeholder="დაამატეთ შიგთავსი (მაგ: კრემი, ჯემი)"
          />
          <button
            type="button"
            onClick={addFilling}
            className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
          >
            დამატება
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.fillings.map((filling, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-[16px] text-black placeholder:text-black flex items-center gap-2"
            >
              {filling}
              <button
                type="button"
                onClick={() => removeFilling(filling)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

             {/* Image URL */}
       <div>
         <label className="block text-[16px] text-black placeholder:text-black font-medium text-gray-700 mb-2">
           სურათი *
         </label>
         <ImageUpload
           value={formData.gallery}
           onChange={handleGalleryChange}
         />
       </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="isCustomizable"
            checked={formData.isCustomizable}
            onChange={handleInputChange}
            className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
          />
          <label className="text-[16px] text-black placeholder:text-black font-medium text-gray-700">
            პერსონალიზაცია შეიძლება
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleInputChange}
            className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
          />
          <label className="text-[16px] text-black placeholder:text-black font-medium text-gray-700">
            ხელმისაწვდომია გაყიდვაში
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <motion.button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          გაუქმება
        </motion.button>
                 <motion.button
           type="submit"
           disabled={isSubmitting || formData.gallery.length === 0}
           className={`px-8 py-3 rounded-xl font-medium text-white transition-colors ${
             isSubmitting || formData.gallery.length === 0
               ? 'bg-gray-400 cursor-not-allowed'
               : 'bg-pink-500 hover:bg-pink-600'
           }`}
           whileHover={{ scale: isSubmitting || formData.gallery.length === 0 ? 1 : 1.02 }}
           whileTap={{ scale: isSubmitting || formData.gallery.length === 0 ? 1 : 0.98 }}
         >
           {isSubmitting ? 'მზადდება...' : 'განახლება'}
         </motion.button>
      </div>
    </form>
  );
};

export default EditCakeForm;

