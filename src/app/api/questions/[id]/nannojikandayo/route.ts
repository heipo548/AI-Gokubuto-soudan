// src/app/api/questions/[id]/nannojikandayo/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getClientIp } from 'request-ip';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = parseInt(params.id, 10);
    if (isNaN(questionId)) {
      return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
    }

    const ipAddress = getClientIp(request);

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    try {
      await prisma.nannoJikanDayoClick.create({
        data: {
          question_id: questionId,
          ip_address: ipAddress || null,
        },
      });
      const clickCount = await prisma.nannoJikanDayoClick.count({ where: { question_id: questionId } });
      return NextResponse.json({ message: 'Nanno Jikan Dayo click recorded successfully', nannoJikanDayoClickCount: clickCount }, { status: 201 });
    } catch (e: any) {
      if (e.code === 'P2002') { // Prisma unique constraint violation code
        // Fetch the current count even if it was already clicked
        const clickCount = await prisma.nannoJikanDayoClick.count({ where: { question_id: questionId } });
        return NextResponse.json({ error: 'You have already clicked this.', nannoJikanDayoClickCount: clickCount }, { status: 409 });
      }
      throw e; // Re-throw other errors
    }

  } catch (error) {
    console.error(`Error recording Nanno Jikan Dayo click for question ${params.id}:`, error);
    // It's good practice to avoid sending back raw error messages from dependencies if they might contain sensitive info.
    // However, for internal errors during development, more detail can be helpful.
    const errorMessage = error instanceof Error ? error.message : 'Failed to record click';
    return NextResponse.json({ error: 'Failed to record click', details: errorMessage }, { status: 500 });
  }
}
