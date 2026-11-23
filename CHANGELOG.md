# Changelog

## Unreleased

### Added

- **`eventCategory` on `v3.getEvents()`** (API 3.14.0): what happened, such as
  `earnings`, `analystRating`, `exchangeListing`, `securityIncident` or
  `forecast`, as an array of the 27 `EventCategoryV3` values, sent
  comma-separated. It combines with `eventType`, which stays the domain, works
  with `sort: "relevant"`, and the API refuses it with `q` and `eventIds`. An
  empty array throws `ValidationError`. `EventV3` gains `eventCategory`, which
  is `null` on about 1 event in 10 and on events analysed before 2026-09-30.
  New values may be added in a minor API version; treat one you do not know as
  no category. New type `EventCategoryV3`.

### Changed

- README, `AGENT.md` and `CLAUDE.md`: Verify and Monitors work on every plan,
  Free included (API 3.15.0, 3.16.0), and `getPredictionMarkets()` costs 1
  credit a call (API 3.15.0); they no longer say otherwise.
- `swagger.json` refreshed to the published API `3.16.0`.

## 7.6.0

### Added

- **`accessToken` option.** `new ElfaSDK({ accessToken })` authenticates with
  an OAuth access token for the Elfa API, sent as `Authorization: Bearer`,
  instead of an API key. Set `elfaApiKey` or `accessToken`, not both; the
  constructor throws a `ValidationError` for neither or both. Every client
  (`ElfaSDK`, `auto`, `v3`) and the streaming calls use it. Like the key, it is
  fixed at construction: build a new client when the token is renewed.

### Changed

- `SDKOptions.elfaApiKey` is now optional in the type, since `accessToken` can
  replace it. Passing neither still throws at construction.

## 7.5.0

### Added

- **`v3.verify(body)`** (API 3.13.0) for `POST /v3/verify`: checks one
  statement against X posts, public Telegram channels and web pages, and returns
  a `verdict` (`supported`, `contradicted` or `notEnoughEvidence`), its
  `probabilities`, the `evidence` judged, `asOf`, `searchedFrom` and `coverage`.
  An optional `decision` asks a `yesNo`, a `choice` or a `score` from the same
  evidence, answered in `decision` (`null` when none was asked). Needs a PAYG,
  Grow or Enterprise key; 1 credit a call whatever the verdict. New types
  `VerifyV3Params`, `VerifyV3Response`, `VerdictV3`, `VerifyDecisionRequestV3`,
  `VerifyDecisionV3` and their variants, `VerifyEvidenceItemV3` and
  `VerifyCoverageStatusV3`.
- **Monitors** (API 3.13.0) for `/v3/monitors`: `v3.createMonitor(body)`,
  `v3.getMonitors()`, `v3.getMonitor(id)`, `v3.updateMonitor(id, body)`,
  `v3.deleteMonitor(id)` and `v3.getMonitorMatches(id, params?)`. A monitor
  matches new Elfa events and web pages against a plain-words `query` and sends
  each match to its `webhookUrl`, signed with its `webhookSecret`; matches can
  be paged back with `nextCursor` for 30 days. Needs a PAYG, Grow or Enterprise
  key; a live monitor costs 2 credits for each started hour, and every other
  monitor call is free. New types `MonitorV3`, `MonitorStatusV3`,
  `MonitorsV3Response`, `CreateMonitorV3Params`, `UpdateMonitorV3Params`,
  `DeleteMonitorV3Response`, `MonitorMatchesV3Params`,
  `MonitorMatchesV3Response`, `MonitorMatchV3`, `MonitorEventItemV3`,
  `MonitorWebItemV3` and `MonitorCitedSourceV3`.

### Changed

- README, `AGENT.md` and `CLAUDE.md`: Verify and Monitors in the v3 capability
  lists and method table; they are the v3 endpoints a Free key cannot call.
- `swagger.json` refreshed to the published API `3.13.0`. An event's
  `citedSources[].source` can be `sec_edgar` (API 3.11.0);
  `EventCitedSourceV3.source` is already a `string`.

## 7.4.0

### Added

- **`useMemory` on chat** (API 3.3.0). `ChatParams` takes `useMemory?: boolean`
  for `chat` and `chatStream`. `true` lets the request read and add to the saved
  memory of the Elfa account that owns the API key. Without it the request
  neither reads nor writes memory, which is now the API's default.
