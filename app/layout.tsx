import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { CommandPalette } from "@/components/command-palette";
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
  title: "APILens — API Version Management",
  description:
    "Project-based API version management and collaboration platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-full">
        {children}
        <CommandPalette />
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: "rounded-xl border-stone-200/70 dark:border-stone-800/70",
            },
          }}
        />
      </body>
    </html>
  );
}
