# Code Quality Guardian - Technical Reference

## Detection Patterns

### Unused Variable Detection (AST-based)

**Strategy:** TypeScript Compiler API traversal

```typescript
// Pattern: Variable declared but never read
const unusedVar = calculateExpensiveValue(); // ❌ VIOLATION

// Pattern: Regex group extracted but ignored
const match = /^(type)\s+(\w+)/.exec(line);
const _type = match[1]; // ❌ VIOLATION - use non-capturing
const name = match[2];

// Valid exception: Callback parameter required by interface
items.forEach((_item, index) => console.log(index)); // ✅ VALID

// Valid exception: Array destructuring to skip positions
const [_first, _second, third] = tuple; // ✅ VALID
```

**AST Detection Logic:**

1. Find all `VariableDeclaration` nodes
2. Check if variable is referenced in scope
3. If prefixed with `_`, verify it's a valid exception:
   - Is it a function parameter? → Check if function is callback
   - Is it from destructuring? → Check if skipping earlier positions
4. Flag if unused and not valid exception

---

### Code Duplication Detection (Token-based)

**Tool:** `jscpd` with TypeScript support

**Configuration:**

```json
{
	"threshold": 5,
	"minLines": 5,
	"minTokens": 25,
	"ignore": ["**/node_modules/**", "**/*.test.ts", "**/demo/**"],
	"format": ["typescript", "javascript"],
	"reporters": ["json"]
}
```

**Thresholds:**

- **BLOCK:** ≥10% duplication (major refactoring needed)
- **WARN:** 5-10% duplication (consider refactoring)
- **PASS:** <5% duplication (acceptable)

**Example violations:**

```typescript
// File A
function validateUser(user: User) {
	if (!user.email) throw new Error("Email required");
	if (!user.name) throw new Error("Name required");
	if (user.age < 18) throw new Error("Must be 18+");
}

// File B (duplicate logic - should be extracted)
function validateAdmin(admin: Admin) {
	if (!admin.email) throw new Error("Email required");
	if (!admin.name) throw new Error("Name required");
	if (admin.age < 18) throw new Error("Must be 18+");
}

// ✅ REFACTOR: Extract common validation
function validatePerson(person: { email: string; name: string; age: number }) {
	if (!person.email) throw new Error("Email required");
	if (!person.name) throw new Error("Name required");
	if (person.age < 18) throw new Error("Must be 18+");
}
```

---

### Complexity Analysis

**Tool:** `eslintcc` for cyclomatic complexity

**Metrics:**

- **Cyclomatic Complexity (CC):** Number of independent paths through code
- **Cognitive Complexity:** How hard code is to understand
- **Nesting Depth:** Maximum indentation level

**Thresholds:**

```typescript
{
  cyclomatic: {
    error: 15,    // Too complex - must refactor
    warning: 10,  // Getting complex - consider refactoring
    pass: 10      // Acceptable
  },
  nesting: {
    error: 5,     // Too deeply nested
    warning: 4,   // Deep nesting
    pass: 3       // Acceptable
  }
}
```

**Example violations:**

```typescript
// ❌ Cyclomatic complexity = 16 (ERROR)
function processData(data: Data[], options: Options) {
	if (!data) return null;
	if (data.length === 0) return [];

	const results = [];
	for (const item of data) {
		if (item.type === "A") {
			if (item.valid) {
				if (options.strictMode) {
					if (item.score > 80) {
						results.push(transformA(item));
					} else if (item.score > 50) {
						results.push(transformB(item));
					} else {
						results.push(transformC(item));
					}
				} else {
					results.push(transformD(item));
				}
			}
		} else if (item.type === "B") {
			// More nested conditions...
		}
	}
	return results;
}

// ✅ REFACTOR: Extract functions to reduce complexity
function processData(data: Data[], options: Options) {
	if (!data || data.length === 0) return data || [];
	return data.map((item) => processItem(item, options)).filter(Boolean);
}

function processItem(item: Data, options: Options) {
	if (!item.valid) return null;

	switch (item.type) {
		case "A":
			return processTypeA(item, options);
		case "B":
			return processTypeB(item, options);
		default:
			return null;
	}
}
```

---

### Regex Pattern Analysis

**Detection patterns:**

#### 1. Unnecessary Capturing Groups

```typescript
// ❌ BAD - Capturing but not extracting
const pattern = /(graph|flowchart)\s+(LR|RL)/;
const match = content.match(pattern);
const direction = match[2]; // Only using group 2

// ✅ BETTER - Non-capturing group
const pattern = /(?:graph|flowchart)\s+(LR|RL)/;
const direction = match[1]; // Now it's group 1

// ✅ BEST - Named group (self-documenting)
const pattern = /(?:graph|flowchart)\s+(?<direction>LR|RL)/;
const direction = match.groups.direction;
```

#### 2. Unnecessary Escape Sequences

```typescript
// ❌ BAD - Unnecessary escapes
const pattern1 = /[^\|]/; // Pipe doesn't need escape in character class
const pattern2 = /\(test\)/; // Context-dependent

// ✅ GOOD - Minimal escaping
const pattern1 = /[^|]/; // No escape needed
const pattern2 = /\(test\)/; // Escape needed outside character class
```

