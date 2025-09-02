import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendAdminNotification } from '@/lib/emailService';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      cakeId,
      quantity,
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
    if (!cakeId || !quantity || !customerName || !customerPhone || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get cake details to calculate total if not provided
    const cake = await prisma.cake.findUnique({
      where: { id: cakeId }
    });

    if (!cake) {
      return NextResponse.json(
        { error: 'Cake not found' },
        { status: 404 }
      );
    }

    const finalTotal = totalPrice || (cake.price * quantity);

    // Create the order
    const order = await prisma.order.create({
      data: {
        customerName: `${customerName} ${body.lastName || ''}`.trim(),
        customerPhone,
        customerEmail: customerEmail || null,
        address: `${address}, ${city || ''}, ${zipCode || ''}`.trim().replace(/^,\s*/, ''),
        total: finalTotal,
        status: 'PENDING'
      }
    });

    // Create the order item
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        cakeId: cakeId,
        quantity: quantity
      }
    });

    // Send admin notification email only
    try {
      const adminEmailData = {
        orderId: order.id,
        customerName: order.customerName,
        customerEmail: customerEmail || '',
        customerPhone: order.customerPhone,
        address: order.address,
        cakeName: cake.name,
        quantity: quantity,
        totalPrice: finalTotal,
        orderDate: order.createdAt.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        notes: notes
      };

      await sendAdminNotification(adminEmailData, false);
    } catch (adminEmailError) {
      console.error('Error sending admin notification email:', adminEmailError);
      // Don't fail the order if admin email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully and pending admin approval',
      orderId: order.id,
      orderItemId: orderItem.id,
      total: finalTotal
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
