import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for E2E Testing
 *
 * ARCHITECTURE:
 * - Test directory: src/test/e2e
 * - Base URL: http://localhost:5173 (SvelteKit dev server)
 * - Browser: Chromium only (consistent testing environment)
 * - Parallel execution: Enabled for faster test runs
 *
 * FEATURES:
 * - Automatic dev server startup
 * - Screenshot on failure
 * - Trace on first retry
 * - HTML reporter
 *
 * USAGE:
 * - pnpm run test:e2e - Run all E2E tests
 * - pnpm run test:e2e:ui - Open Playwright UI
 * - pnpm run test:e2e:debug - Run with debugger
 *
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	// Test directory
	testDir: "./src/test/e2e",

	// Run tests in parallel
	fullyParallel: true,

	// Fail the build on CI if you accidentally left test.only in the source code
	forbidOnly: !!process.env.CI,

	// Retry on CI only
	retries: process.env.CI ? 2 : 0,

	// Stop early if many tests fail (indicates broken build)
	maxFailures: 10,

	// Default timeout per test (30 seconds)
	timeout: 30000,

	// Workers: Percentage-based for portability (works on any machine/CI)
	workers: "75%",

	// Reporter to use
	reporter: process.env.CI
		? [
				["html", { outputFolder: "tmp/test/e2e/playwright-report", open: "never" }],
				["github"], // GitHub Actions annotations with file/line info
				["list"] // Detailed summary with test names and durations
			]
		: [
				["html", { outputFolder: "tmp/test/e2e/playwright-report", open: "never" }],
				["line"] // Console output with progress indicator [X/206]
			],

	// Output directory for test artifacts
	outputDir: "tmp/test/e2e/test-results",

	// Shared settings for all projects
	use: {
		// Base URL to use in actions like `await page.goto('/')`
		baseURL: "http://localhost:5173",

		// Run headless (no visible browser window) for better performance
		headless: true,

		// Collect trace when retrying the failed test
		trace: "on-first-retry",

		// Screenshot on failure
		screenshot: "only-on-failure",

		// Viewport size
		viewport: { width: 1280, height: 720 }
	},

	// Configure projects for major browsers
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] }
		}
	],

	// Run your local dev server before starting the tests
	webServer: {
		command: "pnpm run dev",
		url: "http://localhost:5173",
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000 // 2 minutes
	}
});
