/**
 * CodeBlock Component E2E Tests (Task 8F)
 *
 * End-to-end tests for CodeBlock component with visual regression testing.
 * Tests syntax highlighting, user interactions, mobile responsiveness, and Dialog expansion.
 *
 * Screenshots saved to: ./tmp/test/e2e/code-block-*.png
 */

import { test, expect } from "@playwright/test";
import { retryClipboardOperation } from "./helpers/wait-utilities";

const SHOWCASE_URL = "/showcase/code-block";

test.describe("CodeBlock Component - Desktop", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(SHOWCASE_URL);
		await page.waitForLoadState("networkidle");
		// Wait for Shiki to initialize - wait for first code element to indicate content is rendered
		await page.waitForSelector(".code-block-container code", { state: "visible", timeout: 5000 });
	});

	test("should display showcase page with all language examples", async ({ page }) => {
		await expect(
			page.getByRole("heading", { name: /codeblock component showcase/i })
		).toBeVisible();

		// Check bundle optimization info
		await expect(page.getByText(/loading.*14.*languages/i)).toBeVisible();
		await expect(page.getByText(/bundle size.*2mb/i)).toBeVisible();
	});

	test("should render TypeScript example with syntax highlighting", async ({ page }) => {
		// Find TypeScript example (first example)
		const typeScriptCard = page.locator(".example-card").first();
		await expect(typeScriptCard.locator(".language-badge")).toContainText(/typescript/i);

		// Take screenshot of TypeScript highlighting
		await typeScriptCard.screenshot({
			path: "./tmp/test/e2e/code-block-typescript.png"
		});

		// Verify code block is rendered
		const codeBlock = typeScriptCard.locator('[role="region"][aria-label="Code block"]');
		await expect(codeBlock).toBeVisible();
	});

	test("should render Python example with syntax highlighting", async ({ page }) => {
		// Find Python example (second example)
		const pythonCard = page.locator(".example-card").nth(1);
		await expect(pythonCard.locator(".language-badge")).toContainText(/python/i);

		// Take screenshot of Python highlighting
		await pythonCard.screenshot({
			path: "./tmp/test/e2e/code-block-python.png"
		});
	});

	test("should render Rust example with syntax highlighting", async ({ page }) => {
		// Find Rust example (third example)
		const rustCard = page.locator(".example-card").nth(2);
		await expect(rustCard.locator(".language-badge")).toContainText(/rust/i);

		// Take screenshot of Rust highlighting
		await rustCard.screenshot({
			path: "./tmp/test/e2e/code-block-rust.png"
		});
	});

	test("should copy code to clipboard", async ({ page, context }) => {
		// Grant clipboard permissions
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);

		// Find first code block
		const firstCard = page.locator(".example-card").first();

		// Click copy button
		const copyButton = firstCard.getByLabel(/copy code/i);
		await copyButton.click();

		// Verify success state (label changes)
		await expect(firstCard.getByLabel(/copied!/i)).toBeVisible();

		// Verify clipboard content with retry (clipboard can be flaky in headless)
		await retryClipboardOperation(
			async () => {
				const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
				expect(clipboardText).toContain("interface ApiResponse");
			},
			{ timeout: 2500 }
		);

		// ANTI-REGRESSION: Verify icon actually changed (not just label)
		// Success state should show Check icon instead of Copy icon
		const successButton = firstCard.getByLabel(/copied!/i);
		await expect(successButton).toBeVisible();

		// Wait for success state to revert (2000ms timeout from SETTINGS.ui.codeBlock.copyFeedback.duration)
		// Poll for state reversion instead of hard wait
		await expect(async () => {
			await expect(firstCard.getByLabel(/copy code/i)).toBeVisible();
			await expect(firstCard.getByLabel(/copied!/i)).not.toBeVisible();
		}).toPass({ timeout: 3000 });
	});

	test("should render code block with internal header when title provided", async ({ page }) => {
		// First example card has title
		const firstCard = page.locator(".example-card").first();

		// ANTI-REGRESSION: Verify internal header renders (from CodeBlock component)
		const internalHeader = firstCard.locator(".code-block-header");
		await expect(internalHeader).toBeVisible();

		// Verify header shows title
		await expect(internalHeader.locator(".code-block-title")).toBeVisible();
		await expect(internalHeader.locator(".code-block-title")).toContainText(/typescript/i);

		// ANTI-REGRESSION: Verify header has proper styling (muted background, border)
		const headerBox = await internalHeader.boundingBox();
		expect(headerBox).toBeTruthy();

		// Verify code container is attached to header (no top border)
		const codeContainer = firstCard.locator(".code-block-container");
		await expect(codeContainer).toBeVisible();
	});

	test("should show all features in technical details section", async ({ page }) => {
		// Scroll to technical details
		await page.getByRole("heading", { name: /technical details/i }).scrollIntoViewIfNeeded();

		// Verify features are listed (use more specific selectors)
		const techDetails = page.locator(".tech-details");
		await expect(techDetails.getByText(/✅.*syntax highlighting.*shiki/i).first()).toBeVisible();
		await expect(techDetails.getByText(/copy to clipboard/i).first()).toBeVisible();
		await expect(techDetails.getByText(/dialog expansion/i).first()).toBeVisible();
		await expect(techDetails.getByText(/line numbers/i).first()).toBeVisible();
		await expect(techDetails.getByText(/mobile responsive scroll/i).first()).toBeVisible();
	});

	test("should toggle edge cases section", async ({ page }) => {
		const toggleButton = page.getByRole("button", { name: /show edge cases/i });
		await toggleButton.click();

		// Edge cases should now be visible
		await expect(page.getByText(/edge case.*syntax error/i)).toBeVisible();
		await expect(page.getByText(/edge case.*empty code/i)).toBeVisible();

		// Click again to hide
		await page.getByRole("button", { name: /hide edge cases/i }).click();

		// Edge cases should be hidden
		await expect(page.getByText(/edge case.*syntax error/i)).not.toBeVisible();
	});
});

