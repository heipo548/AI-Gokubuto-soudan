import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust path if needed

// GET /api/questions - Fetch all questions
export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

// POST /api/questions - Create a new question
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, category, notification_token } = body;

    // Basic validation (more comprehensive validation should be added)
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const newQuestion = await prisma.question.create({
      data: {
        title,
        content,
        category,
        notification_token,
        // status is 'pending' by default
      },
    });
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    // Consider more specific error handling for Prisma errors if needed
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
