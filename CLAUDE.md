# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Elfa AI SDK** - a TypeScript SDK for the Elfa API v2 that provides social intelligence for crypto. The SDK offers a dual API architecture combining Elfa V2 API with optional Twitter API enhancement, plus V1 compatibility for migration.

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

- **Dual Client Architecture**: `ElfaV2Client` (core API) + `TwitterClient` (enhancement)
- **Main SDK Class**: `ElfaSDK` orchestrates both clients with response enhancement
- **V1 Compatibility Layer**: `V1CompatibilityLayer` provides drop-in replacement for legacy code
- **Enhancement System**: `ResponseEnhancer` enriches V2 data with Twitter content when available

### Key Directories

- `src/client/` - Core SDK and API client implementations
- `src/types/` - TypeScript definitions for all APIs and responses
- `src/utils/` - HTTP utilities, error handling, pagination, and enhancement logic
- `src/compatibility/` - V1 migration and compatibility layer
- `src/examples/` - Usage examples for different scenarios
- `src/__tests__/` - Jest test suites

### Response Enhancement Pattern

The SDK uses a unique enhancement pattern where:

1. Primary data comes from Elfa V2 API (processed, formatted)
2. Optional Twitter API adds raw tweet content when `fetchRawTweets: true`
3. Enhanced responses include `data_source` field indicating enhancement level
4. Graceful degradation when Twitter API unavailable

### Error Handling Strategy

- Specific error classes: `ElfaApiError`, `TwitterApiError`, `ValidationError`, `RateLimitError`, `AuthenticationError`
- Twitter API failures don't break core functionality
- Configurable strict mode for enhanced error handling
- Built-in rate limiting and retry logic

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
- Optional Twitter Bearer token for content enhancement
- Configurable timeouts and batch sizes for API optimization
