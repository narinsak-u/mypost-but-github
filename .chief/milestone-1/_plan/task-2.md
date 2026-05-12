# Task 2: Add Test Scripts to package.json

## Goal Reference

- `testing-infrastructure.md` - Test scripts in package.json

## Contract Reference

- `testing-setup.md` - Script specifications

## Work Description

### Update package.json

Add the following scripts to the `scripts` section of `package.json`:

```json
{
  "test:unit": "vitest run",
  "test:unit:watch": "vitest",
  "test:unit:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed",
  "test": "npm run test:unit && npm run test:e2e",
  "test:ci": "npm run test:unit:coverage && npm run build && npm run test:e2e"
}
```

### Verify Scripts

Run each script to verify it works:

```bash
npm run test:unit -- --version    # Should show Vitest version
npm run test:e2e -- --version     # Should show Playwright version
```

## Acceptance Criteria

- [ ] All 7 test scripts exist in package.json
- [ ] `npm run test:unit` executes without errors (may have 0 tests initially)
- [ ] `npm run test:e2e` executes without errors (may have 0 tests initially)
- [ ] No syntax errors in package.json
