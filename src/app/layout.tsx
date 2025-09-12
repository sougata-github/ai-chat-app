import "./globals.css";

import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from "sonner";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-chat-app-dev.vercel.app"),
  title: "Ai Chat",
  description: "Advanced Ai ChatBot built using Next.js and Vercel AI SDK.",
  openGraph: {
    title: "Ai Chat",
    description: "Advanced Ai ChatBot built using Next.js and Vercel AI SDK.",
    url: "https://ai-chat-app-dev.vercel.app",
    siteName: "Ai Chat",
    images: [
      {
        url: "/ai-chat.png",
        width: 1200,
        height: 630,
        alt: "Ai ChatBot interface preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ai Chat",
    description: "Advanced Ai ChatBot built using Next.js and Vercel AI SDK.",
    images: ["/ai-chat.png"],
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
        className={`${geistSans.className} ${geistMono.variable} ${geistSans.variable} antialiased`}
      >
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster expand={false} duration={2000} />
            <ConvexQueryCacheProvider>{children}</ConvexQueryCacheProvider>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
