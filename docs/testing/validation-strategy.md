# Validation Strategy

**3-tier validation approach for optimal speed and comprehensive coverage.**

> **📚 Part of [Testing Guide](./README.md)** - See also: [unit-testing.md](./unit-testing.md), [e2e-testing.md](./e2e-testing.md)

---

## 3-Tier Approach

Execute validation in progressive tiers for optimal speed and coverage:

### **Tier 1: Quick Validation (5-15s)**

```bash
make check-wip
```

**What it checks**:

- Only modified files (via git diff)
- TypeScript errors
- Formatting issues
- Linting errors
- Suggests commit message (≤10 lines) when all checks pass

**When to use**: After each significant group of changes, BEFORE running tests. Run this FIRST to catch errors early.

### **Tier 2: Unit Tests (30-90s)**

```bash
pnpm run test
```

**What it checks**:

- All unit tests (494 tests across 25 files)
- Component rendering
- Service logic
- Utility functions
- Script execution

**When to use**: Before pushing, after feature completion

### **Tier 3: Full Validation (1-3min)**

```bash
pnpm run format && pnpm run lint && pnpm run check
```

**What it checks**:

- All files formatted correctly
- All lint rules pass
- TypeScript compilation (full project)
- Svelte component validation

**When to use**: Before pull request, before merge

### **Tier 4: E2E Tests (1-3min)**

```bash
pnpm run test:e2e
```

**What it checks**:

- All E2E tests (260 tests across 14 files)
- Visual rendering
- User interactions
- Navigation flows
- Responsive behavior

**When to use**: After all other validations pass, before deployment

---

## Execution Strategy

### 🎯 Golden Rule: Test Individually First, Then Globally

**NEVER run all 494 unit tests + 260 E2E tests on every change!** This wastes 3-5 minutes per iteration.

**Correct workflow**:

```
1. Make changes to code/test
2. Run ONLY the test you're working on (2-5s)
3. Fix issues, repeat step 2 until green
4. THEN run full test suite (30-90s for unit, 1-3min for E2E)
```

---

### During Active Development (Creating/Editing Tests)

**❌ WRONG - Slow iteration** (~5min per cycle):

```bash
# Making changes to ValidationService.test.ts
npm run test           # Runs ALL 494 tests (30-90s)
npm run test:e2e       # Runs ALL 260 E2E tests (1-3min)
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

**For E2E tests**:

```bash
# 1. Run ONLY the E2E test you're working on
pnpm run test:e2e src/test/e2e/dialog.spec.ts

# 2. Run with UI mode for debugging
pnpm run test:e2e:ui src/test/e2e/dialog.spec.ts

# 3. Once green, run all E2E tests
pnpm run test:e2e  # All 260 E2E tests
```

**Why this matters**:

- **Individual test**: 2-5 seconds
- **Full unit suite**: 30-90 seconds (494 tests)
- **Full E2E suite**: 1-3 minutes (260 tests)
- **Savings**: ~3-5 minutes per iteration × 10 iterations = **30-50 minutes saved per feature**

---

### During General Development (Not Editing Tests)

1. **Run `make check-wip` frequently** (every few changes)
   - Only checks modified files
   - Fast feedback (~5-15s)

2. **Run related test files when changing logic**

   ```bash
   # Changed ValidationService.ts
   pnpm run test src/test/lib/services/ValidationService.test.ts
   ```

3. **Run affected E2E tests when changing UI**
   ```bash
   # Changed Dialog.svelte
   pnpm run test:e2e src/test/e2e/dialog.spec.ts
   ```

---

### Before Committing

1. `make check-wip` → **Must pass**
2. `pnpm run test` → **Must pass** (if you changed logic)
3. `pnpm run test:e2e` → **Must pass** (if you changed UI)

**Tip**: Only run the tier you need. Changed only scripts? Skip E2E tests.

---

### Before Pushing/PR

**All tiers must pass**:

1. `make check-wip` ✅
2. `pnpm run test` ✅ (all 494 unit tests)
3. `pnpm run test:e2e` ✅ (all 260 E2E tests)
4. `pnpm run format` && `pnpm run lint` && `pnpm run check` ✅

**Zero tolerance**:

- No TypeScript errors
- No test failures
- No lint warnings

---

## Validation Commands Summary

| Tier  | Command                                              | Duration | When to Run                      |
| ----- | ---------------------------------------------------- | -------- | -------------------------------- |
| **1** | `make check-wip`                                     | 5-15s    | After each change group          |
| **2** | `pnpm run test`                                      | 30-90s   | Before commit (if logic changed) |
| **3** | `pnpm run format && pnpm run lint && pnpm run check` | 1-3min   | Before PR                        |
| **4** | `pnpm run test:e2e`                                  | 1-3min   | Before deployment                |

---

## Related Documentation

- **[Unit Testing](./unit-testing.md)** - TestSetup patterns, execution strategy
- **[E2E Testing](./e2e-testing.md)** - Playwright patterns
- **[CI/CD Guide](./ci-cd.md)** - Clean environment requirements
- **[Troubleshooting](./troubleshooting.md)** - Common validation issues

---

**Last Updated**: 2025-01-17
