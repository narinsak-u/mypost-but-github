"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFormatDate } from "@/hooks/use-format-date";
import { Comment } from "@prisma/client";
import { useGetUser } from "@/hooks/use-get-user";

type Props = {
  comment: Comment;
};

const CommentItem = ({ comment }: Props) => {
  const { dateFormate } = useFormatDate();
  const { data: user, isFetching } = useGetUser({ userId: comment.userId });

  return (
    <div className="mx-6">
      <div className="w-0.5 h-3 bg-[#444C56] ms-24" />
      <div className="flex items-center justify-start h-fit">
        <div>
          <Avatar className="w-6.25 h-6.25">
            <AvatarImage
              src={user?.imageUrl ?? "https://github.com/shadcn.png"}
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex bg-[#30363E] w-full py-1 px-3 flex-col ml-4 border border-[#444C56] rounded-sm">
          <div className="mb-1 flex gap-1 text-[#ADBAC7] text-xs">
            <div className="">{`${user?.firstName} ${user?.lastName}`}</div>
            <span>· {dateFormate(new Date(comment.createdAt))}</span>
          </div>
          <p className="text-xs wrap-break-word break-all">{comment.body}</p>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
