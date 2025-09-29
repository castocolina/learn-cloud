/**
 * Content Safety Service Tests
 *
 * Tests for the ContentSafetyService implementation based on
 * PLAN-CONTENT-GENERATION.md Section 4.3 safety strategy.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { ContentSafetyService } from "$lib/services/ContentSafetyService.js";
import type { ContentStatus } from "$types";

describe("ContentSafetyService", () => {
	const testDir = join(process.cwd(), "tmp", "script-test-safety");
	const testFile = join(testDir, "test-content.ts");

	beforeEach(() => {
		// Create test directory if it doesn't exist
		if (!existsSync(testDir)) {
			mkdirSync(testDir, { recursive: true });
		}
	});

	afterEach(() => {
		// Clean up test files
		if (existsSync(testDir)) {
			rmSync(testDir, { recursive: true, force: true });
		}
	});

	describe("checkOperation", () => {
		describe("create operations", () => {
			it("should allow creating new files", () => {
				const result = ContentSafetyService.checkOperation("create", testFile);

				expect(result.success).toBe(true);
				expect(result.action).toBe("proceed");
				expect(result.message).toBe("Creating new content file");
			});

			it("should handle existing files with expected status", () => {
				const content = `
export default {
	id: "test",
	title: "Test Content",
	status: "expected",
	type: "lesson"
};`;
				writeFileSync(testFile, content);

				const result = ContentSafetyService.checkOperation("create", testFile);

				expect(result.success).toBe(true);
				expect(result.action).toBe("proceed");
				expect(result.message).toBe("Creating expected content");
			});

			it("should handle existing files with scaffold status", () => {
				const content = `
export default {
	id: "test",
	title: "Test Content",
	status: "scaffold",
	type: "lesson"
};`;
				writeFileSync(testFile, content);

				const result = ContentSafetyService.checkOperation("create", testFile);

				expect(result.success).toBe(true);
				expect(result.action).toBe("proceed");
				expect(result.message).toBe("Creating scaffold content");
			});

			it("should warn for draft status content", () => {
				const content = `
export default {
	id: "test",
	title: "Test Content",
	status: "draft",
	type: "lesson"
};`;
				writeFileSync(testFile, content);

				const result = ContentSafetyService.checkOperation("create", testFile);

				expect(result.success).toBe(true);
				expect(result.action).toBe("warn_and_proceed");
				expect(result.warning).toContain("Creating content with 'draft' status");
			});

			it("should block final status content without force flag", () => {
				const content = `
export default {
	id: "test",
	title: "Test Content",
	status: "final",
	type: "lesson"
};`;
				writeFileSync(testFile, content);

				const result = ContentSafetyService.checkOperation("create", testFile);

				expect(result.success).toBe(false);
				expect(result.action).toBe("error");
				expect(result.message).toContain("Cannot create content with 'final' status");
				expect(result.requiresForce).toBe(true);
			});

			it("should allow final status content with force flag", () => {
				const content = `
export default {
	id: "test",
	title: "Test Content",
	status: "final",
	type: "lesson"
};`;
				writeFileSync(testFile, content);

				const result = ContentSafetyService.checkOperation("create", testFile, {
					forceOverwrite: true
				});

				expect(result.success).toBe(true);
				expect(result.action).toBe("warn_and_proceed");
				expect(result.warning).toContain("FORCE CREATE");
			});
		});

		describe("update operations", () => {
			it("should error for non-existent files", () => {
				const result = ContentSafetyService.checkOperation("update", testFile);

				expect(result.success).toBe(false);
				expect(result.action).toBe("error");
				expect(result.message).toContain("Cannot update non-existent file");
			});

			it("should allow updating expected content", () => {
				const content = `
export default {
	id: "test",
	title: "Test Content",
	status: "expected",
	type: "lesson"
};`;
				writeFileSync(testFile, content);

				const result = ContentSafetyService.checkOperation("update", testFile);

				expect(result.success).toBe(true);
				expect(result.action).toBe("proceed");
				expect(result.message).toBe("Updating expected content");
			});

			it("should warn for orphan content", () => {
				const content = `
export default {
	id: "test",
	title: "Test Content",
	status: "orphan",
	type: "lesson"
};`;
				writeFileSync(testFile, content);

				const result = ContentSafetyService.checkOperation("update", testFile);

				expect(result.success).toBe(true);
				expect(result.action).toBe("warn_and_proceed");
				expect(result.warning).toContain("Updating orphan content");
			});

			it("should warn for files without status", () => {
				const content = `
export default {
	id: "test",
	title: "Test Content",
	type: "lesson"
};`;
				writeFileSync(testFile, content);

				const result = ContentSafetyService.checkOperation("update", testFile);

				expect(result.success).toBe(true);
				expect(result.action).toBe("warn_and_proceed");
				expect(result.warning).toContain("File exists but no status found");
			});
		});

		describe("delete operations", () => {
			it("should error for non-existent files", () => {
				const result = ContentSafetyService.checkOperation("delete", testFile);

				expect(result.success).toBe(false);
				expect(result.action).toBe("error");
				expect(result.message).toContain("Cannot delete non-existent file");
			});

			it("should allow deleting scaffold content", () => {
				const content = `
export default {
	id: "test",
	title: "Test Content",
	status: "scaffold",
	type: "lesson"
};`;
				writeFileSync(testFile, content);

				const result = ContentSafetyService.checkOperation("delete", testFile);

				expect(result.success).toBe(true);
				expect(result.action).toBe("proceed");
				expect(result.message).toBe("Deleting scaffold content");
			});

			it("should block final content deletion without force", () => {
				const content = `
export default {
	id: "test",
	title: "Test Content",
	status: "final",
	type: "lesson"
};`;
				writeFileSync(testFile, content);

				const result = ContentSafetyService.checkOperation("delete", testFile);

				expect(result.success).toBe(false);
				expect(result.action).toBe("error");
				expect(result.requiresForce).toBe(true);
			});
		});
	});

	describe("getStatusEmoji", () => {
		it("should return correct emojis for all statuses", () => {
			expect(ContentSafetyService.getStatusEmoji("expected")).toBe("⏳");
			expect(ContentSafetyService.getStatusEmoji("scaffold")).toBe("🚧");
			expect(ContentSafetyService.getStatusEmoji("draft")).toBe("📝");
			expect(ContentSafetyService.getStatusEmoji("review")).toBe("🔍");
			expect(ContentSafetyService.getStatusEmoji("final")).toBe("✅");
			expect(ContentSafetyService.getStatusEmoji("orphan")).toBe("🔶");
		});

		it("should return unknown emoji for invalid status", () => {
			expect(ContentSafetyService.getStatusEmoji("invalid" as ContentStatus)).toBe("❓");
		});
	});

	describe("getStatusDisplay", () => {
		it("should combine emoji and status text", () => {
			expect(ContentSafetyService.getStatusDisplay("final")).toBe("✅ final");
			expect(ContentSafetyService.getStatusDisplay("draft")).toBe("📝 draft");
		});
	});

	describe("displaySafetyResult", () => {
		it("should handle dry run mode", () => {
			const result = {
				success: true,
				action: "warn_and_proceed" as const,
				warning: "Test warning"
			};

			// This should not throw or log in dry run mode
			expect(() => {
				ContentSafetyService.displaySafetyResult(result, { dryRun: true });
			}).not.toThrow();
		});

		it("should handle verbose mode", () => {
			const result = {
				success: true,
				action: "proceed" as const,
				message: "Test message"
			};

			// This should not throw in verbose mode
			expect(() => {
				ContentSafetyService.displaySafetyResult(result, { verbose: true });
			}).not.toThrow();
		});
	});
});
