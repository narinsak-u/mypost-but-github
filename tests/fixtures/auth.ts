import { vi } from "vitest";
import { auth } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

export const mockSession = (userId: string | null = null) => {
  vi.mocked(auth.api.getSession).mockResolvedValue(
    userId ? ({ user: { id: userId } } as any) : null,
  );
};

export const createMockUser = () => `user-${crypto.randomUUID()}`;

export const createFixedSession = () => mockSession("fixed-user-id");
