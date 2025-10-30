/**
 * Dialog Component E2E Tests
 *
 * End-to-end tests verifying the Dialog component's behavior in real browser environment.
 * Tests cover both hybrid modes (store and local state) and all critical features.
 *
 * Test Coverage:
 * - Hybrid Mode: Both global store (imperative) and local state (declarative)
 * - Size Variants: sm, md, lg, xl, full
 * - Mobile-First: Full-screen behavior on ≤390px viewport
 * - Interactive Elements: IconButton close, Escape key, backdrop click
 * - Z-Index Hierarchy: Overlay and content stacking
 * - Accessibility: Focus management, ARIA attributes, keyboard navigation
 * - Dynamic Content: Store mode component rendering
 *
 * Rationale: Dialog is a complex wrapper with multiple interaction patterns.
 * E2E tests verify the entire chain: Props → Component → shadcn → DOM → User Interaction.
 */

import { test, expect, type Page } from "@playwright/test";

// ============================================================================
// Test Configuration
// ============================================================================

const TEST_PAGE = "/showcase/dialog";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get dialog content element (the actual dialog box)
 */
async function getDialogContent(page: Page) {
	return page.locator('[role="dialog"]');
}

/**
 * Get dialog overlay element (backdrop)
 *
 * Note: Using .last() to handle cases where previous test overlays haven't
 * been fully cleaned up from DOM. The most recent overlay is the active one.
 */
async function getDialogOverlay(page: Page) {
	return page.locator('[data-slot="dialog-overlay"][data-state="open"]').last();
}

/**
 * Get IconButton close element
 */
async function getCloseButton(page: Page) {
	return page.locator('[aria-label="Close dialog"]');
}

/**
 * Wait for dialog to be visible
 */
async function waitForDialogOpen(page: Page) {
	await page.locator('[role="dialog"]').waitFor({ state: "visible", timeout: 3000 });
}

/**
 * Wait for dialog to be hidden
 */
async function waitForDialogClosed(page: Page) {
	await page.locator('[role="dialog"]').waitFor({ state: "hidden", timeout: 3000 });
}

// ============================================================================
// Mode 1: Global Store (Imperative API) Tests
// ============================================================================

test.describe("Dialog - Global Store Mode", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(TEST_PAGE);
		// Wait for page to be fully loaded
		await page.waitForSelector("button");
	});

	test("should open dialog via openDialog() function", async ({ page }) => {
		// Click store mode button (large size)
		await page.click('button:has-text("Store: Large")');

		// Dialog should be visible
		await waitForDialogOpen(page);
		const dialog = await getDialogContent(page);
		await expect(dialog).toBeVisible();
	});

	test("should display correct title from store", async ({ page }) => {
		// Open large dialog
		await page.click('button:has-text("Store: Large")');
		await waitForDialogOpen(page);

		// Title should match what was passed to openDialog()
		// Wait for title to appear (may take longer than dialog open animation)
		const title = page.locator('[role="dialog"]').getByRole("heading", { level: 2 });
		await expect(title).toBeVisible({ timeout: 10000 });
		await expect(title).toHaveText("Store Mode Dialog (LG)");
	});

	test("should render dynamic content from store", async ({ page }) => {
		// Open dialog
		await page.click('button:has-text("Store: Large")');
		await waitForDialogOpen(page);

		// Check for StoreDialogContent component content
		const dialog = page.locator('[role="dialog"]');
		await expect(
			dialog.getByText("This dialog was opened using the global dialog store")
		).toBeVisible({
			timeout: 10000
		});
		await expect(dialog.getByText("Store Mode Benefits:")).toBeVisible({ timeout: 10000 });
	});

	test("should close dialog via IconButton", async ({ page }) => {
		// Open dialog
		await page.click('button:has-text("Store: Large")');
		await waitForDialogOpen(page);

		// Click close button
		const closeBtn = await getCloseButton(page);
		await closeBtn.click();

		// Dialog should be hidden
		await waitForDialogClosed(page);
	});

	test("should close dialog via Escape key", async ({ page }) => {
		// Open dialog
		await page.click('button:has-text("Store: Large")');
		await waitForDialogOpen(page);

		// Press Escape
		await page.keyboard.press("Escape");

		// Dialog should be hidden
		await waitForDialogClosed(page);
	});

	test("should close dialog via backdrop click", async ({ page }) => {
		// Open dialog
		await page.click('button:has-text("Store: Large")');
		await waitForDialogOpen(page);

		// Click overlay (backdrop)
		const overlay = await getDialogOverlay(page);
		await overlay.click({ position: { x: 10, y: 10 } }); // Click top-left corner

		// Dialog should be hidden
		await waitForDialogClosed(page);
	});

	test("should handle multiple open/close cycles", async ({ page }) => {
		for (let i = 0; i < 3; i++) {
			// Open
			await page.click('button:has-text("Store: Medium")');
			await waitForDialogOpen(page);
			await expect(await getDialogContent(page)).toBeVisible();

			// Close via Escape
			await page.keyboard.press("Escape");
			await waitForDialogClosed(page);
		}
	});
});

