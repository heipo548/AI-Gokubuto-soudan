// src/components/QuestionCard.tsx
import Link from 'next/link';

// Define a type for the Question props
export interface QuestionCardProps {
  id: number;
  title: string;
  category?: string | null;
  created_at: string; // Assuming string formatted date
  status: string;
  //いいね数 (likesCount) will be added later
}

export default function QuestionCard({ id, title, category, created_at, status }: QuestionCardProps) {
  const formattedDate = new Date(created_at).toLocaleDateString('ja-JP');
  return (
    <Link href={`/question/${id}`} className="block p-4 border rounded-lg shadow hover:bg-gray-100 mb-4">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          {category && <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs mr-2">{category}</span>}
          <span>投稿日時: {formattedDate}</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${status === 'answered' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
          {status === 'answered' ? '回答済み' : '未回答'}
        </span>
      </div>
      {/* Placeholder for いいね数 */}
      {/* <p className="text-sm text-gray-500 mt-1">いいね数: {likesCount || 0}</p> */}
    </Link>
  );
}
