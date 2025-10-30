/**
 * IconButton Variants E2E Tests
 *
 * End-to-end tests that verify computed styles are actually applied correctly.
 * These tests ensure that CSS classes translate to real visual changes in the browser.
 *
 * Test Coverage:
 * - All variants (default, primary, destructive, ghost) have correct background colors
 * - All states (default, active, success, error) have correct feedback colors
 * - Hover states change background opacity
 * - Disabled state reduces opacity
 * - Ghost variant remains transparent
 *
 * Rationale: Type safety ensures correct prop values, but doesn't guarantee CSS works.
 * These tests verify the entire chain: TypeScript → Classes → CSS → Rendered Styles.
 */

import { test, expect } from "@playwright/test";

// ============================================================================
// Test Configuration
// ============================================================================

const TEST_PAGE = "/showcase/icon-button";

// Helper to parse RGB/RGBA strings to array
function parseColor(colorString: string): number[] | null {
	const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
	if (!match) return null;
	return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseFloat(match[4] || "1")];
}

// Helper to check if color is "red-ish" (for destructive variant)
function isRedish(rgb: number[] | null): boolean {
	if (!rgb) return false;
	// Red channel should be significantly higher than green and blue
	return rgb[0] > rgb[1] + 30 && rgb[0] > rgb[2] + 30;
}

// Helper to check if color is transparent or very light (alpha < 0.3 or RGB values > 240)
function isTransparentOrLight(colorString: string): boolean {
	if (colorString === "rgba(0, 0, 0, 0)") return true;
	const rgb = parseColor(colorString);
	if (!rgb) return false;
	// Check if alpha is low OR color is very light (near white)
	return rgb[3] < 0.3 || (rgb[0] > 240 && rgb[1] > 240 && rgb[2] > 240);
}

// Helper to check if color has visible opacity (background with transparency)
function hasBackground(colorString: string): boolean {
	return colorString !== "rgba(0, 0, 0, 0)" && colorString !== "transparent";
}

// ============================================================================
// Variant Tests - Verify Correct Color Schemes
// ============================================================================

test.describe("IconButton Variants - Computed Styles", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(TEST_PAGE);
		// Wait for page to be fully loaded
		await page.waitForSelector('[data-testid="default-button"]');
	});

	test("variant='default' has visible background (not transparent)", async ({ page }) => {
		const button = page.locator('[data-testid="default-button"]');
		const bg = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);

		expect(hasBackground(bg)).toBe(true);
	});

	test("variant='primary' has colored background", async ({ page }) => {
		const button = page.locator('[data-testid="primary-button"]');
		const bg = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);

		// Primary should have a background (not fully transparent)
		expect(hasBackground(bg)).toBe(true);
	});

	test("variant='destructive' has red-ish background", async ({ page }) => {
		const button = page.locator('[data-testid="destructive-button"]');
		const bg = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);
		const color = await button.evaluate((el) => window.getComputedStyle(el).color);

		// Background should exist
		expect(hasBackground(bg)).toBe(true);

		// Color (text) should be red-ish
		const rgb = parseColor(color);
		expect(isRedish(rgb)).toBe(true);
	});

	test("variant='ghost' has transparent background", async ({ page }) => {
		const button = page.locator('[data-testid="ghost-button"]');
		const bg = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);

		// Ghost should be transparent or very light
		expect(isTransparentOrLight(bg)).toBe(true);
	});
});

// ============================================================================
// State Tests - Verify Dynamic Feedback Colors
// ============================================================================

test.describe("IconButton States - Computed Styles", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(TEST_PAGE);
		await page.waitForSelector('[data-testid="state-default-button"]');
	});

	test("iconState='success' has green-ish color", async ({ page }) => {
		const button = page.locator('[data-testid="state-success-button"]');
		const color = await button.evaluate((el) => window.getComputedStyle(el).color);

		const rgb = parseColor(color);
		expect(rgb).not.toBeNull();
		// Green channel should be higher than others for success state
		if (rgb) {
			expect(rgb[1]).toBeGreaterThan(rgb[0]);
		}
	});

	test("iconState='error' has red-ish color", async ({ page }) => {
		const button = page.locator('[data-testid="state-error-button"]');
		const color = await button.evaluate((el) => window.getComputedStyle(el).color);

		const rgb = parseColor(color);
		expect(isRedish(rgb)).toBe(true);
	});

	test("iconState='active' has visible background", async ({ page }) => {
		const button = page.locator('[data-testid="state-active-button"]');
		const bg = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);

		expect(hasBackground(bg)).toBe(true);
	});
});

