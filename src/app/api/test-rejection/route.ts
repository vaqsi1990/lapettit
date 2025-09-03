import { NextRequest, NextResponse } from 'next/server';
import { sendOrderRejection } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderData, isCustomCake } = body;

    if (!orderData || !orderData.customerEmail) {
      return NextResponse.json(
        { error: 'Missing required order data or customer email' },
        { status: 400 }
      );
    }

    // Send rejection email
    const result = await sendOrderRejection(orderData, isCustomCake);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Rejection email sent successfully',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error testing rejection email:', error);
    return NextResponse.json(
      { error: 'Failed to send test rejection email' },
      { status: 500 }
    );
  }
}
