// src/components/CommentForm.tsx
'use client';
import { useState, FormEvent } from 'react';

interface CommentFormProps {
  questionId: number;
  onCommentAdded: (newComment: any) => void; // Callback to update parent list
}

export default function CommentForm({ questionId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [commenterName, setCommenterName] = useState(''); // Optional
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('コメント内容は必須です。');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/questions/${questionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          commenter_name: commenterName || undefined, // Send undefined if empty, API defaults to '匿名'
        }),
      });
      const newComment = await response.json();
      if (!response.ok) {
        throw new Error(newComment.error || 'コメントの投稿に失敗しました。');
      }
      onCommentAdded(newComment); // Pass new comment to parent
      setContent('');
      setCommenterName('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-3 sm:p-4 border rounded-lg bg-gray-50">
      <h4 className="text-md font-semibold mb-2">コメントを投稿する</h4>
      {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-2 text-sm">{error}</p>}
      <div className="mb-3">
        <label htmlFor="commenterName" className="block text-sm font-medium text-gray-700">
          お名前 (任意)
        </label>
        <input
          type="text"
          id="commenterName"
          value={commenterName}
          onChange={(e) => setCommenterName(e.target.value)}
          maxLength={50}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="commentContent" className="block text-sm font-medium text-gray-700">
          コメント (500文字以内) <span className="text-red-500">*</span>
        </label>
        <textarea
          id="commentContent"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={500}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors duration-150 ease-in-out"
      >
        {isSubmitting ? '投稿中...' : 'コメントする'}
      </button>
    </form>
  );
}