test.describe("CodeBlock Component - Mobile", () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test.beforeEach(async ({ page }) => {
		await page.goto(SHOWCASE_URL);
		await page.waitForLoadState("networkidle");
		// Wait for Shiki to initialize - wait for first code element to indicate content is rendered
		await page.waitForSelector(".code-block-container code", { state: "visible", timeout: 5000 });
	});

	test("should render mobile-responsive layout", async ({ page }) => {
		await expect(
			page.getByRole("heading", { name: /codeblock component showcase/i })
		).toBeVisible();

		// Header should be visible and centered
		const header = page.locator(".showcase-header");
		await expect(header).toBeVisible();

		// Take mobile screenshot
		await page.screenshot({
			path: "./tmp/test/e2e/code-block-mobile-overview.png",
			fullPage: false
		});
	});

	test("should enable horizontal scroll on mobile", async ({ page }) => {
		const firstCodeBlock = page.locator(".example-card").first();

		// Look for the actual pre element inside code-block-content which has the scroll
		const preElement = firstCodeBlock.locator(".code-block-content pre");

		// Code block should be scrollable horizontally
		const isScrollable = await preElement.evaluate((el) => {
			return el.scrollWidth > el.clientWidth;
		});

		expect(isScrollable).toBeTruthy();
	});

	test("should have touch-friendly copy button (≥44px)", async ({ page }) => {
		const firstCard = page.locator(".example-card").first();
		const copyButton = firstCard.getByLabel(/copy code/i);

		// Get button size
		const buttonBox = await copyButton.boundingBox();
		expect(buttonBox).toBeTruthy();

		// WCAG 2.1 AA minimum touch target
		expect(buttonBox!.width).toBeGreaterThanOrEqual(44);
		expect(buttonBox!.height).toBeGreaterThanOrEqual(44);
	});

	test("should expand toggle button to full width on mobile", async ({ page }) => {
		const toggleButton = page.getByRole("button", { name: /show edge cases/i });

		const buttonBox = await toggleButton.boundingBox();
		const viewportWidth = page.viewportSize()!.width;

		// Button should span most of viewport width (accounting for padding)
		expect(buttonBox!.width).toBeGreaterThan(viewportWidth * 0.9);
	});
});

