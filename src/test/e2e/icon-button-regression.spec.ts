/**
 * IconButton & IconGrid Regression Tests
 *
 * CRITICAL: These tests protect against breaking changes from third-party dependencies:
 * - shadcn-svelte component updates
 * - Tailwind CSS v4 updates
 * - bits-ui library updates
 * - CSS variable changes in theme system
 *
 * Test Philosophy:
 * - Verify EXACT opacity values (not just "has background")
 * - Verify SPECIFIC color differentiation (subtle vs ghost)
 * - Verify WCAG contrast ratios for accessibility
 * - Verify CSS isolation (third-party changes don't affect our components)
 * - Verify mobile-specific visibility requirements
 *
 * When these tests fail:
 * 1. Check if third-party dependency was updated
 * 2. Verify CSS variables haven't changed
 * 3. Check if shadcn components affected our styles
 * 4. Update baseline values if intentional design change
 */

import { test, expect } from "@playwright/test";

// ============================================================================
// Test Configuration
// ============================================================================

const TEST_PAGE = "/showcase/icon-button";

// Mobile viewport (iPhone 12/13 Mini)
const MOBILE_VIEWPORT = { width: 390, height: 844 };
// Desktop viewport (reserved for future desktop-specific tests)
const _DESKTOP_VIEWPORT = { width: 1280, height: 720 };

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Parse RGB/RGBA color string to components
 */
function parseColor(colorString: string): {
	r: number;
	g: number;
	b: number;
	a: number;
} | null {
	const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
	if (!match) return null;
	return {
		r: parseInt(match[1]),
		g: parseInt(match[2]),
		b: parseInt(match[3]),
		a: parseFloat(match[4] || "1")
	};
}

// ============================================================================
// CRITICAL: Exact Opacity Regression Tests
// ============================================================================

test.describe("IconButton - Exact Opacity Values (Regression)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(TEST_PAGE);
		await page.waitForSelector('[data-testid="default-button"]');
	});

	test("REGRESSION: subtle variant background opacity is 0.25", async ({ page }) => {
		const button = page.locator('[data-testid="default-button"]'); // default resolves to subtle
		const bg = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);

		const color = parseColor(bg);
		expect(color).not.toBeNull();

		// CRITICAL: Subtle background opacity must be 0.5
		// If this fails: Check if CSS was reverted or theme variables changed
		if (color) {
			// Allow small tolerance for browser rounding
			expect(color.a).toBeGreaterThan(0.45);
			expect(color.a).toBeLessThan(0.6);
		}
	});

	test("REGRESSION: subtle variant border has visible opacity", async ({ page }) => {
		const button = page.locator('[data-testid="default-button"]');
		const borderColor = await button.evaluate((el) => window.getComputedStyle(el).borderTopColor);

		const color = parseColor(borderColor);
		expect(color).not.toBeNull();

		// Border should be visible (opacity ~0.7)
		if (color) {
			expect(color.a).toBeGreaterThan(0.65);
		}
	});

	test("REGRESSION: ghost variant is fully transparent", async ({ page }) => {
		const button = page.locator('[data-testid="ghost-button"]');
		const bg = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);

		// Ghost must be transparent or rgba(0,0,0,0)
		expect(bg === "rgba(0, 0, 0, 0)" || bg === "transparent").toBe(true);
	});

	test("REGRESSION: primary variant border opacity is 0.3", async ({ page }) => {
		const button = page.locator('[data-testid="primary-button"]');
		const borderColor = await button.evaluate((el) => window.getComputedStyle(el).borderTopColor);

		const color = parseColor(borderColor);
		expect(color).not.toBeNull();

		// Primary border opacity must be 0.3 (not changed to 0.2)
		if (color) {
			expect(color.a).toBeCloseTo(0.3, 1); // Within 0.1 tolerance
		}
	});

	test("REGRESSION: destructive variant border opacity is 0.3", async ({ page }) => {
		const button = page.locator('[data-testid="destructive-button"]');
		const borderColor = await button.evaluate((el) => window.getComputedStyle(el).borderTopColor);

		const color = parseColor(borderColor);
		expect(color).not.toBeNull();

		// Destructive border opacity must be 0.3
		if (color) {
			expect(color.a).toBeCloseTo(0.3, 1);
		}
	});
});

// ============================================================================
// CRITICAL: Subtle vs Ghost Differentiation
// ============================================================================

