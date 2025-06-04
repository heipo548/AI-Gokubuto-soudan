// src/components/QuestionCard.tsx
import Link from 'next/link';

export interface QuestionCardProps {
  id: number;
  title: string;
  content?: string; // Added content, assuming it might be used or passed in future for full card view
  category?: string | null;
  created_at: string;
  status: string;
  searchTerm?: string; // Optional: for highlighting search terms
  admin_conclusion?: string | null; // Added to indicate if a conclusion exists
  //いいね数 (likesCount) will be added later
}

// Helper function to escape regex special characters
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

const highlightText = (text: string | undefined, term: string | undefined) => {
  if (!text) return '';
  if (!term || term.trim() === '') {
    return text;
  }

  const keywords = term.trim().split(/\s+/).filter(Boolean); // Split by space and remove empty strings
  if (keywords.length === 0) {
    return text;
  }

  // Apply highlighting for each keyword sequentially
  let highlightedText = text;
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi'); // 'g' for global, 'i' for case-insensitive
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });

  return highlightedText;
};

export default function QuestionCard({ id, title, category, created_at, status, searchTerm }: QuestionCardProps) {
  const formattedDate = new Date(created_at).toLocaleDateString('ja-JP');
  const displayTitle = highlightText(title, searchTerm);
  const hasAdminConclusion = admin_conclusion && admin_conclusion.trim() !== '';

  return (
    <Link href={`/question/${id}`} className="block p-4 border rounded-lg shadow hover:bg-gray-100 dark:hover:bg-gray-700 mb-4 transition-colors duration-150">
      {/* Use dangerouslySetInnerHTML for title because highlightText returns HTML string */}
      <h2 className="text-xl md:text-2xl font-semibold mb-2 break-words text-gray-800 dark:text-gray-100" dangerouslySetInnerHTML={{ __html: displayTitle }} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center flex-wrap mb-1 sm:mb-0">
          {category && (
            <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-full text-xs mr-2 whitespace-nowrap mb-1 sm:mb-0">
              {category}
            </span>
          )}
          {hasAdminConclusion && (
            <span className="bg-purple-100 dark:bg-purple-700 text-purple-800 dark:text-purple-100 px-2 py-1 rounded-full text-xs mr-2 whitespace-nowrap mb-1 sm:mb-0">
              結論あり
            </span>
          )}
          <span className="whitespace-nowrap text-gray-500 dark:text-gray-500">投稿日: {formattedDate}</span>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap mt-1 sm:mt-0 ${
            status === 'answered' ? 'bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-100' : 'bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-100'
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
