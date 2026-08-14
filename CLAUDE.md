# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Elfa AI SDK** - a TypeScript SDK for the Elfa API v2 that provides social intelligence for crypto: data endpoints, AI chat, and the Auto condition engine.

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

## Before Merging a PR

**A green check does not mean a clean review.** Sourcery reviews this repo and
posts its findings as a `COMMENTED` review — which does not block, and whose
check run reports `pass` regardless of what it found. `gh pr checks` showing all
green proves the reviewer _ran_, not that it had nothing to say.

Read the actual review content before merging:

```bash
gh api repos/elfa-ai/elfa-sdk-js/pulls/<n>/reviews  --jq '.[]|"[\(.user.login)] \(.body)"'
gh api repos/elfa-ai/elfa-sdk-js/pulls/<n>/comments --jq '.[]|"\(.path):\(.line) \(.body)"'
gh pr view <n> --comments
```

Triage every finding: fix it, or reply on the comment saying why not. This is
not hypothetical — #95, #96 and #97 were merged on the strength of a green
Sourcery check, and all three carried valid findings that had to be fixed
afterwards in #98 (coverage upload keyed to a version string, an untested
`NaN` guard, a fragile cast).

**Squash merges discard commit authorship.** GitHub attributes the squashed
commit to whoever opened the PR. When a PR contains someone else's commits, put
a `Co-authored-by:` trailer in your own commit _before_ merging — afterwards the
attribution cannot be recovered without rewriting `main`. #96 kept its
contributor credit this way; #97 lost it.

## Architecture Overview

### Core Structure

- **Main SDK Class**: `ElfaSDK` exposes the data endpoints, `chat` and `chatStream`, plus the `auto` sub-client
- **Clients**: `ElfaV2Client` (data + chat), `AutoClient` (`/v2/auto/*`)
- **Signing**: HMAC-SHA256 request signing (`utils/hmac`) for Auto mutations

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
- HMAC signing for the Auto engine; SSE streaming for chat and Auto notifications
- The SDK returns processed data and tweet links only; it does not expose raw tweet content
