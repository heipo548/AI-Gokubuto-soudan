// src/components/InteractionSection.tsx
import LikeButton from './LikeButton';
import NannoJikanDayoButton from './NannoJikanDayoButton'; // Add this
import CommentSection from './CommentSection';
import { Comment } from '@prisma/client'; // Adjust import as needed

interface InteractionSectionProps {
  questionId: number;
  initialLikes: number;
  initialNannoJikanDayoClicks: number; // Add this
  initialComments: Comment[];
}

export default function InteractionSection({
  questionId,
  initialLikes,
  initialNannoJikanDayoClicks, // Add this
  initialComments
}: InteractionSectionProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <h3 className="text-xl font-semibold mb-4">リアクション</h3>
      <div className="flex space-x-4 mb-6"> {/* Use flex to place buttons side-by-side */}
        <LikeButton questionId={questionId} initialLikes={initialLikes} />
        <NannoJikanDayoButton questionId={questionId} initialCount={initialNannoJikanDayoClicks} /> {/* Add this */}
      </div>
      <hr className="my-6"/>
      <CommentSection questionId={questionId} initialComments={initialComments} />
    </div>
  );
}