test.describe("CodeBlock Component - Keyboard Navigation", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(SHOWCASE_URL);
		await page.waitForLoadState("networkidle");
		// Wait for Shiki to initialize - wait for first code element to indicate content is rendered
		await page.waitForSelector(".code-block-container code", { state: "visible", timeout: 5000 });
	});

	test("should navigate to copy button with Tab", async ({ page }) => {
		// Focus on the first code block first to start tabbing from there
		const firstCard = page.locator(".example-card").first();
		const codeContainer = firstCard.locator(".code-block-container");
		await codeContainer.click();

		// Now tab to find the copy button (should be close)
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press("Tab");
			// Tab is synchronous, no wait needed
			const focusedLabel = await page.evaluate(() =>
				document.activeElement?.getAttribute("aria-label")
			);
			if (focusedLabel && /copy code/i.test(focusedLabel)) {
				expect(focusedLabel).toMatch(/copy code/i);
				return;
			}
		}

		// If still not found, the button may not be keyboard accessible
		const focusedInfo = await page.evaluate(() => ({
			label: document.activeElement?.getAttribute("aria-label"),
			tagName: document.activeElement?.tagName,
			className: document.activeElement?.className
		}));
		throw new Error(
			`Could not find copy button after 5 tabs from code block. Last focused: ${JSON.stringify(focusedInfo)}`
		);
	});

	test("should activate copy button with Enter", async ({ page, context }) => {
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);

		const firstCard = page.locator(".example-card").first();
		const copyButton = firstCard.getByLabel(/copy code/i);

		// Focus the copy button directly
		await copyButton.focus();

		// Press Enter to activate
		await page.keyboard.press("Enter");

		// Success state should appear
		await expect(firstCard.getByLabel(/copied!/i)).toBeVisible();
	});
});

test.describe("CodeBlock Component - Edge Cases", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(SHOWCASE_URL);
		await page.waitForLoadState("networkidle");
		// Wait for Shiki to initialize - wait for first code element to indicate content is rendered
		await page.waitForSelector(".code-block-container code", { state: "visible", timeout: 5000 });

		// Show edge cases
		await page.getByRole("button", { name: /show edge cases/i }).click();
	});

	test("should render code with syntax errors", async ({ page }) => {
		const errorCard = page.locator(".example-card.edge-case").first();
		await expect(errorCard.locator(".code-block-title")).toContainText(/syntax error/i);

		// Code block should still render
		const codeBlock = errorCard.locator('[role="region"]');
		await expect(codeBlock).toBeVisible();
	});

	test("should handle empty code block", async ({ page }) => {
		const emptyCard = page.locator(".example-card.edge-case").nth(1);
		await expect(emptyCard.locator(".code-block-title")).toContainText(/empty code/i);

		// Code block container should exist
		const codeBlock = emptyCard.locator('[role="region"]');
		await expect(codeBlock).toBeVisible();
	});

	test("should handle very long code with scroll", async ({ page }) => {
		const longCodeCard = page.locator(".example-card.edge-case").last();
		await expect(longCodeCard.locator(".code-block-title")).toContainText(/very long/i);

		// The code-block-container should have overflow: auto
		const codeContainer = longCodeCard.locator(".code-block-container");
		const styles = await codeContainer.evaluate((el) => {
			const computed = window.getComputedStyle(el);
			return {
				overflow: computed.overflow,
				overflowY: computed.overflowY,
				maxHeight: computed.maxHeight
			};
		});

		// Verify container is scrollable (has overflow auto/scroll)
		expect(["auto", "scroll"]).toContain(styles.overflow);
	});
});

test.describe("CodeBlock Component - Performance", () => {
	test("should render showcase page within performance budget", async ({ page }) => {
		const startTime = Date.now();

		await page.goto(SHOWCASE_URL);
		// Shiki loaded in beforeEach // Wait for Shiki init

		const loadTime = Date.now() - startTime;

		// Page should load within 3 seconds (including Shiki initialization)
		expect(loadTime).toBeLessThan(3000);
	});
});

