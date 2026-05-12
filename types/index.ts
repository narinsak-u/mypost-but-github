import { Post, Prisma } from "@prisma/client";
import { z } from "zod";

// post response
export const postPopulated = Prisma.validator<Prisma.PostInclude>()({
  comments: true,
});

export type PostPopulated = Prisma.PostGetPayload<{
  include: typeof postPopulated;
}>;

// comments
export const commentPopulated = Prisma.validator<Prisma.CommentInclude>()({
  post: {
    select: {
      comments: {
        select: {
          id: true,
          body: true,
          userId: true,
        },
      },
    },
  },
});

export type CommentPopulated = Prisma.CommentGetPayload<{
  include: typeof commentPopulated;
}>;

// # Validator types
export const UserValidator = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const PostValidator = z.object({
  title: z.string(),
  body: z.string(),
  tag: z.string(),
});

export const CommentValidator = z.object({
  // postId: z.string(),
  body: z.string(),
});

// # Response type
// export type UserWithPost = User & {
//   posts: Post[];
// };

export type FormData = z.infer<typeof PostValidator>;
export type CommentInput = z.infer<typeof CommentValidator>;
