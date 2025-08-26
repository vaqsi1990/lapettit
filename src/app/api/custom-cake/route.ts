import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      design,
      flavor,
      filling,
      glaze,
      shape,
      decorations,
      text,
      quantity,
      deliveryDate,
      deliveryTime,
      imageUrl,
      customerName,
      customerPhone,
      customerEmail,
      address,
      city,
      zipCode,
      notes,
      totalPrice
    } = body;

    // Validate required fields
    if (!design || !flavor || !quantity || !deliveryDate || !customerName || !customerPhone || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the order first
    const order = await prisma.order.create({
      data: {
        customerName: `${customerName} ${body.lastName || ''}`.trim(),
        customerPhone,
        address: `${address}, ${city || ''}, ${zipCode || ''}`.trim().replace(/^,\s*/, ''),
        total: totalPrice || 0,
        status: 'PENDING'
      }
    });

    // Create the custom cake
    const customCake = await prisma.customCake.create({
      data: {
        design,
        flavor,
        filling: filling || null,
        glaze: glaze || null,
        shape: shape || null,
        decorations: decorations || [],
        text: text || null,
        quantity,
        deliveryDate: new Date(deliveryDate),
        deliveryTime: deliveryTime || null,
        imageUrl: imageUrl || null,
        orderId: order.id
      }
    });

    // Update order with custom cake reference
    await prisma.order.update({
      where: { id: order.id },
      data: {
        customCake: {
          connect: { id: customCake.id }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Custom cake order created successfully',
      orderId: order.id,
      customCakeId: customCake.id
    });

  } catch (error) {
    console.error('Error creating custom cake order:', error);
    return NextResponse.json(
      { error: 'Failed to create custom cake order' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
