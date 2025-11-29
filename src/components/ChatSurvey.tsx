"use client";

import React, { useState, useEffect, useRef } from 'react';
import { UploadButton } from '@/utils/uploadthing';
import { Send, Loader2, MessageCircle, X } from 'lucide-react';
import { SURVEY_QUESTIONS } from '@/lib/survey-questions';
import { Cake } from 'lucide-react';
import Image from 'next/image';

interface Message {
  type: 'bot' | 'user';
  text: string;
  options?: string[];
  fileUrl?: string;
  fileName?: string;
  imageUrl?: string;
  isStartPrompt?: boolean;
}

interface SurveyState {
  sessionId: string | null;
  currentStep: number;
  isComplete: boolean;
  question: {
    id: number;
    text: string;
    type: string;
    options?: string[];
  } | null;
}

interface ChatWidgetProps {
  productId?: number;
  productImage?: string;
  productName?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  showFloatingButton?: boolean;
}

interface ChatSession {
  sessionId: string;
  currentStep: number;
  isComplete: boolean;
  calculatedPrice: number | null;
  waitingForPrice: boolean;
  isChatEnded: boolean;
}

interface ChatMessage {
  id: number;
  sessionId: number;
  senderType: 'admin' | 'user' | 'bot';
  content: string;
  fileUrl: string | null;
  fileName: string | null;
  imageUrl: string | null;
  createdAt: string;
}

// Product details type based on Prisma Cake model
type ProductDetails = {
  id: number;
  name: string;
  category: string;
  productType: string;
  price: number | null;
  pieces: number | null;
  fillings: string[];
  hasMarzipan: boolean;
  hasCream: boolean;
  isCustomizable: boolean;
  [key: string]: unknown;
};

