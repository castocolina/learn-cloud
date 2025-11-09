import { test } from "@playwright/test";

test("Dialog narrow viewport test - 600px width", async ({ page }) => {
	// Set narrow viewport (600px width as requested)
	await page.setViewportSize({ width: 600, height: 900 });
	await page.goto("/showcase/dialog");
	await page.waitForLoadState("networkidle");

	console.log("\n=== DIALOG NARROW VIEWPORT TEST (600px) ===\n");

	// Small
	console.log("Testing Small (sm)...");
	await page.getByRole("button", { name: "Open Small (sm)" }).click();
	await page.waitForTimeout(500);
	await page.screenshot({ path: "tmp/test/e2e/dialog-narrow-small.png", fullPage: true });
	const smallBox = await page.getByRole("dialog").boundingBox();
	console.log(`Small (sm):  ${smallBox?.width}x${smallBox?.height}px`);
	await page.keyboard.press("Escape");
	await page.waitForTimeout(300);

	// Medium
	console.log("Testing Medium (md)...");
	await page.getByRole("button", { name: "Open Medium (md)" }).click();
	await page.waitForTimeout(500);
	await page.screenshot({ path: "tmp/test/e2e/dialog-narrow-medium.png", fullPage: true });
	const mediumBox = await page.getByRole("dialog").boundingBox();
	console.log(`Medium (md): ${mediumBox?.width}x${mediumBox?.height}px`);
	await page.keyboard.press("Escape");
	await page.waitForTimeout(300);

	// Large
	console.log("Testing Large (lg)...");
	await page.getByRole("button", { name: "Open Large (lg)" }).click();
	await page.waitForTimeout(500);
	await page.screenshot({ path: "tmp/test/e2e/dialog-narrow-large.png", fullPage: true });
	const largeBox = await page.getByRole("dialog").boundingBox();
	console.log(`Large (lg):  ${largeBox?.width}x${largeBox?.height}px`);
	await page.keyboard.press("Escape");
	await page.waitForTimeout(300);

	// XL
	console.log("Testing XL (xl)...");
	await page.getByRole("button", { name: "Open Extra Large (xl)" }).click();
	await page.waitForTimeout(500);
	await page.screenshot({ path: "tmp/test/e2e/dialog-narrow-xl.png", fullPage: true });
	const xlBox = await page.getByRole("dialog").boundingBox();
	console.log(`XL (xl):     ${xlBox?.width}x${xlBox?.height}px`);
	await page.keyboard.press("Escape");
	await page.waitForTimeout(300);

	// Full Screen
	console.log("Testing Full Screen (90%)...");
	await page.getByRole("button", { name: "Open Full Screen (90%)" }).click();
	await page.waitForTimeout(500);
	await page.screenshot({ path: "tmp/test/e2e/dialog-narrow-fullscreen.png", fullPage: true });
	const fullBox = await page.getByRole("dialog").boundingBox();
	console.log(`Full:        ${fullBox?.width}x${fullBox?.height}px`);

	console.log("\n✓ All narrow viewport screenshots saved to tmp/test/e2e/dialog-narrow-*.png\n");
});