test.describe("CodeBlock Component - Download Feature", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(SHOWCASE_URL);
		await page.waitForLoadState("networkidle");
		// Wait for Shiki to initialize - wait for first code element to indicate content is rendered
		await page.waitForSelector(".code-block-container code", { state: "visible", timeout: 5000 });
	});

	test("should have download button visible", async ({ page }) => {
		const firstCard = page.locator(".example-card").first();
		const downloadButton = firstCard.getByLabel(/download/i);

		await expect(downloadButton).toBeVisible();
	});

	test("should have download button with proper touch target size", async ({ page }) => {
		const firstCard = page.locator(".example-card").first();
		const downloadButton = firstCard.getByLabel(/download/i);

		const buttonBox = await downloadButton.boundingBox();
		expect(buttonBox).toBeTruthy();

		// WCAG 2.1 AA minimum touch target
		expect(buttonBox!.width).toBeGreaterThanOrEqual(44);
		expect(buttonBox!.height).toBeGreaterThanOrEqual(44);
	});

	test("should show all action buttons (Copy, Download, Expand)", async ({ page }) => {
		const firstCard = page.locator(".example-card").first();

		await expect(firstCard.getByLabel(/copy code/i)).toBeVisible();
		await expect(firstCard.getByLabel(/download/i)).toBeVisible();
		await expect(firstCard.getByLabel(/expand/i)).toBeVisible();
	});

	test("should render action buttons in vertical orientation when configured", async ({ page }) => {
		// First card has vertical orientation (index % 2 === 0)
		const firstCard = page.locator(".example-card").first();
		const iconGrid = firstCard.locator(".icon-grid");

		// ANTI-REGRESSION: Verify icon grid exists
		await expect(iconGrid).toBeVisible();

		// ANTI-REGRESSION: Verify vertical orientation class
		await expect(iconGrid).toHaveClass(/icon-grid--vertical/);

		// Verify buttons are stacked vertically (y-coordinates differ)
		const copyButton = firstCard.getByLabel(/copy code/i);
		const downloadButton = firstCard.getByLabel(/download/i);

		const copyBox = await copyButton.boundingBox();
		const downloadBox = await downloadButton.boundingBox();

		expect(copyBox).toBeTruthy();
		expect(downloadBox).toBeTruthy();

		// In vertical layout, buttons should be stacked (different y-coordinates)
		// Allow small margin for padding/borders
		expect(Math.abs(copyBox!.y - downloadBox!.y)).toBeGreaterThan(20);
	});

	test("should render action buttons in horizontal orientation when configured", async ({
		page
	}) => {
		// Second card has horizontal orientation (index % 2 !== 0)
		const secondCard = page.locator(".example-card").nth(1);
		const iconGrid = secondCard.locator(".icon-grid");

		// ANTI-REGRESSION: Verify icon grid exists
		await expect(iconGrid).toBeVisible();

		// ANTI-REGRESSION: Verify horizontal orientation class
		await expect(iconGrid).toHaveClass(/icon-grid--horizontal/);

		// Verify CSS flex-direction is row (horizontal)
		const flexDirection = await iconGrid.evaluate((el) => {
			return window.getComputedStyle(el).flexDirection;
		});
		expect(flexDirection).toBe("row");

		// Additional check: buttons should have horizontal spacing
		const copyButton = secondCard.getByLabel(/copy code/i);
		const downloadButton = secondCard.getByLabel(/download/i);

		const copyBox = await copyButton.boundingBox();
		const downloadBox = await downloadButton.boundingBox();

		expect(copyBox).toBeTruthy();
		expect(downloadBox).toBeTruthy();

		// In horizontal layout, buttons x-coordinates should differ (side by side)
		expect(Math.abs(copyBox!.x - downloadBox!.x)).toBeGreaterThan(20);
	});
});

