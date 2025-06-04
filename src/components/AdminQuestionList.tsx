// src/components/AdminQuestionList.tsx
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export interface AdminQuestionProps {
  id: number;
  title: string;
  status: string; // 'pending', 'answered'
  created_at: string;
  admin_conclusion?: string | null; // Added for admin conclusion indicator
  // _count?: { answers: number }; // If you want to show answer count
}

interface AdminQuestionListProps {
  filterStatus: string; // 'all', 'pending', 'answered'
}

export default function AdminQuestionList({ filterStatus }: AdminQuestionListProps) {
  const [questions, setQuestions] = useState<AdminQuestionProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add a state for temporary success/error messages related to delete actions
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);


  const handleDelete = async (questionId: number) => {
    setDeleteMessage(null); // Clear previous messages
    setError(null); // Clear previous general errors

    if (window.confirm(`本当に質問ID: ${questionId} を削除しますか？この操作は取り消せません。`)) {
      try {
        const response = await fetch(`/api/admin/questions/${questionId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `質問ID: ${questionId} の削除に失敗しました。`);
        }

        // Update the UI by removing the deleted question from the list
        setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));
        setDeleteMessage(`質問ID: ${questionId} が正常に削除されました。`);

      } catch (err: any) {
        console.error('Deletion error:', err);
        setError(err.message || `質問ID: ${questionId} の削除中にエラーが発生しました。`);
      }
    }
  };

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
  // Error will be displayed below, within the main layout


  return (
    <div className="overflow-x-auto">
      {/* Display general errors here */}
      {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">Error: {error}</p>}
      {deleteMessage && <p className="text-green-500 bg-green-100 p-2 rounded mb-4">{deleteMessage}</p>}

      {/* Conditional rendering for no questions */}
      {questions.length === 0 && !loading && !error && <p>該当する質問はありません。</p>}

      {/* Only show table if there are questions OR if there's an error (to show stale data) */}
      {questions.length > 0 && (
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
                <td className="py-3 px-4">
                  {q.title}
                  {q.admin_conclusion && q.admin_conclusion.trim() !== '' && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100 px-1.5 py-0.5 rounded-full">
                      結論あり
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    q.status === 'answered' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {q.status === 'answered' ? '回答済み' : '未回答'}
                  </span>
                </td>
                <td className="py-3 px-4">{new Date(q.created_at).toLocaleDateString('ja-JP')}</td>
                <td className="py-3 px-4">
                  <Link href={`/admin/question/${q.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium mr-2">
                    回答する
                  </Link>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-red-600 hover:text-red-900 font-medium"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Message for no questions when an error is also present */}
      {questions.length === 0 && !loading && error && <p className="mt-4">エラーが発生しましたが、表示できる質問もありません。</p>}
    </div>
  );
}
