import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get messages for a session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await prisma.chatSession.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      messages: session.messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Send a message (user or admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, senderType, content, fileUrl, fileName, imageUrl } = body;

    console.log('Received message request:', { sessionId, senderType, contentLength: content?.length });

    if (!sessionId || !senderType || !content) {
      console.error('Missing required fields:', { sessionId: !!sessionId, senderType: !!senderType, content: !!content });
      return NextResponse.json(
        { success: false, error: 'Session ID, sender type, and content are required' },
        { status: 400 }
      );
    }

    if (!['user', 'admin'].includes(senderType)) {
      console.error('Invalid sender type:', senderType);
      return NextResponse.json(
        { success: false, error: 'Sender type must be "user" or "admin"' },
        { status: 400 }
      );
    }

    const session = await prisma.chatSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      console.error('Session not found:', sessionId);
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    console.log('Creating message for session:', { sessionId: session.id, senderType, content });

    const message = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        senderType,
        content,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        imageUrl: imageUrl || null,
        isRead: senderType === 'admin' ? false : true // Admin messages need to be read by user
      }
    });

    console.log('Message created successfully:', { messageId: message.id, senderType, content });

    return NextResponse.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

