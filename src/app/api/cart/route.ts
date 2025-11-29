import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CartItem {
  id: string;
  cakeId: number;
  quantity: number;
  price: number;
  pieces?: number;
  topping?: 'marzipan' | 'cream' | null;
  filling?: string;
  cakeName?: string;
  age?: string;
  position?: 'bottom' | 'center' | 'top';
  productName?: string;
  productImage?: string;
  productType?: string;
}

// GET - Get all cart items (reads from request body since localStorage is client-side)
export async function GET(request: NextRequest) {
  try {
    // Cart items are sent from client in request body or query
    const { searchParams } = new URL(request.url);
    const cartItemsJson = searchParams.get('items');
    
    let cartItems: CartItem[] = [];
    
    if (cartItemsJson) {
      try {
        cartItems = JSON.parse(decodeURIComponent(cartItemsJson));
      } catch (error) {
        console.error('Error parsing cart items:', error);
      }
    }
    
    // Fetch product details for each cart item
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        try {
          const cake = await prisma.cake.findUnique({
            where: { id: item.cakeId }
          });
          
          if (!cake) {
            return null;
          }
          
          return {
            ...item,
            productName: cake.name,
            productImage: cake.imageUrl || '/catalog/1.jpg',
            productType: cake.productType
          };
        } catch (error) {
          console.error(`Error fetching cake ${item.cakeId}:`, error);
          return item;
        }
      })
    );
    
    const validItems = itemsWithDetails.filter(item => item !== null) as CartItem[];
    
    // Calculate total
    const total = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return NextResponse.json({
      success: true,
      data: {
        items: validItems,
        total: Math.round(total * 100) / 100,
        count: validItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST - Validate and return product details for cart item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cakeId } = body;
    
    // Validate required fields
    if (!cakeId) {
      return NextResponse.json(
        { success: false, error: 'cakeId is required' },
        { status: 400 }
      );
    }
    
    // Verify cake exists and return details
    const cake = await prisma.cake.findUnique({
      where: { id: cakeId }
    });
    
    if (!cake) {
      return NextResponse.json(
        { success: false, error: 'Cake not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        productName: cake.name,
        productImage: cake.imageUrl || '/catalog/1.jpg',
        productType: cake.productType
      }
    });
  } catch (error) {
    console.error('Error validating cart item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate cart item' },
      { status: 500 }
    );
  }
}

// PUT - Validate cart item (client handles updates in localStorage)
export async function PUT(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Cart updates are handled client-side'
  });
}

// DELETE - Validate deletion (client handles deletion in localStorage)
export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Cart deletions are handled client-side'
  });
}

