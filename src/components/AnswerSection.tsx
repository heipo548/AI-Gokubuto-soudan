// src/components/AnswerSection.tsx
import Image from 'next/image';

export interface AnswerProps {
  id: number;
  content: string;
  image_url?: string | null;
  link_url?: string | null;
  responder: string; // '俺' or 'たま'
  created_at: string;
}

interface AnswerSectionProps {
  answers?: AnswerProps[]; // Can be undefined if question is not answered yet
}

export default function AnswerSection({ answers }: AnswerSectionProps) {
  if (!answers || answers.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="font-bold">回答準備中</p>
        <p>この質問にはまだ回答がありません。もうしばらくお待ちください。</p>
      </div>
    );
  }

  // Assuming one answer per question for now as per initial requirements
  // If multiple answers are possible, this component would need to loop through them.
  const answer = answers[0];
  const formattedDate = new Date(answer.created_at).toLocaleDateString('ja-JP');
  const responderIcon = answer.responder === '俺' ? '/icon-ore.png' : '/icon-tama.png'; // Placeholder paths

  return (
    <div className="bg-green-50 shadow-md rounded-lg p-6 mb-6 border border-green-200">
      <div className="flex items-center mb-4">
        {/* Placeholder for responder icon */}
        {/* <Image src={responderIcon} alt={answer.responder} width={40} height={40} className="rounded-full mr-3" /> */}
        <h2 className="text-2xl font-semibold">回答 ({answer.responder}より)</h2>
      </div>
      <p className="text-gray-600 text-sm mb-4">回答日時: {formattedDate}</p>
      <div className="prose max-w-none mb-4">
        <p>{answer.content}</p>
      </div>
      {answer.image_url && (
        <div className="mb-4">
          <p className="font-semibold mb-1">関連画像:</p>
          {/* Using a simple img tag for now. Next/Image would require width/height and domain whitelisting. */}
          <img src={answer.image_url} alt="関連画像" className="max-w-full h-auto rounded-lg border" />
        </div>
      )}
      {answer.link_url && (
        <div>
          <p className="font-semibold mb-1">関連リンク:</p>
          <a href={answer.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {answer.link_url}
          </a>
        </div>
      )}
    </div>
  );
}
