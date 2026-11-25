import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "One Way Nepal",
  description: "A refined agency and property experience website.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}

        <Script
          src="https://test.onewaynepal.com/chat-api/widget.js?org=e73e3b3b-220a-4382-81e0-cef2ea63ded5"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}