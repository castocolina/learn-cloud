import { test } from "@playwright/test";

test("Dialog long content overflow test", async ({ page }) => {
	// Test at narrow viewport
	await page.setViewportSize({ width: 600, height: 900 });
	await page.goto("http://localhost:5173/showcase/dialog");
	await page.waitForLoadState("networkidle");

	console.log("\n=== TESTING LONG CONTENT DIALOG ===\n");

	// Open the long content dialog
	await page.getByRole("button", { name: "Open Dialog with Long Content" }).click();
	await page.waitForTimeout(500);

	// Capture screenshot
	await page.screenshot({ path: "tmp/test/e2e/dialog-long-content-narrow.png", fullPage: true });

	// Get dialog dimensions
	const dialogBox = await page.getByRole("dialog").boundingBox();
	console.log(`Dialog dimensions: ${dialogBox?.width}x${dialogBox?.height}px`);

	// Check if dialog is scrollable
	const isScrollable = await page.getByRole("dialog").evaluate((el) => {
		return el.scrollHeight > el.clientHeight;
	});
	console.log(`Dialog is scrollable: ${isScrollable}`);
	console.log(`ScrollHeight: ${await page.getByRole("dialog").evaluate((el) => el.scrollHeight)}`);
	console.log(`ClientHeight: ${await page.getByRole("dialog").evaluate((el) => el.clientHeight)}`);

	// Test at desktop viewport
	await page.keyboard.press("Escape");
	await page.waitForTimeout(300);

	await page.setViewportSize({ width: 1280, height: 900 });
	await page.getByRole("button", { name: "Open Dialog with Long Content" }).click();
	await page.waitForTimeout(500);

	await page.screenshot({ path: "tmp/test/e2e/dialog-long-content-desktop.png", fullPage: false });

	const dialogBoxDesktop = await page.getByRole("dialog").boundingBox();
	console.log(
		`\nDesktop Dialog dimensions: ${dialogBoxDesktop?.width}x${dialogBoxDesktop?.height}px`
	);

	const isScrollableDesktop = await page.getByRole("dialog").evaluate((el) => {
		return el.scrollHeight > el.clientHeight;
	});
	console.log(`Desktop Dialog is scrollable: ${isScrollableDesktop}`);

	console.log("\n✓ Long content dialog screenshots saved\n");
});
