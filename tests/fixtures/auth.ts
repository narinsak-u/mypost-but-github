import { vi } from "vitest";
import { auth } from "@/lib/auth";

export const mockSession = (userId: string | null = null) => {
  vi.mocked(auth.api.getSession).mockResolvedValue(
    userId ? ({ user: { id: userId } } as any) : null,
  );
};

export const createMockUser = () => `user-${crypto.randomUUID()}`;

export const createAdminSession = () => mockSession("admin-user-id");
