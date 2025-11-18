# Unit Testing Guide

**Unit test patterns, TestSetup architecture, race condition prevention, and best practices.**

> **📚 Part of [Testing Guide](./README.md)** - See also: [infrastructure.md](./infrastructure.md), [e2e-testing.md](./e2e-testing.md)

---

## Table of Contents

1. [Race Condition Prevention](#race-condition-prevention)
2. [TestSetup Pattern](#testsetup-pattern)
3. [Best Practices](#best-practices)

---

## Race Condition Prevention

### The Problem

When tests run in parallel, they can interfere with each other if they:

- Generate files in the same directories
- Use the same configuration IDs
- Modify shared global state
- Access the same database or resources

**Example of a race condition**:

```typescript
// ❌ BAD: Multiple tests writing to the same file
test("generate schema 1", () => {
	generateSchema("./tmp/schema.json"); // Collision!
});

test("generate schema 2", () => {
	generateSchema("./tmp/schema.json"); // Collision!
});
```

### The Solution: Unique IDs

**`generateConfigId(prefix, testName)`** creates cryptographically unique identifiers:

```typescript
import { generateConfigId } from "../helpers/test-utils.js";

// Each test gets a unique ID
const configId = generateConfigId("test-search-idx", "unit-test-1");
// Returns: "test-search-idx-a3f2b1c4"

// Even if tests run simultaneously, IDs are different
const id1 = generateConfigId("test", "suite-1"); // "test-7d4f9a2b"
const id2 = generateConfigId("test", "suite-1"); // "test-9c3e1f8a" (different!)
```

**How it works**:

- Combines test name + timestamp + process ID
- Hashes the combination with MD5
- Returns unique 8-character suffix

**When to use**:

- ✅ Scripts that generate files/assets
- ✅ Tests that create configurations
- ✅ Tests that write to databases
- ✅ Any test that creates persistent resources

---

## TestSetup Pattern

### Architecture

**`TestSetup`** and **`ExtendedTestSetup`** classes provide standardized test isolation:

```typescript
import { ExtendedTestSetup } from "../helpers/test-setup.js";

class MyTestSetup extends ExtendedTestSetup {
	public configId: string;

	constructor(testSuiteId: string = "main") {
		// Creates unique temp directory: ./tmp/test/unit/{category}/{name}-{timestamp}/
		super("scripts", `my-test-${testSuiteId}`);

		// Generate unique config ID for this test run
		this.configId = generateConfigId("test-prefix", testSuiteId);
	}

	setup(): void {
		// Create test directory
		if (!existsSync(this.tempDir)) {
			mkdirSync(this.tempDir, { recursive: true });
		}

		// Additional setup (create test files, mock settings, etc.)
	}
}
```

### Usage Pattern

```typescript
describe("My Test Suite", () => {
	let testSetup: MyTestSetup;

	beforeEach(async () => {
		testSetup = new MyTestSetup("unique-suite-id");
		await testSetup.setup();
	});

	afterEach((context) => {
		// Conditional cleanup: only removes files if test passed
		testSetup.cleanupIfPassed(context);
	});

	it("should do something", () => {
		// Test uses testSetup.tempDir and testSetup.configId
		// No interference with other parallel tests
	});
});
```

### Key Features

**1. Standardized Paths**:

```typescript
// Automatic path structure
this.tempDir = "./tmp/test/unit/scripts/my-test-1704123456789/";
```

**2. Conditional Cleanup**:

```typescript
// cleanupIfPassed() only removes files when test passes
afterEach((context) => {
	testSetup.cleanupIfPassed(context); // Preserves files on failure for debugging
});
```

**⚠️ CRITICAL: Timing Constraint**

`cleanupIfPassed()` MUST be called from `afterEach()` hooks, NOT from `try-finally` blocks:

```typescript
// ❌ WRONG: Called too early - state not set yet
it("test", async (context) => {
	const setup = new TestSetup("scripts", "test");
	try {
		await setup.setup();
		// ... test code ...
	} finally {
		setup.cleanupIfPassed(context); // ← context.task.result?.state is undefined!
	}
});

// ✅ CORRECT: Called after Vitest sets test state
afterEach((context) => {
	testSetup.cleanupIfPassed(context); // ← state is properly set
});
```

**Why this matters**: Vitest sets `context.task.result.state` AFTER the test body completes. The `finally` block runs BEFORE state finalization, so cleanup thinks the test failed.

**3. Settings Mocking**:

```typescript
class MyTestSetup extends ExtendedTestSetup {
	createTestSettings() {
		return {
			...SETTINGS,
			scripts: {
				...SETTINGS.scripts,
				validation: {
					runAfterGeneration: false // Override for test performance
				}
			}
		};
	}
}
```

**4. Asset Path Management**:

```typescript
// Meaningful paths for test-generated assets
const schemaPath = join(testSetup.tempDir, "generated-schema.json");
const configPath = join(testSetup.tempDir, "test-config.json");
```

---

## Best Practices

### ✅ DO

**1. Use TestSetup for File Generation**:

```typescript
describe("Schema Generator", () => {
	let testSetup: TestSetup;

	beforeEach(() => {
		testSetup = new TestSetup("scripts", "schema-gen");
		testSetup.setup();
	});

	it("generates valid schema", () => {
		const outputPath = join(testSetup.tempDir, "schema.json");
		generateSchema(outputPath); // Isolated output
		expect(existsSync(outputPath)).toBe(true);
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});
});
```

**2. Use Unique IDs for Parallel Safety**:

```typescript
const configId = generateConfigId("test-menu", testSuiteId);
const tempSettings = {
	menuGenerator: {
		outputFile: `./tmp/${configId}-menu.ts` // Unique per test
	}
};
```

**3. Mock Settings for Test Isolation**:

```typescript
const testSettings = {
	...SETTINGS,
	scripts: {
		validation: {
			runAfterGeneration: false // Disable for speed
		}
	}
};
```

**4. Test Individual Files During Development**:

```bash
# Run single test file
pnpm run test src/test/lib/services/ValidationService.test.ts

# Run with pattern matching
pnpm run test -t "ValidationService"

# Watch mode for active development
pnpm run test --watch src/test/lib/services/ValidationService.test.ts
```

### ❌ AVOID

**1. Hardcoded Paths to Production Files**:

```typescript
// ❌ BAD: Modifies production file
it("updates menu", () => {
	writeFileSync("./src/data/book/menu.ts", newContent);
});

// ✅ GOOD: Uses isolated temp directory
it("updates menu", () => {
	const menuPath = join(testSetup.tempDir, "menu.ts");
	writeFileSync(menuPath, newContent);
});
```

**2. Shared State Between Tests**:

```typescript
// ❌ BAD: Global state shared between tests
let sharedCache = {};

it("test 1", () => {
	sharedCache.value = 123; // Affects test 2
});

it("test 2", () => {
	expect(sharedCache.value).toBeUndefined(); // FAILS due to test 1
});

// ✅ GOOD: Each test gets fresh state
beforeEach(() => {
	sharedCache = {}; // Reset before each test
});
```

**3. Tests Without Cleanup**:

```typescript
// ❌ BAD: No cleanup, files accumulate
it("generates file", () => {
	generateFile("./tmp/output.json");
	// File never cleaned up
});

// ✅ GOOD: Automatic cleanup via TestSetup
afterEach((context) => {
	testSetup.cleanupIfPassed(context);
});
```

**4. Assuming File Existence**:

```typescript
// ❌ BAD: Assumes file exists from previous run
it("updates existing file", () => {
	const content = readFileSync("./tmp/data.json"); // May not exist
});

// ✅ GOOD: Creates file in setup
beforeEach(() => {
	writeFileSync(join(testSetup.tempDir, "data.json"), "{}");
});
```

**5. Using cleanupIfPassed() in try-finally Blocks**:

```typescript
// ❌ BAD: Cleanup in finally block (timing issue)
it("validation test", async (context) => {
	const validationSetup = new TestSetup("scripts", "validation");
	try {
		await validationSetup.setup();
		const result = await runValidation();
		expect(result).toBe(true);
	} finally {
		validationSetup.cleanupIfPassed(context); // Won't work!
	}
});

// ✅ GOOD Option 1: Use afterEach (standard pattern)
let testSetup: TestSetup;
beforeEach(() => {
	testSetup = new TestSetup("scripts", "test");
	testSetup.setup();
});
afterEach((context) => {
	testSetup.cleanupIfPassed(context); // Correct timing
});

// ✅ GOOD Option 2: Use forceCleanup() after assertions
it("validation test", async () => {
	const validationSetup = new TestSetup("scripts", "validation");
	await validationSetup.setup();

	const result = await runValidation();
	expect(result).toBe(true);

	// Test passed - cleanup immediately
	validationSetup.forceCleanup();
});
```

---

## Test Execution Strategy

### 🎯 Golden Rule: Test Individually First, Then Globally

**NEVER run all 494 unit tests on every change!** This wastes 30-90s per iteration.

**Correct workflow**:

```
1. Make changes to code/test
2. Run ONLY the test you're working on (2-5s)
3. Fix issues, repeat step 2 until green
4. THEN run full test suite (30-90s)
```

### During Active Development

**❌ WRONG - Slow iteration** (~5min per cycle):

```bash
# Making changes to ValidationService.test.ts
npm run test           # Runs ALL 494 tests (30-90s)
# Find your test failed, make changes, repeat...
```

**✅ CORRECT - Fast iteration** (~5s per cycle):

```bash
# 1. Run ONLY the test you're editing
pnpm run test src/test/lib/services/ValidationService.test.ts

# 2. Or run ONLY one specific test case
pnpm run test src/test/lib/services/ValidationService.test.ts -t "should validate content"

# 3. Use watch mode for continuous feedback
pnpm run test --watch src/test/lib/services/ValidationService.test.ts

# 4. Once your test passes, THEN run the full suite
pnpm run test  # All unit tests
```

**Savings**: ~30-50 minutes per feature

---

## Related Documentation

- **[Test Infrastructure](./infrastructure.md)** - Test setup, environments, common patterns
- **[E2E Testing](./e2e-testing.md)** - Playwright patterns
- **[Validation Strategy](./validation-strategy.md)** - 3-tier validation workflow
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

---

**Last Updated**: 2025-01-17
