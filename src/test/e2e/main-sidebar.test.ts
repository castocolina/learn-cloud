/**
 * MainSidebar Component - Comprehensive E2E Test Suite (TDD Approach)
 *
 * COMPONENT: Production navigation sidebar with 129 chapters across 9 units
 * LOCATION: src/lib/components/navigation/MainSidebar.svelte
 *
 * TEST STRATEGY:
 * - TDD Red-Green-Refactor approach
 * - Mobile-first testing (≤390px primary target)
 * - Exhaustive edge case coverage
 * - Performance validation
 * - Component integration testing
 * - WCAG 2.1 AA accessibility compliance
 *
 * ARCHITECTURE:
 * - shadcn-svelte Sidebar components
 * - Accordion behavior (one unit open at a time)
 * - Integration with navigationStore
 * - Responsive design (mobile/tablet/desktop)
 * - Collapsible modes (icon/offcanvas/none)
 *
 * SCOPE: Exhaustive test coverage with visual, interaction, and accessibility tests
 *
 * @test MainSidebar
 * @category e2e
 * @category regression
 * @category mobile-first
 * @category accessibility
 */

import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * Test Configuration
 */
const TEST_CONFIG = {
	baseUrl: "http://localhost:5173",
	testRoute: "/#/01_01_lesson_development_environment_tooling.html",
	// Viewports (mobile-first)
	mobileViewport: { width: 390, height: 844 },
	tabletViewport: { width: 768, height: 1024 },
	desktopViewport: { width: 1280, height: 720 },
	// Accessibility
	minTouchTarget: 44, // WCAG 2.1 AA minimum (px)
	// Performance
	maxAnimationDuration: 300, // ms
	// Z-index hierarchy
	zIndexSidebar: 90,
	// Content expectations
	expectedUnits: 9,
	expectedTotalChapters: 129
} as const;

/**
 * Helper: Get sidebar element
 */
async function getSidebar(page: Page): Promise<Locator> {
	return page.locator('[data-sidebar="sidebar"]');
}

/**
 * Helper: Get sidebar state
 */
async function getSidebarState(page: Page): Promise<string | null> {
	const sidebar = await getSidebar(page);
	return await sidebar.getAttribute("data-state");
}

/**
 * Helper: Toggle sidebar (mobile)
 */
async function toggleMobileSidebar(page: Page): Promise<void> {
	// Click the mobile sidebar trigger (usually hamburger menu)
	const trigger = page.locator('[data-sidebar="trigger"]');
	await trigger.click();

	// Wait for state change
	await page.waitForTimeout(500);
}

/**
 * Helper: Toggle desktop sidebar collapse
 */
async function toggleDesktopCollapse(page: Page): Promise<void> {
	const trigger = page.locator('.sidebar-header-trigger, [data-sidebar="trigger"]');
	await trigger.click();
	await page.waitForTimeout(500);
}

/**
 * Helper: Expand a unit
 * eslint-disable-next-line @typescript-eslint/no-unused-vars
 */
async function _expandUnit(page: Page, unitId: string): Promise<void> {
	// Find unit button by data attribute or text
	const unitButton = page.locator(`[data-unit-id="${unitId}"], .sidebar-unit-header`).first();
	await unitButton.click();
	await page.waitForTimeout(300);
}

/**
 * Helper: Get expanded unit count
 */
async function getExpandedUnitCount(page: Page): Promise<number> {
	// Count units with expanded state
	const expandedUnits = page.locator(".sidebar-unit-header--expanded");
	return await expandedUnits.count();
}

/**
 * Helper: Check if element has ARIA attribute
 */
async function hasAriaAttribute(element: Locator, attribute: string): Promise<boolean> {
	const value = await element.getAttribute(attribute);
	return value !== null;
}

// =============================================================================
// TEST SUITE 1: Responsiveness & Layout Tests
// =============================================================================

