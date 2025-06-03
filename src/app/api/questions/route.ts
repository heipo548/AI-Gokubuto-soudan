import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Prismaの型をインポート

// GET /api/questions - Fetch all questions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentQuestionId = searchParams.get('currentQuestionId');
    const currentQuestionCreatedAt = searchParams.get('currentQuestionCreatedAt');

    if (currentQuestionId && currentQuestionCreatedAt) {
      // ... (前後の質問を取得するロジックは変更なし) ...
      const createdAtDate = new Date(currentQuestionCreatedAt);
      const currentQuestionIdInt = parseInt(currentQuestionId, 10);

      const previousQuestion = await prisma.question.findFirst({
        where: {
          created_at: {
            lt: createdAtDate,
          },
          id: {
            not: currentQuestionIdInt,
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        select: {
          id: true,
        },
      });

      const nextQuestion = await prisma.question.findFirst({
        where: {
          created_at: {
            gt: createdAtDate,
          },
          id: {
            not: currentQuestionIdInt,
          },
        },
        orderBy: {
          created_at: 'asc',
        },
        select: {
          id: true,
        },
      });

      return NextResponse.json({
        previousQuestionId: previousQuestion ? previousQuestion.id : null,
        nextQuestionId: nextQuestion ? nextQuestion.id : null,
      });

    } else {
      // Existing logic for fetching a list of questions
      const category = searchParams.get('category');
      const sort = searchParams.get('sort');
      const pageParam = searchParams.get('page');
      const search = searchParams.get('search');

      let page = pageParam ? parseInt(pageParam, 10) : 1;
      if (isNaN(page) || page < 1) {
        page = 1;
      }
      const limit = 10;
      const skip = (page - 1) * limit;

      const whereClause: Prisma.QuestionWhereInput = {}; // 型を Prisma.QuestionWhereInput に変更 (推奨)
      if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
        whereClause.category = category;
      }

      if (search && search.trim() !== '') {
        const keywords = search.trim().split(/\s+/);
        whereClause.AND = keywords.map(keyword => ({
          OR: [
            {
              title: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
            {
              content: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
          ],
        }));
      }

      const totalCount = await prisma.question.count({
        where: whereClause,
      });

      const questions = await prisma.question.findMany({
        where: whereClause,
        orderBy: getOrderBy(sort), // ここは変更なし
        take: limit,
        skip: skip,
      });

      return NextResponse.json({
        questions,
        totalCount,
        page,
        limit,
      });
    }
  } catch (error) {
    console.error('Error fetching questions or prev/next IDs:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// Helper function to determine orderBy clause
// ★★★ 戻り値に Prisma.QuestionOrderByWithRelationInput 型の注釈を追加 ★★★
function getOrderBy(sort: string | null): Prisma.QuestionOrderByWithRelationInput {
  switch (sort) {
    case 'likes':
      return { likes: { _count: 'desc' } };
    case 'nannotokis':
      return { nannoJikanDayoClicks: { _count: 'desc' } };
    case 'createdAt':
    default:
      return { created_at: 'desc' };
  }
}

// POST /api/questions - Create a new question
// ... (POSTメソッドの実装は変更なし) ...
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, category, notification_token, submitter_nickname } = body;

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
        submitter_nickname: finalNickname,
      },
    });
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return NextResponse.json({ error: 'Failed to create question. Please check server logs for details.' }, { status: 500 });
  }
}
