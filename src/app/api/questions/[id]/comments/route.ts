// src/app/api/questions/[id]/comments/route.ts
import { NextResponse, NextRequest } from 'next/server'; // Import NextRequest
import prisma from '@/lib/prisma';
import { getClientIp } from 'request-ip';

export async function POST(
  request: NextRequest, // Type request as NextRequest
  { params }: { params: { id: string } }
) {
  try {
    const questionId = parseInt(params.id, 10);
    if (isNaN(questionId)) {
      return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
    }

    const body = await request.json();
    const { content, commenter_name } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Comment content cannot be empty' }, { status: 400 });
    }

    // Validate content length (e.g., 500 chars as per design doc)
    if (content.length > 500) {
        return NextResponse.json({ error: 'Comment content must be 500 characters or less.' }, { status: 400 });
    }


    // Check if question exists
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    let ipAddress: string | null = null;
    try {
      ipAddress = getClientIp(request as any);
    } catch (ipError) {
      console.error("Failed to get IP address:", ipError);
      ipAddress = "unknown_ip_retrieval_failed";
    }

    const newComment = await prisma.comment.create({
      data: {
        question_id: questionId,
        content,
        commenter_name: commenter_name || '匿名', // Default to 匿名 if not provided
        ip_address: ipAddress || 'unknown_ip_fallback', // Ensure a fallback if still null
      },
    });
    return NextResponse.json(newComment, { status: 201 });

  } catch (error) {
    console.error(`Error adding comment to question ${params.id}:`, error);
    // Ensure a proper error structure is returned
    const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
