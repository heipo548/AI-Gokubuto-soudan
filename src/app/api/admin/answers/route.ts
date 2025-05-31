import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/admin/answers - Create a new answer
export async function POST(request: Request) {
  // TODO: Implement authentication/authorization for admin access
  try {
    const body = await request.json();
    const { question_id, content, image_url, link_url, responder } = body;

    if (!question_id || !content || !responder) {
      return NextResponse.json({ error: 'Question ID, content, and responder are required' }, { status: 400 });
    }

    // Check if question exists
    const question = await prisma.question.findUnique({ where: { id: question_id } });
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const newAnswer = await prisma.answer.create({
      data: {
        question_id,
        content,
        image_url,
        link_url,
        responder,
      },
    });

    // Optionally, update the question status to 'answered'
    // await prisma.question.update({
    //   where: { id: question_id },
    //   data: { status: 'answered' },
    // });

    return NextResponse.json(newAnswer, { status: 201 });
  } catch (error) {
    console.error('Error creating answer:', error);
    return NextResponse.json({ error: 'Failed to create answer' }, { status: 500 });
  }
}
