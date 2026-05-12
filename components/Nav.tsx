"use client";

import { Rocket } from "lucide-react";

import UserMenu from "./auth/UserMenu";
import { SignedIn, SignedOut } from "./auth/SessionGuard";
import Link from "next/link";

type Props = {};

const Nav = (props: Props) => {
  return (
    <div className="h-16.25 border-b-[#444C56] border-b flex justify-between items-center px-10 xl:px-20">
      <Link
        href="/"
        className="text-lg text-white cursor-pointer flex items-center gap-2"
      >
        <Rocket size={24} />
        <div className="text-lg font-semibold">Mypost but Github</div>
      </Link>

      <div className="flex items-center text-white gap-3 ">
        <SignedIn>
          <UserMenu />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in" className="text-sm font-medium hidden sm:block">
            Join Us ✌️🎉
          </Link>
        </SignedOut>
      </div>
    </div>
  );
};

export default Nav;
