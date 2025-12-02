import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendUserStartingFormNotification } from '@/lib/emailService';

// Send notification when user starts filling form (responds "კი")
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verify session exists
    const session = await prisma.chatSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Send email notification to admins
    const emailResult = await sendUserStartingFormNotification(sessionId);

    if (!emailResult.success) {
      console.error('Failed to send email notification:', emailResult.error);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Error sending start notification:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

