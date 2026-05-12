"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Tag from "../Tag";
import ReactionButton from "./ReactionButton";
import CommentSection from "../comments/CommentSection";
import OptionMenu from "../OptionMenu";

import { PostPopulated } from "@/types";

import { useFormatDate } from "@/hooks/use-format-date";
import { useGetUser } from "@/hooks/use-get-user";
import { useParseContent } from "@/hooks/use-parse-content";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type ReactionButtonType = {
  comment: boolean;
};

type Props = {
  post: PostPopulated;
  isRanked?: boolean;
  index?: number;
  isProfile?: boolean;
  isPost?: boolean;
};

const PostItem = ({ post, isRanked, index, isProfile, isPost }: Props) => {
  const [selected, setSelected] = useState<ReactionButtonType>({
    comment: false,
  });

  const router = useRouter();
  const { dateFormate } = useFormatDate();
  const { data: user, isFetching } = useGetUser({ userId: post.userId });
  const postBody = useParseContent(post.body!);

  if (isRanked)
    return (
      <div
        className="mt-2 items-center justify-start flex"
        onClick={() => router.push(`/post/${post.id}`)}
      >
        <div>
          <div className="h-7.5 bg-transparent items-center flex justify-center w-7.5 rounded-full border border-white">
            <p className="text-[#006EED]">{index ? index + 1 : 1}</p>
          </div>
        </div>
        <div className="flex flex-col ml-4 hover:opacity-70 cursor-pointer border rounded-sm min-w-50 w-full py-2 px-4 border-[#444C56]">
          <div className="flex gap-1">
            <p>{post.title}</p>
          </div>
          <div className="text-xs text-[#ADBAC7] line-clamp-2 text-ellipsis">
            <div dangerouslySetInnerHTML={{ __html: postBody! }} />
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col h-fit mt-10">
      <div className="flex items-center justify-start mx-1 mb-4">
        {isProfile && (
          <span className="text-[#ADBAC7]">
            {dateFormate(new Date(post.createdAt))}
          </span>
        )}
        {!isProfile && (
          <>
            <div>
              <Avatar className="w-7.5 h-7.5">
                <AvatarImage
                  src={`${user?.imageUrl}` || "https://github.com/shadcn.png"}
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex ml-4">
              <div>
                {`${user?.firstName} ${user?.lastName}`}
                <span className="text-[#ADBAC7] px-1">posted</span> {post.title}{" "}
                <span className="text-[#ADBAC7] px-3">
                  {`· ${dateFormate(new Date(post.createdAt))}`}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="rounded-sm w-full h-fit bg-[#30363E] border border-[#444C56]">
        <div className="flex flex-col mx-8 my-5">
          <div
            className={cn(!isPost && "cursor-pointer")}
            onClick={() => (!isPost ? router.push(`/post/${post.id}`) : null)}
          >
            <div className="flex justify-between items-center">
              <div className="text-sm font-semibold mb-0.5">{post.title}</div>
              <OptionMenu post={post} isPost={isPost} />
            </div>
            <div dangerouslySetInnerHTML={{ __html: postBody! }} />
            <div className="mt-7">
              <Tag text={post.tag ?? ""} />
            </div>
          </div>
          <ReactionButton
            selected={selected}
            setSelected={setSelected}
            post={post}
          />
        </div>
      </div>

      {selected && selected.comment && <CommentSection post={post} />}
    </div>
  );
};

export default PostItem;
