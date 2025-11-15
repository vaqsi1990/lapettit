import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SURVEY_QUESTIONS } from '@/lib/survey-questions';

// Send calculated price to user and continue survey
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, price } = body;

    if (!sessionId || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Session ID and price are required' },
        { status: 400 }
      );
    }

    // Validate price
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid price value' },
        { status: 400 }
      );
    }

    const session = await prisma.chatSession.findUnique({
      where: { sessionId },
      include: { responses: true }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    console.log('Sending price:', { sessionId, price: priceValue, currentWaitingForPrice: session.waitingForPrice });

    // Update session with calculated price (don't move to next step yet - wait for user to choose continue or not)
    const updatedSession = await prisma.chatSession.update({
      where: { sessionId },
      data: {
        calculatedPrice: priceValue,
        waitingForPrice: false
      }
    });

    console.log('Price sent successfully:', { 
      sessionId, 
      calculatedPrice: updatedSession.calculatedPrice, 
      waitingForPrice: updatedSession.waitingForPrice 
    });

    // Send price message to user
    const priceMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        senderType: 'bot',
        content: `თქვენი ტორტის ფასია: ${parseFloat(price).toFixed(2)} ₾`
      }
    });

    return NextResponse.json({
      success: true,
      session: updatedSession,
      message: priceMessage, // Return the created message
      question: null, // Don't return next question - user will see continue question
      isComplete: updatedSession.isComplete
    });
  } catch (error) {
    console.error('Error sending price:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

