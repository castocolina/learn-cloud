# E2E Testing Guide

**End-to-end testing with Playwright, flakiness prevention, and best practices.**

> **📚 Part of [Testing Guide](./README.md)** - See also: [infrastructure.md](./infrastructure.md), [unit-testing.md](./unit-testing.md)

---

## Table of Contents

1. [Playwright Configuration](#playwright-configuration)
2. [Best Practices](#best-practices)
3. [E2E Flakiness Prevention](#e2e-flakiness-prevention)
4. [Helper Functions Reference](#helper-functions-reference)

---

## Playwright Configuration

**Location**: `playwright.config.ts`

**Key Settings**:

- **Base URL**: `http://localhost:5173` (SvelteKit dev server)
- **Auto-start**: Server starts automatically via `webServer` config
- **Workers**: 75% of CPU cores for parallel execution
- **Timeout**: 30s per test
- **Max Failures**: Stops after 10 failures (broken build detection)

---

## Best Practices

### ✅ DO

**1. Use Relative URLs with `baseURL`**:

```typescript
// ✅ GOOD: Respects baseURL from config
await page.goto("/showcase/dialog");
await page.goto("/#/01_01_lesson.html");

// Playwright automatically prepends http://localhost:5173
```

**2. Use Playwright Snapshots for Visual Regression**:

```typescript
// Snapshots are stored in: src/test/e2e/{test}.spec.ts-snapshots/
await expect(page.locator(".icon-grid")).toHaveScreenshot("icon-grid-default.png");

// Snapshots are git-tracked and persist across sessions
```

**3. Use Debug Screenshots for Investigation**:

```typescript
// Debug screenshots go to tmp/ (NOT git-tracked)
await page.screenshot({
	path: "tmp/test/e2e/dialog-issue.png",
	fullPage: true
});

// Useful during development, but don't rely on them persisting
```

**4. Wait for Network and Content**:

```typescript
async function waitForPageContent(page: Page): Promise<void> {
	await page.waitForLoadState("networkidle");
	// Wait for main content to be visible (no hard-coded timeouts!)
	await page.waitForSelector('[data-testid="main-content"]', { timeout: 10000 });
}

test("sidebar displays correctly", async ({ page }) => {
	await page.goto("/");
	await waitForPageContent(page);
	// Now test interactions
});
```

**5. Test Individual E2E Files During Development**:

```bash
# Run single E2E test file
pnpm run test:e2e src/test/e2e/dialog.spec.ts

# Run with UI mode for debugging
pnpm run test:e2e:ui

# Run specific test by name
pnpm run test:e2e -g "should open dialog on button click"
```

### ❌ AVOID

**1. Hardcoded Full URLs**:

```typescript
// ❌ BAD: Hardcoded URL, won't work with dynamic ports
await page.goto("http://localhost:5173/showcase/dialog");

// ✅ GOOD: Relative URL respects baseURL config
await page.goto("/showcase/dialog");
```

**2. Relying on Files in `tmp/` Directory**:

```typescript
// ❌ BAD: File won't exist in CI or fresh clones
const screenshot = readFileSync("tmp/test/e2e/reference.png");

// ✅ GOOD: Use Playwright snapshots (git-tracked)
await expect(page).toHaveScreenshot("reference.png");
```

**3. Tests Without Proper Waits**:

```typescript
// ❌ BAD: Race condition - test runs before content loads
test("check sidebar", async ({ page }) => {
	await page.goto("/");
	const sidebar = page.locator("[data-sidebar]");
	await expect(sidebar).toBeVisible(); // May fail randomly
});

// ✅ GOOD: Wait for full page load
test("check sidebar", async ({ page }) => {
	await page.goto("/");
	await page.waitForLoadState("networkidle");
	await page.waitForTimeout(500);
	const sidebar = page.locator("[data-sidebar]");
	await expect(sidebar).toBeVisible();
});
```

**4. Assuming Server Port Availability**:

```typescript
// ❌ BAD: Hardcoded port may be in use
test.use({ baseURL: "http://localhost:5173" });

// ✅ GOOD: Let Playwright config handle it
// playwright.config.ts handles server startup and port management
```

---

## E2E Flakiness Prevention

**🎯 Mission**: Eliminate hard-coded `page.waitForTimeout()` and replace with robust polling/retry mechanisms.

**📊 Results**: Eliminated **58 `waitForTimeout()` calls** across 5 test files with **99% test pass rate**.

### Why Hard-Coded Timeouts Are Bad

Hard-coded timeouts create **flaky tests** that:

1. **Pass locally, fail in CI** - Different CPU speeds, network latency
2. **Waste time** - Waiting fixed delays even when condition is already met
3. **Create false positives** - Passing because timeout is "long enough" (today)
4. **Create false negatives** - Failing because timeout is "too short" (under load)

### Anti-Pattern Catalog

#### Pattern 1: Scroll Position Waits

**❌ BAD**:

```typescript
await page.evaluate((scroll) => window.scrollTo(0, scroll), 500);
await page.waitForTimeout(300); // Hope scroll finished
const scrollY = await page.evaluate(() => window.scrollY);
```

**✅ GOOD**:

```typescript
import { waitForScrollPosition } from "./helpers/wait-utilities";

await page.evaluate((scroll) => window.scrollTo(0, scroll), 500);
await waitForScrollPosition(page, 500, { tolerance: 15, timeout: 2000 });
// Scroll is GUARANTEED to be at 500±15px
```

**File**: `src/test/e2e/sticky-header.spec.ts` - **15 timeouts eliminated**

#### Pattern 2: Shiki Initialization (Lazy Loaded Code)

**❌ BAD**:

```typescript
await page.goto("/showcase/code-block");
await page.waitForLoadState("networkidle");
await page.waitForTimeout(3000); // Hope Shiki loaded
```

**✅ GOOD**:

```typescript
await page.goto("/showcase/code-block");
await page.waitForLoadState("networkidle");
// Wait for actual rendered code (Shiki complete)
await page.waitForSelector(".code-block-container code", {
	state: "visible",
	timeout: 5000
});
```

**File**: `src/test/e2e/code-block.spec.ts` - **12 timeouts eliminated**

#### Pattern 3: CSS Transform Changes (Zoom/Pan)

**❌ BAD**:

```typescript
await zoomInButton.click();
await page.waitForTimeout(500); // Hope transform applied
const transform = await svg.evaluate((el) => el.style.transform);
```

**✅ GOOD**:

```typescript
import { waitForTransform } from "./helpers/wait-utilities";

await zoomInButton.click();
await waitForTransform(svg, "scale(1.2)", { timeout: 2000 });
// Transform is GUARANTEED to be "scale(1.2)"
```

**File**: `src/test/e2e/mermaid-diagram.spec.ts` - **24 timeouts eliminated**

#### Pattern 4: Focus Trapping

**❌ BAD**:

```typescript
await openButton.click();
await page.waitForTimeout(300); // Hope focus stabilized
for (let i = 0; i < 3; i++) {
	await page.keyboard.press("Tab");
	await page.waitForTimeout(50); // Hope Tab processed
}
```

**✅ GOOD**:

```typescript
import { waitForFocusWithin } from "./helpers/wait-utilities";

await openButton.click();
await waitForFocusWithin(page, '[role="dialog"][data-state="open"]', { timeout: 1000 });
for (let i = 0; i < 3; i++) {
	await page.keyboard.press("Tab"); // Tab is synchronous
}
```

**File**: `src/test/e2e/dialog.spec.ts` - **3 timeouts eliminated**

#### Pattern 5: CSS Hover State

**❌ BAD**:

```typescript
const bgBefore = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);
await button.hover();
await page.waitForTimeout(100); // Hope CSS transition done
const bgAfter = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);
```

**✅ GOOD**:

```typescript
import { waitForStyleChange } from "./helpers/wait-utilities";

const bgBefore = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);
await button.hover();
await waitForStyleChange(button, "backgroundColor", (value) => value !== bgBefore, {
	timeout: 1000
});
const bgAfter = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);
```

**File**: `src/test/e2e/icon-grid.spec.ts` - **4 timeouts eliminated**

#### Pattern 6: Clipboard Operations

**❌ BAD**:

```typescript
await copyButton.click();
await page.waitForTimeout(200); // Hope clipboard worked
```

**✅ GOOD**:

```typescript
import { retryClipboardOperation } from "./helpers/wait-utilities";

await retryClipboardOperation(
	async () => {
		await copyButton.click();
		const text = await page.evaluate(() => navigator.clipboard.readText());
		expect(text).toContain("expected content");
	},
	{ timeout: 3000, intervals: [100, 200, 500, 1000] }
);
```

**Why**: Clipboard API is flaky in headless/CI - needs exponential backoff retry.

**File**: `src/test/e2e/code-block.spec.ts`

#### Pattern 7: Rapid State Changes

**❌ BAD**:

```typescript
await button.click();
await button.click();
await button.click();
await page.waitForTimeout(500); // Hope state settled
const count = await page.locator('[role="dialog"]').count();
expect(count).toBeLessThanOrEqual(1);
```

**✅ GOOD**:

```typescript
await button.click();
await button.click();
await button.click();
await expect(async () => {
	const count = await page.locator('[role="dialog"]').count();
	expect(count).toBeLessThanOrEqual(1);
}).toPass({ timeout: 1500 });
```

**File**: `src/test/e2e/dialog.spec.ts`

#### Pattern 8: Helper Function Over-Waiting

**❌ BAD**:

```typescript
async function waitForPageContent(page: Page) {
	await page.waitForLoadState("networkidle");
	await page.waitForTimeout(500); // Unnecessary!
	await page.waitForSelector(".icon-grid", { timeout: 10000 });
	await page.waitForTimeout(300); // Unnecessary!
}
```

**✅ GOOD**:

```typescript
async function waitForPageContent(page: Page) {
	await page.waitForLoadState("networkidle");
	await page.waitForSelector(".icon-grid", { timeout: 10000 });
	// Selector already waits for element - no extra delay needed
}
```

**File**: `src/test/e2e/icon-grid.spec.ts`

---

## Helper Functions Reference

**Location**: `src/test/e2e/helpers/wait-utilities.ts`

All helpers use Playwright's `expect.poll()` pattern with configurable timeouts:

```typescript
// Scroll position with tolerance
await waitForScrollPosition(page, targetY, { tolerance: 15, timeout: 2000 });

// CSS property change (string or predicate)
await waitForStyleChange(locator, "backgroundColor", "#ffffff", { timeout: 1000 });
await waitForStyleChange(locator, "opacity", (value) => parseFloat(value) > 0.5, { timeout: 1000 });

// Animation completion (transition-duration = 0)
await waitForAnimationComplete(locator, { timeout: 2000 });

// Dialog state attribute
await waitForDialogState(page, "open", { timeout: 2000 });

// CSS transform value
await waitForTransform(locator, "scale(1.5)", { timeout: 2000 });

// Clipboard with exponential backoff
await retryClipboardOperation(
	async () => {
		await button.click();
		const text = await page.evaluate(() => navigator.clipboard.readText());
		expect(text).toBe("expected");
	},
	{ timeout: 3000, intervals: [100, 200, 500, 1000] }
);

// Element actionable (visible + enabled + stable)
await waitForElementActionable(locator, { timeout: 2000 });

// Focus within container
await waitForFocusWithin(page, '[role="dialog"]', { timeout: 1000 });

// Attribute value (string or boolean)
await waitForAttribute(locator, "aria-expanded", "true", { timeout: 1000 });
```

### Best Practices

**✅ DO**:

1. **Use `expect.poll()` for Custom Conditions**:

   ```typescript
   await expect
   	.poll(
   		async () => {
   			return await page.evaluate(() => window.scrollY);
   		},
   		{ timeout: 2000 }
   	)
   	.toBeGreaterThan(100);
   ```

2. **Use `expect.toPass()` for Retry Logic**:

   ```typescript
   await expect(async () => {
   	const count = await locator.count();
   	expect(count).toBe(5);
   }).toPass({ timeout: 3000 });
   ```

3. **Use Playwright's Auto-Waiting**:
   - `locator.click()` - Waits for actionable
   - `expect(locator).toBeVisible()` - Waits for visible
   - `expect(page).toHaveScreenshot()` - Waits for visual stability

4. **Combine Helpers with Playwright Auto-Wait**:
   ```typescript
   await waitForScrollPosition(page, 500, { tolerance: 15 });
   await expect(header).toBeVisible(); // Auto-waits for visibility
   ```

**❌ AVOID**:

1. **Never Use `page.waitForTimeout()`** - Use state-based waits
2. **Don't Nest Timeouts** - Compounds flakiness
3. **Don't Use Fixed Delays After Clicks** - Use state assertions
4. **Don't Assume Instant Rendering** - Wait for visible selectors

### Troubleshooting Flaky Tests

**Symptom**: Test passes locally, fails in CI

**Diagnosis**:

1. Check for `waitForTimeout()` - Replace with state-based wait
2. Check for race conditions - Add `waitForLoadState("networkidle")`
3. Check for missing selectors - Add `waitForSelector()` with timeout
4. Check for CSS transitions - Use `waitForStyleChange()` or `waitForAnimationComplete()`

**Symptom**: Test fails with "Timeout exceeded"

**Diagnosis**:

1. Increase timeout if legitimate slow operation (e.g., Shiki: 3s → 5s)
2. Check if element is rendered - Use `page.locator().count()` to debug
3. Check if condition is ever met - Add debug logging in helper

**Symptom**: Test fails intermittently

**Diagnosis**:

1. Clipboard operations - Use `retryClipboardOperation()` with backoff
2. Focus events - Use `waitForFocusWithin()` instead of `waitForTimeout()`
3. Rapid state changes - Use `expect.toPass()` with retry logic

---

## Related Documentation

- **[Test Infrastructure](./infrastructure.md)** - Test setup, environments
- **[Unit Testing](./unit-testing.md)** - TestSetup patterns
- **[Validation Strategy](./validation-strategy.md)** - 3-tier validation
- **[CI/CD Guide](./ci-cd.md)** - Server management, snapshots
- **[Troubleshooting](./troubleshooting.md)** - Common issues

---

**Last Updated**: 2025-01-17
