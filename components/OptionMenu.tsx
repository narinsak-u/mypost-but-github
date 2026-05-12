"use client";

import { Copy, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import useOptionModal from "@/store/use-option-modal";
import { useSession } from "@/lib/auth-client";
import { Post } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deletePost } from "@/actions/post-actions";
import { deleteComment } from "@/actions/comment-actions";
import { useValidateQuery } from "@/hooks/use-revalidate-query";
import { Comment } from "@prisma/client";

type Props = {
  post: Post;
  comment?: Comment;
  isComment?: boolean;
};

const OptionMenu = ({ post, comment, isComment }: Props) => {
  const optionModal = useOptionModal();
  const { data: session, isPending: isLoaded } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { validatePostQueries } = useValidateQuery();

  const onDelete = () => {
    startTransition(async () => {
      const promise = !isComment
        ? deletePost(post.id)
        : deleteComment(comment!.id!);

      toast.promise(
        promise.then((res: boolean | { error: string }) => {
          if (typeof res === "object" && "error" in res)
            throw new Error(res.error);
          return res === true;
        }),
        {
          loading: "Deleting...",
          success: () => {
            return `${!isComment ? "Post" : "Comment"} deleted ‼️`;
          },
          error: "Error",
        },
      );

      try {
        await promise;

        //  validate post queries
        await validatePostQueries({ ...post, comments: [] });
        router.refresh();
      } catch (error: any) {
        toast.error(`${error.message} ‼️`, { duration: 1500 });
      }
    });
  };

  const onCopy = () => {
    const text = !isComment
      ? `${window.location.href}`
      : `${window.location.href}post/${post.id}`;

    navigator.clipboard.writeText(text);
    toast.success("Link copied 🎉", {
      duration: 1500,
    });
  };

  if (!isLoaded) return null;

  return (
    <DropdownMenu onOpenChange={optionModal.onClose}>
      <DropdownMenuTrigger asChild>
        <MoreHorizontal
          className="cursor-pointer z-10"
          size={15}
          onClick={() => optionModal.onOpen()}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit" align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {session?.user?.id === post.userId && (
            <DropdownMenuItem onClick={onDelete}>
              Delete
              <DropdownMenuShortcut>
                <Trash2 size={15} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          {!isComment && (
            <DropdownMenuItem onClick={onCopy}>
              Share
              <DropdownMenuShortcut>
                <Copy size={15} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OptionMenu;
