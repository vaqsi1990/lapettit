import { Cake } from '@prisma/client';

export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: string;
  categoryGeorgian: string;
  title: string;
  titleGeorgian: string;
  likes?: number;
  comments?: number;
  isCustomizable?: boolean;
  pieces?: number;
  fillings?: string[];
  hasMarzipan?: boolean;
  marzipanPrice?: number;
  hasCream?: boolean;
  creamPrice?: number;
  price?: number; // Standard price for non-customizable cakes
  productType?: string; // FULL_CAKE, SET, INDIVIDUAL_SLICE
  setItems?: string[]; // Items in the set
  setDescription?: string; // Description for sets
  sliceWeight?: string; // Weight for individual slices
  sliceDescription?: string; // Description for individual slices
}

export interface Category {
  id: string;
  name: string;
  nameGeorgian: string;
  count: number;
}

// Map Prisma Cake to GalleryImage format
export function mapCakeToGalleryImage(cake: Cake): GalleryImage {
  const categoryMap: Record<string, { name: string; nameGeorgian: string }> = {
    'BIRTHDAY': { name: 'Birthday', nameGeorgian: 'დაბადების დღე' },
    'WEDDING': { name: 'Wedding', nameGeorgian: 'ქორწილი' },
    'ANNIVERSARY': { name: 'Anniversary', nameGeorgian: 'დღესასწაული' },
    'CUSTOM': { name: 'Custom', nameGeorgian: 'ინდივიდუალური' },
    'Desserts': { name: 'Desserts', nameGeorgian: 'დესერტები' }
  };

  const category = categoryMap[cake.category] || { name: cake.category, nameGeorgian: cake.category };

  return {
    id: cake.id,
    src: cake.imageUrl || '/catalog/1.jpg', // fallback image
    alt: cake.name,
    category: cake.category.toLowerCase(),
    categoryGeorgian: category.nameGeorgian,
    title: cake.name,
    titleGeorgian: cake.name, // You can add Georgian titles to your schema later
    likes: Math.floor(Math.random() * 200) + 50, // Random likes for demo
    comments: Math.floor(Math.random() * 50) + 10, // Random comments for demo
    isCustomizable: cake.isCustomizable,
    pieces: cake.pieces ?? undefined,
    fillings: cake.fillings,
    hasMarzipan: cake.hasMarzipan,
    marzipanPrice: cake.marzipanPrice ?? undefined,
    hasCream: cake.hasCream,
    creamPrice: cake.creamPrice ?? undefined,
    price: cake.price ?? undefined,
    productType: cake.productType,
    setItems: cake.setItems ?? undefined,
    setDescription: cake.setDescription ?? undefined,
    sliceWeight: cake.sliceWeight ?? undefined,
    sliceDescription: cake.sliceDescription ?? undefined
  };
}

// Create categories array for the Gallery component
export function createCategories(): Category[] {
  return [
    { id: 'birthday', name: 'Birthday', nameGeorgian: 'დაბადების დღე', count: 0 },
    { id: 'wedding', name: 'Wedding', nameGeorgian: 'ქორწილი', count: 0 },
    { id: 'anniversary', name: 'Anniversary', nameGeorgian: 'დღესასწაული', count: 0 },
    { id: 'custom', name: 'Custom', nameGeorgian: 'ინდივიდუალური', count: 0 },
    { id: 'desserts', name: 'Desserts', nameGeorgian: 'დესერტები', count: 0 }
  ];
}

// Update category counts based on actual cake data
export function updateCategoryCounts(categories: Category[], cakes: Cake[]): Category[] {
  const counts = cakes.reduce((acc, cake) => {
    const categoryKey = cake.category.toLowerCase();
    acc[categoryKey] = (acc[categoryKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return categories.map(category => ({
    ...category,
    count: category.id === 'all' ? cakes.length : (counts[category.id] || 0)
  }));
}

// Utility function to properly round prices and avoid floating point errors
export function roundPrice(price: number): number {
  return Math.round(price * 100) / 100;
}

// Format price for display with proper rounding
export function formatPrice(price: number): string {
  return `₾${roundPrice(price).toFixed(2)}`;
}

// Calculate total price with proper rounding
export function calculateTotalPrice(basePrice: number, quantity: number): number {
  return roundPrice(basePrice * quantity);
}