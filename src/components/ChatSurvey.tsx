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
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  showFloatingButton?: boolean;
}

const ChatWidget = ({ productId, productImage, productName, defaultOpen = true, isOpen: externalIsOpen, onOpenChange, showFloatingButton = true }: ChatWidgetProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const setIsOpen = (value: boolean) => {
    if (externalIsOpen === undefined) {
      setInternalIsOpen(value);
    }
    if (onOpenChange) {
      onOpenChange(value);
    }
  };
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
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle external open state changes
  useEffect(() => {
    if (externalIsOpen !== undefined && externalIsOpen && messages.length === 0) {
      // If externally opened and no messages, initialize chat
      initializeChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalIsOpen, messages.length]);

  // Initialize chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
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

  // Auto-submit for multiple choice questions
  useEffect(() => {
    if (selectedOption !== null && surveyState.question?.type === 'multiple_choice' && 
        surveyState.question && !answeredQuestions.has(surveyState.question.id)) {
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
    console.log('Initializing chat...');
    setIsLoading(true);
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
        console.log('Setting messages...');
        setSurveyState({
          sessionId: data.session.sessionId,
          currentStep: data.session.currentStep,
          isComplete: false,
          question: data.question
        });

        // Customize welcome message and questions based on product
        const welcomeText = productId && productName 
          ? `გამარჯობა! მე ვარ SweetBot, თქვენი ტორტის ასისტენტი. ვხედავ რომ გაინტერესებთ "${productName}". დავიწყოთ შეკვეთა?`
          : 'გამარჯობა! მე ვარ SweetBot, თქვენი ტორტის ასისტენტი დავიწყოთ შეკვეთა?';

        // Customize first question if product-specific
        let firstQuestionText = data.question.text;
        if (productId && productName) {
          // Make questions product-specific
          if (data.question.id === 3) {
            firstQuestionText = `ამ "${productName}" ტორტისთვის რამდენი ნაჭრიანი გსურთ?`;
          } else if (data.question.id === 4) {
            firstQuestionText = `ატვირთეთ თქვენი ტორტის იმიჯი ან ინსპირაციის ფოტო "${productName}" ტორტისთვის`;
          } else if (data.question.id === 5) {
            firstQuestionText = `"${productName}" ტორტისთვის აირჩიეთ შიგთავსი:`;
          } else if (data.question.id === 6) {
            firstQuestionText = `"${productName}" ტორტისთვის აირჩიეთ დაფარვა:`;
          }
        }

        const initialMessages: Message[] = [
          {
            type: 'bot',
            text: welcomeText,
            options: undefined,
            imageUrl: productImage
          },
          {
            type: 'bot',
            text: firstQuestionText,
            options: data.question.options
          }
        ];

        setMessages(initialMessages);
      }
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

        // Add next question or completion message
        if (data.isComplete) {
          setMessages(prev => [...prev, {
            type: 'bot',
            text: 'გმადლობთ თქვენი პასუხებისთვის! 🙏 ჩვენი გუნდი მალე დაგიკავშირდებათ.',
            options: undefined
          }]);
        } else if (data.question) {
          // Customize question text for product-specific context
          let questionText = data.question.text;
          if (productId && productName) {
            if (data.question.id === 3) {
              questionText = `ამ "${productName}" ტორტისთვის რამდენი ნაჭრიანი გსურთ?`;
            } else if (data.question.id === 4) {
              questionText = `ატვირთეთ თქვენი ტორტის იმიჯი ან ინსპირაციის ფოტო "${productName}" ტორტისთვის`;
            } else if (data.question.id === 5) {
              questionText = `"${productName}" ტორტისთვის აირჩიეთ შიგთავსი:`;
            } else if (data.question.id === 6) {
              questionText = `"${productName}" ტორტისთვის აირჩიეთ დაფარვა:`;
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

  // Calculate progress
  const totalQuestions = SURVEY_QUESTIONS.length;
  const completedQuestions = surveyState.currentStep;
  const progress = surveyState.isComplete ? 100 : (completedQuestions / totalQuestions) * 100;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && showFloatingButton && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
          aria-label="Open chat"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[400px] h-full md:h-[600px] bg-white rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
              
                <p className="text-lg text-white">გთხოვთ, უპასუხოთ შეკითხვებს</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Progress Bar - Cake Icons */}
            {!surveyState.isComplete && (
              <div className="mt-3">
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
                          size={isCurrent ? 28 : isCompleted ? 24 : 18} 
                          className="transition-all duration-300"
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs opacity-90 font-medium">
                    {completedQuestions} / {totalQuestions} შეკითხვა უპასუხებია
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 text-sm ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  <p>{message.text}</p>
                
                {/* Show product image */}
                {message.imageUrl && (
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
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline flex items-center gap-1"
                    >
                       {message.fileName}
                    </a>
                  </div>
                )}

                {/* Show options */}
                {message.options && (
                  <div className="mt-2 space-y-1">
                    {message.options.map((option, optIndex) => {
                      const isCurrentQuestion = surveyState.question && 
                        message.text === surveyState.question.text;
                      const isAnswered = surveyState.question && 
                        answeredQuestions.has(surveyState.question.id);
                      const isDisabled = isCurrentQuestion && isAnswered;
                      
                      return (
                        <button
                          key={optIndex}
                          onClick={() => handleOptionClick(optIndex)}
                          disabled={!!isDisabled}
                          className={`block w-full text-left p-2 rounded text-xs transition-all ${
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
                <Loader2 className="animate-spin text-gray-600" size={16} />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
        {!surveyState.isComplete && surveyState.question && 
         !answeredQuestions.has(surveyState.question.id) && (
          <div className="border-t border-gray-200 p-4 bg-white">
            {surveyState.question.type === 'file' && (
              <div className="mb-3">
                <UploadButton
                  endpoint="chatSurveyUploader"
                  onClientUploadComplete={(res) => {
                    if (res) {
                      handleFileUpload(res.map(f => ({ url: f.url, name: f.name })));
                    }
                  }}
                  onUploadError={(error) => {
                    alert(`შეცდომა! ${error.message}`);
                  }}
                  className=""
                  content={{
                    button: "აირჩიეთ ფაილი",
                    allowedContent: "ფაილი არ არის არჩეული"
                  }}
                />
                {uploadedFile && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ ფაილი ატვირთულია: {uploadedFile.name}
                  </div>
                )}
              </div>
            )}

            {surveyState.question.type === 'text' && (
              <div className="mb-3">
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="ჩაწერეთ თქვენი პასუხი..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  rows={3}
                />
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={submitAnswer}
                disabled={!canSubmit() || isLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  canSubmit() && !isLoading
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    გაგზავნა...
                  </>
                ) : (
                  <>
                    გაგზავნა
                    <Send size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
