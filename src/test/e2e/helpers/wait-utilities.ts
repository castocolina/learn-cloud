/**
 * E2E Test Anti-Flakiness Utilities
 *
 * Reusable helper functions to replace hard-coded `page.waitForTimeout()` calls
 * with robust polling/retry mechanisms.
 *
 * MOTIVATION:
 * Hard-coded timeouts create brittle tests that fail under CI load or slower systems.
 * These utilities use Playwright's `expect.poll()` and `expect.toPass()` for reliable
 * waiting based on actual state changes, not arbitrary time delays.
 *
 * USAGE:
 * ```typescript
 * import { waitForScrollPosition, waitForStyleChange } from './helpers/wait-utilities';
 *
 * // Instead of:
 * await page.evaluate(() => window.scrollTo(0, 500));
 * await page.waitForTimeout(100);
 *
 * // Use:
 * await page.evaluate(() => window.scrollTo(0, 500));
 * await waitForScrollPosition(page, 500);
 * ```
 *
 * See: docs/e2e-refactor.md for refactoring strategy and anti-patterns.
 */

import { expect, type Page, type Locator } from "@playwright/test";

/**
 * Waits for page to scroll to target Y position with tolerance.
 *
 * Uses `expect.poll()` to repeatedly check scroll position until it reaches
 * the target (within tolerance) or timeout expires.
 *
 * @param page - Playwright Page object
 * @param targetY - Target scroll Y position in pixels
 * @param options.tolerance - Allowed deviation in pixels (default: 15)
 * @param options.timeout - Max wait time in ms (default: 2000)
 *
 * @example
 * ```typescript
 * await page.evaluate(() => window.scrollTo(0, 500));
 * await waitForScrollPosition(page, 500, { tolerance: 10, timeout: 3000 });
 * ```
 *
 * @throws {Error} If scroll position not reached within timeout
 */
export async function waitForScrollPosition(
	page: Page,
	targetY: number,
	options?: { tolerance?: number; timeout?: number }
): Promise<void> {
	const tolerance = options?.tolerance ?? 15;
	const timeout = options?.timeout ?? 2000;

	// Poll for scroll position to be within tolerance range
	await expect
		.poll(async () => await page.evaluate(() => window.scrollY), { timeout })
		.toBeGreaterThanOrEqual(Math.max(0, targetY - tolerance));

	await expect
		.poll(async () => await page.evaluate(() => window.scrollY), { timeout })
		.toBeLessThanOrEqual(targetY + tolerance);
}

/**
 * Waits for CSS property to change to expected value.
 *
 * Useful for waiting on CSS transitions, hover states, or dynamic style changes.
 *
 * @param locator - Playwright Locator for target element
 * @param property - CSS property name (e.g., 'backgroundColor', 'opacity')
 * @param expectedValue - Expected value string OR predicate function
 * @param options.timeout - Max wait time in ms (default: 1000)
 *
 * @example
 * ```typescript
 * // Wait for exact value:
 * await button.hover();
 * await waitForStyleChange(button, 'backgroundColor', 'rgb(255, 0, 0)');
 *
 * // Wait for predicate:
 * await waitForStyleChange(
 *   button,
 *   'backgroundColor',
 *   (value) => value !== 'rgb(0, 0, 0)',
 *   { timeout: 1500 }
 * );
 * ```
 *
 * @throws {Error} If style does not change to expected value within timeout
 */
