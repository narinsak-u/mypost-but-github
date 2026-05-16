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
import { authClient } from "@/lib/auth-client";
import { Comment } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deletePost } from "@/actions/post-actions";
import { deleteComment } from "@/actions/comment-actions";
import { useValidateQuery } from "@/hooks/use-revalidate-query";
import { PostPopulated } from "@/types";

type Props = {
  post: PostPopulated;
  comment?: Comment;
  isComment?: boolean;
};

const OptionMenu = ({ post, comment, isComment }: Props) => {
  const optionModal = useOptionModal();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [isPending, startTransition] = useTransition();
  const { validatePostQueries } = useValidateQuery();
  const { refresh } = useRouter();

  const onCopy = () => {
    const text = !isComment
      ? `${window.location.href}`
      : `${window.location.href}post/${post.id}`;

    navigator.clipboard.writeText(text);
    toast.success("Link copied 🎉", {
      duration: 1500,
    });
  };

  const handleAction = async () => {
    if (isPending) return;

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

      if (!session) return;

      //  validate post queries
      await validatePostQueries({
        ...post,
        user: session.user,
        comments: post.comments || [],
      } as any);
      refresh();
    } catch (error: any) {
      toast.error(`${error.message} ‼️`, { duration: 1500 });
    }
  };

  if (!session) return null;

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
          {(userId === post.userId || userId === comment?.userId) && (
            <DropdownMenuItem
              disabled={isPending}
              onClick={() => startTransition(handleAction)}
            >
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
