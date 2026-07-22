# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Elfa AI SDK** - a TypeScript SDK for the Elfa API v2 that provides social intelligence for crypto: data endpoints, AI chat, and the Auto and Trade engines.

## Development Commands

```bash
# Build the project (tsup with dual format output)
npm run build

# Development with watch mode
npm run dev

# Testing
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage reports

# Code Quality
npm run lint               # ESLint TypeScript files
npm run lint:fix           # Auto-fix linting issues
npm run typecheck          # TypeScript type checking

# Pre-publish validation
npm run prepublishOnly     # Runs build + test + lint
```

## Required Testing After Changes

Always run these commands after making code changes:

```bash
npm test                   # Verify all tests pass
npm run typecheck          # Ensure TypeScript compilation
npm run lint               # Check code style
```

## Architecture Overview

### Core Structure

- **Main SDK Class**: `ElfaSDK` exposes the data endpoints and `chat`, plus `auto` and `trade` sub-clients
- **Clients**: `ElfaV2Client` (data + chat), `AutoClient` (`/v2/auto/*`), `TradeClient` (`/v2/trade/*`)
- **Signing**: HMAC-SHA256 request signing (`utils/hmac`) for Auto/Trade mutations

### Key Directories

- `src/client/` - Core SDK and API client implementations
- `src/types/` - TypeScript definitions for all APIs and responses
- `src/utils/` - HTTP, HMAC signing, SSE, error handling, and pagination
- `src/examples/` - Usage examples for different scenarios
- `src/__tests__/` - Jest test suites

### Error Handling Strategy

- Specific error classes: `ElfaApiError`, `ValidationError`, `RateLimitError`, `AuthenticationError`, `NetworkError`
- Idempotent requests retry with backoff; non-idempotent mutations are not auto-retried
- Built-in rate-limit reset parsing

## TypeScript Configuration

- Target: ES2020 with CommonJS modules
- Strict mode enabled with comprehensive type checking
- Dual format output (CJS + ESM) via tsup
- Source maps and declarations included

## Testing Setup

- Jest with ts-jest preset
- Coverage collection excludes examples and test files
- Tests located in `__tests__/` directory
- Pattern matching for `.test.ts` and `.spec.ts` files

## Key Implementation Notes

- All imports use `.js` extensions for proper ESM compatibility
- Axios for HTTP requests with custom error transformation
- Pagination helper utilities for large result sets
- HMAC signing + SSE streaming for the Auto engine
- The SDK returns processed data and tweet links only; it does not expose raw tweet content
