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
  title: "AI Chat",
  description: "AI chat app built using Next.js, Convex and Vercel AI SDK.",
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
