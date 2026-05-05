# Testing Patterns

**Analysis Date:** 2026-05-06

## Test Framework

**Runner:** None configured

No test runner, test framework, or test configuration files exist in the project source. There is no `jest.config.*`, `vitest.config.*`, `mocha.*`, or `playwright.config.*` at the project root or within `src/` or `convex/`.

**Assertion Library:** None

**Run Commands:**
```bash
# No test scripts defined in package.json
npm run lint    # Only code-quality script available
```

The `package.json` `scripts` block contains only: `clean`, `dev`, `build`, `start`, `lint`, `convex:dev`. There is no `test` script.

## Test File Organization

**Location:** No test files exist in the project source.

Searching `src/**/*.test.*`, `src/**/*.spec.*`, `convex/**/*.test.*` returns no matches. All `.test.ts` / `.spec.ts` files found belong to `node_modules` (Convex SDK internal tests, Next.js font tests, etc.) — none are project-authored.

**Naming:** Not established.

**Structure:** Not established.

## Test Structure

Not established. No tests written for project code.

## Mocking

Not established. No mocking infrastructure configured.

## Fixtures and Factories

Not established. No test data helpers exist.

## Coverage

**Requirements:** None enforced.

No coverage thresholds, configuration, or reporting set up.

## Test Types

**Unit Tests:** Not present.

**Integration Tests:** Not present.

**E2E Tests:** Not present. No Playwright, Cypress, or similar framework detected.

## Convex Testing Notes

Convex provides a testing utilities package (`convex/testing`) and the installed `convex@1.15.0` SDK includes its own test suite (`node_modules/convex/src/**/*.test.ts`). These are internal SDK tests, not project tests.

To add Convex function tests in the future, the recommended approach is:
- Use `vitest` (Convex's preferred test runner)
- Import `convexTest` from `convex/testing`
- Run against an in-memory Convex instance

## Linting as Quality Gate

The only automated code-quality tool currently in use is ESLint via `next lint` (`eslint-config-next` ruleset). This checks for React/Next.js anti-patterns, accessibility basics, and import correctness but does not replace functional tests.

```bash
npm run lint    # Runs Next.js ESLint — the only current automated quality check
```

## Recommendations for Adding Tests

Given the current stack (Next.js 14, Convex, Zustand, Framer Motion), the natural testing setup would be:

**For Convex backend functions** (`convex/*.ts`):
- Framework: Vitest
- Config: `vitest.config.ts` at project root
- Pattern: `convex/*.test.ts` co-located with source

**For React components** (`src/components/*.tsx`):
- Framework: Vitest + React Testing Library
- Config: include jsdom environment
- Pattern: `src/components/__tests__/ComponentName.test.tsx`

**For utility functions** (`src/lib/*.ts`):
- Framework: Vitest
- Pattern: `src/lib/__tests__/utils.test.ts`
- Priority: `cn()`, `generateRoomCode()`, `formatTime()`, `formatDuration()` are pure functions — easiest to test immediately

---

*Testing analysis: 2026-05-06*