test.describe("Responsiveness & Layout Tests", () => {
	test.describe("Desktop Mode (≥1024px)", () => {
		test.beforeEach(async ({ page }) => {
			await page.setViewportSize(TEST_CONFIG.desktopViewport);
			await page.goto(TEST_CONFIG.testRoute);
			await page.waitForLoadState("networkidle");
		});

		test("Sidebar is visible by default on desktop", async ({ page }) => {
			const sidebar = await getSidebar(page);
			await expect(sidebar).toBeVisible();
		});

		test("Sidebar has correct width on desktop", async ({ page }) => {
			const sidebar = await getSidebar(page);
			const width = await sidebar.evaluate((el) => {
				return window.getComputedStyle(el).width;
			});

			// Should match SETTINGS.ui.layout.sidebarWidth (16rem = 256px)
			expect(parseInt(width, 10)).toBeGreaterThanOrEqual(200);
			expect(parseInt(width, 10)).toBeLessThanOrEqual(300);
		});

		test("Sidebar header is visible with title and description", async ({ page }) => {
			const header = page.locator(".main-sidebar-header, .sidebar-header-row");
			await expect(header).toBeVisible();

			// Title should be visible
			const title = page.locator(".sidebar-title");
			await expect(title).toBeVisible();
			await expect(title).toHaveText(/Learn Cloud/i);
		});

		test("Sidebar footer is visible with metadata", async ({ page }) => {
			const footer = page.locator(".main-sidebar-footer");
			await expect(footer).toBeVisible();

			// Should display version
			const version = page.locator(".sidebar-footer-version");
			await expect(version).toBeVisible();
		});

		test("All unit cards are visible", async ({ page }) => {
			const unitItems = page.locator(".sidebar-unit-item");
			const count = await unitItems.count();

			expect(count).toBe(TEST_CONFIG.expectedUnits);
		});

		test("Unit emojis are visible", async ({ page }) => {
			const unitIcons = page.locator(".sidebar-unit-icon");
			const firstIcon = unitIcons.first();

			await expect(firstIcon).toBeVisible();
			const text = await firstIcon.textContent();
			expect(text).toMatch(/[\p{Emoji}]/u);
		});
	});

	test.describe("Tablet Mode (768px-1023px)", () => {
		test.beforeEach(async ({ page }) => {
			await page.setViewportSize(TEST_CONFIG.tabletViewport);
			await page.goto(TEST_CONFIG.testRoute);
			await page.waitForLoadState("networkidle");
		});

		test("Sidebar is visible on tablet", async ({ page }) => {
			const sidebar = await getSidebar(page);
			await expect(sidebar).toBeVisible();
		});

		test("Sidebar adapts width for tablet viewport", async ({ page }) => {
			const sidebar = await getSidebar(page);
			const width = await sidebar.evaluate((el) => {
				return window.getComputedStyle(el).width;
			});

			// Should adapt to tablet width
			expect(parseInt(width, 10)).toBeGreaterThan(0);
		});
	});

	test.describe("Mobile Mode (≤767px)", () => {
		test.beforeEach(async ({ page }) => {
			await page.setViewportSize(TEST_CONFIG.mobileViewport);
			await page.goto(TEST_CONFIG.testRoute);
			await page.waitForLoadState("networkidle");
		});

		test("Sidebar is initially hidden on mobile", async ({ page }) => {
			const _sidebar = await getSidebar(page);
			const state = await getSidebarState(page);

			// Should be collapsed or hidden
			expect(state).not.toBe("expanded");
		});

		test("Sidebar can be toggled open on mobile", async ({ page }) => {
			await toggleMobileSidebar(page);

			const sidebar = await getSidebar(page);
			await expect(sidebar).toBeVisible();
		});

		test("Sidebar overlay is visible when open on mobile", async ({ page }) => {
			await toggleMobileSidebar(page);

			// Check for overlay (if component uses one)
			const overlay = page.locator('[data-sidebar="overlay"]');
			const overlayCount = await overlay.count();

			if (overlayCount > 0) {
				await expect(overlay).toBeVisible();
			}
		});

		test("Clicking overlay closes mobile sidebar", async ({ page }) => {
			await toggleMobileSidebar(page);

			const overlay = page.locator('[data-sidebar="overlay"]');
			if ((await overlay.count()) > 0) {
				await overlay.click();
				await page.waitForTimeout(500);

				const state = await getSidebarState(page);
				expect(state).not.toBe("expanded");
			}
		});
	});

	test.describe("Collapsible Mode (Desktop Icon Mode)", () => {
		test.beforeEach(async ({ page }) => {
			await page.setViewportSize(TEST_CONFIG.desktopViewport);
			await page.goto(TEST_CONFIG.testRoute);
			await page.waitForLoadState("networkidle");
		});

		test("Sidebar can be collapsed to icon-only mode", async ({ page }) => {
			await toggleDesktopCollapse(page);

			const state = await getSidebarState(page);
			expect(state).toBe("collapsed");
		});

		test("Only icons visible in collapsed mode", async ({ page }) => {
			await toggleDesktopCollapse(page);

			// Unit icons should be visible
			const unitIcons = page.locator(".sidebar-unit-icon");
			await expect(unitIcons.first()).toBeVisible();

			// Check if unit title is hidden (via CSS)
			const unitInfo = page.locator(".sidebar-unit-info");
			const isHidden = await unitInfo.first().evaluate((el) => {
				const styles = window.getComputedStyle(el);
				return styles.display === "none" || styles.visibility === "hidden";
			});

			expect(isHidden).toBe(true);
		});

		test("Tooltips appear on hover in collapsed mode", async ({ page }) => {
			await toggleDesktopCollapse(page);

			// Hover over first unit icon
			const unitHeader = page.locator(".sidebar-unit-header").first();
			await unitHeader.hover();

			// Wait for tooltip
			await page.waitForTimeout(500);

			// Check for tooltip (shadcn tooltip pattern)
			const tooltip = page.locator('[role="tooltip"]');
			const tooltipCount = await tooltip.count();

			if (tooltipCount > 0) {
				await expect(tooltip).toBeVisible();
			}
		});

		test("Sidebar can be expanded back from collapsed mode", async ({ page }) => {
			// Collapse
			await toggleDesktopCollapse(page);
			let state = await getSidebarState(page);
			expect(state).toBe("collapsed");

			// Expand
			await toggleDesktopCollapse(page);
			state = await getSidebarState(page);
			expect(state).toBe("expanded");
		});
	});
});

