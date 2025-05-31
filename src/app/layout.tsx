// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header"; // Import Header

export const metadata: Metadata = {
  title: "AI 極太相談室",
  description: "AI と都市伝説の Q&A サイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-gray-50"> {/* Added a light background color */}
        <Header /> {/* Add Header here */}
        <main className="container mx-auto p-4"> {/* Add main tag with some padding */}
          {children}
        </main>
      </body>
    </html>
  );
}
