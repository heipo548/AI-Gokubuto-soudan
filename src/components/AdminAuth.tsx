// src/components/AdminAuth.tsx
'use client';
import { useState, FormEvent } from 'react';

interface AdminAuthProps {
  onAuthenticated: (isAuthenticated: boolean) => void;
}

export default function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // In a real app, this would be an environment variable and checked on the backend.
  // For this MVP, we'll do a simple client-side check.
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'password'; // Fallback for local dev

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onAuthenticated(true);
      setError('');
      // Consider setting a session cookie or token here in a real app
    } else {
      setError('Incorrect password.');
      onAuthenticated(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6">管理者ログイン</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <button
          type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 ease-in-out"
        >
          ログイン
        </button>
      </form>
       <p className="text-xs text-gray-500 mt-4">開発用: 環境変数 `NEXT_PUBLIC_ADMIN_PASSWORD` でパスワードを設定できます。デフォルトは "password" です。</p>
    </div>
  );
}
