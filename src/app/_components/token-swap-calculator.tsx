"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowRight } from "lucide-react";
import { LastUpdatedIndicator } from "./last-updated-indicator";
import { TokenCard } from "./token-card";
import { QUERY_CONFIG, FORMAT_CONFIG } from "~/lib/constants";
import type { SupportedToken } from "~/lib/tokens";

export function TokenSwapCalculator() {
  const [usdAmount, setUsdAmount] = useState<string>("100");
  const [sourceToken, setSourceToken] = useState<SupportedToken | null>(null);
  const [targetToken, setTargetToken] = useState<SupportedToken | null>(null);

  // Fetch supported tokens (uses prefetched data from server)
  const { data: supportedTokens = [] } =
    api.token.getSupportedTokens.useQuery();

  // Initialize source and target tokens only once when supported tokens are loaded
  useEffect(() => {
    if (supportedTokens.length > 0 && sourceToken === null) {
      setSourceToken(supportedTokens[0]!);
    }
    if (supportedTokens.length > 1 && targetToken === null) {
      setTargetToken(supportedTokens[1]!);
    }
  }, [supportedTokens]);

  // Memoize query input to prevent unnecessary refetches
  const tokenQueryInput = useMemo(
    () =>
      supportedTokens.map((token) => ({
        chainId: token.chainId,
        symbol: token.symbol,
      })),
    [supportedTokens],
  );

  // Fetch ALL token prices at once (batch query with caching)
  const {
    data: allTokensData,
    isLoading,
    error,
    dataUpdatedAt,
    refetch,
  } = api.token.getMultipleTokenData.useQuery(tokenQueryInput, {
    enabled: supportedTokens.length > 0,
    refetchInterval: QUERY_CONFIG.PRICE_REFETCH_INTERVAL_MS,
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Get the last update time
  const lastUpdateTime = dataUpdatedAt;

  // Memoize token data lookups to prevent unnecessary re-lookups
  const sourceTokenData = useMemo(
    () =>
      allTokensData?.find(
        (token) =>
          token.chainId === sourceToken?.chainId &&
          token.symbol === sourceToken?.symbol,
      ),
    [allTokensData, sourceToken],
  );

  const targetTokenData = useMemo(
    () =>
      allTokensData?.find(
        (token) =>
          token.chainId === targetToken?.chainId &&
          token.symbol === targetToken?.symbol,
      ),
    [allTokensData, targetToken],
  );

  // Memoize formatting functions
  const formatTokenAmount = useMemo(
    () =>
      (value: number, decimals = 8) => {
        if (value === 0) return "0.00";
        if (value < FORMAT_CONFIG.MIN_SCIENTIFIC_NOTATION_THRESHOLD)
          return value.toExponential(4);
        return value.toFixed(Math.min(decimals, 8));
      },
    [],
  );

  const formatUsdPrice = useMemo(
    () => (price: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: FORMAT_CONFIG.USD_CURRENCY,
        minimumFractionDigits: FORMAT_CONFIG.USD_MIN_DECIMALS,
        maximumFractionDigits: FORMAT_CONFIG.USD_MAX_DECIMALS,
      }).format(price);
    },
    [],
  );

  // Calculate token amounts based on USD input and prices
  const sourceTokenAmount =
    sourceTokenData && parseFloat(usdAmount) > 0
      ? parseFloat(usdAmount) / sourceTokenData.priceInfo.unitPrice
      : 0;

  const targetTokenAmount =
    targetTokenData && parseFloat(usdAmount) > 0
      ? parseFloat(usdAmount) / targetTokenData.priceInfo.unitPrice
      : 0;

  // Compute swap ratio: 1 source = X target
  const swapRatioText = useMemo(() => {
    if (!sourceToken || !targetToken || !sourceTokenData || !targetTokenData)
      return null;
    const a = sourceTokenData.priceInfo.unitPrice;
    const b = targetTokenData.priceInfo.unitPrice;
    if (!a || !b || a <= 0 || b <= 0) return null;
    const ratio = a / b;
    return `1 ${sourceToken.symbol} = ${formatTokenAmount(ratio, 6)} ${targetToken.symbol}`;
  }, [
    sourceToken,
    targetToken,
    sourceTokenData,
    targetTokenData,
    formatTokenAmount,
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* Error State */}
      {error && (
        <div className="flex justify-center">
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <p className="font-medium">Failed to load token data</p>
            <p className="mt-1 text-xs opacity-80">
              {error.message || "Unknown error occurred"}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-xs underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* USD Input */}
      <div className="flex justify-center">
        <div className="w-64 space-y-2">
          <Label htmlFor="usd-amount" className="text-base text-slate-300">
            USD Amount
          </Label>
          <Input
            id="usd-amount"
            type="number"
            placeholder="Enter USD"
            value={usdAmount}
            onChange={(e) => setUsdAmount(e.target.value)}
            min="0"
            step="0.01"
            className="h-10 text-lg"
          />
        </div>
      </div>

      {/* Token Cards */}
      <div className="flex items-center justify-center gap-12">
        {/* Source Token Column */}
        <TokenCard
          id="source-token"
          label="Select Input"
          token={sourceToken}
          tokens={supportedTokens}
          tokenData={sourceTokenData}
          onTokenChange={setSourceToken}
          isLoading={isLoading}
          amount={sourceTokenAmount}
          formatTokenAmount={formatTokenAmount}
          formatUsdPrice={formatUsdPrice}
        />

        {/* Arrow */}
        <div className="flex h-80 w-56 flex-shrink-0 flex-col items-center justify-center">
          <ArrowRight className="text-muted-foreground h-8 w-8" />
          {swapRatioText && (
            <div
              className="text-muted-foreground mt-2 w-full truncate text-center text-xs whitespace-nowrap tabular-nums"
              title={swapRatioText}
            >
              {swapRatioText}
            </div>
          )}
        </div>

        {/* Target Token Column */}
        <TokenCard
          id="target-token"
          label="Select Output"
          token={targetToken}
          tokens={supportedTokens}
          tokenData={targetTokenData}
          onTokenChange={setTargetToken}
          isLoading={isLoading}
          amount={targetTokenAmount}
          formatTokenAmount={formatTokenAmount}
          formatUsdPrice={formatUsdPrice}
        />
      </div>

      {/* Last Updated Indicator - Bottom Center */}
      <div className="flex justify-center">
        <LastUpdatedIndicator
          lastUpdateTime={lastUpdateTime}
          onRefresh={refetch}
        />
      </div>
    </div>
  );
}
