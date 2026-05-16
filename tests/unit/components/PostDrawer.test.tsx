import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PostDrawer from "@/components/PostDrawer";
import usePostModal from "@/store/use-post-modal";
import { authClient } from "@/lib/auth-client";
import { createPost } from "@/actions/post-actions";

// Mock modules
vi.mock("@/store/use-post-modal", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}));

vi.mock("@/actions/post-actions", () => ({
  createPost: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
  })),
}));

vi.mock("@/hooks/use-revalidate-query", () => ({
  useValidateQuery: vi.fn(() => ({
    validatePostQueries: vi.fn(),
  })),
}));

vi.mock("@/hooks/use-get-user-list", () => ({
  useGetUserList: vi.fn(() => ({
    usernames: [],
  })),
}));

// Mock the dynamic Editor component
vi.mock("@/components/editor/Editor", () => ({
  default: () => <div data-testid="mock-editor" />,
}));

// Mock Toolbar
vi.mock("./Toolbar", () => ({
  default: ({ title, setTitle }: any) => (
    <div data-testid="mock-toolbar">
      <input 
        data-testid="title-input" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
      />
    </div>
  ),
}));

// Mock NewTag
vi.mock("./new-tag", () => ({
  default: () => <div data-testid="mock-new-tag" />,
}));

// Mock Drawer UI components to simplify
vi.mock("@/components/ui/drawer", () => ({
  Drawer: ({ children, open }: any) => (open ? <div data-testid="drawer">{children}</div> : null),
  DrawerContent: ({ children }: any) => <div data-testid="drawer-content">{children}</div>,
  DrawerHeader: ({ children }: any) => <div>{children}</div>,
  DrawerTitle: ({ children }: any) => <div>{children}</div>,
  DrawerDescription: ({ children }: any) => <div>{children}</div>,
}));

describe("PostDrawer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePostModal).mockReturnValue({
      isOpen: true,
      onClose: vi.fn(),
    } as any);
  });

  it("should not render if there is no session", () => {
    vi.mocked(authClient.useSession).mockReturnValue({ data: null } as any);
    render(<PostDrawer />);
    expect(screen.queryByTestId("drawer")).toBeNull();
  });

  it("should render when open and session exists", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: "user-1" } },
    } as any);
    render(<PostDrawer />);
    expect(screen.getByTestId("drawer")).toBeDefined();
    expect(screen.getByTestId("mock-editor")).toBeDefined();
    expect(screen.getByTestId("mock-toolbar")).toBeDefined();
  });

  it("should call createPost and close when 'Create post' is clicked", async () => {
    const onClose = vi.fn();
    vi.mocked(usePostModal).mockReturnValue({
      isOpen: true,
      onClose,
    } as any);
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: "user-1" } },
    } as any);
    vi.mocked(createPost).mockResolvedValue({ id: "post-1" } as any);

    render(<PostDrawer />);

    const createButton = screen.getByText("Create post");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(createPost).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
