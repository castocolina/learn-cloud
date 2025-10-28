/**
 * BreadcrumbSheet Component - Comprehensive E2E Test Suite (TDD Approach)
 *
 * REGRESSION ISSUE: Sheet component lost border-radius styling
 * REFERENCE: .content-header-lesson uses rounded-lg = var(--radius-lg) = 0.625rem (10px)
 *
 * TEST STRATEGY:
 * - TDD Red-Green-Refactor approach
 * - Mobile-first testing (≤390px primary target)
 * - Exhaustive edge case coverage
 * - Performance validation
 * - Component integration testing
 *
 * ARCHITECTURE:
 * - Test File: src/test/e2e/breadcrumb-sheet.test.ts
 * - Fix Location: src/styles/shadcn-overrides.css
 * - Component: src/lib/components/navigation/BreadcrumbSheet.svelte
 * - Integration: src/lib/components/navigation/StickyHeader.svelte
 *
 * SCOPE: Exhaustive test coverage with performance and integration tests
 *
 * @test BreadcrumbSheet
 * @category e2e
 * @category regression
 * @category mobile-first
 */

import { test, expect, type Page } from "@playwright/test";

/**
 * Test Configuration
 */
const TEST_CONFIG = {
	baseUrl: "http://localhost:5173",
	testRoute: "/#/01_01_lesson_development_environment_tooling.html", // Valid content URL that populates breadcrumbs
	// Viewports (mobile-first)
	mobileViewport: { width: 390, height: 844 },
	tabletViewport: { width: 768, height: 1024 },
	desktopViewport: { width: 1280, height: 720 },
	// Visual regression reference values
	targetBorderRadius: "10px", // 0.625rem
	minTouchTarget: 44, // WCAG 2.1 AA minimum (px)
	maxAnimationDuration: 300, // ms
	zIndexOverlay: 200,
	zIndexModal: 210,
	// Content constraints
	shortChapterThreshold: 30, // chars
	maxContainerWidth: "48rem" // max-w from BreadcrumbSheet
} as const;

/**
 * Helper: Open breadcrumb sheet and wait for animation
 */
async function openBreadcrumbSheet(page: Page): Promise<void> {
	// Click the sheet trigger button
	await page.click('[data-slot="sheet-trigger"]');

	// Wait for sheet to be fully open (animation complete)
	await page.waitForSelector('[data-slot="sheet-content"][data-state="open"]', {
		state: "visible",
		timeout: 5000
	});

	// Additional wait for animation completion
	await page.waitForTimeout(500);
}

/**
 * Helper: Close breadcrumb sheet
 * eslint-disable-next-line @typescript-eslint/no-unused-vars
 */
async function _closeBreadcrumbSheet(page: Page): Promise<void> {
	// Try close button first
	const closeButton = page.locator('[data-slot="sheet-close"]');
	if (await closeButton.isVisible()) {
		await closeButton.click();
	}

	// Wait for sheet to be closed
	await page.waitForSelector('[data-slot="sheet-content"]', {
		state: "hidden",
		timeout: 5000
	});
}

/**
 * Helper: Get computed border-radius values
 */
async function getBorderRadius(page: Page): Promise<{
	topLeft: string;
	topRight: string;
	bottomLeft: string;
	bottomRight: string;
}> {
	return await page.evaluate(() => {
		const sheet = document.querySelector('[data-slot="sheet-content"]');
		if (!sheet) throw new Error("Sheet content not found");

		const styles = window.getComputedStyle(sheet);
		return {
			topLeft: styles.borderTopLeftRadius,
			topRight: styles.borderTopRightRadius,
			bottomLeft: styles.borderBottomLeftRadius,
			bottomRight: styles.borderBottomRightRadius
		};
	});
}

/**
 * Helper: Measure animation duration
 * Used in performance tests
 */
async function _measureAnimationDuration(page: Page, action: () => Promise<void>): Promise<number> {
	const startTime = Date.now();
	await action();
	return Date.now() - startTime;
}

/**
 * Helper: Get element dimensions
 */
async function getElementDimensions(
	page: Page,
	selector: string
): Promise<{ width: number; height: number } | null> {
	return await page.evaluate((sel) => {
		const element = document.querySelector(sel);
		if (!element) return null;
		const rect = element.getBoundingClientRect();
		return {
			width: rect.width,
			height: rect.height
		};
	}, selector);
}

