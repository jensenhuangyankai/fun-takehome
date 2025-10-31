import { TokenSwapCalculator } from "~/app/_components/token-swap-calculator";
import { api, HydrateClient } from "~/trpc/server";

// Force dynamic rendering to avoid build-time API calls
export const dynamic = "force-dynamic";

export default async function Home() {
  // Prefetch supported tokens on the server for instant hydration
  void api.token.getSupportedTokens.prefetch();

  // Prefetch default token data (USDC on Ethereum + USDT on Polygon)
  void api.token.getTokenData.prefetch({ chainId: "1", symbol: "USDC" });
  void api.token.getTokenData.prefetch({ chainId: "137", symbol: "USDT" });

  return (
    <HydrateClient>
      <main className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-8 md:py-16">
        <div className="container flex flex-col items-center gap-8 md:gap-12">
          <div className="flex flex-col items-center gap-3 text-center md:gap-4">
            <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Token Price Explorer
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Compare token values with real-time pricing
            </p>
          </div>

          <TokenSwapCalculator />
        </div>
      </main>
    </HydrateClient>
  );
}
