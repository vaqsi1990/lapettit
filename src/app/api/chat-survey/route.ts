import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SURVEY_QUESTIONS } from '@/lib/survey-questions';

// Get or create session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, questionId, selectedOption, answerText, fileUrl, fileName } = body;

    // Create new session
    if (action === 'create') {
      const newSession = await prisma.chatSession.create({
        data: {
          sessionId: sessionId || generateSessionId(),
          currentStep: 0,
          isComplete: false
        }
      });

      return NextResponse.json({
        success: true,
        session: newSession,
        question: SURVEY_QUESTIONS[0]
      });
    }

    // Get current question
    if (action === 'get_question') {
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

      const currentQuestion = SURVEY_QUESTIONS[session.currentStep];
      
      return NextResponse.json({
        success: true,
        session,
        question: currentQuestion
      });
    }

    // Submit response
    if (action === 'submit_response') {
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

      const currentQuestion = SURVEY_QUESTIONS[session.currentStep];
      
      // Save the response
      await prisma.chatResponse.create({
        data: {
          sessionId: session.id,
          questionId: currentQuestion.id,
          questionText: currentQuestion.text,
          answerType: currentQuestion.type,
          selectedOption: selectedOption,
          answerText: answerText,
          fileUrl: fileUrl,
          fileName: fileName
        }
      });

      // Move to next question
      const nextStep = session.currentStep + 1;
      const isComplete = nextStep >= SURVEY_QUESTIONS.length;

      const updatedSession = await prisma.chatSession.update({
        where: { sessionId },
        data: {
          currentStep: nextStep,
          isComplete: isComplete
        }
      });

      const nextQuestion = !isComplete ? SURVEY_QUESTIONS[nextStep] : null;

      return NextResponse.json({
        success: true,
        session: updatedSession,
        question: nextQuestion,
        isComplete: isComplete
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Chat survey error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate unique session ID
function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
