// src/app/api/admin/questions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming prisma client is setup at lib/prisma

interface DeleteParams {
  params: {
    id: string;
  };
}

export async function DELETE(request: NextRequest, { params }: DeleteParams) {
  const { id } = params;

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json({ error: 'Valid Question ID is required' }, { status: 400 });
  }

  const questionId = parseInt(id);

  console.log(`Attempting to delete question with ID (from API route): ${questionId}`);

  try {
    // Attempt to delete the question
    // Prisma will automatically handle cascading deletes for related answers
    // if the schema is set up correctly with onDelete: Cascade
    await prisma.question.delete({
      where: {
        id: questionId,
      },
    });

    console.log(`Successfully deleted question with ID: ${questionId}`);
    return NextResponse.json({ message: `Question ${questionId} deleted successfully` }, { status: 200 });

  } catch (error: any) {
    console.error(`Error deleting question ${questionId}:`, error);

    // Check if the error is because the record was not found
    // Prisma's P2025 error code indicates "Record to delete not found."
    if (error.code === 'P2025') {
      return NextResponse.json({ error: `Question with ID ${questionId} not found` }, { status: 404 });
    }

    // For other errors, return a generic server error
    return NextResponse.json({ error: 'Failed to delete question due to a server error' }, { status: 500 });
  }
}
