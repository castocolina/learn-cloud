# End-to-End Testing Guide

## Overview

This directory contains Playwright-based end-to-end tests for the cloud-native learning platform. These tests verify critical user flows, visual rendering, accessibility compliance, and interaction patterns across desktop and mobile viewports.

**Testing Stack:**

- **Playwright** - Cross-browser E2E testing framework
- **SvelteKit** - SSR/SPA hybrid framework with file-based routing
- **shadcn-svelte** - Accessible UI component library
- **Mermaid** - Diagram rendering engine
- **WCAG 2.1 AA** - Accessibility standard (≥44px touch targets)

**Test Statistics** (as of 2025-11-04):

- **13 test files** covering navigation, components, and user flows
- **260 test cases** (259 passing, 1 skipped)
- **82 strategic timeouts** for DOM stabilization
- **66 networkidle waits** for SSR/hydration
- **48 regression protection tests** across 7 files

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Project-Specific Patterns](#project-specific-patterns)
3. [Timing Strategies](#timing-strategies)
4. [Selector Best Practices](#selector-best-practices)
5. [Common Pitfalls](#common-pitfalls)
6. [Accessibility Testing](#accessibility-testing)
7. [Test Organization](#test-organization)
8. [Debugging & Troubleshooting](#debugging--troubleshooting)

---

## Core Principles

### 1. Test Real User Behavior

- Test **what users see and do**, not implementation details
- Use semantic selectors (ARIA roles, labels) over CSS classes when possible
- Verify visible outcomes, not internal state

### 2. Resilient Selectors

- **Prefer**: `getByRole()`, `getByLabel()`, `getByText()`
- **Avoid**: Brittle CSS selectors, XPath, data attributes
- **Exception**: Component-specific classes for disambiguation (e.g., `.mermaid-diagram-container[role="region"]`)

### 3. Proper Wait Strategies

- **NEVER** use arbitrary timeouts without justification
- **ALWAYS** wait for specific conditions (element visible, network idle, etc.)
- **DOCUMENT** why timeouts are needed (see [Timing Strategies](#timing-strategies))

### 4. Accessibility First

- All interactive elements must meet WCAG 2.1 AA standards (≥44px touch targets)
- Test keyboard navigation for all critical flows
- Verify ARIA attributes and screen reader compatibility

---

## Project-Specific Patterns

### SvelteKit SSR/Hydration

SvelteKit applications undergo a multi-phase loading process:

1. **SSR HTML delivery** - Initial markup sent from server
2. **JavaScript loading** - Client bundles downloaded
3. **Hydration** - Svelte binds event listeners to static HTML
4. **Component mounting** - `onMount()` hooks execute

**Impact on Testing:**

```typescript
// ❌ BAD: Races with hydration
await page.goto(url);
await page.click("button");

// ✅ GOOD: Wait for network idle + buffer
await page.goto(url);
await page.waitForLoadState("networkidle"); // Wait for JS bundles
await page.waitForTimeout(500); // Extra buffer for hydration
await page.click("button");
```

**When to Use `networkidle`:**

- After `page.goto()` (all test files use this pattern)
- Before interacting with newly loaded content
- After navigation events (hash changes, back/forward)

**Typical Pattern** (from 66 instances across project):

```typescript
test.beforeEach(async ({ page }) => {
	await page.goto(SHOWCASE_URL);
	await page.waitForLoadState("networkidle");
	await page.waitForSelector(".component-container", { timeout: 15000 });
	await page.waitForTimeout(500); // Hydration buffer
});
```

### Svelte Reactive Batching

Svelte batches DOM updates for performance. Multiple state changes trigger a **single** microtask flush.

**Problem:**

```typescript
// Component code
zoomLevel = 1.25; // State change
panOffset = { x: 10, y: 20 }; // State change
// DOM updates batched together in next microtask
```

```typescript
// ❌ Test fails - reads DOM before microtask flush
await page.click('[aria-label="Zoom In"]');
const transform = await page.getAttribute(".zoom-wrapper", "style");
// May still see old value!
```

**Solution - Use `waitForFunction()` with Polling:**

```typescript
// ✅ Polls until condition met
await page.click('[aria-label="Zoom In"]');
await page.waitForFunction(
	(expectedScale) => {
		const el = document.querySelector(".zoom-wrapper");
		const style = el?.getAttribute("style");
		return style?.includes(expectedScale);
	},
	"scale(1.25)",
	{ timeout: 5000 }
);
```

**When to Use `waitForFunction()`:**

- Verifying style/attribute changes after interaction
- Checking computed values (transform, opacity, etc.)
- Waiting for complex DOM state (NOT just visibility)

### shadcn-svelte Dialog Pattern

The Dialog component uses a two-tier architecture:

1. **Trigger** - Opens dialog via `openDialog()` store
2. **Portal** - Dialog renders at `<body>` level (not in component tree)

**Selector Strategy:**

```typescript
// ✅ Find dialog at document root
const dialog = page.getByRole("dialog");
await expect(dialog).toBeVisible();

// ✅ Find content inside dialog (MUST verify component class)
// NOTE: Different components use different content classes!
// - MermaidFullView: .mermaid-full-view-content
// - CodeBlock: .code-block-dialog-content
const content = dialog.locator(".mermaid-full-view-content svg");
await expect(content).toBeVisible();
```

**Common Mistake:**

```typescript
// ❌ Wrong class name (copy-paste from inline view)
const content = dialog.locator(".mermaid-diagram-content svg");
// Fails because Dialog uses MermaidFullView, not MermaidDiagram!
```

---

## Timing Strategies

### The Hybrid Approach: `networkidle` + `waitForTimeout`

**Why Both?**

- `networkidle` waits for network requests (JS bundles, API calls)
- `waitForTimeout` waits for JavaScript execution (hydration, `onMount()`, event listeners)

**Pattern Discovery** (from `mermaid-diagram.spec.ts` debugging):

**Initial Attempt** (❌ Failed):

```typescript
test.beforeEach(async ({ page }) => {
	await page.goto(SHOWCASE_URL);
	await page.waitForSelector(".mermaid-diagram-container");
});
// Result: Elements found but clicks fail (event listeners not attached)
```

**Second Attempt** (❌ Still Failed):

```typescript
test.beforeEach(async ({ page }) => {
	await page.goto(SHOWCASE_URL);
	await page.waitForLoadState("networkidle");
	await page.waitForSelector(".mermaid-diagram-container");
});
// Result: Better, but intermittent failures on keyboard tests
```

**Final Solution** (✅ 100% Reliable):

```typescript
test.beforeEach(async ({ page }) => {
	await page.goto(SHOWCASE_URL);
	await page.waitForLoadState("networkidle");
	await page.waitForSelector('.mermaid-diagram-container[role="region"]', { timeout: 15000 });
	await page.waitForTimeout(500); // Critical for event listener attachment
});
// Result: All 23 tests passing consistently
```

### Strategic Timeout Values

| Timeout         | Use Case           | Example                                    |
| --------------- | ------------------ | ------------------------------------------ |
| **100-200ms**   | Fast animations    | Fade-in effects, tooltips                  |
| **300-500ms**   | Component mounting | After navigation, hydration buffer         |
| **500-1000ms**  | Dialog transitions | Modal open/close, expand animations        |
| **1500-2000ms** | Complex rendering  | Mermaid diagram parsing, code highlighting |

**Project Statistics:**

- **Median timeout**: 500ms (most common: hydration buffer)
- **95th percentile**: 1500ms (complex component rendering)
- **Maximum**: 2000ms (Mermaid diagram with large SVG)

### MutationObserver Anti-Pattern

**❌ DO NOT USE:**

```typescript
// Brittle and unreliable with Svelte batching
await page.evaluate(() => {
	return new Promise((resolve) => {
		const observer = new MutationObserver(() => {
			observer.disconnect();
			resolve();
		});
		observer.observe(document.body, { subtree: true, attributes: true });
	});
});
```

**Why It Fails:**

- Observer may register **after** mutation already occurred
- Svelte batches updates, observer may miss intermediate states
- Race condition between observer setup and state change

**✅ USE INSTEAD:**

```typescript
await page.waitForFunction(
	() => document.querySelector(".element")?.classList.contains("visible"),
	{ timeout: 5000 }
);
```

---

## Selector Best Practices

### Strict Mode Violations

Playwright's strict mode requires selectors to match **exactly one element**. Multi-match selectors throw errors.

**Common Violations in Project** (3 documented cases):

1. **Multiple SVGs per page**:

```typescript
// ❌ Matches all SVGs (Mermaid diagrams + Lucide icons)
const svg = page.locator("svg");

// ✅ Disambiguate with container class
const svg = page.locator(".mermaid-diagram-content svg").first();
```

2. **Repeated buttons**:

```typescript
// ❌ Multiple "Copy SVG" buttons (one per diagram)
const copyBtn = page.getByLabel(/copy svg/i);

// ✅ Scope to specific container
const diagram = page.locator(".mermaid-diagram-container").first();
const copyBtn = diagram.getByLabel(/copy svg/i);
```

3. **Navigation links**:

```typescript
// ❌ Multiple breadcrumb links with same text
const link = page.getByRole("link", { name: "Cloud Computing" });

// ✅ Scope to breadcrumb container
const breadcrumb = page.locator('[aria-label="Breadcrumb"]');
const link = breadcrumb.getByRole("link", { name: "Cloud Computing" });
```

### Selector Precedence (Recommended Order)

1. **Semantic roles** - `getByRole('button', { name: /zoom in/i })`
2. **ARIA labels** - `getByLabel(/diagram controls/i)`
3. **User-visible text** - `getByText('Expand')`
4. **Component-specific classes** - `.mermaid-diagram-container[role="region"]`
5. **Data attributes** (LAST RESORT) - `[data-testid="zoom-control"]`

---

## Common Pitfalls

### 1. Hash Routing State Pollution

**Problem**: SvelteKit apps with hash routing (`#/unit-1`) maintain state across tests.

**Symptom**:

```typescript
// Test 1: Navigates to #/unit-1/chapter-1
// Test 2: Starts with leftover state from Test 1
```

**Solution**:

```typescript
test.beforeEach(async ({ page, context }) => {
	// Clear storage to reset state
	await context.clearCookies();
	await page.evaluate(() => {
		localStorage.clear();
		sessionStorage.clear();
	});

	await page.goto(BASE_URL); // Fresh start
});
```

### 2. Clipboard Permissions

**Problem**: Clipboard API requires explicit permission grants.

**Solution**:

```typescript
test("should copy to clipboard", async ({ page, context }) => {
	// MUST grant before clipboard.writeText()
	await context.grantPermissions(["clipboard-read", "clipboard-write"]);

	await page.click('[aria-label="Copy SVG"]');
	const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
	expect(clipboardText).toContain("<svg");
});
```

### 3. Viewport-Specific Behavior

**Pattern**: Many components render differently on mobile vs desktop.

**Example** (from `mermaid-diagram.spec.ts`):

```typescript
test.describe("Desktop Viewport", () => {
	test.use({ viewport: { width: 1920, height: 1080 } });

	test("should show zoom controls", async ({ page }) => {
		// Desktop: Always visible
		await expect(page.getByLabel(/zoom controls/i)).toBeVisible();
	});
});

test.describe("Mobile Viewport", () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test("should hide zoom controls", async ({ page }) => {
		// Mobile: Hidden by default (pinch-to-zoom instead)
		await expect(page.getByLabel(/zoom controls/i)).not.toBeVisible();
	});
});
```

### 4. Focus Management

**Problem**: Keyboard tests fail because element isn't focused.

**Example**:

```typescript
// ❌ BAD: Keyboard shortcut doesn't work
await page.keyboard.press("+");
// Shortcut ignored if focus is on <body>

// ✅ GOOD: Focus target element first
const container = page.locator(".mermaid-diagram-container").first();
await container.focus();
await page.keyboard.press("+");
```

**Pro Tip**: Use `page.locator(':focus')` to debug focus issues:

```typescript
const focusedElement = page.locator(":focus");
console.log(await focusedElement.evaluate((el) => el.tagName));
```

---

## Accessibility Testing

### WCAG 2.1 AA Requirements

All interactive elements must meet these criteria:

1. **Touch Target Size**: ≥44px × 44px
2. **Keyboard Navigable**: Reachable via Tab, activatable via Enter/Space
3. **Screen Reader Friendly**: Proper ARIA labels, roles, and states
4. **Color Contrast**: ≥4.5:1 for normal text, ≥3:1 for large text

### Testing Touch Targets

**Pattern** (from `mermaid-diagram.spec.ts:258`):

```typescript
test("should have accessible touch targets (≥44px)", async ({ page }) => {
	const buttons = page.locator(".icon-grid button");
	const count = await buttons.count();

	for (let i = 0; i < count; i++) {
		const button = buttons.nth(i);
		const box = await button.boundingBox();

		expect(box?.width).toBeGreaterThanOrEqual(44);
		expect(box?.height).toBeGreaterThanOrEqual(44);
	}
});
```

### Testing Keyboard Navigation

**Full Flow Example**:

```typescript
test("should navigate with keyboard", async ({ page }) => {
	// 1. Focus first interactive element
	await page.keyboard.press("Tab");

	// 2. Verify focus moved
	const firstButton = page.locator("button:focus").first();
	await expect(firstButton).toBeFocused();

	// 3. Activate with Enter/Space
	await page.keyboard.press("Enter");

	// 4. Verify action occurred
	await expect(page.getByRole("dialog")).toBeVisible();

	// 5. Escape to close
	await page.keyboard.press("Escape");
	await expect(page.getByRole("dialog")).not.toBeVisible();
});
```

### Testing Screen Reader Compatibility

**Key Checks**:

```typescript
// Verify ARIA landmarks
const main = page.getByRole("main");
const navigation = page.getByRole("navigation");
const region = page.getByRole("region", { name: /diagram/i });

// Verify labels on controls
const button = page.getByRole("button", { name: /zoom in/i });
expect(await button.getAttribute("aria-label")).toBeTruthy();

// Verify live regions for dynamic content
const status = page.locator('[role="status"][aria-live="polite"]');
await expect(status).toBeVisible();
```

---

## Test Organization

### File Naming Convention

```
[feature]-[scenario].spec.ts
```

**Examples**:

- `mermaid-diagram.spec.ts` - MermaidDiagram component (all scenarios)
- `sticky-header.spec.ts` - StickyHeader component (position, visibility)
- `navigation-menu.spec.ts` - Navigation menu (mobile, desktop, interactions)

### Test Structure

```typescript
import { test, expect } from "@playwright/test";

// Constants at top
const SHOWCASE_URL = "/showcase/mermaid-diagrams";
const MOBILE_VIEWPORT = { width: 390, height: 844 };

// Viewport-specific test groups
test.describe("Feature - Desktop Viewport", () => {
	test.use({ viewport: { width: 1920, height: 1080 } });

	test.beforeEach(async ({ page }) => {
		// Setup code
	});

	test("scenario description", async ({ page }) => {
		// Test code
	});
});

test.describe("Feature - Mobile Viewport", () => {
	test.use({ viewport: MOBILE_VIEWPORT });

	// Mobile-specific tests
});
```

### Regression Protection Pattern

**Pattern** (48 tests across 7 files):

```typescript
test("should not have [SPECIFIC BUG]", async ({ page }) => {
	// Recreate exact conditions that caused bug
	// Assert bug no longer occurs
});
```

**Examples from project**:

- `sticky-header-regression.test.ts` - Prevents header positioning bugs
- `mermaid-diagram.spec.ts:287` - Zoom latency regression (must be <100ms)
- Performance benchmarks - Diagram rendering <500ms

---

## Debugging & Troubleshooting

### Enable Playwright UI Mode

```bash
pnpm exec playwright test --ui
```

**Benefits**:

- Visual timeline of all actions
- DOM snapshot at each step
- Network request waterfall
- Console logs and errors

### Generate Trace Files

```bash
pnpm exec playwright test --trace on
```

**View traces**:

```bash
pnpm exec playwright show-trace trace.zip
```

### Common Debug Commands

```typescript
// Take screenshot
await page.screenshot({ path: "./tmp/test/e2e/debug.png" });

// Print element info
console.log(await page.locator(".selector").boundingBox());
console.log(await page.locator(".selector").getAttribute("class"));

// Wait and inspect manually
await page.pause(); // Opens Playwright Inspector
```

### Flaky Test Investigation

**Checklist**:

1. ✅ Is `networkidle` + `waitForTimeout` used after navigation?
2. ✅ Are selectors scoped to avoid strict mode violations?
3. ✅ Is focus explicitly set for keyboard tests?
4. ✅ Are animations/transitions given time to complete?
5. ✅ Is state cleared between tests (localStorage, cookies)?

**Increase timeout temporarily** to rule out timing issues:

```typescript
await page.waitForSelector(".element", { timeout: 30000 }); // 30s
```

If test passes with longer timeout → timing issue confirmed.

### Test Report

After running tests:

```bash
pnpm exec playwright show-report tmp/test/e2e/playwright-report
```

**Key Sections**:

- **Failed tests** - Full error stack + screenshot
- **Trace viewer** - Step-by-step replay
- **Video recording** - Visual debugging (if enabled)

---

## Additional Resources

- **Playwright Docs**: https://playwright.dev/docs/intro
- **SvelteKit Testing**: https://kit.svelte.dev/docs/testing
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **shadcn-svelte Patterns**: https://www.shadcn-svelte.com/docs

---

## Contributing

When adding new E2E tests:

1. **Follow existing patterns** - Review similar tests first
2. **Use semantic selectors** - Prioritize `getByRole()` and `getByLabel()`
3. **Add comments** - Explain non-obvious waits and timeouts
4. **Test accessibility** - Include touch target, keyboard, and ARIA checks
5. **Document discoveries** - Update this README with new patterns/pitfalls

**Questions?** Check existing test files or open a discussion in the project repository.
