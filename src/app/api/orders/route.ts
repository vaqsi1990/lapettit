import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendOrderConfirmation, sendOrderRejection } from '@/lib/emailService';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            cake: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, action } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the order with all related data
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
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            cake: true
          }
        }
      }
    });

    // If order is approved and customer has email, send confirmation
    if (status === 'APPROVED' && order.customerEmail && action === 'approve') {
      try {
        // Regular cake order
        const cake = order.items[0]?.cake;
        if (cake) {
          const emailData = {
            orderId: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            address: order.address,
            cakeName: cake.name,
            quantity: order.items[0].quantity,
            totalPrice: order.total,
            orderDate: order.createdAt.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          };

          await sendOrderConfirmation(emailData);
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the status update if email fails
      }
    }

    // If order is rejected and customer has email, send rejection notification
    if (status === 'REJECTED' && order.customerEmail && action === 'reject') {
      try {
        // Regular cake order rejection
        const cake = order.items[0]?.cake;
        if (cake) {
          const emailData = {
            orderId: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            address: order.address,
            cakeName: cake.name,
            quantity: order.items[0].quantity,
            totalPrice: order.total,
            orderDate: order.createdAt.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          };

          await sendOrderRejection(emailData);
        }
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError);
        // Don't fail the status update if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
