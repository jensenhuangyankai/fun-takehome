import { TokenSwapCalculator } from "~/app/_components/token-swap-calculator";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  // Prefetch supported tokens on the server for instant hydration
  void api.token.getSupportedTokens.prefetch();

  // Prefetch default token data (USDC on Ethereum + USDT on Polygon)
  void api.token.getTokenData.prefetch({ chainId: "1", symbol: "USDC" });
  void api.token.getTokenData.prefetch({ chainId: "137", symbol: "USDT" });

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Token Price Explorer
            </h1>
            <p className="text-lg text-slate-400">
              Compare token values with real-time pricing
            </p>
          </div>

          <TokenSwapCalculator />
        </div>
      </main>
    </HydrateClient>
  );
}
