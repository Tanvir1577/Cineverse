import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cineverse - Your Ultimate Movie, Series & Anime Destination",
  description: "Discover and download movies, TV series, and anime in stunning quality. Cineverse offers a premium collection with powerful search and easy navigation.",
  keywords: ["Cineverse", "movies", "series", "anime", "download", "streaming", "IMDB"],
  icons: {
    icon: "/logo.svg",
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
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
