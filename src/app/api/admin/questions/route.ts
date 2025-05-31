import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/admin/questions - Fetch all questions for admin
export async function GET(request: Request) {
  // TODO: Implement authentication/authorization for admin access
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // e.g., 'pending', 'answered'

  try {
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const questions = await prisma.question.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc',
      },
      // Optionally include more details if needed for admin view
      // include: { _count: { select: { answers: true } } }
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching admin questions:', error);
    return NextResponse.json({ error: 'Failed to fetch admin questions' }, { status: 500 });
  }
}
