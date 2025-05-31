// src/components/NannoJikanDayoButton.tsx
'use client';
import { useState, useEffect } from 'react';

interface NannoJikanDayoButtonProps {
  questionId: number;
  initialCount: number;
}

const HUMOROUS_ANSWERS = [
  "シャンプー切れたことに気付く時間だよ！",
  "プテラノドン復活を待つ時間だよ！",
  "お前が世界線を変える時間だよ！",
  "メンタルもやしを鍛える時間だよ！",
  "ダシ昆布を出汁に戻す時間だよ！",
  "北風がパスタを乾かす時間だよ！",
  "Wi-Fiが恋する時間だよ！",
  "左足だけ靴下脱ぐ時間だよ！",
  "スプーンを曲げずに曲がるのを待つ時間だよ！",
  "タピオカが目覚める時間だよ！"
];

export default function NannoJikanDayoButton({ questionId, initialCount }: NannoJikanDayoButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [isClickedSession, setIsClickedSession] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHumorModal, setShowHumorModal] = useState(false);
  const [currentHumor, setCurrentHumor] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const clickedStatus = localStorage.getItem(`question_${questionId}_nannojikandayo_clicked`);
      if (clickedStatus === 'true') {
        setIsClickedSession(true);
      }
    }
  }, [questionId]);

  const handleClick = async () => {
    if (isClickedSession) {
      setError("今日はもう押したよ！また明日ね。"); // Or some other message
      // Optionally, still show a random message if already clicked
      const randomHumor = HUMOROUS_ANSWERS[Math.floor(Math.random() * HUMOROUS_ANSWERS.length)];
      setCurrentHumor(randomHumor);
      setShowHumorModal(true);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/questions/${questionId}/nannojikandayo`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update count');
      }
      setCount(data.nannoJikanDayoCount);
      setIsClickedSession(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`question_${questionId}_nannojikandayo_clicked`, 'true');
      }

      const randomHumor = HUMOROUS_ANSWERS[Math.floor(Math.random() * HUMOROUS_ANSWERS.length)];
      setCurrentHumor(randomHumor);
      setShowHumorModal(true);

    } catch (err: any) {
      setError(err.message);
      if (err.message && err.message.includes("already clicked")) {
        setIsClickedSession(true);
         if (typeof window !== 'undefined') {
           localStorage.setItem(`question_${questionId}_nannojikandayo_clicked`, 'true');
         }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const closeHumorModal = () => {
    setShowHumorModal(false);
    setCurrentHumor('');
  };

  return (
    <div className="flex flex-col items-start space-y-2">
      <button
        onClick={handleClick}
        disabled={isLoading} // Removed isClickedSession from disabled to allow showing humor again
        className={`font-bold py-2 px-4 rounded transition-colors duration-150
                    ${isClickedSession ? 'bg-blue-300 text-blue-700' // Changed color for clicked state
                                     : 'bg-blue-500 hover:bg-blue-700 text-white'}
                    ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
      >
        何の時間だよ ({count})
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {showHumorModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeHumorModal} // Close on overlay click
        >
          <div
            className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
          >
            <p className="text-2xl md:text-3xl font-bold mb-6">{currentHumor}</p>
            <button
              onClick={closeHumorModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors duration-150 ease-in-out"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
