import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		// Test environment configuration
		environment: "node",

		// Performance optimizations
		sequence: {
			shuffle: false // Keep false to maintain slow-tests-first optimization
		},

		// Parallel execution configuration
		pool: "threads",
		poolOptions: {
			threads: {
				// Use reasonable number of threads based on system
				minThreads: 1,
				maxThreads: 4
			}
		},

		// Timeout configurations
		testTimeout: 10000, // 10 seconds default timeout
		hookTimeout: 10000, // 10 seconds for setup/teardown

		// Coverage configuration (if needed)
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: ["node_modules/", "tmp/", "src/test/", "*.config.*"]
		},

		// Include patterns for test files
		include: ["src/test/**/*.{test,spec}.{js,ts}"],

		// Exclude patterns
		exclude: ["node_modules/", "dist/", ".svelte-kit/", "tmp/"],

		// Global setup/teardown
		globalSetup: [],

		// Disable watch mode in CI
		watch: process.env.CI ? false : true,

		// Reporter configuration
		reporters: process.env.CI ? ["verbose", "json"] : ["default"],

		// Retry configuration for flaky tests
		retry: process.env.CI ? 2 : 0
	}
});
