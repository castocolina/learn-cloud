/**
 * Content Safety Service Tests
 *
 * Tests for the ContentSafetyService implementation based on
 * PLAN-CONTENT-GENERATION.md Section 4.3 safety strategy.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync } from "fs";
import { join } from "path";
import { ContentSafetyService } from "$lib/services/ContentSafetyService.js";
import type { ContentStatus } from "$types";
import { TestSetup } from "../../helpers/test-setup.js";

describe("ContentSafetyService", () => {
	const testSetup = new TestSetup("services", "content-safety");
	const testDir = testSetup.getTempDir();
	const testFile = join(testDir, "test-content.ts");

	beforeEach(() => {
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("checkOperation", () => {
		describe("create operations", () => {
			it("should allow creating new files", () => {
				const result = ContentSafetyService.checkOperation("create", testFile);

				expect(result.canProceed).toBe(true);
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

				expect(result.canProceed).toBe(true);
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

				expect(result.canProceed).toBe(true);
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

				expect(result.canProceed).toBe(true);
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

				expect(result.canProceed).toBe(false);
				expect(result.error).toContain("Cannot create content with 'final' status");
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

				expect(result.canProceed).toBe(true);
				expect(result.warning).toContain("FORCE CREATE");
			});
		});

		describe("update operations", () => {
			it("should error for non-existent files", () => {
				const result = ContentSafetyService.checkOperation("update", testFile);

				expect(result.canProceed).toBe(false);
				expect(result.error).toContain("Cannot update non-existent file");
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

				expect(result.canProceed).toBe(true);
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

				expect(result.canProceed).toBe(true);
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

				expect(result.canProceed).toBe(true);
				expect(result.warning).toContain("File exists but no status found");
			});
		});

		describe("delete operations", () => {
			it("should error for non-existent files", () => {
				const result = ContentSafetyService.checkOperation("delete", testFile);

				expect(result.canProceed).toBe(false);
				expect(result.error).toContain("Cannot delete non-existent file");
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

				expect(result.canProceed).toBe(true);
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

				expect(result.canProceed).toBe(false);
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
				canProceed: true,
				requiresForce: false,
				warning: "Test warning"
			};

			// This should not throw or log in dry run mode
			expect(() => {
				ContentSafetyService.displaySafetyResult(result, { dryRun: true });
			}).not.toThrow();
		});

		it("should handle verbose mode", () => {
			const result = {
				canProceed: true,
				requiresForce: false,
				currentStatus: "scaffold" as const
			};

			// This should not throw in verbose mode
			expect(() => {
				ContentSafetyService.displaySafetyResult(result, { verbose: true });
			}).not.toThrow();
		});
	});
});
