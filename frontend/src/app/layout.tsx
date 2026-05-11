import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AndeanBackground } from '@/components/ui/AndeanBackground';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Taki Play — Karaoke Intercultural',
  description: 'Sistema de karaoke intercultural con música en español, kichwa y achuar',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} bg-dark-base`}>
      <body className="min-h-screen antialiased">
        <AndeanBackground />
        <div className="relative z-[1]">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
