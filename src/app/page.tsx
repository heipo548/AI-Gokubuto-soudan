// src/app/page.tsx
import QuestionList from '@/components/QuestionList';
import QuestionSubmitButton from '@/components/QuestionSubmitButton';

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-end mb-4">
        <QuestionSubmitButton />
      </div>
      <h1 className="text-3xl font-bold mb-6 text-center">質問一覧</h1>
      <QuestionList />
    </div>
  );
}
