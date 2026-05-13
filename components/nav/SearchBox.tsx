'use client'

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandInput,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { PostSearchResult } from "./Nav";
import { renderHighlight } from "./render-highlight";

type Props = {
    isSearchOpen: boolean;
    setIsSearchOpen: (open: boolean) => void;
    closeSearch: () => void;
    query: string;
    setQuery: (query: string) => void;
    filteredUsers: {
        id: string;
        name: string;
        handle: string;
        imageUrl: string;
    }[];
    isSearchingPosts: boolean;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    postResults: PostSearchResult[];
}

const SearchBox = ({ isSearchOpen, setIsSearchOpen, closeSearch, query, setQuery, filteredUsers, isSearchingPosts, searchInputRef, postResults }: Props) => {
    const router = useRouter();

    return (
        <CommandDialog
            open={isSearchOpen}
            onOpenChange={(open) => (open ? setIsSearchOpen(true) : closeSearch())}
            contentClassName="max-w-xl bg-[#0D1117] border border-[#30363D] text-[#C9D1D9] top-[15%] translate-y-[-15%] pb-4"
            commandClassName="bg-[#0D1117] text-[#C9D1D9] [&_[cmdk-group-heading]]:text-[#8B949E]"
        >
            <CommandInput
                ref={searchInputRef}
                value={query}
                onValueChange={setQuery}
                placeholder="Search users, posts..."
                wrapperClassName="border-[#30363D]"
                iconClassName="text-[#8B949E] opacity-100"
                className="text-[#C9D1D9] placeholder:text-[#8B949E]"
            />
            <CommandList>
                <CommandEmpty>
                    {isSearchingPosts ? "Searching..." : query.trim() ? "No results found." : "Type to search."}
                </CommandEmpty>

                {query.trim() ? (
                    <>
                        {filteredUsers.length ? (
                            <CommandGroup heading="Users">
                                {filteredUsers.map((u) => (
                                    <CommandItem
                                        key={u.id}
                                        value={u.name}
                                        className="aria-selected:bg-[#1F6FEB]/20 aria-selected:text-[#C9D1D9]"
                                        onSelect={() => {
                                            closeSearch();
                                            router.push(`/user/${u.id}`);
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-7 h-7">
                                                <AvatarImage src={u.imageUrl || "https://github.com/shadcn.png"} />
                                                <AvatarFallback>U</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-[#C9D1D9]">{u.name}</span>
                                                {u.handle ? <span className="text-xs text-[#8B949E]">{u.handle}</span> : null}
                                            </div>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ) : null}

                        {filteredUsers.length && (isSearchingPosts || postResults.length) ? <CommandSeparator /> : null}

                        {isSearchingPosts ? (
                            <CommandGroup heading="Posts">
                                <CommandItem disabled value="Searching posts">
                                    Searching...
                                </CommandItem>
                            </CommandGroup>
                        ) : postResults.length ? (
                            <CommandGroup heading="Posts">
                                {postResults.map((p) => {
                                    const titleHighlight = p.highlights?.find(
                                        (h: any) => h.path === "title"
                                    );
                                    const bodyHighlight = p.highlights?.find(
                                        (h: any) => h.path === "body"
                                    );

                                    return (
                                        <CommandItem
                                            key={p.id}
                                            value={p.title}
                                            className="aria-selected:bg-[#1F6FEB]/20 aria-selected:text-[#C9D1D9]"
                                            onSelect={() => {
                                                closeSearch();
                                                router.push(`/post/${p.id}`);
                                            }}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm text-[#C9D1D9]">
                                                    {titleHighlight ? renderHighlight(titleHighlight) : p.title}
                                                </span>
                                                {p.body ? (
                                                    <span className="text-xs text-[#8B949E] line-clamp-1">
                                                        {bodyHighlight ? renderHighlight(bodyHighlight) : p.body.replace(/<[^>]*>/g, "")}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </CommandItem>
                                    )
                                }
                                )}
                            </CommandGroup>
                        ) : null}
                    </>
                ) : null}
            </CommandList>
        </CommandDialog>
    )
}

export default SearchBox;
