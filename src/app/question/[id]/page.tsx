// src/app/question/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react'; // Added useCallback
import { useParams } from 'next/navigation';
import QuestionDetailDisplay, { QuestionProps } from '@/components/QuestionDetail'; // Ensure QuestionProps is exported or defined
import AnswerSection, { AnswerProps as AnswerData } from '@/components/AnswerSection'; // Ensure AnswerProps is exported or defined
import InteractionSection from '@/components/InteractionSection';
import { Comment } from '@prisma/client'; // Or local interface
import Spinner from '@/components/Spinner'; // Import Spinner

interface FullQuestionData extends QuestionProps {
  id: number;
  answers?: AnswerData[];
  comments: Comment[];
  _count: { likes: number };
  status: string; // Add status to FullQuestionData
  updated_at: string; // Add updated_at to track changes in answers
}

// NotificationStatus is not used in this version of the code, can be removed if not planned for future use.
// interface NotificationStatus {
//   id: number;
//   title: string;
//   status: string;
// }

// Assuming QuestionProps is exported from QuestionDetail.tsx or defined globally.
// If not, it would need to be defined here:
// export interface QuestionProps {
//   title: string;
//   content: string;
//   category?: string | null;
//   created_at: string;
// }


export default function QuestionPage() {
  const params = useParams();
  const id = params?.id as string;

  const [questionData, setQuestionData] = useState<FullQuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAnswerNotification, setShowAnswerNotification] = useState(false);
  const [userNotificationToken, setUserNotificationToken] = useState<string | null>(null);

  // Fetch initial question data
  const fetchQuestionData = useCallback(async () => {
    if (!id) return;
    // setError(null);
    // setLoading(true);
    try {
      const response = await fetch(`/api/questions/${id}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Question not found.');
        throw new Error(`Failed to fetch question: ${response.statusText}`);
      }
      const data: FullQuestionData = await response.json();
      setQuestionData(data);
      return data; // Return data for title update
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);


  useEffect(() => {
    setLoading(true);
    fetchQuestionData().then(data => {
      if (data?.title) {
        document.title = `${data.title} | AI極太相談室`;
      }
    });
  }, [fetchQuestionData, id]);


  // Notification Logic
  useEffect(() => {
    if (!id || !questionData) return;

    const tokenKey = `question_${id}`;
    const storedToken = localStorage.getItem(tokenKey);
    setUserNotificationToken(storedToken); // Store for dismissal logic

    if (storedToken) {
      // Use questionData.updated_at as part of the key to distinguish different "versions" of answers/status
      const viewedKey = `question_${id}_${storedToken}_answered_viewed_at_${questionData.updated_at}`;
      const alreadyViewed = localStorage.getItem(viewedKey);

      if (questionData.status === 'answered' && !alreadyViewed) {
        setShowAnswerNotification(true);
        // User must click to dismiss. Viewing is marked upon dismissal.
      } else if (questionData.status !== 'answered' && alreadyViewed) {
        // If status reverted from 'answered' after being viewed, clear the viewed flag for this version
        // This case is less likely in current flow but good for robustness
        localStorage.removeItem(viewedKey);
      }
    }
  }, [id, questionData]); // Re-run when questionData is fetched/updated (its status or updated_at might change)

  // Polling is simplified: notification appears if status is 'answered' on load/data refresh
  // and not yet marked 'viewed' for that specific questionData.updated_at timestamp.
  // A setInterval based polling could be added here if continuous background checks are needed.

  const dismissNotification = () => {
    setShowAnswerNotification(false);
    if (id && userNotificationToken && questionData) {
      const viewedKey = `question_${id}_${userNotificationToken}_answered_viewed_at_${questionData.updated_at}`;
      localStorage.setItem(viewedKey, 'true');
    }
  };

  if (loading) return <div className="container mx-auto p-4 flex justify-center"><Spinner /></div>;
  if (error) return <div className="container mx-auto p-4"><p className="text-red-500">Error: {error}</p></div>;
  if (!questionData) return <div className="container mx-auto p-4"><p>Question not found.</p></div>;

  return (
    <div className="container mx-auto p-4 relative">
      {showAnswerNotification && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-lg animate-fadeIn" role="alert"> {/* Added simple fadeIn animation suggestion */}
          <div className="flex">
            <div className="py-1"><svg className="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg></div>
            <div>
              <p className="font-bold">回答が届きました！</p>
              <p className="text-sm">あなたの質問「{questionData.title}」に新しい回答が投稿されました。</p>
            </div>
            <button onClick={dismissNotification} className="ml-auto -mx-1.5 -my-1.5 bg-green-100 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8" aria-label="Dismiss"> {/* Centered X */}
              <span className="sr-only">Dismiss</span>
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
            </button>
          </div>
        </div>
      )}

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
