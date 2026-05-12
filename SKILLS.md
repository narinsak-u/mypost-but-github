# Recommended Agent Skills

This project uses the [open-code skills system](https://opencode.ai) for AI-assisted development. Below are the recommended skills organized by priority.

## High Priority (Core Stack)

| Skill                           | When to Use                                                             |
| ------------------------------- | ----------------------------------------------------------------------- |
| **better-auth-best-practices**  | Setting up or modifying auth (server config, client, plugins, adapters) |
| **tanstack-query**              | Data fetching hooks, cache invalidation, infinite queries               |
| **react-hooks-optimizer**       | Writing or refactoring hooks, fixing re-renders, state management       |
| **vercel-react-best-practices** | Performance optimization, data fetching patterns, bundle analysis       |
| **tailwind-design-system**      | Creating components, design tokens, responsive patterns                 |

## Medium Priority (Quality & Maintenance)

| Skill                                 | When to Use                                              |
| ------------------------------------- | -------------------------------------------------------- |
| **code-review-and-quality**           | Before merging PRs, reviewing significant code changes   |
| **systematic-debugging**              | Investigating bugs, test failures, unexpected behavior   |
| **code-simplification**               | Refactoring complex code, reducing duplication           |
| **web-design-guidelines**             | Auditing UI for accessibility, UX best practices         |
| **email-and-password-best-practices** | Configuring email verification, password reset, policies |

## Future-Ready

| Skill                                        | When to Use                                   |
| -------------------------------------------- | --------------------------------------------- |
| **two-factor-authentication-best-practices** | Adding MFA/2FA with authenticator apps        |
| **organization-best-practices**              | Multi-tenant orgs, teams, custom roles (RBAC) |
| **better-auth-security-best-practices**      | Rate limiting, CSRF, session hardening        |

## Usage

Skills auto-trigger based on task context. To manually load a skill:

```bash
# In conversation, mention the skill name or topic and the agent will detect it
```

Published at: https://opencode.ai (see docs for skill installation)