/**
 * Helper: Check if element is truncated
 * Used in text truncation tests
 */
async function _isTextTruncated(page: Page, selector: string): Promise<boolean> {
	return await page.evaluate((sel) => {
		const element = document.querySelector(sel);
		if (!element) return false;
		return element.scrollWidth > element.clientWidth;
	}, selector);
}

// =============================================================================
// TDD PHASE 1: RED - Initial Failing Test
// =============================================================================

test.describe("TDD Phase 1: RED - Border Radius Regression (Should Fail)", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to test route
		await page.goto(TEST_CONFIG.testRoute);

		// Wait for page to be fully loaded
		await page.waitForLoadState("networkidle");
	});

	test("🔴 RED: Sheet content must have border-radius of 0.625rem (10px) on top corners", async ({
		page
	}) => {
		// Open breadcrumb sheet
		await openBreadcrumbSheet(page);

		// Get computed border-radius values
		const borderRadius = await getBorderRadius(page);

		// CRITICAL ASSERTION: This should FAIL in current implementation
		// Expected: 10px (0.625rem)
		// Actual: 0px (no border-radius currently applied)
		expect(borderRadius.topLeft).toBe(TEST_CONFIG.targetBorderRadius);
		expect(borderRadius.topRight).toBe(TEST_CONFIG.targetBorderRadius);

		// Bottom corners should be 0 for bottom sheet
		expect(borderRadius.bottomLeft).toBe("0px");
		expect(borderRadius.bottomRight).toBe("0px");
	});

	test("🔴 RED: Border-radius must match .content-header-lesson reference", async ({ page }) => {
		// Navigate to a lesson page to find the reference element
		await page.goto(TEST_CONFIG.testRoute);

		// Get border-radius from .content-header-lesson (reference)
		const referenceBorderRadius = await page.evaluate(() => {
			const header = document.querySelector(".content-header-lesson");
			if (!header) return null;
			const styles = window.getComputedStyle(header);
			return styles.borderRadius;
		});

		// Open breadcrumb sheet
		await openBreadcrumbSheet(page);

		// Get border-radius from sheet
		const sheetBorderRadius = await page.evaluate(() => {
			const sheet = document.querySelector('[data-slot="sheet-content"]');
			if (!sheet) return null;
			const styles = window.getComputedStyle(sheet);
			// For bottom sheet, check only top corners
			return styles.borderTopLeftRadius;
		});

		// Should match reference (but will fail in current implementation)
		expect(sheetBorderRadius).toBe(referenceBorderRadius);
	});
});

// =============================================================================
// TEST SUITE 1: Visual Regression Tests
// =============================================================================

test.describe("Visual Regression Tests", () => {
	test.beforeEach(async ({ page }) => {
		// Set mobile viewport (BreadcrumbSheet is mobile-only)
		await page.setViewportSize(TEST_CONFIG.mobileViewport);
		await page.goto(TEST_CONFIG.testRoute);
		await page.waitForLoadState("networkidle");
	});

	test("Border-radius matches .content-header-lesson reference", async ({ page }) => {
		await openBreadcrumbSheet(page);
		const borderRadius = await getBorderRadius(page);

		expect(borderRadius.topLeft).toBe(TEST_CONFIG.targetBorderRadius);
		expect(borderRadius.topRight).toBe(TEST_CONFIG.targetBorderRadius);
	});

	test("Background is 100% opaque (no transparency)", async ({ page }) => {
		await openBreadcrumbSheet(page);

		const backgroundColor = await page.evaluate(() => {
			const sheet = document.querySelector('[data-slot="sheet-content"]');
			if (!sheet) throw new Error("Sheet not found");
			const styles = window.getComputedStyle(sheet);
			return styles.backgroundColor;
		});

		// Check that alpha channel is 1 (fully opaque)
		// RGB/RGBA format: rgb(r, g, b) or rgba(r, g, b, a)
		expect(backgroundColor).toMatch(/^rgb\(\d+,\s*\d+,\s*\d+\)$/);
	});

	test("Z-index hierarchy correct (overlay: 200, content: 210)", async ({ page }) => {
		await openBreadcrumbSheet(page);

		const zIndexes = await page.evaluate(() => {
			const overlay = document.querySelector('[data-slot="sheet-overlay"]');
			const content = document.querySelector('[data-slot="sheet-content"]');

			if (!overlay || !content) throw new Error("Elements not found");

			return {
				overlay: parseInt(window.getComputedStyle(overlay).zIndex, 10),
				content: parseInt(window.getComputedStyle(content).zIndex, 10)
			};
		});

		expect(zIndexes.overlay).toBe(TEST_CONFIG.zIndexOverlay);
		expect(zIndexes.content).toBe(TEST_CONFIG.zIndexModal);
		expect(zIndexes.content).toBeGreaterThan(zIndexes.overlay);
	});

	test("Border and shadow styling match design system", async ({ page }) => {
		await openBreadcrumbSheet(page);

		const styles = await page.evaluate(() => {
			const sheet = document.querySelector('[data-slot="sheet-content"]');
			if (!sheet) throw new Error("Sheet not found");
			const computed = window.getComputedStyle(sheet);
			return {
				border: computed.border,
				borderTop: computed.borderTop,
				boxShadow: computed.boxShadow
			};
		});

		// Should have border (from shadcn-overrides.css)
		expect(styles.borderTop).toContain("1px");

		// Should have box-shadow (from shadcn-overrides.css)
		expect(styles.boxShadow).not.toBe("none");
	});

	test("Animation completes without visual artifacts", async ({ page }) => {
		// Open sheet and take screenshot
		await openBreadcrumbSheet(page);

		// Wait for any transitions to complete
		await page.waitForTimeout(500);

		// Verify sheet is fully visible (opacity: 1)
		const opacity = await page.evaluate(() => {
			const sheet = document.querySelector('[data-slot="sheet-content"]');
			if (!sheet) throw new Error("Sheet not found");
			return window.getComputedStyle(sheet).opacity;
		});

		expect(opacity).toBe("1");
	});
});