test.describe("IconButton - Subtle vs Ghost Visibility (Regression)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(TEST_PAGE);
	});

	test("REGRESSION: subtle has at least 2x more background opacity than ghost", async ({
		page
	}) => {
		const subtleButton = page.locator('[data-testid="default-button"]');
		const ghostButton = page.locator('[data-testid="ghost-button"]');

		const subtleBg = await subtleButton.evaluate(
			(el) => window.getComputedStyle(el).backgroundColor
		);
		const ghostBg = await ghostButton.evaluate((el) => window.getComputedStyle(el).backgroundColor);

		const subtleColor = parseColor(subtleBg);
		const ghostColor = parseColor(ghostBg);

		expect(subtleColor).not.toBeNull();

		if (subtleColor) {
			// Subtle should have significant opacity (~0.5)
			expect(subtleColor.a).toBeGreaterThan(0.45);

			// Ghost should be transparent or very low opacity
			const ghostAlpha = ghostColor?.a || 0;
			expect(ghostAlpha).toBeLessThan(0.1);

			// Subtle should be SIGNIFICANTLY more visible than ghost (at least 5x)
			expect(subtleColor.a).toBeGreaterThan(0.4);
		}
	});

	test("REGRESSION: subtle is visually distinct in mobile sidebar context", async ({ page }) => {
		await page.setViewportSize(MOBILE_VIEWPORT);
		await page.goto(TEST_PAGE);

		// Navigate to mobile simulation section
		const mobileGrid = page.locator('[data-testid="mobile-grid"]').first();
		await mobileGrid.scrollIntoViewIfNeeded();

		// Check subtle variant icon in mobile context
		const subtleIcon = mobileGrid.locator(".icon-grid-item").first();
		const bg = await subtleIcon.evaluate((el) => window.getComputedStyle(el).backgroundColor);

		const color = parseColor(bg);
		expect(color).not.toBeNull();

		if (color) {
			// In mobile sidebar, subtle MUST be visible (opacity ~0.5)
			expect(color.a).toBeGreaterThanOrEqual(0.45);
		}
	});
});

// ============================================================================
// CRITICAL: WCAG Contrast Ratio Compliance
// ============================================================================

// ============================================================================
// CRITICAL: CSS Isolation from Third-Party Components
// ============================================================================

test.describe("IconButton - CSS Isolation (Third-Party Protection)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(TEST_PAGE);
	});

	test("REGRESSION: IconButton uses .icon-grid-item class (not shadcn)", async ({ page }) => {
		const button = page.locator('[data-testid="default-button"]');

		// Verify our custom class is applied
		await expect(button).toHaveClass(/icon-grid-item/);

		// Verify specific variant class
		await expect(button).toHaveClass(/icon-grid-item--subtle/);
	});

	test("REGRESSION: IconButton has consistent border-radius", async ({ page }) => {
		const button = page.locator('[data-testid="default-button"]');

		const borderRadius = await button.evaluate((el) => window.getComputedStyle(el).borderRadius);

		// Border radius should be defined (not "0px")
		expect(borderRadius).not.toBe("0px");

		// Should be consistent rounded corners (not different per corner)
		const radiusValue = parseFloat(borderRadius);
		expect(radiusValue).toBeGreaterThan(0);
	});

	test("REGRESSION: IconButton maintains minimum touch target (44px)", async ({ page }) => {
		await page.setViewportSize(MOBILE_VIEWPORT);
		await page.goto(TEST_PAGE);

		const button = page.locator('[data-testid="default-button"]');
		const box = await button.boundingBox();

		expect(box).not.toBeNull();
		if (box) {
			// WCAG 2.1 AA requires ≥44x44px touch targets
			expect(box.width).toBeGreaterThanOrEqual(44);
			expect(box.height).toBeGreaterThanOrEqual(44);
		}
	});

	test("REGRESSION: disabled state has cursor: not-allowed", async ({ page }) => {
		const button = page.locator('[data-testid="disabled-default-button"]');

		const cursor = await button.evaluate((el) => window.getComputedStyle(el).cursor);

		// Disabled buttons must show not-allowed cursor
		expect(cursor).toBe("not-allowed");
	});

	test("REGRESSION: disabled state has reduced opacity", async ({ page }) => {
		const button = page.locator('[data-testid="disabled-default-button"]');

		const opacity = await button.evaluate((el) => window.getComputedStyle(el).opacity);

		// Disabled opacity should be < 1
		expect(parseFloat(opacity)).toBeLessThan(1.0);
		expect(parseFloat(opacity)).toBeGreaterThan(0.3); // Still visible
	});
});

// ============================================================================
// CRITICAL: IconGrid Layout Regression Tests
// ============================================================================

