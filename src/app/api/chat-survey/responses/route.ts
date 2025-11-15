import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all survey responses
export async function GET(request: NextRequest) {
  try {
    // Use raw SQL to ensure calculatedPrice and waitingForPrice are returned
    // (in case Prisma client hasn't been regenerated after schema changes)
    const sessionsRaw = await prisma.$queryRaw<Array<{
      id: number;
      sessionId: string;
      currentStep: number;
      isComplete: boolean;
      isChatEnded: boolean;
      waitingForPrice: boolean;
      calculatedPrice: number | null;
      productId: number | null;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT 
        id,
        "sessionId",
        "currentStep",
        "isComplete",
        "isChatEnded",
        "waitingForPrice",
        "calculatedPrice",
        "productId",
        "createdAt",
        "updatedAt"
      FROM "ChatSession"
      ORDER BY "createdAt" DESC
    `;

    // Fetch responses and messages for each session
    const sessions = await Promise.all(
      sessionsRaw.map(async (session) => {
        const responses = await prisma.chatResponse.findMany({
          where: { sessionId: session.id },
          orderBy: { questionId: 'asc' }
        });

        const messages = await prisma.chatMessage.findMany({
          where: { sessionId: session.id },
          orderBy: { createdAt: 'asc' }
        });

        return {
          ...session,
          responses,
          messages
        };
      })
    );

    return NextResponse.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

