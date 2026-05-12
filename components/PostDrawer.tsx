"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import usePostModal from "@/store/use-post-modal";
import NewTag from "./new-tag";

import { BlockNoteEditor } from "@blocknote/core";
import { Tag, TagOptions } from "@/data/tags";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

import Toolbar from "./Toolbar";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import useCreatePost from "@/hooks/use-create-post";

/* ✅ MOVE THIS HERE */
const Editor = dynamic(() => import("@/components/editor/Editor"), {
  ssr: false,
});

type Props = {};

const PostDrawer = (props: Props) => {
  const [html, setHTML] = useState<string>("");
  const [title, setTitle] = useState<string>("Untitled");
  const [selectedTag, setSelectedtag] = useState<Tag | null>(null);
  const { isOpen, onClose } = usePostModal();

  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { createPost, isPending } = useCreatePost();

  if (!isLoaded) return null;

  const onChange = async (editor: BlockNoteEditor) => {
    const html = await editor.blocksToHTMLLossy(editor.document);
    setHTML(html);
  };

  const onCreatePost = async () => {
    if (!userId) return;

    try {
      const post = await createPost({
        title: title ?? "Untitled",
        body: html,
        tag: selectedTag?.value ?? TagOptions[0]!.value,
      });

      if (post) {
        toast.success("Post has been created 🎉", { duration: 1500 });

        setHTML("");
        setTitle("Untitled");
        setSelectedtag(null);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(`${error.message} ‼️`, { duration: 1500 });
    } finally {
      onClose();
    }
  };

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent className="bg-[#1F1F1F] border-none">
        <div className="mx-auto w-full h-full flex flex-col">
          <ScrollArea className="h-150">
            <div className="mx-8 my-4 flex justify-end gap-3">
              <Button size="sm" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-blue-700 hover:bg-blue-900"
                disabled={isPending}
                onClick={onCreatePost}
              >
                {isPending ? (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                    Create post
                  </>
                ) : (
                  "Create post"
                )}
              </Button>
            </div>

            <div className="mx-auto md:max-w-3xl lg:max-w-4xl">
              <Toolbar title={title} setTitle={setTitle} />
              <NewTag
                selectedTag={selectedTag}
                setSelectedtag={setSelectedtag}
              />
              <Editor />
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PostDrawer;
