import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import { Metadata } from 'next';
import Script from 'next/script';
import LiveChatWidget from '../../components/LiveChatWidget';
import StoreShell from '../../components/StoreShell';
import { Web3Provider } from '../../components/web3/Web3Provider';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleTagManager } from '@next/third-parties/google';


const inter = Inter({ subsets: ["latin", "vietnamese"], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ["latin", "vietnamese"], variable: '--font-serif', style: ['normal', 'italic'] });

export function generateStaticParams() {
  return [{ locale: 'vi' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://alizedanang.net';

  return {
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'vi': `${baseUrl}/vi`,
        'en': `${baseUrl}/en`,
        'x-default': `${baseUrl}/vi`
      }
    }
  }
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <html lang={locale} className={`scroll-smooth ${inter.variable} ${playfair.variable}`}>
      <GoogleTagManager gtmId="GTM-MPCMB7DV" />
      <body className="bg-jet-black text-pearl-white font-sans antialiased selection:bg-gold selection:text-jet-black overflow-x-hidden min-h-screen">
        <Web3Provider>
          <StoreShell locale={locale}>
            {children}
          </StoreShell>
        </Web3Provider>
        <LiveChatWidget />
        <Analytics />
        <SpeedInsights />
        {/* Cloudflare Web Analytics */}
        <Script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "fee5c5696c2e4638b4e48d08cacf8dd7"}'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

