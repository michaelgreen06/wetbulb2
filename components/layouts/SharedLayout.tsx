import { Inter } from 'next/font/google';
import '../../app/globals.css';

const inter = Inter({ subsets: ['latin'] });

interface SharedLayoutProps {
  children: React.ReactNode;
}

export default function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <div className={inter.className}>
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        {children}
      </main>
    </div>
  );
}
