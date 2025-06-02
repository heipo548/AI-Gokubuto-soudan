// src/components/ReturnToHomeButton.tsx
import Link from 'next/link';

export default function ReturnToHomeButton() {
  return (
    <Link href="/" passHref>
      <button
        className="font-bold py-2 px-4 rounded transition-colors duration-150 bg-blue-500 hover:bg-blue-700 text-white"
      >
        ホーム画面に戻る
      </button>
    </Link>
  );
}
