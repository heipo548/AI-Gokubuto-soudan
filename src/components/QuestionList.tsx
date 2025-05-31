// src/components/QuestionList.tsx
'use client';

import { useEffect, useState } from 'react';
import QuestionCard, { QuestionCardProps } from './QuestionCard';

interface QuestionListProps {
  selectedCategory: string | null; // 'all', 'AI', '都市伝説', 'その他', or null for all
}

export default function QuestionList({ selectedCategory }: QuestionListProps) {
  const [questions, setQuestions] = useState<QuestionCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        setError(null); // Reset error on new fetch
        let url = '/api/questions';
        if (selectedCategory && selectedCategory.toLowerCase() !== 'all') {
          url += `?category=${encodeURIComponent(selectedCategory)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.statusText}`);
        }
        const data = await response.json();
        setQuestions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [selectedCategory]); // Re-fetch when selectedCategory changes

  if (loading) return <p className="text-center py-4">Loading questions...</p>;
  if (error) return <p className="text-red-500 text-center py-4">Error: {error}</p>;
  if (questions.length === 0) return <p className="text-center py-4">該当する質問はありません。</p>;

  return (
    <div>
      {questions.map((question) => (
        <QuestionCard key={question.id} {...question} />
      ))}
    </div>
  );
}
