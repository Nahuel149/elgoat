import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '¿Quién es el Mejor de la Historia? | elgoat.',
  description:
    'La única votación del fútbol donde las palabras sobran y mandan los billetes. Bancá a tu ídolo con Mercado Pago y llevalo al puesto #1 en vivo.',
  openGraph: {
    title: '¿Quién es el Mejor de la Historia? | elgoat.',
    description:
      'La única votación del fútbol donde las palabras sobran y mandan los billetes. Bancá a tu ídolo con Mercado Pago y llevalo al puesto #1 en tiempo real.',
    type: 'website',
    locale: 'es_AR',
    siteName: 'elgoat.',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Quién es el Mejor de la Historia? | elgoat.',
    description:
      'La única votación del fútbol donde las palabras sobran y mandan los billetes. Bancá a tu ídolo con Mercado Pago y llevalo al puesto #1 en tiempo real.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