// ============================================================================
// Hover State Tests - Verify Interactive Feedback
// ============================================================================

test.describe("IconButton Hover States", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(TEST_PAGE);
		await page.waitForSelector('[data-testid="default-button"]');
	});

	test("hover increases background opacity on default variant", async ({ page }) => {
		const button = page.locator('[data-testid="default-button"]');

		const bgBefore = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);
		await button.hover();
		// Wait for CSS hover state to be applied
		await page.waitForTimeout(100);
		const bgAfter = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);

		// Background should change on hover
		expect(bgBefore).not.toBe(bgAfter);
	});

	test("ghost variant shows background on hover", async ({ page }) => {
		const button = page.locator('[data-testid="ghost-button"]');

		const bgBefore = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);
		await button.hover();
		// Wait for CSS hover state to be applied
		await page.waitForTimeout(100);
		const bgAfter = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);

		// Ghost should be transparent before hover
		expect(isTransparentOrLight(bgBefore)).toBe(true);

		// Ghost should have background on hover
		expect(hasBackground(bgAfter)).toBe(true);
	});
});

// ============================================================================
// Disabled State Tests
// ============================================================================

test.describe("IconButton Disabled State", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(TEST_PAGE);
		await page.waitForSelector('[data-testid="disabled-default-button"]');
	});

	test("disabled buttons have reduced opacity", async ({ page }) => {
		const button = page.locator('[data-testid="disabled-default-button"]');
		const opacity = await button.evaluate((el) => window.getComputedStyle(el).opacity);

		expect(parseFloat(opacity)).toBeLessThan(1);
	});

	test("disabled buttons have cursor not-allowed", async ({ page }) => {
		const button = page.locator('[data-testid="disabled-default-button"]');
		const cursor = await button.evaluate((el) => window.getComputedStyle(el).cursor);

		expect(cursor).toBe("not-allowed");
	});

	test("disabled buttons ignore clicks", async ({ page }) => {
		const button = page.locator('[data-testid="disabled-default-button"]');
		const clickCount = page.locator('[data-testid="click-count"]');

		const countBefore = await clickCount.textContent();
		await button.click({ force: true }); // Force click despite disabled state
		const countAfter = await clickCount.textContent();

		// Click count should not change (onClick not called)
		expect(countBefore).toBe(countAfter);
	});
});

// ============================================================================
// Combination Tests - Verify Variant + State Work Together
// ============================================================================

test.describe("IconButton Variant + State Combinations", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(TEST_PAGE);
	});

	test("primary + success combination applies both styles", async ({ page }) => {
		const button = page.locator('[data-testid="primary-success-button"]');
		const bg = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);
		const color = await button.evaluate((el) => window.getComputedStyle(el).color);

		// Should have background from success state
		expect(hasBackground(bg)).toBe(true);

		// Should have green-ish color from success state
		const rgb = parseColor(color);
		if (rgb) {
			expect(rgb[1]).toBeGreaterThan(rgb[0]); // Green > Red
		}
	});

	test("destructive + error combination emphasizes red", async ({ page }) => {
		const button = page.locator('[data-testid="destructive-error-button"]');
		const color = await button.evaluate((el) => window.getComputedStyle(el).color);

		// Both destructive variant and error state use red, should be visible
		const rgb = parseColor(color);
		expect(isRedish(rgb)).toBe(true);
	});
});

// ============================================================================
// Integration Test - Real Usage Scenario
// ============================================================================

test.describe("IconButton Real Usage Scenarios", () => {
	test("click interaction updates state correctly", async ({ page }) => {
		await page.goto(TEST_PAGE);

		const defaultButton = page.locator('[data-testid="default-button"]');
		const clickCount = page.locator('[data-testid="click-count"]');
		const lastClicked = page.locator('[data-testid="last-clicked"]');

		// Initial state
		expect(await clickCount.textContent()).toBe("0");

		// Click button
		await defaultButton.click();

		// Verify state updated
		expect(await clickCount.textContent()).toBe("1");
		expect(await lastClicked.textContent()).toBe("default");
	});
});
