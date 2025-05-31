// src/components/CommentSection.tsx
'use client';
import { useState, useEffect } from 'react';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { Comment } from '@prisma/client'; // Adjust import as needed

interface CommentSectionProps {
  questionId: number;
  initialComments: Comment[];
}

export default function CommentSection({ questionId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prevComments) => [...prevComments, newComment]);
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-3">コメント</h3>
      <CommentList comments={comments} />
      <CommentForm questionId={questionId} onCommentAdded={handleCommentAdded} />
    </div>
  );
}
