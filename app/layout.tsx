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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Da Nang Real Estate | Homes for Rent & Sale',
  description: 'Handpicked apartments, villas and homes for rent or sale in Da Nang, with bilingual local support.',
  icons: { icon: '/icon.png', apple: '/icon.png' },
  openGraph: {
    title: 'Da Nang Real Estate | Homes for Rent & Sale',
    description: 'Handpicked apartments, villas and homes for rent or sale in Da Nang.',
    type: 'website',
    images: [{ url: '/og-v2.png', width: 1672, height: 941, alt: 'Da Nang Real Estate — find your place by the sea' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Da Nang Real Estate | Homes for Rent & Sale',
    description: 'Handpicked apartments, villas and homes for rent or sale in Da Nang.',
    images: ['/og-v2.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
