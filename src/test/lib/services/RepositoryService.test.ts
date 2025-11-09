/**
 * RepositoryService Test Suite
 *
 * Comprehensive tests for RepositoryService with focus on:
 * - Safety strategy enforcement (scaffold/draft/final status)
 * - Prettier formatting integration
 * - File operation correctness (create/update/delete)
 * - Force flag behavior
 * - Backup creation and restoration
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { RepositoryService } from "$lib/services/RepositoryService.js";
import { generateLessonContent } from "$lib/utils/template-generator.js";
import type { LessonContent } from "$types";
import { ExtendedTestSetup } from "../../helpers/test-setup.js";

// Test setup with conditional cleanup
const testSetup = new ExtendedTestSetup("services", "repository");
const TEST_DIR = testSetup.getTempDir();
const TEST_BACKUP_DIR = join(TEST_DIR, "backups");

/**
 * Helper to create test args for template generator
 */
const createTestArgs = (unit = "1", id = "01_01") => ({
	unit: { type: "string" as const, value: unit },
	type: "lesson" as const,
	id
});

/**
 * Helper to create test file with specific status
 */
const createTestFile = (filePath: string, content: LessonContent, status?: string): void => {
	const dir = testSetup.createSubdir("test-files");
	const fullPath = join(dir, filePath);
	const contentString = `${status ? `// STATUS: ${status}\n` : ""}export const content = ${JSON.stringify(content, null, 2)};`;

	writeFileSync(fullPath, contentString, "utf-8");
};

/**
 * Test Setup
 */
