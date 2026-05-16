export const validPostData = {
  title: "A New Post Title",
  body: "This is the body of the post with some content.",
  tag: "discussion",
};

export const minimalPostData = {
  title: "Minimal Post",
  body: "Body",
  tag: "",
};

export const invalidPostData = {
  title: "",
  body: "",
  tag: "",
};

export const createPostWithTags = (tag: string) => ({
  ...validPostData,
  tag,
});
