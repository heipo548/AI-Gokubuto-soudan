// src/components/QuestionList.tsx
'use client'; // This component will fetch data

import { useEffect, useState } from 'react';
import QuestionCard, { QuestionCardProps } from './QuestionCard';

export default function QuestionList() {
  const [questions, setQuestions] = useState<QuestionCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const response = await fetch('/api/questions');
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
  }, []);

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (questions.length === 0) return <p>まだ質問はありません。</p>;

  return (
    <div>
      {questions.map((question) => (
        <QuestionCard key={question.id} {...question} />
      ))}
    </div>
  );
}
