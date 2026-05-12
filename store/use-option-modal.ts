import { create } from "zustand";

interface OptionModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useOptionModal = create<OptionModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useOptionModal;
