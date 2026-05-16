"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import { Comment } from "@prisma/client";
import { useGetUser } from "@/hooks/use-get-user";
import { formatDistanceToNow } from "date-fns";
import { PostPopulated } from "@/types";
import OptionMenu from "../OptionMenu";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

type Props = {
  comment: Comment;
  post: PostPopulated;
};

const CommentItem = ({ comment, post }: Props) => {
  const { data: user } = useGetUser({ userId: comment.userId });
  const { data: session } = authClient.useSession();

  return (
    <div className="mx-6">
      <div className="w-0.5 h-3 bg-[#444C56] ms-24" />
      <div className="flex items-center justify-start h-fit">
        <Link href={`/user/${comment.userId}`}>
          <UserAvatar
            imageUrl={user?.image}
            name={user?.name}
            size="sm"
            className="w-6.25 h-6.25"
          />
        </Link>
        <div className="flex bg-[#30363E] w-full py-1 px-3 flex-col ml-4 border border-[#444C56] rounded-sm">
          <div className="flex justify-between w-full gap-1">
            <div className="mb-1 flex gap-1 text-[#ADBAC7] text-xs">
              <Link
                href={`/user/${comment.userId}`}
                className="hover:text-[#ADBAC7]"
              >
                {user?.name ?? "User"}
              </Link>
              <span className="text-[#8B949E]" suppressHydrationWarning>
                · {formatDistanceToNow(new Date(comment.createdAt))} ago
              </span>
            </div>
            {session?.user?.id === comment.userId && (
              <div>
                <OptionMenu post={post} comment={comment} isComment />
              </div>
            )}
          </div>
          <p className="text-xs wrap-break-word break-all">{comment.body}</p>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
