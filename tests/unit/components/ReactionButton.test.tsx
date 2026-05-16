import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReactionButton from "@/components/posts/ReactionButton";
import { authClient } from "@/lib/auth-client";
import { toggleLike, toggleStar } from "@/actions/post-actions";
import { useValidateQuery } from "@/hooks/use-revalidate-query";

// Mock the modules
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}));

vi.mock("@/actions/post-actions", () => ({
  toggleLike: vi.fn(),
  toggleStar: vi.fn(),
}));

vi.mock("@/hooks/use-revalidate-query", () => ({
  useValidateQuery: vi.fn(() => ({
    validatePostQueries: vi.fn(),
  })),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
  })),
}));

// Mock Lucide icons to avoid rendering issues
vi.mock("lucide-react", () => ({
  Heart: () => <div data-testid="heart-icon" />,
  MessagesSquare: () => <div data-testid="messages-icon" />,
  Star: () => <div data-testid="star-icon" />,
}));

// Mock LoginModal
vi.mock("@/components/auth/LoginModal", () => ({
  LoginModal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="login-modal">{children}</div>
  ),
}));

describe("ReactionButton Component", () => {
  const mockPost = {
    id: "post-1",
    likedIds: [],
    starIds: [],
    comments: [],
    userId: "user-1",
    title: "Test Post",
    body: "Test Body",
    tag: "test",
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { id: "user-1", name: "Test User", image: "" },
  } as any;

  const mockSelected = { comment: false };
  const setSelected = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render LoginModal when user is not authenticated", () => {
    vi.mocked(authClient.useSession).mockReturnValue({ data: null } as any);

    render(
      <ReactionButton
        post={mockPost}
        selected={mockSelected}
        setSelected={setSelected}
      />,
    );

    expect(screen.getAllByTestId("login-modal")).toHaveLength(2); // One for Like, one for Star
    expect(screen.getByText("Like")).toBeDefined();
    expect(screen.getByText("Star")).toBeDefined();
  });

  it("should show 'Liked' when user has liked the post", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: "user-1" } },
    } as any);

    const postWithLike = { ...mockPost, likedIds: ["user-1"] };

    render(
      <ReactionButton
        post={postWithLike}
        selected={mockSelected}
        setSelected={setSelected}
      />,
    );

    expect(screen.getByText("Liked")).toBeDefined();
  });

  it("should call toggleLike when Like button is clicked", async () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: "user-1" } },
    } as any);
    vi.mocked(toggleLike).mockResolvedValue({ hasLiked: true } as any);

    render(
      <ReactionButton
        post={mockPost}
        selected={mockSelected}
        setSelected={setSelected}
      />,
    );

    const likeButton = screen.getByText("Like");
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(toggleLike).toHaveBeenCalledWith("post-1");
    });
  });

  it("should toggle comment state when Comment button is clicked", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: "user-1" } },
    } as any);

    render(
      <ReactionButton
        post={mockPost}
        selected={mockSelected}
        setSelected={setSelected}
      />,
    );

    const commentButton = screen.getByText("Comment");
    fireEvent.click(commentButton);

    expect(setSelected).toHaveBeenCalled();
  });
});
