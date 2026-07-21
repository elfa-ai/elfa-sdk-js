# Changelog

## 3.0.0

### Added

- `getTrendingNarratives` — trending narrative clusters (`/v2/data/trending-narratives`).
- `chat` — AI market analysis and conversational chat (`/v2/chat`).
- `elfa.auto` — the Auto condition engine (`/v2/auto/*`): builder chat, query
  validate/create/list/get/cancel/delete, drafts, sessions, executions, exchange
  connections, symbol validation, and SSE notification streams.
- `elfa.trade` — direct trading (`/v2/trade/*`): orders and positions with previews.
- HMAC request signing via the `hmacSecret` option for Auto/Trade mutations.
- `retries` / `retryDelay` options.

### Removed

- **The V1 compatibility layer and all V1 surface have been removed.** V1 is
  decommissioned server-side. This includes `V1CompatibilityLayer`,
  `createV1CompatibleClient`, `getMentions`, `getMentionsByKeywords`, and the
  V1-shaped variants of `getTopMentions` and `getAccountSmartStats`. Use the
  V2 methods.
- **The Twitter enhancement layer has been removed.** `TwitterClient`, the
  `twitterApiKey` / `fetchRawTweets` options, and the raw-tweet enrichment are
  gone. The SDK returns Elfa's processed data and tweet links only, and no
  longer exposes raw tweet content. Integrate the X/Twitter API directly if you
  need it.

### Changed

- `getAccountSmartStats` now returns the V2 response shape.
- `getTopMentions` now returns the V2 response shape (previously `getTopMentionsV2`).
- Minimum Node version is 18. Dependencies updated.
- Non-idempotent requests are no longer retried automatically.
- Rate-limit reset parsing now handles `Retry-After` deltas correctly.
