import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendOrderConfirmation } from '@/lib/emailService';

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
      notes,
      totalPrice,
      cakeName,
      age,
      position
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

    const finalTotal = totalPrice ? Math.round(totalPrice * 100) / 100 : 0;

    // Create the order
    const order = await prisma.order.create({
      data: {
        customerName: `${customerName} ${body.lastName || ''}`.trim(),
        customerPhone,
        customerEmail: customerEmail || null,
        address: `${address}, ${city || ''}`.trim().replace(/^,\s*/, ''),
        total: finalTotal,
        status: 'PENDING'
      }
    });

    // Create the order item
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        cakeId: cakeId,
        quantity: quantity,
        cakeName: cake.isCustomizable ? (cakeName || null) : null,
        age: cake.isCustomizable ? (age || null) : null,
        position: cake.isCustomizable ? (position || null) : null
      }
    });

    // Admin notification email will be sent when receipt is uploaded (in /api/orders/confirm route)
    
    // Send customer confirmation email if email is provided
    if (customerEmail) {
      try {
        const customerEmailData = {
          orderId: order.id,
          customerName: order.customerName,
          customerEmail: customerEmail,
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
          })
        };

        await sendOrderConfirmation(customerEmailData);
      } catch (customerEmailError) {
        console.error('Error sending customer confirmation email:', customerEmailError);
        // Don't fail the order if customer email fails
      }
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
