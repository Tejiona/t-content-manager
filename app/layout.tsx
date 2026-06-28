import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'T-Content Manager — TEJIONA AI Solutions',
  description: 'AI-powered social media content management by TEJIONA AI Solutions',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
