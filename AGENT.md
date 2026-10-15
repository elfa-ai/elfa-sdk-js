# AGENT.md

This file provides universal base instructions for AI coding assistants working with this repository. These instructions should be referenced by all agent-specific configuration files (CLAUDE.md, cursor rules, GitHub Copilot settings, etc.).

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

## Project Context

**Elfa AI SDK** - TypeScript SDK for the Elfa API: v2 social intelligence for crypto markets, and v3 events, calls and market data across crypto and equities.

### Core Architecture

- **Clients**: `ElfaV2Client` (data + chat), `AutoClient` (`/v2/auto/*`), `V3Client` (`/v3/*`)
- **Chat sources**: `chat`/`chatStream` take `includeSources`; links arrive on `data.sources` / the final `complete` event
- **Streaming**: SSE for chat and Auto streams
- **Data policy**: processed data + tweet links only; no raw tweet content exposed

## API v3

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
const [match] = entities;
if (!match) throw new Error("no match for btc");
const id = match.id; // Bitcoin
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
  on the Pay-as-you-go and Grow plans until 31 October 2026. A Free key can call only `/v3/key-status`.
- Unknown query parameters are a `400`, so each method throws `ValidationError`
  for a parameter its endpoint does not declare. List parameters are arrays, sent
  comma-separated; an empty array throws `ValidationError`.
- On a `400`, `message` reads `Invalid parameters`; the reasons are in
  `error.details.details[]`.
- `PaginationHelper` pages v2 only. For v3, pass `nextCursor` back as `cursor`.

## Development Standards

### Code Style & Quality

- **TypeScript**: Strict mode, comprehensive typing, ES2020 target
- **File Extensions**: Use `.js` extensions in imports for ESM compatibility
- **Error Handling**: Specific error classes with inheritance hierarchy
- **Testing**: Jest, with mocked unit tests plus live integration tests gated behind `ELFA_API_KEY`
- **Linting**: ESLint with TypeScript support

### Key Patterns to Follow

- **Configuration**: Options-based initialization with validation
- **Pagination**: Helper utilities for cursor-based and page-based pagination
- **Rate Limiting**: Built-in respect for API limits and retry logic

### Architecture Constraints

- **Type Safety**: All responses properly typed
- **Modular Design**: Clear separation between clients and utils

## File Organization

```
src/
├── client/          # Core SDK and API client implementations
├── types/           # TypeScript definitions (hand-written; see note below)
├── utils/           # HTTP, SSE, errors, pagination
├── examples/        # Usage examples and demos
└── __tests__/       # Test suites
```

## API Update Workflow

`swagger.json` is a reference copy of the backend's OpenAPI schema. **Types are not
generated from it** — everything under `src/types/` is hand-written and must be
updated by hand when the API changes. Refreshing the schema alone changes nothing
about the SDK's behaviour or types.

1. Backend generates the OpenAPI schema via TSOA
2. CI/CD publishes it to `https://docs.elfa.ai/swagger/swagger.json`
3. Refresh the local copy with `npm run update-schema`
4. Diff it, then update `src/types/` and the affected client by hand

### Schema Commands

```bash
npm run update-schema         # Overwrite swagger.json from docs.elfa.ai
npm run check-schema-updates  # Diff the published schema against the local copy
```

## Common Tasks

### Adding New API Endpoints

1. Update `swagger.json` (`npm run update-schema`) and diff it for the new shape
2. Add method to the appropriate client (`ElfaV2Client`, `AutoClient` or `V3Client`)
3. Add types under `src/types/` by hand — nothing generates them
4. Update the main SDK class (`ElfaSDK`) if exposed there
5. Add tests
6. Update documentation and examples

### Updating Dependencies

- **Production deps**: Minimal, security-focused updates only
- **Dev deps**: Regular updates for tooling improvements
- **Type definitions**: Keep in sync with runtime dependencies

### Before Merging a PR