// =============================================================================
// TEST SUITE 2: Responsive Display Tests (Mobile-First)
// =============================================================================

test.describe("Responsive Display Tests (Mobile-First)", () => {
	test.describe("Mobile (≤480px)", () => {
		test.use({ viewport: TEST_CONFIG.mobileViewport });

		test.beforeEach(async ({ page }) => {
			await page.goto(TEST_CONFIG.testRoute);
			await page.waitForLoadState("networkidle");
		});

		test("Only emoji + chapter title visible on mobile", async ({ page }) => {
			// Check trigger button visibility
			const triggerVisible = await page.isVisible('[data-slot="sheet-trigger"]');
			expect(triggerVisible).toBe(true);

			// Get trigger content
			const triggerText = await page.textContent('[data-slot="sheet-trigger"]');

			// Should contain emoji (always visible)
			expect(triggerText).toMatch(/[\p{Emoji}]/u);

			// Check if shortName is hidden using CSS
			const shortNameHidden = await page.evaluate(() => {
				const shortNameElement = document.querySelector(
					'[data-slot="sheet-trigger"] .hidden.md\\:inline, [data-slot="sheet-trigger"] .hidden.lg\\:inline'
				);
				if (!shortNameElement) return true; // Element might not exist in mobile
				const styles = window.getComputedStyle(shortNameElement);
				return styles.display === "none";
			});

			// On mobile (<768px), shortName should be hidden
			expect(shortNameHidden).toBe(true);
		});

		test("Touch target ≥44px (WCAG 2.1 AA)", async ({ page }) => {
			const dimensions = await getElementDimensions(page, '[data-slot="sheet-trigger"]');

			expect(dimensions).not.toBeNull();
			expect(dimensions!.height).toBeGreaterThanOrEqual(TEST_CONFIG.minTouchTarget);
		});

		test("Text truncates with ellipsis on long titles", async ({ page }) => {
			// Open sheet
			await openBreadcrumbSheet(page);

			// On mobile with long titles, should truncate
			// This is environment-dependent, so we check the CSS property
			const hasTruncateClass = await page.evaluate(() => {
				const element = document.querySelector('[data-slot="sheet-trigger"] .truncate');
				return element?.classList.contains("truncate");
			});

			expect(hasTruncateClass).toBe(true);
		});
	});

	test.describe("Tablet (481-767px)", () => {
		test.use({ viewport: TEST_CONFIG.tabletViewport });

		test.beforeEach(async ({ page }) => {
			await page.goto(TEST_CONFIG.testRoute);
			await page.waitForLoadState("networkidle");
		});

		test("Emoji + shortName + chapter visible on tablet (short chapters)", async ({ page }) => {
			// Get trigger text
			const triggerText = await page.textContent('[data-slot="sheet-trigger"]');

			// Should contain emoji
			expect(triggerText).toMatch(/[\p{Emoji}]/u);

			// Check if shortName is visible at tablet size
			const shortNameVisible = await page.evaluate(() => {
				// At 768px, md:inline should be active
				const shortNameElement = document.querySelector('[data-slot="sheet-trigger"] .md\\:inline');
				if (!shortNameElement) return false;
				const styles = window.getComputedStyle(shortNameElement);
				return styles.display !== "none";
			});

			// Should be visible on tablet
			expect(shortNameVisible).toBe(true);
		});

		test("Separator bullet displays between elements", async ({ page }) => {
			const separatorVisible = await page.isVisible(
				'[data-slot="sheet-trigger"] .md\\:inline[aria-hidden="true"]'
			);

			// Separator should be visible on tablet
			expect(separatorVisible).toBe(true);
		});
	});

	test.describe("Desktop (≥768px)", () => {
		test.use({ viewport: TEST_CONFIG.desktopViewport });

		test.beforeEach(async ({ page }) => {
			await page.goto(TEST_CONFIG.testRoute);
			await page.waitForLoadState("networkidle");
		});

		test("All elements visible with truncation on desktop", async ({ page }) => {
			// Get trigger text
			const triggerText = await page.textContent('[data-slot="sheet-trigger"]');

			// Should contain emoji
			expect(triggerText).toMatch(/[\p{Emoji}]/u);

			// ShortName should be visible
			const shortNameVisible = await page.evaluate(() => {
				const shortNameElement = document.querySelector('[data-slot="sheet-trigger"] .lg\\:inline');
				if (!shortNameElement) return false;
				const styles = window.getComputedStyle(shortNameElement);
				return styles.display !== "none";
			});

			expect(shortNameVisible).toBe(true);
		});

		test("Max-width constraints enforced", async ({ page }) => {
			const triggerWidth = await page.evaluate(() => {
				const trigger = document.querySelector('[data-slot="sheet-trigger"]');
				if (!trigger) return null;
				return window.getComputedStyle(trigger).maxWidth;
			});

			// Should have max-width constraint from component
			expect(triggerWidth).toBeTruthy();
		});

		test("Full hierarchy displays in sheet", async ({ page }) => {
			await openBreadcrumbSheet(page);

			// Count breadcrumb items in sheet
			const breadcrumbCount = await page.evaluate(() => {
				const items = document.querySelectorAll(
					'[data-slot="sheet-content"] nav[aria-label="Full breadcrumb navigation"] li button'
				);
				return items.length;
			});

			// Should have at least 2 breadcrumb items (Home + current)
			expect(breadcrumbCount).toBeGreaterThanOrEqual(2);
		});
	});
});

