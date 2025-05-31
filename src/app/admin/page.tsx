// src/app/admin/page.tsx
'use client';
import { useState, useEffect } from 'react';
import AdminAuth from '@/components/AdminAuth';
import AdminQuestionList from '@/components/AdminQuestionList';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'answered'

  // Check session storage for persisted auth state (very basic persistence)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAuth = sessionStorage.getItem('isAdminAuthenticated');
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleAuthentication = (authStatus: boolean) => {
    setIsAuthenticated(authStatus);
    if (authStatus && typeof window !== 'undefined') {
      sessionStorage.setItem('isAdminAuthenticated', 'true');
    } else if (typeof window !== 'undefined') {
      sessionStorage.removeItem('isAdminAuthenticated');
    }
  };

  const handleLogout = () => {
    handleAuthentication(false);
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthentication} />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
        <button
          onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-150 ease-in-out"
        >
          ログアウト
        </button>
      </div>


      <div className="mb-4">
        <label htmlFor="statusFilter" className="mr-2 font-semibold">フィルタ:</label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded-md shadow-sm"
        >
          <option value="all">すべて</option>
          <option value="pending">未回答</option>
          <option value="answered">回答済み</option>
        </select>
      </div>

      <AdminQuestionList filterStatus={filterStatus} />
    </div>
  );
}
