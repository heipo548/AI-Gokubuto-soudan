// src/app/api/admin/answers/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary'; // Import cloudinary instance
import { Readable } from 'stream';

// Helper function to convert a file stream to a buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function POST(request: Request) {
  // TODO: Implement authentication/authorization for admin access
  try {
    const formData = await request.formData();

    const question_id_str = formData.get('question_id') as string;
    const content = formData.get('content') as string;
    const responder = formData.get('responder') as string;
    const link_url = formData.get('link_url') as string | null; // Can be null
    const imageFile = formData.get('image') as File | null; // Optional image file

    if (!question_id_str || !content || !responder) {
      return NextResponse.json({ error: 'Question ID, content, and responder are required' }, { status: 400 });
    }

    const question_id = parseInt(question_id_str, 10);
    if (isNaN(question_id)) {
        return NextResponse.json({ error: 'Invalid Question ID format' }, { status: 400 });
    }

    // Check if question exists
    const question = await prisma.question.findUnique({ where: { id: question_id } });
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    let uploadedImageUrl: string | undefined = undefined;

    if (imageFile && imageFile.size > 0) {
      // Convert File stream to buffer
      const imageBuffer = await streamToBuffer(imageFile.stream() as any as Readable);

      // Upload to Cloudinary
      // The `upload_stream` method requires a readable stream.
      // We convert buffer back to stream for this.
      const uploadResult = await new Promise<{ secure_url?: string, error?: any }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'ai_qna_answers' }, // Optional: folder in Cloudinary
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result || {});
            }
          }
        );
        // Create a new readable stream from the buffer and pipe it
        Readable.from(imageBuffer).pipe(uploadStream);
      });

      if (uploadResult.error || !uploadResult.secure_url) {
        console.error('Cloudinary upload error:', uploadResult.error);
        return NextResponse.json({ error: 'Image upload failed.' }, { status: 500 });
      }
      uploadedImageUrl = uploadResult.secure_url;
    }

    const newAnswer = await prisma.answer.create({
      data: {
        question_id,
        content,
        image_url: uploadedImageUrl || (formData.get('existing_image_url') as string) || null, // Keep existing if no new file and existing_image_url is passed
        link_url: link_url || null,
        responder,
      },
    });

    // It's important to also update the question status to 'answered' here
    // This was previously done on the client-side AnswerEditorPage,
    // but should ideally be part of this atomic backend operation.
    await prisma.question.update({
      where: { id: question_id },
      data: { status: 'answered' },
    });


    return NextResponse.json(newAnswer, { status: 201 });
  } catch (error: any) {
    console.error('Error creating answer:', error);
    // More specific error for zod validation or prisma
    if (error.name === 'ZodError') {
         return NextResponse.json({ error: 'Invalid data format', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create answer', details: error.message }, { status: 500 });
  }
}
