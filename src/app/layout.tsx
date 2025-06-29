import "./globals.css";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Geist, Geist_Mono } from "next/font/google";
import { TRPCProvider } from "@/trpc/client";
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
  title: "Ai Chat",
  description: "Advanced Ai ChatBot built using Next.js and Vercel's AI SDK.",
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
        <TRPCProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster richColors expand={false} />
            {children}
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
