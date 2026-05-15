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
