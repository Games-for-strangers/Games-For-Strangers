import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Games for Strangers — Small games. Play with strangers.",
  description: "A website where you play tiny games with total strangers — no login, no names, just the weird joy of the internet.",
  metadataBase: new URL("https://gamesforstrangers.lol"),
  openGraph: {
    title: "Games for Strangers",
    description: "Tiny multiplayer games with total strangers. No login. No names. Just play.",
    url: "https://gamesforstrangers.lol",
    siteName: "Games for Strangers",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Games for Strangers",
    description: "Tiny multiplayer games with total strangers. No login. No names. Just play.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-svh">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
