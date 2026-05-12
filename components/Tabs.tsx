"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import useSavedTab from "@/store/use-saved-tab";

type Props = {
  firstTab: string;
  secondTab?: string;
  isProfile?: boolean;
  owner?: string;
};

const Tabs = ({ firstTab, secondTab, isProfile, owner }: Props) => {
  const { userId, isLoaded } = useAuth();
  const { isSelected, onCancel, onSelect } = useSavedTab();

  if (!isLoaded) return null;

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
              isSelected && "text-gray-500"
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
        {secondTab && owner === userId && (
          <div>
            <div
              className="flex items-center justify-center cursor-pointer"
              onClick={onSelect}
            >
              <div
                className={cn(
                  "text-sm font-semibold mr-2",
                  !isSelected && "text-gray-500"
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
      <Separator className="bg-[#444C56]" />
    </div>
  );
};

export default Tabs;
