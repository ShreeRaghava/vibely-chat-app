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
  title: "Vibely",
  description: "A stranger chat web application for connecting with random people.",
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
