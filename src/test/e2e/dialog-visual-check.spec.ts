import { test } from "@playwright/test";

test("Visual check - take screenshots", async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto("/showcase/dialog");
	await page.waitForLoadState("networkidle");

	console.log("\n=== DIALOG VISUAL CHECK ===\n");

	// Small
	await page.getByRole("button", { name: "Open Small (sm)" }).click();
	await page.waitForTimeout(500);
	await page.screenshot({ path: "tmp/test/e2e/dialog-small.png", fullPage: false });
	const smallBox = await page.getByRole("dialog").boundingBox();
	console.log(`Small (sm):  ${smallBox?.width}x${smallBox?.height}px`);
	await page.keyboard.press("Escape");
	await page.waitForTimeout(300);

	// Medium
	await page.getByRole("button", { name: "Open Medium (md)" }).click();
	await page.waitForTimeout(500);
	await page.screenshot({ path: "tmp/test/e2e/dialog-medium.png", fullPage: false });
	const mediumBox = await page.getByRole("dialog").boundingBox();
	console.log(`Medium (md): ${mediumBox?.width}x${mediumBox?.height}px`);
	await page.keyboard.press("Escape");
	await page.waitForTimeout(300);

	// Large
	await page.getByRole("button", { name: "Open Large (lg)" }).click();
	await page.waitForTimeout(500);
	await page.screenshot({ path: "tmp/test/e2e/dialog-large.png", fullPage: false });
	const largeBox = await page.getByRole("dialog").boundingBox();
	console.log(`Large (lg):  ${largeBox?.width}x${largeBox?.height}px`);
	await page.keyboard.press("Escape");
	await page.waitForTimeout(300);

	// XL
	await page.getByRole("button", { name: "Open Extra Large (xl)" }).click();
	await page.waitForTimeout(500);
	await page.screenshot({ path: "tmp/test/e2e/dialog-xl.png", fullPage: false });
	const xlBox = await page.getByRole("dialog").boundingBox();
	console.log(`XL (xl):     ${xlBox?.width}x${xlBox?.height}px`);

	console.log("\n✓ Screenshots saved to tmp/test/e2e/dialog-*.png\n");
});
