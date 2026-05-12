# Contract: Testing Infrastructure Configuration

## Dependencies

- None (new infrastructure)

## Technical Specification

### Vitest Configuration

- **Test Framework**: Vitest v2.x
- **Coverage Provider**: v8 (built-in)
- **Environment**: node (for utils/hooks), jsdom (for components)
- **File Pattern**: `**/*.test.{ts,tsx}`
- **Test Directory**: Feature-based structure (e.g., `hooks/__tests__/`)

### Playwright Configuration

- **Framework**: Playwright v1.48+
- **Browser**: Chromium (default), WebKit, Firefox (optional)
- **Base URL**: `http://localhost:3000`
- **Test Directory**: `e2e/`
- **File Pattern**: `**/*.spec.ts`

### package.json Scripts

```json
{
  "test:unit": "vitest run",
  "test:unit:watch": "vitest",
  "test:unit:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed",
  "test": "npm run test:unit && npm run test:e2e"
}
```

### CI Configuration (GitHub Actions)

- Trigger: on `push` to `main` and `pull_request`
- Jobs:
  1. Unit tests with coverage
  2. E2E tests (requires `npm run build` first)
- Artifacts: test reports, coverage reports

## Acceptance Criteria

- [ ] `npm run test:unit` executes without errors
- [ ] `npm run test:e2e` executes without errors
- [ ] Coverage report generated at `coverage/`
- [ ] Playwright HTML report generated
- [ ] CI workflow file exists at `.github/workflows/test.yml`
