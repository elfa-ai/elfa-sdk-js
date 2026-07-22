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
- **Testing**: Jest with comprehensive test coverage (currently 38 tests)
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
├── types/           # TypeScript definitions (generated from OpenAPI)
├── utils/           # HTTP, HMAC signing, SSE, errors, pagination
├── examples/        # Usage examples and demos
└── __tests__/       # Test suites
```

## API Update Workflow

The project uses an automated schema update process:

1. Backend generates OpenAPI schema via TSOA
2. CI/CD publishes schema to docs site: `https://staging.elfa-docs.pages.dev/swagger/swagger.json`
3. SDK can be updated via script: `npm run update-schema`
4. Type definitions regenerated from new schema

### Schema Update Commands

```bash
npm run update-schema     # Fetch latest schema and regenerate types
npm run generate-types    # Regenerate types from existing schema
npm run validate-schema   # Validate current schema compatibility
```

## Common Tasks

### Adding New API Endpoints

1. Update `swagger.json` (`npm run update-schema`)
2. Add method to the appropriate client (`ElfaV2Client`, `AutoClient`, or `TradeClient`)
3. Add types under `src/types/`
4. Update the main SDK class (`ElfaSDK`) if exposed there
5. Add tests
6. Update documentation and examples

### Updating Dependencies

- **Production deps**: Minimal, security-focused updates only
- **Dev deps**: Regular updates for tooling improvements
- **Type definitions**: Keep in sync with runtime dependencies

### Release Process

1. Update version in package.json
2. Run `npm run prepublishOnly` (builds, tests, lints)
3. Verify dist/ output is correct
4. Create GitHub release with changelog
5. Publish to npm registry

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
