# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## This repository is public

Everything here is world-readable and permanent: code, comments, commit messages, branch names, PR titles and descriptions, review replies and issue comments. Forks and archives keep copies after a force-push, and GitHub keeps every earlier version of an edited PR description where anyone can read it. So never write any of the following, in the repo or on GitHub:

- names of Elfa's private repositories, or links to their PRs, issues or commits (`org/repo#123`, `repo#123`, URLs)
- internal service names or codenames. Name the public thing instead: "the API", "Auto", "the published spec", "docs.elfa.ai"
- paths into private source code, internal hostnames, staging or preview URLs
- teammates' names in prose, internal threads or decisions ("X confirmed in-thread"). A `Co-authored-by:` trailer crediting a contributor is fine and must be kept
- anything not yet live on docs.elfa.ai: unreleased, flag-gated or staging-only work
- deployment, infrastructure, incident or business detail
- secrets, local machine paths, personal editor or agent config (`.mcp.json`, `.claude/`)

To say where a change came from, cite the public source ("matches the spec published on docs.elfa.ai"), not the internal change behind it. Before pushing, reread the diff, commit messages and PR description as an outsider would. If a sentence would tell a competitor something about how Elfa builds software, cut it.

## Project Overview

This is the **Elfa AI SDK** - a TypeScript SDK for the Elfa API v2 and v3 that provides social intelligence for crypto: data endpoints, AI chat, the Auto condition engine, and API v3 events, calls and market data across crypto and equities.

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

- **Main SDK Class**: `ElfaSDK` exposes the data endpoints, `chat` and `chatStream`, plus the `auto` and `v3` sub-clients
- **Clients**: `ElfaV2Client` (data + chat), `AutoClient` (`/v2/auto/*`), `V3Client` (`/v3/*`)
- **Chat sources**: `chat`/`chatStream` take `includeSources`; links arrive on `data.sources` / the final `complete` event

### API v3

`ElfaSDK.v3` (`V3Client`) wraps API v3: entities; events, storylines and arcs;
call books, mindshare and trending contracts; calls, call episodes and
positioning; top accounts; key status. One `GET` method per `/v3` endpoint in
`swagger.json`, nothing else. Types live in `src/types/v3.ts`.

```typescript
const { entities } = await elfa.v3.getEntities({
  q: "btc",
  entityType: ["token"],
  limit: 1,
});
const id = entities[0].id; // Bitcoin
const from = Math.floor(Date.now() / 1000) - 86400;
const { events } = await elfa.v3.getEvents({
  entityIds: [id],
  from,
  limit: 10,
});
const positioning = await elfa.v3.getPositioning({ entityId: id });
```

- Times are unix seconds; milliseconds are a `400`. `from` is required on list
  endpoints except when fetching by id or searching with `q`, and
  `getEvents({ sort: "relevant" })` refuses it; entities, arcs, positioning and
  top accounts take no range; mindshare takes a `period` and an optional `to`.
- Entity filters take ids from `getEntities`, never tickers.
- History depends on the plan (30 days PAYG, 60 days Grow, 2 years Enterprise);
  `getKeyStatus()` returns its start as `historyFrom`.
- PAYG, Grow and Enterprise keys can call every v3 endpoint; the v3 API is free
  on the Pay-as-you-go and Grow plans. A Free key can call only `/v3/key-status`.
- Unknown query parameters are a `400`, so each method throws `ValidationError`
  for a parameter its endpoint does not declare. List parameters are arrays, sent
  comma-separated; an empty array throws `ValidationError`.
- On a `400`, `message` reads `Invalid parameters`; the reasons are in
  `error.details.details[]`.
- `PaginationHelper` pages v2 only. For v3, pass `nextCursor` back as `cursor`.

### Key Directories

- `src/client/` - Core SDK and API client implementations
- `src/types/` - TypeScript definitions for all APIs and responses
- `src/utils/` - HTTP, SSE, error handling, and pagination
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
- SSE streaming for chat and Auto notifications
- The SDK returns processed data and tweet links only; it does not expose raw tweet content
