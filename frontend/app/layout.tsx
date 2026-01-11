'use client';

import type { Metadata } from "next";
import "./globals.css";
import { useEffect, useState } from "react";

// Metadata removed - use generateMetadata in page.tsx instead
// export const metadata: Metadata = { ... }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Get saved theme preference or default to system
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    const preferredTheme = savedTheme || 'system';
    setTheme(preferredTheme);

    // Apply theme
    applyTheme(preferredTheme);

    // Listen to system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (preferredTheme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const applyTheme = (themeMode: 'light' | 'dark' | 'system') => {
    const html = document.documentElement;
    let isDark = false;

    if (themeMode === 'dark') {
      isDark = true;
    } else if (themeMode === 'light') {
      isDark = false;
    } else {
      // system
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'system';
                const isDark = theme === 'dark' || 
                  (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-50 transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
