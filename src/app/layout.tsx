import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LangProvider } from '@/context/LangContext';

export const metadata: Metadata = {
  title: 'SU Lab - 3D Sketch',
  description: '3D sketch workspace with Firebase authentication',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-950 text-white" suppressHydrationWarning>
        <AuthProvider>
          <LangProvider>{children}</LangProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
