import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CineVerse",
  description: "Cineverse – Your universe for movies, TV series, and anime downloads.",
  keywords: ["Cineverse", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
  authors: [{ name: "Cineverse Team" }],
  openGraph: {
    title: "CineVerse",
    description: "Cineverse – Your universe for movies, TV series, and anime downloads.",
    url: "",
    siteName: "Cineverse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CineVerse",
    description: "Cineverse – Your universe for movies, TV series, and anime downloads.",
  },
  other: {
    "monetag": "ef69de7ce8e8810689cda4643e780697"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Monetag verification meta tag */}
        <Script
          id="monetag-meta"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (!window.location.pathname.startsWith('/admin')) {
                const metaTag = document.createElement('meta');
                metaTag.name = 'monetag';
                metaTag.content = 'ef69de7ce8e8810689cda4643e780697';
                document.head.appendChild(metaTag);
              }
            `,
          }}
        />

        {/* ✅ New Monetag Ads (3 ads) */}
        <Script
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Only load ads if not on admin pages
              if (!window.location.pathname.startsWith('/admin')) {
                (function(s){
                  s.dataset.zone='10559283';
                  s.src='https://al5sm.com/tag.min.js';
                })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')));

                (function(s){
                  s.src='https://3nbf4.com/act/files/tag.min.js?z=10559287';
                  s.setAttribute('data-cfasync', 'false');
                  s.async=true;
                })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')));

                (function(s){
                  s.dataset.zone='10559290';
                  s.src='https://nap5k.com/tag.min.js';
                })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')));
              }
            `,
          }}
        />

        {children}
        <Toaster />
      </body>
    </html>
  );
}
