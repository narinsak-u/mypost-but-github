# Collapsible Chat Dialog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a collapsible chat dialog that resides at the bottom-right of the screen and persists across page navigations without reloading.

**Architecture:** Update the Zustand `useChatStore` to manage a new `isCollapsed` state. Refactor `ChatDialog.tsx` to use `fixed` positioning instead of the Shadcn `Dialog` modal, allowing it to stay on screen without blocking other interactions.

**Tech Stack:** Next.js (App Router), Zustand, Lucide React icons, Tailwind CSS 4.

---

### Task 1: Update Chat Store State

**Files:**
- Modify: `store/use-chat-store.ts`

- [ ] **Step 1: Add `isCollapsed` state and actions**

```typescript
import { create } from "zustand";

interface ChatStore {
  isOpen: boolean;
  isCollapsed: boolean; // New state
  currentConversationId: string | null;
  open: (conversationId?: string | null) => void;
  close: () => void;
  toggleCollapse: () => void; // New action
  setCollapsed: (val: boolean) => void; // New action
}

const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  isCollapsed: false,
  currentConversationId: null,
  open: (conversationId = null) =>
    set({ isOpen: true, isCollapsed: false, currentConversationId: conversationId }),
  close: () => set({ isOpen: false, isCollapsed: false, currentConversationId: null }),
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (val: boolean) => set({ isCollapsed: val }),
}));

export default useChatStore;
```

- [ ] **Step 2: Commit**

```bash
git add store/use-chat-store.ts
git commit -m "feat: add isCollapsed state to chat store"
```

---

### Task 2: Refactor ChatDialog to Fixed Container

**Files:**
- Modify: `components/chat/ChatDialog.tsx`

- [ ] **Step 1: Replace `Dialog` with `fixed` div**

```tsx
"use client";

import useChatStore from "@/store/use-chat-store";
import ConversationList from "./ConversationList";
import MessageThread from "./MessageThread";
import { cn } from "@/lib/utils";
import { ChevronLeft, X, Minus, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChatDialog = () => {
  const { isOpen, close, currentConversationId, open, isCollapsed, toggleCollapse } = useChatStore();

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-0 right-4 z-[50] flex flex-col bg-[#1F1F1F] border border-[#30363D] shadow-2xl transition-all duration-300 ease-in-out overflow-hidden rounded-t-xl",
        isCollapsed ? "h-[48px] w-72" : "h-[500px] w-full max-w-[400px] sm:max-w-3xl"
      )}
    >
      {/* Custom Header */}
      <div 
        className="h-[48px] px-4 flex items-center justify-between border-b border-[#30363D] bg-[#262D34] cursor-pointer"
        onClick={() => isCollapsed && toggleCollapse()}
      >
        <div className="flex items-center gap-2 overflow-hidden">
           {/* If collapsed and has conversation, show context (Option B) */}
           {isCollapsed && currentConversationId ? (
             <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded-full bg-[#30363D]" />
               <span className="text-sm font-medium text-[#C9D1D9] truncate">Conversation</span>
             </div>
           ) : (
             <span className="text-sm font-medium text-[#C9D1D9]">Direct Messages</span>
           )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#8B949E] hover:text-white hover:bg-[#30363D]"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse();
            }}
          >
            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#8B949E] hover:text-white hover:bg-[#30363D]"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content (Hidden when collapsed) */}
      <div className={cn("flex-1 flex overflow-hidden", isCollapsed && "hidden")}>
        {/* Sidebar - Conversation List */}
        <div
          className={cn(
            "w-full sm:w-72 h-full shrink-0 border-r border-[#30363D]",
            currentConversationId && "hidden sm:flex",
          )}
        >
          <ConversationList />
        </div>

        {/* Main Content - Message Thread */}
        <div
          className={cn(
            "flex-1 h-full min-w-0 flex flex-col",
            !currentConversationId && "hidden sm:flex",
          )}
        >
          {currentConversationId ? (
            <div className="flex-1 flex flex-col relative h-full">
              {/* Mobile Back Button */}
              <div className="sm:hidden absolute top-4 left-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => open(null)}
                  className="h-10 w-10 rounded-full bg-[#1F1F1F]/80 backdrop-blur-sm shadow-sm border border-[#30363D] text-[#C9D1D9] hover:bg-[#262D34]"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>
              <MessageThread conversationId={currentConversationId} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-[#1F1F1F]">
              <div className="bg-[#262D34] rounded-full p-6 mb-4 border border-[#30363D]">
                <svg
                  className="w-12 h-12 text-[#8B949E]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#C9D1D9]">Select a message</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDialog;
```

- [ ] **Step 2: Commit**

```bash
git add components/chat/ChatDialog.tsx
git commit -m "feat: refactor ChatDialog to fixed collapsible container"
```

---

### Task 3: Final Integration & Cleanup

**Files:**
- Modify: `components/chat/ChatDialog.tsx` (Adjust mobile styles if needed)

- [ ] **Step 1: Ensure mobile responsiveness**
Adjust the width for mobile screens so it doesn't overflow.

- [ ] **Step 2: Commit**

```bash
git add components/chat/ChatDialog.tsx
git commit -m "style: ensure collapsible chat is responsive on mobile"
```
