import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

