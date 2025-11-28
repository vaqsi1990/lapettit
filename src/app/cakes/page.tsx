'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { getCakes } from '@/lib/action'
import { mapCakeToGalleryImage, type GalleryImage } from '@/lib/utils'
import Link from 'next/link'

const CakesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [cakes, setCakes] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(1000)
  const itemsPerPage = 9

  const categories = [
    { id: 'all', name: 'ყველა ტორტი' },
    { id: 'birthday', name: 'დაბადების დღე' },
    { id: 'wedding', name: 'ქორწილი' },
    { id: 'anniversary', name: 'დღესასწაული' },
    { id: 'custom', name: 'პერსონალური' },
    { id: 'desserts', name: 'დესერტები' },
  ]

  // Fetch cakes from database
  useEffect(() => {
    const fetchCakes = async () => {
      try {
        setLoading(true)
        const result = await getCakes()
        if (result.success && result.data) {
          const mappedCakes = result.data.map(mapCakeToGalleryImage)
          setCakes(mappedCakes)
          
          // Calculate min and max prices from available cakes
          const prices = mappedCakes
            .map(cake => cake.price)
            .filter((price): price is number => price !== undefined && price !== null)
          
          if (prices.length > 0) {
            setMinPrice(Math.floor(Math.min(...prices)))
            setMaxPrice(Math.ceil(Math.max(...prices)))
          }
        }
      } catch (error) {
        console.error('Error fetching cakes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCakes()
  }, [])

  // State for price range filter
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  
  // Update price range when cakes are loaded
  useEffect(() => {
    if (cakes.length > 0) {
      const prices = cakes
        .map(cake => cake.price)
        .filter((price): price is number => price !== undefined && price !== null && price > 0)
      
      if (prices.length > 0) {
        const min = Math.floor(Math.min(...prices))
        const max = Math.ceil(Math.max(...prices))
        setMinPrice(min)
        setMaxPrice(max)
        setPriceRange([min, max])
      }
    }
  }, [cakes])

  // Filter cakes based on category, search, and price
  const filteredCakes = useMemo(() => {
    let filtered = cakes
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(cake => cake.category === selectedCategory)
    }
    
    if (searchQuery) {
      filtered = filtered.filter(cake => 
        cake.titleGeorgian.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Filter by price range
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) {
      filtered = filtered.filter(cake => {
        if (cake.price === undefined || cake.price === null || cake.price === 0) {
          // For customizable cakes without price, include them
          return true
        }
        return cake.price >= priceRange[0] && cake.price <= priceRange[1]
      })
    }
    
    return filtered
  }, [selectedCategory, searchQuery, priceRange, maxPrice, cakes])

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
  }, [selectedCategory, searchQuery, priceRange])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-black'}`}>
        ★
      </span>
    ))
  }

  // Format price display with per-slice information
  const formatPriceDisplay = (cake: GalleryImage) => {
    if (!cake.price) {
      return 'ფასი: ნაჭრების რაოდენობის მიხედვით'
    }

    // For FULL_CAKE with pieces, show total price and price per slice
    if (cake.productType === 'FULL_CAKE' && cake.pieces && cake.pieces > 0) {
      const pricePerSlice = cake.price / cake.pieces
      return `ფასი: ${cake.price}₾ (${pricePerSlice.toFixed(2)}₾ ნაჭერზე)`
    }

    // For INDIVIDUAL_SLICE, show just the price (already per slice)
    if (cake.productType === 'INDIVIDUAL_SLICE') {
      return `ფასი: ${cake.price}₾`
    }

    // For SET or other types, show the price
    return `ფასი: ${cake.price}₾`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">იტვირთება...</p>
        </div>
      </div>
    )
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
                        src={cake.src}
                        alt={cake.titleGeorgian}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-4 flex text-center gap-3 flex-col flex-grow">
                     
                      <h3 className="md:text-[18px] text-[16px] font-semibold text-black   flex mx-auto leading-tight">
                        {cake.titleGeorgian}
                      </h3>
                      <h3 className="md:text-[18px] mb-3 text-[16px] font-semibold text-black   flex mx-auto leading-tight">
                        {formatPriceDisplay(cake)}
                      </h3>

                      <div className="mt-auto mb-3 mt-3">
                       
                        <Link href={`/product/${cake.id}`} className="text-center cursor-pointer md:text-[20px] text-[18px] w-full bg-[#d90b6b] text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        დაათვალიერეთ
                        </Link>
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
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={typeof page !== 'number'}
                    className={`px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
                      typeof page === 'number' && page === currentPage
                        ? 'bg-black text-white font-medium cursor-pointer'
                        : typeof page === 'number'
                        ? 'bg-white text-black hover:bg-gray-50 cursor-pointer'
                        : 'bg-white text-black cursor-default'
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
