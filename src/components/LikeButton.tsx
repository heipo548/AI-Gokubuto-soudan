// src/components/LikeButton.tsx
'use client';
import { useState, useEffect } from 'react';

interface LikeButtonProps {
  questionId: number;
  initialLikes: number;
}

export default function LikeButton({ questionId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false); // Local state to give immediate feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check localStorage if user has liked this question before (simple anonymous tracking)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const likedStatus = localStorage.getItem(`question_${questionId}_liked`);
      if (likedStatus === 'true') {
        setIsLiked(true);
      }
    }
  }, [questionId]);

  const handleLike = async () => {
    if (isLiked) {
      // Optional: Implement unliking, or just prevent multiple likes from same client session
      setError("You've already liked this.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/questions/${questionId}/like`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to like');
      }
      setLikes(data.likeCount);
      setIsLiked(true); // Visual feedback
      if (typeof window !== 'undefined') {
        localStorage.setItem(`question_${questionId}_liked`, 'true');
      }
    } catch (err: any) {
      setError(err.message);
      // If server says already liked (e.g. by IP), update local state too
      if (err.message && err.message.includes("already liked")) {
        setIsLiked(true);
         if (typeof window !== 'undefined') {
           localStorage.setItem(`question_${questionId}_liked`, 'true');
         }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleLike}
        disabled={isLiked || isLoading}
        className={`font-bold py-2 px-4 rounded transition-colors duration-150
                    ${isLiked ? 'bg-red-300 text-red-700 cursor-not-allowed'
                             : 'bg-red-500 hover:bg-red-700 text-white'}
                    ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
      >
        {isLiked ? 'いいね済み' : 'いいね！'} ({likes})
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