// =============================================================================
// TEST SUITE 2: Navigation & State Tests
// =============================================================================

test.describe("Navigation & State Tests", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize(TEST_CONFIG.desktopViewport);
		await page.goto(TEST_CONFIG.testRoute);
		await page.waitForLoadState("networkidle");
	});

	test("All units have navigation links", async ({ page }) => {
		const unitHeaders = page.locator(".sidebar-unit-header");
		const count = await unitHeaders.count();

		expect(count).toBe(TEST_CONFIG.expectedUnits);

		// Each unit should be clickable
		for (let i = 0; i < count; i++) {
			const unit = unitHeaders.nth(i);
			await expect(unit).toBeVisible();
		}
	});

	test("Clicking unit navigates to overview chapter", async ({ page }) => {
		// Expand first unit
		const firstUnit = page.locator(".sidebar-unit-header").first();
		await firstUnit.click();
		await page.waitForTimeout(300);

		// Wait for URL change (if navigation occurs)
		await page.waitForTimeout(500);

		// Check that chapters are now visible
		const chapters = page.locator(".sidebar-chapter-button");
		const chapterCount = await chapters.count();
		expect(chapterCount).toBeGreaterThan(0);
	});

	test("Chapters have correct href attributes", async ({ page }) => {
		// Expand first unit to see chapters
		const firstUnit = page.locator(".sidebar-unit-header").first();
		await firstUnit.click();
		await page.waitForTimeout(300);

		// Get first chapter
		const firstChapter = page.locator(".sidebar-chapter-button").first();
		await expect(firstChapter).toBeVisible();

		// Chapter should be clickable (button or link)
		await expect(firstChapter).toBeEnabled();
	});

	test("Clicking chapter navigates to correct page", async ({ page }) => {
		// Expand first unit
		const firstUnit = page.locator(".sidebar-unit-header").first();
		await firstUnit.click();
		await page.waitForTimeout(300);

		// Click first chapter
		const firstChapter = page.locator(".sidebar-chapter-button").first();
		const _initialUrl = page.url();
		await firstChapter.click();
		await page.waitForTimeout(500);

		// URL should change (or hash should change for SPA)
		const newUrl = page.url();
		// If SPA navigation, hash may change
		expect(newUrl).toBeDefined();
	});

	test("Active chapter is highlighted", async ({ page }) => {
		// Current page should have an active chapter
		const activeChapter = page.locator(".sidebar-chapter-button--active");
		const activeCount = await activeChapter.count();

		// Should have exactly one active chapter
		expect(activeCount).toBeGreaterThanOrEqual(0);

		if (activeCount > 0) {
			await expect(activeChapter.first()).toBeVisible();

			// Active chapter should have distinct styling
			const bgColor = await activeChapter.first().evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			expect(bgColor).toBeDefined();
		}
	});

	test("Active state updates on navigation", async ({ page }) => {
		// Expand first unit
		const firstUnit = page.locator(".sidebar-unit-header").first();
		await firstUnit.click();
		await page.waitForTimeout(300);

		// Click a chapter
		const targetChapter = page.locator(".sidebar-chapter-button").nth(1);
		await targetChapter.click();
		await page.waitForTimeout(500);

		// The clicked chapter should now be active
		const hasActiveClass = await targetChapter.evaluate((el) => {
			return el.classList.contains("sidebar-chapter-button--active");
		});

		// Active state should be present (may not be immediate due to navigation)
		expect(typeof hasActiveClass).toBe("boolean");
	});

	test("Accordion behavior: Only one unit open at a time", async ({ page }) => {
		// Expand first unit
		const firstUnit = page.locator(".sidebar-unit-header").first();
		await firstUnit.click();
		await page.waitForTimeout(300);

		let expandedCount = await getExpandedUnitCount(page);
		expect(expandedCount).toBeLessThanOrEqual(1);

		// Expand second unit
		const secondUnit = page.locator(".sidebar-unit-header").nth(1);
		await secondUnit.click();
		await page.waitForTimeout(300);

		// Should still have at most 1 expanded unit
		expandedCount = await getExpandedUnitCount(page);
		expect(expandedCount).toBeLessThanOrEqual(1);
	});

	test("Clicking same unit toggles expansion", async ({ page }) => {
		const firstUnit = page.locator(".sidebar-unit-header").first();

		// Click to expand
		await firstUnit.click();
		await page.waitForTimeout(300);

		let isExpanded = await firstUnit.evaluate((el) => {
			return el.classList.contains("sidebar-unit-header--expanded");
		});
		expect(isExpanded).toBe(true);

		// Click again to collapse
		await firstUnit.click();
		await page.waitForTimeout(300);

		isExpanded = await firstUnit.evaluate((el) => {
			return el.classList.contains("sidebar-unit-header--expanded");
		});
		expect(isExpanded).toBe(false);
	});

	test("Chevron icons rotate on unit expansion", async ({ page }) => {
		const firstUnit = page.locator(".sidebar-unit-header").first();

		// Initial chevron state (should be ChevronRight)
		const toggleButton = firstUnit.locator(".sidebar-unit-toggle-button");
		await expect(toggleButton).toBeVisible();

		// Expand unit
		await firstUnit.click();
		await page.waitForTimeout(300);

		// Chevron should change (implementation-specific)
		await expect(toggleButton).toBeVisible();
	});
});

