/**
 * Test Setup Helper
 *
 * Provides standardized temporary directory management for unit tests with:
 * - Organized structure: ./tmp/test/unit/{category}/{name}-{timestamp}/
 * - Conditional cleanup: Only removes files when tests pass
 * - Debugging support: Preserves files on test failure for investigation
 *
 * Usage:
 *   const testSetup = new TestSetup('scripts', 'generate-menu');
 *   testSetup.setup();
 *
 *   afterEach((context) => {
 *     testSetup.cleanupIfPassed(context);
 *   });
 */

import { existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import type { TestContext } from "vitest";

export type TestCategory = "scripts" | "services" | "utils";

/**
 * Base test setup class for managing temporary directories
 */
export class TestSetup {
	protected tempDir: string;
	protected category: TestCategory;
	protected testName: string;

	/**
	 * Create a new test setup instance
	 *
	 * @param category - Test category (scripts/services/utils)
	 * @param testName - Test name (used for directory naming)
	 */
	constructor(category: TestCategory, testName: string) {
		const timestamp = Date.now();
		this.category = category;
		this.testName = testName;

		// Standardized path structure: ./tmp/test/unit/{category}/{name}-{timestamp}/
		this.tempDir = join(process.cwd(), "tmp", "test", "unit", category, `${testName}-${timestamp}`);
	}

	/**
	 * Get the temporary directory path
	 */
	getTempDir(): string {
		return this.tempDir;
	}

	/**
	 * Create the temporary directory structure
	 */
	setup(): void {
		if (!existsSync(this.tempDir)) {
			mkdirSync(this.tempDir, { recursive: true });
		}
	}

	/**
	 * Cleanup with conditional logic based on test result
	 *
	 * @param testPassed - Whether the test passed
	 */
	cleanup(testPassed: boolean): void {
		if (!existsSync(this.tempDir)) {
			return;
		}

		if (testPassed) {
			try {
				rmSync(this.tempDir, { recursive: true, force: true });
				console.log(`✅ [${this.category}/${this.testName}] Cleaned up temp files`);
			} catch (error) {
				console.warn(`⚠️  [${this.category}/${this.testName}] Failed to cleanup: ${error}`);
			}
		} else {
			console.log(
				`⚠️  [${this.category}/${this.testName}] Test failed - files preserved for debugging:`
			);
			console.log(`    ${this.tempDir}`);
		}
	}

	/**
	 * Vitest-compatible cleanup that uses test context
	 *
	 * Use this in afterEach hooks:
	 *   afterEach((context) => testSetup.cleanupIfPassed(context));
	 *
	 * @param context - Vitest task context
	 */
	cleanupIfPassed(context: TestContext): void {
		const testPassed = context.task.result?.state === "pass";
		this.cleanup(testPassed);
	}

	/**
	 * Force cleanup regardless of test result
	 * Use sparingly - mainly for cleanup of shared resources
	 */
	forceCleanup(): void {
		if (existsSync(this.tempDir)) {
			try {
				rmSync(this.tempDir, { recursive: true, force: true });
				console.log(`🗑️  [${this.category}/${this.testName}] Force cleaned`);
			} catch (error) {
				console.warn(`⚠️  [${this.category}/${this.testName}] Force cleanup failed: ${error}`);
			}
		}
	}
}

/**
 * Extended test setup with additional helper methods
 * Subclass this for tests that need custom setup logic
 */
export class ExtendedTestSetup extends TestSetup {
	/**
	 * Create a subdirectory within the temp directory
	 *
	 * @param subPath - Relative path within temp directory
	 * @returns Full path to the subdirectory
	 */
	createSubdir(subPath: string): string {
		const fullPath = join(this.tempDir, subPath);
		if (!existsSync(fullPath)) {
			mkdirSync(fullPath, { recursive: true });
		}
		return fullPath;
	}

	/**
	 * Get path to a file within the temp directory
	 *
	 * @param relativePath - Relative path to file
	 * @returns Full path to the file
	 */
	getFilePath(relativePath: string): string {
		return join(this.tempDir, relativePath);
	}
}
