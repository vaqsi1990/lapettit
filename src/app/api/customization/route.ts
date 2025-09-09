import { NextRequest, NextResponse } from 'next/server';

// Store customization data in memory with expiration (in production, use Redis or database)
interface CustomizationData {
  cakeId: number;
  price: number;
  pieces: number;
  topping: string;
  filling: string;
  createdAt: Date;
}

const customizationStore = new Map<string, { data: CustomizationData; expires: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of customizationStore.entries()) {
    if (value.expires < now) {
      customizationStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cakeId, price, pieces, topping, filling } = body;

    // Generate a unique key for this customization
    const customizationId = `${cakeId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store the customization data with 1 hour expiration
    customizationStore.set(customizationId, {
      data: {
        cakeId,
        price,
        pieces,
        topping,
        filling,
        createdAt: new Date()
      },
      expires: Date.now() + (60 * 60 * 1000) // 1 hour
    });

    return NextResponse.json({
      success: true,
      customizationId
    });

  } catch (error) {
    console.error('Error storing customization:', error);
    return NextResponse.json(
      { error: 'Failed to store customization' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customizationId = searchParams.get('id');

    if (!customizationId) {
      return NextResponse.json(
        { error: 'Customization ID is required' },
        { status: 400 }
      );
    }

    const customizationEntry = customizationStore.get(customizationId);

    if (!customizationEntry) {
      return NextResponse.json(
        { error: 'Customization not found' },
        { status: 404 }
      );
    }

    // Check if expired
    if (customizationEntry.expires < Date.now()) {
      customizationStore.delete(customizationId);
      return NextResponse.json(
        { error: 'Customization expired' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: customizationEntry.data
    });

  } catch (error) {
    console.error('Error retrieving customization:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve customization' },
      { status: 500 }
    );
  }
}
