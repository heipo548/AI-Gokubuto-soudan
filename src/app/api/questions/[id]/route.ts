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
      select: {
        // Explicitly list all scalar fields you want to return
        id: true,
        title: true,
        content: true,
        category: true,
        status: true,
        notification_token: true,
        submitter_nickname: true,
        created_at: true,
        updated_at: true,
        admin_conclusion: true, // Added field
        admin_conclusion_updated_at: true, // Added field
        // Include relations as before
        answers: true,
        comments: {
          orderBy: {
            created_at: 'asc',
          },
        },
        _count: {
          select: {
            likes: true,
            // nannoJikanDayoClicks: true, // Ensure this is commented if not needed
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
