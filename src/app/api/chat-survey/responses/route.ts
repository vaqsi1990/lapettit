import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all survey responses
export async function GET(request: NextRequest) {
  try {
    // Fetch all data in parallel with a single query using Prisma's include
    // This is much faster than fetching responses and messages separately for each session
    const sessions = await prisma.chatSession.findMany({
      include: {
        responses: {
          orderBy: {
            questionId: 'asc'
          }
        },
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Log sessions with price info for debugging
    const sessionsWithPrice = sessions.filter(s => s.waitingForPrice || s.calculatedPrice);
    if (sessionsWithPrice.length > 0) {
      console.log('Sessions with price info:', sessionsWithPrice.map(s => ({
        sessionId: s.sessionId,
        calculatedPrice: s.calculatedPrice,
        waitingForPrice: s.waitingForPrice
      })));
    }

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