- **Follow accounts on Auto validate and create** (API 3.1.0).
  `AutoValidateResponse` and `AutoCreateQueryResponse` carry
  `followAccounts?: AutoFollowAccount[]`, one per account an `x_follow_made` or
  `x_follow_overlap` condition watches, with `billing` (`included` or `per_day`)
  and `creditsPerDay`. A `per_day` account costs that much for each UTC day its
  follows are read, on top of `estimatedCredits`.
- **`calls` and `mindshare` in `EqlConditionSource`** (API 3.2.0), the Auto
  condition sources for one account's trading calls and for token or stock
  mindshare.
- **`"free"` in `PlanV3`** (API 3.4.0). Free keys can call every v3 endpoint, and
  `getKeyStatus()` reports `plan: "free"`.
- **`v3.getPredictionMarkets({ ids, limit? })`** (API 3.6.0) for
  `GET /v3/events/prediction-markets`: the open Polymarket and Kalshi markets up
  to 30 event, storyline or arc ids bear on, any mix. Each item in `related` has
  its `id`, `kind` and `markets`; each market has `provider`, `marketId`,
  `title`, `url`, `closesAt`, the `eventIds` behind it and `move`, how one
  outcome's odds moved around a story and whether that was `unusual`. No range,
  no cursor; free for now. New types `PredictionMarketsV3Params`,
  `PredictionMarketsV3Response`, `PredictionMarketV3`, `PredictionMarketMoveV3`,
  `PredictionMarketProviderV3` and `RelatedKindV3`.
- **`after` on `auto.listExecutions`** (API 3.8.0). Pass `"start"`, then
  `pagination.nextCursor`, to read every execution once, oldest first.
  `AutoListExecutionsResponse.pagination` is now typed as
  `AutoExecutionsPagination`, with `nextCursor`.
- **`v3.getCalendar(params?)`** (API 3.9.0) for `GET /v3/events/calendar`: what
  is scheduled across crypto, equities and macro, soonest first, with a cursor.
  `from` defaults to 00:00 UTC today and `to` to 30 days after `from`. Filters:
  `entityIds`, `assetClass`, `category`, `status`, `confidence` and
  `minImportance`. New types `CalendarV3Params`, `CalendarV3Response`,
  `CalendarEntryV3`, `CalendarCategoryV3`, `CalendarStatusV3` and
  `CalendarConfidenceV3`.

### Changed

- **`ERR_RATE_LIMITED` is not retried.** A `429` with that code means the key is
  out of credits, so retrying does not help; `isRetryableError()` returns `false`
  and the call throws `RateLimitError` at once. A `429` over the per-minute limit
  (`ERR_RATE_LIMIT_EXCEEDED`) still retries on the server's reset.
- README, `AGENT.md` and `CLAUDE.md`: API v3 is open to every plan and costs
  credits per call on Free, PAYG and Grow; a Free key reads 30 days of history.
  `chatStream` needs a PAYG, Grow or Enterprise key.
- `getAccountSmartStats()` is documented as deprecated and not maintained, with
  `v3.getTopAccounts` as the way to rank accounts. The basic example no longer
  calls it.
- README: Builder chat answers a rejected message with a `400` and a turn with no
  answer with a `502` (API 3.10.0), so `auto.chat` throws `ElfaApiError` for both
  instead of returning an empty `response`.
- `swagger.json` refreshed to the published API `3.10.1`.

## 7.3.0

### Added

- **X accounts on Auto validate and create** (API 2.12.0). `AutoValidateResponse`
  and `AutoCreateQueryResponse` carry `tweetAccounts?: AutoTweetAccount[]`, one per
  `tweet` condition, with `billing` (`included` or `per_post`) and
  `creditsPerPost`. A `per_post` account costs that much for each post (not
  replies or reposts) while the query runs, on top of `estimatedCredits`.
- **`failure` on poll** (API 2.12.0). `getQuery()` returns `failure: AutoQueryFailure`
  (`code`, `message`, `source`) when a query failed with a recorded reason.

### Changed

- `createQuery()` returns `AutoCreateQueryResponse`, with `id` and `status`
  required, as the API returns them. The README and `src/examples/auto.ts` read
  `created.id`.
- `estimatedCredits` is `number | null` on validate and create: `null` when no
  estimate can be made.
