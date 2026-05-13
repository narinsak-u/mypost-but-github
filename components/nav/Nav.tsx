"use client";

import { Search, Sticker } from "lucide-react";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGetUserList } from "@/hooks/use-get-user-list";
import { searchPostsAutocomplete } from "@/actions/search-posts-atlas";
import SearchBox from "./SearchBox";

type Props = {};

type ClerkUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  imageUrl?: string | null;
};

export type PostSearchResult = Awaited<ReturnType<typeof searchPostsAutocomplete>>[number];

const Nav = (props: Props) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [postResults, setPostResults] = useState<PostSearchResult[]>([]);
  const [isSearchingPosts, setIsSearchingPosts] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const postSearchReqId = useRef(0);

  const { data: userList } = useGetUserList();

  // Memoize the filtered users to avoid re-calculating on every render
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const users = ((userList ?? []) as ClerkUser[])
      .map((u) => {
        const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.username || "User";
        const handle = `@${u?.firstName ?? ""}${u?.lastName ?? ""}`.trim();

        return {
          id: u.id,
          name,
          handle,
          imageUrl: u.imageUrl || "",
        };
      })
      .filter((u) => u.id && u.name);

    return users
      .filter((u) => `${u.name} ${u.handle}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, userList]);

  // "/" key down effect
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTypingTarget =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        Boolean(target?.isContentEditable);

      if (isTypingTarget) return;

      e.preventDefault();
      setIsSearchOpen(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus the search input when the search dialog is opened
  useEffect(() => {
    if (!isSearchOpen) return;

    const t = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [isSearchOpen]);

  // Search posts when the query is changed
  useEffect(() => {
    if (!isSearchOpen) return;

    const trimmed = query.trim();
    const reqId = ++postSearchReqId.current;

    // Debounce the search request to avoid sending too many requests
    if (trimmed.length < 2) {
      setPostResults([]);
      setIsSearchingPosts(false);
      return;
    }

    setIsSearchingPosts(true);

    const t = window.setTimeout(async () => {
      try {
        const results = await searchPostsAutocomplete(trimmed);
        if (postSearchReqId.current !== reqId) return;
        setPostResults(results);
      } finally {
        if (postSearchReqId.current === reqId) setIsSearchingPosts(false);
      }
    }, 250);

    return () => window.clearTimeout(t);
  }, [isSearchOpen, query]);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setQuery("");
    setPostResults([]);
    setIsSearchingPosts(false);
  };

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  if (!isLoaded) return null;

  return (
    <div className="h-16.25 mb-12 border-b border-[#30363D] flex justify-between items-center px-5 md:px-0 gap-2 ">
      <div
        className="text-lg text-white cursor-pointer flex items-center gap-2"
        onClick={() => router.push("/")}
      >
        <Sticker size={24} />
        <div className="text-md font-semibold hidden md:block">Mypost but Github</div>
      </div>

      <button
        type="button"
        aria-label="Open search"
        className="w-full max-w-xs md:max-w-md h-9 rounded-md bg-[#0D1117] border border-[#30363D] flex items-center gap-2 px-3 hover:border-[#58A6FF] focus-visible:border-[#58A6FF] outline-none"
        onClick={openSearch}
      >
        <Search size={16} className="shrink-0 text-[#8B949E]" />
        <span className="flex-1 min-w-0 text-left text-sm text-[#8B949E] truncate">
          Search users, posts...
        </span>
        <kbd className="shrink-0 px-2 py-0.5 text-xs text-[#8B949E] bg-[#161B22] border border-[#30363D] rounded-sm">
          /
        </kbd>
      </button>

      <SearchBox
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        closeSearch={closeSearch}
        query={query}
        setQuery={setQuery}
        filteredUsers={filteredUsers}
        isSearchingPosts={isSearchingPosts}
        searchInputRef={searchInputRef}
        postResults={postResults}
      />

      <div className="flex items-center text-white gap-3 ">
        {user && (
          <Link href={`/user/${user.id}`} className="text-sm font-medium hidden sm:block">
            {`${user.fullName ?? user.primaryEmailAddress}`}
          </Link>
        )}

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button
              className="w-32.5 h-8 cursor-pointer rounded-md bg-[#238636] text-white font-semibold"
            >
              Join Us ✌️🎉
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  );
};

export default Nav;
