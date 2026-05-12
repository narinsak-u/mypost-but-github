"use client";

import { Rocket } from "lucide-react";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

import { useRouter } from "next/navigation";

type Props = {};

const Nav = (props: Props) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) return null;

  return (
    <div className="h-16.25 border-b-[#444C56] border-b flex justify-between items-center px-10 xl:px-20">
      <div
        className="text-lg text-white cursor-pointer flex items-center gap-2"
        onClick={() => router.push("/")}
      >
        <Rocket size={24} />
        <div className="text-lg font-semibold">Mypost but Github</div>
      </div>

      <div className="flex items-center text-white gap-3 ">
        {user && (
          <div className="text-sm font-medium hidden sm:block">
            {`${user.fullName ?? user.primaryEmailAddress}`}
          </div>
        )}

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <div
              className="w-32.5 h-8 rounded-sm"
            // onClick={() => {}}
            >
              Join Us ✌️🎉
            </div>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  );
};

export default Nav;
