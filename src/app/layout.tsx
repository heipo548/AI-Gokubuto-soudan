// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header"; // Import Header

export const metadata: Metadata = {
  title: {
    default: "AI極太相談室", // Default title for pages that don't set their own
    template: "%s | AI極太相談室", // Template for pages that do set a title
  },
  description: "AI、都市伝説、その他の疑問を解決するQ&Aサイト「AI極太相談室」。匿名で質問し、俺とたまが回答します。",
  keywords: "AI, 都市伝説, Q&A, 質問, 回答, 匿名相談",
  // Optional: Add Open Graph default image, etc.
  // openGraph: {
  //   title: 'AI極太相談室',
  //   description: 'AI、都市伝説、その他の疑問を解決するQ&Aサイト。',
  //   type: 'website',
  //   // images: [{ url: '/default-og-image.png' }], // Needs an image in /public
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-background-main text-text-primary font-sans">
        <Header /> {/* Add Header here */}
        <main className="container mx-auto py-spacing-m px-spacing-m md:px-[20px] lg:px-spacing-l">
          {children}
        </main>
      </body>
    </html>
  );
}
