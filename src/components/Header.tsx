// src/components/Header.tsx
import Link from 'next/link';
import Image from 'next/image'; // Assuming you might add images later

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          AI極太相談室
        </Link>
        {/* Placeholder for 俺・たまの画像 if needed */}
        {/* <div className="flex space-x-2">
          <Image src="/placeholder-ore.png" alt="俺" width={40} height={40} className="rounded-full" />
          <Image src="/placeholder-tama.png" alt="たま" width={40} height={40} className="rounded-full" />
        </div> */}
        <nav>
          {/* Add navigation links here if any in the future */}
        </nav>
      </div>
    </header>
  );
}
