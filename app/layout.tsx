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
  title: '¿Cuánto pagarías por poner a tu ídolo en el puesto #1? | elgoat.',
  description:
    'La única votación del fútbol argentino donde mandan los billetes. Bancá a tu jugador favorito con Mercado Pago.',
  openGraph: {
    title: '¿Cuánto pagarías por poner a tu ídolo en el puesto #1? | elgoat.',
    description:
      '¡Gabriel Hauche tiene el puesto #1 con $20.000 ARS! Entrá a bancar a tu ídolo.',
    type: 'website',
    locale: 'es_AR',
    siteName: 'elgoat.',
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
