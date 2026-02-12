import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Readex_Pro } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const readexPro = Readex_Pro({
  subsets: ["latin", "arabic"],
  weight: "variable",
  display: "swap",
  variable: "--font-readex",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calculadora de Transporte Docente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-screen w-screen overflow-hidden ${readexPro.variable} font-readex`}>
      <body
        className={`bg-[#EAEFF3] w-screen h-screen overflow-y-auto  flex flex-col  `}
      >
        {children}
      </body>
    </html>
  );
}
