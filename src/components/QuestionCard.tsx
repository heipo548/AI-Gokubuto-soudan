// src/components/QuestionCard.tsx
import Link from 'next/link';

export interface QuestionCardProps {
  id: number;
  title: string;
  category?: string | null;
  created_at: string;
  status: string;
  //いいね数 (likesCount) will be added later
}

export default function QuestionCard({ id, title, category, created_at, status }: QuestionCardProps) {
  const formattedDate = new Date(created_at).toLocaleDateString('ja-JP');
  return (
    <Link href={`/question/${id}`} className="block p-4 border rounded-lg shadow hover:bg-gray-100 mb-4 transition-colors duration-150">
      <h2 className="text-xl md:text-2xl font-semibold mb-2 break-words">{title}</h2>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600">
        <div className="mb-1 sm:mb-0">
          {category && (
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs mr-2 whitespace-nowrap">
              {category}
            </span>
          )}
          <span className="whitespace-nowrap">投稿日: {formattedDate}</span>
        </div>
        <span
            className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap mt-1 sm:mt-0 ${
            status === 'answered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}
        >
          {status === 'answered' ? '回答済み' : '未回答'}
        </span>
      </div>
      {/* Placeholder for いいね数 */}
      {/* <p className="text-sm text-gray-500 mt-1">いいね数: {likesCount || 0}</p> */}
    </Link>
  );
}