- README, `AGENT.md` and `CLAUDE.md`: API v3 is free on Pay-as-you-go and Grow
  until 31 October 2026. The v3 link points at `docs.elfa.ai/api/v3/overview`.
- `swagger.json` refreshed to the published API `3.0.0`.

### Removed

- `estimatedCost` on `AutoValidateResponse`. The API returns it only on x402,
  never to an API key, so it was never set; `estimatedCredits` is the estimate.

## 7.2.0

### Added

- **Rank top accounts by track record.** `AccountMetricV3` now takes
  `alphaScore`, `hitRate` and `avgReturn` beside `standing` (API 2.11.0), so
  `elfa.v3.getTopAccounts({ metric: "alphaScore" })` type-checks. Track metrics
  rank only accounts with at least 20 scored positions, and a `nextCursor` works
  only with the `metric` and `order` it came from.

### Changed

- `swagger.json` refreshed to the published API `2.11.0`.

## 7.1.0

### Added

- **API v3 via `elfa.v3`.** A new `V3Client`, exposed on `ElfaSDK` as `v3` and
  sharing its options the same way `auto` does, with one method per published
  `/v3` endpoint: `getEntities`, `getEvents`, `getStorylines`, `getArcs`,
  `getCallBook(market, params)`, `getMindshare(market, params)`,
  `getTrendingContracts`, `getCalls`, `getCallEpisodes`, `getPositioning`,
  `getTopAccounts` and `getKeyStatus`. `market` is `"crypto"` or `"equity"`.
  Request and response types are in `src/types/v3.ts` and exported from the
  package root. List parameters take arrays and are sent comma-separated. A
  parameter the endpoint does not declare, or an empty array, throws
  `ValidationError` before the request, since v3 answers an unknown parameter
  with `400` and an empty filter would otherwise be dropped. Times are unix
  seconds. PAYG, Grow and Enterprise keys can call every v3 endpoint; a Free
  key can call only `getKeyStatus()`. See [API v3](https://docs.elfa.ai/v3/overview).

- **`includeSources` on `chat` and `chatStream`.** Set `includeSources: true` to
  receive the links the research behind the answer read: `data.sources` on
  `chat`, `sources` on the final `complete` stream event. Each `ChatSource` has
  a `url`, a `kind` and an optional `title` naming the research step, such as
  "Searched X". `kind` is typed as `string`, not an enum, so new kinds do not
  break your build; treat an unknown value as `web`.

- **`EqlConditionSource` covers every documented source.** Adds `events`
  (API 2.9.0) and the follow-graph sources `x_follow_received`,
  `x_follow_made` and `x_follow_overlap`, so these conditions type-check
  without a cast.

### Removed

- **`"gmx"` is no longer a `TradableExchange`.** The published
  `GET /v2/auto/validate-symbol/{exchange}/{symbol}` enum is now
  `hyperliquid | binance`. Passing `"gmx"` to `validateSymbol` is now a type
  error; the API already rejected it, so no working call changes.

### Changed

- `swagger.json` refreshed to the published API `2.10.0`, which adds the `/v3`
  endpoints and chat sources, drops `gmx`, and no longer lists
  `/v2/data/market-events`. The SDK never referenced market events, so nothing
  else changes.

## 7.0.0

### Removed

- **HMAC request signing has been removed.** The `hmacSecret` option is gone
  from `SDKOptions`, `AutoClientOptions` and `AutoClient.updateOptions`, along
  with the `signRequest` helper. `/v2/auto/*` routes are no longer documented as
  taking `x-elfa-timestamp` or `x-elfa-signature`; the API key alone
  authenticates every route, including mutations.

  **Migration:** delete `hmacSecret` from your client construction. Nothing
  replaces it. If you pass it today, TypeScript will now reject the property and
  the header was already redundant on every documented action type.

- **`ApiKeyStatus.hmacEnabled` is gone.** The API no longer returns the field,
  so the SDK no longer declares it. Reading `status.data.hmacEnabled` is now a
  type error. There is no replacement — nothing about a key's Auto access
  depends on signing any more.

- **`"pacifica"` is no longer a `TradableExchange`.** The published
  `GET /v2/auto/validate-symbol/{exchange}/{symbol}` enum is now
  `hyperliquid | gmx | binance`. Passing `"pacifica"` to `validateSymbol` is a
  type error; it would have been rejected by the API regardless.

### Added

- **`appName` adds your product to the `User-Agent`.** Pass
  `appName: "my-bot/1.2"` to `ElfaSDK`, `ElfaV2Client` or `AutoClient` and every
  request carries `User-Agent: elfa-sdk-js/7.0.0 my-bot/1.2`. It must be 1-100
  printable ASCII characters; anything else throws `ValidationError` at
  construction. It is fixed for the client's lifetime:
  `ElfaSDK.updateOptions({ appName })` throws.

### Changed

- **The `User-Agent` is now `elfa-sdk-js/<version>`**, replacing
  `@elfa-ai/sdk/<version>`, so it lines up with the Python SDK's
  `elfa-sdk-python/<version>`. A `User-Agent` you pass in `headers`, in any
  casing, still replaces it.

- **Streaming requests send the `User-Agent` too.** `chatStream`,
  `auto.streamQuery` and `auto.streamAll` use `fetch` rather than the shared
  HTTP client, and until now went out with the runtime's default `User-Agent`.

- **`axios` now requires `^1.20.0`** (was `^1.12.0`). 1.20.0 patches the axios
  advisories published on 30 September 2026, among them
  [GHSA-m8m8-qj5v-23w3](https://github.com/advisories/GHSA-m8m8-qj5v-23w3) and
  [GHSA-r4gj-5m52-g5wh](https://github.com/advisories/GHSA-r4gj-5m52-g5wh), so
  upgrading to 7.0.0 brings in a patched axios even if your lockfile still holds
  an older 1.x.

- `swagger.json` refreshed to API `2.6.3`. A credit is now $0.0145, so the x402
  reference prices in the spec move to $0.0145 (1 credit), $0.0725 (5 credits)
  and $0.261 (18 credits). Accounts already on PAYG keep $0.009 per credit until
  28 September 2026, 16:00 UTC. Pricing affects documentation strings only — no
  method signature changes.

## 6.1.0

Thanks to [@web3xDev](https://github.com/web3xDev), who reported and fixed the
rate-limit bug below and found the mention `type` narrowing.

### Fixed

- **`429` retries now honour the server's reset.** `RateLimitError.resetTime`
  was parsed but never used: the retry loop always slept
  `retryDelay * 2 ** attempt`, so a `429` asking for 20s was retried at 1s, 2s
  and 4s and burned every attempt inside the window the server asked us to sit
  out. Waits now follow the reset, an already-elapsed reset can no longer
  shorten the backoff, and a reset further out than 60s stops the retry loop and
  throws `RateLimitError` with `resetTime` rather than blocking you for an hour.
  Retries still apply only to `GET`/`HEAD`; responses without rate-limit headers
  are unaffected.

### Added

- **`MentionType`** — `"repost" | "post" | "quote" | "reply" | "note" |
"article"`, matching the enum the spec declares on `MentionV2` and
  `KeywordMentionV2`.
- **`BillingMode`** — `"deposit" | "arrears"`, as the spec enumerates.
- **`isRateLimitError`** — a type guard for `RateLimitError`. Checks `name`
  rather than `instanceof`, which is unreliable across the CJS/ESM boundary
  where an error built in one module copy fails `instanceof` against the class
  from the other.

### Changed

- **`ProcessedMention.type` and `TopMentionV2.type` are now `MentionType`, and
  `ApiKeyStatus.billingMode` is `BillingMode`** — all three were `string`. This
  is what makes a `switch` over them exhaustiveness-checked. Reading responses
  is unaffected; code that _builds_ one of these objects from an untyped source
  may now need a cast or a narrowed input.
- `swagger.json` refreshed against the live spec: the `credits` field on Builder
  Chat, response schemas no longer closed, and the `/v2/auto/exchanges`
  endpoints dropped in 5.0.0 removed.

## 6.0.0

### Removed

- **Node 18 and 20 are no longer supported.** `engines.node` is now `>=22.0.0`.
  Node 18 reached end of life in April 2025 and Node 20 in April 2026, so
  neither receives security patches. Nothing in the SDK's runtime code required
  the change — no API is used that Node 18 lacks — so if you are pinned to an
  EOL runtime, `@elfa-ai/sdk@5` keeps working against the same API. It will not
  receive further updates.

### Changed

- CI now tests against Node 22 and 24 instead of 18, 20 and 22. Coverage upload
  moved to the 22.x job with the matrix.

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
