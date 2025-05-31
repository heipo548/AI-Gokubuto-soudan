// src/components/InteractionSection.tsx
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import { Comment } from '@prisma/client'; // Adjust import as needed
import NannoJikanDayoButton from './NannoJikanDayoButton';

interface InteractionSectionProps {
  questionId: number;
  initialLikes: number;
  initialNannoJikanDayoCount: number; // Add this line
  initialComments: Comment[];
}

export default function InteractionSection({ questionId, initialLikes, initialNannoJikanDayoCount, initialComments }: InteractionSectionProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <h3 className="text-xl font-semibold mb-4">リアクション</h3>
      <div className="mb-6 flex space-x-4"> {/* Added flex and space-x-4 for layout */}
        <LikeButton questionId={questionId} initialLikes={initialLikes} />
        <NannoJikanDayoButton questionId={questionId} initialCount={initialNannoJikanDayoCount} />
      </div>
      <hr className="my-6"/>
      <CommentSection questionId={questionId} initialComments={initialComments} />
    </div>
  );
}
