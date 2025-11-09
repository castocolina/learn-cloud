/**
 * Simplified Search Indexer Test Suite
 *
 * Basic tests for the new simplified SearchIndexGenerator interface.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ExtendedTestSetup } from "../helpers/test-setup.js";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { SearchIndexCLI, SearchIndexGenerator } from "../../scripts/generate-search-index.js";
import { generateConfigId } from "../helpers/test-utils.js";
import { SETTINGS } from "../../config/settings.js";

// Mock process.argv for CLI testing
const originalArgv = process.argv;
const _originalExit = process.exit;

/**
 * Test setup for validation testing
 */
class SearchIndexTestSetup extends ExtendedTestSetup {
	public configId: string;
	public readonly testSuiteId: string;

	constructor(testSuiteId: string = "search-indexer") {
		// Use standardized path structure: ./tmp/test/unit/scripts/{name}-{timestamp}
		super("scripts", `search-index-${testSuiteId}`);
		this.testSuiteId = testSuiteId;
		this.configId = generateConfigId("test-search-idx", testSuiteId);
		this.createTestStructure();
	}

	private createTestStructure(): void {
		// Create temporary directories
		if (!existsSync(this.tempDir)) {
			mkdirSync(this.tempDir, { recursive: true });
		}

		const testDir = join(this.tempDir, "demo", "unit", "01_fundamentals", "lesson");
		mkdirSync(testDir, { recursive: true });

		// Create test lesson file
		const testLessonContent = `---
title: "Container Fundamentals"
description: "Introduction to containerization technology"
type: lesson
estimatedTime: 45
keywords:
  - docker
  - containers
  - linux-basics
---

# Container Fundamentals

This lesson covers the basics of containerization.

## Basic Docker Command

\`\`\`bash
docker run hello-world
\`\`\`

This demonstrates the fundamental concepts of Docker.`;

		writeFileSync(join(testDir, "01_lesson.md"), testLessonContent);
	}

	/**
	 * Create test settings with validation disabled
	 */
	public createTestSettings(enableValidation: boolean = false) {
		return {
			...SETTINGS,
			scripts: {
				...SETTINGS.scripts,
				validation: {
					...SETTINGS.scripts.validation,
					generated: {
						...SETTINGS.scripts.validation.generated,
						runAfterGeneration: enableValidation // Controlled validation
					}
				},
				searchIndex: {
					...SETTINGS.scripts.searchIndex,
					paths: {
						inputFolder: this.tempDir,
						outputFile: join(this.tempDir, "search-index.ts")
					}
				}
			}
		};
	}
}

describe("SearchIndexGenerator - Class-based Tests", () => {
	let testSetup: SearchIndexTestSetup;

	beforeEach(() => {
		testSetup = new SearchIndexTestSetup("search-gen");
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
		vi.restoreAllMocks();
	});

	describe("Basic Generation", () => {
		it("should instantiate SearchIndexGenerator", () => {
			const testSettings = testSetup.createTestSettings(false); // Validation disabled
			const generator = new SearchIndexGenerator(undefined, undefined, testSettings);
			expect(generator).toBeDefined();
		});

		it("should generate search index with class pattern", async () => {
			const testSettings = testSetup.createTestSettings(false); // Validation disabled
			const generator = new SearchIndexGenerator(
				testSetup.getTempDir(),
				join(testSetup.getTempDir(), "test-search-index.ts"),
				testSettings
			);

			const success = await generator.generate();
			expect(success).toBe(true);
		});

		it("should generate search index with validation enabled", async () => {
			const testSettings = testSetup.createTestSettings(true); // Validation enabled
			const generator = new SearchIndexGenerator(
				testSetup.getTempDir(),
				join(testSetup.getTempDir(), "validated-search-index.ts"),
				testSettings
			);

			const success = await generator.generate();
			expect(success).toBe(true);
		}, 30000); // Extended timeout for validation
	});

	describe("CLI Integration", () => {
		let cli: SearchIndexCLI;

		beforeEach(() => {
			const testSettings = testSetup.createTestSettings(false);
			cli = new SearchIndexCLI(testSettings);
		});

		afterEach(() => {
			process.argv = originalArgv;
		});

		it("should instantiate CLI", () => {
			expect(cli).toBeDefined();
		});

		it("should handle generate command", async () => {
			// Mock console methods to avoid output during tests
			const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
			const mockConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});

			// Mock process.exit to prevent actual exits during testing
			vi.spyOn(process, "exit").mockImplementation((code?: string | number | null | undefined) => {
				throw new Error(`Process exit called with code: ${code}`);
			});

			try {
				await cli.execute(["node", "script.js", "generate", "--mode=development"]);
			} catch (error) {
				// Expected to throw due to process.exit mock
				expect((error as Error).message).toContain("Process exit called");
			}

			expect(mockConsoleLog).toHaveBeenCalled();
			mockConsoleLog.mockRestore();
			mockConsoleError.mockRestore();
		});

		it("should handle help command", async () => {
			const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

			// Mock process.exit for help command
			vi.spyOn(process, "exit").mockImplementation((code?: string | number | null | undefined) => {
				throw new Error(`Process exit called with code: ${code}`);
			});

			try {
				await cli.execute(["node", "script.js", "--help"]);
			} catch (error) {
				// Expected to throw due to process.exit mock - help might exit with code 1 or 0
				expect((error as Error).message).toContain("Process exit called with code:");
			}

			mockConsoleLog.mockRestore();
		});
	});
});
