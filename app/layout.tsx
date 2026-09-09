import type { Metadata } from 'next';
import { Geist, Geist_Mono, Manrope, Lora } from 'next/font/google';
import './globals.css';

function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try { return new URL(configured); } catch { /* use the deployment URL below */ }
  }
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return new URL(vercelHost ? `https://${vercelHost}` : 'http://localhost:3000');
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const editorial = Manrope({ variable: '--font-editorial', subsets: ['latin', 'vietnamese'], display: 'swap' });

const display = Lora({ variable: '--font-display', subsets: ['latin', 'vietnamese'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: 'Da Nang Real Estate | Homes for Rent & Sale',
  description: 'Handpicked apartments, villas and homes for rent or sale in Da Nang, with bilingual local support.',
  icons: { icon: '/luxury/brand-dragon-v5.png', apple: '/luxury/brand-dragon-v5.png' },
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
        className={`${geistSans.variable} ${geistMono.variable} ${editorial.variable} ${display.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
