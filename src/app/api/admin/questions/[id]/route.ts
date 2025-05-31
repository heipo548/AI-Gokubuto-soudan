import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT /api/admin/questions/[id] - Update question status
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // TODO: Implement authentication/authorization for admin access
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body; // e.g., 'pending', 'answered'

    if (!status || (status !== 'pending' && status !== 'answered')) {
      return NextResponse.json({ error: 'Invalid status value. Must be "pending" or "answered".' }, { status: 400 });
    }

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: { status },
    });

    if (!updatedQuestion) {
      return NextResponse.json({ error: 'Question not found or failed to update' }, { status: 404 });
    }
    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error(`Error updating question ${params.id} status:`, error);
    // Add specific error handling for Prisma P2025 (Record to update not found)
    if ((error as any).code === 'P2025') {
         return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update question status' }, { status: 500 });
  }
}
