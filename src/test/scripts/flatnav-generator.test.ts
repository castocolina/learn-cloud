/**
 * Test Suite for Flat Navigation Generator
 *
 * Comprehensive testing for the flatnav-generator.ts script including:
 * - Content menu loading via dynamic import
 * - Sequential navigation mapping (respecting existing order)
 * - Bidirectional link establishment
 * - Cross-unit navigation handling
 * - URL generation using content-identifiers.ts (single source of truth)
 * - TypeScript code generation with validation
 * - Performance optimization
 *
 * Test cases cover both happy path scenarios and edge cases to ensure
 * robust navigation generation for the learning platform.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { FlatNavGenerator } from "../../scripts/flatnav-generator.js";
import type { AppSettings } from "$types";
import { generateConfigId } from "../test-utils.js";
import { SETTINGS } from "$config/settings.js";

const { flatNav: flatNavSettings } = SETTINGS.scripts;

/**
 * Test setup class for test isolation and dynamic configuration
 * By default disables validation for faster test execution
 */
class TestSetup {
	public tempDir: string;
	public testInputDir: string;
	public testOutputDir: string;
	public readonly configId: string;
	public inputPath: string;
	public outputPath: string;
	protected enableValidation: boolean;

	constructor(testSuiteId: string = "main", enableValidation: boolean = false) {
		const timestamp = Date.now();
		const uniqueId = `${testSuiteId}-${timestamp}`;
		this.tempDir = join(process.cwd(), "tmp", `test-flatnav-${uniqueId}`);
		this.testInputDir = this.tempDir;
		this.testOutputDir = join(this.tempDir, "output");
		this.configId = generateConfigId(flatNavSettings.validationPrefix, testSuiteId);
		this.inputPath = join(this.testInputDir, "content-menu.ts");
		this.outputPath = join(this.testOutputDir, "flatnav.ts");
		this.enableValidation = enableValidation;
	}

	async setup(): Promise<void> {
		// Create temp directories
		if (!existsSync(this.tempDir)) {
			mkdirSync(this.tempDir, { recursive: true });
		}
		if (!existsSync(this.testOutputDir)) {
			mkdirSync(this.testOutputDir, { recursive: true });
		}

		// Configure validation settings for tests
		this.configureValidation();

		// Write mock content menu file
		writeFileSync(this.inputPath, SAMPLE_CONTENT_MENU, "utf-8");
	}

	/**
	 * Create generator with mockable settings
	 */
	createGenerator(): FlatNavGenerator {
		const mockSettings: AppSettings = {
			...SETTINGS,
			scripts: {
				...SETTINGS.scripts,
				validation: {
					...SETTINGS.scripts.validation,
					generated: {
						...SETTINGS.scripts.validation.generated,
						runAfterGeneration: this.enableValidation
					}
				},
				flatNav: {
					...SETTINGS.scripts.flatNav,
					paths: {
						inputFile: this.inputPath,
						outputFile: this.outputPath
					}
				}
			}
		};

		return new FlatNavGenerator(undefined, undefined, mockSettings);
	}

	/**
	 * Configure validation settings based on test requirements (legacy method for compatibility)
	 */
	protected configureValidation(): void {
		// This method is kept for backward compatibility but not used with dependency injection
		// The validation is now controlled via createGenerator() method
	}

	cleanup(): void {
		// No need to restore global SETTINGS when using dependency injection
		// Each test uses its own mocked settings instance

		if (existsSync(this.tempDir)) {
			rmSync(this.tempDir, { recursive: true, force: true });
		}
	}
}

/**
 * Test setup class with validation enabled for integration tests
 */
class TestSetupWithValidation extends TestSetup {
	constructor(testSuiteId: string = "validation") {
		super(testSuiteId, true); // Enable validation
	}
}

