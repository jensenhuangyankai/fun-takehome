# Token Price Explorer

A real-time token price comparison tool built as a take-home project for [fun.xyz](https://fun.xyz).

## Live Demo

**[https://takehome.jensenhshoots.com](https://takehome.jensenhshoots.com)**

Self-hosted on a private home server using:
- **[Nixpacks](https://nixpacks.com/)** - Docker container builder
- **[Dokploy](https://dokploy.com/)** - Self-hosted deployment platform
- **Ubuntu VM** - Production environment

## Tech Stack

- **[Next.js](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Shadcn UI](https://ui.shadcn.com/)** - Accessible component library
- **[tRPC](https://trpc.io/)** - End-to-end typesafe API
- **[TanStack Query](https://tanstack.com/query)** - Data fetching & caching
- **[FunKit API](https://docs.fun.xyz/)** - Token metadata & pricing data

## Getting Started

### Prerequisites

1. **Install Bun** - Fast JavaScript runtime & package manager
   
   Visit [bun.sh](https://bun.sh) for installation instructions, or use:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Get a FunKit API Key**
   
   Sign up at [fun.xyz](https://fun.xyz) to obtain your API key.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jensenhuangyankai/fun-takehome.git
   cd fun-takehome
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Create a `.env` file in the project root:
   ```bash
   FUNKIT_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   bun run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Design Decisions

### Token Price Fetching Strategy

**Current Implementation:** Batch fetch all tokens
- Fetches all 4 supported tokens in a single API call every 15 seconds
- Optimizes for instant token switching (zero loading delay)
- Trade-off: Fetches data for tokens that may not be actively viewed

**Rationale:** 
Given the small number of supported tokens (4), a batch approach provides the best UX with minimal overhead.

**Scalability Considerations:**
If the app were to support 100+ tokens, I would have implemented:
1. Individual token fetches on selection
2. React Query caching with 15s stale time
3. Prefetch top 10 popular tokens on page load
4. Only refresh prices for actively displayed tokens

## 📁 Project Structure

```
src/
├── app/
│   ├── _components/        # React components
│   │   ├── token-swap-calculator.tsx
│   │   ├── token-card.tsx
│   │   └── last-updated-indicator.tsx
│   ├── api/trpc/          # tRPC API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── server/
│   └── api/
│       ├── routers/       # tRPC routers
│       │   └── token.ts   # Token endpoints
│       └── trpc.ts        # tRPC setup
├── lib/
│   ├── constants.ts       # App-wide constants
│   └── tokens.ts          # Token types & definitions
└── styles/
    └── globals.css        # Global styles & theme
```

## 🎨 Supported Tokens

- **USDC** (Ethereum)
- **USDT** (Polygon)
- **WETH** (Base)
- **ARB** (Arbitrum)




