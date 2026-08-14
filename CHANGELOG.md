# Changelog

## 5.1.0

### Added

- **`AutoChatResponse.credits`** — `POST /v2/auto/chat` returns the credits the
  call cost, and the type now declares it (optional, so responses from older API
  deployments still type-check). The same total is on the `x-elfa-credits`
  response header that every v2 route now sends. Builder Chat is dynamically
  priced, so read this instead of assuming a flat cost.

### Note on response shapes

The SDK does not validate response bodies — it types them. New fields the API
adds are passed through untouched and never throw. Treat v2 response bodies as
extensible: do not pin them with exact-shape assertions (`z.strictObject`,
`additionalProperties: false`, Pydantic `extra="forbid"`), or an additive field
like `credits` will break your client even though the API did not.

## 5.0.0

### Removed

- **Auto exchange connections have been removed.** `auto.listExchanges`,
  `auto.connectExchange` and `auto.disconnectExchange` are gone, along with the
  `AutoExchangeConnection`, `AutoListExchangesResponse`,
  `AutoConnectAgentWalletExchangeInput`, `AutoConnectBinanceExchangeInput`,
  `AutoConnectPacificaExchangeInput` and `AutoConnectExchangeInput` types.
  Exchange connections are no longer part of the documented Auto surface.
- **Order actions have been removed from `EqlActionType`.** `market_order` and
  `limit_order` are rejected on new queries and drafts with
  `EQL_INVALID_ACTION`, at top level and in `llm` callbacks. The allowed action
  types are `webhook`, `notify`, `telegram_bot` and `llm`.

### Added

- `EqlConditionSource` gains `telegram` (Telegram channel Signal triggers) and
  `sec` (SEC filing triggers keyed on an issuer CIK).
- `ApiKeyStatus` now covers the full documented key-status contract:
  `key` (masked), `updatedAt`, `requestsPerMinute`, `email`, `project`,
  `allowOverage`, `maxOverage`, `spendCapCredits`, `bonusCredits`,
  `bonusCreditsExpiresAt`, `emailNotificationsEnabled`, `lastEmailSentAt`,
  `lastUsagePercentNotified`, `spendAlertThreshold`,
  `spendAlertMaxFrequencyHours`, `totalSpendAlerted`, `hmacEnabled`,
  `athenaEnabled`, `scopes`, `tier`, `depositCredits` and `billingMode`.

### Kept

- `auto.validateSymbol` and `TradableExchange`. The symbol check is still
  documented as a pre-flight for `price` / `ta` conditions and still accepts all
  four venues.

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
