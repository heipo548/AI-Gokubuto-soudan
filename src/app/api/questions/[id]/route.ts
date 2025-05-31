import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust path if needed

// GET /api/questions/[id] - Fetch a single question by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        answers: true, // Include related answers
        // likes: true,    // Decide if likes and comments are needed here or fetched separately
        // comments: true,
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    return NextResponse.json(question);
  } catch (error) {
    console.error(`Error fetching question ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}