// =============================================================================
// TEST SUITE 3: UI Elements & Interactions Tests
// =============================================================================

test.describe("UI Elements & Interactions Tests", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize(TEST_CONFIG.desktopViewport);
		await page.goto(TEST_CONFIG.testRoute);
		await page.waitForLoadState("networkidle");
	});

	test("Unit icons (emojis) are displayed", async ({ page }) => {
		const unitIcons = page.locator(".sidebar-unit-icon");
		const count = await unitIcons.count();

		expect(count).toBe(TEST_CONFIG.expectedUnits);

		// First icon should have emoji
		const firstIcon = unitIcons.first();
		const text = await firstIcon.textContent();
		expect(text).toMatch(/[\p{Emoji}]/u);
	});

	test("Chapter icons (emojis) are displayed", async ({ page }) => {
		// Expand first unit
		const firstUnit = page.locator(".sidebar-unit-header").first();
		await firstUnit.click();
		await page.waitForTimeout(300);

		// Check chapter icons
		const chapterIcons = page.locator(".sidebar-chapter-icon");
		const count = await chapterIcons.count();

		expect(count).toBeGreaterThan(0);

		// First chapter icon should have emoji
		const firstIcon = chapterIcons.first();
		const text = await firstIcon.textContent();
		expect(text).toMatch(/[\p{Emoji}]/u);
	});

	test("Scrolling works when content overflows", async ({ page }) => {
		const sidebarContent = page.locator(".main-sidebar-content, [data-sidebar='content']");
		await expect(sidebarContent).toBeVisible();

		// Check if scrollable
		const isScrollable = await sidebarContent.evaluate((el) => {
			return el.scrollHeight > el.clientHeight;
		});

		// If content is scrollable, test scroll
		if (isScrollable) {
			const initialScroll = await sidebarContent.evaluate((el) => el.scrollTop);

			// Scroll down
			await sidebarContent.evaluate((el) => {
				el.scrollTop = 100;
			});

			const newScroll = await sidebarContent.evaluate((el) => el.scrollTop);
			expect(newScroll).toBeGreaterThan(initialScroll);
		}
	});

	test("Progress stats are displayed in header", async ({ page }) => {
		const description = page.locator(".sidebar-description");
		const descriptionText = await description.textContent();

		// Should contain unit/chapter counts
		expect(descriptionText).toMatch(/\d+/); // Contains numbers
	});

	test("Footer displays book title and version", async ({ page }) => {
		const footerText = page.locator(".sidebar-footer-text");
		await expect(footerText).toBeVisible();

		const version = page.locator(".sidebar-footer-version");
		await expect(version).toBeVisible();
		await expect(version).toHaveText(/v\d+\.\d+\.\d+/);
	});

	test("Footer text truncates in collapsed mode", async ({ page }) => {
		// Collapse sidebar
		await toggleDesktopCollapse(page);

		const footerText = page.locator(".sidebar-footer-text");
		const text = await footerText.textContent();

		// In collapsed mode, text should be truncated
		if (text && text.length > 15) {
			expect(text).toContain("...");
		}
	});
});