#### 3. Named Groups Recommendation

```typescript
// ❌ WORKS but hard to maintain
const urlPattern = /^(https?):\/\/([^\/]+)(\/.*)?$/;
const protocol = match[1];
const domain = match[2];
const path = match[3];

// ✅ BETTER - Self-documenting with named groups
const urlPattern = /^(?<protocol>https?):\/\/(?<domain>[^\/]+)(?<path>\/.*)?$/;
const { protocol, domain, path } = match.groups;
```

**Complexity Heuristics:**

- **Simple:** `<=30` characters, `<=2` groups
- **Moderate:** `31-80` characters, `3-5` groups
- **Complex:** `>80` characters or `>5` groups → suggest decomposition

---

### Type Safety Analysis

**Patterns to detect:**

#### 1. Explicit `any` type

```typescript
// ❌ BAD - any type loses type safety
function process(data: any) {
	return data.value; // No type checking
}

// ✅ GOOD - unknown + type guard
function process(data: unknown) {
	if (typeof data === "object" && data !== null && "value" in data) {
		return (data as { value: unknown }).value;
	}
	throw new Error("Invalid data");
}
```

#### 2. Missing return type annotations

```typescript
// ❌ BAD - implicit return type
export function calculateTotal(items: Item[]) {
	return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ GOOD - explicit return type
export function calculateTotal(items: Item[]): number {
	return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### 3. Type assertions that could be type guards

```typescript
// ❌ BAD - unsafe assertion
function getLength(value: unknown) {
	return (value as string).length; // Runtime error if not string
}

// ✅ GOOD - type guard
function getLength(value: unknown): number {
	if (typeof value !== "string") {
		throw new TypeError("Expected string");
	}
	return value.length;
}
```

---

## Integration with ts-refactor-master

**Handoff patterns:**

When Code Quality Guardian detects fixable violations, it can trigger `ts-refactor-master` for automated refactoring:

1. **Unused imports** → Remove via AST manipulation
2. **Duplicate code blocks** → Extract to shared function
3. **High complexity functions** → Split into smaller functions
4. **`any` type usage** → Convert to `unknown` with type guards

**Example workflow:**

```bash
# 1. Code Quality Guardian detects issues
pnpm tsx .claude/skills/code-quality-guardian/scripts/check-quality.ts src/lib/utils/parser.ts
# Output: 3 violations (1 unused var, 1 duplicate, 1 complexity)

# 2. User approves automated fixes
# Agent invokes ts-refactor-master with violation details

# 3. ts-refactor-master applies fixes
# - Removes unused variable
# - Extracts duplicate logic to shared function
# - Splits complex function into 3 smaller functions

# 4. Validation Enforcer verifies
make check-wip
# Output: All checks pass ✅
```

---

## Performance Considerations

**Optimization strategies:**

1. **Incremental Analysis**
   - Only analyze modified files
   - Cache AST for unchanged files
   - Use `git diff` to identify changed files

2. **Parallel Processing**
   - Process multiple files concurrently
   - Use worker threads for CPU-intensive tasks

3. **Selective Checks**
   - Skip demo/test files
   - Focus on production code (`src/**`)
   - Exclude generated files (`.svelte-kit/**`)

**Benchmark targets:**

- Single file: `<100ms`
- 10 files: `<500ms`
- Full project (cold): `<15s`
- Full project (cached): `<3s`

---

## CI/CD Integration

**Integration points:**

### 1. Pre-commit Hook

```javascript
// .claude/hooks/pre-commit-quality.cjs
const { execSync } = require("child_process");

const modifiedFiles = execSync("git diff --cached --name-only --diff-filter=ACM")
	.toString()
	.trim()
	.split("\n")
	.filter((f) => /\.(ts|tsx|svelte)$/.test(f));

if (modifiedFiles.length === 0) process.exit(0);

try {
	execSync(
		`pnpm tsx .claude/skills/code-quality-guardian/scripts/check-quality.ts ${modifiedFiles.join(" ")}`,
		{
			stdio: "inherit"
		}
	);
} catch {
	console.error("❌ Code quality checks failed. Fix violations before committing.");
	process.exit(1);
}
```

### 2. GitHub Actions

```yaml
# .github/workflows/code-quality.yml
name: Code Quality
on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm tsx .claude/skills/code-quality-guardian/scripts/check-quality.ts src/
      - name: Comment PR with violations
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            // Post violation summary to PR comments
```

### 3. Make target

```makefile
# Makefile
quality-check:
	@echo "Running code quality checks..."
	@pnpm tsx .claude/skills/code-quality-guardian/scripts/check-quality.ts src/

quality-fix:
	@echo "Auto-fixing quality violations..."
	@pnpm tsx .claude/agents/ts-refactor-master.ts --fix
```

---

## References

- [TypeScript AST Viewer](https://ts-ast-viewer.com/)
- [jscpd Configuration](https://github.com/kucherenko/jscpd/tree/master/packages/jscpd)
- [ESLint Complexity Rules](https://eslint.org/docs/latest/rules/complexity)
- [Cognitive Complexity Paper](https://www.sonarsource.com/docs/CognitiveComplexity.pdf)
- [Regex Named Capture Groups](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Named_capturing_group)
