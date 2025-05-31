// src/components/QuestionSubmitButton.tsx
'use client'; // For onClick event handling
import Link from 'next/link';

export default function QuestionSubmitButton() {
  return (
    <Link href="/submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-150 ease-in-out">
      質問を投稿する
    </Link>
  );
}
