import PostItem from "@/components/posts/PostItem";
import getPostById from "@/actions/get-post-by-id";
import { PostPopulated } from "@/types";
import Link from "next/link";
import { db } from "@/lib/prismadb";

const PostPage = async ({
  params,
}: {
  params: Promise<{ postId: string }>
}) => {
  const { postId } = await params;
  const post = (await getPostById(postId)) as PostPopulated;
  const posts = await db.post.findMany({});
  const relatedPosts = posts.filter((p) => p.id !== postId).slice(0, 3);

  return (
    <>
      <div className="h-full w-full px-5 md:px-0 rounded-sm">
        <div className="flex items-center gap-2 text-sm text-[#8B949E]">
          <Link href="/" className="hover:text-[#ADBAC7]">Home</Link>
          <div>/</div>
          <div className="text-[#ADBAC7] font-medium">{post.title}</div>
        </div>
        <PostItem post={post} isPost />
      </div>

      {/* post suggestion */}
      <div className="mt-16 px-5 md:px-0 ">
        <div className=" pb-1 font-medium text-sm mb-2 border-b border-[#30363D]">
          Related Posts
        </div>
        <div className="">
          {relatedPosts.map((p) => (
            <PostItem
              key={p.id}
              post={p as PostPopulated}
              isSuggestion
              className="mt-0"
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default PostPage;
