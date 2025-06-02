// src/components/QuestionNavigation.tsx
import Link from 'next/link';
import React from 'react'; // Import React for React.FC

interface QuestionNavigationProps {
  previousQuestionId: string | null;
  nextQuestionId: string | null;
}

const QuestionNavigation: React.FC<QuestionNavigationProps> = ({ previousQuestionId, nextQuestionId }) => {
  const commonButtonClasses = "font-bold py-2 px-4 rounded";
  const activeButtonClasses = `bg-blue-500 hover:bg-blue-700 text-white ${commonButtonClasses}`;
  const disabledButtonClasses = `bg-gray-300 text-gray-500 ${commonButtonClasses} cursor-not-allowed`;

  return (
    <div className="flex justify-between my-8"> {/* Increased margin to my-8 for more spacing */}
      {previousQuestionId ? (
        <Link href={`/question/${previousQuestionId}`} passHref>
          <button className={activeButtonClasses}>
            ← 前の質問へ
          </button>
        </Link>
      ) : (
        <span className={disabledButtonClasses}>
          ← 前の質問へ
        </span>
      )}

      {nextQuestionId ? (
        <Link href={`/question/${nextQuestionId}`} passHref>
          <button className={activeButtonClasses}>
            次の質問へ →
          </button>
        </Link>
      ) : (
        <span className={disabledButtonClasses}>
          次の質問へ →
        </span>
      )}
    </div>
  );
};

export default QuestionNavigation;
