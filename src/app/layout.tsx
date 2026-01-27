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
        {/* ✅ Monetag Ads (all 4) */}
        <Script
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Only load ads if not on admin pages
              if (!window.location.pathname.startsWith('/admin')) {
                (function(s){
                  s.dataset.zone='9943154';
                  s.src='https://forfrogadiertor.com/tag.min.js';
                })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')));

                (function(s){
                  s.dataset.zone='9942840';
                  s.src='https://gizokraijaw.net/vignette.min.js';
                })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')));

                (function(s){
                  s.dataset.zone='9942796';
                  s.src='https://al5sm.com/tag.min.js';
                })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')));

                (function(s){
                  s.dataset.zone='9938688';
                  s.src='https://groleegni.net/vignette.min.js';
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
