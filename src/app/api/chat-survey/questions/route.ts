import { NextRequest, NextResponse } from 'next/server';
import { SURVEY_QUESTIONS } from '../route';

// Get survey questions
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    questions: SURVEY_QUESTIONS
  });
}

