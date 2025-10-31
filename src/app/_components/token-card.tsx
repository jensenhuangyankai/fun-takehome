"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { SupportedToken, TokenWithPrice } from "~/lib/tokens";

interface TokenCardProps {
  id: string;
  label: string;
  token: SupportedToken | null;
  tokens: SupportedToken[];
  tokenData: TokenWithPrice | undefined;
  onTokenChange: (token: SupportedToken) => void;
  isLoading: boolean;
  amount: number;
  formatTokenAmount: (value: number, decimals?: number) => string;
  formatUsdPrice: (price: number) => string;
}

export function TokenCard({
  id,
  label,
  token,
  tokens,
  tokenData,
  onTokenChange,
  isLoading,
  amount,
  formatTokenAmount,
  formatUsdPrice,
}: TokenCardProps) {
  const selectValue = useMemo(
    () => (token ? `${token.symbol}-${token.chainId}` : ""),
    [token],
  );

  const handleChange = (tokenKey: string) => {
    const [symbol, chainId] = tokenKey.split("-");
    const foundToken = tokens.find(
      (t) => t.symbol === symbol && t.chainId === chainId,
    );
    if (foundToken) onTokenChange(foundToken);
  };

  return (
    <div className="flex w-56 flex-col items-center gap-2">
      {/* Dropdown */}
      <div className="w-full space-y-1">
        <Label htmlFor={id} className="text-xs text-muted-foreground">
          {label}
        </Label>
        <Select value={selectValue} onValueChange={handleChange}>
          <SelectTrigger
            id={id}
            className="h-10 w-full justify-between text-sm"
          >
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            {tokens.map((t) => (
              <SelectItem
                key={`${t.symbol}-${t.chainId}`}
                value={`${t.symbol}-${t.chainId}`}
              >
                <span className="font-semibold">{t.symbol}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {t.chainName}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Card */}
      <Card className="min-h-[160px] w-full">
        {token ? (
          <>
            <CardHeader>
              <CardTitle className="text-lg">{token.symbol}</CardTitle>
              <CardDescription className="text-sm">
                {token.name} • {token.chainName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading || !tokenData ? (
                <div className="flex items-center justify-center py-4">
                  <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-muted-foreground text-xs">Amount</p>
                    <p className="text-xl font-bold tabular-nums">
                      {formatTokenAmount(amount, tokenData.tokenInfo.decimals)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Price per token
                    </p>
                    <p className="text-sm font-medium tabular-nums">
                      {formatUsdPrice(tokenData.priceInfo.unitPrice)}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="flex h-full items-center justify-center py-8">
            <p className="text-muted-foreground">Select a token</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
