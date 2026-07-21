# Elfa AI SDK

[![npm version](https://img.shields.io/npm/v/@elfa-ai/sdk.svg)](https://www.npmjs.com/package/@elfa-ai/sdk)
[![CI](https://github.com/elfa-ai/elfa-sdk-js/workflows/CI/badge.svg)](https://github.com/elfa-ai/elfa-sdk-js/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![codecov](https://codecov.io/gh/elfa-ai/elfa-sdk-js/branch/main/graph/badge.svg)](https://codecov.io/gh/elfa-ai/elfa-sdk-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official TypeScript/JavaScript SDK for the Elfa API v2 - social intelligence, AI chat, and the Auto/Trade engines for crypto.

## Features

- **Social Intelligence**: Trending tokens, mentions, narratives, smart stats, and event summaries
- **AI Chat**: Market analysis and conversational chat via `elfa.chat`
- **Auto Condition Engine**: Build EQL queries that notify or trade via `elfa.auto`
- **Direct Trading**: Place orders and manage positions via `elfa.trade`
- **TypeScript First**: Comprehensive type definitions and IDE support
- **Smart Error Handling**: Typed error classes with built-in retries and rate-limit handling
- **Rate Limiting**: Built-in respect for API rate limits
- **Comprehensive Testing**: Full test suite with examples

## Installation

```bash
npm install @elfa-ai/sdk
```

## Quick Start

### Basic V2 Usage

```typescript
import { ElfaSDK } from "@elfa-ai/sdk";

const elfa = new ElfaSDK({
  elfaApiKey: "your-elfa-api-key",
});

// Get trending tokens
const trending = await elfa.getTrendingTokens({ timeWindow: "24h" });
console.log(trending.data.data);

// Search keyword mentions
const mentions = await elfa.getKeywordMentions({
  keywords: "bitcoin,ethereum",
  timeWindow: "1h",
});
console.log(mentions.data);
```

## API Reference

### Core Methods

#### `getTrendingTokens(params?)`

Get trending tokens based on mention counts.

```typescript
const trending = await elfa.getTrendingTokens({
  timeWindow: "24h",
  pageSize: 50,
  minMentions: 5,
});
```

#### `getKeywordMentions(params)`

Search mentions by keywords.

```typescript
const mentions = await elfa.getKeywordMentions({
  keywords: "bitcoin,ethereum",
  timeWindow: "1h",
  limit: 20,
});
```

#### `getTokenNews(params?)`

Get token-related news mentions.

```typescript
const news = await elfa.getTokenNews({
  coinIds: "bitcoin,ethereum",
  pageSize: 20,
});
```

#### `getTrendingCAsTwitter(params?)`

Get trending contract addresses from Twitter.

```typescript
const trendingCAs = await elfa.getTrendingCAsTwitter({
  timeWindow: "24h",
  minMentions: 10,
});
```

#### `getAccountSmartStats(params)`

Get smart stats for a Twitter account.

```typescript
const stats = await elfa.getAccountSmartStats({
  username: "elonmusk",
});
```

#### `getTrendingNarratives(params?)`

Get trending narrative clusters from Twitter analysis.

```typescript
const narratives = await elfa.getTrendingNarratives({
  timeFrame: "day",
  maxNarratives: 7,
});
```

#### `chat(params)`

AI market analysis and conversational chat. Requires a key with the `chat` scope.

```typescript
const reply = await elfa.chat({
  message: "What is the market sentiment on SOL?",
});
console.log(reply.data.message);

// Continue the conversation with the returned sessionId
const followUp = await elfa.chat({
  message: "And ETH?",
  sessionId: reply.data.sessionId,
});

// Preset analyses (no message needed)
await elfa.chat({
  analysisType: "tokenAnalysis",
  assetMetadata: { symbol: "BTC" },
});
```

### Auto (Condition Engine)

`elfa.auto` drives the Auto condition engine — EQL queries that watch markets and
fire notifications or trades. Trade-action and exchange mutations need an HMAC
secret (`hmacSecret`); notification-only queries do not.

```typescript
const query = {
  query: {
    conditions: {
      AND: [
        {
          source: "price",
          method: "current",
          args: { symbol: "BTC", exchange: "hyperliquid" },
          operator: ">",
          value: 100000,
        },
      ],
    },
    actions: [
      {
        stepId: "step_1",
        type: "notify",
        params: { message: "BTC crossed 100k" },
      },
    ],
    expiresIn: "24h",
  },
  title: "BTC breakout alert",
};

const { valid } = await elfa.auto.validateQuery(query);
const created = await elfa.auto.createQuery(query);
const status = await elfa.auto.getQuery(created.id ?? created.queryId!);

// Stream notifications over SSE
for await (const event of elfa.auto.streamQuery(created.id!)) {
  console.log(event.event, event.data);
}
```

### Trade (Direct Trading)

`elfa.trade` places synchronous orders on your linked exchange account. All writes
require an HMAC secret; previews are unsigned.

```typescript
const elfa = new ElfaSDK({ elfaApiKey: "...", hmacSecret: "..." });

const preview = await elfa.trade.previewOrder({
  exchange: "hyperliquid",
  symbol: "BTC",
  side: "buy",
  orderType: "market",
  amount: "100",
});

const result = await elfa.trade.placeOrder({
  exchange: "hyperliquid",
  symbol: "BTC",
  side: "buy",
  orderType: "market",
  amount: "100",
});
```

### Configuration Options

```typescript
interface SDKOptions {
  elfaApiKey: string; // Required: Your Elfa API key
  hmacSecret?: string; // Optional: HMAC secret for Auto/Trade signed mutations
  baseUrl?: string; // Optional: API base URL (default: https://api.elfa.ai)
  timeout?: number; // Optional: request timeout in ms (default: 30000)
  retries?: number; // Optional: retries for idempotent requests (default: 3)
  retryDelay?: number; // Optional: base retry delay in ms (default: 1000)
  debug?: boolean; // Optional: Enable debug logging (default: false)
}
```

> The SDK returns Elfa's processed data (metadata, engagement metrics, and tweet
> links) and does not expose raw tweet text. If you need raw tweet content, call
> the X/Twitter API directly with your own credentials.

## Error Handling

The SDK provides comprehensive error handling with specific error types:

```typescript
import {
  ElfaApiError,
  ValidationError,
  RateLimitError,
  AuthenticationError,
} from "@elfa-ai/sdk";

try {
  const mentions = await elfa.getKeywordMentions({ keywords: "bitcoin" });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.log("Invalid API key");
  } else if (error instanceof RateLimitError) {
    console.log("Rate limited, retry after:", error.resetTime);
  } else if (error instanceof ElfaApiError) {
    console.log("API error:", error.statusCode);
  }
}
```

## Examples

Check out the [examples directory](./src/examples/) for comprehensive usage examples:

- [Basic Usage](./src/examples/basic.ts) - V2 API with processed data
- [Auto & Trade](./src/examples/auto.ts) - Condition engine queries and direct trading

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Code quality checks
npm run lint                    # Run ESLint
npm run lint:fix               # Run ESLint with auto-fix
npm run format                 # Format code with Prettier
npm run format:check           # Check if code is formatted
npm run typecheck              # TypeScript type checking
npm run quality                # Run all quality checks
npm run quality:fix            # Run all quality checks with auto-fix
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: <support@elfa.ai>
- 📖 Documentation: [https://docs.elfa.ai](https://docs.elfa.ai)
- 🐛 Issues: [GitHub Issues](https://github.com/elfa-ai/elfa-sdk-js/issues)
  test change
