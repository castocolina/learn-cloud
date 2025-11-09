/**
 * ContentCore Test Suite
 *
 * Tests the ContentCore orchestration layer that coordinates between
 * ValidationService and RepositoryService for content operations.
 *
 * This test suite focuses on:
 * - Content processing workflow (validation → persistence)
 * - Validation-only operations
 * - Safety checks integration
 * - Error handling and recovery
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ContentCore } from "$lib/services/ContentCore.js";
import { generateLessonContent } from "$lib/utils/template-generator.js";
import type { ValidatedScaffoldingArgs } from "$types";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";
import { TestSetup } from "../../helpers/test-setup.js";

// Test setup with conditional cleanup
const testSetup = new TestSetup("services", "content-core");
const TEST_DIR = testSetup.getTempDir();
const TEST_FILE_PATH = join(TEST_DIR, "test-lesson.ts");

// Helper to create test args
const createTestArgs = (
	type: "lesson" = "lesson",
	unit: string = "1",
	id: string = "01_01"
): ValidatedScaffoldingArgs => ({
	unit: {
		type: "string" as const,
		value: unit
	},
	type,
	id
});

describe("ContentCore", () => {
	let contentCore: ContentCore;

	beforeEach(() => {
		contentCore = new ContentCore();

		// Setup test directory
		testSetup.setup();

		// Clean up test file if it exists
		if (existsSync(TEST_FILE_PATH)) {
			unlinkSync(TEST_FILE_PATH);
		}
	});

	afterEach((context) => {
		// Clean up test file first (if exists)
		if (existsSync(TEST_FILE_PATH)) {
			try {
				unlinkSync(TEST_FILE_PATH);
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (_e) {
				// Ignore cleanup errors
			}
		}

		// Conditional cleanup: only remove directory if test passed
		testSetup.cleanupIfPassed(context);
	});

	describe("processGeneratedContent()", () => {
		it("should successfully process valid content from template generator", async () => {
			const args = createTestArgs();
			const content = generateLessonContent(args);

			const result = await contentCore.processGeneratedContent(
				TEST_FILE_PATH,
				content as unknown as Record<string, unknown>,
				{
					mode: "safe",
					createBackups: false
				}
			);

			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();
			expect(existsSync(TEST_FILE_PATH)).toBe(true);
		});

		it("should handle errors gracefully when path is invalid", async () => {
			const invalidPath = "/invalid/path/that/does/not/exist/file.ts";
			const args = createTestArgs();
			const content = generateLessonContent(args);

			const result = await contentCore.processGeneratedContent(
				invalidPath,
				content as unknown as Record<string, unknown>,
				{
					mode: "safe",
					createBackups: false
				}
			);

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});
	});

	describe("validateContent()", () => {
		it("should validate template-generated content successfully (Mermaid check)", async () => {
			const args = createTestArgs();
			const content = generateLessonContent(args);

			const result = await contentCore.validateContent(
				content as unknown as Record<string, unknown>
			);

			// Note: ContentCore validates Mermaid content, not full schema
			// Template-generated content has no Mermaid diagrams, so validation passes
			expect(result.success).toBe(true);
			expect(result.errors).toHaveLength(0);
		});
	});

	describe("checkSafety()", () => {
		it("should delegate safety checks to ContentSafetyService", () => {
			const result = contentCore.checkSafety(TEST_FILE_PATH, "create");

			// Basic check that safety check returns valid structure
			expect(result).toHaveProperty("canProceed");
			expect(result).toHaveProperty("requiresForce");
			expect(typeof result.canProceed).toBe("boolean");
			expect(typeof result.requiresForce).toBe("boolean");
		});
	});

	describe("updateContent()", () => {
		it("should fail gracefully when trying to update non-existent file", async () => {
			const updateData = {
				title: "Updated Title"
			};

			const result = await contentCore.updateContent("/non/existent/file.ts", updateData, {
				mode: "safe",
				createBackups: false
			});

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});
	});
});
