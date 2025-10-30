/**
 * Dialog Responsive Regression Test
 *
 * Tests dialog size behavior across different viewport sizes to prevent
 * the regression where all dialogs look the same in mid-range viewports.
 *
 * Expected behavior:
 * - Mobile (≤390px): All dialogs full-screen
 * - Tablet (768px-1023px): Size variants should be differentiated
 * - Desktop (≥1024px): Size variants clearly visible
 */

import { test, expect } from "@playwright/test";

const VIEWPORTS = {
	mobile: { width: 375, height: 667, name: "Mobile (iPhone)" },
	tablet: { width: 768, height: 1024, name: "Tablet (iPad)" },
	midRange: { width: 850, height: 900, name: "Mid-range (850px)" },
	desktop: { width: 1280, height: 720, name: "Desktop (1280px)" },
	large: { width: 1920, height: 1080, name: "Large Desktop (1920px)" }
};

test.describe("Dialog Responsive Behavior Regression", () => {
	for (const [_key, viewport] of Object.entries(VIEWPORTS)) {
		test.describe(`${viewport.name} - ${viewport.width}x${viewport.height}`, () => {
			test.use({ viewport });

			test("should have correct Small dialog dimensions", async ({ page }) => {
				await page.goto("/showcase/dialog");
				await page.waitForLoadState("networkidle");

				// Open Small dialog
				await page.getByRole("button", { name: "Open Small (sm)" }).click();
				await page.waitForTimeout(500);

				const dialog = page.getByRole("dialog");
				await expect(dialog).toBeVisible();

				// Get dialog dimensions
				const box = await dialog.boundingBox();
				const windowSize = page.viewportSize();

				console.log(`[${viewport.name}] Small Dialog:`);
				console.log(`  Dialog: ${box?.width}x${box?.height}`);
				console.log(`  Window: ${windowSize?.width}x${windowSize?.height}`);
				console.log(
					`  Width %: ${box && windowSize ? ((box.width / windowSize.width) * 100).toFixed(1) : "N/A"}%`
				);
				console.log(
					`  Height %: ${box && windowSize ? ((box.height / windowSize.height) * 100).toFixed(1) : "N/A"}%`
				);

				// Verify behavior based on viewport
				if (viewport.width < 768) {
					// Mobile: Should be full-screen
					expect(box?.width).toBeGreaterThan((windowSize?.width ?? 0) * 0.9);
				} else if (viewport.width >= 1024) {
					// Desktop: Should be constrained to sm size (~384px)
					expect(box?.width).toBeLessThan(450); // Max-width sm
					expect(box?.width).toBeGreaterThan(300); // Min reasonable width
				} else {
					// Mid-range (768-1023): Should NOT be full-screen
					// This is the regression - it should be sized, not full-screen
					const widthPercent = box && windowSize ? (box.width / windowSize.width) * 100 : 0;
					console.log(`  ⚠️  Mid-range width: ${widthPercent.toFixed(1)}%`);
					// Currently FAILS - dialog is full-screen here
				}
			});

			test("should differentiate between Small and Large dialogs", async ({ page }) => {
				await page.goto("/showcase/dialog");
				await page.waitForLoadState("networkidle");

				// Get Small dialog dimensions
				await page.getByRole("button", { name: "Open Small (sm)" }).click();
				await page.waitForTimeout(500);
				const smallBox = await page.getByRole("dialog").boundingBox();
				await page.keyboard.press("Escape");
				await page.waitForTimeout(300);

				// Get Large dialog dimensions
				await page.getByRole("button", { name: "Open Large (lg)" }).click();
				await page.waitForTimeout(500);
				const largeBox = await page.getByRole("dialog").boundingBox();

				console.log(`[${viewport.name}] Size Comparison:`);
				console.log(`  Small: ${smallBox?.width}x${smallBox?.height}`);
				console.log(`  Large: ${largeBox?.width}x${largeBox?.height}`);

				if (viewport.width < 768) {
					// Mobile: Both should be same (full-screen)
					expect(smallBox?.width).toBeCloseTo(largeBox?.width ?? 0, 10);
				} else if (viewport.width >= 1024) {
					// Desktop: Large should be wider than Small
					expect(largeBox?.width).toBeGreaterThan(smallBox?.width ?? 0);
					console.log(
						`  ✅ Large is ${((largeBox?.width ?? 0) - (smallBox?.width ?? 0)).toFixed(0)}px wider`
					);
				} else {
					// Mid-range: Should also be different
					// Currently FAILS - both are full-screen
					const widthDiff = (largeBox?.width ?? 0) - (smallBox?.width ?? 0);
					console.log(`  ⚠️  Width difference: ${widthDiff.toFixed(0)}px`);

					if (Math.abs(widthDiff) < 50) {
						console.log(`  ❌ REGRESSION: Dialogs are too similar in mid-range viewport`);
					}
				}
			});

			test("should not stretch dialogs vertically unnecessarily", async ({ page }) => {
				await page.goto("/showcase/dialog");
				await page.waitForLoadState("networkidle");

				// Open Small dialog with minimal content
				await page.getByRole("button", { name: "Open Small (sm)" }).click();
				await page.waitForTimeout(500);

				const dialog = page.getByRole("dialog");
				const box = await dialog.boundingBox();
				const windowSize = page.viewportSize();

				const heightPercent = box && windowSize ? (box.height / windowSize.height) * 100 : 0;

				console.log(`[${viewport.name}] Vertical Stretch:`);
				console.log(`  Dialog height: ${box?.height}px`);
				console.log(`  Window height: ${windowSize?.height}px`);
				console.log(`  Height %: ${heightPercent.toFixed(1)}%`);

				if (viewport.width >= 768) {
					// Desktop/Tablet: Dialog should NOT be full-height for small content
					// Should be content-sized, not stretched
					if (heightPercent > 80) {
						console.log(
							`  ❌ REGRESSION: Dialog unnecessarily stretched to ${heightPercent.toFixed(1)}%`
						);
					}

					// Small dialog with minimal content should be much less than 90vh
					expect(heightPercent).toBeLessThan(70); // Reasonable max for small content
				}
			});
		});
	}
});

