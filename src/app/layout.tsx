import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "BellyBeats - Track Every Moment",
  description: "A premium glassmorphism baby kick tracker for soon-to-be parents.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BellyBeats",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans pb-24 md:pb-32`} suppressHydrationWarning>
        <AuthProvider>
          <main className="container mx-auto px-4 py-8 max-w-lg min-h-screen">
            {children}
          </main>
          <BottomNav />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
