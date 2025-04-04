
import React from 'react';
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
  maxCount?: number;
}

export function NotificationBadge({ count, className, maxCount = 99 }: NotificationBadgeProps) {
  if (!count || count === 0) return null;
  
  const displayCount = count > maxCount ? `${maxCount}+` : count;
  
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full",
        className
      )}
    >
      {displayCount}
    </span>
  );
}
