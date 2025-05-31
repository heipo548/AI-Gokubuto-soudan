// src/components/QuestionDetail.tsx (Corrected filename)
export interface QuestionProps {
  title: string;
  content: string;
  category?: string | null;
  created_at: string;
  submitter_nickname?: string | null;
  // Add other fields if necessary, e.g., author, status
}

// Renaming component function to match typical convention, though not strictly necessary for export default
export default function QuestionDetail({ title, content, category, created_at, submitter_nickname }: QuestionProps) {
  const formattedDate = new Date(created_at).toLocaleDateString('ja-JP');
  return (
    <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-3 break-words">{title}</h1>
      {category && (
        <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 mb-2 inline-block">
          {category}
        </span>
      )}
      <p className="text-gray-600 text-sm mb-4">投稿日: {formattedDate}</p>
      {submitter_nickname && (
        <p className="text-gray-600 text-sm mb-4">投稿者: {submitter_nickname}</p>
      )}
      <div className="prose prose-sm sm:prose-base max-w-none">
        {/* Using a simple p tag for content, ensure it wraps */}
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );
}
