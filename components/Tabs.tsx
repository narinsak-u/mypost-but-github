"use client";

import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import useSavedTab from "@/store/use-saved-tab";
import { Compass, SquareKanban, Star, Users } from "lucide-react";
import { FIRST_TAB, SECOND_TAB } from "@/types";
import { Badge } from "@/components/ui/badge";

type Props = {
  firstTab: FIRST_TAB;
  secondTab?: SECOND_TAB;
  isProfile?: boolean;
  owner?: string;
};

const Tabs = ({ firstTab, secondTab, isProfile, owner }: Props) => {
  const { data: session, isPending: isLoaded } = useSession();
  const { tab, setTab } = useSavedTab();

  if (!isLoaded) return null;

  const isSelected = tab === "Following" || tab === "Starred";
  const onCancel = () => setTab(firstTab);
  const onSelect = () => setTab(secondTab || "Following");

  return (
    <div className="mt-8">
      <div className="flex gap-5 my-4">
        <div
          className="flex items-center justify-center cursor-pointer"
          onClick={onCancel}
        >
          <div
            className={cn(
              "text-sm font-semibold mr-2",
              isSelected && "text-gray-500",
            )}
          >
            {firstTab}
          </div>

          {!isProfile && (
            <Badge
              variant="destructive"
              className=" bg-[#006EED] hover:bg-[#0b65cc]"
            >
              For you
            </Badge>
          )}
        </div>
        {secondTab && owner === session?.user?.id && (
          <div>
            <div
              className="flex items-center justify-center cursor-pointer"
              onClick={onSelect}
            >
              <div
                className={cn(
                  "text-sm font-semibold mr-2",
                  !isSelected && "text-gray-500",
                )}
              >
                {secondTab}
              </div>
              {isProfile && (
                <Badge
                  variant="destructive"
                  className=" bg-[#006EED] hover:bg-[#0b65cc]"
                >
                  For me
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tabs;