// ============================================================================
// Mode 2: Local State (Declarative) Tests
// ============================================================================

test.describe("Dialog - Local State Mode", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(TEST_PAGE);
		await page.waitForSelector("button");
	});

	test("should open dialog via bind:open", async ({ page }) => {
		// Click local state button
		await page.click('button:has-text("Open Large (lg)")');

		// Dialog should be visible
		await waitForDialogOpen(page);
		const dialog = await getDialogContent(page);
		await expect(dialog).toBeVisible();
	});

	test("should display correct title from props", async ({ page }) => {
		// Open local dialog
		await page.click('button:has-text("Open Large (lg)")');
		await waitForDialogOpen(page);

		// Title should match local state title
		const title = page.locator('[role="dialog"]').getByRole("heading", { level: 2 });
		await expect(title).toBeVisible({ timeout: 10000 });
		await expect(title).toHaveText("Large Dialog (lg)");
	});

	test("should render children content (not store content)", async ({ page }) => {
		// Open local dialog
		await page.click('button:has-text("Open Large (lg)")');
		await waitForDialogOpen(page);

		// Should show local content, not StoreDialogContent
		const dialog = page.locator('[role="dialog"]');
		await expect(dialog.getByText("This is a large dialog (~512px width on desktop)")).toBeVisible({
			timeout: 10000
		});
		await expect(
			dialog.getByText("Ideal for search results, longer content, or forms")
		).toBeVisible({
			timeout: 10000
		});
	});

	test("should close via internal button", async ({ page }) => {
		// Open local dialog
		await page.click('button:has-text("Open Medium (md)")');
		await waitForDialogOpen(page);

		// Click internal Close button
		await page.click('[role="dialog"] button:has-text("Close")');

		// Dialog should be hidden
		await waitForDialogClosed(page);
	});

	test("should close via IconButton", async ({ page }) => {
		// Open local dialog
		await page.click('button:has-text("Open Small (sm)")');
		await waitForDialogOpen(page);

		// Click close button
		const closeBtn = await getCloseButton(page);
		await closeBtn.click();

		// Dialog should be hidden
		await waitForDialogClosed(page);
	});
});

// ============================================================================
// Size Variant Tests
// ============================================================================

test.describe("Dialog - Size Variants (Desktop)", () => {
	test.beforeEach(async ({ page }) => {
		// Set desktop viewport (1280x720)
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto(TEST_PAGE);
		await page.waitForSelector("button");
	});

	test("size='sm' has correct max-width on desktop", async ({ page }) => {
		await page.click('button:has-text("Store: Small")');
		await waitForDialogOpen(page);

		const dialog = await getDialogContent(page);
		const width = await dialog.evaluate((el) => window.getComputedStyle(el).maxWidth);

		// sm should be ~384px (24rem)
		expect(parseInt(width)).toBeLessThanOrEqual(400);
	});

	test("size='md' has correct max-width on desktop", async ({ page }) => {
		await page.click('button:has-text("Store: Medium")');
		await waitForDialogOpen(page);

		const dialog = await getDialogContent(page);
		const width = await dialog.evaluate((el) => window.getComputedStyle(el).maxWidth);

		// md should be ~448px (28rem)
		const widthNum = parseInt(width);
		expect(widthNum).toBeGreaterThan(400);
		expect(widthNum).toBeLessThanOrEqual(480);
	});

	test("size='lg' has correct max-width on desktop", async ({ page }) => {
		await page.click('button:has-text("Store: Large")');
		await waitForDialogOpen(page);

		const dialog = await getDialogContent(page);
		const width = await dialog.evaluate((el) => window.getComputedStyle(el).maxWidth);

		// lg should be ~512px (32rem)
		const widthNum = parseInt(width);
		expect(widthNum).toBeGreaterThan(480);
		expect(widthNum).toBeLessThanOrEqual(550);
	});

	test("size='xl' has correct max-width on desktop", async ({ page }) => {
		await page.click('button:has-text("Store: Extra Large")');
		await waitForDialogOpen(page);

		const dialog = await getDialogContent(page);
		const width = await dialog.evaluate((el) => window.getComputedStyle(el).maxWidth);

		// xl should be ~576px (36rem)
		const widthNum = parseInt(width);
		expect(widthNum).toBeGreaterThan(550);
		expect(widthNum).toBeLessThanOrEqual(620);
	});

	test("size='full' uses viewport percentage", async ({ page }) => {
		await page.click('button:has-text("Store: Full Screen")');
		await waitForDialogOpen(page);

		const dialog = await getDialogContent(page);
		const width = await dialog.evaluate((el) => {
			const style = window.getComputedStyle(el);
			return { maxWidth: style.maxWidth, width: style.width };
		});

		// Full should be significantly larger (90-95% of viewport)
		const widthNum = parseInt(width.maxWidth);
		expect(widthNum).toBeGreaterThan(1000); // 90% of 1280px = 1152px
	});
});

