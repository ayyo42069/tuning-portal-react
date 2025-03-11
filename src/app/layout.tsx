import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { NotificationProvider } from "@/lib/NotificationProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tuning Portal",
  description: "Professional automotive tuning services at tuning-portal.eu",
  keywords:
    "car tuning, automotive tuning, ECU remapping, performance tuning, chip tuning",
  authors: [{ name: "Tuning Portal Team" }],
  creator: "Tuning Portal",
  publisher: "Tuning Portal",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  metadataBase: new URL("https://tuning-portal.eu"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
      "de-DE": "/de-DE",
    },
  },
  openGraph: {
    title: "Tuning Portal - Professional Automotive Tuning Services",
    description:
      "Expert automotive tuning services for optimal vehicle performance",
    url: "https://tuning-portal.eu",
    siteName: "Tuning Portal",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://tuning-portal.eu/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tuning Portal - Professional Automotive Tuning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tuning Portal - Professional Automotive Tuning Services",
    description:
      "Expert automotive tuning services for optimal vehicle performance",
    creator: "@tuningportal",
    images: ["https://tuning-portal.eu/images/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NotificationProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
