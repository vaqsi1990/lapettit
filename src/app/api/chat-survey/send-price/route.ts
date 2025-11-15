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

    // Update session with calculated price (don't move to next step yet - wait for user to choose continue or not)
    // Use raw SQL to update fields that might not be in Prisma schema yet
    await prisma.$executeRaw`
      UPDATE "ChatSession"
      SET "calculatedPrice" = ${parseFloat(price)}::float,
          "waitingForPrice" = false
      WHERE "sessionId" = ${sessionId}
    `;

    const updatedSession = await prisma.chatSession.findUnique({
      where: { sessionId }
    });

    if (!updatedSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found after update' },
        { status: 404 }
      );
    }

    // Send price message to user
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        senderType: 'bot',
        content: `თქვენი ტორტის ფასია: ${parseFloat(price).toFixed(2)} ₾`
      }
    });

    return NextResponse.json({
      success: true,
      session: updatedSession,
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

