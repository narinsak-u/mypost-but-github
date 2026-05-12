"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { TagOptions, Tag } from "@/data/tags";

type Props = {
  selectedTag: Tag | null;
  setSelectedtag: React.Dispatch<React.SetStateAction<Tag | null>>;
};

const NewTag = ({ selectedTag, setSelectedtag }: Props) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center space-x-4 my-8 ms-[54px]">
      <p className="text-sm text-muted-foreground">Add tag</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="w-[150px] justify-start"
          >
            {selectedTag ? <>{selectedTag.label}</> : <>+ Tag</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <CommandInput placeholder="Change tag..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {TagOptions.map((tag) => (
                  <CommandItem
                    key={tag.value}
                    value={tag.value}
                    defaultValue={TagOptions[0]?.value}
                    onSelect={(value) => {
                      setSelectedtag(
                        TagOptions.find(
                          (priority) => priority.value === value
                        ) || null
                      );
                      setOpen(false);
                    }}
                  >
                    {tag.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NewTag;
