import { Inter } from "next/font/google";
import "./globals.css";

import Providers from "@/providers";
import Nav from "@/components/nav/Nav";
import { cn } from "@/lib/utils";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import type { Metadata } from "next";
import { siteMetadata } from "@/site/siteMetadata";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
};

type Props = {
  children: React.ReactNode;
};

async function getCurrentYear() {
  'use cache'
  return new Date().getFullYear()
}

export default async function RootLayout({ children }: Props) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "relative")} suppressHydrationWarning>
        <Suspense fallback={null}>
          <ClerkProvider appearance={{ baseTheme: dark }}>
            <Providers>
              <div className="max-w-4xl mx-auto">
                <Nav />
                {children}
                <Footer getCurrentYear={await getCurrentYear()} />
              </div>
            </Providers>
          </ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}
