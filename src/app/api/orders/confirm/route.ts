import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendAdminNotification } from '@/lib/emailService';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, receiptImageUrl } = body;

    if (!orderId || !receiptImageUrl) {
      return NextResponse.json(
        { success: false, error: 'orderId and receiptImageUrl are required' },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            cake: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status to APPROVED
    // Store receipt image URL in address field (temporary solution)
    // You can add a receiptImageUrl field to Order model later
    const receiptNote = `ReceiptImage: ${receiptImageUrl}`;
    const updatedAddress = order.address.includes('ReceiptImage:') 
      ? order.address.replace(/ReceiptImage:.*/, receiptNote)
      : `${order.address} | ${receiptNote}`;
    
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'APPROVED',
        address: updatedAddress
      }
    });

    // Send admin notification email with receipt
    try {
      const cake = order.items[0]?.cake;
      if (cake) {
        const adminEmailData = {
          orderId: order.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail || '',
          customerPhone: order.customerPhone,
          address: order.address.split(' | ReceiptImage:')[0].trim(), // Remove receipt note from address for email
          cakeName: cake.name,
          quantity: order.items[0].quantity,
          totalPrice: order.total,
          orderDate: order.createdAt.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          receiptImageUrl: receiptImageUrl,
          notes: order.notes || undefined,
          cakePersonalization: {
            productType: cake.productType ? String(cake.productType) : undefined,
            pieces: cake.pieces || undefined,
            fillings: order.items[0].filling ? [order.items[0].filling] : (cake.fillings && cake.fillings.length > 0 ? cake.fillings : undefined),
            hasMarzipan: cake.hasMarzipan || undefined,
            marzipanPrice: cake.marzipanPrice || undefined,
            hasCream: cake.hasCream || undefined,
            creamPrice: cake.creamPrice || undefined,
            ...(cake.isCustomizable && order.items[0] ? {
              name: order.items[0].cakeName || undefined,
              age: order.items[0].age || undefined,
              position: order.items[0].position || undefined
            } : {})
          }
        };

        await sendAdminNotification(adminEmailData);
      }
    } catch (adminEmailError) {
      console.error('Error sending admin notification email with receipt:', adminEmailError);
      // Don't fail the confirmation if admin email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Order confirmed successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error confirming order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to confirm order' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