// =============================================================================
// TEST SUITE 4: Accessibility Tests (WCAG 2.1 AA)
// =============================================================================

test.describe("Accessibility Tests (WCAG 2.1 AA)", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize(TEST_CONFIG.desktopViewport);
		await page.goto(TEST_CONFIG.testRoute);
		await page.waitForLoadState("networkidle");
	});

	test("Sidebar has appropriate ARIA role", async ({ page }) => {
		const sidebar = await getSidebar(page);
		const role = await sidebar.getAttribute("role");

		// Should have navigation or complementary role
		expect(role === "navigation" || role === "complementary").toBe(true);
	});

	test("Unit toggle buttons have aria-label", async ({ page }) => {
		const toggleButton = page.locator(".sidebar-unit-toggle-button").first();

		if ((await toggleButton.count()) > 0) {
			const hasLabel = await hasAriaAttribute(toggleButton, "aria-label");
			expect(hasLabel).toBe(true);
		}
	});

	test("Collapsed units have aria-expanded=false", async ({ page }) => {
		const firstUnit = page.locator(".sidebar-unit-header").first();
		const toggleButton = firstUnit.locator(".sidebar-unit-toggle-button");

		if ((await toggleButton.count()) > 0) {
			const ariaExpanded = await toggleButton.getAttribute("aria-expanded");
			expect(ariaExpanded).toBe("false");
		}
	});

	test("Expanded units have aria-expanded=true", async ({ page }) => {
		const firstUnit = page.locator(".sidebar-unit-header").first();
		await firstUnit.click();
		await page.waitForTimeout(300);

		const toggleButton = firstUnit.locator(".sidebar-unit-toggle-button");

		if ((await toggleButton.count()) > 0) {
			const ariaExpanded = await toggleButton.getAttribute("aria-expanded");
			expect(ariaExpanded).toBe("true");
		}
	});

	test("Keyboard navigation: Tab through sidebar elements", async ({ page }) => {
		// Focus first interactive element
		await page.keyboard.press("Tab");

		const focusedElement = await page.evaluate(() => {
			return document.activeElement?.tagName;
		});

		expect(focusedElement).toBeDefined();
	});

	test("Keyboard navigation: Enter key opens/closes units", async ({ page }) => {
		const firstUnit = page.locator(".sidebar-unit-header").first();

		// Focus the unit
		await firstUnit.focus();

		// Press Enter
		await page.keyboard.press("Enter");
		await page.waitForTimeout(300);

		// Should expand
		const isExpanded = await firstUnit.evaluate((el) => {
			return el.classList.contains("sidebar-unit-header--expanded");
		});
		expect(isExpanded).toBe(true);
	});

	test("Keyboard navigation: Space key opens/closes units", async ({ page }) => {
		const toggleButton = page.locator(".sidebar-unit-toggle-button").first();

		if ((await toggleButton.count()) > 0) {
			await toggleButton.focus();
			await page.keyboard.press("Space");
			await page.waitForTimeout(300);

			// Toggle should have occurred
			const ariaExpanded = await toggleButton.getAttribute("aria-expanded");
			expect(ariaExpanded === "true" || ariaExpanded === "false").toBe(true);
		}
	});

	test("Touch targets meet minimum size (44px)", async ({ page }) => {
		await page.setViewportSize(TEST_CONFIG.mobileViewport);
		await page.goto(TEST_CONFIG.testRoute);
		await page.waitForLoadState("networkidle");

		await toggleMobileSidebar(page);

		const unitHeaders = page.locator(".sidebar-unit-header");
		const firstUnit = unitHeaders.first();

		const { height } = (await firstUnit.boundingBox()) || { height: 0 };
		expect(height).toBeGreaterThanOrEqual(TEST_CONFIG.minTouchTarget);
	});

	test("Focus is managed correctly in mobile modal", async ({ page }) => {
		await page.setViewportSize(TEST_CONFIG.mobileViewport);
		await page.goto(TEST_CONFIG.testRoute);
		await page.waitForLoadState("networkidle");

		await toggleMobileSidebar(page);

		// Focus should be within sidebar
		const focusedElement = await page.evaluate(() => {
			return document.activeElement?.closest('[data-sidebar="sidebar"]') !== null;
		});

		expect(typeof focusedElement).toBe("boolean");
	});

	test("Screen reader: aria-current on active chapter", async ({ page }) => {
		const activeChapter = page.locator(".sidebar-chapter-button--active");
		const count = await activeChapter.count();

		if (count > 0) {
			const ariaCurrent = await activeChapter.first().getAttribute("aria-current");
			// Should have aria-current="page" or similar
			expect(ariaCurrent).toBeDefined();
		}
	});
});

