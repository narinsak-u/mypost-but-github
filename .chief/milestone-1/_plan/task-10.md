# Task 10: Run Coverage Report and Verify Threshold

## Goal Reference

- `unit-test-coverage.md` - 70-80% coverage target
- `testing-infrastructure.md` - Coverage verification

## Contract Reference

- `testing-setup.md` - Coverage threshold enforcement

## Work Description

### Run Coverage Report

```bash
npm run test:unit:coverage
```

### Verify Coverage Thresholds

The Vitest configuration should enforce:

- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

### Check Coverage Report

1. Open `coverage/index.html` in a browser to view the full report
2. Check `coverage/coverage-summary.json` for machine-readable data

### If Coverage is Below Threshold

If coverage is below 70%, identify low-coverage areas:

- Run `npm run test:unit:coverage -- --reporter=verbose` for detailed output
- Focus on adding tests for uncovered files

### Coverage Report Interpretation

```
-------------------------------|---------|----------|---------|---------|
File                           | %       | % Stmts  | % Branch | % Funcs |
-------------------------------|---------|----------|---------|---------|
hooks/use-get-posts.ts         | 85.00   | 85.00    | 75.00    | 80.00   |
hooks/use-create-post.ts      | 90.00   | 90.00    | 80.00    | 85.00   |
lib/utils.ts                   | 100.00  | 100.00   | 100.00   | 100.00  |
store/use-saved-tab.ts         | 100.00  | 100.00   | 100.00   | 100.00  |
-------------------------------|---------|----------|---------|---------|
TOTAL                          | 72.50   | 72.50    | 70.00    | 75.00   |
```

### Final Verification Checklist

- [ ] Run `npm run test:unit:coverage` with no failures
- [ ] Coverage meets or exceeds 70% on all metrics
- [ ] Coverage report artifacts available
- [ ] CI pipeline passes with coverage check
- [ ] No uncovered critical paths remain

## Acceptance Criteria

- [ ] `npm run test:unit:coverage` exits with code 0
- [ ] All coverage thresholds (lines, functions, branches, statements) >= 70%
- [ ] Coverage report generated in `coverage/` directory
- [ ] No high-priority uncovered code paths