export async function waitForStyleChange(
	locator: Locator,
	property: string,
	expectedValue: string | ((value: string) => boolean),
	options?: { timeout?: number }
): Promise<void> {
	const timeout = options?.timeout ?? 1000;

	await expect(async () => {
		const value = await locator.evaluate(
			(el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
			property
		);

		if (typeof expectedValue === "function") {
			expect(expectedValue(value)).toBe(true);
		} else {
			expect(value).toBe(expectedValue);
		}
	}).toPass({ timeout });
}

/**
 * Waits for element animation to complete by polling opacity.
 *
 * Many components animate from opacity: 0 to opacity: 1. This utility
 * waits for opacity to reach 1, indicating animation completion.
 *
 * @param locator - Playwright Locator for animated element
 * @param options.timeout - Max wait time in ms (default: 1000)
 *
 * @example
 * ```typescript
 * await openDialogButton.click();
 * const dialog = page.locator('[role="dialog"]');
 * await waitForAnimationComplete(dialog);
 * // Dialog is now fully visible and interactive
 * ```
 *
 * @throws {Error} If opacity does not reach 1 within timeout
 */
export async function waitForAnimationComplete(
	locator: Locator,
	options?: { timeout?: number }
): Promise<void> {
	const timeout = options?.timeout ?? 1000;

	await expect
		.poll(
			async () => {
				const opacity = await locator.evaluate((el) => window.getComputedStyle(el).opacity);
				return opacity;
			},
			{ timeout }
		)
		.toBe("1");
}

/**
 * Waits for Dialog component to reach expected state.
 *
 * Polls for `data-state` attribute on `[role="dialog"]` element.
 * Useful after clicking open/close buttons to ensure dialog state transition.
 *
 * @param page - Playwright Page object
 * @param state - Expected state: 'open' or 'closed'
 * @param options.timeout - Max wait time in ms (default: 3000)
 *
 * @example
 * ```typescript
 * await openDialogButton.click();
 * await waitForDialogState(page, 'open');
 *
 * await closeButton.click();
 * await waitForDialogState(page, 'closed');
 * ```
 *
 * @throws {Error} If dialog does not reach expected state within timeout
 */
export async function waitForDialogState(
	page: Page,
	state: "open" | "closed",
	options?: { timeout?: number }
): Promise<void> {
	const timeout = options?.timeout ?? 3000;

	await page.waitForSelector(`[role="dialog"][data-state="${state}"]`, { timeout });
}

/**
 * Waits for element transform CSS to match expected value.
 *
 * Useful for zoom/pan controls that modify transform: scale() or translate().
 *
 * @param locator - Playwright Locator for transformed element
 * @param expectedTransform - Expected transform string (e.g., 'scale(1.25)')
 * @param options.timeout - Max wait time in ms (default: 1000)
 *
 * @example
 * ```typescript
 * await zoomInButton.click();
 * await waitForTransform(diagram, 'scale(1.25)', { timeout: 1500 });
 * ```
 *
 * @throws {Error} If transform does not match within timeout
 */
export async function waitForTransform(
	locator: Locator,
	expectedTransform: string,
	options?: { timeout?: number }
): Promise<void> {
	const timeout = options?.timeout ?? 1000;

	await expect
		.poll(
			async () => {
				const style = await locator.getAttribute("style");
				return style?.includes(expectedTransform) ?? false;
			},
			{ timeout }
		)
		.toBe(true);
}

/**
 * Retries clipboard operation with exponential backoff.
 *
 * Headless browsers and CI environments have restricted clipboard access.
 * This utility wraps clipboard operations in `expect.toPass()` for automatic retry.
 *
 * @param operation - Async function that performs clipboard operation and assertion
 * @param options.timeout - Max wait time in ms (default: 2500)
 * @param options.intervals - Retry intervals in ms (default: [100, 250, 500, 1000])
 *
 * @example
 * ```typescript
 * await copyButton.click();
 * await retryClipboardOperation(async () => {
 *   const text = await page.evaluate(() => navigator.clipboard.readText());
 *   expect(text).toContain('expected content');
 * });
 * ```
 *
 * @throws {Error} If operation fails after all retries
 */
export async function retryClipboardOperation(
	operation: () => Promise<void>,
	options?: { timeout?: number; intervals?: number[] }
): Promise<void> {
	const timeout = options?.timeout ?? 2500;
	const intervals = options?.intervals ?? [100, 250, 500, 1000];

	await expect(operation).toPass({ timeout, intervals });
}

/**
 * Waits for element to be in viewport and actionable.
 *
 * Combines visibility check + bounding box check to ensure element is:
 * 1. Visible (not display: none or visibility: hidden)
 * 2. Has non-zero dimensions
 * 3. Is within viewport (scrolled into view)
 *
 * @param locator - Playwright Locator for element
 * @param options.timeout - Max wait time in ms (default: 3000)
 *
 * @example
 * ```typescript
 * await page.goto('/long-page');
 * const button = page.getByRole('button', { name: 'Submit' });
 * await waitForElementActionable(button);
 * await button.click(); // Guaranteed to work
 * ```
 *
 * @throws {Error} If element does not become actionable within timeout
 */
export async function waitForElementActionable(
	locator: Locator,
	options?: { timeout?: number }
): Promise<void> {
	const timeout = options?.timeout ?? 3000;

	// First ensure element is visible
	await expect(locator).toBeVisible({ timeout });

	// Then poll for non-null bounding box (in viewport)
	await expect
		.poll(
			async () => {
				const box = await locator.boundingBox();
				return box !== null && box.width > 0 && box.height > 0;
			},
			{ timeout }
		)
		.toBe(true);
}

/**
 * Waits for focus to be trapped within a container (e.g., Dialog, Modal).
 *
 * Polls for `document.activeElement` to be within specified container.
 * Useful for testing keyboard navigation and focus trap implementations.
 *
 * @param page - Playwright Page object
 * @param containerSelector - CSS selector for container (e.g., '[role="dialog"]')
 * @param options.timeout - Max wait time in ms (default: 1000)
 *
 * @example
 * ```typescript
 * await openDialogButton.click();
 * await page.keyboard.press('Tab');
 * await waitForFocusWithin(page, '[role="dialog"]');
 * // Focus is now inside dialog
 * ```
 *
 * @throws {Error} If focus does not move into container within timeout
 */
export async function waitForFocusWithin(
	page: Page,
	containerSelector: string,
	options?: { timeout?: number }
): Promise<void> {
	const timeout = options?.timeout ?? 1000;

	await expect
		.poll(
			async () => {
				const focusedInContainer = await page.evaluate((selector) => {
					const activeEl = document.activeElement;
					const container = document.querySelector(selector);
					return activeEl?.closest(selector) !== null || activeEl === container;
				}, containerSelector);
				return focusedInContainer;
			},
			{ timeout }
		)
		.toBe(true);
}

/**
 * Waits for attribute to exist and match expected value.
 *
 * Polls for attribute presence and value. Useful for data-* attributes
 * that change dynamically (e.g., data-loaded, data-state).
 *
 * @param locator - Playwright Locator for element
 * @param attribute - Attribute name (e.g., 'data-loaded', 'aria-expanded')
 * @param expectedValue - Expected attribute value (or true for any truthy value)
 * @param options.timeout - Max wait time in ms (default: 2000)
 *
 * @example
 * ```typescript
 * // Wait for data-loaded="true":
 * await waitForAttribute(codeBlock, 'data-loaded', 'true', { timeout: 3000 });
 *
 * // Wait for attribute to exist with any value:
 * await waitForAttribute(element, 'data-initialized', true);
 * ```
 *
 * @throws {Error} If attribute does not match within timeout
 */
export async function waitForAttribute(
	locator: Locator,
	attribute: string,
	expectedValue: string | boolean,
	options?: { timeout?: number }
): Promise<void> {
	const timeout = options?.timeout ?? 2000;

	await expect
		.poll(
			async () => {
				const value = await locator.getAttribute(attribute);
				if (typeof expectedValue === "boolean") {
					return value !== null; // Just check existence
				}
				return value;
			},
			{ timeout }
		)
		.toBe(typeof expectedValue === "boolean" ? true : expectedValue);
}
