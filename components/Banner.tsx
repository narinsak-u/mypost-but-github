"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { BookOpenText } from "lucide-react";

import usePostModal from "@/store/use-post-modal";

type Props = {
  isProfile?: boolean;
};

const Banner = ({ isProfile }: Props) => {
  const postModal = usePostModal();

  return (
    <div className="flex items-center rounded-sm justify-center flex-col py-10 border border-[#444C56]">
      <BookOpenText size={40} />
      <div className="text-2xl mt-4 mx-1">Post your idea</div>
      <p className="m-3 text-center pb-5">
        Hope with further education, people can expand their horizons.
      </p>

      {!isProfile && (
        <>
          <SignedIn>
            <button
              className="w-[125px] h-[32px] rounded-sm gap-5 bg-[#006EED] hover:bg-sky-700"
              onClick={() => postModal.onOpen()}
            >
              Create a post
            </button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="w-[125px] h-[32px] rounded-sm gap-5 bg-[#006EED] hover:bg-sky-700">
                Create a post
              </button>
            </SignInButton>
          </SignedOut>
        </>
      )}
    </div>
  );
};

export default Banner;
