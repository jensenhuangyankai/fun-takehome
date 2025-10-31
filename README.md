## Design Decisions

### Token Price Fetching Strategy

**Current Implementation:** Batch fetch all tokens
- Fetches all 4 supported tokens in a single API call every 30 seconds
- Optimizes for instant token switching (zero loading delay)
- Trade-off: Fetches data for tokens that may not be actively viewed

**Rationale:** 
Given the small number of supported tokens (4), a batch approach provides the best UX with minimal overhead.

**Scalability Considerations:**
If the app were to support 100+ tokens, the recommended approach would be:
1. Individual token fetches on selection
2. React Query caching with 30s stale time
3. Prefetch top 10 popular tokens on page load
4. Only refresh prices for actively displayed tokens



