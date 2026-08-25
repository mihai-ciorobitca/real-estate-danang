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
  title: 'Da Nang Real Estate | Apartments for Rent',
  description: 'Monthly and long-term apartment, villa and home rentals for foreigners in Da Nang.',
  openGraph: {
    title: 'Da Nang Real Estate | Monthly & Long-Term Rentals',
    description: 'Handpicked apartments, villas and homes for foreigners in Da Nang.',
    type: 'website',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'Da Nang Real Estate monthly and long-term rentals' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Da Nang Real Estate | Monthly & Long-Term Rentals',
    description: 'Handpicked apartments, villas and homes for foreigners in Da Nang.',
    images: ['/og.png'],
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
