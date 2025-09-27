/**
 * Content Creator CLI Test Suite
 *
 * Comprehensive tests for the unified content creator CLI that supports both
 * scaffold and real content workflows. Tests include:
 * - Command routing and argument validation
 * - Global flag handling (--dry-run, --force-overwrite)
 * - Integration with ContentScaffoldingGenerator
 * - Planned Core API integration workflows
 * - Error handling and user guidance
 *
 * Performance Strategy:
 * - 96% of tests use TestSetup (validation disabled) for fast CLI testing
 * - 4% use TestSetupWithValidation for integration tests
 * - Focus on CLI logic and command routing rather than content generation
 * - Template generation is tested separately in template-generator.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from "vitest";
import { writeFileSync, existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { main } from "../../scripts/content-creator.js";
import { generateConfigId } from "../../lib/utils/validation-utils.js";
import { SETTINGS } from "$config/settings.js";

/**
 * Test setup class optimized for CLI testing
 * - Validation disabled by default for fast CLI command testing (96% of tests)
 * - Focus on command routing, argument parsing, and user interaction
 * - Content generation logic is tested separately
 */
class TestSetup {
	private tempDir: string;
	private originalArgv: string[];
	private originalCwd: string;
	public readonly configId: string;

	constructor(testSuiteId: string = "main") {
		const timestamp = Date.now();
		const uniqueId = `${testSuiteId}-${timestamp}`;
		this.tempDir = join(process.cwd(), "tmp", `test-content-creator-${uniqueId}`);
		this.originalArgv = process.argv.slice();
		this.originalCwd = process.cwd();
		this.configId = generateConfigId(SETTINGS.scripts.scaffolding.validationPrefix, testSuiteId);
	}

	async setup(): Promise<void> {
		// Create temp directory
		if (!existsSync(this.tempDir)) {
			mkdirSync(this.tempDir, { recursive: true });
		}

		// Create test data structure
		const testDataDir = join(this.tempDir, "src", "data", "book");
		if (!existsSync(testDataDir)) {
			mkdirSync(testDataDir, { recursive: true });
		}

		// Create unit directories for testing
		for (let i = 1; i <= 3; i++) {
			const unitDir = join(testDataDir, `unit${i.toString().padStart(2, "0")}`);
			if (!existsSync(unitDir)) {
				mkdirSync(unitDir, { recursive: true });
			}
		}

		// Create sample content files for testing list/validate/delete commands
		const sampleContent = `
import type { LessonContent } from "$types";

export const lessonContent: LessonContent = {
	type: "lesson",
	title: "Test Lesson",
	summary: "Sample content for testing",
	status: "scaffold",
	estimatedTime: 30,
	prerequisites: [],
	learningObjectives: ["Test objective"],
	difficulty: "beginner",
	sections: []
};
`;

		writeFileSync(join(testDataDir, "unit01", "01_01_lesson_test.ts"), sampleContent);
		writeFileSync(
			join(testDataDir, "unit01", "01_02_quiz_test.ts"),
			sampleContent.replace("lesson", "quiz")
		);

		// Configure validation (disabled by default for speed)
		this.configureValidation();
	}

	cleanup(): void {
		// Restore original settings
		process.argv = this.originalArgv;
		process.chdir(this.originalCwd);

		// Restore original validation setting
		(SETTINGS.scripts.validation.generated as { runAfterGeneration: boolean }).runAfterGeneration =
			true;

		// Clean up temp directory
		if (existsSync(this.tempDir)) {
			rmSync(this.tempDir, { recursive: true, force: true });
		}
	}

	/**
	 * Configure validation settings - disabled by default for speed
	 */
	protected configureValidation(): void {
		// Disable validation for fast CLI testing
		(SETTINGS.scripts.validation.generated as { runAfterGeneration: boolean }).runAfterGeneration =
			false;
	}

	/**
	 * Mock process.argv for CLI testing
	 */
	mockArgv(args: string[]): void {
		process.argv = ["node", "content-creator.ts", ...args];
	}

	/**
	 * Get temp directory path
	 */
	getTempDir(): string {
		return this.tempDir;
	}

