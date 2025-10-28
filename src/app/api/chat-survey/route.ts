import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Survey questions configuration
export const SURVEY_QUESTIONS = [
  {
    id: 1,
    text: "გატანის თარიღი?",
    type: "text"
  },
  {
    id: 2,
    text: "გატანის დრო?",
    type: "multiple_choice",
    options: [
      "12:00",
      "15:00",
      "18:00",
      "21:00"
    ]
  },
  {
    id: 3,
    text: "რამდენი ნაჭრიანი უნდა იყოს ტორტი",
    type: "multiple_choice",
    options: [
      "8-10 ნაჭრიანი",
      "10-12 ნაჭრიანი",
      "15-20 ნაჭრიანი",
      "25-30 ნაჭრიანი"
    ]
  },
  {
    id: 4,
    text: "ატვირთეთ თქვენი ტორტის იმიჯი ან ინსპირაციის ფოტო (ფაილის ატვირთვა)",
    type: "file"
  },
 
  {
    id:5,
    text: "აირჩიეთ შიგთავსი:",
    type: "multiple_choice",
    options: [
      "ხილის ",
      "შოკოლადის",
      "ფისტის",
      "შავი"
    ]
  },
  {
    id:6,
    text: "აირჩიეთ დაფარვა",
    type: "multiple_choice",
    options: [
      "კრემი",
      "მარცეპანი"
    ]
  },
  {
    id:7,
    text: "აირჩიეთ ბისკვიტი",
    type: "multiple_choice",
    options: [
      "შავი",
      "თეთრი"
    ]
  },
  {
    id:8,
    text: "სახელი/ასაკი სურვილებისამებრ (მაგალითად: სახელი: გიორგი, ასაკი: 10 წლის)",
    type: "text"
  },
  {
    id:9,
    text: "თქვენი სახელი",
    type: "text"
  },
  {
    id:10,
    text: "თქვენი ტელეფონის ნომერი",
    type: "text"
  },  
  {
    id: 11,
    text: "დამატებითი შენიშვნები ან მოთხოვნები:",
    type: "text"
  },
];

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
