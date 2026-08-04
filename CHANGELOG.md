# Changelog

## 4.0.0

### Removed

- **`elfa.trade` and the `TradeClient` have been removed.** The direct Trade API
  (`/v2/trade/*`) is no longer part of the published Elfa API surface, so every
  method on it — `previewOrder`, `placeOrder`, `cancelOrder`, `modifyOrder`,
  `previewClosePosition`, `closePosition`, `previewSetPositionTpsl`,
  `setPositionTpsl` — called an endpoint that is no longer documented. The
  `TradeClient` export, the `src/types/trade.ts` types (`TradeExchange`,
  `PlaceOrderInput`, `CancelOrderInput`, `ModifyOrderInput`,
  `ClosePositionInput`, `SetPositionTpslInput`, `TradeResultResponse`,
  `TradePreviewResponse`) and the trade example are gone. Place orders through
  Auto trade actions (`market_order` / `limit_order`) via `elfa.auto` instead.

### Added

- `chatStream` — AI chat delivered incrementally over Server-Sent Events
  (`POST /v2/chat/stream`). Returns an async generator of `ChatStreamEvent`,
  the parsed `data:` payload discriminated on `type` (`session_info`, `title`,
  `text`, `text_complete`, `status`, `credits`, `complete`,
  `invalid_request`, `error`). Keep-alive comments and unparsable frames are
  skipped, and the generator returns on the terminating `[DONE]` frame.
  Requires a PAYG or Enterprise key.

### Changed

- `AutoConnectExchangeInput` is now a discriminated union on `exchange`,
  matching the per-venue request bodies in the API spec:
  `AutoConnectAgentWalletExchangeInput` (`hyperliquid` / `gmx`, `credentials`
  optional), `AutoConnectBinanceExchangeInput` (`credentials` required, with
  `apiKey` and `secret`) and `AutoConnectPacificaExchangeInput` (`credentials`
  required, with `privateKey` and `walletAddress`). A Binance or Pacifica
  connection that omits or misspells its credentials is now a type error rather
  than a runtime `400`.
- `hmacSecret` now signs Auto mutations only.

## 3.0.1

### Fixed

- `updateOptions()` now propagates to the internal clients. Previously it only
  mutated the object returned by `getOptions()`, so changes to `debug`,
  `timeout`, `retries`, `retryDelay`, `headers`, `baseUrl` and `hmacSecret`
  never reached the HTTP layer — e.g. `updateOptions({ debug: false })` left
  request/response logging on.

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
- `headers` option for sending custom headers with every request.

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
- `docs/MIGRATION.md`. It documented the V1 compatibility layer and the Twitter
  enhancement layer, both removed above, so every API it described is gone.

### Changed

- `getAccountSmartStats` now returns the V2 response shape.
- `getTopMentions` now returns the V2 response shape (previously `getTopMentionsV2`).
- Minimum Node version is 18. Dependencies updated.
- Non-idempotent requests are no longer retried automatically.
- Rate-limit reset parsing now handles `Retry-After` deltas correctly.
