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
        id: true,
        title: true,
        content: true,
        category: true,
        status: true,
        submitter_nickname: true,
        created_at: true,
        updated_at: true,
        notification_token: true, // Assuming this is a field you want to return
        nannoJikanDayoCount: true, // Explicitly select nannoJikanDayoCount
        answers: {
          // Define what fields of answers you need, or true for all
          // For example:
          select: {
            id: true,
            content: true,
            responder: true,
            created_at: true,
            image_url: true,
            link_url: true,
            // question_id: true, // usually not needed if you have the question context
          }
        },
        comments: {
          orderBy: {
            created_at: 'asc',
          },
          // Define what fields of comments you need, or true for all
          // For example:
          select: {
            id: true,
            content: true,
            commenter_name: true,
            created_at: true,
            // question_id: true, // usually not needed
          }
        },
        _count: {
          select: { likes: true },
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
