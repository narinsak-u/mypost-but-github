import { create } from "zustand";

interface SaveState {
  isSelected: boolean;
  onSelect: () => void;
  onCancel: () => void;
}

const useSavedTab = create<SaveState>((set) => ({
  isSelected: false,
  onSelect: () => set({ isSelected: true }),
  onCancel: () => set({ isSelected: false }),
}));

export default useSavedTab;
