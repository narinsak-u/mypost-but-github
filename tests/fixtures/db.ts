import { db as prisma } from "@/lib/prismadb";

export const clearDatabase = async () => {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follower.deleteMany();
  await prisma.post.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
};

export const seedTestUser = async (overrides = {}) => {
  return prisma.user.create({
    data: {
      email: `test-${crypto.randomUUID()}@example.com`,
      name: "Test User",
      ...overrides,
    },
  });
};

export const seedTestPost = async (userId: string, overrides = {}) => {
  return prisma.post.create({
    data: {
      title: "Test Post",
      body: "Test body content",
      tag: "test",
      userId,
      likedIds: [],
      starIds: [],
      ...overrides,
    },
  });
};

export const seedTestComment = async (
  userId: string,
  postId: string,
  overrides = {},
) => {
  return prisma.comment.create({
    data: {
      body: "Test comment",
      userId,
      postId,
      ...overrides,
    },
  });
};

export const seedTestConversation = async (
  participantIds: string[],
  overrides = {},
) => {
  return prisma.conversation.create({
    data: {
      participantIds,
      lastMessageAt: new Date(),
      ...overrides,
    },
  });
};

export const seedTestMessage = async (
  conversationId: string,
  senderId: string,
  overrides = {},
) => {
  return prisma.message.create({
    data: {
      content: "Test message",
      conversationId,
      senderId,
      ...overrides,
    },
  });
};
