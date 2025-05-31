// src/app/api/notifications/status/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Notification token is required' }, { status: 400 });
  }

  try {
    const question = await prisma.question.findFirst({
      where: {
        notification_token: token,
      },
      select: {
        id: true,
        title: true,
        status: true,
        // You could also select 'updated_at' if you want to show "answered X time ago"
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'No question found for this token' }, { status: 404 });
    }

    // If the question is found, return its ID, title, and status
    return NextResponse.json(question);

  } catch (error) {
    console.error('Error fetching notification status:', error);
    return NextResponse.json({ error: 'Failed to fetch notification status' }, { status: 500 });
  }
}
