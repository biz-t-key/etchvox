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
  icons: {
    icon: "/favicon.jpg",
    shortcut: "/favicon.jpg",
    apple: "/favicon.jpg",
  },
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Lora:ital,wght@0,400..700;1,400..700&family=Cinzel:wght@400..900&family=Spectral:ital,wght@0,200..800;1,200..800&family=Oswald:wght@200..700&family=Barlow+Condensed:ital,wght@0,100..900;1,100..900&display=swap"
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
