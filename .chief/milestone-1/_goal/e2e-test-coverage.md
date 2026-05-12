# Goal: E2E Test Coverage

## Outcome

End-to-end tests covering core user journeys using Playwright, ensuring critical functionality works in a real browser environment.

## Why This Goal Matters

- E2E tests validate the entire application stack
- Catches integration issues that unit tests miss
- Simulates real user behavior

## Priority Test Scenarios

### Authentication Flow

- Sign up with email/password
- Sign in with email/password
- Sign out
- Session persistence

### Post Management

- Create a new post with text content
- Create a post with image attachment
- View post list (feed)
- Delete own post
- Edit own post

### Interaction Features

- Like/unlike a post
- Comment on a post
- Delete own comment
- Save/unsave a post

### User Profile

- View own profile
- View other user's profile
- Edit profile (name, bio, avatar)

## Success Criteria

- All core user flows have automated E2E tests
- Tests run in CI on every PR
- Tests are reliable (no flakiness)
- Playwright report generated on test run

## Non-Goals

- Cross-browser testing (focus on Chromium first)
- Performance assertions
- Accessibility testing (separate future milestone)
- Visual comparisons
