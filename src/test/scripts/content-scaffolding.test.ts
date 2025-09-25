/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Comprehensive Test Suite for Content Scaffolding Generator
 *
 * Tests the TypeScript content scaffolding script functionality including:
 * - CLI argument parsing and validation
 * - File path generation
 * - Content generation for all types
 * - AST-based TypeScript generation
 * - Configuration integration
 * - Error handling
 *
 * Uses Vitest for testing framework and validates generated content
 * against project TypeScript interfaces and standards.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
	parseCliArguments,
	generateFilePath,
	getContentGenerator
} from "../../scripts/content-scaffolding.js";
import { SETTINGS } from "$config/settings.js";

// Mock process.argv for CLI testing
const originalArgv = process.argv;
const _originalExit = process.exit;

describe("Content Scaffolding Generator", () => {
	beforeEach(() => {
		// Mock process.exit to prevent test termination
		vi.spyOn(process, "exit").mockImplementation(() => {
			throw new Error("process.exit");
		});
	});

	afterEach(() => {
		// Restore original functions
		process.argv = originalArgv;
		vi.restoreAllMocks();
	});

	describe("CLI Argument Parsing", () => {
		it("should parse valid arguments with string-based unit correctly", async () => {
			process.argv = ["node", "script.js", "--unit=python", "--type=lesson", "--id=1-1"];

			const args = await parseCliArguments();

			expect(args).toEqual({
				unit: "1", // Converted to unit number string
				type: "lesson",
				id: "01_01" // ID normalized to standard format
			});
		});

		it("should parse valid arguments with numeric unit correctly", async () => {
			process.argv = ["node", "script.js", "--unit=1", "--type=lesson", "--id=1-1"];

			const args = await parseCliArguments();

			expect(args).toEqual({
				unit: "1",
				type: "lesson",
				id: "01_01" // ID normalized to standard format
			});
		});

		it("should handle short argument flags", async () => {
			process.argv = ["node", "script.js", "-u", "go", "-t", "quiz", "-i", "2-3"];

			const args = await parseCliArguments();

			expect(args).toEqual({
				unit: "2", // Converted to unit number string
				type: "quiz",
				id: "02_03" // ID normalized to standard format
			});
		});

		it("should exit with help when --help flag is provided", async () => {
			process.argv = ["node", "script.js", "--help"];
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			await expect(() => parseCliArguments()).rejects.toThrow("process.exit");
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("Content Scaffolding Generator")
			);
		});

		it("should exit with error when no arguments are provided", async () => {
			process.argv = ["node", "script.js"];
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			await expect(() => parseCliArguments()).rejects.toThrow("process.exit");
			expect(consoleErrorSpy).toHaveBeenCalledWith("❌ ERROR: Missing required arguments");
		});

		it("should trigger flexible batch generation when only valid unit is provided", async () => {
			process.argv = ["node", "script.js", "--unit=1"];
			const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			await expect(() => parseCliArguments()).rejects.toThrow("process.exit");
			expect(consoleLogSpy).toHaveBeenCalledWith(
				expect.stringContaining("🔄 Content Scaffolding Generator - Flexible Batch Mode")
			);
		}, 10000);

		it("should exit with error for invalid unit", async () => {
			process.argv = ["node", "script.js", "--unit=invalid", "--type=lesson", "--id=1"];
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			await expect(() => parseCliArguments()).rejects.toThrow("process.exit");
			expect(consoleErrorSpy).toHaveBeenCalledWith('❌ ERROR: Unit "invalid" not found');
		});

		it("should exit with error for invalid content type", async () => {
			process.argv = ["node", "script.js", "--unit=1", "--type=invalid", "--id=1"];
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			await expect(() => parseCliArguments()).rejects.toThrow("process.exit");
			expect(consoleErrorSpy).toHaveBeenCalledWith('❌ ERROR: Invalid content type "invalid"');
		});

		it("should accept all valid content types", async () => {
			const validTypes = ["overview", "lesson", "study_guide", "quiz", "exam", "project"];

			for (const type of validTypes) {
				process.argv = ["node", "script.js", "--unit=1", `--type=${type}`, "--id=test-id"];

				const args = await parseCliArguments();
				expect(args.type).toBe(type);
				expect(args.unit).toBe("1");
				expect(args.id).toBe("01_01"); // ID should be normalized from "test-id"
			}
		});

		it("should normalize various ID formats to consistent format", async () => {
			const idTestCases = [
				{ input: "1", expected: "01_01" },
				{ input: "1.1", expected: "01_01" },
				{ input: "1.10", expected: "01_10" },
				{ input: "2.3", expected: "02_03" },
				{ input: "01_01", expected: "01_01" },
				{ input: "1-1", expected: "01_01" }
			];

			for (const testCase of idTestCases) {
				process.argv = ["node", "script.js", "--unit=1", "--type=lesson", `--id=${testCase.input}`];

				const args = await parseCliArguments();
				expect(args.id).toBe(testCase.expected);
				expect(args.unit).toBe("1");
				expect(args.type).toBe("lesson");
			}
		});

		it("should handle ambiguous unit identifiers", async () => {
			process.argv = ["node", "script.js", "--unit=microservices", "--type=lesson", "--id=1"];
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			await expect(() => parseCliArguments()).rejects.toThrow("process.exit");
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Error: Ambiguous unit identifier "microservices"'
			);
		});
	});

	describe("File Path Generation", () => {
		it("should generate correct path for lesson content with normalized ID", () => {
			const args = { unit: "1", type: "lesson" as const, id: "01_01" };
			const path = generateFilePath(args);

			// Updated to match unified navigation paths
			expect(path).toBe("src/data/book/unit01/01_01_lesson_lesson_1.ts");
		});

		it("should generate correct path for quiz content with normalized ID", () => {
			const args = { unit: "2", type: "quiz" as const, id: "02_03" };
			const path = generateFilePath(args);

			// Updated to match unified navigation paths
			expect(path).toBe("src/data/book/unit02/02_03_quiz_quiz_2.ts");
		});

		it("should generate correct path for exam content with normalized ID", () => {
			const args = { unit: "3", type: "exam" as const, id: "03_05" };
			const path = generateFilePath(args);

			// Updated to match unified navigation paths (exam uses special 99 numbering)
			expect(path).toBe("src/data/book/unit03/03_99_exam_final_exam.ts");
		});

		it("should generate correct path for study guide content with normalized ID", () => {
			const args = { unit: "4", type: "study_guide" as const, id: "03_02" };
			const path = generateFilePath(args);

			// Updated to match unified navigation paths
			expect(path).toBe("src/data/book/unit04/04_02_study_guide_study_guide_4.ts");
		});

		it("should generate correct path for project content with normalized ID", () => {
			const args = { unit: "5", type: "project" as const, id: "05_10" };
			const path = generateFilePath(args);

			// Updated to match unified navigation paths
			expect(path).toBe("src/data/book/unit05/05_10_project_project_5.ts");
		});

		it("should generate correct path for overview content", () => {
			const args = { unit: "6", type: "overview" as const, id: "intro" };
			const path = generateFilePath(args);

			// Should now use unified navigation paths for consistency
			expect(path).toContain("src/data/book/unit06/06_00_overview");
			expect(path).toContain(".ts");
		});
	});

	describe("Content Generators", () => {
		it("should return lesson generator for lesson type", () => {
			const generator = getContentGenerator("lesson");
			expect(generator).toBeDefined();

			const args = { unit: "test", type: "lesson" as const, id: "1-1" };
			const content = generator(args);

			expect((content as any).type).toBe("lesson");
			expect((content as any).title).toContain("Cloud-Native test Development");
			expect((content as any).status).toBe("scaffold");
			expect((content as any).sections).toHaveLength(SETTINGS.scripts.scaffolding.lessons.sections);
		});

		it("should return quiz generator for quiz type", () => {
			const generator = getContentGenerator("quiz");
			expect(generator).toBeDefined();

			const args = { unit: "test", type: "quiz" as const, id: "1-1" };
			const content = generator(args);

			expect((content as any).type).toBe("quiz");
			expect((content as any).quiz.questions).toHaveLength(
				SETTINGS.scripts.scaffolding.quizzes.questions
			);
		});

		it("should return exam generator for exam type", () => {
			const generator = getContentGenerator("exam");
			expect(generator).toBeDefined();

			const args = { unit: "test", type: "exam" as const, id: "final" };
			const content = generator(args);

			expect((content as any).type).toBe("exam");
			expect((content as any).exam.questions).toHaveLength(
				SETTINGS.scripts.scaffolding.exams.questions
			);
		});

		it("should return study guide generator for study_guide type", () => {
			const generator = getContentGenerator("study_guide");
			expect(generator).toBeDefined();

			const args = { unit: "test", type: "study_guide" as const, id: "1-1" };
			const content = generator(args);

			expect((content as any).type).toBe("study_guide");
			expect((content as any).studyGuide.flashcards).toHaveLength(
				SETTINGS.scripts.scaffolding.studyGuides.flashcards
			);
		});

		it("should return project generator for project type", () => {
			const generator = getContentGenerator("project");
			expect(generator).toBeDefined();

			const args = { unit: "test", type: "project" as const, id: "capstone" };
			const content = generator(args);

			expect((content as any).type).toBe("project");
			expect((content as any).sections).toHaveLength(
				SETTINGS.scripts.scaffolding.projects.sections
			);
			expect((content as any).requirements).toHaveLength(
				SETTINGS.scripts.scaffolding.projects.requirements
			);
			expect((content as any).deliverables).toHaveLength(
				SETTINGS.scripts.scaffolding.projects.deliverables
			);
		});

		it("should default to lesson generator for unknown type", () => {
			const generator = getContentGenerator("unknown" as unknown as never);
			expect(generator).toBeDefined();

			const args = { unit: "test", type: "unknown" as unknown as never, id: "1-1" };
			const content = generator(args);

			expect((content as any).type).toBe("lesson");
		});
	});

	describe("Content Structure Validation", () => {
		describe("Lesson Content", () => {
			it("should generate lesson with minimum required sections", () => {
				const generator = getContentGenerator("lesson");
				const args = { unit: "test", type: "lesson" as const, id: "1-1" };
				const content = generator(args);

				expect((content as any).sections).toHaveLength(
					SETTINGS.scripts.scaffolding.lessons.sections
				);

				// Check that at least one section has code and diagram blocks
				const hasCodeBlock = (content as any).sections.some((section: any) =>
					(section as any).content.some((block: any) => block.type === "code")
				);
				const hasDiagram = (content as any).sections.some((section: any) =>
					(section as any).content.some((block: any) => block.type === "diagram")
				);

				expect(hasCodeBlock).toBe(true);
				expect(hasDiagram).toBe(true);
			});

			it("should include required fields for lesson content", () => {
				const generator = getContentGenerator("lesson");
				const args = { unit: "test", type: "lesson" as const, id: "1-1" };
				const content = generator(args);

				expect(content).toHaveProperty("type", "lesson");
				expect(content).toHaveProperty("title");
				expect(content).toHaveProperty("summary");
				expect(content).toHaveProperty("status", "scaffold");
				expect(content).toHaveProperty("estimatedTime");
				expect(content).toHaveProperty("prerequisites");
				expect(content).toHaveProperty("learningObjectives");
				expect(content).toHaveProperty("difficulty", "beginner");
				expect(content).toHaveProperty("sections");
			});
		});

		describe("Quiz Content", () => {
			it("should generate quiz with minimum required questions", () => {
				const generator = getContentGenerator("quiz");
				const args = { unit: "test", type: "quiz" as const, id: "1-1" };
				const content = generator(args);

				expect((content as any).quiz.questions).toHaveLength(
					SETTINGS.scripts.scaffolding.quizzes.questions
				);
			});

			it("should generate diverse question types when configured", () => {
				const generator = getContentGenerator("quiz");
				const args = { unit: "test", type: "quiz" as const, id: "1-1" };
				const content = generator(args);

				if (SETTINGS.scripts.scaffolding.quizzes.diverseTypes) {
					const questionTypes = (content as any).quiz.questions.map((q: any) => q.type);
					const uniqueTypes = [...new Set(questionTypes)];

					// Should have multiple question types
					expect(uniqueTypes.length).toBeGreaterThan(1);

					// Should include various types
					const expectedTypes = [
						"single_choice",
						"multiple_choice",
						"code_completion",
						"true_false",
						"drag_and_drop"
					];
					const hasExpectedTypes = expectedTypes.some((type) => uniqueTypes.includes(type));
					expect(hasExpectedTypes).toBe(true);
				}
			});

			it("should include required fields for each question", () => {
				const generator = getContentGenerator("quiz");
				const args = { unit: "test", type: "quiz" as const, id: "1-1" };
				const content = generator(args);

				(content as any).quiz.questions.forEach((question: any) => {
					expect(question).toHaveProperty("id");
					expect(question).toHaveProperty("type");
					expect(question).toHaveProperty("question");
					expect(question).toHaveProperty("explanation");
					expect(question).toHaveProperty("points");
				});
			});
		});

		describe("Exam Content", () => {
			it("should generate exam with minimum required questions", () => {
				const generator = getContentGenerator("exam");
				const args = { unit: "test", type: "exam" as const, id: "final" };
				const content = generator(args);

				expect((content as any).exam.questions).toHaveLength(
					SETTINGS.scripts.scaffolding.exams.questions
				);
			});

			it("should have higher question count than quiz", () => {
				expect(SETTINGS.scripts.scaffolding.exams.questions).toBeGreaterThan(
					SETTINGS.scripts.scaffolding.quizzes.questions
				);
			});
		});

		describe("Study Guide Content", () => {
			it("should generate study guide with minimum required flashcards", () => {
				const generator = getContentGenerator("study_guide");
				const args = { unit: "test", type: "study_guide" as const, id: "1-1" };
				const content = generator(args);

				expect((content as any).studyGuide.flashcards).toHaveLength(
					SETTINGS.scripts.scaffolding.studyGuides.flashcards
				);
			});

			it("should include required fields for each flashcard", () => {
				const generator = getContentGenerator("study_guide");
				const args = { unit: "test", type: "study_guide" as const, id: "1-1" };
				const content = generator(args);

				(content as any).studyGuide.flashcards.forEach((card: any) => {
					expect(card).toHaveProperty("id");
					expect(card).toHaveProperty("front");
					expect(card).toHaveProperty("back");
					expect(card).toHaveProperty("tags");
					expect(card).toHaveProperty("difficulty");
				});
			});
		});

		describe("Project Content", () => {
			it("should generate project with minimum required elements", () => {
				const generator = getContentGenerator("project");
				const args = { unit: "test", type: "project" as const, id: "capstone" };
				const content = generator(args);

				expect((content as any).sections).toHaveLength(
					SETTINGS.scripts.scaffolding.projects.sections
				);
				expect((content as any).requirements).toHaveLength(
					SETTINGS.scripts.scaffolding.projects.requirements
				);
				expect((content as any).deliverables).toHaveLength(
					SETTINGS.scripts.scaffolding.projects.deliverables
				);
			});

			it("should include required fields for project content", () => {
				const generator = getContentGenerator("project");
				const args = { unit: "test", type: "project" as const, id: "capstone" };
				const content = generator(args);

				expect(content).toHaveProperty("type", "project");
				expect(content).toHaveProperty("title");
				expect(content).toHaveProperty("summary");
				expect(content).toHaveProperty("status", "scaffold");
				expect(content).toHaveProperty("estimatedHours");
				expect(content).toHaveProperty("difficulty", "intermediate");
				expect(content).toHaveProperty("technologies");
				expect(content).toHaveProperty("requirements");
				expect(content).toHaveProperty("deliverables");
				expect(content).toHaveProperty("sections");
			});
		});
	});

	describe("Configuration Integration", () => {
		it("should use settings from configuration file", () => {
			expect(SETTINGS.scripts.scaffolding.lessons.sections).toBeGreaterThan(0);
			expect(SETTINGS.scripts.scaffolding.quizzes.questions).toBeGreaterThan(0);
			expect(SETTINGS.scripts.scaffolding.exams.questions).toBeGreaterThan(0);
			expect(SETTINGS.scripts.scaffolding.studyGuides.flashcards).toBeGreaterThan(0);
			expect(SETTINGS.scripts.scaffolding.projects.sections).toBeGreaterThan(0);

			// Verify minimum requirements are met
			expect(SETTINGS.scripts.scaffolding.lessons.sections).toBeGreaterThanOrEqual(5);
			expect(SETTINGS.scripts.scaffolding.quizzes.questions).toBeGreaterThanOrEqual(10);
			expect(SETTINGS.scripts.scaffolding.exams.questions).toBeGreaterThanOrEqual(30);
			expect(SETTINGS.scripts.scaffolding.studyGuides.flashcards).toBeGreaterThanOrEqual(5);
			expect(SETTINGS.scripts.scaffolding.projects.sections).toBeGreaterThanOrEqual(5);
		});

		it("should have content length configurations", () => {
			expect(SETTINGS.scripts.scaffolding.contentLengths).toBeDefined();
			expect(SETTINGS.scripts.scaffolding.contentLengths.summary).toBeGreaterThan(0);
			expect(SETTINGS.scripts.scaffolding.contentLengths.paragraph).toBeGreaterThan(0);
			expect(SETTINGS.scripts.scaffolding.contentLengths.question).toBeGreaterThan(0);
		});

		it("should have diverse types configuration", () => {
			expect(typeof SETTINGS.scripts.scaffolding.quizzes.diverseTypes).toBe("boolean");
			expect(typeof SETTINGS.scripts.scaffolding.exams.diverseTypes).toBe("boolean");
		});
	});

	describe("Error Handling", () => {
		it("should handle invalid arguments gracefully", async () => {
			process.argv = ["node", "script.js"];
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			await expect(() => parseCliArguments()).rejects.toThrow("process.exit");
			expect(consoleErrorSpy).toHaveBeenCalled();
		});

		it("should provide helpful error messages for invalid unit", async () => {
			process.argv = ["node", "script.js", "--unit=invalid", "--type=lesson", "--id=test"];
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			await expect(() => parseCliArguments()).rejects.toThrow("process.exit");
			expect(consoleErrorSpy).toHaveBeenCalledWith('❌ ERROR: Unit "invalid" not found');
			// Updated to check for the new detailed error message format
			expect(consoleErrorSpy).toHaveBeenCalledWith("Available options:");
		});
	});

	describe("Content Quality Checks", () => {
		it("should generate non-empty content", () => {
			const generator = getContentGenerator("lesson");
			const args = { unit: "test", type: "lesson" as const, id: "1-1" };
			const content = generator(args);

			expect((content as any).title.trim()).not.toBe("");
			expect((content as any).summary.trim()).not.toBe("");
			expect((content as any).learningObjectives.length).toBeGreaterThan(0);
			expect((content as any).prerequisites.length).toBeGreaterThan(0);

			(content as any).sections.forEach((section: any) => {
				expect(section.title.trim()).not.toBe("");
				expect((section as any).content.length).toBeGreaterThan(0);

				(section as any).content.forEach((block: any) => {
					expect(block.type).toBeDefined();
					if (block.type === "paragraph") {
						expect(Array.isArray((block as any).content)).toBe(true);
						expect((block as any).content.length).toBeGreaterThan(0);
						expect((block as any).content[0].text.trim()).not.toBe("");
					} else if (block.type === "code") {
						expect(block.code.trim()).not.toBe("");
						expect(block.language).toBeDefined();
					} else if (block.type === "diagram") {
						expect(block.definition.trim()).not.toBe("");
						expect(block.title).toBeDefined();
					}
				});
			});
		});

		it("should generate valid question structures", () => {
			const generator = getContentGenerator("quiz");
			const args = { unit: "test", type: "quiz" as const, id: "1-1" };
			const content = generator(args);

			(content as any).quiz.questions.forEach((question: any) => {
				expect(question.question.trim()).not.toBe("");
				expect(question.explanation.trim()).not.toBe("");

				if (question.type === "single_choice" || question.type === "multiple_choice") {
					expect(question.options).toBeDefined();
					expect(question.options.length).toBeGreaterThan(0);
					expect(question.correct).toBeDefined();
				} else if (question.type === "code_completion") {
					expect(question.codeSnippet).toBeDefined();
					expect(question.blanks).toBeDefined();
					expect(question.correctAnswers).toBeDefined();
				} else if (question.type === "true_false") {
					expect(typeof question.correct).toBe("boolean");
				} else if (question.type === "drag_and_drop") {
					expect(question.items).toBeDefined();
					expect(question.targets).toBeDefined();
					expect(question.correctMatches).toBeDefined();
				}
			});
		});
	});
});