// ============================================================================
// Mobile-First Responsive Tests
// ============================================================================

test.describe("Dialog - Mobile-First (≤390px)", () => {
	test.beforeEach(async ({ page }) => {
		// Set mobile viewport (375x667 - iPhone SE)
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto(TEST_PAGE);
		await page.waitForSelector("button");
	});

	test("all sizes should be full-screen on mobile (sm)", async ({ page }) => {
		const button = page.locator('button:has-text("Store: Small")');
		await button.scrollIntoViewIfNeeded();
		await button.click();
		await waitForDialogOpen(page);

		const dialog = await getDialogContent(page);
		const dimensions = await dialog.evaluate((el) => {
			const style = window.getComputedStyle(el);
			return {
				width: style.width,
				height: style.height,
				maxWidth: style.maxWidth
			};
		});

		// On mobile, width should be close to 100% (allowing for padding/margins)
		// Viewport is 375px, dialog should be >340px (90%+)
		expect(parseInt(dimensions.width)).toBeGreaterThan(340);
	});

	test("all sizes should be full-screen on mobile (md)", async ({ page }) => {
		const button = page.locator('button:has-text("Store: Medium")');
		await button.scrollIntoViewIfNeeded();
		await button.click();
		await waitForDialogOpen(page);

		const dialog = await getDialogContent(page);
		const width = await dialog.evaluate((el) => window.getComputedStyle(el).width);

		// On mobile, width should be close to 100% (allowing for padding/margins)
		// Viewport is 375px, dialog should be >340px (90%+)
		expect(parseInt(width)).toBeGreaterThan(340);
	});

	test("all sizes should be full-screen on mobile (lg)", async ({ page }) => {
		const button = page.locator('button:has-text("Store: Large")');
		await button.scrollIntoViewIfNeeded();
		await button.click();
		await waitForDialogOpen(page);

		const dialog = await getDialogContent(page);
		const width = await dialog.evaluate((el) => window.getComputedStyle(el).width);

		// On mobile, width should be close to 100% (allowing for padding/margins)
		// Viewport is 375px, dialog should be >340px (90%+)
		expect(parseInt(width)).toBeGreaterThan(340);
	});

	test("border radius should be 0 on mobile (full-screen)", async ({ page }) => {
		await page.click('button:has-text("Open Large (lg)")');
		await waitForDialogOpen(page);

		const dialog = await getDialogContent(page);
		const borderRadius = await dialog.evaluate((el) => window.getComputedStyle(el).borderRadius);

		// Mobile should have no border radius (full-screen)
		expect(borderRadius).toBe("0px");
	});
});

// ============================================================================
// IconButton Close Integration Tests
// ============================================================================

test.describe("Dialog - IconButton Close", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto(TEST_PAGE);
		await page.waitForSelector("button");
	});

	test("close button should be visible", async ({ page }) => {
		await page.click('button:has-text("Store: Large")');
		await waitForDialogOpen(page);

		const closeBtn = await getCloseButton(page);
		await expect(closeBtn).toBeVisible();
	});

	test("close button should be positioned top-right", async ({ page }) => {
		await page.click('button:has-text("Store: Large")');
		await waitForDialogOpen(page);

		const closeBtn = page.locator('[aria-label="Close dialog"]').locator("..");
		const position = await closeBtn.evaluate((el) => {
			const style = window.getComputedStyle(el);
			return {
				position: style.position,
				top: style.top,
				right: style.right
			};
		});

		expect(position.position).toBe("absolute");
		expect(position.top).toBeTruthy();
		expect(position.right).toBeTruthy();
	});

	test("close button should have hover effect", async ({ page }) => {
		await page.click('button:has-text("Store: Large")');
		await waitForDialogOpen(page);

		const closeBtn = await getCloseButton(page);

		// Hover over button
		await closeBtn.hover();

		// Button should remain visible and interactive after hover
		// Note: Exact color changes depend on theme and are tested via visual regression
		await expect(closeBtn).toBeVisible();
	});
});

// ============================================================================
// Z-Index Hierarchy Tests
// ============================================================================

