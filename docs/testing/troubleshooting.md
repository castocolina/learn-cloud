# Testing Troubleshooting Guide

**Common issues, solutions, and quick reference for testing problems.**

> **📚 Part of [Testing Guide](./README.md)** - See complete guides: [unit-testing.md](./unit-testing.md), [e2e-testing.md](./e2e-testing.md)

---

## Common Issues

### Issue 1: Test Fails with "File Already Exists"

**Symptom**: Tests pass individually but fail when run together.

**Cause**: Tests are writing to the same file path.

**Solution**: Use TestSetup with unique IDs:

```typescript
const testSetup = new TestSetup("scripts", `unique-${Date.now()}`);
const outputPath = join(testSetup.tempDir, "output.json");
```

**See**: [unit-testing.md - Race Condition Prevention](./unit-testing.md#race-condition-prevention)

---

### Issue 2: E2E Test Fails with `ERR_CONNECTION_REFUSED`

**Symptom**: `page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173`

**Cause**: Dev server not started or port conflict.

**Solutions**:

1. Ensure `playwright.config.ts` has `webServer` configured
2. Use relative URLs: `page.goto("/")` not `page.goto("http://localhost:5173/")`
3. Check if port 5173 is available: `lsof -i :5173`

**See**: [e2e-testing.md - Best Practices](./e2e-testing.md#best-practices)

---

### Issue 3: Snapshot Test Fails After UI Change

**Symptom**: `expect(element).toHaveScreenshot()` fails with pixel differences.

**Cause**: Intentional UI change or unintentional regression.

**Solution**:

1. Review the visual diff: `pnpm exec playwright show-report tmp/test/e2e/playwright-report`
2. If change is intentional: `pnpm run test:e2e --update-snapshots`
3. Commit the updated snapshots to git

**See**: [e2e-testing.md - Playwright Snapshots](./e2e-testing.md#best-practices)

---

### Issue 4: Tests Pass Locally but Fail in CI

**Symptom**: All tests pass on your machine but fail in GitHub Actions.

**Common Causes**:

1. **Missing snapshots in git**: Commit all files in `*.spec.ts-snapshots/` directories
2. **Hardcoded paths**: Using absolute paths that don't exist in CI
3. **Environment differences**: Different screen sizes, fonts, or rendering

**Solution**:

```bash
# Check for uncommitted snapshots
git status src/test/e2e/

# Commit them if missing
git add src/test/e2e/**/*-snapshots/
git commit -m "test: add missing E2E snapshots"
```

**See**: [ci-cd.md - Common CI/CD Issues](./ci-cd.md#common-cicd-issues)

---

### Issue 5: `cleanupIfPassed()` Not Removing Files

**Symptom**: `tmp/test/unit/` directory growing with old test files.

**Cause**: Tests are failing, so files are preserved for debugging.

**Solution**:

1. Fix the failing tests
2. Or force cleanup: `rm -rf tmp/test/unit/`
3. Or use `testSetup.forceCleanup()` in `afterAll()` hook

**See**: [unit-testing.md - TestSetup Pattern](./unit-testing.md#testsetup-pattern)

---

### Issue 6: Test Passes But Files Not Cleaned Up

**Symptom**: Tests pass successfully but `tmp/test/unit/` directories remain with test artifacts.

**Cause**: `cleanupIfPassed(context)` called from `try-finally` block or inside test body where `context.task.result.state` is not yet set.

**Diagnosis**:

```bash
# Check for leftover test directories
ls -la tmp/test/unit/scripts/

# Example output showing the problem:
# flatnav-malformed-1762539181667/    ← Should have been cleaned
# menu-validation-1762539182811/       ← Should have been cleaned
```

**Solutions**:

1. **Move cleanup to afterEach** (preferred):

   ```typescript
   // Remove try-finally, use proper lifecycle hooks
   afterEach((context) => {
   	testSetup.cleanupIfPassed(context);
   });
   ```

2. **Use forceCleanup() after assertions** (for inline setup):

   ```typescript
   it("test", async () => {
   	const setup = new TestSetup("scripts", "test");
   	await setup.setup();

   	// ... test assertions ...
   	expect(result).toBe(true);

   	// Cleanup immediately after assertions pass
   	setup.forceCleanup();
   });
   ```

3. **Manual cleanup**:
   ```bash
   # Remove all test artifacts
   rm -rf tmp/test/unit/scripts/*
   ```

**Root cause**: Vitest's test lifecycle sets `context.task.result.state` AFTER the test function completes, not during execution.

**See**: [unit-testing.md - TestSetup Pattern](./unit-testing.md#testsetup-pattern)

---

### Issue 7: Flaky E2E Tests

**Symptom**: Tests pass sometimes, fail randomly.

**Common Causes**:

1. **Hard-coded timeouts** - `page.waitForTimeout()`
2. **Race conditions** - Not waiting for state changes
3. **Rapid state changes** - Multiple clicks without waiting

**Solutions**:

See comprehensive flakiness prevention guide: [e2e-testing.md - E2E Flakiness Prevention](./e2e-testing.md#e2e-flakiness-prevention)

**Quick fixes**:

- Replace `page.waitForTimeout()` with `expect.poll()` or helper functions
- Use `waitForLoadState("networkidle")` after navigation
- Use wait-utilities: `waitForScrollPosition()`, `waitForStyleChange()`, etc.

---

### Issue 8: `document is not defined` in Unit Tests

**Symptom**: Error when running unit tests that need DOM APIs.

**Cause**: Test is in `node` environment but needs browser APIs.

**Solution**: Move test to directory covered by `browser-components` pattern in `vitest.config.ts`, or add pattern manually.

```typescript
// vitest.config.ts
include: [
	"**/components/**/*.test.ts", // jsdom environment
	"**/your-directory/**/*.test.ts" // Add your directory
];
```

**See**: [infrastructure.md - Test Environment Configuration](./infrastructure.md#test-environment-configuration)

---

## Quick Reference

### Test Commands

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
pnpm run test:e2e:debug          # Run with debugger
pnpm run test:e2e --update-snapshots  # Update visual snapshots

# Validation
make check-wip                   # Quick validation (modified files only)
pnpm run lint                    # Run linter
pnpm run check                   # TypeScript check
```

### Common Patterns

```typescript
// Generate unique test ID
import { generateConfigId } from "../helpers/test-utils.js";
const configId = generateConfigId("test-prefix", "suite-name");

// Use TestSetup for isolation
import { ExtendedTestSetup } from "../helpers/test-setup.js";
class MyTestSetup extends ExtendedTestSetup {
	constructor() {
		super("scripts", "test-name");
	}
}

// Conditional cleanup
afterEach((context) => {
	testSetup.cleanupIfPassed(context);
});

// E2E wait utilities
import { waitForScrollPosition, waitForStyleChange } from "./helpers/wait-utilities";
await waitForScrollPosition(page, 500, { tolerance: 15 });
```

---

## Getting Help

If you encounter issues not covered here:

1. **Check documentation**:
   - [infrastructure.md](./infrastructure.md) - Test setup and environments
   - [unit-testing.md](./unit-testing.md) - Unit test patterns
   - [e2e-testing.md](./e2e-testing.md) - E2E patterns and flakiness prevention
   - [validation-strategy.md](./validation-strategy.md) - Validation workflow
   - [ci-cd.md](./ci-cd.md) - CI/CD considerations

2. **Search test codebase**: `src/test/` for similar patterns

3. **Run with debug mode**:

   ```bash
   # Unit tests
   pnpm run test --reporter=verbose

   # E2E tests
   pnpm run test:e2e:debug
   ```

---

**Last Updated**: 2025-01-17
