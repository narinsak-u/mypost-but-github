import { describe, it, expect, beforeEach } from "vitest";
import useChatStore from "@/store/use-chat-store";

describe("useChatStore", () => {
  beforeEach(() => {
    // Reset store state before each test if necessary
    // Zustand stores persist in memory during tests
    useChatStore.getState().actions.close();
  });

  it("should have initial state", () => {
    const state = useChatStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.isCollapsed).toBe(false);
    expect(state.currentConversationId).toBe(null);
  });

  it("should open a conversation", () => {
    useChatStore.getState().actions.open("conv-1");
    const state = useChatStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.currentConversationId).toBe("conv-1");
    expect(state.isCollapsed).toBe(false);
  });

  it("should toggle collapse", () => {
    useChatStore.getState().actions.open("conv-1");
    useChatStore.getState().actions.toggleCollapse();
    expect(useChatStore.getState().isCollapsed).toBe(true);
    useChatStore.getState().actions.toggleCollapse();
    expect(useChatStore.getState().isCollapsed).toBe(false);
  });

  it("should close chat", () => {
    useChatStore.getState().actions.open("conv-1");
    useChatStore.getState().actions.close();
    const state = useChatStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.currentConversationId).toBe(null);
  });
});
