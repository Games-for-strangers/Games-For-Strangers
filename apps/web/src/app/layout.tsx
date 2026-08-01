import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";

import "../index.css";
import { AppShell } from "@/components/app-shell";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "Games for Strangers — Small games. Play with strangers.",
  description:
    "A website where you play tiny games with total strangers — no login, no names, just the weird joy of the internet.",
  metadataBase: new URL("https://gamesforstrangers.lol"),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Games For Strangers",
  },
  openGraph: {
    title: "Games for Strangers",
    description:
      "Tiny multiplayer games with total strangers. No login. No names. Just play.",
    url: "https://gamesforstrangers.lol",
    siteName: "Games for Strangers",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Games for Strangers",
    description:
      "Tiny multiplayer games with total strangers. No login. No names. Just play.",
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-DLFDC0PGDW";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} dark`}>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
