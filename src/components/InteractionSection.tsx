// src/components/InteractionSection.tsx
// Placeholders for LikeButton and CommentSection which are Phase 2 items.

interface InteractionSectionProps {
  questionId: number;
}

export default function InteractionSection({ questionId }: InteractionSectionProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">リアクション</h3>
      <div className="space-y-4">
        <div>
          {/* Placeholder for LikeButton */}
          <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
            いいね！ (Coming Soon)
          </button>
          {/* <LikeButton questionId={questionId} /> */}
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-2">コメント (Coming Soon)</h4>
          {/* Placeholder for CommentSection */}
          <div className="border p-4 rounded-md bg-gray-50">
            <p className="text-gray-500">コメント機能は現在準備中です。</p>
          </div>
          {/* <CommentSection questionId={questionId} /> */}
        </div>
      </div>
    </div>
  );
}
