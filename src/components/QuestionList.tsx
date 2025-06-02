// src/components/QuestionList.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import QuestionCard, { QuestionCardProps } from './QuestionCard';
import Spinner from './Spinner'; // Import Spinner

interface QuestionListProps {
  selectedCategory: string | null; // 'all', 'AI', '都市伝説', 'その他', or null for all
}

export default function QuestionList({ selectedCategory }: QuestionListProps) {
  const [questions, setQuestions] = useState<QuestionCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentSort, setCurrentSort] = useState<string>('createdAt'); // Added sort state
  const limit = 10; // Fixed limit as per requirements

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/questions?page=${currentPage}&limit=${limit}&sort=${currentSort}`; // Added sort to URL
      if (selectedCategory && selectedCategory.toLowerCase() !== 'all') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      } else {
        // Ensure category parameter is not empty if 'all' or null
        url += `&category=all`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.statusText}`);
      }
      const data = await response.json();
      setQuestions(data.questions || []); // Ensure questions is always an array
      setTotalCount(data.totalCount || 0);
      // If API returned limit, we could set it: setLimit(data.limit);
    } catch (err: any) {
      setError(err.message);
      setQuestions([]); // Clear questions on error
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, limit, currentSort]); // Added currentSort dependency

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Reset to page 1 when sort order changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentSort]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading && questions.length === 0) return <Spinner />; // Show spinner only on initial load or if questions are empty
  if (error) return <p className="text-red-500 text-center py-4">Error: {error}</p>;

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  return (
    <div>
      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
        <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          並び替え:
        </label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => setCurrentSort(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="createdAt">投稿日時順</option>
          <option value="likes">いいね数順</option>
          <option value="nannotokis">「何の時間だよ」数順</option>
        </select>
      </div>

      {questions.length > 0 ? (
        questions.map((question) => (
          <QuestionCard key={question.id} {...question} />
        ))
      ) : (
        !loading && <p className="text-center py-4">該当する質問はありません。</p>
        // Show "no questions" only if not loading and totalCount is 0 (implicitly, as questions would be empty)
        // Or if totalCount > 0 but current page has no items (which shouldn't happen with correct totalCount)
      )}

      {totalCount > 0 && (
        <div className="mt-8 flex flex-col items-center space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-semibold">{startItem}</span>
            {' - '}
            <span className="font-semibold">{endItem}</span>
            {' of '}
            <span className="font-semibold">{totalCount}</span> questions
          </p>
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