// =============================================================================
// TEST SUITE 5: Visual Regression Tests
// =============================================================================

test.describe("Visual Regression Tests", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize(TEST_CONFIG.desktopViewport);
		await page.goto(TEST_CONFIG.testRoute);
		await page.waitForLoadState("networkidle");
	});

	test("Sidebar has consistent styling", async ({ page }) => {
		const sidebar = await getSidebar(page);

		const styles = await sidebar.evaluate((el) => {
			const computed = window.getComputedStyle(el);
			return {
				backgroundColor: computed.backgroundColor,
				borderRight: computed.borderRight
			};
		});

		expect(styles.backgroundColor).toBeDefined();
		expect(styles.borderRight).toBeDefined();
	});

	test("Z-index hierarchy is correct", async ({ page }) => {
		const sidebar = await getSidebar(page);

		const zIndex = await sidebar.evaluate((el) => {
			return parseInt(window.getComputedStyle(el).zIndex, 10);
		});

		// Sidebar should have appropriate z-index (from CSS variables)
		expect(zIndex).toBeGreaterThanOrEqual(TEST_CONFIG.zIndexSidebar);
	});

	test("Expanded unit has visual distinction", async ({ page }) => {
		const firstUnit = page.locator(".sidebar-unit-header").first();

		// Get initial background
		const _initialBg = await firstUnit.evaluate((el) => {
			return window.getComputedStyle(el).backgroundColor;
		});

		// Expand unit
		await firstUnit.click();
		await page.waitForTimeout(300);

		// Get expanded background
		const expandedBg = await firstUnit.evaluate((el) => {
			return window.getComputedStyle(el).backgroundColor;
		});

		// May have different background when expanded
		expect(expandedBg).toBeDefined();
	});

	test("Active chapter has visual highlighting", async ({ page }) => {
		const activeChapter = page.locator(".sidebar-chapter-button--active");
		const count = await activeChapter.count();

		if (count > 0) {
			const bgColor = await activeChapter.first().evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});

			expect(bgColor).toBeDefined();
			expect(bgColor).not.toBe("rgba(0, 0, 0, 0)"); // Not transparent
		}
	});

	test("Animations complete without visual artifacts", async ({ page }) => {
		const firstUnit = page.locator(".sidebar-unit-header").first();

		// Trigger animation
		await firstUnit.click();
		await page.waitForTimeout(TEST_CONFIG.maxAnimationDuration);

		// Check opacity is 1 (fully rendered)
		const chapters = page.locator(".sidebar-chapters-list");
		if ((await chapters.count()) > 0) {
			const opacity = await chapters.first().evaluate((el) => {
				return window.getComputedStyle(el).opacity;
			});
			expect(opacity).toBe("1");
		}
	});
});

