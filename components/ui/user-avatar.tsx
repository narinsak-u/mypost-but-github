"use client";

import { cn } from "@/lib/utils";

type UserAvatarProps = {
  imageUrl: string | null | undefined;
  name: string | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-6.25 w-6.25",
  md: "h-7 w-7",
  lg: "h-10 w-10",
};

const initialsSizeClasses = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
};

export function UserAvatar({
  imageUrl,
  name,
  size = "md",
  className,
}: UserAvatarProps) {
  const displayName = name || "User";
  const initial = displayName[0]?.toUpperCase() || "U";

  if (imageUrl) {
    return (
      <img
        className={cn(
          "shrink-0 rounded-full object-cover",
          sizeClasses[size],
          className,
        )}
        src={imageUrl}
        alt={displayName}
        referrerPolicy="no-referrer"
      />
    );
  }

  const isFullSize = className?.includes("h-full");

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-muted font-bold",
        isFullSize ? className : sizeClasses[size],
        initialsSizeClasses[size],
      )}
    >
      {initial}
    </div>
  );
}
