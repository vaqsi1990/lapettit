import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Delete a specific response
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const responseId = parseInt(id);

    await prisma.chatResponse.delete({
      where: { id: responseId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting response:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

