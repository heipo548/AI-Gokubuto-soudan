// src/app/api/questions/[id]/like/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getClientIp } from 'request-ip'; // Helper to get IP, might need 'npm install request-ip @types/request-ip'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = parseInt(params.id, 10);
    if (isNaN(questionId)) {
      return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
    }

    // For anonymity, the design mentions IP address for uniqueness.
    // Getting IP address in Next.js API routes can be tricky.
    // 'request-ip' is one way, or use headers.
    // Note: IP can be spoofed. For robust unique "anonymous" liking, other strategies might be needed.
   const ipAddress = getClientIp(request as any);
    // Check if question exists
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Create the like, Prisma schema handles uniqueness for question_id + ip_address
    try {
      const newLike = await prisma.like.create({
        data: {
          question_id: questionId,
          ip_address: ipAddress || null, // Store null if IP is not found
        },
      });
      // Return the new like count
      const likeCount = await prisma.like.count({ where: { question_id: questionId } });
      return NextResponse.json({ message: 'Liked successfully', likeCount }, { status: 201 });
    } catch (e: any) {
      // Check for unique constraint violation (already liked)
      if (e.code === 'P2002') { // Prisma unique constraint violation code
        return NextResponse.json({ error: 'You have already liked this question.' }, { status: 409 });
      }
      throw e; // Re-throw other errors
    }

  } catch (error) {
    console.error(`Error liking question ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to like question' }, { status: 500 });
  }
}
