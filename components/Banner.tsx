"use client";

import { SignedIn, SignedOut } from "./auth/SessionGuard";
import Link from "next/link";

import usePostModal from "@/store/use-post-modal";

type Props = {
  isProfile?: boolean;
};

const Banner = ({ isProfile }: Props) => {
  const postModal = usePostModal();

  if (isProfile) return null;

  return (
    <div className="w-full flex items-center justify-center flex-col rounded-lg border border-[#30363D] bg-linear-to-b from-[#161B22] to-[#0D1117] px-6 py-10 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="text-xl sm:text-2xl font-semibold mt-4 text-white">
        Post your idea
      </div>
      <p className="mt-2 max-w-md text-sm text-[#8B949E]">
        Hope with further education, people can expand their horizons.
      </p>
      <div className="mt-5">
        <SignedIn>
          <button
            className="h-9 px-4 rounded-md cursor-pointer bg-[#1F6FEB] hover:bg-[#2F81F7] text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1117]"
            onClick={() => postModal.onOpen()}
          >
            Create a Post
          </button>
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in">
            <button className="w-[125px] h-[32px] rounded-sm gap-5 bg-[#006EED] hover:bg-sky-700">
              Create a post
            </button>
          </Link>
        </SignedOut>
      </div>
    </div>
  );
};

export default Banner;
