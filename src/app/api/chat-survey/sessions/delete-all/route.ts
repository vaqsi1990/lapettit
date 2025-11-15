import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Delete all chat sessions
export async function DELETE(request: NextRequest) {
  try {
    // Delete all sessions (responses and messages will be deleted automatically due to cascade)
    const result = await prisma.chatSession.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} session(s)`,
      deletedCount: result.count
    });
  } catch (error) {
    console.error('Error deleting all sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete all sessions' },
      { status: 500 }
    );
  }
}

