import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import AuthDebugger from "@/components/AuthDebugger";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthProvider";
import DynamicIslandWrapper from "@/components/DynamicIslandWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/images/icon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/icon/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/icon/apple-touch-icon.png" />
        <link rel="manifest" href="/images/icon/site.webmanifest" />
        <link rel="icon" href="/images/icon/favicon.ico" />
        
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-6VFG6B4CMY`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6VFG6B4CMY');
          `}
        </Script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        {/* Dark mode script */}
        <Script id="dark-mode" strategy="beforeInteractive">
          {`
            // On page load or when changing themes, best to add inline in \`head\` to avoid FOUC
            document.documentElement.classList.toggle(
              "dark",
              localStorage.theme === "dark" ||
                (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
            );
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200`}
      >
        <Providers>
          <AuthProvider>
            <DynamicIslandWrapper />
            {children}
            <AuthDebugger />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
