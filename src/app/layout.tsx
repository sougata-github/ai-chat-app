import "./globals.css";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TRPCProvider } from "@/trpc/client";
import { Geist } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ai Chat",
  description: "Advanced ai chat bot powered.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <TRPCProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            {children}
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