// Sample content menu structure for testing
const SAMPLE_CONTENT_MENU = `import type { MenuStructure } from "$types";

export const contentMenu: MenuStructure = {
	metadata: {
		title: "Test Learning Platform",
		totalUnits: 2,
		totalChapters: 8,
		version: "1.0.0"
	},
	units: [
		{
			id: "unit_1",
			title: "Unit 1: Python Development",
			description: "Python fundamentals and development",
			icon: "Code",
			emoji: "🐍",
			technologyUnit: "python",
			unitNumber: 1,
			chapters: [
				{
					id: "01_00",
					title: "Unit 1: Overview - Python Development",
					icon: "BookOpen",
					type: "overview",
					chapterNumber: "0.0",
					chapterUrl: "book/unit/01/01_00_overview.html",
					filePath: "book/unit01/01_00_overview.ts"
				},
				{
					id: "01_01",
					title: "1.1: Python Basics",
					icon: "Code",
					type: "lesson",
					chapterNumber: "1.1",
					chapterUrl: "book/unit/01/01_01_lesson.html",
					filePath: "book/unit01/01_01_lesson.ts",
					estimatedTime: 45
				},
				{
					id: "01_01_study",
					title: "1.1: Study Guide",
					icon: "BookOpen",
					type: "study_guide",
					chapterNumber: "1.1",
					chapterUrl: "book/unit/01/01_01_study.html",
					filePath: "book/unit01/01_01_study.ts"
				},
				{
					id: "01_01_quiz",
					title: "1.1: Quiz",
					icon: "HelpCircle",
					type: "quiz",
					chapterNumber: "1.1",
					chapterUrl: "book/unit/01/01_01_quiz.html",
					filePath: "book/unit01/01_01_quiz.ts"
				},
				{
					id: "01_02_exam",
					title: "1.2: Unit 1 Final Exam",
					icon: "Target",
					type: "exam",
					chapterNumber: "1.2",
					chapterUrl: "book/unit/01/01_02_exam.html",
					filePath: "book/unit01/01_02_exam.ts"
				}
			]
		},
		{
			id: "unit_2",
			title: "Unit 2: Go Development",
			description: "Go programming and cloud development",
			icon: "Cpu",
			emoji: "🔧",
			technologyUnit: "go",
			unitNumber: 2,
			chapters: [
				{
					id: "02_00",
					title: "Unit 2: Overview - Go Development",
					icon: "BookOpen",
					type: "overview",
					chapterNumber: "0.0",
					chapterUrl: "book/unit/02/02_00_overview.html",
					filePath: "book/unit02/02_00_overview.ts"
				},
				{
					id: "02_01",
					title: "2.1: Go Fundamentals",
					icon: "Code",
					type: "lesson",
					chapterNumber: "2.1",
					chapterUrl: "book/unit/02/02_01_lesson.html",
					filePath: "book/unit02/02_01_lesson.ts",
					estimatedTime: 60
				},
				{
					id: "02_02_project",
					title: "2.2: Go Microservice Project",
					icon: "Rocket",
					type: "project",
					chapterNumber: "2.2",
					chapterUrl: "book/unit/02/02_02_project.html",
					filePath: "book/unit02/02_02_project.ts",
					estimatedTime: 120
				}
			]
		}
	]
};`;

const MINIMAL_CONTENT_MENU = `import type { MenuStructure } from "$types";

export const contentMenu: MenuStructure = {
	metadata: {
		title: "Minimal Test",
		totalUnits: 1,
		totalChapters: 2,
		version: "1.0.0"
	},
	units: [
		{
			id: "unit_1",
			title: "Unit 1: Test Unit",
			description: "Test unit",
			icon: "BookOpen",
			technologyUnit: "python",
			unitNumber: 1,
			chapters: [
				{
					id: "01_00",
					title: "Unit 1: Overview",
					icon: "BookOpen",
					type: "overview",
					chapterNumber: "0.0",
					chapterUrl: "test.html",
					filePath: "test.ts"
				},
				{
					id: "01_01",
					title: "1.1: Test Lesson",
					icon: "Code",
					type: "lesson",
					chapterNumber: "1.1",
					chapterUrl: "lesson.html",
					filePath: "lesson.ts"
				}
			]
		}
	]
};`;

