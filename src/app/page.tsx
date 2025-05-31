// src/app/page.tsx
'use client'; // Needs to be client component for useState
import { useState } from 'react';
import Link from 'next/link'; // Make sure Link is imported
import QuestionList from '@/components/QuestionList';
import QuestionSubmitButton from '@/components/QuestionSubmitButton';

const CATEGORIES = ['all', 'AI', '都市伝説', 'その他']; // 'all' maps to no filter

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');

  return (
    <div className="container mx-auto p-4">
      {/* Added text below */}
      <div className="text-center my-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          みなさんの、AIや都市伝説の質問にヘイポーとたまが終止符を打ちます。
        </h2>
      </div>
      {/* Existing content follows */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-center sm:text-left">質問一覧</h1>
        <QuestionSubmitButton />
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2 sm:gap-3">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                            ${selectedCategory === category
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          >
            {category === 'all' ? 'すべて' : category}
          </button>
        ))}
      </div>

      <QuestionList selectedCategory={selectedCategory} />

      {/* Add the new button here */}
      <div className="mt-12 text-center">
        <Link
          href="/admin"
          className="bg-gray-700 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors duration-150 ease-in-out"
        >
          ヘポたま専用ボタン
        </Link>
      </div>
    </div> // This is the closing tag of the main container div
  );
}
