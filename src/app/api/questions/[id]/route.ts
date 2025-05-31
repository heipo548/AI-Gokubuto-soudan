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
            answers: true, // Existing
            comments: { // Include comments
              orderBy: {
                created_at: 'asc', // Show oldest comments first
              },
            },
            _count: { // Include count of likes
              select: {
                likes: true,
                nannoJikanDayoClicks: true,
              },
            },
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