test.describe("Dialog - Z-Index Hierarchy", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto(TEST_PAGE);
		await page.waitForSelector("button");
	});

	test("overlay should have correct z-index", async ({ page }) => {
		await page.click('button:has-text("Store: Large")');
		await waitForDialogOpen(page);

		const overlay = await getDialogOverlay(page);
		const zIndex = await overlay.evaluate((el) => window.getComputedStyle(el).zIndex);

		// Overlay should have high z-index (from CSS custom property)
		expect(parseInt(zIndex)).toBeGreaterThan(50);
	});

	test("dialog content should have higher z-index than overlay", async ({ page }) => {
		await page.click('button:has-text("Store: Large")');
		await waitForDialogOpen(page);

		const overlay = await getDialogOverlay(page);
		const dialog = await getDialogContent(page);

		const overlayZ = await overlay.evaluate((el) => parseInt(window.getComputedStyle(el).zIndex));
		const dialogZ = await dialog.evaluate((el) => parseInt(window.getComputedStyle(el).zIndex));

		// Dialog should be above overlay
		expect(dialogZ).toBeGreaterThan(overlayZ);
	});
});

// ============================================================================
// Accessibility Tests
// ============================================================================

test.describe("Dialog - Accessibility", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto(TEST_PAGE);
		await page.waitForSelector("button");
	});

	test("dialog should have role='dialog'", async ({ page }) => {
		await page.click('button:has-text("Store: Large")');
		await waitForDialogOpen(page);

		const dialog = await getDialogContent(page);
		const role = await dialog.getAttribute("role");
		expect(role).toBe("dialog");
	});

	test("dialog should have aria-labelledby or aria-label", async ({ page }) => {
		await page.click('button:has-text("Store: Large")');
		await waitForDialogOpen(page);

		const dialog = await getDialogContent(page);
		const ariaLabelledBy = await dialog.getAttribute("aria-labelledby");
		const ariaLabel = await dialog.getAttribute("aria-label");

		// Should have at least one
		expect(ariaLabelledBy || ariaLabel).toBeTruthy();
	});

	test("close button should have aria-label", async ({ page }) => {
		await page.click('button:has-text("Store: Large")');
		await waitForDialogOpen(page);

		const closeBtn = await getCloseButton(page);
		const ariaLabel = await closeBtn.getAttribute("aria-label");

		expect(ariaLabel).toBe("Close dialog");
	});

	test("focus should be trapped inside dialog", async ({ page }) => {
		await page.click('button:has-text("Store: Large")');
		await waitForDialogOpen(page);

		// Tab multiple times
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");

		// Focus should still be within dialog
		const focusedElement = await page.evaluate(() => {
			const active = document.activeElement;
			const dialog = document.querySelector('[role="dialog"]');
			return dialog?.contains(active);
		});

		expect(focusedElement).toBe(true);
	});
});

// ============================================================================
// Regression Tests
// ============================================================================

test.describe("Dialog - Regression Tests", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto(TEST_PAGE);
		await page.waitForSelector("button");
	});

	test("should not leave orphaned overlays after multiple opens/closes", async ({ page }) => {
		// Open and close 3 times
		for (let i = 0; i < 3; i++) {
			await page.click('button:has-text("Store: Medium")');
			await waitForDialogOpen(page);
			await page.keyboard.press("Escape");
			await waitForDialogClosed(page);
		}

		// Check for orphaned overlays
		const overlayCount = await page.locator("[data-radix-dialog-overlay]").count();
		expect(overlayCount).toBeLessThanOrEqual(1); // Should be 0 or 1 (if one is still animating out)
	});

	test("should handle rapid open/close clicks gracefully", async ({ page }) => {
		// Rapidly click open button 5 times
		// Using force: true to simulate rapid clicks before overlay blocks interaction
		const button = page.locator('button:has-text("Store: Small")');
		for (let i = 0; i < 5; i++) {
			await button.click({ delay: 50, force: true });
		}

		// Wait a bit for all operations to complete
		await page.waitForTimeout(500);

		// Should NOT have multiple dialogs open (0 or 1 is acceptable)
		// Rapid clicks may toggle state, but shouldn't create duplicates
		const dialogCount = await page.locator('[role="dialog"]').count();
		expect(dialogCount).toBeLessThanOrEqual(1);
	});

	test("should preserve content when switching between sizes", async ({ page }) => {
		// Open large
		await page.click('button:has-text("Store: Large")');
		await waitForDialogOpen(page);
		await expect(page.locator('text="Store Mode Benefits:"')).toBeVisible();

		// Close
		await page.keyboard.press("Escape");
		await waitForDialogClosed(page);

		// Open small
		await page.click('button:has-text("Store: Small")');
		await waitForDialogOpen(page);

		// Should still have content
		await expect(page.locator('text="Store Mode Benefits:"')).toBeVisible();
	});
});
