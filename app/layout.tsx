import { Inter } from "next/font/google";
import { Metadata } from "next";
import "./globals.css";

import Providers from "@/providers";
import Nav from "@/components/nav/Nav";
import { cn } from "@/lib/utils";
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
  return new Date().getFullYear();
}

export default async function RootLayout({ children }: Props) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(inter.className, "relative")}
        suppressHydrationWarning
      >
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
