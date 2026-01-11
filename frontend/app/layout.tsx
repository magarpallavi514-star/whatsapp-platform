import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "./theme-script";

export const metadata: Metadata = {
  title: "Pixels WhatsApp Platform - Business Messaging API Solution",
  description: "Transform your customer engagement with our powerful WhatsApp Business API platform. Send messages, automate conversations, and scale your business communication.",
  keywords: ["WhatsApp API", "WhatsApp Business", "Business Messaging", "Customer Engagement", "WhatsApp Automation", "Bulk WhatsApp", "WhatsApp CRM"],
  authors: [{ name: "Pixels Agency" }],
  openGraph: {
    title: "Pixels WhatsApp Platform - Business Messaging API Solution",
    description: "Transform your customer engagement with our powerful WhatsApp Business API platform.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pixels WhatsApp Platform",
    description: "Transform your customer engagement with WhatsApp Business API",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-50 transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
