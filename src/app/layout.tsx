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
        {/* ✅ Monetag Ads (all 4) */}
        <Script
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Only load ads if not on admin pages
              if (!window.location.pathname.startsWith('/admin')) {
                (function(s){

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