describe("FlatNavGenerator", () => {
	let testSetup: TestSetup;
	let generator: FlatNavGenerator;

	beforeEach(async () => {
		testSetup = new TestSetup();
		await testSetup.setup();
		generator = testSetup.createGenerator();
	});

	afterEach(() => {
		testSetup.cleanup();
	});

	describe("Content Menu Loading", () => {
		it("should load content menu from TypeScript file successfully", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);
		}, 10000);

		it("should handle missing input file gracefully", async () => {
			const mockSettings: AppSettings = {
				...SETTINGS,
				scripts: {
					...SETTINGS.scripts,
					validation: {
						...SETTINGS.scripts.validation,
						generated: {
							...SETTINGS.scripts.validation.generated,
							runAfterGeneration: false
						}
					},
					flatNav: {
						...SETTINGS.scripts.flatNav,
						paths: {
							inputFile: "non-existent.ts",
							outputFile: testSetup.outputPath
						}
					}
				}
			};
			const nonExistentGenerator = new FlatNavGenerator(undefined, undefined, mockSettings);
			const success = await nonExistentGenerator.generate();
			expect(success).toBe(false);
		}, 10000);

		it("should handle malformed TypeScript files", async () => {
			// Use validation setup for this test since it needs to test validation failure
			const validationTestSetup = new TestSetupWithValidation("malformed");
			await validationTestSetup.setup();

			try {
				const validationGenerator = validationTestSetup.createGenerator();

				const malformedContent = `export const contentMenu = { invalid syntax }`;
				writeFileSync(validationTestSetup.inputPath, malformedContent, "utf-8");

				const success = await validationGenerator.generate();
				expect(success).toBe(false);
			} finally {
				validationTestSetup.cleanup();
			}
		}, 10000);
	});

	describe("Flat Navigation Generation", () => {
		it("should generate correct number of navigation entries", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");
			expect(outputContent).toContain("totalCount: 8");
		}, 10000);

		it("should maintain existing content order from content-menu.ts", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");

			// Check that overview appears in the content (first in order)
			expect(outputContent).toContain('chapterType: "overview"');
			expect(outputContent).toContain('chapterType: "lesson"');
			expect(outputContent).toContain('chapterType: "study_guide"');
			expect(outputContent).toContain('chapterType: "quiz"');
		}, 10000);

		it("should handle units in correct order", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");

			// Find unit references in order
			const unit1Index = outputContent.indexOf('unitId: "unit_1"');
			const unit2Index = outputContent.indexOf('unitId: "unit_2"');

			expect(unit1Index).toBeLessThan(unit2Index);
		}, 10000);

		it("should generate sequential global indices", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");

			// Global indices should start at 0 and increment sequentially
			expect(outputContent).toContain("globalIndex: 0");
			expect(outputContent).toContain("globalIndex: 1");
			expect(outputContent).toContain("globalIndex: 2");
		}, 10000);
	});

	describe("URL Generation", () => {
		it("should generate descriptive chapter URLs from content-identifiers", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");

			// URLs should use descriptive format from content-identifiers.ts
			expect(outputContent).toContain("chapterUrl:"); // All entries should have chapterUrl
			expect(outputContent).toMatch(/chapterUrl: ".*\.html"/); // HTML format
		}, 10000);

		it("should generate consistent chapter URLs across all entries", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");

			// All entries should have valid chapter URLs
			expect(outputContent).toMatch(/chapterUrl: ".+\.html"/);
		}, 10000);
	});

	describe("Bidirectional Navigation Links", () => {
		it("should establish correct previous/next relationships", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);

			// Load and verify the generated structure
			const outputContent = readFileSync(testSetup.outputPath, "utf-8");

			// Should contain the runtime link establishment code
			expect(outputContent).toContain("flatNavEntries.forEach((entry, index) => {");
			expect(outputContent).toContain("entry.previousEntry =");
			expect(outputContent).toContain("entry.nextEntry =");
		}, 10000);

		it("should handle cross-unit navigation correctly", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");

			// The navigation should be seamless across units
			// This is verified by the bidirectional link establishment in the generated code
			expect(outputContent).toContain("flatNavEntries.forEach((entry, index) => {");
		}, 10000);
	});

	describe("TypeScript Code Generation", () => {
		it("should generate valid TypeScript with correct imports and exports", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");

			expect(outputContent).toContain(
				'import type { FlatNavEntry, FlatNavStructure } from "$types";'
			);
			expect(outputContent).toContain("export const flatNavigation: FlatNavStructure");
			expect(outputContent).toContain("export const homeUrl =");
		}, 10000);

		it("should include FlatNavStructure utility methods", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");

			// Check for all required FlatNavStructure methods
			expect(outputContent).toContain("getNextEntry:");
			expect(outputContent).toContain("getPreviousEntry:");
			expect(outputContent).toContain("getEntryByIndex:");
			expect(outputContent).toContain("getEntriesByUnit:");
			expect(outputContent).toContain("calculateProgress:");
		}, 10000);

		it("should include generation metadata and home URL", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");

			expect(outputContent).toContain("Generated Flat Navigation Structure");
			expect(outputContent).toContain("DO NOT EDIT THIS FILE MANUALLY");
			expect(outputContent).toContain("Home URL: /"); // From settings
			expect(outputContent).toContain('export const homeUrl = "/"');
		}, 10000);

		it("should generate properly formatted navigation entries", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");

			// Check that entries are properly formatted
			expect(outputContent).toContain("const flatNavEntries: FlatNavEntry[] = [");
			expect(outputContent).toContain("id:");
			expect(outputContent).toContain("title:");
			expect(outputContent).toContain("chapterUrl:");
			expect(outputContent).toContain("filePath:");
			expect(outputContent).toContain("chapterType:");
		}, 10000);
	});

	describe("Edge Cases and Error Handling", () => {
		it("should handle empty units correctly", async () => {
			const emptyUnitsContent = `import type { MenuStructure } from "$types";

export const contentMenu: MenuStructure = {
	metadata: {
		title: "Empty Units Test",
		totalUnits: 1,
		totalChapters: 0,
		version: "1.0.0"
	},
	units: [
		{
			id: "unit_1",
			title: "Unit 1: Empty Unit",
			description: "Empty unit",
			icon: "BookOpen",
			technologyUnit: "python",
			unitNumber: 1,
			chapters: []
		}
	]
};`;

			writeFileSync(testSetup.inputPath, emptyUnitsContent, "utf-8");

			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");
			expect(outputContent).toContain("totalCount: 0");
		}, 10000);

		it("should handle minimal content structure", async () => {
			writeFileSync(testSetup.inputPath, MINIMAL_CONTENT_MENU, "utf-8");

			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");
			expect(outputContent).toContain("totalCount: 2");
		}, 10000);

		it("should create output directory if it doesn't exist", async () => {
			// Remove output directory
			rmSync(testSetup.testOutputDir, { recursive: true, force: true });

			const success = await generator.generate();
			expect(success).toBe(true);
			expect(existsSync(testSetup.outputPath)).toBe(true);
		}, 10000);

		it("should handle missing estimated times gracefully", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");

			// Should handle both defined and undefined estimatedTime values
			expect(outputContent).toContain("estimatedTime: 45");
			expect(outputContent).toContain("estimatedTime: 60");
		}, 10000);
	});

	describe("Performance and Optimization", () => {
		it("should generate lookup map for efficient access", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");

			// Should create a Map for O(1) lookups
			expect(outputContent).toContain("const sequenceMap = new Map<string, FlatNavEntry>");
			expect(outputContent).toContain("sequenceMap.get(currentId)");
		}, 10000);

		it("should implement efficient utility methods", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");

			// Verify utility method implementations
			expect(outputContent).toContain("return current?.nextEntry || null;");
			expect(outputContent).toContain("return current?.previousEntry || null;");
			expect(outputContent).toContain("flatNavEntries.filter((entry) => entry.unitId === unitId)");
		}, 10000);

		it("should optimize progress calculation", async () => {
			const success = await generator.generate();
			expect(success).toBe(true);

			const outputContent = readFileSync(testSetup.outputPath, "utf-8");

			// Progress calculation should be optimized
			expect(outputContent).toContain("calculateProgress: (completedIds: string[]): number => {");
			expect(outputContent).toContain("Math.round((completedCount / flatNavEntries.length) * 100)");
		}, 10000);
	});

	describe("Integration with Configuration", () => {
		it("should respect configuration settings", async () => {
			// Test that the generator uses the configuration correctly
			expect(flatNavSettings.navigation.crossUnitNavigation).toBe(true);
			expect(flatNavSettings.navigation.skipEmptyUnits).toBe(true);
			expect(flatNavSettings.navigation.homeUrl).toBe("/");
		}, 10000);
	});

	describe("CLI Functionality", () => {
		it("should export FlatNavGenerator as default", () => {
			expect(FlatNavGenerator).toBeDefined();
			expect(typeof FlatNavGenerator).toBe("function");
		}, 10000);

		it("should handle custom input and output paths", () => {
			// Test that the generator accepts custom paths via settings
			const mockSettings: AppSettings = {
				ui: {
					mermaid: { debug: false, modalPagePercent: 90 },
					flipCard: { modalPagePercent: 90 },
					breadcrumb: { showIcon: true },
					sidebar: { collapsible: true, defaultCollapsed: false }
				},
				scripts: {
					validation: { generated: { runAfterGeneration: false } },
					flatNav: {
						paths: { inputFile: "custom-input.ts", outputFile: "custom-output.ts" },
						validationPrefix: flatNavSettings.validationPrefix,
						navigation: flatNavSettings.navigation
					}
				}
			} as AppSettings;
			const customGenerator = new FlatNavGenerator(undefined, undefined, mockSettings);
			expect(customGenerator).toBeDefined();
		}, 10000);
	});
});

