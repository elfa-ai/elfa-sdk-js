# Migration Guide

This guide helps you migrate from direct Elfa API calls to using the official Elfa AI SDK.

## Overview

The Elfa AI SDK provides a modern, type-safe way to interact with the Elfa API v2, with optional Twitter API enhancement for raw tweet content. This guide covers migration from manual HTTP requests to the SDK.

**Key improvements the SDK provides:**
- **Type Safety**: Full TypeScript support with IntelliSense and compile-time validation
- **Authentication**: Automatic API key management and header injection
- **Error Handling**: Specific error classes instead of generic HTTP errors
- **Rate Limiting**: Built-in respect for API rate limits and retry logic
- **Enhancement**: Optional Twitter API integration for raw tweet content
- **Consistency**: Unified response format and parameter naming across all endpoints
- **Future-Proof**: Automatic compatibility with new API versions and features

## Installation

```bash
npm install @elfa-ai/sdk
```

## Migration Steps

### Step 1: Replace Direct API Calls

**Before (Direct HTTP Requests):**
```javascript
import axios from 'axios';

const apiKey = 'your-elfa-api-key';
const baseUrl = 'https://api.elfa.ai';

// Manual trending tokens request
const trendingResponse = await axios.get(`${baseUrl}/v2/trending-tokens`, {
  headers: { 
    'x-elfa-api-key': apiKey,
    'Content-Type': 'application/json'
  },
  params: { 
    timeWindow: '24h',
    pageSize: 50 
  }
});
const trending = trendingResponse.data;

// Manual keyword mentions request
const mentionsResponse = await axios.get(`${baseUrl}/v2/data/keyword-mentions`, {
  headers: { 
    'x-elfa-api-key': apiKey,
    'Content-Type': 'application/json'
  },
  params: {
    keywords: 'bitcoin',
    period: '1h',
    limit: 20
  }
});
const mentions = mentionsResponse.data;
```

**After (Using SDK):**
```typescript
import { ElfaSDK } from '@elfa-ai/sdk';

const elfa = new ElfaSDK({
  elfaApiKey: 'your-elfa-api-key',
  twitterApiKey: 'your-twitter-bearer-token' // Optional for enhanced features
});

// Clean method calls with TypeScript support
const trending = await elfa.getTrendingTokens({ 
  timeWindow: '24h',
  pageSize: 50 
});

const mentions = await elfa.getKeywordMentions({
  keywords: 'bitcoin',
  period: '1h',
  limit: 20,
  fetchRawTweets: true // Optional: get raw tweet content
});
```

### Step 2: Error Handling Improvements

**Before (Manual Error Handling):**
```javascript
try {
  const response = await axios.get(`${baseUrl}/v2/trending-tokens`, config);
  const data = response.data;
} catch (error) {
  if (error.response?.status === 401) {
    console.error('Authentication failed');
  } else if (error.response?.status === 429) {
    console.error('Rate limited');
  } else {
    console.error('API error:', error.message);
  }
}
```

**After (Built-in Error Types):**
```typescript
import { 
  ElfaSDK, 
  AuthenticationError, 
  RateLimitError, 
  ElfaApiError 
} from '@elfa-ai/sdk';

try {
  const trending = await elfa.getTrendingTokens({ timeWindow: '24h' });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited, retry after:', error.resetTime);
  } else if (error instanceof ElfaApiError) {
    console.error('API error:', error.message, error.statusCode);
  }
}
```

### Step 3: Enhanced Features

The SDK provides features not easily available with direct API calls:

#### Twitter API Enhancement
```typescript
// Get keyword mentions with raw tweet content
const enhancedMentions = await elfa.getKeywordMentions({
  keywords: 'bitcoin',
  period: '1h',
  fetchRawTweets: true // Adds raw tweet text, metrics, etc.
});

enhancedMentions.data.forEach(mention => {
  console.log('Processed data:', mention.processed_content);
  console.log('Raw tweet:', mention.content); // Enhanced with Twitter API
  console.log('Data source:', mention.data_source); // 'elfa+twitter'
});
```

#### Built-in Pagination
```typescript
// Easy pagination with helper utilities
import { PaginationHelper } from '@elfa-ai/sdk';

const paginationHelper = new PaginationHelper();

// Get all results across multiple pages
const allMentions = await paginationHelper.getAllPages(
  async (cursor?: string) => {
    return elfa.getKeywordMentions({ 
      keywords: 'ethereum',
      period: '1h',
      limit: 100,
      cursor
    });
  }
);
```

#### Rate Limiting & Retries
```typescript
const elfa = new ElfaSDK({
  elfaApiKey: 'your-api-key',
  respectRateLimits: true, // Automatic throttling
  enhancementTimeout: 30000, // Twitter API timeout
  debug: true // Enable debug logging
});
```

## Method Mapping

This section maps raw API endpoints to SDK methods for easy migration.

### V2 API Endpoints

#### Ping & Status
```typescript
// Direct API
GET /v2/ping

// SDK
await elfa.ping();

// Direct API  
GET /v2/key-status

// SDK
await elfa.getApiKeyStatus();
```

#### Trending Tokens
```typescript
// Direct API
GET /v2/trending-tokens?timeWindow=24h&pageSize=50

// SDK
await elfa.getTrendingTokens({ timeWindow: '24h', pageSize: 50 });
```

