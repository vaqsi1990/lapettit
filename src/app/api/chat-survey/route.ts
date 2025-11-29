import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SURVEY_QUESTIONS } from '@/lib/survey-questions';
import type { Cake, ChatResponse } from '@prisma/client';

// Helper function to get next question based on product type and previous answers
function getNextQuestionForProduct(
  currentQuestionId: number,
  selectedOption: number | null,
  productDetails: Cake | null,
  responses: ChatResponse[]
): number | null {
  // If no product details, use default flow
  if (!productDetails) return null;

  const productType = productDetails.productType;
  const isCustomizable = productDetails.isCustomizable;

  // For SET, INDIVIDUAL_SLICE, or non-customizable products
  const needsDeliveryQuestion = 
    productType === 'SET' || 
    productType === 'INDIVIDUAL_SLICE' || 
    !isCustomizable;

  // Question 17: როგორ ურჩევნია (მიტანის სერვისი თუ ადგილზე მისვლით)
  if (currentQuestionId === 17) {
    if (selectedOption === 0) {
      // მიტანის სერვისი - next: თარიღი (18), then დრო (19)
      return 18;
    } else if (selectedOption === 1) {
      // ადგილზე მისვლით - next: გატანის დრო (2)
      return 2;
    }
  }

  // Question 18: მიტანის თარიღი
  if (currentQuestionId === 18) {
    // Next: მიტანის დრო (19)
    return 19;
  }

  // Question 19: მიტანის დრო
  if (currentQuestionId === 19) {
    // After delivery time, continue with normal flow
    return null;
  }

  // Question 2: გატანის დრო (for pickup)
  if (currentQuestionId === 2) {
    // After pickup time, continue with normal flow
    return null;
  }

  // Check if we need to insert delivery question
  // After question 15 (როგორ გსურთ გაგრძელება) if user selected to continue with bot
  if (currentQuestionId === 15 && selectedOption === 0 && needsDeliveryQuestion) {
    // Check if delivery question already answered
    const deliveryResponse = responses.find(r => r.questionId === 17);
    if (!deliveryResponse) {
      return 17; // Ask delivery question
    }
  }

  return null; // Use default flow
}

