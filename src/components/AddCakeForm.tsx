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


interface AddCakeFormProps {
  onCakeAdded: () => void;
}

const AddCakeForm: React.FC<AddCakeFormProps> = ({ onCakeAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: CakeCategory.BIRTHDAY,
    servings: '',
    weightKg: '',
    flavors: [] as string[],
    fillings: [] as string[],
    isCustomizable: true,
    available: true,
    gallery: [] as string[]
  });

  const [flavorInput, setFlavorInput] = useState('');
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

  const addFlavor = () => {
    if (flavorInput.trim() && !formData.flavors.includes(flavorInput.trim())) {
      setFormData(prev => ({
        ...prev,
        flavors: [...prev.flavors, flavorInput.trim()]
      }));
      setFlavorInput('');
    }
  };

  const removeFlavor = (flavor: string) => {
    setFormData(prev => ({
      ...prev,
      flavors: prev.flavors.filter(f => f !== flavor)
    }));
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
      const response = await fetch('/api/cake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          servings: formData.servings ? parseInt(formData.servings) : null,
          weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast('success', 'ტორტი წარმატებით დაემატა!');
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          imageUrl: '',
          category: CakeCategory.BIRTHDAY,
          servings: '',
          weightKg: '',
          flavors: [],
          fillings: [],
          isCustomizable: true,
          available: true,
          gallery: []
        });
        setFlavorInput('');
        setFillingInput('');
        onCakeAdded();
      } else {
        showToast('error', `შეცდომა: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating cake:', error);
      showToast('error', 'ტორტის შექმნისას მოხდა შეცდომა');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ტორტის სახელი *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
            placeholder="მაგ: შოკოლადის ტორტი"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ფასი (₾) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            step="0.01"
            min="0"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
            placeholder="მაგ: 45.99"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          აღწერა *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
          placeholder="ტორტის დეტალური აღწერა..."
        />
      </div>

      {/* Category and Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            კატეგორია *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
          >
            <option value={CakeCategory.BIRTHDAY}>დაბადების დღე</option>
            <option value={CakeCategory.WEDDING}>ქორწილი</option>
            <option value={CakeCategory.ANNIVERSARY}>იუბილე</option>
            <option value={CakeCategory.CUSTOM}>ინდივიდუალური</option>
            <option value={CakeCategory.Desserts}>დესერტები</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            რაოდენობა (ადამიანი)
          </label>
          <input
            type="number"
            name="servings"
            value={formData.servings}
            onChange={handleInputChange}
            min="1"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
            placeholder="მაგ: 8"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            წონა (კგ)
          </label>
          <input
            type="number"
            name="weightKg"
            value={formData.weightKg}
            onChange={handleInputChange}
            step="0.1"
            min="0"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
            placeholder="მაგ: 1.5"
          />
        </div>
      </div>

      {/* Flavors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          გემოები
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={flavorInput}
            onChange={(e) => setFlavorInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFlavor())}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
            placeholder="დაამატეთ გემო (მაგ: შოკოლადი)"
          />
          <button
            type="button"
            onClick={addFlavor}
            className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
          >
            დამატება
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.flavors.map((flavor, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm flex items-center gap-2"
            >
              {flavor}
              <button
                type="button"
                onClick={() => removeFlavor(flavor)}
                className="text-pink-600 hover:text-pink-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Fillings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          შიგთავსი
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={fillingInput}
            onChange={(e) => setFillingInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFilling())}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
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
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
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

      {/* Single Image Upload */}
      <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
          <label className="text-sm font-medium text-gray-700">
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
          <label className="text-sm font-medium text-gray-700">
            ხელმისაწვდომია გაყიდვაში
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <motion.button
          type="submit"
          disabled={isSubmitting || formData.gallery.length === 0}
          className={`px-8 py-4 rounded-xl font-medium text-white transition-colors ${
            isSubmitting || formData.gallery.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-pink-500 hover:bg-pink-600'
          }`}
          whileHover={{ scale: isSubmitting || formData.gallery.length === 0 ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting || formData.gallery.length === 0 ? 1 : 0.98 }}
        >
          {isSubmitting ? 'მზადდება...' : 'ტორტის დამატება'}
        </motion.button>
      </div>
    </form>
  );
};

export default AddCakeForm;
