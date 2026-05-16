import { create } from "zustand";

interface ChatState {
  isOpen: boolean;
  isCollapsed: boolean;
  currentConversationId: string | null;
}

interface ChatActions {
  open: (conversationId?: string | null) => void;
  close: () => void;
  toggleCollapse: () => void;
  setCollapsed: (val: boolean) => void;
}

const useChatStore = create<ChatState & { actions: ChatActions }>((set) => ({
  isOpen: false,
  isCollapsed: false,
  currentConversationId: null,
  actions: {
    open: (conversationId = null) =>
      set({ isOpen: true, isCollapsed: false, currentConversationId: conversationId }),
    close: () => set({ isOpen: false, isCollapsed: false, currentConversationId: null }),
    toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    setCollapsed: (val: boolean) => set({ isCollapsed: val }),
  },
}));

export const useChatActions = () => useChatStore((state) => state.actions);
export const useChatIsOpen = () => useChatStore((state) => state.isOpen);
export const useChatIsCollapsed = () => useChatStore((state) => state.isCollapsed);
export const useChatCurrentConversationId = () => useChatStore((state) => state.currentConversationId);

export default useChatStore;