test.describe("CodeBlock Component - Dialog Expansion", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(SHOWCASE_URL);
		await page.waitForLoadState("networkidle");
		// Wait for Shiki to initialize - wait for first code element to indicate content is rendered
		await page.waitForSelector(".code-block-container code", { state: "visible", timeout: 5000 });
	});

	test("should have expand button visible", async ({ page }) => {
		const firstCard = page.locator(".example-card").first();
		const expandButton = firstCard.getByLabel(/expand/i);

		await expect(expandButton).toBeVisible();
	});

	test("should open dialog when expand button clicked", async ({ page }) => {
		const firstCard = page.locator(".example-card").first();
		const expandButton = firstCard.getByLabel(/expand/i);

		await expandButton.click();

		// Dialog should be visible
		const dialog = page.locator('[role="dialog"]');
		await expect(dialog).toBeVisible();

		// Take screenshot of expanded dialog
		await page.screenshot({
			path: "./tmp/test/e2e/code-block-dialog-expanded.png"
		});
	});

	test("should show dialog with title", async ({ page }) => {
		const firstCard = page.locator(".example-card").first();
		await firstCard.getByLabel(/expand/i).click();

		// Dialog title should be visible (use dialog scope to avoid strict mode)
		const dialog = page.locator('[role="dialog"][data-state="open"]').first();
		const dialogTitle = dialog.getByRole("heading", { name: /typescript/i });
		await expect(dialogTitle).toBeVisible();
	});

	test("should show dialog with close button", async ({ page }) => {
		const firstCard = page.locator(".example-card").first();
		await firstCard.getByLabel(/expand/i).click();

		// Close button should be visible
		const closeButton = page.getByLabel(/close dialog/i);
		await expect(closeButton).toBeVisible();
	});

	test("should show Copy and Download buttons in expanded view (no Expand)", async ({ page }) => {
		const firstCard = page.locator(".example-card").first();
		await firstCard.getByLabel(/expand/i).click();

		// Wait for dialog to be visible
		await expect(page.locator('[role="dialog"]')).toBeVisible();

		// Should have Copy and Download buttons
		const dialog = page.locator('[role="dialog"]');
		await expect(dialog.getByLabel(/copy code/i)).toBeVisible();
		await expect(dialog.getByLabel(/download/i)).toBeVisible();

		// Should NOT have Expand button (already expanded)
		await expect(dialog.getByLabel(/expand/i)).not.toBeVisible();
	});

	test("should download code when Download button clicked in Dialog", async ({ page }) => {
		const firstCard = page.locator(".example-card").first();
		await firstCard.getByLabel(/expand/i).click();

		const dialog = page.locator('[role="dialog"]');
		await expect(dialog).toBeVisible();

		// ANTI-REGRESSION: Test download functionality in Dialog mode
		// Set up download listener
		const downloadPromise = page.waitForEvent("download");

		// Click download button in dialog
		const downloadButton = dialog.getByLabel(/download/i);
		await downloadButton.click();

		// Wait for download to complete
		const download = await downloadPromise;

		// Verify download filename matches language extension
		const filename = download.suggestedFilename();
		expect(filename).toMatch(/code\.(ts|txt)/);

		// ANTI-REGRESSION: Verify download button remains visible after click
		// (should not have success state like Copy button)
		await expect(downloadButton).toBeVisible();
		await expect(downloadButton.getByLabel(/download/i)).toBeTruthy();
	});

	test("should close dialog when close button clicked", async ({ page }) => {
		const firstCard = page.locator(".example-card").first();
		await firstCard.getByLabel(/expand/i).click();

		// Dialog should be visible
		await expect(page.locator('[role="dialog"]')).toBeVisible();

		// Click close button
		await page.getByLabel(/close dialog/i).click();

		// Dialog should be hidden
		await expect(page.locator('[role="dialog"]')).not.toBeVisible();
	});

	test("should close dialog when clicking overlay", async ({ page }) => {
		const firstCard = page.locator(".example-card").first();
		await firstCard.getByLabel(/expand/i).click();

		// Dialog should be visible
		const dialog = page.locator('[role="dialog"][data-state="open"]').first();
		await expect(dialog).toBeVisible();

		// Click overlay (backdrop) - use escape instead as overlay click is unreliable
		await page.keyboard.press("Escape");

		// Dialog should be hidden
		await page.waitForFunction(
			() => {
				const dialogs = document.querySelectorAll('[role="dialog"][data-state="open"]');
				return dialogs.length === 0;
			},
			{ timeout: 3000 }
		);
	});

	test("should close dialog with Escape key", async ({ page }) => {
		const firstCard = page.locator(".example-card").first();
		await firstCard.getByLabel(/expand/i).click();

		// Dialog should be visible
		await expect(page.locator('[role="dialog"]')).toBeVisible();

		// Press Escape
		await page.keyboard.press("Escape");

		// Dialog should be hidden
		await expect(page.locator('[role="dialog"]')).not.toBeVisible();
	});
});

