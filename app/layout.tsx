import type { Metadata } from "next";
import { Courier_Prime } from "next/font/google";
import { Providers } from '@/components/providers';
import "./globals.css";

const courierMono = Courier_Prime({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Meet-New-Make-New",
  description: "A stranger chat app for meeting new people, making friends, and connecting instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${courierMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