// Get or create session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, questionId, selectedOption, answerText, fileUrl, fileName } = body;

    // Create new session
    if (action === 'create') {
      const { productId } = body;
      const newSession = await prisma.chatSession.create({
        data: {
          sessionId: sessionId || generateSessionId(),
          currentStep: 0,
          isComplete: false,
          productId: productId || null
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

      // Fetch product details if productId exists
      let productDetails: Cake | null = null;
      if (session.productId) {
        try {
          const product = await prisma.cake.findUnique({
            where: { id: session.productId }
          });
          if (product) {
            productDetails = product;
          }
        } catch (error) {
          console.error('Error fetching product details:', error);
        }
      }

      let currentStep = session.currentStep;
      let currentQuestion: typeof SURVEY_QUESTIONS[number] | undefined = SURVEY_QUESTIONS[currentStep];
      
      // Skip questions that don't apply to this product type
      if (productDetails && productDetails.productType === 'SET') {
        // Skip question 5 (შიგთავსი), 6 (დაფარვა), 7 (ბისკვიტი) for SET products
        while (currentStep < SURVEY_QUESTIONS.length) {
          const question = SURVEY_QUESTIONS[currentStep];
          if (question && (question.id === 5 || question.id === 6 || question.id === 7)) {
            currentStep = currentStep + 1;
            if (currentStep < SURVEY_QUESTIONS.length) {
              currentQuestion = SURVEY_QUESTIONS[currentStep];
            } else {
              currentQuestion = undefined;
              break;
            }
          } else {
            break;
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        session,
        question: currentQuestion || null
      });
    }

    // Complete survey
    if (action === 'complete_survey') {
      const session = await prisma.chatSession.findUnique({
        where: { sessionId }
      });

      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }

      const updatedSession = await prisma.chatSession.update({
        where: { sessionId },
        data: {
          isComplete: true
        }
      });

      return NextResponse.json({
        success: true,
        session: updatedSession
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

      // Fetch product details if productId exists
      let productDetails: Cake | null = null;
      if (session.productId) {
        try {
          const product = await prisma.cake.findUnique({
            where: { id: session.productId }
          });
          if (product) {
            productDetails = product;
          }
        } catch (error) {
          console.error('Error fetching product details:', error);
        }
      }

      // Find current question by ID (not by step index) because question 16 is special
      // If questionId is provided, use it to find the question (this is more reliable)
      let currentQuestion;
      const question16Index = SURVEY_QUESTIONS.findIndex(q => q.id === 16);
      
      // If questionId is provided, use it to find the question
      if (questionId) {
        currentQuestion = SURVEY_QUESTIONS.find(q => q.id === questionId);
        console.log('=== API: Finding question by ID ===', {
          questionId,
          found: !!currentQuestion,
          currentQuestionId: currentQuestion?.id,
          currentQuestionText: currentQuestion?.text
        });
      }
      
      // If question not found by ID, try to find by currentStep
      if (!currentQuestion) {
        // Check if we're actually on question 16 (even if currentStep doesn't match)
        // This happens when question 16 is shown after price calculation
        if (session.currentStep < SURVEY_QUESTIONS.length && SURVEY_QUESTIONS[session.currentStep]?.id === 16) {
          currentQuestion = SURVEY_QUESTIONS[question16Index];
          console.log('=== API: Detected question 16 by currentStep ===', {
            sessionCurrentStep: session.currentStep,
            question16Index,
            currentQuestionId: currentQuestion?.id
          });
        } else if (session.currentStep < SURVEY_QUESTIONS.length) {
          currentQuestion = SURVEY_QUESTIONS[session.currentStep];
        } else {
          // If currentStep is out of bounds, find question 16 (continue question)
          currentQuestion = SURVEY_QUESTIONS.find(q => q.id === 16);
        }
      }
      
      if (!currentQuestion) {
        return NextResponse.json(
          { success: false, error: 'Question not found' },
          { status: 404 }
        );
      }
      
      console.log('=== API: Current question determined ===', {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        sessionCurrentStep: session.currentStep,
        questionIdParam: questionId
      });
      
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

      // Special handling for question 3 (რამდენი ნაჭრიანი) - pause for price calculation
      // Special handling for question 15 (როგორ გსურთ გაგრძელება?)
      // If user selects "მინდა დაველოდო ადმინისტრატორს" (option index 1), end survey and go to live chat
      // If user selects "შეკვეთის ფორმის შევსება ბოტის დახმარებით" (option index 0), continue with questions
      // Special handling for question 16 (გავაგრძელოთ თუ არა?)
      // If user selects "კი" (option index 0), continue survey - skip question 16 and go to next real question
      // If user selects "არა" (option index 1), end survey
      let isComplete = false;
      let nextStep = session.currentStep + 1;
      let waitingForPrice = false;
      
      // Check if we need to insert product-specific questions
      const nextQuestionId = getNextQuestionForProduct(
        currentQuestion.id,
        selectedOption,
        productDetails,
        session.responses
      );
      
      if (nextQuestionId !== null) {
        // Find the index of the next question by ID
        const nextQuestionIndex = SURVEY_QUESTIONS.findIndex(q => q.id === nextQuestionId);
        if (nextQuestionIndex !== -1) {
          nextStep = nextQuestionIndex;
        }
      }
      
      if (currentQuestion.id === 3) {
        // After question 3 (pieces), pause for price calculation
        waitingForPrice = true;
        nextStep = session.currentStep; // Don't move to next question yet
      } else if (currentQuestion.id === 16 && selectedOption === 0) {
        // User selected "კი" - continue survey
        console.log('=== API: Question 16 - User selected "კი" ===');
        console.log('Current session state:', {
          currentStep: session.currentStep,
          currentQuestionId: currentQuestion.id,
          currentQuestionText: currentQuestion.text
        });
        // Find the index of question 16 and skip to the next question after it
        const question16Index = SURVEY_QUESTIONS.findIndex(q => q.id === 16);
        console.log('Question 16 index in SURVEY_QUESTIONS:', question16Index);
        if (question16Index !== -1) {
          nextStep = question16Index + 1; // Skip question 16 and go to next question
          console.log('Next step will be:', nextStep, 'which is question:', SURVEY_QUESTIONS[nextStep]?.id, SURVEY_QUESTIONS[nextStep]?.text);
        } else {
          nextStep = session.currentStep + 1;
          console.log('Question 16 not found, using currentStep + 1:', nextStep);
        }
        isComplete = false;
      } else if (currentQuestion.id === 16 && selectedOption === 1) {
        // User selected "არა" - end survey
        isComplete = true;
        nextStep = session.currentStep; // Don't move to next question
      } else if (currentQuestion.id === 15 && selectedOption === 1) {
        // User wants to wait for admin - end survey and enable live chat
        isComplete = true;
        nextStep = session.currentStep; // Don't move to next question
      } else if (currentQuestion.id === 15 && selectedOption === 0) {
        // User wants to continue with bot form - check if we need delivery question
        isComplete = false;
        // Check if product needs delivery question (SET, INDIVIDUAL_SLICE, or non-customizable)
        const needsDeliveryQuestion = productDetails && (
          productDetails.productType === 'SET' || 
          productDetails.productType === 'INDIVIDUAL_SLICE' || 
          !productDetails.isCustomizable
        );
        if (needsDeliveryQuestion) {
          // Check if delivery question already answered
          const deliveryResponse = session.responses.find((r: ChatResponse) => r.questionId === 17);
          if (!deliveryResponse) {
            // Insert delivery question (17)
            const deliveryQuestionIndex = SURVEY_QUESTIONS.findIndex(q => q.id === 17);
            if (deliveryQuestionIndex !== -1) {
              nextStep = deliveryQuestionIndex;
            } else {
              nextStep = session.currentStep + 1;
            }
          } else {
            // Delivery question already answered, continue with normal flow
            nextStep = session.currentStep + 1;
          }
        } else {
          nextStep = session.currentStep + 1;
        }
      } else {
        // Normal flow - move to next question
        nextStep = session.currentStep + 1;
        isComplete = nextStep >= SURVEY_QUESTIONS.length;
      }

      // Skip questions that don't apply to this product type before updating session
      let finalNextStep = nextStep;
      if (productDetails && productDetails.productType === 'SET') {
        // Skip question 5 (შიგთავსი), 6 (დაფარვა), 7 (ბისკვიტი) for SET products
        while (finalNextStep < SURVEY_QUESTIONS.length) {
          const nextQuestion = SURVEY_QUESTIONS[finalNextStep];
          if (nextQuestion && (nextQuestion.id === 5 || nextQuestion.id === 6 || nextQuestion.id === 7)) {
            finalNextStep = finalNextStep + 1;
          } else {
            break;
          }
        }
        // Update isComplete if we skipped to the end
        if (finalNextStep >= SURVEY_QUESTIONS.length) {
          isComplete = true;
        }
      }
      
      const updatedSession = await prisma.chatSession.update({
        where: { sessionId },
        data: {
          currentStep: finalNextStep,
          isComplete: isComplete,
          waitingForPrice: waitingForPrice
        }
      });

      // Save bot message to database
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          senderType: 'bot',
          content: currentQuestion.text
        }
      });

      // Save user response as message
      let userMessageContent = '';
      if (currentQuestion.type === 'multiple_choice' && selectedOption !== null) {
        userMessageContent = currentQuestion.options?.[selectedOption] || '';
      } else if (currentQuestion.type === 'text' && answerText) {
        userMessageContent = answerText;
      } else if (currentQuestion.type === 'file' && fileUrl) {
        userMessageContent = 'ფაილი ატვირთულია';
      }

      if (userMessageContent) {
        await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            senderType: 'user',
            content: userMessageContent,
            fileUrl: fileUrl || null,
            fileName: fileName || null
          }
        });
      }

      // Survey completion logged (WhatsApp notification removed)
      if (isComplete) {
        console.log('Survey completed:', {
          sessionId: session.sessionId,
          productId: session.productId
        });
      }

      // Get next question, skipping questions that don't apply to this product type
      let nextQuestion = null;
      if (!isComplete && finalNextStep < SURVEY_QUESTIONS.length) {
        nextQuestion = SURVEY_QUESTIONS[finalNextStep];
      }

      console.log('=== API: Final response ===', {
        nextStep,
        nextQuestionId: nextQuestion?.id,
        nextQuestionText: nextQuestion?.text,
        isComplete,
        updatedSessionCurrentStep: updatedSession.currentStep,
        totalQuestions: SURVEY_QUESTIONS.length
      });

      return NextResponse.json({
        success: true,
        session: updatedSession,
        question: nextQuestion,
        isComplete: isComplete,
        wantsAdminChat: currentQuestion.id === 15 && selectedOption === 1, // Flag for admin chat
        waitingForPrice: waitingForPrice // Flag for price calculation
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
