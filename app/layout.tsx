import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Wicked Build Optimizer",
  description: "Recomendador de builds para No Rest for the Wicked. Selecione seu estilo de jogo e receba builds completas e explicadas.",
  keywords: ["No Rest for the Wicked", "builds", "build optimizer", "NRFTW"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#0d0d0d] text-[#e8e0d0]">
        {children}
      </body>
    </html>
  );
}
