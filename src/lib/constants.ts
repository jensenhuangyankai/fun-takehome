/**
 * Application-wide constants
 */

export const QUERY_CONFIG = {
  PRICE_REFETCH_INTERVAL_MS: 30000, // 30 seconds
} as const;

export const UI_CONFIG = {
  DEFAULT_TOKEN_DECIMALS: 8,
  CARD_WIDTH: "w-56",
  CARD_MIN_HEIGHT: "min-h-[160px]",
  COLUMN_GAP: "gap-12",
} as const;

export const FORMAT_CONFIG = {
  MIN_SCIENTIFIC_NOTATION_THRESHOLD: 0.000001,
  USD_CURRENCY: "USD",
  USD_MIN_DECIMALS: 2,
  USD_MAX_DECIMALS: 2,
} as const;
