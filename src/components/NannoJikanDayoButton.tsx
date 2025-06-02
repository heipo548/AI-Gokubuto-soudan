// src/components/NannoJikanDayoButton.tsx
'use client';
import { useState, useEffect } from 'react';

interface NannoJikanDayoButtonProps {
  questionId: number;
  initialCount: number;
}

const messages = [
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
  const [isClicked, setIsClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayedMessage, setDisplayedMessage] = useState<string | null>(null);

  const storageKey = `question_${questionId}_nannojikandayo_clicked`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const clickedStatus = localStorage.getItem(storageKey);
      if (clickedStatus === 'true') {
        setIsClicked(true);
      }
    }
  }, [storageKey]);

  const handleClick = async () => {
    if (isClicked && !displayedMessage) { // Allow re-click if message not shown or to show a new random one
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setDisplayedMessage(randomMessage);
        // Optionally, clear message after a few seconds
        setTimeout(() => setDisplayedMessage(null), 5000); // Clears after 5 seconds
        return;
    }
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    // setDisplayedMessage(null); // Clear previous message immediately if any

    try {
      const response = await fetch(`/api/questions/${questionId}/nannojikandayo`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok && response.status !== 409) { // 409 is "already clicked", which is fine
        throw new Error(data.error || 'Failed to record click');
      }

      setCount(data.nannoJikanDayoClickCount);
      setIsClicked(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, 'true');
      }

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setDisplayedMessage(randomMessage);
      // Optionally, clear message after a few seconds
      setTimeout(() => setDisplayedMessage(null), 7000); // Display for 7 seconds

    } catch (err: any) {
      setError(err.message);
      // Do not show random message on error, only if click was somehow recorded or already present
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-2 relative"> {/* Added relative for potential future positioning needs, not strictly necessary for fixed popup */}
      <button
        onClick={handleClick}
        disabled={isLoading} // Only disable while loading, allow re-clicks if already isClicked to show message again
        className={`font-bold py-2 px-4 rounded transition-colors duration-150
                    ${isClicked ? 'bg-teal-300 text-teal-700' // Different color for clicked state
                               : 'bg-teal-500 hover:bg-teal-700 text-white'}
                    ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
      >
        何の時間だよ ({count})
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>} {/* Added mt-2 for spacing if message is also shown */}
      {displayedMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 shadow-xl rounded-lg">
          <p className="text-xl font-semibold">{displayedMessage}</p>
        </div>
      )}
    </div>
  );
}