const ChatWidget = ({ productId, productImage, productName, isOpen: externalIsOpen, onOpenChange, showFloatingButton = true }: ChatWidgetProps) => {
  // Initialize with safe defaults for SSR (no window access)
  // Start closed to avoid flash on mobile, will open on desktop in useEffect
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const setIsOpen = (value: boolean) => {
    if (externalIsOpen === undefined) {
      setInternalIsOpen(value);
      // Track manual close
      if (!value) {
        setManuallyClosed(true);
        setManuallyOpened(false);
      } else {
        // Reset manual close flag when opened
        setManuallyClosed(false);
        // Track manual open (especially on mobile)
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          setManuallyOpened(true);
        }
      }
    } else {
      // If externally controlled, track manual open on mobile
      if (value && typeof window !== 'undefined' && window.innerWidth < 768) {
        setManuallyOpened(true);
      } else if (!value) {
        setManuallyOpened(false);
      }
    }
    if (onOpenChange) {
      onOpenChange(value);
    }
  };

  // Track screen size for responsive behavior (start with safe default for SSR)
  const [isDesktop, setIsDesktop] = useState(true); // Default to desktop for SSR

  // Track if user manually closed the chat (to prevent auto-opening on resize)
  const [manuallyClosed, setManuallyClosed] = useState(false);
  // Track if user manually opened the chat (to prevent auto-closing on mobile)
  const [manuallyOpened, setManuallyOpened] = useState(false);

  // Initialize and handle responsive behavior on client side only
  useEffect(() => {
    // Set initial state based on actual screen size (client-side only)
    const checkScreenSize = () => {
      const desktop = window.innerWidth >= 768; // md breakpoint
      setIsDesktop(desktop);
      
      if (externalIsOpen === undefined && !manuallyClosed) {
        // Set initial open state based on screen size
        setInternalIsOpen(desktop);
      } else if (externalIsOpen !== undefined && onOpenChange) {
        // If externally controlled and on mobile, close it only if not manually opened
        if (!desktop && externalIsOpen && !manuallyOpened) {
          onOpenChange(false);
        }
      }
    };

    // Set initial state
    checkScreenSize();

    const handleResize = () => {
      const desktop = window.innerWidth >= 768; // md breakpoint
      const wasDesktop = isDesktop;
      setIsDesktop(desktop);
      
      // Reset manuallyClosed when switching to mobile (so it can auto-open when back to desktop)
      if (!desktop && wasDesktop) {
        setManuallyClosed(false);
      }
      
      if (externalIsOpen === undefined) {
        // Only auto-manage if not externally controlled
        if (desktop && !manuallyClosed) {
          // Open on desktop if not manually closed
          setInternalIsOpen(true);
        } else if (!desktop) {
          // Close on mobile
          setInternalIsOpen(false);
        }
        // If desktop and manuallyClosed, don't change state (stay closed)
      } else if (externalIsOpen !== undefined && onOpenChange) {
        // If externally controlled, close on mobile only if not manually opened
        if (!desktop && externalIsOpen && !manuallyOpened) {
          onOpenChange(false);
        } else if (desktop && !externalIsOpen && wasDesktop === false) {
          // If switching from mobile to desktop, don't auto-open (let user control)
        }
      }
    };

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [externalIsOpen, manuallyClosed, isDesktop, onOpenChange]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [surveyState, setSurveyState] = useState<SurveyState>({
    sessionId: null,
    currentStep: 0,
    isComplete: false,
    question: null
  });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false); // Track file upload state
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [userMessage, setUserMessage] = useState(''); // For post-survey chat
  const [lastMessageId, setLastMessageId] = useState<number | null>(null); // Track last message for polling
  const [isChatEnded, setIsChatEnded] = useState(false); // Track if chat is ended
  const [startDecision, setStartDecision] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [pendingFirstQuestion, setPendingFirstQuestion] = useState<{ question: NonNullable<SurveyState['question']>; step: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(false); // Prevent multiple initializations
  const hasInitializedRef = useRef(false); // Track if chat has been initialized
  const lastProductIdRef = useRef<number | undefined>(productId); // Track productId changes

  // Reset initialization when productId changes
  useEffect(() => {
    if (productId !== lastProductIdRef.current) {
      hasInitializedRef.current = false;
      isInitializingRef.current = false;
      lastProductIdRef.current = productId;
      // Clear messages and reset state when product changes
      setMessages([]);
      setSurveyState({
        sessionId: null,
        currentStep: 0,
        isComplete: false,
        question: null
      });
      setSelectedOption(null);
      setTextAnswer('');
      setUploadedFile(null);
      setAnsweredQuestions(new Set());
      setStartDecision('pending');
      setPendingFirstQuestion(null);
    }
  }, [productId]);

  // Handle external open state changes
  useEffect(() => {
    if (externalIsOpen !== undefined && externalIsOpen && messages.length === 0 && !hasInitializedRef.current && !isInitializingRef.current) {
      // If externally opened and no messages, initialize chat (only once)
      initializeChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalIsOpen, messages.length]);

  // Initialize chat
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasInitializedRef.current && !isInitializingRef.current) {
      // Initialize chat only once
      initializeChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, messages.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Poll for new admin messages and price updates after survey is complete or waiting for price
  useEffect(() => {
    if (surveyState.sessionId && isOpen && !isChatEnded) {
      // Start polling for admin messages, chat status, and price updates
      pollingIntervalRef.current = setInterval(async () => {
        try {
          // Check session status for isChatEnded and price updates
          // Add cache busting to ensure fresh data
          const sessionResponse = await fetch(`/api/chat-survey/responses?t=${Date.now()}`, {
            cache: 'no-store'
          });
          const sessionData = await sessionResponse.json();
          if (sessionData.success && sessionData.sessions) {
            const currentSession = sessionData.sessions.find((s: ChatSession) => s.sessionId === surveyState.sessionId);
            if (currentSession?.isChatEnded) {
              setIsChatEnded(true);
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
              return;
            }
            
            // Check if price was sent and show continue question
            // We need to check if calculatedPrice exists and waitingForPrice is false
            // IMPORTANT: Don't interfere if we're past question 16 (already answered continue question)
            const isPastContinueQuestion = answeredQuestions.has(16);
            
            // Only check for continue question if we haven't passed it yet
            if (!isPastContinueQuestion) {
              const hasCalculatedPrice = currentSession && 
                (currentSession.calculatedPrice !== null && 
                 currentSession.calculatedPrice !== undefined && 
                 currentSession.calculatedPrice > 0);
              const isNotWaitingForPrice = currentSession && currentSession.waitingForPrice === false;
              const continueQuestionNotShown = !surveyState.question || surveyState.question.id !== 16;
              const shouldShowContinueQuestion = hasCalculatedPrice && isNotWaitingForPrice && 
                !surveyState.isComplete && 
                continueQuestionNotShown;
            
              // Debug logging - only log when waiting for price or when price is calculated
              if (currentSession && !surveyState.isComplete) {
                console.log('Price check:', {
                  calculatedPrice: currentSession.calculatedPrice,
                  waitingForPrice: currentSession.waitingForPrice,
                  hasCalculatedPrice,
                  isNotWaitingForPrice,
                  currentQuestionId: surveyState.question?.id,
                  continueQuestionNotShown,
                  shouldShowContinueQuestion,
                  isComplete: surveyState.isComplete,
                  sessionId: currentSession.sessionId,
                  sessionFound: !!currentSession
                });
              }
              
              if (shouldShowContinueQuestion) {
              console.log('Should show continue question - proceeding...');
              // Price was sent, show continue question (ID 16 from SURVEY_QUESTIONS)
              const continueQuestion = SURVEY_QUESTIONS.find(q => q.id === 16);
              
              if (!continueQuestion) {
                console.error('Continue question (ID 16) not found in SURVEY_QUESTIONS');
                return;
              }
              
              // Check if continue question already shown
              const continueQuestionShown = surveyState.question && surveyState.question.id === 16;
              
              if (!continueQuestionShown) {
                console.log('Continue question not shown yet, showing it now...');
                // Load price message from database first
                const messagesResponse = await fetch(`/api/chat-survey/messages/${surveyState.sessionId}?t=${Date.now()}`, {
                  cache: 'no-store'
                });
                const messagesData = await messagesResponse.json();
                if (messagesData.success && messagesData.messages) {
                  const priceMessage = messagesData.messages.find((m: ChatMessage) => m.content && m.content.includes('₾'));
                  if (priceMessage) {
                    setMessages(prev => {
                      const exists = prev.some(m => m.text === priceMessage.content);
                      if (!exists) {
                        console.log('Adding price message to chat:', priceMessage.content);
                        return [...prev, {
                          type: 'bot',
                          text: priceMessage.content,
                          options: undefined
                        }];
                      }
                      return prev;
                    });
                  } else {
                    console.log('Price message not found in database messages');
                  }
                } else {
                  console.log('Failed to load messages:', messagesData);
                }
                
                // Show continue question after a short delay to ensure price message is shown first
                setTimeout(() => {
                  console.log('Setting continue question in survey state');
                  // Find question 16 index in SURVEY_QUESTIONS
                  const question16Index = SURVEY_QUESTIONS.findIndex(q => q.id === 16);
                  console.log('Setting continue question in survey state:', {
                    question16Index,
                    continueQuestionId: continueQuestion.id,
                    continueQuestionText: continueQuestion.text,
                    previousQuestionId: surveyState.question?.id
                  });
                  setSurveyState(prev => ({
                    ...prev,
                    currentStep: question16Index !== -1 ? question16Index : prev.currentStep,
                    question: continueQuestion
                  }));
                  console.log('Survey state updated - question should now be:', continueQuestion.id);
                  
                  // Add continue question to messages immediately
                  setMessages(prev => {
                    const exists = prev.some(m => m.text === continueQuestion.text);
                    if (!exists) {
                      return [...prev, {
                        type: 'bot',
                        text: continueQuestion.text,
                        options: continueQuestion.options
                      }];
                    }
                    return prev;
                  });
                  
                  // Save continue question as bot message
                  fetch('/api/chat-survey/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      sessionId: surveyState.sessionId,
                      senderType: 'bot',
                      content: continueQuestion.text
                    })
                  }).catch(err => console.error('Error saving continue question:', err));
                }, 300);
              } else {
                console.log('Continue question already shown');
              }
            }
            } // End of !isPastContinueQuestion check
          }

          // Also check messages for price message to trigger continue question
          // IMPORTANT: Don't interfere if we're past question 16 (already answered continue question)
          const isPastContinueQuestionMessages = answeredQuestions.has(16);
          
          if (!isPastContinueQuestionMessages) {
            const response = await fetch(`/api/chat-survey/messages/${surveyState.sessionId}?t=${Date.now()}`, {
              cache: 'no-store'
            });
            const data = await response.json();
            
            if (data.success && data.messages) {
              // Check if there's a price message that we haven't shown yet
              const priceMessage = data.messages.find((m: ChatMessage) => m.content && m.content.includes('₾') && m.senderType === 'bot');
              const continueQuestionNotShown = !surveyState.question || surveyState.question.id !== 16;
              if (priceMessage && continueQuestionNotShown && !surveyState.isComplete) {
              // Check if we should show continue question
              const hasPriceInMessage = priceMessage.content.includes('₾');
              if (hasPriceInMessage) {
                // Check session again to see if calculatedPrice is set
                const sessionCheckResponse = await fetch(`/api/chat-survey/responses?t=${Date.now()}`, {
                  cache: 'no-store'
                });
                const sessionCheckData = await sessionCheckResponse.json();
                if (sessionCheckData.success && sessionCheckData.sessions) {
                  const currentSessionCheck = sessionCheckData.sessions.find((s: ChatSession) => s.sessionId === surveyState.sessionId);
                  if (currentSessionCheck && currentSessionCheck.calculatedPrice && !currentSessionCheck.waitingForPrice) {
                    // Price was sent, show continue question
                    const continueQuestion = SURVEY_QUESTIONS.find(q => q.id === 16);
                    if (continueQuestion) {
                      // Add price message first
                      setMessages(prev => {
                        const exists = prev.some(m => m.text === priceMessage.content);
                        if (!exists) {
                          return [...prev, {
                            type: 'bot',
                            text: priceMessage.content,
                            options: undefined
                          }];
                        }
                        return prev;
                      });
                      
                      // Show continue question after delay
                      setTimeout(() => {
                        // Find question 16 index in SURVEY_QUESTIONS
                        const question16Index = SURVEY_QUESTIONS.findIndex(q => q.id === 16);
                        setSurveyState(prev => ({
                          ...prev,
                          currentStep: question16Index !== -1 ? question16Index : prev.currentStep,
                          question: continueQuestion
                        }));
                      }, 500);
                    }
                  }
                }
              }
            }
          } // End of !isPastContinueQuestionMessages check
          }
          
          // Check for new messages from admin/user (separate from continue question logic)
          const messagesResponse = await fetch(`/api/chat-survey/messages/${surveyState.sessionId}?t=${Date.now()}`, {
            cache: 'no-store'
          });
          const messagesData = await messagesResponse.json();
          
          if (messagesData.success && messagesData.messages) {
            // Convert database messages to Message format
            const dbMessages: Message[] = messagesData.messages.map((msg: ChatMessage) => ({
              type: msg.senderType === 'admin' ? 'bot' : msg.senderType as 'bot' | 'user',
              text: msg.content,
              fileUrl: msg.fileUrl || undefined,
              fileName: msg.fileName || undefined,
              imageUrl: msg.imageUrl || undefined
            }));

            // Only add new messages (after lastMessageId)
            if (lastMessageId !== null) {
              const newMessages = dbMessages.filter((_, index) => {
                const dbMsg = messagesData.messages[index];
                return dbMsg.id > lastMessageId;
              });

              if (newMessages.length > 0) {
                setMessages(prev => {
                  // Check if message already exists by text content to avoid duplicates
                  const existingTexts = new Set(prev.map(m => m.text));
                  const toAdd = newMessages.filter(msg => !existingTexts.has(msg.text));
                  if (toAdd.length > 0) {
                    return [...prev, ...toAdd];
                  }
                  return prev;
                });
                setLastMessageId(messagesData.messages[messagesData.messages.length - 1]?.id || null);
              }
            } else {
              // First load - only set messages if survey is complete or we don't have active question
              // This prevents overwriting bot questions that haven't been saved to database yet
              if (surveyState.isComplete || !surveyState.question) {
                setMessages(dbMessages);
                if (messagesData.messages.length > 0) {
                  setLastMessageId(messagesData.messages[messagesData.messages.length - 1].id);
                }
              } else {
                // Survey is active - merge database messages with existing messages
                // Don't overwrite, just add missing ones
                setMessages(prev => {
                  const existingTexts = new Set(prev.map(m => m.text));
                  const toAdd = dbMessages.filter(msg => !existingTexts.has(msg.text));
                  if (toAdd.length > 0) {
                    return [...prev, ...toAdd];
                  }
                  return prev;
                });
                if (messagesData.messages.length > 0) {
                  setLastMessageId(messagesData.messages[messagesData.messages.length - 1].id);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error polling for messages:', error);
        }
      }, 3000); // Poll every 3 seconds

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    } else {
      // Stop polling if survey is not complete, chat is closed, or chat is ended
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [surveyState.sessionId, isOpen, lastMessageId, isChatEnded]);

  // Auto-select and submit for question 15 (hidden question - always select bot form option 0)
  useEffect(() => {
    if (surveyState.question?.id === 15 && !answeredQuestions.has(15) && surveyState.sessionId && !isLoading) {
      console.log('Question 15 detected - auto-selecting option 0 (bot form)', {
        questionId: surveyState.question.id,
        sessionId: surveyState.sessionId,
        answeredQuestions: Array.from(answeredQuestions),
        isLoading
      });
      setSelectedOption(0);
    }
  }, [surveyState.question?.id, surveyState.sessionId, answeredQuestions, isLoading]);

  // Auto-submit question 15 after selectedOption is set
  useEffect(() => {
    if (surveyState.question?.id === 15 && 
        selectedOption === 0 && 
        !answeredQuestions.has(15) && 
        surveyState.sessionId && 
        !isLoading) {
      console.log('Question 15 - selectedOption is 0, auto-submitting...', {
        selectedOption,
        questionId: surveyState.question.id,
        sessionId: surveyState.sessionId
      });
      // Auto-submit after a short delay to ensure state is set
      const timer = setTimeout(() => {
        console.log('Auto-submitting question 15 answer...');
        // Double check before submitting
        if (surveyState.question?.id === 15 && 
            surveyState.sessionId && 
            !answeredQuestions.has(15) && 
            selectedOption === 0) {
          submitAnswer();
        } else {
          console.log('Question 15 conditions changed, skipping auto-submit');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption, surveyState.question?.id, surveyState.sessionId, answeredQuestions, isLoading]);

  // Auto-submit for multiple choice questions
  useEffect(() => {
    if (selectedOption !== null && surveyState.question?.type === 'multiple_choice' && 
        surveyState.question && !answeredQuestions.has(surveyState.question.id) &&
        surveyState.question.id !== 15) { // Don't auto-submit for question 15 (handled above)
      const timer = setTimeout(() => {
        submitAnswer();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption, surveyState.question]);

  // Auto-submit for file uploads
  useEffect(() => {
    if (uploadedFile && surveyState.question?.type === 'file' && 
        surveyState.question && !answeredQuestions.has(surveyState.question.id)) {
      const timer = setTimeout(() => {
        submitAnswer();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFile, surveyState.question]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    // Prevent multiple initializations
    if (isInitializingRef.current || hasInitializedRef.current) {
      console.log('Chat already initialized or initializing, skipping...');
      return;
    }
    
    isInitializingRef.current = true;
    console.log('Initializing chat...');
    setIsLoading(true);
    setStartDecision('pending');
    setPendingFirstQuestion(null);
    
    // Fetch product details if productId is provided (for product detail page)
    let fetchedProductDetails: ProductDetails | null = null;
    if (productId) {
      try {
        const productResponse = await fetch(`/api/chat-survey/products?id=${productId}`);
        const productData = await productResponse.json();
        if (productData.success && productData.data) {
          fetchedProductDetails = productData.data;
          setProductDetails(fetchedProductDetails); // Store for later use
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    }
    
    try {
      const response = await fetch('/api/chat-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'create',
          productId: productId || undefined
        })
      });

      const data = await response.json();
      console.log('Chat API response:', data);
      
      if (data.success) {
        console.log('Setting messages...', {
          questionId: data.question.id,
          questionText: data.question.text,
          isQuestion15: data.question.id === 15
        });
        setSurveyState({
          sessionId: data.session.sessionId,
          currentStep: data.session.currentStep,
          isComplete: false,
          question: null
        });
        
        // If question 15, log that auto-submit should trigger
        if (data.question.id === 15) {
          console.log('Question 15 detected in initializeChat - auto-submit should trigger');
        }

        // Use same welcome message for all pages (main page and product detail page)
        const welcomeText = 'გამარჯობა! მე ვარ lappetit bot, თქვენი ტორტის ასისტენტი. დავიწყოთ შეკვეთა?';

        // Customize first question if product-specific
        let firstQuestionText = data.question.text;
        if (productId && productName) {
          // Make questions product-specific
          if (data.question.id === 3) {
            firstQuestionText = `ამ "${productName}" ტორტისთვის რამდენი ნაჭრიანი გსურთ?`;
          } else if (data.question.id === 4) {
            firstQuestionText = `ატვირთეთ თქვენი ტორტის სურათი ან ინსპირაციის ფოტო "${productName}" ტორტისთვის`;
          } else if (data.question.id === 5) {
            firstQuestionText = `"${productName}" ტორტისთვის აირჩიეთ შიგთავსი:`;
          } else if (data.question.id === 6) {
            firstQuestionText = `"${productName}" ტორტისთვის აირჩიეთ დაფარვა:`;
          }
        }

        // Don't add question 15 to messages (it's hidden and auto-handled)
        setPendingFirstQuestion({
          question: {
            ...data.question,
            text: firstQuestionText
          },
          step: data.session.currentStep
        });

        setMessages([
          {
            type: 'bot',
            text: welcomeText,
            options: ['კი', 'არა'],
            imageUrl: undefined, // Don't show product image in chat (same as main page)
            isStartPrompt: true
          }
        ]);

        // Save initial messages to database
        try {
          // Save welcome message
          await fetch('/api/chat-survey/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: data.session.sessionId,
              senderType: 'bot',
              content: welcomeText,
              imageUrl: undefined // Don't save product image in database (same as main page)
            })
          });

        } catch (error) {
          console.error('Error saving initial messages:', error);
        }
      }
      hasInitializedRef.current = true; // Mark as initialized after successful initialization
    } catch (error) {
      console.error('Error initializing chat:', error);
      setMessages([
        {
          type: 'bot',
          text: 'დაფიქსირდა შეცდომა. გთხოვთ, განაახლოთ გვერდი.',
          options: undefined
        }
      ]);
    } finally {
      setIsLoading(false);
      isInitializingRef.current = false; // Reset initialization flag
    }
  };

  const submitAnswer = async () => {
    if (!surveyState.sessionId || !surveyState.question) return;

    // Prevent submitting if question is already answered
    if (answeredQuestions.has(surveyState.question.id)) {
      return;
    }

    // Validate based on question type
    if (surveyState.question.type === 'multiple_choice' && selectedOption === null) {
      return;
    }
    if (surveyState.question.type === 'file' && !uploadedFile) {
      return;
    }

    setIsLoading(true);

    try {
      // Add user message to chat
      if (surveyState.question.type === 'multiple_choice' && selectedOption !== null) {
        const userMessage: Message = {
          type: 'user',
          text: surveyState.question.options?.[selectedOption] || ''
        };
        setMessages(prev => [...prev, userMessage]);
      } else if (surveyState.question.type === 'file' && uploadedFile) {
        const userMessage: Message = {
          type: 'user',
          text: 'ფაილი ატვირთულია',
          imageUrl: uploadedFile.url,  
          fileUrl: uploadedFile.url,
          fileName: uploadedFile.name
        };
        setMessages(prev => [...prev, userMessage]);
      } else if (surveyState.question.type === 'text' && textAnswer.trim()) {
        const userMessage: Message = {
          type: 'user',
          text: textAnswer
        };
        setMessages(prev => [...prev, userMessage]);
      }

      // Submit response
      const response = await fetch('/api/chat-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_response',
          sessionId: surveyState.sessionId,
          questionId: surveyState.question.id,
          selectedOption: selectedOption,
          answerText: textAnswer || undefined,
          fileUrl: uploadedFile?.url,
          fileName: uploadedFile?.name
        })
      });

      const data = await response.json();

      if (data.success) {
        // Handle continue question (question ID 16)
        // Check both surveyState.question.id and the questionId parameter to handle question 16
        const isQuestion16 = surveyState.question?.id === 16;
        console.log('=== Checking if question 16 ===', {
          surveyStateQuestionId: surveyState.question?.id,
          isQuestion16,
          selectedOption
        });
        
        if (isQuestion16) {
          if (selectedOption === 0) {
            // User selected "კი" - continue survey
            console.log('=== CONTINUE QUESTION (16) - User selected "კი" ===');
            console.log('Response data:', {
              sessionCurrentStep: data.session?.currentStep,
              questionId: data.question?.id,
              questionText: data.question?.text,
              isComplete: data.session?.isComplete,
              hasQuestion: !!data.question,
              hasSession: !!data.session
            });
            // Use the updated session from submit_response response
            if (data.session && data.question) {
              console.log('✅ Continuing survey with next question:', {
                questionId: data.question.id,
                questionText: data.question.text,
                questionType: data.question.type,
                currentStep: data.session.currentStep,
                isComplete: data.session.isComplete
              });
              // Reset form state for new question
              setSelectedOption(null);
              setTextAnswer('');
              setUploadedFile(null);
              
              // Mark continue question (16) as answered BEFORE setting new question
              setAnsweredQuestions(prev => {
                const newSet = new Set(prev);
                newSet.add(16);
                console.log('Marked question 16 as answered, answeredQuestions:', Array.from(newSet));
                return newSet;
              });
              
              setSurveyState({
                sessionId: data.session.sessionId,
                currentStep: data.session.currentStep,
                isComplete: data.session.isComplete,
                question: data.question
              });
              
              console.log('New question set:', {
                questionId: data.question.id,
                questionType: data.question.type,
                questionText: data.question.text
              });
              
              // Add next question to messages
              setMessages(prev => {
                const exists = prev.some(m => m.text === data.question.text);
                if (!exists) {
                  return [...prev, {
                    type: 'bot',
                    text: data.question.text,
                    options: data.question.options
                  }];
                }
                return prev;
              });
            } else {
              // Fallback: try to get next question
              try {
                const continueResponse = await fetch('/api/chat-survey', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'get_question',
                    sessionId: surveyState.sessionId
                  })
                });
                const continueData = await continueResponse.json();
                console.log('=== FALLBACK: get_question response ===', {
                  success: continueData.success,
                  sessionCurrentStep: continueData.session?.currentStep,
                  questionId: continueData.question?.id,
                  questionText: continueData.question?.text,
                  isComplete: continueData.session?.isComplete
                });
                if (continueData.success && continueData.question) {
                  console.log('✅ Got next question from get_question:', {
                    questionId: continueData.question.id,
                    questionText: continueData.question.text,
                    currentStep: continueData.session.currentStep
                  });
                  setSurveyState({
                    sessionId: continueData.session.sessionId,
                    currentStep: continueData.session.currentStep,
                    isComplete: continueData.session.isComplete,
                    question: continueData.question
                  });
                  // Add next question to messages
                  setMessages(prev => {
                    const exists = prev.some(m => m.text === continueData.question.text);
                    if (!exists) {
                      return [...prev, {
                        type: 'bot',
                        text: continueData.question.text,
                        options: continueData.question.options
                      }];
                    }
                    return prev;
                  });
                  // Mark continue question as answered
                  setAnsweredQuestions(prev => new Set(prev).add(16));
                } else {
                  // No more questions, complete survey
                  console.log('No more questions, completing survey');
                  setSurveyState(prev => ({
                    ...prev,
                    isComplete: true,
                    question: null
                  }));
                  setMessages(prev => [...prev, {
                    type: 'bot',
                    text: 'გმადლობთ თქვენი დროისთვის! შეკვეთა მიღებულია.',
                    options: undefined
                  }]);
                  // Mark chat as ended
                  setIsChatEnded(true);
                }
              } catch (error) {
                console.error('Error continuing survey:', error);
              }
            }
          } else if (selectedOption === 1) {
            // User selected "არა" - end survey
            setSurveyState(prev => ({
              ...prev,
              isComplete: true,
              question: null
            }));
            setMessages(prev => [...prev, {
              type: 'bot',
              text: 'გმადლობთ თქვენი დროისთვის! შეკვეთა მიღებულია.',
              options: undefined
            }]);
            // Mark chat as ended
            setIsChatEnded(true);
            // Mark continue question as answered
            setAnsweredQuestions(prev => new Set(prev).add(999));
            
            // Update session to complete
            try {
              await fetch('/api/chat-survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'complete_survey',
                  sessionId: surveyState.sessionId
                })
              });
            } catch (error) {
              console.error('Error completing survey:', error);
            }
          }
          setIsLoading(false);
          setSelectedOption(null);
          return;
        }

        // Mark current question as answered
        if (surveyState.question) {
          setAnsweredQuestions(prev => new Set(prev).add(surveyState.question!.id));
        }

        setSurveyState({
          sessionId: data.session.sessionId,
          currentStep: data.session.currentStep,
          isComplete: data.isComplete,
          question: data.question
        });

        // Handle waiting for price
        if (data.waitingForPrice) {
          // Mark current question as answered
          if (surveyState.question) {
            setAnsweredQuestions(prev => new Set(prev).add(surveyState.question!.id));
          }
          
          setMessages(prev => [...prev, {
            type: 'bot',
            text: 'დაელოდეთ, გამოვითვლით ფასს და დაგიწერთ. ⏳',
            options: undefined
          }]);
          
          // Save waiting message to database
          if (surveyState.sessionId) {
            try {
              await fetch('/api/chat-survey/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId: surveyState.sessionId,
                  senderType: 'bot',
                  content: 'დაელოდეთ, გამოვითვლით ფასს და დაგიწერთ. ⏳'
                })
              });
            } catch (error) {
              console.error('Error saving waiting message:', error);
            }
          }
          
          // Set question to null to indicate we're waiting for price
          setSurveyState(prev => ({
            ...prev,
            question: null
          }));
          
          // Reset form state
          setSelectedOption(null);
          setTextAnswer('');
          setUploadedFile(null);
          
          return; // Don't continue with next question
        }

        // Add next question or completion message
        if (data.isComplete) {
          // Check if user wants admin chat or completed full survey
          // If normal completion (not wantsAdminChat), end chat
          if (!data.wantsAdminChat) {
            setIsChatEnded(true);
          }
          
          if (data.wantsAdminChat) {
            // User selected "მინდა დაველოდო ადმინისტრატორს"
            setMessages(prev => [...prev, {
              type: 'bot',
              text: 'გმადლობთ! ჩვენი ადმინისტრატორი მალე დაგიკავშირდებათ. შეგიძლიათ გააგრძელოთ ჩატი აქ. 💬',
              options: undefined
            }]);
            
            // Save completion message to database
            if (surveyState.sessionId) {
              try {
                await fetch('/api/chat-survey/messages', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    sessionId: surveyState.sessionId,
                    senderType: 'bot',
                    content: 'გმადლობთ! ჩვენი ადმინისტრატორი მალე დაგიკავშირდებათ. შეგიძლიათ გააგრძელოთ ჩატი აქ. 💬'
                  })
                });
              } catch (error) {
                console.error('Error saving completion message:', error);
              }
            }
          } else {
            // Normal survey completion - don't allow chat continuation
            setMessages(prev => [...prev, {
              type: 'bot',
              text: 'გმადლობთ თქვენი პასუხებისთვის! 🙏 ჩვენი გუნდი მალე დაგიკავშირდებათ.',
              options: undefined
            }]);
            
            // Mark chat as ended to prevent continuation
            setIsChatEnded(true);
            
            // Save completion message to database
            if (surveyState.sessionId) {
              try {
                await fetch('/api/chat-survey/messages', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    sessionId: surveyState.sessionId,
                    senderType: 'bot',
                    content: 'გმადლობთ თქვენი პასუხებისთვის! 🙏 ჩვენი გუნდი მალე დაგიკავშირდებათ.'
                  })
                });
              } catch (error) {
                console.error('Error saving completion message:', error);
              }
            }
          }
        } else if (data.question) {
          // Customize question text for product-specific context (only on product detail page)
          let questionText = data.question.text;
          if (productId && productName) {
            if (data.question.id === 3) {
              questionText = `ამ "${productName}" ტორტისთვის რამდენი ნაჭრიანი გსურთ?`;
              // Add product-specific piece information if available
              if (productDetails && productDetails.pieces) {
                questionText += `\n\n💡 ${productName} არის ${productDetails.pieces} ნაჭრიანი.`;
              }
            } else if (data.question.id === 4) {
              questionText = `ატვირთეთ თქვენი ტორტის სურათი ან ინსპირაციის ფოტო "${productName}" ტორტისთვის`;
            } else if (data.question.id === 5) {
              questionText = `"${productName}" ტორტისთვის აირჩიეთ შიგთავსი:`;
              // Add product-specific filling suggestions if available
              if (productDetails && productDetails.fillings && productDetails.fillings.length > 0) {
                questionText += `\n\n💡 ${productName}-ისთვის ხელმისაწვდომია: ${productDetails.fillings.join(', ')}`;
              }
            } else if (data.question.id === 6) {
              questionText = `"${productName}" ტორტისთვის აირჩიეთ დაფარვა:`;
              // Add product-specific topping information if available
              if (productDetails) {
                const toppings = [];
                if (productDetails.hasMarzipan) toppings.push('მარცეპანი');
                if (productDetails.hasCream) toppings.push('კრემი');
                if (toppings.length > 0) {
                  questionText += `\n\n💡 ${productName}-ისთვის ხელმისაწვდომია: ${toppings.join(', ')}`;
                }
              }
            } else if (data.question.id === 1) {
              questionText = `"${productName}"-ის გატანის თარიღი?`;
            } else if (data.question.id === 2) {
              questionText = `"${productName}"-ის გატანის დრო?`;
            } else if (data.question.id === 17) {
              questionText = `"${productName}"-როგორ გირჩევნიათ მიწოდება?`;
            } else if (data.question.id === 18) {
              questionText = `"${productName}"-ის მიტანის თარიღი?`;
            } else if (data.question.id === 19) {
              questionText = `"${productName}"-ის მიტანის დრო?`;
            } else if (data.question.id === 8) {
              questionText = `"${productName}"-ზე სახელი/ასაკი სურვილებისამებრ (მაგალითად: სახელი: გიორგი, ასაკი: 10 წლის)`;
            }
          }
          
          setMessages(prev => [...prev, {
            type: 'bot',
            text: questionText,
            options: data.question.options
          }]);
        }

        // Reset form
        setSelectedOption(null);
        setTextAnswer('');
        setUploadedFile(null);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPromptSelection = async (optionIndex: number, optionLabel: string) => {
    if (!surveyState.sessionId || startDecision !== 'pending') return;

    const decision = optionIndex === 0 ? 'accepted' : 'declined';
    setStartDecision(decision);

    // Show user choice immediately
    setMessages(prev => [...prev, { type: 'user', text: optionLabel }]);

    try {
      await fetch('/api/chat-survey/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: surveyState.sessionId,
          senderType: 'user',
          content: optionLabel
        })
      });
    } catch (error) {
      console.error('Error saving start decision message:', error);
    }

    if (decision === 'accepted') {
      if (pendingFirstQuestion) {
        const { question, step } = pendingFirstQuestion;
        setSurveyState(prev => ({
          ...prev,
          currentStep: step,
          question
        }));

        // Only show the question if it's not the hidden auto-handled question (id 15)
        if (question.id !== 15) {
          setMessages(prev => [...prev, {
            type: 'bot',
            text: question.text,
            options: question.options
          }]);

          try {
            await fetch('/api/chat-survey/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: surveyState.sessionId,
                senderType: 'bot',
                content: question.text
              })
            });
          } catch (error) {
            console.error('Error saving first question message:', error);
          }
        }

        setPendingFirstQuestion(null);
      }
    } else {
      const closingText = 'გასაგებია! როდესაც გადაწყვეტთ შეკვეთის დაწყებას, უბრალოდ მომწერეთ და სიამოვნებით დაგეხმარებით 😊';
      setSurveyState(prev => ({
        ...prev,
        isComplete: true
      }));
      setIsChatEnded(true);
      setMessages(prev => [...prev, { type: 'bot', text: closingText }]);

      try {
        await fetch('/api/chat-survey/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: surveyState.sessionId,
            senderType: 'bot',
            content: closingText
          })
        });
      } catch (error) {
        console.error('Error saving closing message:', error);
      }

      try {
        await fetch('/api/chat-survey/end-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: surveyState.sessionId })
        });
      } catch (error) {
        console.error('Error ending chat after decline:', error);
      }
    }
  };

  const handleOptionClick = (index: number) => {
    // Prevent clicking if question is already answered
    if (surveyState.question && answeredQuestions.has(surveyState.question.id)) {
      return;
    }
    setSelectedOption(index);
    // Auto-submit is handled by useEffect
  };

  const handleFileUpload = (res: { url: string; name: string }[]) => {
    // Prevent uploading if question is already answered
    if (surveyState.question && answeredQuestions.has(surveyState.question.id)) {
      return;
    }
    if (res && res.length > 0) {
      setUploadedFile({
        url: res[0].url,
        name: res[0].name
      });
    }
  };

  const canSubmit = () => {
    if (!surveyState.question) return false;
    // Prevent submitting if question is already answered
    if (answeredQuestions.has(surveyState.question.id)) return false;
    if (surveyState.question.type === 'multiple_choice') return selectedOption !== null;
    if (surveyState.question.type === 'file') return uploadedFile !== null;
    if (surveyState.question.type === 'text') return textAnswer.trim().length > 0;
    return false;
  };

  // Helper function to search products and generate bot response
  const searchProductsAndRespond = async (query: string): Promise<string> => {
    try {
      const lowerQuery = query.toLowerCase();
      
      // Check if query is a category
      const categoryMap: Record<string, string> = {
        'დაბადების': 'BIRTHDAY',
        'დაბადების დღე': 'BIRTHDAY',
        'birthday': 'BIRTHDAY',
        'ქორწილი': 'WEDDING',
        'wedding': 'WEDDING',
        'დღესასწაული': 'ANNIVERSARY',
        'anniversary': 'ANNIVERSARY',
        'პერსონალური': 'CUSTOM',
        'custom': 'CUSTOM',
        'დესერტი': 'Desserts',
        'დესერტები': 'Desserts',
        'dessert': 'Desserts',
        'desserts': 'Desserts'
      };
      
      let searchUrl = `/api/chat-survey/products?search=${encodeURIComponent(query)}`;
      
      // If query matches a category, search by category
      for (const [key, value] of Object.entries(categoryMap)) {
        if (lowerQuery.includes(key.toLowerCase())) {
          searchUrl = `/api/chat-survey/products?category=${value}`;
          break;
        }
      }
      
      // Search for products
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (searchData.success && searchData.data && searchData.data.length > 0) {
        const products = searchData.data.slice(0, 5); // Limit to 5 products
        
        let response = `ვიპოვე ${products.length} პროდუქტი:\n\n`;
        
        products.forEach((product: ProductDetails, index: number) => {
          response += `${index + 1}. ${product.name}\n`;
          
          // Category
          const categoryNameMap: Record<string, string> = {
            'BIRTHDAY': 'დაბადების დღე',
            'WEDDING': 'ქორწილი',
            'ANNIVERSARY': 'დღესასწაული',
            'CUSTOM': 'პერსონალური',
            'Desserts': 'დესერტები'
          };
          response += `   კატეგორია: ${categoryNameMap[product.category] || product.category}\n`;
          
          // Price
          if (product.price) {
            response += `   ფასი: ${product.price}₾`;
            if (product.pieces) {
              const pricePerSlice = (product.price / product.pieces).toFixed(2);
              response += ` (${pricePerSlice}₾ ნაჭერზე)`;
            }
            response += `\n`;
          } else if (product.isCustomizable) {
            response += `   ფასი: ნაჭრების რაოდენობის მიხედვით\n`;
          }
          
          // Fillings
          if (product.fillings && product.fillings.length > 0) {
            response += `   შიგთავსი: ${product.fillings.join(', ')}\n`;
          }
          
          // Pieces
          if (product.pieces) {
            response += `   ნაჭრები: ${product.pieces}\n`;
          }
          
          // Product type
          const typeMap: Record<string, string> = {
            'FULL_CAKE': 'სრული ტორტი',
            'SET': 'ნაკრები',
            'INDIVIDUAL_SLICE': 'ინდივიდუალური ნაჭერი'
          };
          if (product.productType) {
            response += `   ტიპი: ${typeMap[product.productType] || product.productType}\n`;
          }
          
          response += `\n`;
        });
        
        if (searchData.data.length > 5) {
          response += `\nსულ ვიპოვე ${searchData.data.length} პროდუქტი. ზემოთ ნაჩვენებია პირველი 5.`;
        }
        
        response += `\n\nდეტალური ინფორმაციისთვის გთხოვთ მიუთითოთ პროდუქტის სახელი ან გადადით ჩვენს კატალოგზე.`;
        
        return response;
      } else {
        // Try to get all products if search didn't find anything
        const allProductsResponse = await fetch('/api/chat-survey/products');
        const allProductsData = await allProductsResponse.json();
        
        if (allProductsData.success && allProductsData.data && allProductsData.data.length > 0) {
          return `ვერ ვიპოვე პროდუქტი "${query}"-ის მიხედვით. ჩვენ გვაქვს ${allProductsData.data.length} პროდუქ`;
        }
        
        return `ვერ ვიპოვე პროდუქტი "${query}"-ის მიხედვით. გთხოვთ, სცადოთ სხვა სახელი ან კატეგორია.`;
      }
    } catch (error) {
      console.error('Error searching products:', error);
      return 'დაფიქსირდა შეცდომა პროდუქტების ძიებისას. გთხოვთ, სცადოთ მოგვიანებით.';
    }
  };

  // Send user message after survey completion
  const sendUserMessage = async () => {
    if (!userMessage.trim() || !surveyState.sessionId || isLoading) return;

    const messageText = userMessage.trim();
    setUserMessage('');
    setIsLoading(true);

    // Add user message to UI immediately
    setMessages(prev => [...prev, {
      type: 'user',
      text: messageText
    }]);

    try {
      // Save message to database
      const response = await fetch('/api/chat-survey/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: surveyState.sessionId,
          senderType: 'user',
          content: messageText
        })
      });

      const data = await response.json();
      if (data.success) {
        setLastMessageId(data.message.id);
      }

      // Check if message is about products and generate bot response
      const lowerMessage = messageText.toLowerCase();
      const productKeywords = [
        'პროდუქტი', 'ტორტი', 'დაბადების', 'ქორწილი', 'დღესასწაული', 
        'დესერტი', 'ფასი', 'კატეგორია', 'შიგთავსი', 'ნაჭერი',
        'product', 'cake', 'price', 'category', 'filling', 'piece'
      ];
      
      const isProductQuery = productKeywords.some(keyword => lowerMessage.includes(keyword));
      
      if (isProductQuery || messageText.length > 3) {
        // Search products and generate response
        const botResponse = await searchProductsAndRespond(messageText);
        
        // Add bot response to UI
        setMessages(prev => [...prev, {
          type: 'bot',
          text: botResponse
        }]);

        // Save bot response to database
        try {
          await fetch('/api/chat-survey/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: surveyState.sessionId,
              senderType: 'bot',
              content: botResponse
            })
          });
        } catch (error) {
          console.error('Error saving bot response:', error);
        }
      } else {
        // Generic response for non-product queries
        const genericResponse = 'გმადლობთ თქვენი შეტყობინებისთვის! როგორ შემიძლია დაგეხმაროთ? შემიძლია დაგეხმაროთ პროდუქტების შესახებ ინფორმაციის მიღებაში.';
        
        setMessages(prev => [...prev, {
          type: 'bot',
          text: genericResponse
        }]);

        try {
          await fetch('/api/chat-survey/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: surveyState.sessionId,
              senderType: 'bot',
              content: genericResponse
            })
          });
        } catch (error) {
          console.error('Error saving bot response:', error);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send file message after survey completion
  const sendFileMessage = async (file: { url: string; name: string }) => {
    if (!surveyState.sessionId || isLoading) return;

    setIsLoading(true);

    // Add user message with file to UI immediately
    // Check if file is an image by URL or filename extension
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.url) || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
    setMessages(prev => [...prev, {
      type: 'user',
      text: 'ფაილი ატვირთულია',
      fileUrl: file.url,
      fileName: file.name,
      imageUrl: isImage ? file.url : undefined
    }]);

    try {
      // Save message to database
      const response = await fetch('/api/chat-survey/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: surveyState.sessionId,
          senderType: 'user',
          content: 'ფაილი ატვირთულია',
          fileUrl: file.url,
          fileName: file.name,
          imageUrl: isImage ? file.url : undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        setLastMessageId(data.message.id);
      }
    } catch (error) {
      console.error('Error sending file message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // End chat conversation
  const endChat = async () => {
    if (!surveyState.sessionId) return;

    if (window.confirm('ნამდვილად გსურთ საუბრის დასრულება?')) {
      setIsChatEnded(true);
      
      // Mark chat as ended in database and send ending message
      try {
        // Update session to mark chat as ended
        await fetch('/api/chat-survey/end-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: surveyState.sessionId
          })
        });

        // Send ending message to database
        await fetch('/api/chat-survey/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: surveyState.sessionId,
            senderType: 'bot',
            content: 'მომხმარებელმა დაასრულა საუბარი. გმადლობთ თქვენი დროისთვის!'
          })
        });
      } catch (error) {
        console.error('Error ending chat:', error);
      }
    }
  };

  // Calculate progress
  const totalQuestions = SURVEY_QUESTIONS.length;
  const completedQuestions = surveyState.currentStep;
  const progress = surveyState.isComplete ? 100 : (completedQuestions / totalQuestions) * 100;

  return (
    <>
      {/* Floating Chat Button - Show when closed (both mobile and desktop) */}
      {!isOpen && showFloatingButton && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
          aria-label="Open chat"
        >
          <MessageCircle size={24} className="md:w-7 md:h-7" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[400px] h-[70vh] md:h-[600px] max-h-[600px] md:max-h-none bg-white rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-3 md:p-4">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div>
                <p className="text-sm md:text-lg text-white">გთხოვთ, უპასუხოთ შეკითხვებს</p>
              </div>
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors flex-shrink-0"
                aria-label="Close chat"
              >
                <X size={18} className="md:w-5 md:h-5" />
              </button>
            </div>
            
            {/* Progress Bar - Cake Icons */}
            {!surveyState.isComplete && (
              <div className="mt-2 md:mt-3">
                <div className="flex gap-1 md:gap-2 justify-center items-center flex-wrap">
                  {Array.from({ length: totalQuestions }).map((_, index) => {
                    const isCompleted = index < completedQuestions;
                    const isCurrent = index === completedQuestions;
                    return (
                      <div
                        key={index}
                        className={`transition-all duration-500 ${
                          isCompleted
                            ? 'text-white'
                            : isCurrent
                            ? 'text-yellow-300 animate-pulse scale-110'
                            : 'text-white/30'
                        }`}
                        style={{
                          transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
                          filter: isCurrent ? 'drop-shadow(0 0 8px rgba(255, 255, 0, 0.8))' : 'none'
                        }}
                        title={`${isCompleted ? '✓' : isCurrent ? '→' : ''} ${index + 1}/${totalQuestions}`}
                      >
                        <Cake 
                          size={isCurrent ? 20 : isCompleted ? 18 : 14} 
                          className="md:w-7 md:h-7 transition-all duration-300"
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-1 md:mt-2 text-center">
                  <p className="text-xs md:text-base opacity-90 font-medium">
                    {completedQuestions} / {totalQuestions} შეკითხვა უპასუხებია
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 bg-gray-50">
            {messages.filter((message) => {
              // Hide question 15 and its answer from messages
              const isQuestion15 = message.text === "როგორ გსურთ გაგრძელება? 😊";
              const isQuestion15Answer = message.text === "შეკვეთის ფორმის შევსება ბოტის დახმარებით";
              return !isQuestion15 && !isQuestion15Answer;
            }).map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] md:max-w-[85%] rounded-lg p-2 md:p-3 text-sm md:text-base ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  <p className="break-words">{message.text}</p>
                
                {/* Show product image (only if no fileUrl - to avoid duplicate) */}
                {message.imageUrl && !message.fileUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden">
                    <Image
                      src={message.imageUrl}
                      alt={productName || "Product"}
                      width={200}
                      height={200}
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Show uploaded file */}
                {message.fileUrl && (
                  <div className="mt-2">
                    {/* Check if file is an image - check imageUrl first, then fileUrl extension, then fileName extension */}
                    {(() => {
                      const hasImageUrl = !!message.imageUrl;
                      const fileUrlIsImage = message.fileUrl && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(message.fileUrl);
                      const fileNameIsImage = message.fileName && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(message.fileName);
                      const isImage = hasImageUrl || fileUrlIsImage || fileNameIsImage;
                      
                      return isImage ? (
                        <div className="rounded-lg overflow-hidden border-2 border-white/30">
                          <Image
                            src={message.imageUrl || message.fileUrl}
                            alt={message.fileName || "Uploaded image"}
                            width={200}
                            height={200}
                            className="object-cover rounded-lg w-full h-auto max-w-[200px]"
                            unoptimized={message.fileUrl?.includes('uploadthing') || message.fileUrl?.includes('utfs.io')}
                          />
                        </div>
                      ) : (
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[18px] underline flex items-center gap-1"
                        >
                          {message.fileName || 'ფაილი'}
                        </a>
                      );
                    })()}
                  </div>
                )}

                {/* Show options */}
                {message.options && (
                  <div className="mt-2 space-y-1">
                    {message.options.map((option, optIndex) => {
                      const isStartPrompt = message.isStartPrompt;
                      const isCurrentQuestion = !isStartPrompt && surveyState.question && 
                        message.text === surveyState.question.text;
                      const isAnswered = !isStartPrompt && surveyState.question && 
                        answeredQuestions.has(surveyState.question.id);
                      const isDisabled = isStartPrompt
                        ? startDecision !== 'pending'
                        : isCurrentQuestion && isAnswered;
                      
                      return (
                        <button
                          key={optIndex}
                          onClick={() => {
                            if (isStartPrompt) {
                              handleStartPromptSelection(optIndex, option);
                            } else {
                              handleOptionClick(optIndex);
                            }
                          }}
                          disabled={!!isDisabled}
                          className={`block w-full text-left p-2 md:p-3 rounded text-sm md:text-base transition-all ${
                              isDisabled
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : selectedOption === optIndex
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg p-2">
                <Loader2 className="animate-spin text-black" size={16} />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Survey questions */}
        {(() => {
          // Hide input area for question 15 (auto-handled)
          const isQuestion15 = surveyState.question?.id === 15;
          const shouldShowInput = !surveyState.isComplete && surveyState.question && 
           !answeredQuestions.has(surveyState.question.id) && !isQuestion15;
          // Only log when question changes or when there's an issue
          if (surveyState.question) {
            const isAnswered = answeredQuestions.has(surveyState.question.id);
            // Log when question changes or when there's a mismatch
            if (!isAnswered || !shouldShowInput) {
              console.log('=== Input Area Check ===', {
                isComplete: surveyState.isComplete,
                hasQuestion: !!surveyState.question,
                questionId: surveyState.question?.id,
                questionType: surveyState.question?.type,
                questionText: surveyState.question?.text,
                isAnswered,
                answeredQuestionsArray: Array.from(answeredQuestions),
                shouldShowInput
              });
            }
          }
          return shouldShowInput;
        })() && surveyState.question && (
          <div className="border-t border-gray-200 p-3 md:p-4 bg-white">
            {surveyState.question.type === 'file' && (
              <div className="mb-2 md:mb-3">
                {/* Show question text above upload button */}
                <div className="mb-3 text-gray-800 text-[16px] font-medium">
                  {surveyState.question.text}
                </div>
                {isUploading && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={20} />
                    <span className="text-[16px] text-blue-700 font-medium">ფაილი იტვირთება...</span>
                  </div>
                )}
                <UploadButton
                  endpoint="chatSurveyUploader"
                  onUploadBegin={() => {
                    setIsUploading(true);
                  }}
                  onClientUploadComplete={(res) => {
                    setIsUploading(false);
                    if (res) {
                      handleFileUpload(res.map(f => ({ url: f.url, name: f.name })));
                    }
                  }}
                  onUploadError={(error) => {
                    setIsUploading(false);
                    alert(`შეცდომა! ${error.message}`);
                  }}
                  className="text-[18px] font-bold"
                  content={{
                    button: "აირჩიეთ ფაილი",
                    allowedContent: "ფაილი არ არის არჩეული"
                  }}
                />
                {uploadedFile && (
                  <div className="mt-2">
                   
                    <div className="rounded-lg overflow-hidden border-2 border-green-200">
                      <Image
                        src={uploadedFile.url}
                        alt={uploadedFile.name}
                        width={200}
                        height={200}
                        className="object-cover w-full h-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {surveyState.question.type === 'text' && (
              <div className="mb-2 md:mb-3">
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="ჩაწერეთ თქვენი პასუხი..."
                  className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none text-black bg-white"
                  rows={3}
                  autoFocus
                />
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={submitAnswer}
                disabled={!canSubmit() || isLoading}
                className={`flex items-center gap-1 md:gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all text-sm md:text-base ${
                  canSubmit() && !isLoading
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 md:w-5 md:h-5" />
                    <span className="font-bold">გაგზავნა...</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold">გაგზავნა</span>
                    <Send size={18} className="md:w-5 md:h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Input Area - Post-survey chat */}
        {surveyState.isComplete && surveyState.sessionId && !isChatEnded && (
          <div className="border-t border-gray-200 p-3 md:p-4 bg-white">
            {/* File Upload */}
            <div className="mb-2 md:mb-3">
              {isUploading && (
                <div className="mb-2 md:mb-3 p-2 md:p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 md:gap-3">
                  <Loader2 className="animate-spin text-blue-600 w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-base text-blue-700 font-medium">ფაილი იტვირთება...</span>
                </div>
              )}
              <UploadButton
                endpoint="chatSurveyUploader"
                onUploadBegin={() => {
                  setIsUploading(true);
                }}
                onClientUploadComplete={(res) => {
                  setIsUploading(false);
                  if (res && res.length > 0) {
                    const file = { url: res[0].url, name: res[0].name };
                    // File upload handled directly
                    // Auto-send file
                    sendFileMessage(file);
                  }
                }}
                onUploadError={(error) => {
                  setIsUploading(false);
                  alert(`შეცდომა! ${error.message}`);
                }}
                className="text-sm md:text-base"
                content={{
                  button: "📎 ფაილის ატვირთვა",
                  allowedContent: "ატვირთეთ ფაილი"
                }}
              />
              {/* Preview removed - file will appear in chat messages after upload */}
            </div>

            {/* Message Input */}
            <div className="flex gap-1 md:gap-2">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && userMessage.trim() && !isLoading) {
                    e.preventDefault();
                    sendUserMessage();
                  }
                }}
                placeholder="ჩაწერეთ თქვენი შეტყობინება..."
                className="flex-1 p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
                disabled={isLoading}
              />
              <button
                onClick={sendUserMessage}
                disabled={!userMessage.trim() || isLoading}
                className={`flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all text-xs md:text-base ${
                  userMessage.trim() && !isLoading
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <>
                    <span className="hidden md:inline">გაგზავნა</span>
                    <Send size={18} className="md:w-5 md:h-5" />
                  </>
                )}
              </button>
              <button
                onClick={endChat}
                className="px-2 md:px-4 py-2 md:py-3 rounded-lg font-medium transition-all bg-gray-200 text-gray-700 hover:bg-gray-300 flex-shrink-0"
                title="საუბრის დასრულება"
              >
                <X size={18} className="md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Chat Ended Message */}
        {isChatEnded && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="text-center text-black">
              <p className="font-medium">საუბარი დასრულებულია</p>
              <p className="text-sm mt-1">გმადლობთ თქვენი დროისთვის!</p>
            </div>
          </div>
        )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