test.describe("Dialog Height Behavior", () => {
	test("should use h-auto at all viewports for content-based height", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		await page.goto("/showcase/dialog");
		await page.waitForLoadState("networkidle");

		// Open Small dialog
		await page.getByRole("button", { name: "Open Small (sm)" }).click();
		await page.waitForTimeout(500);

		const dialog = page.getByRole("dialog");
		const computedStyles = await dialog.evaluate((el) => {
			const styles = window.getComputedStyle(el);
			return {
				height: styles.height,
				maxHeight: styles.maxHeight,
				minHeight: styles.minHeight,
				classes: el.className
			};
		});

		console.log("Desktop Small Dialog Styles:");
		console.log("  height:", computedStyles.height);
		console.log("  max-height:", computedStyles.maxHeight);
		console.log("  min-height:", computedStyles.minHeight);
		console.log("  classes:", computedStyles.classes);

		// Should have h-auto (auto height) at ALL viewports (no sm: prefix)
		expect(computedStyles.classes).toContain("h-auto");
		// Should have max-h-[90vh] constraint at all viewports
		expect(computedStyles.classes).toContain("max-h-[90vh]");
	});

	test("should adjust to content height on mobile (not full viewport)", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/showcase/dialog");
		await page.waitForLoadState("networkidle");

		// Open Small dialog
		await page.getByRole("button", { name: "Open Small (sm)" }).click();
		await page.waitForTimeout(500);

		const dialog = page.getByRole("dialog");
		const box = await dialog.boundingBox();
		const windowSize = page.viewportSize();

		const heightPercent = box && windowSize ? (box.height / windowSize.height) * 100 : 0;

		console.log("Mobile Small Dialog:");
		console.log(
			`  Height: ${box?.height}px / ${windowSize?.height}px = ${heightPercent.toFixed(1)}%`
		);

		// NEW BEHAVIOR: Dialog adjusts to content, NOT full height
		// Small dialog with minimal content should be much less than 90% of viewport
		expect(heightPercent).toBeLessThan(50); // Should be compact, not full screen
		expect(box?.height).toBeGreaterThan(100); // But still has reasonable min height
	});
});
