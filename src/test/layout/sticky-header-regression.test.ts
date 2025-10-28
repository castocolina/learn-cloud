/**
 * Sticky Header Regression Test (TDD Approach)
 *
 * This test validates CSS configuration for the sticky header component.
 * Since the project uses Vitest (Node environment), full E2E browser testing
 * requires Playwright installation. This test validates:
 * - CSS class structure
 * - No overflow properties that break sticky positioning
 * - Proper layout configuration
 *
 * REGRESSION: Commit d125aa5 introduced a CSS regression where the header lost its
 * sticky positioning behavior due to `overflow-x: hidden` on `.main-content`.
 *
 * ROOT CAUSE INVESTIGATION (Commit d125aa5):
 * - Migrated from manual CSS Grid layout to shadcn-svelte Sidebar.Provider
 * - Changed layout structure: fixed sidebar + flex main content
 * - Added overflow-x: hidden to .main-content (ROOT CAUSE)
 * - When overflow-x is set to any value other than 'visible', browsers
 *   automatically compute overflow-y as 'auto', creating a new scroll container
 *   that breaks position: sticky behavior
 *
 * FIX APPLIED:
 * - Removed overflow-x: hidden from .main-content in layout.css
 * - Rely on proper width constraints (min-width: 0, max-width: 100%)
 * - If horizontal scrolling becomes an issue, use overflow-x: clip instead
 *
 * EXPECTED BEHAVIOR (Manual Testing Required):
 * - Header should remain visible at top of viewport during scroll
 * - Header position should be "sticky" (CSS computed style)
 * - Header top offset should remain 0px relative to viewport
 * - Behavior should work on both mobile and desktop viewports
 *
 * MANUAL TESTING INSTRUCTIONS:
 * 1. Start dev server: pnpm run dev
 * 2. Open http://localhost:5173/#/01_01_lesson_dev
 * 3. Scroll down the page
 * 4. Verify header stays at top of viewport (sticky behavior working)
 * 5. Test on mobile viewport (DevTools: 390px width)
 * 6. Test on desktop viewport (DevTools: 1280px width)
 *
 * @test StickyHeaderRegression
 * @category layout
 * @category regression
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Test configuration
 */
const TEST_CONFIG = {
	layoutCssPath: join(process.cwd(), "src/styles/layout.css"),
	stickyHeaderPath: join(process.cwd(), "src/lib/components/navigation/StickyHeader.svelte")
};

describe("Sticky Header CSS Configuration (Regression Test)", () => {
	it("should not have overflow-x: hidden on .main-content (breaks sticky)", () => {
		const layoutCss = readFileSync(TEST_CONFIG.layoutCssPath, "utf-8");

		// CRITICAL: .main-content must NOT have overflow-x: hidden
		// This was the root cause of the sticky header regression in commit d125aa5

		// Check that overflow-x: hidden is not present (uncommented) in .main-content
		const mainContentBlockMatch = layoutCss.match(/\.main-content\s*\{([^}]+)\}/s);

		expect(mainContentBlockMatch).toBeTruthy();

		if (mainContentBlockMatch) {
			const mainContentStyles = mainContentBlockMatch[1];

			// Remove comments and multi-line comment blocks
			const stylesWithoutComments = mainContentStyles
				.replace(/\/\*[\s\S]*?\*\//g, "") // Remove /* ... */ comments
				.replace(/\/\/.*/g, ""); // Remove // comments

			// Should NOT contain uncommented overflow-x: hidden
			const hasActiveOverflowXHidden = /overflow-x:\s*hidden/i.test(stylesWithoutComments);

			expect(hasActiveOverflowXHidden).toBe(false);

			// Verify the fix comment is present (in original styles with comments)
			expect(mainContentStyles).toContain("REGRESSION FIX");
		}
	});

	it("should have proper width constraints on .main-content", () => {
		const layoutCss = readFileSync(TEST_CONFIG.layoutCssPath, "utf-8");

		const mainContentBlockMatch = layoutCss.match(/\.main-content\s*\{([^}]+)\}/s);

		expect(mainContentBlockMatch).toBeTruthy();

		if (mainContentBlockMatch) {
			const mainContentStyles = mainContentBlockMatch[1];

			// Should have proper width constraints
			expect(mainContentStyles).toContain("min-width: 0");
			expect(mainContentStyles).toContain("max-width: 100%");
		}
	});

	it("should have sticky position class on header element", () => {
		const stickyHeaderSvelte = readFileSync(TEST_CONFIG.stickyHeaderPath, "utf-8");

		// Header should have 'sticky' class
		expect(stickyHeaderSvelte).toContain('class="sticky');

		// Header should have top-0 positioning
		expect(stickyHeaderSvelte).toContain("top-0");

		// Header should have z-index configured
		expect(stickyHeaderSvelte).toMatch(/z-index.*--z-header/);
	});

	it("should document the regression fix in layout.css", () => {
		const layoutCss = readFileSync(TEST_CONFIG.layoutCssPath, "utf-8");

		// Should have documentation about the fix
		expect(layoutCss).toContain("REGRESSION FIX");
		expect(layoutCss).toContain("Commit d125aa5");
		expect(layoutCss).toContain("overflow-x: hidden breaks position: sticky");
	});
});

/**
 * QA REPORT - Sticky Header Regression Fix
 *
 * REGRESSION DETAILS:
 * - Commit: d125aa5
 * - Issue: Sticky header lost its positioning behavior during page scroll
 * - Root Cause: overflow-x: hidden on .main-content container
 *
 * ROOT CAUSE EXPLANATION:
 * When overflow-x is set to any value other than 'visible', browsers automatically
 * compute overflow-y as 'auto' per CSS specification. This creates a new scroll
 * container with implicit height constraints, preventing sticky elements inside
 * from working correctly. The sticky element needs to stick relative to the
 * document's scroll, but the new scroll container breaks this relationship.
 *
 * FIX APPLIED:
 * - Removed overflow-x: hidden from .main-content in src/styles/layout.css
 * - Added comprehensive documentation explaining the issue
 * - Retained width constraints (min-width: 0, max-width: 100%) for flex behavior
 *
 * TEST RESULTS:
 * ✓ CSS validation tests pass
 * ✓ No overflow-x: hidden on .main-content
 * ✓ Proper width constraints maintained
 * ✓ Sticky class present on header element
 * ✓ Regression fix documented in code
 *
 * MANUAL TESTING REQUIRED:
 * These automated tests validate CSS configuration but cannot test actual
 * browser sticky behavior without Playwright/Cypress installed.
 *
 * Manual test steps:
 * 1. pnpm run dev
 * 2. Open http://localhost:5173/#/01_01_lesson_dev
 * 3. Scroll down the page
 * 4. ✓ VERIFY: Header stays at top of viewport (sticky working)
 * 5. Test on mobile (390px) and desktop (1280px) viewports
 *
 * ALTERNATIVE SOLUTION (if horizontal scrolling becomes an issue):
 * Use overflow-x: clip instead of hidden. The 'clip' value prevents scrolling
 * without creating a new scroll container, preserving sticky behavior.
 *
 * REFERENCES:
 * - MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky
 * - CSS Spec: https://www.w3.org/TR/css-overflow-3/#overflow-properties
 */
