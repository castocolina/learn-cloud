## Test Quality Auditor - Reference Documentation

### Standards and Guidelines

- **[Unit Testing Guide](../../../docs/testing/unit-testing.md)** - TestSetup patterns and examples
- **[E2E Testing Guide](../../../docs/testing/e2e-testing.md)** - Wait-utilities and anti-patterns
- **[Testing Infrastructure](../../../docs/testing/infrastructure.md)** - Test setup and utilities
- **[Validation Strategy](../../../docs/testing/validation-strategy.md)** - Integration with validation tiers

### 7 Core Quality Patterns

#### 1. TestSetup Pattern

All file-based tests must use TestSetup for isolation:

```typescript
class SchemaTestSetup extends ExtendedTestSetup {
	constructor(testSuiteId: string = "main") {
		super("scripts", `schema-gen-${testSuiteId}`);
	}
}
```

#### 2. generateConfigId()

Parallel-safe ID generation:

```typescript
const configId = generateConfigId("test-idx", "unit-test-1");
// Returns: "test-idx-a3f2b1c4" (unique per run)
```

#### 3. cleanupIfPassed() Timing

Always in `afterEach()`, never in `try-finally`:

```typescript
afterEach((context) => {
	testSetup.cleanupIfPassed(context);
});
```

#### 4. NO waitForTimeout()

Use state-based waits in E2E tests:

```typescript
// ❌ await page.waitForTimeout(300)
// ✅ await waitForScrollPosition(page, 500, { tolerance: 15 })
```

#### 5. Wait-Utilities

Available utilities from `src/test/e2e/helpers/wait-utilities.ts`:

- `waitForScrollPosition(page, targetY, options)`
- `waitForStyleChange(locator, property, value)`
- `waitForAnimationComplete(locator, options)`
- `waitForDialogState(page, state, options)`
- `waitForTransform(locator, value, options)`
- `retryClipboardOperation(callback, options)`
- `waitForElementActionable(locator, options)`
- `waitForFocusWithin(page, selector, options)`
- `waitForAttribute(locator, name, value, options)`

#### 6. Coverage Thresholds

- Lines: 90%
- Functions: 90%
- Branches: 85%
- Statements: 90%

#### 7. Test Environment

- **jsdom**: DOM tests, component rendering
- **node**: File system, backend logic

```typescript
/** @vitest-environment jsdom */
describe("Component", () => { ... });
```

### Validation Scripts

#### check-patterns.ts

Main validation script for all 7 patterns.

**Usage**:

```bash
# Single file
node scripts/check-patterns.ts src/test/unit/schema.test.ts

# Directory
node scripts/check-patterns.ts src/test/
```

**Exit codes**:

- 0: All checks passed
- 1: Blocking issues found

### Integration with Validation Tiers

**Tier 2 (tests)**: Test quality validation runs after unit tests
**Blocking**: Prevents test-architect completion until all checks pass

### Related Agents

- **test-architect** - Generates tests, validated by this skill
- **validation-enforcer** - Orchestrates validation including test quality
- **component-integration-guardian** - Component-specific test validation

### Anti-Pattern Catalog

| Anti-Pattern                     | Impact                  | Fix                                |
| -------------------------------- | ----------------------- | ---------------------------------- |
| Direct file ops                  | Race conditions         | Use TestSetup                      |
| Static config IDs                | Parallel test collision | Use generateConfigId()             |
| cleanupIfPassed() in try-finally | Wrong cleanup timing    | Move to afterEach()                |
| waitForTimeout()                 | Flaky E2E tests         | Use wait-utilities                 |
| Missing wait-utilities           | Timing issues           | Import and use appropriate utility |
| Low coverage                     | Untested code           | Add tests to reach ≥90%            |
| Wrong environment                | Test failures           | Add @vitest-environment comment    |

### Success Criteria

- ✅ All file-based tests use TestSetup pattern
- ✅ All tests use generateConfigId() for parallel safety
- ✅ cleanupIfPassed() called in afterEach() only
- ✅ Zero waitForTimeout() in E2E tests
- ✅ All E2E tests use appropriate wait-utilities
- ✅ Coverage ≥90% for new features
- ✅ Correct test environment (jsdom vs node)