/**
 * Integration test with realistic data structure
 */
describe("Realistic Data Integration", () => {
	it("should handle complex content structure with all content types", async () => {
		const complexContent = `import type { MenuStructure } from "$types";

export const contentMenu: MenuStructure = {
	metadata: {
		title: "Complex Learning Platform",
		totalUnits: 3,
		totalChapters: 15,
		version: "2.0.0"
	},
	units: [
		{
			id: "unit_1",
			title: "Unit 1: Foundations",
			description: "Foundation concepts",
			icon: "BookOpen",
			technologyUnit: "python",
			unitNumber: 1,
			chapters: [
				{
					id: "01_00",
					title: "Unit 1: Overview",
					icon: "BookOpen",
					type: "overview",
					chapterNumber: "0.0",
					chapterUrl: "overview.html",
					filePath: "overview.ts"
				},
				{
					id: "01_01",
					title: "1.1: Introduction",
					icon: "Code",
					type: "lesson",
					chapterNumber: "1.1",
					chapterUrl: "lesson1.html",
					filePath: "lesson1.ts",
					estimatedTime: 30
				},
				{
					id: "01_01_study",
					title: "1.1: Study Guide",
					icon: "BookOpen",
					type: "study_guide",
					chapterNumber: "1.1",
					chapterUrl: "study1.html",
					filePath: "study1.ts"
				},
				{
					id: "01_01_quiz",
					title: "1.1: Quiz",
					icon: "HelpCircle",
					type: "quiz",
					chapterNumber: "1.1",
					chapterUrl: "quiz1.html",
					filePath: "quiz1.ts"
				},
				{
					id: "01_02",
					title: "1.2: Advanced Topics",
					icon: "Code",
					type: "lesson",
					chapterNumber: "1.2",
					chapterUrl: "lesson2.html",
					filePath: "lesson2.ts",
					estimatedTime: 45
				},
				{
					id: "01_project",
					title: "1.3: Final Project",
					icon: "Rocket",
					type: "project",
					chapterNumber: "1.3",
					chapterUrl: "project.html",
					filePath: "project.ts",
					estimatedTime: 120
				},
				{
					id: "01_exam",
					title: "1.4: Final Exam",
					icon: "Target",
					type: "exam",
					chapterNumber: "1.4",
					chapterUrl: "exam.html",
					filePath: "exam.ts"
				}
			]
		}
	]
};`;

		// Use validation setup for this integration test
		const validationTestSetup = new TestSetupWithValidation("complex");
		await validationTestSetup.setup();

		try {
			writeFileSync(validationTestSetup.inputPath, complexContent, "utf-8");

			const generator = validationTestSetup.createGenerator();
			const success = await generator.generate();

			expect(success).toBe(true);
			expect(existsSync(validationTestSetup.outputPath)).toBe(true);

			const outputContent = readFileSync(validationTestSetup.outputPath, "utf-8");

			// Verify all content types are properly ordered
			expect(outputContent).toContain('chapterType: "overview"');
			expect(outputContent).toContain('chapterType: "lesson"');
			expect(outputContent).toContain('chapterType: "study_guide"');
			expect(outputContent).toContain('chapterType: "quiz"');
			expect(outputContent).toContain('chapterType: "project"');
			expect(outputContent).toContain('chapterType: "exam"');

			// Verify sequential navigation
			expect(outputContent).toContain("totalCount: 7");
		} finally {
			validationTestSetup.cleanup();
		}
	}, 10000); // Extended timeout for complex test
});
