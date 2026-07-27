import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "../index.css";
import Header from "@/components/header";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
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
    <html lang="en" className={`${plusJakartaSans.variable} dark`}>
      <body className="antialiased">
        <div className="grid min-h-svh grid-rows-[auto_1fr]">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
