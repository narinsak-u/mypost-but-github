import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getCurrentSession,
  requireAuth,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from "../auth-helpers";
import { auth } from "../auth";
import { headers } from "next/headers";

vi.mock("../auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

describe("auth-helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (headers as vi.Mock).mockResolvedValue(new Headers());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getCurrentSession", () => {
    it("returns session when auth API returns a valid session", async () => {
      const mockSession = {
        user: { id: "user-123", email: "test@example.com" },
        session: { id: "session-456" },
      };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await getCurrentSession();

      expect(result).toEqual(mockSession);
      expect(auth.api.getSession).toHaveBeenCalledWith({
        headers: expect.any(Headers),
      });
    });

    it("returns null when auth API returns null", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await getCurrentSession();

      expect(result).toBeNull();
    });

    it("returns null when auth API throws an error", async () => {
      vi.mocked(auth.api.getSession).mockRejectedValue(new Error("Auth error"));

      const result = await getCurrentSession();

      expect(result).toBeNull();
    });
  });

  describe("requireAuth", () => {
    it("returns session when user is authenticated", async () => {
      const mockSession = {
        user: { id: "user-123", email: "test@example.com" },
        session: { id: "session-456" },
      };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await requireAuth();

      expect(result).toEqual(mockSession);
    });

    it("returns null when session is null", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await requireAuth();

      expect(result).toBeNull();
    });

    it("returns null when user is missing", async () => {
      const mockSession = {
        user: null,
        session: { id: "session-456" },
      };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await requireAuth();

      expect(result).toBeNull();
    });

    it("returns null when user id is missing", async () => {
      const mockSession = {
        user: { id: undefined, email: "test@example.com" },
        session: { id: "session-456" },
      };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await requireAuth();

      expect(result).toBeNull();
    });
  });

  describe("unauthorizedResponse", () => {
    it("returns 401 response with default message", () => {
      const response = unauthorizedResponse();

      expect(response.status).toBe(401);
      expect(response.statusText).toBe("");
    });

    it("returns 401 response with custom message", async () => {
      const response = unauthorizedResponse("Custom unauthorized message");

      expect(response.status).toBe(401);
      const text = await response.text();
      expect(text).toBe("Custom unauthorized message");
    });
  });

  describe("forbiddenResponse", () => {
    it("returns 403 response with default message", () => {
      const response = forbiddenResponse();

      expect(response.status).toBe(403);
    });

    it("returns 403 response with custom message", async () => {
      const response = forbiddenResponse("Custom forbidden message");

      expect(response.status).toBe(403);
      const text = await response.text();
      expect(text).toBe("Custom forbidden message");
    });
  });

  describe("notFoundResponse", () => {
    it("returns 404 response with default message", () => {
      const response = notFoundResponse();

      expect(response.status).toBe(404);
    });

    it("returns 404 response with custom message", async () => {
      const response = notFoundResponse("Custom not found message");

      expect(response.status).toBe(404);
      const text = await response.text();
      expect(text).toBe("Custom not found message");
    });
  });
});
