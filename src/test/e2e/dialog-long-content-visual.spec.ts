import { test } from "@playwright/test";

test("Long content dialog visual inspection", async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto("/showcase/dialog");
	await page.waitForLoadState("networkidle");

	// Open long content dialog
	await page.getByRole("button", { name: "Open Dialog with Long Content" }).click();
	await page.waitForTimeout(500);

	const dialog = page.getByRole("dialog");
	const box = await dialog.boundingBox();

	// Check scroll properties
	const scrollInfo = await dialog.evaluate((el) => {
		const htmlEl = el as HTMLElement;
		return {
			scrollHeight: htmlEl.scrollHeight,
			clientHeight: htmlEl.clientHeight,
			offsetHeight: htmlEl.offsetHeight,
			computedOverflow: window.getComputedStyle(el).overflowY,
			hasVerticalScroll: htmlEl.scrollHeight > htmlEl.clientHeight
		};
	});

	console.log("\n=== LONG CONTENT DIALOG ===");
	console.log(`Dialog box: ${box?.width}x${box?.height}px`);
	console.log(`Scroll height: ${scrollInfo.scrollHeight}px`);
	console.log(`Client height: ${scrollInfo.clientHeight}px`);
	console.log(`Offset height: ${scrollInfo.offsetHeight}px`);
	console.log(`Computed overflow-y: ${scrollInfo.computedOverflow}`);
	console.log(`Has vertical scroll: ${scrollInfo.hasVerticalScroll}`);

	// Take screenshot
	await page.screenshot({
		path: "tmp/test/e2e/dialog-long-content-issue.png",
		fullPage: true
	});

	console.log("\n✓ Screenshot saved to tmp/dialog-long-content-issue.png\n");
});
