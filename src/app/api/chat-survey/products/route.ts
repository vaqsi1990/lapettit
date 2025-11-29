import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all products for chatbot knowledge base
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const productId = searchParams.get('id');

    // Get single product by ID
    if (productId) {
      const product = await prisma.cake.findUnique({
        where: { id: parseInt(productId) }
      });

      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: product
      });
    }

    // Search products
    if (search) {
      const products = await prisma.cake.findMany({
        where: {
          AND: [
            { available: true },
            {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: 'insensitive'
                  }
                },
                {
                  fillings: {
                    hasSome: [search]
                  }
                }
              ]
            }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({
        success: true,
        data: products
      });
    }

    // Get products by category
    if (category) {
      const products = await prisma.cake.findMany({
        where: {
          available: true,
          category: category as any
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({
        success: true,
        data: products
      });
    }

    // Get all available products
    const products = await prisma.cake.findMany({
      where: {
        available: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products for chatbot:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