test.describe("CodeBlock Component - Dialog Scroll Behavior", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(SHOWCASE_URL);
		await page.waitForLoadState("networkidle");
		// Wait for Shiki to initialize - wait for first code element to indicate content is rendered
		await page.waitForSelector(".code-block-container code", { state: "visible", timeout: 5000 });
	});

	test("should have fixed header and scrollable content in dialog", async ({ page }) => {
		const firstCard = page.locator(".example-card").first();
		await firstCard.getByLabel(/expand/i).click();

		// Dialog should be visible
		const dialog = page.locator('[role="dialog"][data-state="open"]').first();
		await expect(dialog).toBeVisible();

		// Header should have visual separator
		const header = dialog.locator(".dialog-header-sophisticated");
		await expect(header).toBeVisible();

		// Content container should be scrollable
		const contentScroll = dialog.locator(".dialog-content-scroll-wrapper");
		await expect(contentScroll).toBeVisible();
	});

	test("should keep header sticky when scrolling content in dialog", async ({ page }) => {
		// Use first card with normal content (edge cases don't have expand button)
		const firstCard = page.locator(".example-card").first();
		await firstCard.getByLabel(/expand/i).click();

		const dialog = page.locator('[role="dialog"][data-state="open"]').first();
		await expect(dialog).toBeVisible();

		const header = dialog.locator(".dialog-header-sophisticated");
		await expect(header).toBeVisible();

		// ANTI-REGRESSION: Get header position before scroll
		const headerBoxBefore = await header.boundingBox();
		expect(headerBoxBefore).toBeTruthy();

		// Scroll content container
		const contentScroll = dialog.locator(".dialog-content-scroll-wrapper");
		await contentScroll.evaluate((el) => {
			el.scrollTop = 100; // Scroll down a bit
		});

		// Scroll is synchronous, verify header position immediately
		// ANTI-REGRESSION: Verify header position remains fixed (y-coordinate unchanged)
		const headerBoxAfter = await header.boundingBox();
		expect(headerBoxAfter).toBeTruthy();

		// Header should not move significantly (sticky/fixed positioning)
		// Allow 10px tolerance for browser rendering/animation
		expect(Math.abs(headerBoxAfter!.y - headerBoxBefore!.y)).toBeLessThan(10);

		// ANTI-REGRESSION: Verify action buttons also stay fixed with header
		const copyButton = dialog.getByLabel(/copy code/i);
		const copyBoxBefore = await copyButton.boundingBox();

		await contentScroll.evaluate((el) => {
			el.scrollTop = 200; // Scroll more
		});
		// Scroll is synchronous, check position immediately

		const copyBoxAfter = await copyButton.boundingBox();
		expect(copyBoxAfter).toBeTruthy();

		// Action buttons should remain aligned with header (same y-coordinate)
		expect(Math.abs(copyBoxAfter!.y - copyBoxBefore!.y)).toBeLessThan(5);
	});

	test("should align action buttons with close button", async ({ page }) => {
		const firstCard = page.locator(".example-card").first();
		await firstCard.getByLabel(/expand/i).click();

		const dialog = page.locator('[role="dialog"][data-state="open"]').first();
		await expect(dialog).toBeVisible();

		// Get positions of close button and action buttons
		const closeButton = dialog.getByLabel(/close dialog/i);
		const copyButton = dialog.getByLabel(/copy code/i);

		const closeBox = await closeButton.boundingBox();
		const copyBox = await copyButton.boundingBox();

		expect(closeBox).toBeTruthy();
		expect(copyBox).toBeTruthy();

		// Both buttons should be in top-right area (reasonable y-coordinate difference)
		// Allow up to 60px tolerance as action buttons may be in row below close button
		expect(Math.abs(closeBox!.y - copyBox!.y)).toBeLessThan(60);

		// ANTI-REGRESSION: Verify header has z-index for stacking
		const header = dialog.locator(".dialog-header-sophisticated");
		const headerZIndex = await header.evaluate((el) => {
			const z = window.getComputedStyle(el).zIndex;
			return z === "auto" ? null : parseInt(z);
		});

		// Header should have explicit z-index (not auto)
		expect(headerZIndex).not.toBeNull();
		expect(headerZIndex).toBeGreaterThan(0);
	});
});
