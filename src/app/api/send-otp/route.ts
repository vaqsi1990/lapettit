import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { otpStorage } from '@/lib/otpStorage';

export async function POST(request: NextRequest) {
  try {
    const { email, customerName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp, 'for email:', email);
    
    // Store OTP with timestamp (expires in 10 minutes)
    otpStorage.set(email, otp);
    console.log('OTP stored successfully');
    
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Email credentials not configured');
      return NextResponse.json(
        { error: 'Email service not configured' }, 
        { status: 500 }
      );
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'ერთჯერად კოდი შეკვეთისთვის',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d90b6b; text-align: center;">OTP კოდი</h2>
          <p>გამარჯობა ${customerName || 'ძვირფასო კლიენტო'}!</p>
          <p>თქვენი OTP კოდი ტორტის შეკვეთის დასასრულებლად:</p>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <h1 style="color: #d90b6b; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p><strong>შენიშვნა:</strong> ეს კოდი ვალიდურია 10 წუთის განმავლობაში.</p>
          <p>თუ თქვენ არ გააკეთეთ ეს მოთხოვნა, გთხოვთ უგულებელყოთ ეს წერილი.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            ეს არის ავტომატური წერილი, გთხოვთ არ უპასუხოთ.
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', email);
    
    // Also store in a more persistent way for development
    const otpData = { otp, timestamp: Date.now() };
    const otpString = JSON.stringify(otpData);
    const encodedOtp = Buffer.from(otpString).toString('base64');
    
    // Set cookie that will be available across server instances
    const response = NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      otp: otp // Include OTP in response for local storage backup
    });
    
    response.cookies.set('otp_data', encodedOtp, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 600 // 10 minutes
    });
    
    return response;

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' }, 
      { status: 500 }
    );
  }
}
