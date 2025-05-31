// src/components/CommentList.tsx
import { Comment } from '@prisma/client'; // Assuming Prisma client types are available

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return <p className="text-gray-600 italic">まだコメントはありません。</p>;
  }

  return (
    <div className="space-y-4 mt-4">
      {comments.map((comment) => (
        <div key={comment.id} className="p-3 border rounded-lg bg-white shadow">
          <p className="font-semibold text-gray-800">{comment.commenter_name || '匿名'}</p>
          <p className="text-xs text-gray-500 mb-1">
            {new Date(comment.created_at).toLocaleString('ja-JP')}
          </p>
          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}