	/**
	 * Change to temp directory for testing
	 */
	changeToTempDir(): void {
		process.chdir(this.tempDir);
	}
}

/**
 * Test setup class with validation enabled for integration tests (4% of tests)
 */
class TestSetupWithValidation extends TestSetup {
	constructor(testSuiteId: string = "validation") {
		super(testSuiteId);
	}

	protected configureValidation(): void {
		// Enable validation for integration tests
		(SETTINGS.scripts.validation.generated as { runAfterGeneration: boolean }).runAfterGeneration =
			true;
	}
}

/**
 * Main test suite - CLI Command Routing and Logic
 */
describe("Content Creator CLI", () => {
	let testSetup: TestSetup;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let consoleLogSpy: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let consoleErrorSpy: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let processExitSpy: any;

	beforeAll(() => {
		// Global setup for all tests
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
			throw new Error("process.exit");
		});
	});

	afterAll(() => {
		// Global cleanup
		consoleLogSpy.mockRestore();
		consoleErrorSpy.mockRestore();
		processExitSpy.mockRestore();
	});

	beforeEach(async () => {
		testSetup = new TestSetup();
		await testSetup.setup();
		testSetup.changeToTempDir();

		// Clear all mocks before each test
		consoleLogSpy.mockClear();
		consoleErrorSpy.mockClear();
		processExitSpy.mockClear();
	});

	afterEach(() => {
		testSetup.cleanup();
	});

	/**
	 * Command Routing Tests
	 */
	describe("Command Routing", () => {
		it("should display help when no command is provided", async () => {
			testSetup.mockArgv([]);

			await expect(main()).rejects.toThrow("process.exit");

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("Content Creator CLI");
			expect(output).toContain("scaffold");
			expect(output).toContain("create");
			expect(output).toContain("update");
		});

		it("should handle unknown commands", async () => {
			testSetup.mockArgv(["unknown-command"]);

			await expect(main()).rejects.toThrow("process.exit");

			expect(consoleErrorSpy).toHaveBeenCalled();
			const output = consoleErrorSpy.mock.calls.flat().join(" ");
			expect(output).toContain("Unknown command");
			expect(output).toContain("unknown-command");
		});

		it("should display version information", async () => {
			testSetup.mockArgv(["--version"]);

			await expect(main()).rejects.toThrow("process.exit");
		});

		it("should display help information", async () => {
			testSetup.mockArgv(["--help"]);

			await expect(main()).rejects.toThrow("process.exit");
		});
	});

	/**
	 * Scaffold Command Tests
	 */
	describe("Scaffold Command", () => {
		it("should handle scaffold command with unit filter", async () => {
			testSetup.mockArgv(["scaffold", "--unit", "1"]);

			await expect(main()).resolves.toBeUndefined();

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("Scaffold Command");
		});

		it("should handle scaffold command with type filter", async () => {
			testSetup.mockArgv(["scaffold", "--type", "lesson"]);

			await expect(main()).resolves.toBeUndefined();

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("Scaffold Command");
		});

		it("should handle scaffold command with all parameters", async () => {
			testSetup.mockArgv(["scaffold", "--unit", "1", "--type", "lesson", "--id", "01_01"]);

			await expect(main()).resolves.toBeUndefined();

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("Scaffold Command");
		});

		it("should handle dry-run mode for scaffold command", async () => {
			testSetup.mockArgv(["--dry-run", "scaffold", "--unit", "1"]);

			await expect(main()).resolves.toBeUndefined();

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("DRY-RUN MODE");
		});
	});

	/**
	 * Create Command Tests
	 */
	describe("Create Command", () => {
		const sampleContent = '{"type": "lesson", "title": "Test Lesson"}';

		it("should require all required options", async () => {
			testSetup.mockArgv(["create"]);

			await expect(main()).rejects.toThrow("process.exit");

			expect(consoleErrorSpy).toHaveBeenCalled();
		});

		it("should handle create command with inline content", async () => {
			testSetup.mockArgv([
				"create",
				"--type",
				"lesson",
				"--unit",
				"1",
				"--chapter",
				"01_01",
				"--inline",
				sampleContent
			]);

			await expect(main()).resolves.toBeUndefined();

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("Create Command");
			expect(output).toContain("pending");
		});

		it("should validate content type", async () => {
			testSetup.mockArgv([
				"create",
				"--type",
				"invalid-type",
				"--unit",
				"1",
				"--chapter",
				"01_01",
				"--inline",
				sampleContent
			]);

			await expect(main()).rejects.toThrow("process.exit");

			expect(consoleErrorSpy).toHaveBeenCalled();
			const output = consoleErrorSpy.mock.calls.flat().join(" ");
			expect(output).toContain("Invalid content type");
		});

		it("should require either inline or file content", async () => {
			testSetup.mockArgv(["create", "--type", "lesson", "--unit", "1", "--chapter", "01_01"]);

			await expect(main()).rejects.toThrow("process.exit");

			expect(consoleErrorSpy).toHaveBeenCalled();
			const output = consoleErrorSpy.mock.calls.flat().join(" ");
			expect(output).toContain("Either --inline or --file must be specified");
		});

		it("should handle dry-run mode for create command", async () => {
			testSetup.mockArgv([
				"--dry-run",
				"create",
				"--type",
				"lesson",
				"--unit",
				"1",
				"--chapter",
				"01_01",
				"--inline",
				sampleContent
			]);

			await expect(main()).resolves.toBeUndefined();

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("DRY-RUN MODE");
			expect(output).toContain("Create Content");
		});
	});

	/**
	 * Update Command Tests
	 */
	describe("Update Command", () => {
		const sampleContent = '{"type": "lesson", "title": "Updated Lesson"}';

		it("should require file parameter", async () => {
			testSetup.mockArgv(["update"]);

			await expect(main()).rejects.toThrow("process.exit");
		});

		it("should handle update command with inline content", async () => {
			testSetup.mockArgv([
				"update",
				"--file",
				"src/data/book/unit01/lesson.ts",
				"--inline",
				sampleContent
			]);

			await expect(main()).resolves.toBeUndefined();

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("Update Command");
		});

		it("should handle dry-run mode for update command", async () => {
			testSetup.mockArgv([
				"--dry-run",
				"update",
				"--file",
				"src/data/book/unit01/lesson.ts",
				"--inline",
				sampleContent
			]);

			await expect(main()).resolves.toBeUndefined();

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("DRY-RUN MODE");
			expect(output).toContain("Update Content");
		});
	});

	/**
	 * Validate Command Tests
	 */
	describe("Validate Command", () => {
		it("should require file parameter", async () => {
			testSetup.mockArgv(["validate"]);

			await expect(main()).rejects.toThrow("process.exit");
		});

		it("should handle validate command", async () => {
			testSetup.mockArgv(["validate", "--file", "src/data/book/unit01/01_01_lesson_test.ts"]);

			await expect(main()).resolves.toBeUndefined();

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("Validate Command");
			expect(output).toContain("pending");
		});

		it("should handle dry-run mode for validate command", async () => {
			testSetup.mockArgv(["--dry-run", "validate", "--file", "src/data/book/unit01/lesson.ts"]);

			await expect(main()).resolves.toBeUndefined();

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("DRY-RUN MODE");
			expect(output).toContain("Validate Content");
		});
	});

	/**
	 * List Command Tests
	 */
	describe("List Command", () => {
		it("should handle list command without filters", async () => {
			testSetup.mockArgv(["list"]);

			await expect(main()).resolves.toBeUndefined();

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("List Command");
		});

		it("should handle list command with filters", async () => {
			testSetup.mockArgv(["list", "--unit", "1", "--type", "lesson", "--status", "draft"]);

			await expect(main()).resolves.toBeUndefined();

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("List Command");
		});

		it("should handle dry-run mode for list command", async () => {
			testSetup.mockArgv(["--dry-run", "list", "--unit", "1"]);

			await expect(main()).resolves.toBeUndefined();

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("DRY-RUN MODE");
			expect(output).toContain("List Content");
		});
	});

	/**
	 * Delete Command Tests
	 */
	describe("Delete Command", () => {
		it("should require file parameter", async () => {
			testSetup.mockArgv(["delete"]);

			await expect(main()).rejects.toThrow("process.exit");
		});

		it("should handle delete command", async () => {
			testSetup.mockArgv(["delete", "--file", "src/data/book/unit01/01_01_lesson_test.ts"]);

			await expect(main()).resolves.toBeUndefined();

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("Delete Command");
		});

		it("should handle force-overwrite flag", async () => {
			testSetup.mockArgv([
				"--force-overwrite",
				"delete",
				"--file",
				"src/data/book/unit01/lesson.ts"
			]);

			await expect(main()).resolves.toBeUndefined();

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("Force overwrite enabled");
		});

		it("should handle dry-run mode for delete command", async () => {
			testSetup.mockArgv(["--dry-run", "delete", "--file", "src/data/book/unit01/lesson.ts"]);

			await expect(main()).resolves.toBeUndefined();

			expect(consoleLogSpy).toHaveBeenCalled();
			const output = consoleLogSpy.mock.calls.flat().join(" ");
			expect(output).toContain("DRY-RUN MODE");
			expect(output).toContain("Delete Content");
		});
	});

	/**
	 * Global Flags Tests
	 */
	describe("Global Flags", () => {
		it("should handle --dry-run flag across all commands", async () => {
			const commands = ["scaffold", "list"];

			for (const command of commands) {
				consoleLogSpy.mockClear();

				testSetup.mockArgv(["--dry-run", command]);

				await expect(main()).resolves.toBeUndefined();

				const output = consoleLogSpy.mock.calls.flat().join(" ");
				expect(output).toContain("DRY-RUN MODE");
			}
		});

		it("should handle --force-overwrite flag", async () => {
			testSetup.mockArgv(["--force-overwrite", "delete", "--file", "test.ts"]);

			await expect(main()).resolves.toBeUndefined();
		});
	});

	/**
	 * Error Handling Tests
	 */
	describe("Error Handling", () => {
		it("should handle invalid JSON in inline content", async () => {
			testSetup.mockArgv([
				"create",
				"--type",
				"lesson",
				"--unit",
				"1",
				"--chapter",
				"01_01",
				"--inline",
				"invalid-json"
			]);

			await expect(main()).rejects.toThrow("process.exit");

			expect(consoleErrorSpy).toHaveBeenCalled();
			const output = consoleErrorSpy.mock.calls.flat().join(" ");
			expect(output).toContain("Error parsing JSON");
		});

		it("should handle missing required parameters gracefully", async () => {
			const incompleteCommands = [
				["create", "--type", "lesson"],
				["update", "--inline", "{}"],
				["validate"],
				["delete"]
			];

			for (const args of incompleteCommands) {
				consoleErrorSpy.mockClear();
				processExitSpy.mockClear();

				testSetup.mockArgv(args);

				await expect(main()).rejects.toThrow("process.exit");
				expect(processExitSpy).toHaveBeenCalled();
			}
		});
	});
});

