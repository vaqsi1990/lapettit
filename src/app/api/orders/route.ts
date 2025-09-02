import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendOrderConfirmation, sendAdminNotification } from '@/lib/emailService';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            cake: true
          }
        },
        customCake: true
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
        },
        customCake: true
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
        },
        customCake: true
      }
    });

    // If order is approved and customer has email, send confirmation
    if (status === 'APPROVED' && order.customerEmail && action === 'approve') {
      try {
        if (order.customCake) {
          // Custom cake order
          const emailData = {
            orderId: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            address: order.address,
            design: order.customCake.design,
            flavor: order.customCake.flavor,
            filling: order.customCake.filling,
            glaze: order.customCake.glaze,
            shape: order.customCake.shape,
            decorations: order.customCake.decorations,
            text: order.customCake.text,
            quantity: order.customCake.quantity,
            deliveryDate: order.customCake.deliveryDate,
            deliveryTime: order.customCake.deliveryTime,
            totalPrice: order.total,
            orderDate: order.createdAt.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          };

          await sendOrderConfirmation(emailData, true);
        } else {
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
              }),
              notes: ''
            };

            await sendOrderConfirmation(emailData, false);
          }
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
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
