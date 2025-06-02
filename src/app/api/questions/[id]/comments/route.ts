// src/app/api/questions/[id]/comments/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// import { getClientIp } from 'request-ip'; // We'll use headers directly for more transparent logging

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('[Comment API] Received new comment request.');
  console.log('[Comment API] Request Headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));

  try {
    const questionId = parseInt(params.id, 10);
    console.log(`[Comment API] Parsed questionId: ${questionId}`);

    if (isNaN(questionId)) {
      console.error('[Comment API] Invalid question ID:', params.id);
      return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
    }

    const body = await request.json();
    console.log('[Comment API] Request Body:', body);
    const { content, commenter_name } = body;

    if (!content || content.trim() === '') {
      console.error('[Comment API] Comment content cannot be empty. Received:', content);
      return NextResponse.json({ error: 'Comment content cannot be empty' }, { status: 400 });
    }

    if (content.length > 500) {
      console.error('[Comment API] Comment content too long. Length:', content.length);
      return NextResponse.json({ error: 'Comment content must be 500 characters or less.' }, { status: 400 });
    }

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      console.error(`[Comment API] Question not found for ID: ${questionId}`);
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    console.log(`[Comment API] Verified question exists:`, question);

    // Enhanced IP Address Logging
    const fwdFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfIp = request.headers.get('cf-connecting-ip');
    console.log(`[Comment API] IP Headers: x-forwarded-for: ${fwdFor}, x-real-ip: ${realIp}, cf-connecting-ip: ${cfIp}`);

    const ipAddress = fwdFor || realIp || cfIp || 'unknown';
    console.log(`[Comment API] Derived IP Address: ${ipAddress}`);

    const commentData = {
      question_id: questionId,
      content,
      commenter_name: commenter_name || '匿名',
      ip_address: ipAddress === 'unknown' ? null : ipAddress, // Store null if 'unknown' or ensure it fits schema
    };
    console.log('[Comment API] Data for prisma.comment.create:', JSON.stringify(commentData, null, 2));

    const newComment = await prisma.comment.create({
      data: commentData,
    });
    console.log('[Comment API] Comment created successfully:', newComment);
    return NextResponse.json(newComment, { status: 201 });

  } catch (error: any) {
    // Log the full error object for more details, not just error.message
    console.error(`[Comment API] Error adding comment to question ${params.id}:`, error);
    // It might be useful to log specific parts of the error if it's a Prisma known error
    if (error.code) { // Prisma errors often have a 'code'
        console.error(`[Comment API] Prisma Error Code: ${error.code}`);
    }
    if (error.meta) { // And 'meta' for more details
        console.error(`[Comment API] Prisma Error Meta:`, error.meta);
    }
    // Also log the error stack
    console.error(`[Comment API] Error Stack:`, error.stack);

    return NextResponse.json({ error: 'Failed to add comment. Check server logs for details.' }, { status: 500 });
  }
}
