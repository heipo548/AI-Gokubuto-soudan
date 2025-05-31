// src/components/AdminQuestionList.tsx
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export interface AdminQuestionProps {
  id: number;
  title: string;
  status: string; // 'pending', 'answered'
  created_at: string;
  // _count?: { answers: number }; // If you want to show answer count
}

interface AdminQuestionListProps {
  filterStatus: string; // 'all', 'pending', 'answered'
}

export default function AdminQuestionList({ filterStatus }: AdminQuestionListProps) {
  const [questions, setQuestions] = useState<AdminQuestionProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdminQuestions() {
      try {
        setLoading(true);
        let url = '/api/admin/questions';
        if (filterStatus !== 'all') {
          url += `?status=${filterStatus}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch admin questions: ${response.statusText}`);
        }
        const data = await response.json();
        setQuestions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminQuestions();
  }, [filterStatus]);

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (questions.length === 0) return <p>該当する質問はありません。</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="text-left py-3 px-4">タイトル</th>
            <th className="text-left py-3 px-4">ステータス</th>
                <th className="text-left py-3 px-4">投稿日</th>
            <th className="text-left py-3 px-4">アクション</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{q.title}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  q.status === 'answered' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                }`}>
                  {q.status === 'answered' ? '回答済み' : '未回答'}
                </span>
              </td>
              <td className="py-3 px-4">{new Date(q.created_at).toLocaleDateString('ja-JP')}</td>
              <td className="py-3 px-4">
                <Link href={`/admin/question/${q.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium">
                  回答する
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
