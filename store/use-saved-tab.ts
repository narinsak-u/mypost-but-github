import { create } from "zustand";
import { FIRST_TAB, SECOND_TAB } from "@/types";

type Tabs = FIRST_TAB | SECOND_TAB;

interface TabState {
  tab: Tabs;
  setTab: (tab: Tabs) => void;
}

const useSavedTab = create<TabState>((set) => ({
  tab: "For You",
  setTab: (tab) => set({ tab }),
}));

export default useSavedTab;
