---
description: Enforce test quality patterns after test-architect completion, validating TestSetup usage, generateConfigId() for parallel safety, cleanupIfPassed() timing, NO waitForTimeout() in E2E tests, wait-utilities compliance, ≥90% coverage, and correct environment (jsdom vs node)
allowed-tools: [Read, Grep, Bash]
triggers:
  - "test quality"
  - "validate tests"
  - "test patterns"
  - "audit tests"
  - "test coverage"
  - "test antipatterns"
---

# Test Quality Auditor Skill

Validates test quality after test-architect completion, ensuring TestSetup usage, parallel safety, proper cleanup patterns, wait-utilities usage, and coverage compliance across unit and E2E tests.

## Capabilities

### 1. TestSetup Pattern Enforcement

**Validates**: All unit tests generating files or creating persistent resources use TestSetup pattern.

**Checks**:

- ✅ File operations use TestSetup
- ✅ beforeEach/afterEach hooks present
- ✅ tempDir used for all file paths
- ❌ No hardcoded production paths
- ❌ No shared state between tests

**Anti-patterns detected**:

```typescript
// ❌ Direct file operations without isolation
const outputPath = "./tmp/schema.json";
generateSchema(outputPath); // Race condition!

// ✅ TestSetup for isolation
class SchemaTestSetup extends ExtendedTestSetup {
	constructor(testSuiteId: string = "main") {
		super("scripts", `schema-gen-${testSuiteId}`);
	}
}
```

### 2. generateConfigId() Enforcement

**Validates**: Tests use `generateConfigId()` for parallel safety when creating configurations, IDs, or persistent resources.

**Checks**:

- ✅ `generateConfigId()` import exists
- ✅ Usage pattern (prefix + test suite ID)
- ✅ Generated ID used in file paths/configs
- ❌ No hardcoded config IDs
- ❌ No static filenames in temp directories

**Anti-patterns detected**:

```typescript
// ❌ Static IDs cause collisions
const configId = "test-search-idx";

// ✅ Unique IDs via generateConfigId()
const configId = generateConfigId("test-search-idx", "unit-test-1");
```

### 3. cleanupIfPassed() Timing Enforcement

**Validates**: `cleanupIfPassed()` called from `afterEach()` hooks, NOT from `try-finally` blocks.

**Why**: Vitest sets `context.task.result.state` AFTER test body completes. `finally` blocks run BEFORE state finalization, causing cleanup to think test failed.

**Checks**:

- ✅ `cleanupIfPassed()` in afterEach() hook
- ✅ Context parameter passed correctly
- ❌ No try-finally cleanup patterns
- ❌ No cleanup in test body

**Anti-patterns detected**:

```typescript
// ❌ Cleanup in try-finally (timing issue)
finally {
  validationSetup.cleanupIfPassed(context); // ← Called too early!
}

// ✅ Cleanup in afterEach
afterEach((context) => {
  testSetup.cleanupIfPassed(context); // ← Correct timing
});
```

### 4. NO waitForTimeout() in E2E Tests

**Validates**: E2E tests use wait-utilities (state-based waits) instead of hardcoded timeouts.

**Anti-pattern catalog**:
| Pattern | ❌ Bad | ✅ Good |
| --------------------- | --------------------------- | -------------------------------------------------- |
| Scroll Position | `page.waitForTimeout(300)` | `waitForScrollPosition(page, targetY, options)` |
| CSS Transform Changes | `page.waitForTimeout(500)` | `waitForTransform(locator, "scale(1.2)", options)` |
| Focus Trapping | `page.waitForTimeout(300)` | `waitForFocusWithin(page, selector, options)` |
| Clipboard Operations | `page.waitForTimeout(200)` | `retryClipboardOperation(callback, options)` |

**Checks**:

- ❌ NO `page.waitForTimeout()` usage
- ✅ wait-utilities import exists
- ✅ State-based waits for interactions
- ✅ Reasonable timeouts (not excessive)

### 5. Wait-Utilities Usage Validation

**Validates**: E2E tests use appropriate wait-utilities from `src/test/e2e/helpers/wait-utilities.ts`.

**Available utilities**:

- `waitForScrollPosition(page, targetY, options)` - Scroll with tolerance
- `waitForStyleChange(locator, property, value)` - CSS property changes
- `waitForAnimationComplete(locator, options)` - Animation completion
- `waitForDialogState(page, state, options)` - Dialog open/closed
- `waitForTransform(locator, value, options)` - CSS transform
- `retryClipboardOperation(callback, options)` - Clipboard with backoff
- `waitForElementActionable(locator, options)` - Visible + enabled + stable
- `waitForFocusWithin(page, selector, options)` - Focus in container
- `waitForAttribute(locator, name, value, options)` - Attribute value

