// src/components/InteractionSection.tsx
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import { Comment } from '@prisma/client'; // Adjust import as needed

interface InteractionSectionProps {
  questionId: number;
  initialLikes: number;
  initialComments: Comment[];
}

export default function InteractionSection({ questionId, initialLikes, initialComments }: InteractionSectionProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <h3 className="text-xl font-semibold mb-4">リアクション</h3>
      <div className="mb-6">
        <LikeButton questionId={questionId} initialLikes={initialLikes} />
      </div>
      <hr className="my-6"/>
      <CommentSection questionId={questionId} initialComments={initialComments} />
    </div>
  );
}
