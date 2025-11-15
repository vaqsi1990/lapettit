import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Calculate price based on survey responses
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

    // Get responses
    const piecesResponse = session.responses.find(r => r.questionId === 3);
    const fillingResponse = session.responses.find(r => r.questionId === 5);
    const toppingResponse = session.responses.find(r => r.questionId === 6);

    // Parse pieces from response (e.g., "8-10 ნაჭრიანი" -> 8-10)
    let minPieces = 8;
    let maxPieces = 10;
    
    if (piecesResponse?.selectedOption !== null && piecesResponse?.selectedOption !== undefined) {
      const piecesOptions = ["8-10 ნაჭრიანი", "10-12 ნაჭრიანი", "15-20 ნაჭრიანი", "25-30 ნაჭრიანი"];
      const selectedPieces = piecesOptions[piecesResponse.selectedOption];
      
      if (selectedPieces === "8-10 ნაჭრიანი") {
        minPieces = 8;
        maxPieces = 10;
      } else if (selectedPieces === "10-12 ნაჭრიანი") {
        minPieces = 10;
        maxPieces = 12;
      } else if (selectedPieces === "15-20 ნაჭრიანი") {
        minPieces = 15;
        maxPieces = 20;
      } else if (selectedPieces === "25-30 ნაჭრიანი") {
        minPieces = 25;
        maxPieces = 30;
      }
    }

    // Base prices (default values)
    let marzipanBasePrice = 100;
    let creamBasePrice = 100;

    // Calculate price based on pieces and topping
    let priceRange = { min: 0, max: 0 };
    
    // Get topping (marzipan or cream)
    const topping = toppingResponse?.selectedOption !== null && toppingResponse?.selectedOption !== undefined
      ? (toppingResponse.selectedOption === 0 ? 'cream' : 'marzipan')
      : null;

    // Calculate price ranges
    if (minPieces <= 8) {
      priceRange.min = topping === 'marzipan' ? marzipanBasePrice : creamBasePrice;
      priceRange.max = topping === 'marzipan' ? marzipanBasePrice : creamBasePrice;
    } else if (minPieces <= 10) {
      priceRange.min = (topping === 'marzipan' ? marzipanBasePrice : creamBasePrice) + 30;
      priceRange.max = (topping === 'marzipan' ? marzipanBasePrice : creamBasePrice) + 30;
    } else if (minPieces <= 18) {
      priceRange.min = (topping === 'marzipan' ? marzipanBasePrice : creamBasePrice) + 60;
      priceRange.max = (topping === 'marzipan' ? marzipanBasePrice : creamBasePrice) + 60;
    } else if (minPieces <= 25) {
      priceRange.min = (topping === 'marzipan' ? marzipanBasePrice : creamBasePrice) + 90;
      priceRange.max = (topping === 'marzipan' ? marzipanBasePrice : creamBasePrice) + 90;
    }

    return NextResponse.json({
      success: true,
      priceRange,
      pieces: { min: minPieces, max: maxPieces },
      filling: fillingResponse && fillingResponse.selectedOption !== null ? fillingResponse.answerText : null,
      topping: topping
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

