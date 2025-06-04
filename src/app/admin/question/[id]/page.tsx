// src/app/admin/question/[id]/page.tsx
'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Spinner from '@/components/Spinner'; // Import Spinner

interface QuestionData {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  status: string;
  created_at: string;
  answers: AnswerDataFromServer[];
  admin_conclusion?: string | null;
  admin_conclusion_updated_at?: string | null;
}

interface AnswerDataFromServer {
  id?: number;
  content: string;
  image_url?: string | null;
  link_url?: string | null;
  responder: string;
}

export default function AnswerEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [responder, setResponder] = useState<'ヘイポー' | 'たま'>('ヘイポー');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingAnswerId, setExistingAnswerId] = useState<number | null>(null);

  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // For answer form
  const [error, setError] = useState<string | null>(null); // For answer form
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // For answer form

  // New state variables for admin conclusion
  const [adminConclusion, setAdminConclusion] = useState('');
  const [initialAdminConclusion, setInitialAdminConclusion] = useState('');
  const [adminConclusionUpdatedAt, setAdminConclusionUpdatedAt] = useState<string | null>(null);
  const [isSubmittingConclusion, setIsSubmittingConclusion] = useState(false);
  const [conclusionError, setConclusionError] = useState<string | null>(null);
  const [conclusionSuccessMessage, setConclusionSuccessMessage] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAuth = sessionStorage.getItem('isAdminAuthenticated');
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      } else {
        router.push('/admin');
      }
    }
  }, [router]);

  useEffect(() => {
    if (id && isAuthenticated) {
  const fetchQuestionAndAnswer = async () => {
        setIsLoadingQuestion(true);
        setError(null); // Clear answer form error
        setConclusionError(null); // Clear conclusion error
        try {
          // Use the admin API endpoint to fetch admin-specific fields
          const response = await fetch(`/api/admin/questions/${id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch question: ${response.statusText}`);
          }
          const data: QuestionData = await response.json();
          setQuestionData(data);

          // Set answer form fields
          if (data.answers && data.answers.length > 0) {
            const existing = data.answers[0];
            setAnswerContent(existing.content);
            setImageUrl(existing.image_url || '');
            setLinkUrl(existing.link_url || '');
            setResponder(existing.responder as 'ヘイポー' | 'たま');
            setExistingAnswerId(existing.id || null);
          } else {
            // Reset answer fields if no answer exists
            setAnswerContent('');
            setImageUrl('');
            setLinkUrl('');
            setResponder('ヘイポー');
            setExistingAnswerId(null);
          }

          // Set admin conclusion fields
          setAdminConclusion(data.admin_conclusion || '');
          setInitialAdminConclusion(data.admin_conclusion || '');
          setAdminConclusionUpdatedAt(data.admin_conclusion_updated_at || null);

        } catch (err: any) {
          // Set error for the main question loading part, could be displayed generally
          setError(err.message);
          console.error("Fetch question error:", err);
        } finally {
          setIsLoadingQuestion(false);
        }
      }
      fetchQuestionAndAnswer();
    }
  }, [id, isAuthenticated]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(event.target.files[0]);
    } else {
      setSelectedFile(null);
      setImageUrl(questionData?.answers?.[0]?.image_url || '');
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImageUrl('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (!answerContent.trim() || !responder) {
      setError('回答内容と回答者は必須です。');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('question_id', id);
    formData.append('content', answerContent);
    formData.append('responder', responder);
    if (linkUrl) formData.append('link_url', linkUrl);
    if (selectedFile) {
      formData.append('image', selectedFile);
    } else if (!imageUrl && existingAnswerId && questionData?.answers[0]?.image_url) {
       formData.append('existing_image_url', '');
    } else if (imageUrl && questionData?.answers[0]?.image_url === imageUrl) {
        formData.append('existing_image_url', imageUrl);
    }

    try {
      const response = await fetch('/api/admin/answers', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || '回答の投稿/更新に失敗しました。');
      }

      const updatedAnswer = await response.json();
      setSuccessMessage('回答が正常に投稿/更新されました。質問のステータスも「回答済み」に更新されています。');
      if (updatedAnswer.image_url) {
        setImageUrl(updatedAnswer.image_url);
      } else if (!selectedFile && !imageUrl) {
        setImageUrl('');
      }
      setSelectedFile(null);
       if (id && isAuthenticated) {
            // Refetch question data to get latest status and potentially other updates
            // This will also update admin_conclusion fields if they were changed by another admin
            const qResponse = await fetch(`/api/admin/questions/${id}`);
            const qData: QuestionData = await qResponse.json();
            setQuestionData(qData);
            setAdminConclusion(qData.admin_conclusion || '');
            setInitialAdminConclusion(qData.admin_conclusion || '');
            setAdminConclusionUpdatedAt(qData.admin_conclusion_updated_at || null);
       }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <p className="text-center mt-10">管理者認証を確認中...</p>;
  }

  if (isLoadingQuestion) return <div className="container mx-auto p-4 flex justify-center"><Spinner /></div>;
  if (error && !questionData && !isLoadingQuestion) return <div className="container mx-auto p-4"><p className="text-red-500">Error loading question: {error}</p></div>;
  if (!questionData && !isLoadingQuestion) return <div className="container mx-auto p-4"><p>質問が見つかりません。</p></div>;

  // Helper to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未設定';
    return new Date(dateString).toLocaleString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleSaveConclusion = async () => {
    setIsSubmittingConclusion(true);
    setConclusionError(null);
    setConclusionSuccessMessage(null);

    if (adminConclusion.length > 500) {
      setConclusionError('結論は500文字以内で入力してください。');
      setIsSubmittingConclusion(false);
      return;
    }

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_conclusion: adminConclusion }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '結論の保存に失敗しました。');
      }

      const updatedQuestion: QuestionData = await response.json();
      setInitialAdminConclusion(updatedQuestion.admin_conclusion || '');
      setAdminConclusion(updatedQuestion.admin_conclusion || '');
      setAdminConclusionUpdatedAt(updatedQuestion.admin_conclusion_updated_at || null);
      setConclusionSuccessMessage('結論が正常に保存されました。');
    } catch (err: any) {
      setConclusionError(err.message);
    } finally {
      setIsSubmittingConclusion(false);
    }
  };

  const handleClearConclusion = async () => {
    setIsSubmittingConclusion(true);
    setConclusionError(null);
    setConclusionSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_conclusion: null }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '結論のクリアに失敗しました。');
      }

      const updatedQuestion: QuestionData = await response.json();
      setAdminConclusion('');
      setInitialAdminConclusion('');
      setAdminConclusionUpdatedAt(null);
      setConclusionSuccessMessage('結論が正常にクリアされました。');
    } catch (err: any) {
      setConclusionError(err.message);
    } finally {
      setIsSubmittingConclusion(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">&larr; 管理者ダッシュボードに戻る</Link>
      <h1 className="text-3xl font-bold mb-6">質問管理</h1>

      {isLoadingQuestion && !questionData && <div className="flex justify-center"><Spinner /></div>}

      {questionData && (
        <>
          <div className="bg-gray-100 p-3 sm:p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-1">{questionData.title}</h2>
            <p className="text-sm text-gray-600">カテゴリ: {questionData.category || 'なし'} | ステータス: {questionData.status}</p>
            <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{questionData.content}</p>
          </div>

          {/* Admin Conclusion Section */}
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">ヘポたまの結論管理</h2>
            {conclusionError && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{conclusionError}</p>}
            {conclusionSuccessMessage && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{conclusionSuccessMessage}</p>}

            <div className="mb-4">
              <label htmlFor="adminConclusion" className="block text-gray-700 font-bold mb-2">結論</label>
              <textarea
                id="adminConclusion"
                value={adminConclusion}
                onChange={(e) => setAdminConclusion(e.target.value)}
                rows={5}
                maxLength={500}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <p className="text-sm text-gray-600 mt-1 text-right">{adminConclusion.length} / 500 文字</p>
            </div>

            {adminConclusionUpdatedAt && (
              <p className="text-sm text-gray-500 mb-4">最終更新日時: {formatDate(adminConclusionUpdatedAt)}</p>
            )}

            <div className="flex items-center space-x-4">
              <button
                onClick={handleSaveConclusion}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors duration-150 ease-in-out"
                disabled={isSubmittingConclusion || adminConclusion === initialAdminConclusion}
              >
                {isSubmittingConclusion ? '保存中...' : '結論を保存'}
              </button>
              <button
                onClick={handleClearConclusion}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors duration-150 ease-in-out"
                disabled={isSubmittingConclusion || !initialAdminConclusion}
              >
                {isSubmittingConclusion ? 'クリア中...' : '結論をクリア'}
              </button>
            </div>
          </div>

          {/* Existing Answer Form */}
          <h2 className="text-2xl font-semibold mb-4">回答フォーム</h2>
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-4 sm:p-6 md:p-8">
            {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
            {successMessage && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMessage}</p>}
            <div className="mb-4">
          <label htmlFor="answerContent" className="block text-gray-700 font-bold mb-2">回答内容</label>
          <textarea id="answerContent" value={answerContent} onChange={(e) => setAnswerContent(e.target.value)} rows={10} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
        </div>

        <div className="mb-4">
          <label htmlFor="imageFile" className="block text-gray-700 font-bold mb-2">画像 (任意)</label>
          <input type="file" id="imageFile" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
          {imageUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700">現在の画像プレビュー:</p>
              {/* Adjusted Image component for better responsive behavior if needed */}
              <Image src={imageUrl} alt="回答画像プレビュー" width={150} height={150} className="mt-2 rounded border object-cover max-w-full" />
              <button type="button" onClick={handleRemoveImage} className="mt-2 text-xs text-red-500 hover:text-red-700">画像を削除</button>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="linkUrl" className="block text-gray-700 font-bold mb-2">参考リンクURL (任意)</label>
          <input type="url" id="linkUrl" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="https://example.com/related-info"/>
        </div>

        <div className="mb-6">
          <label htmlFor="responder" className="block text-gray-700 font-bold mb-2">回答者</label>
          <select id="responder" value={responder} onChange={(e) => setResponder(e.target.value as 'ヘイポー' | 'たま')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <option value="ヘイポー">ヘイポー</option>
            <option value="たま">たま</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors duration-150 ease-in-out" disabled={isSubmitting || isLoadingQuestion || !questionData}>
            {isSubmitting ? '処理中...' : (existingAnswerId ? '回答を更新' : '回答を投稿')}
          </button>
        </div>
      </form>
      </>
      )}
    </div>
  );
}
