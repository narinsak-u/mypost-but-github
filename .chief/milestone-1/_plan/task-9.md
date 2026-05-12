# Task 9: Configure GitHub Actions CI Workflow

## Goal Reference

- `testing-infrastructure.md` - CI/CD pipeline configured

## Contract Reference

- `testing-setup.md` - CI configuration

## Work Description

### Create GitHub Actions Directory

```
.github/
└── workflows/
    └── test.yml
```

### Create CI Workflow File

```yaml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests with coverage
        run: npm run test:unit:coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
        env:
          CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### Update package.json for CI

Ensure the build script exists:

```json
{
  "build": "next build"
}
```

## Acceptance Criteria

- [ ] `.github/workflows/test.yml` exists
- [ ] Workflow has 2 jobs: unit-tests and e2e-tests
- [ ] Unit tests run with coverage
- [ ] E2E tests run after build
- [ ] Workflow triggers on push to main and PRs
