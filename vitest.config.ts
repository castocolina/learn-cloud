import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		// Project-based test configuration (replaces deprecated environmentMatchGlobs)
		// Migrated to test.projects for Vitest 4.0 compatibility
		// Each project has explicit environment and file pattern matching
		projects: [
			// Browser components (require jsdom for DOM APIs, localStorage, window, document)
			{
				extends: true, // Inherit global settings
				test: {
					name: "browser-components",
					environment: "jsdom",
					include: [
						"**/components/**/*.test.ts",
						"**/layout/**/*.test.ts",
						"**/routes/**/*.test.ts", // Future-proofing
						"**/lib/stores/**/*.test.ts", // Future-proofing
						"**/lib/hooks/**/*.test.ts", // Future-proofing
						"**/utils/hashRouter.test.ts",
						"**/lib/utils/template-generator.test.ts"
					],
					exclude: ["node_modules/", "dist/", ".svelte-kit/", "tmp/", "src/test/e2e/**"]
				}
			},

			// Node scripts & services (pure Node.js, no browser APIs)
			{
				extends: true, // Inherit global settings
				test: {
					name: "node-scripts",
					environment: "node",
					include: [
						"**/scripts/**/*.test.ts",
						"**/lib/services/**/*.test.ts",
						"**/schemas-external.test.ts",
						".claude/skills/**/__tests__/*.test.ts"
					],
					exclude: ["node_modules/", "dist/", ".svelte-kit/", "tmp/", "src/test/e2e/**"]
				}
			}
		],

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
			reportsDirectory: "tmp/test/unit/coverage",
			exclude: ["node_modules/", "tmp/", "src/test/", "*.config.*"]
		},

		// NOTE: include/exclude patterns moved to project-level configuration
		// Each project defines its own include patterns for better control

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