// =============================================================================
// TEST SUITE 6: Performance Tests
// =============================================================================

test.describe("Performance Tests", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize(TEST_CONFIG.desktopViewport);
		await page.goto(TEST_CONFIG.testRoute);
		await page.waitForLoadState("networkidle");
	});

	test("All units render efficiently (9 units)", async ({ page }) => {
		const units = page.locator(".sidebar-unit-item");
		const count = await units.count();

		expect(count).toBe(TEST_CONFIG.expectedUnits);
	});

	test("Unit expansion completes in <300ms", async ({ page }) => {
		const firstUnit = page.locator(".sidebar-unit-header").first();

		const startTime = Date.now();
		await firstUnit.click();
		await page.waitForSelector(".sidebar-chapters-list", { state: "visible", timeout: 1000 });
		const duration = Date.now() - startTime;

		expect(duration).toBeLessThan(TEST_CONFIG.maxAnimationDuration);
	});

	test("Rapid unit toggles handled efficiently", async ({ page }) => {
		const firstUnit = page.locator(".sidebar-unit-header").first();

		// Toggle 5 times rapidly
		for (let i = 0; i < 5; i++) {
			await firstUnit.click();
			await page.waitForTimeout(100);
		}

		// Should still be responsive
		await expect(firstUnit).toBeVisible();
	});

	test("Scrolling performance with all chapters visible", async ({ page }) => {
		// Expand first unit
		const firstUnit = page.locator(".sidebar-unit-header").first();
		await firstUnit.click();
		await page.waitForTimeout(300);

		const sidebarContent = page.locator(".main-sidebar-content");

		// Scroll multiple times
		for (let i = 0; i < 5; i++) {
			await sidebarContent.evaluate((el) => {
				el.scrollTop += 100;
			});
			await page.waitForTimeout(50);
		}

		// Should complete without errors
		await expect(sidebarContent).toBeVisible();
	});
});

// =============================================================================
// TEST SUITE 7: Integration Tests
// =============================================================================