**A green check does not mean a clean review.** Sourcery posts findings as a
`COMMENTED` review: it does not block, and its check run reports `pass` whatever
it found. All-green `gh pr checks` proves the reviewer ran, nothing more.

```bash
gh api repos/elfa-ai/elfa-sdk-js/pulls/<n>/reviews  --jq '.[]|"[\(.user.login)] \(.body)"'
gh api repos/elfa-ai/elfa-sdk-js/pulls/<n>/comments --jq '.[]|"\(.path):\(.line) \(.body)"'
```

Fix each finding or reply saying why not. #95/#96/#97 were merged off a green
check with unread findings; all three were valid and needed a follow-up (#98).

**Squash merges discard commit authorship** — the squashed commit is attributed
to whoever opened the PR. If a PR carries someone else's commits, add a
`Co-authored-by:` trailer to your own commit before merging; afterwards it
cannot be fixed without rewriting `main`.

### Release Process

Releases run through `.github/workflows/release.yml`, which publishes to npm and
creates the GitHub release. Do not publish by hand.

1. Land the version bump in `package.json` and the matching `## <version>` entry
   in `CHANGELOG.md` — the release body is extracted from that section
2. Trigger **Actions → Release → Run workflow** from `main`, passing the same
   version string (`validate` fails the run if it disagrees with `package.json`)
3. The workflow runs typecheck, lint, tests and build, then publishes and tags

**Either trigger works — pushing a `v*.*.*` tag or dispatching from `main`.** This
previously said tags were blocked, because the `production` environment's
deployment policy allowed only the `dev` and `main` branches and a tag ref matched
no rule. The policy now includes a `tag v*` rule, and 5.1.0 and 6.0.0 were both
released by tag push. Verify with:

```bash
gh api repos/elfa-ai/elfa-sdk-js/environments/production/deployment-branch-policies
```

If you release by tag, tag the commit whose `package.json` already carries that
version — `validate` compares the two and fails the run on a mismatch. That
ordering matters when a version bump is still in flight: 5.1.0 had to be tagged
off `main` _before_ the 6.0.0 bump merged, or the tag would have found 6.0.0 in
`package.json`.

**Publishing uses OIDC trusted publishing — there is no npm token.** npm mints a
short-lived credential from the workflow's id-token, so nothing needs rotating.
The trust relationship is configured on npmjs.com against three values that must
keep matching the workflow:

| npm setting       | Value         |
| ----------------- | ------------- |
| Repository        | `elfa-sdk-js` |
| Workflow filename | `release.yml` |
| Environment name  | `production`  |

Renaming the workflow file or the `production` environment breaks publishing
until the npm-side config is updated to match. Publishing requires
`Node >= 22.14.0` and `npm >= 11.5.1`, which is why the publish job pins a newer
Node than the test matrix and upgrades npm before publishing. Provenance
attestations are generated automatically; `--provenance` is not needed.

If publishing ever fails with `npm error 404 ... PUT`, that is an auth failure,
not a missing package — npm withholds 401/403 so it does not disclose whether a
package exists.

## Security Considerations

- **API Keys**: Never commit API keys or secrets
- **Rate Limiting**: Respect all API rate limits
- **Error Messages**: Don't expose sensitive data in error messages
- **Dependencies**: Regular security audits of dependencies

## Agent-Specific Notes

### When Making Changes

- Always run tests before committing: `npm test`
- Ensure types are valid: `npm run typecheck`
- Check for linting issues: `npm run lint`
- Verify build succeeds: `npm run build`

### Common Gotchas

- Import paths must use `.js` extensions for ESM compatibility
- Error classes use name-based checking (not instanceof) for better compatibility
- Optional properties require careful undefined checking due to `exactOptionalPropertyTypes: false`

### Testing Philosophy

- Test public APIs, not internal implementation details
- Mock external API calls; gate live integration tests behind `ELFA_API_KEY`
- Test error conditions and edge cases
- Maintain high coverage on core functionality

This base instruction set should be referenced by all agent-specific configuration files to ensure consistent development practices across different AI coding assistants.
