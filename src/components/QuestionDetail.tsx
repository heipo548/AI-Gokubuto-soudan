// src/components/QuestionDetail.tsx

export interface QuestionProps {
  title: string;
  content: string;
  category?: string | null;
  created_at: string;
  // Add other fields if necessary, e.g., author, status
}

export default function QuestionDetailDisplay({ title, content, category, created_at }: QuestionProps) {
  const formattedDate = new Date(created_at).toLocaleDateString('ja-JP');
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h1 className="text-3xl font-bold mb-3">{title}</h1>
      {category && (
        <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
          {category}
        </span>
      )}
      <p className="text-gray-600 text-sm mb-4">投稿日時: {formattedDate}</p>
      <div className="prose max-w-none">
        {/* Using dangerouslySetInnerHTML for potentially HTML content from a rich text editor in the future.
            Ensure content is properly sanitized if it comes from user input directly.
            For now, assuming content is safe or plain text. */}
        <p>{content}</p>
      </div>
    </div>
  );
}
