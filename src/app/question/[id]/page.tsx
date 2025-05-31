// src/app/question/[id]/page.tsx
'use client'; // This page fetches data on the client side

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // To get [id] from URL
import QuestionDetailDisplay, { QuestionProps } from '@/components/QuestionDetail';
import AnswerSection, { AnswerProps as AnswerData } from '@/components/AnswerSection';
import InteractionSection from '@/components/InteractionSection';

// Define a type for the combined question data including answers
import { Comment } from '@prisma/client'; // Assuming Comment type from Prisma

interface FullQuestionData extends QuestionProps {
  id: number; // Ensure id is part of the main data
  answers?: AnswerData[]; // Answers are optional
  comments: Comment[]; // From Prisma include
  _count: { likes: number }; // From Prisma include
}

export default function QuestionPage() {
  const params = useParams();
  const id = params?.id as string; // Or handle array/undefined if your routing is different

  const [questionData, setQuestionData] = useState<FullQuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      async function fetchQuestionData() {
        try {
          setLoading(true);
          const response = await fetch(`/api/questions/${id}`);
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error('Question not found.');
            }
            throw new Error(`Failed to fetch question: ${response.statusText}`);
          }
          const data: FullQuestionData = await response.json();
          setQuestionData(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchQuestionData();
    } else {
      // Handle case where id is not available, though Next.js routing should ensure it
      setError("Question ID is missing.");
      setLoading(false);
    }
  }, [id]);

  if (loading) return <div className="container mx-auto p-4"><p>Loading question details...</p></div>;
  if (error) return <div className="container mx-auto p-4"><p className="text-red-500">Error: {error}</p></div>;
  if (!questionData) return <div className="container mx-auto p-4"><p>Question not found.</p></div>;

  return (
    <div className="container mx-auto p-4">
      <QuestionDetailDisplay
        title={questionData.title}
        content={questionData.content}
        category={questionData.category}
        created_at={questionData.created_at}
      />
      <AnswerSection answers={questionData.answers} />
      <InteractionSection
        questionId={questionData.id}
        initialLikes={questionData._count?.likes || 0}
        initialComments={questionData.comments || []}
      />
    </div>
  );
}
