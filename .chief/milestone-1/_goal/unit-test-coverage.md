# Goal: Unit Test Coverage

## Outcome

Comprehensive unit tests covering all core application code (components, hooks, utilities, server actions) with 70-80% code coverage.

## Why This Goal Matters

- Unit tests provide fast feedback during development
- Tests serve as documentation for expected behavior
- Catches bugs early in the development cycle

## Priority Test Areas

1. **Custom Hooks** - All hooks in `/hooks/` directory
2. **Utilities** - All functions in `/lib/` (excluding third-party wrappers)
3. **Zustand Stores** - All state management stores
4. **Server Actions** - Critical action functions in `/actions/`
5. **Components** - Business logic components (not UI primitives)

## Success Criteria

- 70-80% line coverage on: hooks, utils, stores, actions
- All custom hooks have at least one test
- All utility functions have at least one test
- Key user interactions have test coverage
- Tests are maintainable and not flaky

## Non-Goals

- Testing external API integrations (mocked)
- Testing third-party UI components (covered by their own tests)
- Snapshot testing (unless specifically needed)
