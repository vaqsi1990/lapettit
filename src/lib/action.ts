"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fetch all cakes with their categories
export async function getCakes() {
  try {
    const cakes = await prisma.cake.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return { success: true, data: cakes };
  } catch (error) {
    console.error('Error fetching cakes:', error);
    return { success: false, error: 'Failed to fetch cakes' };
  }
}

// Fetch cakes by category
export async function getCakesByCategory(category: string) {
  try {
    if (category === 'all') {
      const cakes = await prisma.cake.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      return { success: true, data: cakes };
    }

    const cakes = await prisma.cake.findMany({
      where: {
        category: category as 'BIRTHDAY' | 'WEDDING' | 'ANNIVERSARY' | 'CUSTOM' | 'Desserts'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return { success: true, data: cakes };
  } catch (error) {
    console.error('Error fetching cakes by category:', error);
    return { success: false, error: 'Failed to fetch cakes by category' };
  }
}

// Fetch all unique categories
export async function getCategories() {
  try {
    const categories = await prisma.cake.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });
    
    return { success: true, data: categories };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

// Fetch a single cake by ID
export async function getCakeById(id: number) {
  try {
    const cake = await prisma.cake.findUnique({
      where: {
        id: id
      }
    });
    
    if (!cake) {
      return { success: false, error: 'Cake not found' };
    }
    
    return { success: true, data: cake };
  } catch (error) {
    console.error('Error fetching cake by ID:', error);
    return { success: false, error: 'Failed to fetch cake' };
  }
}

// Search cakes by name or description
export async function searchCakes(query: string) {
  try {
    const cakes = await prisma.cake.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return { success: true, data: cakes };
  } catch (error) {
    console.error('Error searching cakes:', error);
    return { success: false, error: 'Failed to search cakes' };
  }
}
