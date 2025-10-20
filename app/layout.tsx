import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RANKU ✌️ Herramienta de SEO Local y Orgánico con Análisis Inteligente',
  description:
    'RANKU es mucho más que un rank tracker: te ofrece datos útiles para tomar decisiones reales en SEO local y orgánico ⭐ Posiciones, tendencias, competencia y más. ¡Domina Google con inteligencia!',
  metadataBase: new URL('https://ranku.es'),
  openGraph: {
    title: 'RANKU ✌️ Herramienta de SEO Local y Orgánico con Análisis Inteligente',
    description:
      'RANKU es mucho más que un rank tracker: te ofrece datos útiles para tomar decisiones reales en SEO local y orgánico ⭐ Posiciones, tendencias, competencia y más. ¡Domina Google con inteligencia!',
    url: 'https://ranku.es/',
    siteName: 'ranku.es',
    images: [
      {
        url: '/assets/ranku.webp',
        width: 1200,
        height: 630,
        alt: 'RANKU - Análisis SEO Local y Orgánico',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RANKU ✌️ Herramienta de SEO Local y Orgánico con Análisis Inteligente',
    description:
      'RANKU es mucho más que un rank tracker: te ofrece datos útiles para tomar decisiones reales en SEO local y orgánico ⭐ Posiciones, tendencias, competencia y más. ¡Domina Google con inteligencia!',
    images: ['/assets/ranku.webp'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