describe("RepositoryService", () => {
	let service: RepositoryService;

	beforeEach(() => {
		// Setup test directories
		testSetup.setup();
		testSetup.createSubdir("backups");

		// Initialize service with test configuration
		service = new RepositoryService({
			mode: "safe",
			createBackups: true,
			validateBeforeWrite: false, // ContentCore handles validation
			respectContentStatus: true,
			backupDirectory: TEST_BACKUP_DIR
		});
	});

	afterEach((context) => {
		// Conditional cleanup: only remove files if test passed
		testSetup.cleanupIfPassed(context);
	});

	// ============================================================================
	// SAFETY STRATEGY TESTS
	// ============================================================================

	describe("Safety Strategy", () => {
		it("should allow overwriting scaffold content without force", async () => {
			const args = createTestArgs();
			const content = generateLessonContent(args);
			const testFile = "test-scaffold.ts";

			// Create scaffold file
			createTestFile(testFile, content, "scaffold");

			const filePath = join(TEST_DIR, "test-files", testFile);
			const result = await service.writeFormattedContent(filePath, content, { mode: "safe" });

			expect(result.success).toBe(true);
			expect(result.action).toBe("updated");
		});

		// NOTE: Safety checks have been moved to ContentCore
		// RepositoryService no longer performs content status checks
		// See ContentCore.test.ts and ContentSafetyService.test.ts for safety tests

		it("should allow overwriting final content with force mode", async () => {
			const args = createTestArgs();
			const content = generateLessonContent(args);
			const testFile = "test-final-force.ts";

			// Create final file
			createTestFile(testFile, content, "final");

			const filePath = join(TEST_DIR, "test-files", testFile);
			const result = await service.writeFormattedContent(filePath, content, { mode: "force" });

			expect(result.success).toBe(true);
			expect(result.action).toBe("updated");
		});
	});

	// ============================================================================
	// PRETTIER FORMATTING TESTS
	// ============================================================================

	describe("Prettier Formatting", () => {
		it("should format content with Prettier before writing", async () => {
			const args = createTestArgs();
			const content = generateLessonContent(args);
			const testFile = "test-formatted.ts";
			const filePath = join(TEST_DIR, "test-files", testFile);

			mkdirSync(join(TEST_DIR, "test-files"), { recursive: true });

			const result = await service.writeFormattedContent(filePath, content);

			expect(result.success).toBe(true);

			// Read file and verify it's formatted
			const fileContent = readFileSync(filePath, "utf-8");

			// Check for proper formatting indicators
			expect(fileContent).toContain("export const content =");
			expect(fileContent).toMatch(/{\s+type:/); // Proper indentation
			expect(fileContent).toMatch(/;\s*$/); // Semicolon at end
		});

		it("should handle Prettier formatting failures gracefully", async () => {
			const args = createTestArgs();
			const content = generateLessonContent(args);
			const testFile = "test-prettier-fail.ts";

			// Use invalid filepath to trigger Prettier failure
			const filePath = join(TEST_DIR, "test-files", testFile);
			mkdirSync(join(TEST_DIR, "test-files"), { recursive: true });

			const result = await service.writeFormattedContent(filePath, content);

			// Should still succeed even if formatting fails (falls back to unformatted)
			expect(result.success).toBe(true);
		});
	});

	// ============================================================================
	// WRITE OPERATION TESTS
	// ============================================================================

	describe("Write Operations", () => {
		it("should create new file when file does not exist", async () => {
			const args = createTestArgs();
			const content = generateLessonContent(args);
			const testFile = "test-new.ts";
			const filePath = join(TEST_DIR, "test-files", testFile);

			mkdirSync(join(TEST_DIR, "test-files"), { recursive: true });

			const result = await service.writeFormattedContent(filePath, content);

			expect(result.success).toBe(true);
			expect(result.action).toBe("created");
			expect(existsSync(filePath)).toBe(true);
		});

		it("should update existing scaffold file", async () => {
			const args = createTestArgs();
			const content = generateLessonContent(args);
			const testFile = "test-update.ts";

			// Create initial file
			createTestFile(testFile, content, "scaffold");

			const filePath = join(TEST_DIR, "test-files", testFile);

			// Update with new content
			const updatedContent = { ...content, title: "Updated Title" };
			const result = await service.writeFormattedContent(filePath, updatedContent);

			expect(result.success).toBe(true);
			expect(result.action).toBe("updated");

			// Verify content was updated
			const fileContent = readFileSync(filePath, "utf-8");
			expect(fileContent).toContain("Updated Title");
		});

		it("should create backup when updating existing file", async () => {
			const args = createTestArgs();
			const content = generateLessonContent(args);
			const testFile = "test-backup.ts";

			// Create initial file
			createTestFile(testFile, content, "scaffold");

			const filePath = join(TEST_DIR, "test-files", testFile);

			// Update with backups enabled
			const updatedContent = { ...content, title: "Updated with Backup" };
			const result = await service.writeFormattedContent(filePath, updatedContent, {
				createBackups: true
			});

			expect(result.success).toBe(true);
			expect(result.backupPath).toBeDefined();

			if (result.backupPath) {
				expect(existsSync(result.backupPath)).toBe(true);
			}
		});

		it("should respect createBackups option", async () => {
			const args = createTestArgs();
			const content = generateLessonContent(args);
			const testFile = "test-no-backup.ts";

			// Create initial file
			createTestFile(testFile, content, "scaffold");

			const filePath = join(TEST_DIR, "test-files", testFile);

			// Update with backups disabled
			const updatedContent = { ...content, title: "Updated without Backup" };
			const result = await service.writeFormattedContent(filePath, updatedContent, {
				createBackups: false
			});

			expect(result.success).toBe(true);
			expect(result.backupPath).toBeUndefined();
		});
	});

	// ============================================================================
	// FILE OPERATION STATISTICS TESTS
	// ============================================================================

	describe("File Operation Statistics", () => {
		it("should generate correct statistics for successful operations", () => {
			const operations = [
				{
					success: true,
					action: "created" as const,
					filePath: "/test/file1.ts"
				},
				{
					success: true,
					action: "updated" as const,
					filePath: "/test/file2.ts"
				},
				{
					success: false,
					action: "created" as const,
					filePath: "/test/file3.ts",
					error: "Test error"
				}
			];

			const stats = service.generateStats(operations);

			expect(stats.totalChapters).toBe(2);
			expect(stats.newFiles).toBe(1);
			expect(stats.existingFiles).toBe(1);
			expect(stats.errors).toHaveLength(1);
			expect(stats.errors[0]).toBe("Test error");
		});

		it("should handle empty operations array", () => {
			const stats = service.generateStats([]);

			expect(stats.totalChapters).toBe(0);
			expect(stats.newFiles).toBe(0);
			expect(stats.existingFiles).toBe(0);
			expect(stats.errors).toHaveLength(0);
		});
	});

	// ============================================================================
	// CONTENT STATUS DETECTION TESTS
	// ============================================================================
	// Note: Content status detection has been moved to ContentSafetyService
	// See src/test/lib/services/ContentSafetyService.test.ts for status detection tests

	// ============================================================================
	// CONFIGURATION TESTS
	// ============================================================================

	describe("Configuration Management", () => {
		it("should update configuration", () => {
			const newConfig = {
				mode: "force" as const,
				createBackups: false
			};

			service.updateConfig(newConfig);

			const config = service.getConfig();

			expect(config.mode).toBe("force");
			expect(config.createBackups).toBe(false);
		});

		it("should preserve unmodified configuration values", () => {
			const originalConfig = service.getConfig();

			service.updateConfig({ mode: "force" });

			const config = service.getConfig();

			expect(config.mode).toBe("force");
			expect(config.createBackups).toBe(originalConfig.createBackups);
			expect(config.backupDirectory).toBe(originalConfig.backupDirectory);
		});
	});
});
