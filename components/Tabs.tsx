"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import useSavedTab from "@/store/use-saved-tab";
import { Compass, SquareKanban, Star, Users } from "lucide-react";
import { FIRST_TAB, SECOND_TAB } from "@/types";
import { useEffect } from "react";

type Props = {
  firstTab: FIRST_TAB;
  secondTab?: SECOND_TAB;
  isProfile?: boolean;
  owner?: string;
};

const Tabs = ({ firstTab, secondTab, isProfile, owner }: Props) => {
  const { userId, isLoaded } = useAuth();
  const { tab, setTab } = useSavedTab();
  const showSecondTab = Boolean(secondTab) && (isProfile ? owner === userId : Boolean(userId));

  useEffect(() => {
    setTab(firstTab);
  }, [firstTab, setTab]);

  useEffect(() => {
    if (!showSecondTab) {
      setTab(firstTab);
    }
  }, [firstTab, setTab, showSecondTab]);

  const isFirstSelected = tab === firstTab || !tab;
  const isSecondSelected = Boolean(secondTab) && tab === secondTab;

  if (!isLoaded) return null;

  return (
    <div className="mt-6">
      <div
        role="tablist"
        aria-label="Content tabs"
        className="flex gap-8 border-b border-[#30363D]"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isFirstSelected}
          className={cn(
            "relative -mb-px cursor-pointer flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition-colors",
            isFirstSelected
              ? "border-[#1F6FEB] text-[#1F6FEB]"
              : "border-transparent text-[#8B949E] hover:text-[#C9D1D9]"
          )}
          onClick={() => setTab(firstTab)}
        >
          {!isProfile ? <Compass size={18} className="shrink-0" /> : <SquareKanban size={18} className="shrink-0" />}
          <span>{firstTab}</span>
        </button>

        {showSecondTab && (
          <button
            type="button"
            role="tab"
            aria-selected={isSecondSelected}
            className={cn(
              "relative -mb-px cursor-pointer flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition-colors",
              isSecondSelected
                ? "border-[#1F6FEB] text-[#1F6FEB]"
                : "border-transparent text-[#8B949E] hover:text-[#C9D1D9]"
            )}
            onClick={() => secondTab && setTab(secondTab)}
          >
            {!isProfile ? <Users size={18} className="shrink-0" /> : <Star size={18} className="shrink-0" />}
            <span>{secondTab}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Tabs;
