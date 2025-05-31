// src/app/submit/page.tsx
'use client'; // For form handling and client-side logic

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // For redirecting after submission

export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(''); // Default or allow selection
  const [submitterNickname, setSubmitterNickname] = useState('');
  const [notificationToken, setNotificationToken] = useState(''); // For anonymous notifications
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Generate a simple UUID-like token for notifications (client-side)
  // In a real app, this might be handled more robustly or on the backend
  const generateToken = () => crypto.randomUUID();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!title.trim() || !content.trim()) {
      setError('タイトルと質問内容は必須です。');
      return;
    }
    if (!category) { // Assuming the default "選択してください" option has value=""
      setError('カテゴリーを選択してください。');
      return;
    }

    setIsSubmitting(true);
    const currentToken = notificationToken || generateToken();
    if (!notificationToken) {
        setNotificationToken(currentToken); // Set it if it was just generated
    }

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          category: category || null, // Send null if category is empty
          notification_token: currentToken,
          submitter_nickname: submitterNickname.trim() || undefined, // Send undefined if empty, API will default
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '質問の投稿に失敗しました。');
      }

      const newQuestion = await response.json();

      // Store token in localStorage as per design document
      // Note: localStorage is only available in the browser
      if (typeof window !== 'undefined') {
        localStorage.setItem(`question_${newQuestion.id}`, currentToken);
      }

      setSuccessMessage('質問が投稿されました！');
      setTitle('');
      setContent('');
      setCategory('');
      setSubmitterNickname('');
      // Optional: Redirect after a delay or provide a link to the question
      // router.push(`/question/${newQuestion.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">質問を投稿する</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8">
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
        {successMessage && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMessage}</p>}

        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
            タイトル (200文字以内)
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="content" className="block text-gray-700 font-bold mb-2">
            質問内容 (2000文字以内)
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            rows={8}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="category" className="block text-gray-700 font-bold mb-2">
            カテゴリー <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">選択してください</option>
            <option value="AI">AI</option>
            <option value="都市伝説">都市伝説</option>
            <option value="その他">その他</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="submitterNickname" className="block text-gray-700 font-bold mb-2">
            ニックネーム（任意）
          </label>
          <input
            type="text"
            id="submitterNickname"
            value={submitterNickname}
            onChange={(e) => setSubmitterNickname(e.target.value)}
            maxLength={100}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {/* Hidden field for notification_token or display if already generated */}
        {/* For simplicity, we are auto-generating and showing it upon success.
            A user could also be allowed to input a pre-existing one if they want to link a question.
        */}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? '投稿中...' : '投稿する'}
          </button>
        </div>
      </form>
    </div>
  );
}
