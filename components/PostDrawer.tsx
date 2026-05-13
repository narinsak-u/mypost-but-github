"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";

import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import usePostModal from "@/store/use-post-modal";
import NewTag from "./new-tag";

import { Tag, TagOptions } from "@/data/tags";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

import Toolbar from "./Toolbar";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { createPost } from "@/actions/post-actions";
import { useValidateQuery } from "@/hooks/use-revalidate-query";
import { BlockNoteEditor } from "@blocknote/core";
import { useGetUserList } from "@/hooks/use-get-user-list";

/* ✅ MOVE THIS HERE */
const Editor = dynamic(() => import("@/components/editor/Editor"), {
  ssr: false,
});

const content = `<p class="bn-inline-content">Hello, <strong>world!</strong></p><p class="bn-inline-content"></p>`;

type Props = {};

const PostDrawer = (props: Props) => {
  const [html, setHTML] = useState<string>("");
  const [title, setTitle] = useState<string>("Untitled");
  const [selectedTag, setSelectedtag] = useState<Tag | null>(null);
  const { isOpen, onClose } = usePostModal();
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { validatePostQueries } = useValidateQuery();
  const { usernames } = useGetUserList()

  const onCreatePost = async () => {
    if (!userId) return;
    if (isPending) return;

    try {
      const post = await createPost({
        title: title ?? "Untitled",
        body: html,
        tag: selectedTag?.value ?? TagOptions[0]!.value,
      });

      if (post && typeof post === "object" && "id" in post) {
        toast.success("Post has been created 🎉", { duration: 1500 });

        setHTML("");
        setTitle("Untitled");
        setSelectedtag(null);

        //  validate post queries
        await validatePostQueries({ ...post, comments: [] });
        router.refresh();
      }
    } catch (error: any) {
      toast.error(`${error.message} ‼️`, { duration: 1500 });
    } finally {
      onClose();
    }
  };

  const onChange = async (editor: BlockNoteEditor) => {
    const html = await editor.blocksToHTMLLossy(editor.document);
    setHTML(html);
  };

  if (!isLoaded) return null;

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent className="bg-[#1F1F1F] border-none">
        <VisuallyHidden>
          <DrawerHeader>
            <DrawerTitle>Move Goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
        </VisuallyHidden>
        <div className="mx-auto w-full h-full flex flex-col">
          <ScrollArea className="h-200">
            <div className="mx-8 my-4 flex justify-end gap-3">
              <Button className="cursor-pointer" size="sm" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-blue-700 cursor-pointer hover:bg-blue-900"
                disabled={isPending}
                onClick={() => startTransition(onCreatePost)}
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
              <Editor
                onChange={onChange}
                initialContent={content}
                editable
                users={usernames}
              />
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PostDrawer;
