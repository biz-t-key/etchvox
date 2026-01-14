import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EtchVox - What's Your Voice Type?",
  description: "Discover your voice personality type. Are you The Bored Robot or The Deep Whale? Take the voice analysis test now.",
  keywords: ["voice analysis", "personality test", "voice type", "voice match", "etchvox"],
  authors: [{ name: "EtchVox Team" }],
  openGraph: {
    title: "EtchVox - What's Your Voice Type?",
    description: "Your Face is 10/10. What about your Voice?",
    type: "website",
    locale: "en_US",
    siteName: "EtchVox",
  },
  twitter: {
    card: "summary_large_image",
    title: "EtchVox - What's Your Voice Type?",
    description: "Your Face is 10/10. What about your Voice?",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-black text-white antialiased">
        <main className="relative min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
