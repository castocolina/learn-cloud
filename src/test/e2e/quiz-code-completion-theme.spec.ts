/**
 * Code Completion Question - Theme Background Test
 *
 * Validates that .code-blank-select background adapts correctly
 * to both light and dark themes.
 *
 * Screenshots saved to: ./tmp/test/e2e/quiz-code-completion-*.png
 */

import { test, expect } from "@playwright/test";

const SHOWCASE_URL = "/showcase/quiz-navigation";

test.describe("Code Completion Question - Theme Adaptation", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(SHOWCASE_URL);
		await page.waitForLoadState("networkidle");

		// Quiz auto-starts, navigate to question 4 (code completion) by clicking Next 3 times
		for (let i = 0; i < 3; i++) {
			const nextButton = page.getByRole("button", { name: /next/i });
			await nextButton.click();
			await page.waitForTimeout(500); // Small delay for smooth navigation
		}
	});

	test("should display code completion question with proper background in light mode", async ({
		page
	}) => {
		// Ensure light mode
		await page.evaluate(() => {
			document.documentElement.classList.remove("dark");
		});

		// Navigate to code completion question (question 4)
		const codeCompletionQuestion = page.locator('[data-question-type="code_completion"]');
		await expect(codeCompletionQuestion).toBeVisible();

		// Get select dropdown
		const selectDropdown = codeCompletionQuestion.locator(".code-blank-select").first();
		await expect(selectDropdown).toBeVisible();

		// Visual regression test
		await codeCompletionQuestion.screenshot({
			path: "./tmp/test/e2e/quiz-code-completion-light.png"
		});

		// Verify background color is NOT pure white (--card issue)
		const selectBg = await selectDropdown.evaluate((el) => {
			return window.getComputedStyle(el).backgroundColor;
		});

		// --muted in light = rgb(241, 245, 249) (slate-100)
		// --card in light = rgb(255, 255, 255) (pure white)
		expect(selectBg).not.toBe("rgb(255, 255, 255)"); // Should NOT be pure white
	});

	test("should display code completion question with proper background in dark mode", async ({
		page
	}) => {
		// Enable dark mode
		await page.evaluate(() => {
			document.documentElement.classList.add("dark");
		});

		// Navigate to code completion question
		const codeCompletionQuestion = page.locator('[data-question-type="code_completion"]');
		await expect(codeCompletionQuestion).toBeVisible();

		// Get select dropdown
		const selectDropdown = codeCompletionQuestion.locator(".code-blank-select").first();
		await expect(selectDropdown).toBeVisible();

		// Visual regression test
		await codeCompletionQuestion.screenshot({
			path: "./tmp/test/e2e/quiz-code-completion-dark.png"
		});

		// Verify background is NOT slate-950 (--card dark issue)
		const selectBg = await selectDropdown.evaluate((el) => {
			return window.getComputedStyle(el).backgroundColor;
		});

		// --muted in dark = rgb(30, 41, 59) (slate-800, 17% lightness)
		// --card in dark = rgb(2, 6, 23) (slate-950, 5% lightness - nearly black)
		const bgRgb = selectBg.match(/rgb\((\d+), (\d+), (\d+)\)/);
		if (bgRgb) {
			const [, r, g, b] = bgRgb.map(Number);
			const lightness = ((Math.max(r, g, b) + Math.min(r, g, b)) / 2 / 255) * 100;

			// Ensure lightness is > 10% (not nearly black like slate-950)
			expect(lightness).toBeGreaterThan(10);
		}
	});

	test("should have proper contrast in both themes without extreme colors", async ({ page }) => {
		// Test in both themes
		for (const theme of ["light", "dark"]) {
			await page.evaluate((isDark) => {
				if (isDark) {
					document.documentElement.classList.add("dark");
				} else {
					document.documentElement.classList.remove("dark");
				}
			}, theme === "dark");

			// Wait for CSS to recompute after theme change
			await page.waitForTimeout(100);

			const codeCompletionQuestion = page.locator('[data-question-type="code_completion"]');
			const selectDropdown = codeCompletionQuestion.locator(".code-blank-select").first();

			// Get background color
			const selectBg = await selectDropdown.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});

			const bgRgb = selectBg.match(/rgb\((\d+), (\d+), (\d+)\)/);
			expect(bgRgb).toBeTruthy();

			if (bgRgb) {
				const [, r, g, b] = bgRgb.map(Number);
				const lightness = ((Math.max(r, g, b) + Math.min(r, g, b)) / 2 / 255) * 100;

				if (theme === "light") {
					// Light theme: should NOT be pure white (100% lightness)
					expect(lightness).toBeLessThan(98);
					expect(lightness).toBeGreaterThan(70); // Should still be reasonably light
				} else {
					// Dark theme: should NOT be nearly black (<10% lightness)
					expect(lightness).toBeGreaterThan(10);
					expect(lightness).toBeLessThan(40); // Should still be reasonably dark
				}
			}
		}
	});
});
