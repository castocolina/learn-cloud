# Testing Guide

**Comprehensive testing strategy, best practices, and infrastructure for the Cloud-Native Learning Platform.**

> **📚 This guide has been segmented for better navigation and agent consumption. Each section is optimized for specific roles.**

---

## Quick Navigation

| Document                                               | Target Audience            | Description                                              | Lines |
| ------------------------------------------------------ | -------------------------- | -------------------------------------------------------- | ----- |
| **[infrastructure.md](./infrastructure.md)**           | All developers, QA         | Test infrastructure, environments, project config        | ~300  |
| **[unit-testing.md](./unit-testing.md)**               | Developers, test-architect | Unit test patterns, TestSetup, race condition prevention | ~400  |
| **[e2e-testing.md](./e2e-testing.md)**                 | Developers, test-architect | E2E patterns, Playwright, flakiness prevention           | ~600  |
| **[validation-strategy.md](./validation-strategy.md)** | All, validation-enforcer   | 3-tier validation, execution strategy                    | ~200  |
| **[ci-cd.md](./ci-cd.md)**                             | DevOps, CI/CD engineers    | Clean environment, snapshots, server management          | ~100  |
| **[troubleshooting.md](./troubleshooting.md)**         | All                        | Common issues, quick reference                           | ~150  |

---

## Overview

### Current Metrics

| Metric              | Value                 | Notes                        |
| ------------------- | --------------------- | ---------------------------- |
| **Unit Tests**      | 494 tests (25 files)  | ~30-90s execution            |
| **E2E Tests**       | 260 tests (14 files)  | ~1-3min execution            |
| **Test Code**       | ~15,735 lines         | Both unit and E2E            |
| **Project Status**  | 8/15 components (53%) | Feature development progress |
| **Growth Estimate** | +30% (~140 tests)     | Remaining 7 components       |

### Test Philosophy

**Isolation First**: Every test must run independently without interfering with other tests or production code.

**Parallel Safety**: Tests must be safe to run in parallel, which requires careful resource management and unique identifiers.

**CI/CD Ready**: Tests must work in clean environments without pre-existing files or state.

**Debug Friendly**: Failed tests must preserve artifacts for investigation.

---

## Getting Started

### For New Developers

1. **Start here:** [infrastructure.md](./infrastructure.md) - Understand test setup and environments
2. **Unit testing:** [unit-testing.md](./unit-testing.md) - Learn TestSetup patterns
3. **E2E testing:** [e2e-testing.md](./e2e-testing.md) - Playwright and flakiness prevention
4. **Validation:** [validation-strategy.md](./validation-strategy.md) - 3-tier validation workflow

### For Specific Tasks

| Task               | Document                                                           |
| ------------------ | ------------------------------------------------------------------ |
| Writing unit tests | [unit-testing.md](./unit-testing.md#best-practices)                |
| Writing E2E tests  | [e2e-testing.md](./e2e-testing.md#best-practices)                  |
| Fixing flaky tests | [e2e-testing.md](./e2e-testing.md#e2e-flakiness-prevention)        |
| Running validation | [validation-strategy.md](./validation-strategy.md#3-tier-approach) |
| CI/CD setup        | [ci-cd.md](./ci-cd.md)                                             |
| Troubleshooting    | [troubleshooting.md](./troubleshooting.md)                         |

---

## Test Commands (Quick Reference)

```bash
# Unit tests
pnpm run test                    # Run all unit tests
pnpm run test <file>             # Run specific test file
pnpm run test -t "pattern"       # Run tests matching pattern
pnpm run test --watch            # Watch mode

# E2E tests
pnpm run test:e2e                # Run all E2E tests
pnpm run test:e2e <file>         # Run specific E2E test
pnpm run test:e2e:ui             # Open Playwright UI
pnpm run test:e2e --update-snapshots  # Update visual snapshots

# Validation
make check-wip                   # Quick validation (modified files only)
pnpm run lint                    # Run linter
pnpm run check                   # TypeScript check
```

---

## Additional Resources

- **[Development Guide](../guides/SVELTE-DEVELOPMENT.md)** - Development workflows and quality checks
- **[Vitest Documentation](https://vitest.dev/)** - Unit testing framework
- **[Playwright Documentation](https://playwright.dev/)** - E2E testing framework
- **[@testing-library/svelte](https://testing-library.com/docs/svelte-testing-library/intro/)** - Component testing utilities

---

**Last Updated**: 2025-01-17
**Test Metrics**: 494 unit tests, 260 E2E tests (8/15 components complete)