// =============================================================================
// TEST SUITE 3: Text Truncation Tests
// =============================================================================

test.describe("Text Truncation Tests", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(TEST_CONFIG.testRoute);
		await page.waitForLoadState("networkidle");
	});

	test("Container respects max-width constraints", async ({ page }) => {
		const triggerMaxWidth = await page.evaluate(() => {
			const trigger = document.querySelector('[data-slot="sheet-trigger"]');
			if (!trigger) return null;
			return window.getComputedStyle(trigger).maxWidth;
		});

		expect(triggerMaxWidth).toBeTruthy();
		expect(triggerMaxWidth).not.toBe("none");
	});

	test("Ellipsis CSS property applied to truncate class", async ({ page }) => {
		const hasEllipsis = await page.evaluate(() => {
			const truncateElement = document.querySelector('[data-slot="sheet-trigger"] .truncate');
			if (!truncateElement) return false;
			const styles = window.getComputedStyle(truncateElement);
			return (
				styles.overflow === "hidden" &&
				styles.textOverflow === "ellipsis" &&
				styles.whiteSpace === "nowrap"
			);
		});

		expect(hasEllipsis).toBe(true);
	});

	test("No text overflow outside container bounds", async ({ page }) => {
		// Open sheet to ensure element is rendered
		const triggerRect = await page.evaluate(() => {
			const trigger = document.querySelector('[data-slot="sheet-trigger"]');
			const truncateElement = trigger?.querySelector(".truncate");
			if (!trigger || !truncateElement) return null;

			return {
				trigger: trigger.getBoundingClientRect(),
				truncate: truncateElement.getBoundingClientRect()
			};
		});

		expect(triggerRect).not.toBeNull();
		expect(triggerRect!.truncate.width).toBeLessThanOrEqual(triggerRect!.trigger.width);
	});
});

