// src/app/admin/question/[id]/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation'; // To get [id] from URL and for navigation
import Link from 'next/link';

// Re-using QuestionProps from QuestionDetail or define a simpler one for admin
interface QuestionData {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  status: string;
  created_at: string;
  answers: AnswerData[]; // Expecting existing answers if any
}

interface AnswerData {
  id?: number; // id is present if answer already exists
  content: string;
  image_url?: string | null;
  link_url?: string | null;
  responder: string; // '俺' or 'たま'
}

export default function AnswerEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [responder, setResponder] = useState<'俺' | 'たま'>('俺'); // Default responder
  const [existingAnswerId, setExistingAnswerId] = useState<number | null>(null);

  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Basic admin auth check (same as admin page, ideally a shared hook/context)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAuth = sessionStorage.getItem('isAdminAuthenticated');
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      } else {
        // Redirect to admin login if not authenticated
        router.push('/admin');
      }
    }
  }, [router]);


  useEffect(() => {
    if (id && isAuthenticated) {
      async function fetchQuestionAndAnswer() {
        setIsLoadingQuestion(true);
        setError(null);
        try {
          const response = await fetch(`/api/questions/${id}`); // Using public API to get question and existing answers
          if (!response.ok) {
            throw new Error(`Failed to fetch question: ${response.statusText}`);
          }
          const data: QuestionData = await response.json();
          setQuestionData(data);

          // Check for existing answer (assuming one answer per question as per current design)
          if (data.answers && data.answers.length > 0) {
            const existing = data.answers[0];
            setAnswerContent(existing.content);
            setImageUrl(existing.image_url || '');
            setLinkUrl(existing.link_url || '');
            setResponder(existing.responder as '俺' | 'たま');
            setExistingAnswerId(existing.id || null); // If answer has an ID
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoadingQuestion(false);
        }
      }
      fetchQuestionAndAnswer();
    }
  }, [id, isAuthenticated]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (!answerContent.trim() || !responder) {
      setError('回答内容と回答者は必須です。');
      setIsSubmitting(false);
      return;
    }

    try {
      // For MVP, we'll always POST to /api/admin/answers.
      // A more robust solution would use PUT if existingAnswerId is present.
      // However, the current /api/admin/answers doesn't support PUT for editing.
      // We are also assuming that posting a new answer implicitly overwrites/is the only answer.
      const response = await fetch('/api/admin/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: Number(id),
          content: answerContent,
          image_url: imageUrl || null,
          link_url: linkUrl || null,
          responder,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '回答の投稿に失敗しました。');
      }

      // After successful answer submission, update the question status to 'answered'
      await fetch(`/api/admin/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'answered' }),
      });

      setSuccessMessage('回答が正常に投稿/更新されました。質問のステータスも「回答済み」に更新しました。');
      // Optionally, redirect or update UI
      // router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    // This will be brief as the useEffect hook will redirect.
    return <p className="text-center mt-10">管理者認証を確認中...</p>;
  }

  if (isLoadingQuestion) return <div className="container mx-auto p-4"><p>質問情報を読み込み中...</p></div>;
  if (error && !questionData) return <div className="container mx-auto p-4"><p className="text-red-500">Error: {error}</p></div>;
  if (!questionData) return <div className="container mx-auto p-4"><p>質問が見つかりません。</p></div>;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">&larr; 管理者ダッシュボードに戻る</Link>
      <h1 className="text-3xl font-bold mb-2">回答エディター</h1>

      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-1">{questionData.title}</h2>
        <p className="text-sm text-gray-600">カテゴリ: {questionData.category || 'なし'} | ステータス: {questionData.status}</p>
        <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{questionData.content}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8">
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
        {successMessage && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMessage}</p>}

        <div className="mb-4">
          <label htmlFor="answerContent" className="block text-gray-700 font-bold mb-2">
            回答内容
          </label>
          <textarea
            id="answerContent"
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            rows={10}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="imageUrl" className="block text-gray-700 font-bold mb-2">
            画像URL (任意)
          </label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="https://example.com/image.png"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="linkUrl" className="block text-gray-700 font-bold mb-2">
            参考リンクURL (任意)
          </label>
          <input
            type="url"
            id="linkUrl"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="https://example.com/related-info"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="responder" className="block text-gray-700 font-bold mb-2">
            回答者
          </label>
          <select
            id="responder"
            value={responder}
            onChange={(e) => setResponder(e.target.value as '俺' | 'たま')}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="俺">俺</option>
            <option value="たま">たま</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            disabled={isSubmitting || isLoadingQuestion}
          >
            {isSubmitting ? '投稿中...' : (existingAnswerId ? '回答を更新' : '回答を投稿')}
          </button>
        </div>
      </form>
    </div>
  );
}