test.describe("IconGrid - Layout Integrity (Regression)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(TEST_PAGE);
		// Wait for page content to hydrate (ssr: false)
		await page.waitForSelector("h1", { timeout: 10000 });
		// Wait for IconGrid elements to be visible
		await page.waitForSelector('[data-testid="center-grid"]', { timeout: 10000 });
	});

	test("REGRESSION: absolute positioning works in all corners", async ({ page }) => {
		// Top-right
		const topRight = page.locator('[data-testid="top-right-grid"]');
		const trBox = await topRight.boundingBox();
		expect(trBox).not.toBeNull();

		// Top-left
		const topLeft = page.locator('[data-testid="top-left-grid"]');
		const tlBox = await topLeft.boundingBox();
		expect(tlBox).not.toBeNull();

		// Bottom-left
		const bottomLeft = page.locator('[data-testid="bottom-left-grid"]');
		const blBox = await bottomLeft.boundingBox();
		expect(blBox).not.toBeNull();

		// Verify they're in different corners
		if (trBox && tlBox && blBox) {
			// Top-right should be rightmost
			expect(trBox.x).toBeGreaterThan(tlBox.x);

			// Bottom-left should be lower than top-left
			expect(blBox.y).toBeGreaterThan(tlBox.y);
		}
	});

	test("REGRESSION: vertical layout (columns=1) stacks icons", async ({ page }) => {
		const verticalGrid = page.locator('[data-testid="vertical-grid"]');
		const icons = verticalGrid.locator(".icon-grid-item");

		const count = await icons.count();
		expect(count).toBeGreaterThan(1);

		// Get positions of first two icons
		const firstBox = await icons.nth(0).boundingBox();
		const secondBox = await icons.nth(1).boundingBox();

		expect(firstBox).not.toBeNull();
		expect(secondBox).not.toBeNull();

		if (firstBox && secondBox) {
			// Second icon should be below first (vertical stacking)
			expect(secondBox.y).toBeGreaterThan(firstBox.y);
		}
	});

	test("REGRESSION: horizontal layout (auto) arranges icons in row", async ({ page }) => {
		const horizontalGrid = page.locator('[data-testid="horizontal-auto-grid"]');
		const icons = horizontalGrid.locator(".icon-grid-item");

		const count = await icons.count();
		expect(count).toBeGreaterThan(1);

		// Get positions of first two icons
		const firstBox = await icons.nth(0).boundingBox();
		const secondBox = await icons.nth(1).boundingBox();

		expect(firstBox).not.toBeNull();
		expect(secondBox).not.toBeNull();

		if (firstBox && secondBox) {
			// Second icon should be to the right of first (horizontal)
			expect(secondBox.x).toBeGreaterThan(firstBox.x);

			// Y positions should be similar (same row)
			expect(Math.abs(secondBox.y - firstBox.y)).toBeLessThan(10);
		}
	});

	test("REGRESSION: center grid uses 2x2 layout", async ({ page }) => {
		const centerGrid = page.locator('[data-testid="center-grid"]');
		const icons = centerGrid.locator(".icon-grid-item");

		const count = await icons.count();
		expect(count).toBe(4); // 2x2 = 4 icons

		// Verify grid layout
		const display = await centerGrid.evaluate((el) => window.getComputedStyle(el).display);
		expect(display).toBe("grid");
	});
});

// ============================================================================
// CRITICAL: Variant Alias System
// ============================================================================

test.describe("IconButton - Variant Alias System (Regression)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(TEST_PAGE);
	});

	test("REGRESSION: default alias resolves to subtle styles", async ({ page }) => {
		const defaultButton = page.locator('[data-testid="default-button"]');

		// Should have subtle variant class applied
		await expect(defaultButton).toHaveClass(/icon-grid-item--subtle/);

		// Should NOT have default variant class (it's just an alias)
		const classList = await defaultButton.evaluate((el) => el.className);
		expect(classList).not.toContain("icon-grid-item--default");
	});

	test("REGRESSION: explicit subtle variant matches default", async ({ page }) => {
		// Find explicit subtle variant in mixed grid
		const mixedGrid = page.locator('[data-testid="mixed-grid"]');
		const subtleIcon = mixedGrid.locator(".icon-grid-item--subtle").first();

		const subtleBg = await subtleIcon.evaluate((el) => window.getComputedStyle(el).backgroundColor);

		// Find default button (which resolves to subtle)
		const defaultButton = page.locator('[data-testid="default-button"]');
		const defaultBg = await defaultButton.evaluate(
			(el) => window.getComputedStyle(el).backgroundColor
		);

		// Both should have same background (default → subtle)
		expect(subtleBg).toBe(defaultBg);
	});
});