#### Keyword Mentions
```typescript
// Direct API
GET /v2/data/keyword-mentions?keywords=bitcoin&period=1h&limit=20

// SDK
await elfa.getKeywordMentions({ 
  keywords: 'bitcoin', 
  period: '1h', 
  limit: 20 
});
```

#### Token News
```typescript
// Direct API
GET /v2/data/token-news?coinIds=bitcoin,ethereum&pageSize=20

// SDK
await elfa.getTokenNews({ 
  coinIds: 'bitcoin,ethereum', 
  pageSize: 20 
});
```

#### Trending Contract Addresses
```typescript
// Direct API
GET /v2/data/trending-cas?timeWindow=24h&minMentions=10

// SDK  
await elfa.getTrendingCAs({ 
  timeWindow: '24h', 
  minMentions: 10 
});

// Direct API
GET /v2/data/trending-cas-twitter?timeWindow=24h&minMentions=10

// SDK
await elfa.getTrendingCAsTwitter({ 
  timeWindow: '24h', 
  minMentions: 10 
});
```

#### Account Stats
```typescript
// Direct API
GET /v2/account/smart-stats?username=elonmusk

// SDK
await elfa.getAccountSmartStats({ username: 'elonmusk' });
```

#### Mentions
```typescript
// Direct API
GET /v2/mentions?limit=50&offset=0

// SDK
await elfa.getMentions({ limit: 50, offset: 0 });
```

### V1 Legacy Endpoints (for backward compatibility)

#### Top Mentions
```typescript
// Direct V1 API
GET /v1/top-mentions?ticker=bitcoin&timeWindow=24h&pageSize=50

// SDK (V2 method)
await elfa.getTopMentions({ 
  ticker: 'bitcoin', 
  timeWindow: '24h', 
  pageSize: 50 
});

// SDK (V1 compatibility layer)
await v1Client.getTopMentions({ 
  ticker: 'bitcoin', 
  timeWindow: '24h', 
  pageSize: 50 
});
```

#### Search Mentions by Keywords
```typescript
// Direct V1 API
GET /v1/mentions/search?keywords=bitcoin&from=1640995200&to=1641081600&limit=10

// SDK (V2 method)
await elfa.getMentionsByKeywords({
  keywords: 'bitcoin',
  from: 1640995200,
  to: 1641081600,
  limit: 10
});

// SDK (V1 compatibility layer)
await v1Client.getMentionsByKeywords({
  keywords: 'bitcoin',
  from: 1640995200,
  to: 1641081600,
  limit: 10
});
```

#### V1 Trending Tokens
```typescript
// Direct V1 API
GET /v1/trending-tokens?timeWindow=24h&pageSize=50&minMentions=5

// SDK (V1 compatibility layer)
await v1Client.getTrendingTokens({ 
  timeWindow: '24h', 
  pageSize: 50,
  minMentions: 5 
});
```

#### V1 Account Stats
```typescript
// Direct V1 API
GET /v1/account/smart-stats?username=elonmusk

// SDK (V1 compatibility layer)
await v1Client.getAccountSmartStats({ username: 'elonmusk' });
```

## V1 Compatibility Layer

For users who had custom V1-style implementations, use the compatibility layer:

```typescript
import { V1CompatibilityLayer } from '@elfa-ai/sdk';

const client = new V1CompatibilityLayer({
  elfaApiKey: 'your-elfa-api-key',
  twitterApiKey: 'your-twitter-bearer-token',
  enableV1Behavior: true // Raw tweets by default
});

// V1-style method signatures
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

## Configuration Options

The SDK provides extensive configuration options:

```typescript
const elfa = new ElfaSDK({
  // Required
  elfaApiKey: 'your-elfa-api-key',
  
  // Optional enhancements
  twitterApiKey: 'your-twitter-bearer-token',
  fetchRawTweets: false, // Global setting
  
  // API configuration
  baseUrl: 'https://api.elfa.ai', // Custom base URL
  enhancementTimeout: 30000, // Twitter API timeout
  maxBatchSize: 100, // Max tweets per batch
  
  // Behavior
  strictMode: false, // Fail if Twitter unavailable
  respectRateLimits: true, // Auto-throttle
  debug: false // Debug logging
});
```

## Benefits of Migration

1. **Type Safety**: Full TypeScript definitions with IDE autocomplete
2. **Error Handling**: Specific error classes for different failure modes
3. **Rate Limiting**: Built-in respect for API rate limits
4. **Enhancement**: Optional Twitter API integration for raw content
5. **Consistency**: Unified response format across all endpoints
6. **Maintenance**: Regular updates and bug fixes
7. **Documentation**: Comprehensive examples and API reference

## Examples

The SDK includes comprehensive examples in the `/src/examples/` directory:

- **`basic.ts`**: Simple usage examples for all major endpoints
- **`enhanced.ts`**: Advanced usage with Twitter API enhancement
- **`migration.ts`**: Complete migration examples from raw API calls

```typescript
// Import and run examples
import { basicExamples, enhancedExamples } from '@elfa-ai/sdk/examples';

// Run basic API examples
await basicExamples();

// Run enhanced Twitter API examples  
await enhancedExamples();
```

## Need Help?

- 📖 [Full Documentation](https://docs.elfa.ai)
- 🔍 [View Examples](./src/examples/)
- 🐛 [Report Issues](https://github.com/elfa-ai/elfa-sdk-js/issues)
- 📧 [Email Support](mailto:support@elfa.ai)