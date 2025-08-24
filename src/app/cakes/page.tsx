'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

const CakesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState([0, 100])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  const categories = [
    { id: 'all', name: 'ყველა ტორტი',  },
    { id: 'birthday', name: 'დაბადების დღე',  },
    { id: 'wedding', name: 'ქორწილი', },
    { id: 'chocolate', name: 'შოკოლადი',  },
    { id: 'fruit', name: 'ხილის',  },
    { id: 'custom', name: 'პერსონალური', },
    { id: 'cupcake', name: 'კაპკეიქები',},
    { id: 'desserts', name: 'დესერტები',  },
  ]

  const topProducts = [
    {
      id: 1,
      name: 'შოკოლადის ოცნების ტორტი',
      price: 45.99,
      image: '/catalog/1.jpg',
      rating: 5
    },
    {
      id: 2,
      name: 'ვანილის ქორწილის ტორტი',
      price: 89.99,
      image: '/catalog/2.jpg',
      rating: 5
    },
    {
      id: 3,
      name: 'მარწყვის სიამოვნება',
      price: 38.99,
      image: '/hero/1.png',
      rating: 5
    }
  ]

  const cakes = [
    {
      id: 1,
      name: 'შოკოლადის ოცნების ტორტი',
      category: 'chocolate',
      price: 45.99,
      rating: 4.8,
      reviews: 127,
      image: '/catalog/1.jpg',
      description: 'მდიდარი შოკოლადის ფენები კრემიანი განაშიით',
      isNew: true,
      isPopular: true
    },
    {
      id: 2,
      name: 'ვანილის ქორწილის ტორტი',
      category: 'wedding',
      price: 89.99,
      rating: 4.9,
      reviews: 89,
      image: '/catalog/2.jpg',
      description: 'ელეგანტური ვანილის ტორტი სპეციალური დღეებისთვის',
      isNew: false,
      isPopular: true
    },
    {
      id: 3,
      name: 'მარწყვის სიამოვნება',
      category: 'fruit',
      price: 38.99,
      rating: 4.7,
      reviews: 156,
      image: '/hero/1.png',
      description: 'ახალი მარწყვი მსუბუქი კრემის შევსებით',
      isNew: true,
      isPopular: false
    },
    {
      id: 4,
      name: 'დაბადების დღის აღნიშვნა',
      category: 'birthday',
      price: 42.99,
      rating: 4.6,
      reviews: 203,
      image: '/hero/2.png',
      description: 'ფერადი დაბადების დღის ტორტი სპრინკლებით',
      isNew: false,
      isPopular: true
    },
    {
      id: 5,
      name: 'წითელი ველვეტის კლასიკა',
      category: 'chocolate',
      price: 49.99,
      rating: 4.8,
      reviews: 178,
      image: '/hero/3.png',
      description: 'კლასიკური წითელი ველვეტი კრემ-ყველის ყინულით',
      isNew: false,
      isPopular: true
    },
    {
      id: 6,
      name: 'ლიმონის ზესტის ტორტი',
      category: 'fruit',
      price: 36.99,
      rating: 4.5,
      reviews: 94,
      image: '/catalog/1.jpg',
      description: 'მოგვიანებული ლიმონის ტორტი ციტრუსის გლაზურით',
      isNew: true,
      isPopular: false
    },
    {
      id: 7,
      name: 'პერსონალური დიზაინის ტორტი',
      category: 'custom',
      price: 75.99,
      rating: 5.0,
      reviews: 67,
      image: '/catalog/2.jpg',
      description: 'პერსონალური ტორტის დიზაინი თქვენი სპეციფიკაციების მიხედვით',
      isNew: false,
      isPopular: true
    },
    {
      id: 8,
      name: 'სტაფილოს ტორტი დელუქს',
      category: 'fruit',
      price: 41.99,
      rating: 4.7,
      reviews: 112,
      image: '/hero/1.png',
      description: 'ტენიანი სტაფილოს ტორტი ნაძვის თხილით და კრემ-ყველით',
      isNew: false,
      isPopular: false
    },
    {
      id: 9,
      name: 'კაპკეიქების კომპლექტი',
      category: 'cupcake',
      price: 28.99,
      rating: 4.4,
      reviews: 89,
      image: '/catalog/1.jpg',
      description: '6 ცალი უნიკალური კაპკეიქი სხვადასხვა გემოთი',
      isNew: true,
      isPopular: false
    },
    {
      id: 10,
      name: 'ტირამისუ',
      category: 'desserts',
      price: 32.99,
      rating: 4.9,
      reviews: 156,
      image: '/catalog/2.jpg',
      description: 'იტალიური ტირამისუ ყავისა და მასკარპონის გემოთი',
      isNew: false,
      isPopular: true
    },
    {
      id: 11,
      name: 'შოკოლადის მაფინები',
      category: 'chocolate',
      price: 24.99,
      rating: 4.6,
      reviews: 78,
      image: '/hero/1.png',
      description: '4 ცალი რბილი შოკოლადის მაფინი',
      isNew: false,
      isPopular: false
    },
    {
      id: 12,
      name: 'ბანანის ტორტი',
      category: 'fruit',
      price: 34.99,
      rating: 4.7,
      reviews: 92,
      image: '/hero/2.png',
      description: 'ტენიანი ბანანის ტორტი კარამელის სოუსით',
      isNew: false,
      isPopular: true
    }
  ]

  // Filter cakes based on category and search
  const filteredCakes = useMemo(() => {
    let filtered = cakes
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(cake => cake.category === selectedCategory)
    }
    
    if (searchQuery) {
      filtered = filtered.filter(cake => 
        cake.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cake.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }, [selectedCategory, searchQuery])

  // Calculate pagination
  const totalPages = Math.ceil(filteredCakes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCakes = filteredCakes.slice(startIndex, endIndex)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of product grid
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Generate page numbers array
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchQuery])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-black'}`}>
        ★
      </span>
    ))
  }

  return (
    <div className="min-h-screen bg-color">
      {/* Hero Section */}
      <section className="relative py-16 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/all/bg_header.jpg')" }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[20px] md:text-[30px] font-bold text-white mb-6 drop-shadow-lg"
          >
            ჩვენი მაღაზია
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[18px] md:text-[20px] text-white max-w-3xl mx-auto drop-shadow-md"
          >
            აღმოაჩინეთ ჩვენი ხელით დამზადებული ტორტების ლამაზი და გემრიელი კოლექცია
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-6">
          <div className="flex flex-col lg:flex-row gap-5">
            
            {/* Left Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                
                {/* Search Product */}
                <div className="mb-8">
                  <h3 className="md:text-[20px] text-[18px] font-semibold text-black mb-4">ძიება</h3>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="მოძებნეთ პროდუქტი..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-4 py-2 w-full border border-gray-300 rounded-l-lg focus:outline-none focus:border-pink-500"
                    />
                    
                  </div>
                </div>

                {/* Product Categories */}
                <div className="mb-8">
                  <h3 className="md:text-[20px] text-[18px] font-semibold text-black mb-4">კატეგორიები</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full cursor-pointer text-left px-3 py-2 rounded-lg transition-colors text-[16px] md:text-[18px] ${
                          selectedCategory === category.id
                            ? 'bg-pink-100 text-pink-700 font-medium'
                            : 'text-black '
                        }`}
                      >
                        {category.name} 
                      </button>
                    ))}
                  </div>
                </div>


                {/* Top Sale Products */}
                <div>
                  <h3 className="md:text-[20px] text-[18px] font-semibold text-black mb-4">ტოპ გაყიდვები</h3>
                  <div className="space-y-4">
                    {topProducts.map((product) => (
                      <div key={product.id} className="flex items-center space-x-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden text-[16px] md:text-[18px]">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="md:text-[18px] text-[16px] font-medium text-black">{product.name}</h4>
                          <div className="flex items-center space-x-1">
                            {renderStars(product.rating)}
                          </div>
                          <p className="md:text-[16px] text-[14px] font-bold text-pink-600">₾{product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Product Grid */}
            <div className="lg:w-3/4">
              {/* Top Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <p className="md:text-[20px] text-[18px] text-black mb-4 sm:mb-0">
                  {filteredCakes.length} პროდუქტი
                </p>
                <select className="md:text-[20px] text-[18px] px-4 py-2 border border-black rounded-lg focus:outline-none focus:border-pink-500">
                  <option>სორტირება: ნაგულისხმევი</option>
                  <option>ფასი: დაბლიდან მაღლა</option>
                  <option>ფასი: მაღლიდან დაბლა</option>
                  <option>პოპულარობა</option>
                </select>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentCakes.map((cake, index) => (
                  <motion.div
                    key={cake.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 overflow-hidden flex-shrink-0">
                      <Image
                        src={cake.image}
                        alt={cake.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                  
                     
                    </div>

                    {/* Product Info */}
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex items-center space-x-1 mb-2">
                        {renderStars(cake.rating)}
                      </div>
                      <h3 className="md:text-[18px] text-[16px] font-semibold text-black mb-2 min-h-[3.5rem] flex items-start leading-tight">
                        {cake.name}
                      </h3>
                      <div className="mt-auto">
                        <p className="md:text-[18px] text-[16px] font-bold text-black mb-4">
                          ₾{cake.price}
                        </p>
                        <button className=" text-center cursor-pointer   md:text-[20px] text-[18px] w-full w-full bg-[#d90b6b] text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-radius:20px  px-4 sm:px-6 md:px-8 py-2 text-white rounded-xl font-bold  transition-all duration-300 transform shadow-lg    ">
                          კალათაში დამატება
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* No Results */}
              {filteredCakes.length === 0 && (
                <div className="text-center py-16">
                  <h3 className="md:text-[18px] text-[16px] font-bold text-black mb-2">პროდუქტი ვერ მოიძებნა</h3>
                  <p className="text-black">სცადეთ ძიების ან ფილტრების შეცვლა</p>
                </div>
              )}

              {/* Pagination */}
              <div className="flex justify-center items-center space-x-2 mt-12">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="md:text-[20px] cursor-pointer text-[18px] px-4 py-2 bg-[#d90b6b] text-white rounded-lg font-medium hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  წინა
                </button>
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                   
                    className={`px-4 py-2 bg-white text-black border border-gray-300 rounded-lg hover:bg-gray-50 ${
                      typeof page === 'number' && page === currentPage
                        ? 'bg-pink-500 text-black font-medium'
                        : 'text-black'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="md:text-[20px] cursor-pointer text-[18px] px-4 py-2 bg-[#d90b6b] text-white rounded-lg font-medium hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  შემდეგი
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CakesPage
