import { NextRequest, NextResponse } from 'next/server';
import { sendAdminNotification } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Contact form received:', body);
    
    const {
      name,
      email,
      phone,
      subject,
      message
    } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send admin notification email
    try {
      const adminEmailData = {
        orderId: null,
        customerName: name,
        customerEmail: email,
        customerPhone: phone || '',
        address: '',
        design: '',
        flavor: '',
        filling: '',
        glaze: '',
        shape: '',
        decorations: [],
        text: '',
        quantity: 0,
        deliveryDate: '',
        deliveryTime: '',
        totalPrice: 0,
        orderDate: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        notes: `Contact Form - Subject: ${subject}\n\nMessage: ${message}`,
        imageUrl: null
      };

      await sendAdminNotification(adminEmailData);
      
      return NextResponse.json({
        success: true,
        message: 'Contact form submitted successfully'
      });

    } catch (emailError) {
      console.error('Error sending admin notification email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email notification' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    );
  }
}
