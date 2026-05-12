"use client";

import { Copy, EllipsisVertical, Trash2 } from "lucide-react";
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
import { useAuth } from "@clerk/nextjs";
import { Post } from "@prisma/client";
import { toast } from "sonner";
import useDeletePost from "@/hooks/use-delete-post";
import { useRouter } from "next/navigation";

type Props = {
  post: Post;
  isPost?: boolean;
};

const OptionMenu = ({ post, isPost }: Props) => {
  const optionModal = useOptionModal();
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const { deletePost, isPending } = useDeletePost();

  if (!isLoaded) return null;

  const onCopy = () => {
    const text = isPost
      ? `${window.location.href}`
      : `${window.location.href}post/${post.id}`;

    navigator.clipboard.writeText(text);
    toast.success("Link copied 🎉", {
      duration: 1500,
    });
  };

  const onDelete = async () => {
    toast.promise(async () => await deletePost(post.id), {
      loading: "Deleting...",
      success: () => {
        router.refresh();
        return `Post deleted ‼️`;
      },
      error: "Error",
    });
  };

  return (
    <DropdownMenu onOpenChange={optionModal.onClose}>
      <DropdownMenuTrigger asChild>
        <EllipsisVertical
          className="cursor-pointer z-10"
          size={15}
          onClick={() => optionModal.onOpen()}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit">
        <DropdownMenuLabel>Post Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {userId === post.userId && (
            <DropdownMenuItem onClick={onDelete}>
              Delete
              <DropdownMenuShortcut>
                <Trash2 size={15} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onCopy}>
            Share
            <DropdownMenuShortcut>
              <Copy size={15} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OptionMenu;
