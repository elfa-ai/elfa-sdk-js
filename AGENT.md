# AGENT.md

This file provides universal base instructions for AI coding assistants working with this repository. These instructions should be referenced by all agent-specific configuration files (CLAUDE.md, cursor rules, GitHub Copilot settings, etc.).

## Project Context

**Elfa AI SDK** - TypeScript SDK for Elfa API v2 providing social intelligence for crypto markets.

### Core Architecture

- **Clients**: `ElfaV2Client` (data + chat), `AutoClient` (`/v2/auto/*`), `TradeClient` (`/v2/trade/*`)
- **Signing**: HMAC-SHA256 for Auto/Trade mutations; SSE for Auto streams
- **Data policy**: processed data + tweet links only; no raw tweet content exposed

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
├── utils/           # HTTP, HMAC signing, SSE, errors, pagination
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
2. Add method to the appropriate client (`ElfaV2Client`, `AutoClient`, or `TradeClient`)
3. Add types under `src/types/` by hand — nothing generates them
4. Update the main SDK class (`ElfaSDK`) if exposed there
5. Add tests
6. Update documentation and examples

### Updating Dependencies

- **Production deps**: Minimal, security-focused updates only
- **Dev deps**: Regular updates for tooling improvements
- **Type definitions**: Keep in sync with runtime dependencies

### Release Process

Releases run through `.github/workflows/release.yml`, which publishes to npm and
creates the GitHub release. Do not publish by hand.

1. Land the version bump in `package.json` and the matching `## <version>` entry
   in `CHANGELOG.md` — the release body is extracted from that section
2. Trigger **Actions → Release → Run workflow** from `main`, passing the same
   version string (`validate` fails the run if it disagrees with `package.json`)
3. The workflow runs typecheck, lint, tests and build, then publishes and tags

**Dispatch from `main` — do not push a `v*.*.*` tag.** The workflow declares that
tag trigger, but `publish` runs in the `production` environment, whose deployment
policy allows only the `dev` and `main` branches. A tag ref matches no branch rule,
so a tag-triggered run is blocked at the environment gate. Every release to date
has used `workflow_dispatch`.

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
until the npm-side config is updated to match. Publishing requires Node

> = 22.14.0 and npm >= 11.5.1, which is why the publish job pins a newer Node than
> the test matrix and upgrades npm before publishing. Provenance attestations are
> generated automatically; `--provenance` is not needed.

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
- HMAC-signed mutations must sign the exact JSON bytes that are sent (see `utils/hmac`)

### Testing Philosophy

- Test public APIs, not internal implementation details
- Mock external API calls; gate live integration tests behind `ELFA_API_KEY`
- Test error conditions and edge cases
- Maintain high coverage on core functionality

This base instruction set should be referenced by all agent-specific configuration files to ensure consistent development practices across different AI coding assistants.
