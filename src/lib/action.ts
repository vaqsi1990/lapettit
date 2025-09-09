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

// Search cakes by name
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

export async function getOrders() {
  try {
    const response = await fetch(`${process.env.BASE_URL || 'http://localhost:3000'}/api/orders`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, error: 'Failed to fetch orders' };
  }
}

// Delete a cake by ID
export async function deleteCake(id: number) {
  try {
    // First check if the cake exists
    const cake = await prisma.cake.findUnique({
      where: { id },
      include: {
        orders: true
      }
    });

    if (!cake) {
      return { success: false, error: 'Cake not found' };
    }

    // Check if the cake is used in any orders
    if (cake.orders.length > 0) {
      return { success: false, error: 'Cannot delete cake that is used in orders' };
    }

    // Delete the cake
    await prisma.cake.delete({
      where: { id }
    });

    return { success: true, message: 'Cake deleted successfully' };
  } catch (error) {
    console.error('Error deleting cake:', error);
    return { success: false, error: 'Failed to delete cake' };
  }
}

// Delete an order by ID
export async function deleteOrder(id: number) {
  try {
    // First check if the order exists
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true
      }
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Delete related records first to avoid foreign key constraint violations
    // Delete order items first
    if (order.items && order.items.length > 0) {
      await prisma.orderItem.deleteMany({
        where: { orderId: id }
      });
    }

    // Custom cake functionality is now integrated into the main Cake model
    // No separate customCake deletion needed

    // Now delete the order
    await prisma.order.delete({
      where: { id }
    });

    return { success: true, message: 'Order deleted successfully' };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { success: false, error: 'Failed to delete order' };
  }
}
