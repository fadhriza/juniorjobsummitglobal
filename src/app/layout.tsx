// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: {
    default: "Product Dashboard - Summit Global",
    template: "%s | Product Dashboard"
  },
  description: "Advanced product management dashboard for Summit Global Teknologi. Manage your product inventory with ease.",
  keywords: ["product management", "dashboard", "inventory", "Summit Global"],
  authors: [{ name: "Summit Global Teknologi" }],
  creator: "Summit Global Teknologi",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dashboard.summitglobal.com",
    title: "Product Dashboard - Summit Global",
    description: "Advanced product management dashboard for Summit Global Teknologi",
    siteName: "Product Dashboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Dashboard - Summit Global",
    description: "Advanced product management dashboard for Summit Global Teknologi",
  },
  robots: {
    index: false,
    follow: false,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={`${inter.className} antialiased bg-slate-50`}>
        <AuthProvider>
          <div className="min-h-screen">
            {children}
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '14px',
                maxWidth: '400px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f9fafb',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f9fafb',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}