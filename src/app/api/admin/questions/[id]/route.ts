// src/app/api/admin/questions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming prisma client is setup at lib/prisma

interface RequestParams {
  params: {
    id: string;
  };
}

interface QuestionPutRequestBody {
  admin_conclusion: string | null;
}

export async function GET(request: NextRequest, { params }: RequestParams) {
  const { id } = params;

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json({ error: 'Valid Question ID is required' }, { status: 400 });
  }

  const questionId = parseInt(id);

  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        status: true,
        created_at: true,
        updated_at: true,
        admin_conclusion: true,
        admin_conclusion_updated_at: true,
        answers: true, // Include answers relation
        // Optionally, include comments and _count for likes/nannoJikanDayoClicks if needed by admin page
        // comments: true,
        // _count: { select: { likes: true, nannoJikanDayoClicks: true } },
      },
    });

    if (!question) {
      return NextResponse.json({ error: `Question with ID ${questionId} not found` }, { status: 404 });
    }

    return NextResponse.json(question, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching question ${questionId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch question due to a server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RequestParams) {
  const { id } = params;

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json({ error: 'Valid Question ID is required' }, { status: 400 });
  }

  const questionId = parseInt(id);

  let requestBody: QuestionPutRequestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { admin_conclusion } = requestBody;

  if (admin_conclusion !== null && typeof admin_conclusion === 'string' && admin_conclusion.length > 500) {
    return NextResponse.json({ error: 'admin_conclusion must be 500 characters or less' }, { status: 400 });
  }

  try {
    // First, check if the question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      return NextResponse.json({ error: `Question with ID ${questionId} not found` }, { status: 404 });
    }

    let dataToUpdate: { admin_conclusion: string | null; admin_conclusion_updated_at: Date | null };

    if (admin_conclusion === null) {
      dataToUpdate = {
        admin_conclusion: null,
        admin_conclusion_updated_at: null,
      };
    } else {
      dataToUpdate = {
        admin_conclusion: admin_conclusion, // This can be an empty string
        admin_conclusion_updated_at: new Date(),
      };
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: dataToUpdate,
      select: { // Select the fields to return, similar to GET
        id: true,
        title: true,
        content: true,
        category: true,
        status: true,
        created_at: true,
        updated_at: true,
        admin_conclusion: true,
        admin_conclusion_updated_at: true,
      }
    });

    return NextResponse.json(updatedQuestion, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating question ${questionId}:`, error);
    // Prisma's P2025 can also occur here if the record to update is not found,
    // though we explicitly check above.
    if (error.code === 'P2025') {
      return NextResponse.json({ error: `Question with ID ${questionId} not found during update` }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update question due to a server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RequestParams) {
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
