import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SupabaseProvider from "@/lib/supabase/SupabaseProvider";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VeriCert | Blockchain Credentials",
  description: "Issue and verify tamper-proof digital certificates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SupabaseProvider>
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        >
          <AnimatedBackground />
          <Navbar />
          <Toaster />

          <main className="grow w-full">{children}</main>
        </body>
      </html>
    </SupabaseProvider>
  );
}
