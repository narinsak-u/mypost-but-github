import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchPostsAutocomplete } from "@/actions/search-posts-atlas";
import { db as prisma } from "@/lib/prismadb";

vi.mock("@/lib/prismadb", () => ({
  db: {
    post: {
      findMany: vi.fn(),
    },
    $runCommandRaw: vi.fn(),
  },
}));

describe("searchPostsAutocomplete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty array for empty query", async () => {
    const result = await searchPostsAutocomplete("");
    expect(result).toEqual([]);
  });

  it("should return empty array for whitespace-only query", async () => {
    const result = await searchPostsAutocomplete("   ");
    expect(result).toEqual([]);
  });

  it("should use Atlas search and return results with highlights", async () => {
    const mockAtlasResponse = {
      cursor: {
        firstBatch: [
          {
            _id: "post-1",
            title: "Hello World",
            body: "This is a test post",
            score: 1.5,
            highlights: [
              {
                path: "title",
                texts: [
                  { value: "Hello ", type: "text" },
                  { value: "World", type: "hit" },
                ],
              },
            ],
          },
        ],
      },
    };

    vi.mocked(prisma.$runCommandRaw).mockResolvedValue(
      mockAtlasResponse as any,
    );

    const result = await searchPostsAutocomplete("World");

    expect(prisma.$runCommandRaw).toHaveBeenCalledWith({
      aggregate: "Post",
      pipeline: [
        {
          $search: {
            index: "default",
            autocomplete: {
              query: "World",
              path: "title",
              fuzzy: {
                maxEdits: 1,
              },
            },
            highlight: {
              path: ["title", "body"],
            },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            body: 1,
            highlights: { $meta: "searchHighlights" },
            score: { $meta: "searchScore" },
          },
        },
        { $limit: 8 },
      ],
      cursor: {},
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "post-1",
      title: "Hello World",
      body: "This is a test post",
      score: 1.5,
      highlights: [
        {
          path: "title",
          texts: [
            { value: "Hello ", type: "text" },
            { value: "World", type: "hit" },
          ],
        },
      ],
    });
  });

  it("should fall back to Prisma search when Atlas fails", async () => {
    vi.mocked(prisma.$runCommandRaw).mockRejectedValue(
      new Error("Atlas error"),
    );

    const mockPosts = [
      {
        id: "post-1",
        title: "Test Post",
        body: "Some body text",
        createdAt: new Date(),
      },
      {
        id: "post-2",
        title: "Another Post",
        body: "More body text",
        createdAt: new Date(),
      },
    ];

    vi.mocked(prisma.post.findMany).mockResolvedValue(mockPosts as any);

    const result = await searchPostsAutocomplete("Test");

    expect(prisma.post.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { title: { contains: "Test", mode: "insensitive" } },
          { body: { contains: "Test", mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, body: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: "post-1",
      title: "Test Post",
      body: "Some body text",
      highlights: [
        {
          path: "title",
          texts: [
            { value: "Test", type: "hit" },
            { value: " Post", type: "text" },
          ],
        },
      ],
    });
  });

  it("should limit results to 8", async () => {
    vi.mocked(prisma.$runCommandRaw).mockRejectedValue(
      new Error("Atlas error"),
    );

    const mockPosts = Array.from({ length: 10 }, (_, i) => ({
      id: `post-${i}`,
      title: `Post ${i}`,
      body: `Body ${i}`,
      createdAt: new Date(),
    }));

    vi.mocked(prisma.post.findMany).mockResolvedValue(mockPosts as any);

    const result = await searchPostsAutocomplete("Post");

    expect(prisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 8,
      }),
    );
  });
});
