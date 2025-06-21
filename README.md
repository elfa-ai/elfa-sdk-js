# Elfa AI SDK

[![npm version](https://img.shields.io/npm/v/elfa-ai.svg)](https://www.npmjs.com/package/elfa-ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official TypeScript/JavaScript SDK for the Elfa API v2 - Social intelligence for crypto.

## Features

- **Dual API Architecture**: Seamlessly combines Elfa V2 API with optional Twitter API enhancement (adds raw tweet content and metrics)
- **V1 Compatibility**: Drop-in replacement for V1 SDK with enhanced functionality
- **TypeScript First**: Comprehensive type definitions and IDE support
- **Flexible Enhancement**: Choose between V2-formatted processed data or V1-like raw content
- **Smart Error Handling**: Graceful degradation when Twitter API is unavailable
- **Rate Limiting**: Built-in respect for API rate limits
- **Comprehensive Testing**: Full test suite with examples

## Installation

```bash
npm install elfa-ai
```

## Quick Start

### Basic V2 Usage

```typescript
import { ElfaSDK } from 'elfa-ai';

const elfa = new ElfaSDK({
  elfaApiKey: 'your-elfa-api-key',
  fetchRawTweets: false // V2-formatted processed data
});

// Get trending tokens
const trending = await elfa.getTrendingTokens({ timeWindow: '24h' });
console.log(trending.data.data);

// Search keyword mentions (processed)
const mentions = await elfa.getKeywordMentions({ 
  keywords: 'bitcoin,ethereum',
  period: '1h'
});
console.log(mentions.data);
```

### Enhanced Usage with Raw Content

```typescript
import { ElfaSDK } from 'elfa-ai';

const elfa = new ElfaSDK({
  elfaApiKey: 'your-elfa-api-key',
  twitterApiKey: 'your-twitter-bearer-token', // Enables content enhancement
  fetchRawTweets: false // Don't fetch raw content by default
});

// Get mentions with raw tweet content
const enhancedMentions = await elfa.getKeywordMentions({
  keywords: 'bitcoin',
  period: '1h',
  fetchRawTweets: true // Override to get raw content
});

enhancedMentions.data.forEach(mention => {
  console.log('Tweet content:', mention.content); // Enhanced with raw tweet text
  console.log('Data source:', mention.data_source); // 'elfa+twitter'
});
```

### Global Raw Tweet Setting

```typescript
const elfa = new ElfaSDK({
  elfaApiKey: 'your-elfa-api-key',
  twitterApiKey: 'your-twitter-bearer-token',
  fetchRawTweets: true // Enable raw tweets globally
});

// All methods now include raw content by default
const mentions = await elfa.getKeywordMentions({ keywords: 'solana' });

// Can still override per method
const processed = await elfa.getKeywordMentions({ 
  keywords: 'cardano',
  fetchRawTweets: false 
});
```

## V1 Migration

For users migrating from V1, use the compatibility layer:

```typescript
import { V1CompatibilityLayer } from 'elfa-ai/compatibility';

// Drop-in replacement for V1 with enhanced functionality
const client = new V1CompatibilityLayer({
  elfaApiKey: 'your-elfa-api-key',
  twitterApiKey: 'your-twitter-bearer-token',
  enableV1Behavior: true // Enables raw tweets by default
});

// Use V1 method signatures
const topMentions = await client.getTopMentions({
  ticker: 'bitcoin',
  timeWindow: '24h'
});

const searchResults = await client.getMentionsByKeywords({
  keywords: 'ethereum',
  from: 1640995200,
  to: 1641081600
});
```

## API Reference

### Core Methods

#### `getTrendingTokens(params?)`
Get trending tokens based on mention counts.

```typescript
const trending = await elfa.getTrendingTokens({
  timeWindow: '24h',
  pageSize: 50,
  minMentions: 5
});
```

#### `getKeywordMentions(params)`
Search mentions by keywords with optional raw content.

```typescript
const mentions = await elfa.getKeywordMentions({
  keywords: 'bitcoin,ethereum',
  period: '1h',
  limit: 20,
  fetchRawTweets: true
});
```

#### `getTokenNews(params?)`
Get token-related news mentions.

```typescript
const news = await elfa.getTokenNews({
  coinIds: 'bitcoin,ethereum',
  pageSize: 20,
  fetchRawTweets: true
});
```

#### `getTrendingCAsTwitter(params?)`
Get trending contract addresses from Twitter.

```typescript
const trendingCAs = await elfa.getTrendingCAsTwitter({
  timeWindow: '24h',
  minMentions: 10
});
```

#### `getAccountSmartStats(params)`
Get smart stats for a Twitter account.

```typescript
const stats = await elfa.getAccountSmartStats({
  username: 'elonmusk'
});
```

### Configuration Options

```typescript
interface SDKOptions {
  elfaApiKey: string;                    // Required: Your Elfa API key
  twitterApiKey?: string;                // Optional: Twitter Bearer token for enhancement
  baseUrl?: string;                      // Optional: API base URL (default: https://api.elfa.ai)
  fetchRawTweets?: boolean;              // Optional: Global raw tweet setting (default: false)
  enhancementTimeout?: number;           // Optional: Twitter API timeout (default: 30000ms)
  maxBatchSize?: number;                 // Optional: Max tweets per batch (default: 100)
  strictMode?: boolean;                  // Optional: Fail if Twitter unavailable (default: false)
  respectRateLimits?: boolean;           // Optional: Auto-throttle (default: true)
  debug?: boolean;                       // Optional: Enable debug logging (default: false)
}
```

## Error Handling

The SDK provides comprehensive error handling with specific error types:

```typescript
import { 
  ElfaApiError, 
  TwitterApiError, 
  ValidationError,
  RateLimitError,
  AuthenticationError 
} from 'elfa-ai';

try {
  const mentions = await elfa.getKeywordMentions({
    keywords: 'bitcoin',
    fetchRawTweets: true
  });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.log('Rate limited, retry after:', error.resetTime);
  } else if (error instanceof TwitterApiError) {
    console.log('Twitter API issue, using V2 data only');
  }
}
```

## Examples

Check out the [examples directory](./src/examples/) for comprehensive usage examples:

- [Basic Usage](./src/examples/basic.ts) - V2 API with processed data
- [Enhanced Usage](./src/examples/enhanced.ts) - Twitter API enhancement
- [Migration Guide](./src/examples/migration.ts) - V1 to SDK migration

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

# Lint and type check
npm run lint
npm run typecheck
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@elfa.ai
- 📖 Documentation: [https://docs.elfa.ai](https://docs.elfa.ai)
- 🐛 Issues: [GitHub Issues](https://github.com/elfa-ai/elfa-sdk-js/issues)

