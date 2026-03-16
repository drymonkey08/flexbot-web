import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};

export const metadata: Metadata = {
  title: 'FlexBot — Premeditated Millionaire',
  description: 'Generate hyper-realistic AI flex photos. This is what it looks like when you move different.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FlexBot',
  },
  icons: {
    apple: '/icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FlexBot" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
