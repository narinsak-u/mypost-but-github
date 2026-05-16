"use client";

import { Search, Sticker, User, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { LoginModal } from "@/components/auth/LoginModal";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGetUserList } from "@/hooks/use-get-user-list";
import { searchPostsAutocomplete } from "@/actions/search-posts-atlas";
import SearchBox from "./SearchBox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useChatActions } from "@/store/use-chat-store";
import { useGetConversations } from "@/hooks/use-get-conversations";
import { ConversationWithParticipants } from "@/types";

type Props = {};

export type PostSearchResult = Awaited<
  ReturnType<typeof searchPostsAutocomplete>
>[number];

const Nav = (props: Props) => {
  const { data: session } = authClient.useSession();
  const { push } = useRouter();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [postResults, setPostResults] = useState<PostSearchResult[]>([]);
  const [isSearchingPosts, setIsSearchingPosts] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const postSearchReqId = useRef(0);

  const { data: userList } = useGetUserList();
  const { open: openChat } = useChatActions();
  const { data: conversations } = useGetConversations();

  const hasUnread = useMemo(() => {
    if (!session?.user?.id || !conversations) return false;
    const conversationList = conversations as ConversationWithParticipants[];
    return conversationList.some((conv) => {
      const lastMessage = conv.messages[0];
      return (
        lastMessage &&
        lastMessage.senderId !== session.user.id &&
        !lastMessage.readAt
      );
    });
  }, [conversations, session?.user?.id]);

  // memoize filtered users to avoid unnecessary re-renders
  const filteredUsers = useMemo(() => {
    type FilteredUser = {
      id: string;
      name: string;
      handle: string;
      imageUrl: string;
    };

    const q = query.trim().toLowerCase();
    if (!q) return [] as FilteredUser[];

    const users: FilteredUser[] = (userList ?? [])
      .map((u) => {
        const name = u.name || u.email?.split("@")[0] || "User";
        const handle = `@${name.replace(/\s+/g, "")}`;

        return {
          id: u.id,
          name,
          handle,
          imageUrl: u.image || "",
        };
      })
      .filter(
        (u) =>
          u.id && u.name && `${u.name} ${u.handle}`.toLowerCase().includes(q),
      );

    return users.slice(0, 8);
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

  return (
    <div className="h-16.25 mb-12 border-b border-[#30363D] flex justify-between items-center px-5 md:px-0 gap-2 ">
      <div
        role="button"
        tabIndex={0}
        className="text-lg text-white cursor-pointer flex items-center gap-2"
        onClick={() => push("/")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            push("/");
          }
        }}
      >
        <Sticker size={24} />
        <div className="text-md font-semibold hidden md:block">
          Mypost but Github
        </div>
      </div>

      <button
        type="button"
        aria-label="Open search"
        className="w-full max-w-xs md:max-w-md h-9 rounded-md bg-[#0D1117] border border-[#30363D] flex items-center gap-2 px-3 hover:border-[#58A6FF] focus-visible:border-[#58A6FF] outline-none"
        onClick={openSearch}
      >
        <Search size={16} className="shrink-0 text-[#8B949E]" />
        <span className="flex-1 min-w-0 text-left text-sm text-[#8B949E] truncate">
          Search users, posts…
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
        {session?.user ? (
          <>
            <button
              onClick={() => openChat()}
              className="relative cursor-pointer p-2 rounded-full hover:bg-[#30363D] transition-colors"
            >
              <Mail size={20} className="text-[#8B949E]" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-[#0D1117]" />
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                  <UserAvatar
                    imageUrl={
                      session.user.image || "https://github.com/shadcn.png"
                    }
                    name={session.user.name ?? session.user.email}
                    size="md"
                    className="size-8"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-[#1F1F1F] border-[#30363D]"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-y-1">
                    <p className="text-sm font-medium leading-none text-[#C9D1D9]">
                      {session.user.name ?? "User"}
                    </p>
                    <p className="text-xs leading-none text-[#8B949E]">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#30363D]" />
                <DropdownMenuItem
                  onClick={() => push(`/user/${session.user.id}`)}
                  className="text-[#C9D1D9] focus:bg-[#262D34] focus:text-white"
                >
                  <User className="mr-2 size-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#30363D]" />
                <DropdownMenuItem
                  onClick={() => {
                    authClient.signOut();
                    push("/");
                  }}
                  className="text-red-500 focus:text-red-500 focus:bg-[#262D34]"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <LoginModal>
            <button className="w-32.5 h-8 cursor-pointer rounded-md bg-[#238636] text-white font-semibold">
              Join Now
            </button>
          </LoginModal>
        )}
      </div>
    </div>
  );
};

export default Nav;
