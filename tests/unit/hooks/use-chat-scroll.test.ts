import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useChatScroll } from "@/hooks/use-chat-scroll";

describe("useChatScroll", () => {
  let mockElement: {
    scrollTo: ReturnType<typeof vi.fn>;
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    mockElement = {
      scrollTo: vi.fn(),
      scrollTop: 0,
      scrollHeight: 1000,
      clientHeight: 500,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should scroll to bottom on initial load", async () => {
    const chatRef = { current: mockElement as unknown as HTMLDivElement };
    renderHook(() =>
      useChatScroll({
        chatRef,
        count: 10,
        shouldScroll: true,
      }),
    );

    await vi.advanceTimersByTimeAsync(150);

    expect(mockElement.scrollTo).toHaveBeenCalled();
  });

  it("should not scroll if shouldScroll is false", async () => {
    const chatRef = { current: mockElement as unknown as HTMLDivElement };
    renderHook(() =>
      useChatScroll({
        chatRef,
        count: 10,
        shouldScroll: false,
      }),
    );

    await vi.advanceTimersByTimeAsync(150);

    expect(mockElement.scrollTo).not.toHaveBeenCalled();
  });
});
