import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/questions - Fetch all questions
export async function GET(request: Request) { // Add request parameter
  try {
    const { searchParams } = new URL(request.url); // Get searchParams from request.url
    const category = searchParams.get('category');

    const whereClause: any = {};
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      whereClause.category = category;
    }

    const questions = await prisma.question.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc',
      },
      // Optionally include like counts here if needed for the main list,
      // or keep it simpler and let the detail page fetch counts.
      // For MVP, keeping it simple.
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
    const { title, content, category, notification_token, submitter_nickname } = body;

    // Basic validation (more comprehensive validation should be added)
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const allowedCategories = ['AI', '都市伝説', 'その他'];
    if (!category || !allowedCategories.includes(category)) {
      return NextResponse.json({ error: '有効なカテゴリーを選択してください。' }, { status: 400 });
    }

    const finalNickname = submitter_nickname && submitter_nickname.trim() !== '' ? submitter_nickname.trim() : '匿名さん';

    const newQuestion = await prisma.question.create({
      data: {
        title,
        content,
        category,
        notification_token,
        submitter_nickname: finalNickname, // Use the processed nickname
        // status is 'pending' by default
      },
    });
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return NextResponse.json({ error: 'Failed to create question. Please check server logs for details.' }, { status: 500 });
  }
}
