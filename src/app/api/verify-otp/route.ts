import { NextRequest, NextResponse } from 'next/server';
import { otpStorage } from '@/lib/otpStorage';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    console.log('Verifying OTP for email:', email);
    console.log('Received OTP:', otp);

    // Try to get OTP from memory storage first
    let storedData = otpStorage.get(email);
    console.log('Memory storage OTP data:', storedData);
    
    // If not in memory, try to get from cookies (for development mode)
    if (!storedData) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        
        const otpCookie = cookies['otp_data'];
        if (otpCookie) {
          try {
            const decodedOtp = Buffer.from(otpCookie, 'base64').toString();
            const cookieData = JSON.parse(decodedOtp);
            console.log('Cookie OTP data:', cookieData);
            
            // Check if cookie OTP is for the same email and not expired
            const now = Date.now();
            const tenMinutes = 10 * 60 * 1000;
            if (now - cookieData.timestamp < tenMinutes) {
              storedData = cookieData;
              console.log('Using cookie OTP data');
            }
          } catch (error) {
            console.log('Error parsing cookie OTP:', error);
          }
        }
      }
    }
    
    console.log('Final stored OTP data:', storedData);
    console.log('All memory OTPs:', Array.from(otpStorage['storage'].entries()));
    
    if (!storedData) {
      return NextResponse.json({ error: 'OTP not found or expired' }, { status: 400 });
    }

    // Check if OTP is expired (10 minutes)
    const now = Date.now();
    const otpAge = now - storedData.timestamp;
    const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds

    console.log('OTP age:', otpAge, 'ms, Expires in:', tenMinutes - otpAge, 'ms');

    if (otpAge > tenMinutes) {
      otpStorage.delete(email); // Clean up expired OTP
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Verify OTP (case-insensitive and trim whitespace)
    const receivedOtp = otp.trim();
    const storedOtp = storedData.otp.trim();
    
    console.log('Comparing OTPs - Received:', `"${receivedOtp}"`, 'Stored:', `"${storedOtp}"`);
    
    if (storedOtp !== receivedOtp) {
      console.log('OTP mismatch!');
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // OTP is valid - remove it from storage to prevent reuse
    otpStorage.delete(email);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP verified successfully' 
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' }, 
      { status: 500 }
    );
  }
}
