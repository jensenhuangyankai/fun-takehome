/**
 * Token configuration for the swap interface
 */

// Static configuration for supported tokens (our app's config)
export interface SupportedToken {
  name: string;
  symbol: string;
  chainId: string;
  chainName: string;
}

export const SUPPORTED_TOKENS: SupportedToken[] = [
  {
    name: "USD Coin",
    symbol: "USDC",
    chainId: "1",
    chainName: "Ethereum",
  },
  {
    name: "Tether USD",
    symbol: "USDT",
    chainId: "137",
    chainName: "Polygon",
  },
  {
    name: "Ether",
    symbol: "ETH",
    chainId: "8453",
    chainName: "Base",
  },
  {
    name: "Wrapped BTC",
    symbol: "WBTC",
    chainId: "1",
    chainName: "Ethereum",
  },
] as const;

// Token metadata from blockchain (from getAssetErc20ByChainAndSymbol API)
export interface TokenMetadata {
  address: string;
  chain: string;
  decimals: number;
  name: string;
  symbol: string;
}

// Token price from API (from getAssetPriceInfo API)
export interface TokenPrice {
  unitPrice: number;
  amount: number;
  total: number;
}

// Complete token data combining metadata and price
export interface TokenWithPrice {
  chainId: string;
  symbol: string;
  tokenInfo: TokenMetadata;
  priceInfo: TokenPrice;
}
