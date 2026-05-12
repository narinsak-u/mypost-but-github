import { Inter } from "next/font/google";
import "./globals.css";

import Providers from "@/providers";
import Nav from "@/components/Nav";
import { cn } from "@/lib/utils";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "mypost but github",
  description: "A mini social media inspired by Github + Twitter",
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "relative")}>
        <ClerkProvider
          appearance={{ baseTheme: dark }}
        >
          <Providers>
            <Nav />
            {children}
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
