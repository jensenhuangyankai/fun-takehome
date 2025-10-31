import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  getAssetErc20ByChainAndSymbol,
  getAssetPriceInfo,
} from "@funkit/api-base";
import { env } from "~/env";
import type { TokenMetadata, TokenPrice, TokenWithPrice } from "~/lib/tokens";
import { SUPPORTED_TOKENS } from "~/lib/tokens";

// Shared input schema for token identification
const tokenIdentifierSchema = z.object({
  chainId: z.string(),
  symbol: z.string(),
});

// Type guards for API responses
function isTokenMetadata(data: unknown): data is TokenMetadata {
  return (
    typeof data === "object" &&
    data !== null &&
    "address" in data &&
    "symbol" in data &&
    "name" in data &&
    "decimals" in data &&
    typeof (data as TokenMetadata).address === "string" &&
    typeof (data as TokenMetadata).symbol === "string"
  );
}

function isTokenPrice(data: unknown): data is TokenPrice {
  return (
    typeof data === "object" &&
    data !== null &&
    "unitPrice" in data &&
    typeof (data as TokenPrice).unitPrice === "number" &&
    (data as TokenPrice).unitPrice > 0
  );
}

export const tokenRouter = createTRPCRouter({
  /**
   * Get all supported tokens
   */
  getSupportedTokens: publicProcedure.query(() => {
    return SUPPORTED_TOKENS;
  }),

  /**
   * Get complete token data (info + price) for a single token by chain ID and symbol
   */
  getTokenData: publicProcedure
    .input(tokenIdentifierSchema)
    .query(async ({ input }): Promise<TokenWithPrice> => {
      try {
        // First fetch token info to get the address
        const tokenInfoResponse = await getAssetErc20ByChainAndSymbol({
          chainId: input.chainId,
          symbol: input.symbol,
          apiKey: env.FUNKIT_API_KEY,
        });

        if (!isTokenMetadata(tokenInfoResponse)) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Invalid token metadata response for ${input.symbol} on chain ${input.chainId}`,
          });
        }

        // Then fetch price info using the address
        const priceInfoResponse = await getAssetPriceInfo({
          chainId: input.chainId,
          assetTokenAddress: tokenInfoResponse.address,
          apiKey: env.FUNKIT_API_KEY,
        });

        if (!isTokenPrice(priceInfoResponse)) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Invalid price data response for ${input.symbol}`,
          });
        }

        return {
          chainId: input.chainId,
          symbol: input.symbol,
          tokenInfo: tokenInfoResponse,
          priceInfo: priceInfoResponse,
        };
      } catch (error) {
        // Re-throw TRPCErrors as-is
        if (error instanceof TRPCError) {
          throw error;
        }

        // Handle network/API errors
        console.error(
          `Error fetching token data for ${input.symbol} on chain ${input.chainId}:`,
          error,
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch token data for ${input.symbol}: ${error instanceof Error ? error.message : "Unknown error"}`,
          cause: error,
        });
      }
    }),

  /**
   * Get complete token data (info + price) for multiple tokens at once
   */
  getMultipleTokenData: publicProcedure
    .input(z.array(tokenIdentifierSchema))
    .query(async ({ input }): Promise<TokenWithPrice[]> => {
      try {
        // First, fetch token info for all tokens to get their addresses
        const tokenInfoPromises = input.map((token) =>
          getAssetErc20ByChainAndSymbol({
            chainId: token.chainId,
            symbol: token.symbol,
            apiKey: env.FUNKIT_API_KEY,
          }).catch((error) => {
            console.error(
              `Error fetching metadata for ${token.symbol} on chain ${token.chainId}:`,
              error,
            );
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to fetch token info for ${token.symbol}`,
              cause: error,
            });
          }),
        );

        const tokenInfos = await Promise.all(tokenInfoPromises);

        // Validate all token metadata responses
        for (let i = 0; i < tokenInfos.length; i++) {
          if (!isTokenMetadata(tokenInfos[i])) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Invalid token metadata for ${input[i]!.symbol}`,
            });
          }
        }

        // Then fetch prices for all tokens
        const pricePromises = tokenInfos.map((tokenInfo, index) =>
          getAssetPriceInfo({
            chainId: input[index]!.chainId,
            assetTokenAddress: (tokenInfo as TokenMetadata).address,
            apiKey: env.FUNKIT_API_KEY,
          })
            .then((price) => {
              if (!isTokenPrice(price)) {
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: `Invalid price data for ${input[index]!.symbol}`,
                });
              }

              return {
                chainId: input[index]!.chainId,
                symbol: input[index]!.symbol,
                tokenInfo: tokenInfo as TokenMetadata,
                priceInfo: price as TokenPrice,
              };
            })
            .catch((error) => {
              console.error(
                `Error fetching price for ${input[index]!.symbol}:`,
                error,
              );
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to fetch price for ${input[index]!.symbol}`,
                cause: error,
              });
            }),
        );

        return Promise.all(pricePromises);
      } catch (error) {
        // Re-throw TRPCErrors as-is
        if (error instanceof TRPCError) {
          throw error;
        }

        // Handle unexpected errors
        console.error("Error in getMultipleTokenData:", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch token data: ${error instanceof Error ? error.message : "Unknown error"}`,
          cause: error,
        });
      }
    }),
});