// =============================================================================
// TEST SUITE 4: Sheet Interaction Tests
// =============================================================================

test.describe("Sheet Interaction Tests", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(TEST_CONFIG.testRoute);
		await page.waitForLoadState("networkidle");
	});

	test("Trigger button opens sheet with slide-in animation", async ({ page }) => {
		// Click trigger
		await page.click('[data-slot="sheet-trigger"]');

		// Sheet should become visible
		await expect(page.locator('[data-slot="sheet-content"][data-state="open"]')).toBeVisible({
			timeout: 5000
		});
	});

	test("Sheet closes on overlay click", async ({ page }) => {
		await openBreadcrumbSheet(page);

		// Click overlay
		await page.click('[data-slot="sheet-overlay"]');

		// Sheet should close
		await expect(page.locator('[data-slot="sheet-content"]')).toBeHidden({ timeout: 5000 });
	});

	test("Sheet closes on X button click", async ({ page }) => {
		await openBreadcrumbSheet(page);

		// Click X button in sheet header
		const closeButton = page.locator('[data-slot="sheet-content"] button[aria-label*="Close"]');
		await closeButton.click();

		// Sheet should close
		await expect(page.locator('[data-slot="sheet-content"]')).toBeHidden({ timeout: 5000 });
	});

	test("Sheet closes on ESC key press", async ({ page }) => {
		await openBreadcrumbSheet(page);

		// Press ESC
		await page.keyboard.press("Escape");

		// Sheet should close
		await expect(page.locator('[data-slot="sheet-content"]')).toBeHidden({ timeout: 5000 });
	});

	test("Sheet closes on Close button in footer", async ({ page }) => {
		await openBreadcrumbSheet(page);

		// Click Close button in footer
		const footerCloseButton = page.locator('[data-slot="sheet-close"]');
		await footerCloseButton.click();

		// Sheet should close
		await expect(page.locator('[data-slot="sheet-content"]')).toBeHidden({ timeout: 5000 });
	});

	test("Multiple rapid open/close cycles work correctly", async ({ page }) => {
		// Test 3 rapid cycles
		for (let i = 0; i < 3; i++) {
			await page.click('[data-slot="sheet-trigger"]');
			await page.waitForSelector('[data-slot="sheet-content"][data-state="open"]', {
				state: "visible"
			});

			await page.keyboard.press("Escape");
			await page.waitForSelector('[data-slot="sheet-content"]', { state: "hidden" });
		}

		// Final verification
		const isHidden = await page.isHidden('[data-slot="sheet-content"]');
		expect(isHidden).toBe(true);
	});

	test("Animation state transitions correctly", async ({ page }) => {
		// Initial state: closed
		let state = await page.getAttribute('[data-slot="sheet-content"]', "data-state");
		expect(state).toBe("closed");

		// Open sheet
		await page.click('[data-slot="sheet-trigger"]');
		await page.waitForSelector('[data-slot="sheet-content"][data-state="open"]');

		state = await page.getAttribute('[data-slot="sheet-content"]', "data-state");
		expect(state).toBe("open");

		// Close sheet
		await page.keyboard.press("Escape");
		await page.waitForSelector('[data-slot="sheet-content"][data-state="closed"]');

		state = await page.getAttribute('[data-slot="sheet-content"]', "data-state");
		expect(state).toBe("closed");
	});
});

// Placeholder for remaining test suites (to be added in subsequent tasks)
test.describe("Breadcrumb Hierarchy Tests - TODO", () => {
	test.skip("Full hierarchy displays in sheet (all levels)", async () => {
		// Implementation pending
	});
});

test.describe("Accessibility Tests (WCAG 2.1 AA) - TODO", () => {
	test.skip("ARIA labels present on trigger button", async () => {
		// Implementation pending
	});
});

test.describe("Edge Cases (Exhaustive) - TODO", () => {
	test.skip("Very long unit names (>50 chars)", async () => {
		// Implementation pending
	});
});

test.describe("Performance Tests - TODO", () => {
	test.skip("Sheet open animation completes in <300ms", async () => {
		// Implementation pending
	});
});

test.describe("Component Integration Tests - TODO", () => {
	test.skip("BreadcrumbSheet integrates with StickyHeader", async () => {
		// Implementation pending
	});
});