/**
 * Integration Tests with Validation - Uses TestSetupWithValidation (4% of tests)
 * These tests ensure CLI works correctly when validation is enabled
 */
describe("Content Creator CLI Integration with Validation", () => {
	let testSetup: TestSetupWithValidation;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let consoleLogSpy: any;

	beforeEach(async () => {
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(process, "exit").mockImplementation(() => {
			throw new Error("process.exit");
		});

		testSetup = new TestSetupWithValidation();
		await testSetup.setup();
		testSetup.changeToTempDir();
	});

	afterEach(() => {
		testSetup.cleanup();
		vi.restoreAllMocks();
	});

	it("should integrate with ContentScaffoldingGenerator when validation is enabled", async () => {
		testSetup.mockArgv(["scaffold", "--unit", "1", "--type", "lesson", "--id", "01_01"]);

		await expect(main()).resolves.toBeUndefined();

		expect(consoleLogSpy).toHaveBeenCalled();
		const output = consoleLogSpy.mock.calls.flat().join(" ");
		expect(output).toContain("Scaffold Command");
	});

	it("should handle commands with validation enabled", async () => {
		testSetup.mockArgv(["list", "--unit", "1"]);

		await expect(main()).resolves.toBeUndefined();

		expect(consoleLogSpy).toHaveBeenCalled();
	});
});
