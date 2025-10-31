"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";

interface LastUpdatedIndicatorProps {
  lastUpdateTime: number;
  onRefresh?: () => void;
}

export function LastUpdatedIndicator({
  lastUpdateTime,
  onRefresh,
}: LastUpdatedIndicatorProps) {
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update seconds ago counter every second
  useEffect(() => {
    const updateSecondsAgo = () => {
      if (lastUpdateTime > 0) {
        const seconds = Math.floor((Date.now() - lastUpdateTime) / 1000);
        setSecondsAgo(seconds);
      }
    };

    // Update immediately
    updateSecondsAgo();

    // Then update every second
    const interval = setInterval(updateSecondsAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdateTime]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefresh?.();
    // Reset the refreshing state after a short delay
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="flex w-full justify-center px-4 md:px-0">
      <div className="border-border bg-card/50 flex w-full max-w-sm items-center gap-2 rounded-lg border px-3 py-2 md:w-auto md:gap-3 md:py-1.5">
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="text-muted-foreground text-xs">
            <span className="opacity-70">Last updated:</span>{" "}
            <span className="font-medium tabular-nums">
              {secondsAgo === 0 ? "just now" : `${secondsAgo}s ago`}
            </span>
          </div>
          <div className="text-muted-foreground text-xs opacity-60">
            Data refreshes every 15 seconds
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="ghost"
          size="sm"
          className="h-7 w-7 shrink-0 p-0 md:h-6 md:w-6"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>
    </div>
  );
}