**Checks**:

- ✅ Correct wait-utility for operation type
- ✅ Proper parameters and options
- ✅ Error handling for wait failures
- ❌ No missing wait-utilities imports

### 6. Test Coverage Validation

**Validates**: Test coverage meets or exceeds 90% for new features.

**Coverage thresholds**:

- Lines: 90%
- Functions: 90%
- Branches: 85%
- Statements: 90%

**Checks**:

- ✅ Coverage report meets thresholds
- ✅ Critical paths have tests
- ✅ Edge cases covered
- ✅ Public API methods tested
- ❌ No coverage below 90% for new features

### 7. Test Environment Validation

**Validates**: Tests use correct environment (jsdom vs node) based on test type.

**Environment rules**:

- **jsdom**: DOM tests, component rendering, browser APIs
- **node**: File system operations, backend logic, build scripts

**Checks**:

- ✅ DOM tests have `@vitest-environment jsdom` comment
- ✅ Backend tests have `@vitest-environment node` comment
- ✅ Environment matches test type
- ❌ No DOM tests in node environment
- ❌ No unnecessary jsdom for backend tests

**Anti-patterns detected**:

```typescript
// ❌ DOM tests in node environment
describe("Component Rendering", () => {
	it("renders correctly", () => {
		const element = document.createElement("div"); // Fails!
	});
});

// ✅ DOM tests in jsdom environment
/**
 * @vitest-environment jsdom
 */
describe("Component Rendering", () => {
	it("renders correctly", () => {
		const element = document.createElement("div"); // Works!
	});
});
```

## Auto-Trigger Conditions

This skill activates when:

- After test-architect generates tests
- New test files added to `src/test/`
- Test patterns modified in existing tests
- Manual invocation: `/audit-tests "test-file-pattern"`

**Blocking Authority**: MUST prevent test-architect completion until all quality checks pass.

## Validation Report Format

When issues found, provides actionable fixes:

```markdown
## Test Quality Audit Report

### File: src/test/unit/schema-generator.test.ts

#### TestSetup Pattern Violations (BLOCKING)

- Line 42: File operation without TestSetup
  Found: const outputPath = "./tmp/schema.json"
  Fix: Use TestSetup with tempDir for file isolation

#### Parallel Safety Violations (BLOCKING)

- Line 67: Hardcoded config ID
  Found: const configId = "test-idx"
  Fix: Use generateConfigId("test-idx", testSuiteId)

### File: src/test/e2e/scroll.spec.ts

#### waitForTimeout() Anti-patterns (BLOCKING)

- Line 23: Hardcoded timeout for scroll
  Found: await page.waitForTimeout(300)
  Fix: await waitForScrollPosition(page, 500, { tolerance: 15 })

#### Wait-Utilities Missing (HIGH)

- Line 45: CSS change without wait-utility
  Found: await page.click(); await page.waitForTimeout(200)
  Fix: await waitForStyleChange(locator, "opacity", "1")

### Summary

- ❌ 2 TestSetup violations (BLOCKING)
- ❌ 1 Parallel safety violation (BLOCKING)
- ❌ 2 waitForTimeout() usages (BLOCKING)
- ⚠️ 1 Wait-utility missing (HIGH)
- ✅ Coverage: 92% (meets threshold)
- ✅ Environment: Correct
```

## Integration

Works with:

- **test-architect** - Validates generated tests before completion
- **validation-enforcer** - Test quality part of tier 2 validation
- **component-integration-guardian** - Component test validation

## Success Criteria

1. ✅ All file-based tests use TestSetup pattern
2. ✅ All tests use generateConfigId() for parallel safety
3. ✅ cleanupIfPassed() called in afterEach() only
4. ✅ Zero waitForTimeout() in E2E tests
5. ✅ All E2E tests use appropriate wait-utilities
6. ✅ Coverage ≥90% for new features
7. ✅ Correct test environment (jsdom vs node)

## References

- [Unit Testing Guide](../../../docs/testing/unit-testing.md) - TestSetup patterns and examples
- [E2E Testing Guide](../../../docs/testing/e2e-testing.md) - Wait-utilities and anti-patterns
- [Testing Infrastructure](../../../docs/testing/infrastructure.md) - Test setup and utilities
- [Validation Strategy](../../../docs/testing/validation-strategy.md) - Integration with validation tiers
