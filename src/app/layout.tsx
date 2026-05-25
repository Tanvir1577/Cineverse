import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cineverse - Your Ultimate Movie, Series & Anime Destination",
  description: "Discover and download movies, TV series, and anime in stunning quality. Cineverse offers a premium collection with powerful search and easy navigation.",
  keywords: ["Cineverse", "movies", "series", "anime", "download", "streaming", "IMDB"],
  icons: {
    icon: "/Cineverse.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
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

        {/* Monetag Ads (3 ads) */}
        <Script
          id="monetag-ads"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
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
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
