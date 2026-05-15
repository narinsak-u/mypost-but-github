import { create } from "zustand";

interface ChatStore {
  isOpen: boolean;
  currentConversationId: string | null;
  open: (conversationId?: string | null) => void;
  close: () => void;
}

const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  currentConversationId: null,
  open: (conversationId = null) =>
    set({ isOpen: true, currentConversationId: conversationId }),
  close: () => set({ isOpen: false, currentConversationId: null }),
}));

export default useChatStore;
