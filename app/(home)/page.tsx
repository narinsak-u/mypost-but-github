import MainContentWrapper from "@/components/Wrapper";
import Banner from "@/components/Banner";
import Feed from "@/components/Feed";
import Tabs from "@/components/Tabs";
import WhoToFollow from "@/components/WhoToFollow";
import { Suspense } from "react";
import Skeleton from "@/components/Skeleton";
import type { Metadata } from "next";
import { siteMetadata } from "@/site/siteMetadata";

const metadataBase = new URL(siteMetadata.siteAddress);

export const metadata: Metadata = {
  metadataBase,
  title: siteMetadata.homeTitle,
  description: siteMetadata.description,
  keywords: siteMetadata.keywords,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "/",
    title: siteMetadata.homeTitle,
    description: siteMetadata.description,
    siteName: siteMetadata.title,
    images: [
      {
        url: "/screenshot.png",
        alt: siteMetadata.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.homeTitle,
    description: siteMetadata.description,
    images: ["/screenshot.png"],
  },
};

const page = async () => {
  return (
    <MainContentWrapper>
      <Banner />
      <Tabs firstTab="For You" secondTab="Following" />
      <Suspense fallback={<Skeleton />}>
        <Feed />
      </Suspense>
      <WhoToFollow />
    </MainContentWrapper>
  );
};

export default page;
