# Code Quality Guardian Skill

**Purpose:** Automated code quality validation using AST analysis and static code metrics.

**Auto-triggers:** After code modifications to detect quality issues proactively.

**Manual invocation:** When reviewing code quality, refactoring, or before PR submission.

---

## Validation Categories

### 1. **Unused Code Detection**

- Variables declared but never read
- Function parameters not used (excluding valid cases: callbacks, destructuring)
- Imports not referenced
- Regex capture groups extracted but ignored

**Valid exceptions (will NOT flag):**

- Callback parameters required by interface: `array.map((item, _index) => ...)`
- Array destructuring to skip positions: `const [_first, _second, third] = tuple`
- Parameters prefixed with `_` when required by interface signature

**Invalid patterns (WILL flag):**

- Calculations stored in `_variable` but never used → DELETE the calculation
- Regex groups extracted as `_group` → USE non-capturing `(?:...)` or named groups
- Optional function parameters marked with `_` → REMOVE the parameter entirely

### 2. **Code Duplication Detection**

- Duplicate code blocks (≥5 lines, ≥25 tokens)
- Similar logic that could be abstracted
- Copy-paste anti-patterns

**Thresholds:**

- **Error:** ≥10% duplication rate
- **Warning:** 5-10% duplication rate
- **Pass:** <5% duplication

### 3. **Complexity Analysis**

- Cyclomatic complexity per function
- Cognitive complexity
- Nesting depth

**Thresholds:**

- **Error:** Cyclomatic complexity ≥15
- **Warning:** Cyclomatic complexity 10-14
- **Pass:** <10

### 4. **Regex Best Practices**

- Non-capturing groups `(?:...)` when group value not needed
- Named groups `(?<name>...)` for semantic clarity (RECOMMENDED)
- Unnecessary escape sequences
- Overly complex patterns (suggest decomposition)

**Recommendations:**

- Use named groups for maintainability: `/(?<direction>LR|RL)/` instead of `/(LR|RL)/`
- Use non-capturing when not extracting: `/(?:graph|flowchart)/` instead of `/(graph|flowchart)/`
- Avoid unnecessary escapes: `[^|]` instead of `[^\|]`

### 5. **Type Safety**

- `any` type usage (suggest `unknown` + type guards)
- Missing type annotations on public APIs
- Implicit `any` from missing types

---

## Integration Points

**Triggers:**

- Post-Edit hook (after file modifications)
- Pre-commit hook (via `lint-staged`)
- CI/CD pipeline (`make check-wip`)

**Works with:**

- `ts-refactor-master` agent (for automated refactoring)
- `validation-enforcer` agent (for blocking commits on violations)
- ESLint (complementary - catches different patterns)

**Dependencies:**

- `jscpd` (duplicate detection)
- `eslintcc` (complexity metrics)
- TypeScript Compiler API (AST analysis)

---

## Configuration

**Scoped to:**

- `src/**/*.{ts,tsx,svelte}` (production code)
- `!src/lib/components/demo/**` (exclude demo content)
- `!src/data/demo/**` (exclude temporary demo)
- `!src/test/**` (exclude test fixtures)

**Performance:**

- Incremental analysis (only modified files)
- Parallel processing for multiple files
- Cache results for unchanged files

---

## Usage Examples

### **Detecting unused variables:**

```typescript
// ❌ BAD - Will flag
const totalDiagrams = results.reduce((sum, r) => sum + r.totalDiagrams, 0);
const _totalValid = results.reduce((sum, r) => sum + r.validDiagrams, 0); // UNUSED!

// ✅ GOOD - Remove if not needed
const totalDiagrams = results.reduce((sum, r) => sum + r.totalDiagrams, 0);
```

### **Regex capture groups:**

```typescript
// ❌ BAD - Extracting group 1 but ignoring it
const pattern = /^(graph|flowchart)\s+(TD|TB|LR|RL)/m;
const match = content.match(pattern);
const _diagramType = match[1]; // UNUSED!
const direction = match[2];

// ✅ BETTER - Non-capturing group
const pattern = /^(?:graph|flowchart)\s+(TD|TB|LR|RL)/m;
const direction = match[1];

// ✅ BEST - Named group (most maintainable)
const pattern = /^(?:graph|flowchart)\s+(?<direction>TD|TB|LR|RL)/m;
const direction = match.groups.direction;
```

### **Function parameters:**

```typescript
// ❌ BAD - Parameter not needed
function checkPattern(content: string, _filePath: string): Violation[] {
	// _filePath never used
}

// ✅ GOOD - Remove unused parameter
function checkPattern(content: string): Violation[] {
	// Simpler signature
}

// ✅ VALID - Callback interface requirement
array.map((item, _index, _array) => processItem(item));
```

---

## Output Format

```typescript
interface QualityViolation {
	category: "unused-code" | "duplication" | "complexity" | "regex-pattern" | "type-safety";
	severity: "error" | "warning" | "info";
	file: string;
	line: number;
	column?: number;
	message: string;
	suggestion?: string;
	autoFixable: boolean;
}
```

---

## Performance Benchmarks

- **Single file analysis:** ~50-100ms
- **Full project scan:** ~2-5s (incremental)
- **Cold start (full scan):** ~10-15s

---

## References

- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [jscpd Documentation](https://github.com/kucherenko/jscpd)
- [Cognitive Complexity](https://www.sonarsource.com/resources/cognitive-complexity/)
- [Regex Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions)