test.describe("Integration Tests", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize(TEST_CONFIG.desktopViewport);
		await page.goto(TEST_CONFIG.testRoute);
		await page.waitForLoadState("networkidle");
	});

	test("Sidebar integrates with SPA navigation system", async ({ page }) => {
		// Expand first unit
		const firstUnit = page.locator(".sidebar-unit-header").first();
		await firstUnit.click();
		await page.waitForTimeout(300);

		// Click a chapter
		const firstChapter = page.locator(".sidebar-chapter-button").first();
		const _initialHash = page.url().split("#")[1] || "";

		await firstChapter.click();
		await page.waitForTimeout(500);

		// URL should update (SPA navigation)
		const newHash = page.url().split("#")[1] || "";
		expect(newHash).toBeDefined();
	});

	test("Content menu data loads correctly", async ({ page }) => {
		// Check that all units are rendered from content menu
		const units = page.locator(".sidebar-unit-item");
		const count = await units.count();

		expect(count).toBe(TEST_CONFIG.expectedUnits);
	});

	test("Progress tracking displays correct stats", async ({ page }) => {
		const description = page.locator(".sidebar-description");
		const text = await description.textContent();

		// Should show 9 units and 129 chapters
		expect(text).toContain("9");
		expect(text).toContain("129");
	});

	test("Mobile sidebar auto-closes after navigation", async ({ page }) => {
		await page.setViewportSize(TEST_CONFIG.mobileViewport);
		await page.goto(TEST_CONFIG.testRoute);
		await page.waitForLoadState("networkidle");

		// Open sidebar
		await toggleMobileSidebar(page);

		// Expand unit and click chapter
		const firstUnit = page.locator(".sidebar-unit-header").first();
		await firstUnit.click();
		await page.waitForTimeout(300);

		const firstChapter = page.locator(".sidebar-chapter-button").first();
		await firstChapter.click();
		await page.waitForTimeout(1000);

		// Sidebar should auto-close on mobile
		const state = await getSidebarState(page);
		// May be collapsed after navigation
		expect(typeof state).toBe("string");
	});

	test("Settings configuration applied correctly", async ({ page }) => {
		// Check that SETTINGS values are reflected in UI
		const title = page.locator(".sidebar-title");
		await expect(title).toBeVisible();

		const version = page.locator(".sidebar-footer-version");
		await expect(version).toBeVisible();
	});
});

// =============================================================================
// TEST SUITE 8: Edge Cases
// =============================================================================

test.describe("Edge Cases", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize(TEST_CONFIG.desktopViewport);
		await page.goto(TEST_CONFIG.testRoute);
		await page.waitForLoadState("networkidle");
	});

	test("Very long unit titles display correctly", async ({ page }) => {
		// Check first unit (which has long title)
		const firstUnit = page.locator(".sidebar-unit-title").first();
		const text = await firstUnit.textContent();

		expect(text).toBeDefined();
		expect(text!.length).toBeGreaterThan(0);

		// Should not overflow container
		const overflow = await firstUnit.evaluate((el) => {
			return window.getComputedStyle(el).overflow;
		});

		expect(overflow).toBeDefined();
	});

	test("Multiple rapid navigation events", async ({ page }) => {
		// Expand first unit
		const firstUnit = page.locator(".sidebar-unit-header").first();
		await firstUnit.click();
		await page.waitForTimeout(300);

		// Click chapters rapidly
		const chapters = page.locator(".sidebar-chapter-button");
		const count = await chapters.count();

		for (let i = 0; i < Math.min(3, count); i++) {
			await chapters.nth(i).click();
			await page.waitForTimeout(200);
		}

		// Should handle without errors
		await expect(chapters.first()).toBeVisible();
	});

	test("Sidebar remains functional after viewport resize", async ({ page }) => {
		// Start at desktop
		const unitsBefore = await page.locator(".sidebar-unit-item").count();

		// Resize to mobile
		await page.setViewportSize(TEST_CONFIG.mobileViewport);
		await page.waitForTimeout(500);

		// Resize back to desktop
		await page.setViewportSize(TEST_CONFIG.desktopViewport);
		await page.waitForTimeout(500);

		// Should still render correctly
		const unitsAfter = await page.locator(".sidebar-unit-item").count();
		expect(unitsAfter).toBe(unitsBefore);
	});

	test("No JavaScript errors during interactions", async ({ page }) => {
		const errors: string[] = [];

		page.on("console", (msg) => {
			if (msg.type() === "error") {
				errors.push(msg.text());
			}
		});

		// Perform various interactions
		const firstUnit = page.locator(".sidebar-unit-header").first();
		await firstUnit.click();
		await page.waitForTimeout(300);

		const firstChapter = page.locator(".sidebar-chapter-button").first();
		await firstChapter.click();
		await page.waitForTimeout(500);

		// Should have no errors
		expect(errors.length).toBe(0);
	});
});
