// src/app/api/questions/[id]/nannojikandayo/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getClientIp } from 'request-ip'; // May need to install request-ip: npm install request-ip @types/request-ip

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const questionId = parseInt(params.id, 10);
  const clientIp = getClientIp(request);

  if (isNaN(questionId)) {
    return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
  }

  try {
    // Conceptual: Check if this IP has already clicked this button for this question
    // This requires the NannoJikanDayoClick model in the schema and a migration.
    // For now, we'll simulate this check. If the model existed, it would be:
    /*
    if (clientIp) {
      const existingClick = await prisma.nannoJikanDayoClick.findUnique({
        where: {
          question_id_ip_address: { // This compound key name is Prisma's default
            question_id: questionId,
            ip_address: clientIp,
          },
        },
      });

      if (existingClick) {
        // Fetch the current count without incrementing if already clicked
        const question = await prisma.question.findUnique({
          where: { id: questionId },
          select: { nannoJikanDayoCount: true },
        });
        return NextResponse.json({
          message: 'You have already clicked this today for this question.',
          nannoJikanDayoCount: question?.nannoJikanDayoCount ?? 0,
        }, { status: 403 }); // Forbidden or a custom status
      }
    }
    */

    // If the NannoJikanDayoClick model and migration were applied:
    // 1. Create the click record
    /*
    if (clientIp) {
      await prisma.nannoJikanDayoClick.create({
        data: {
          question_id: questionId,
          ip_address: clientIp,
        },
      });
    }
    */

    // 2. Increment the count
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        nannoJikanDayoCount: {
          increment: 1,
        },
      },
      select: {
        nannoJikanDayoCount: true,
      },
    });

    return NextResponse.json({
      nannoJikanDayoCount: updatedQuestion.nannoJikanDayoCount,
    });
  } catch (error: any) {
    console.error('Error incrementing nannoJikanDayoCount:', error);
    // Check for specific Prisma errors, e.g., if the record to update doesn't exist
    if (error.code === 'P2025') { // Prisma code for "Record to update not found"
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update count', details: error.message },
      { status: 500 }
    );
  }
}
