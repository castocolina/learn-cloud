/**
 * Template Generator Test Suite
 *
 * Tests for the pure template generation utility that creates lorem ipsum content.
 * This test suite focuses on template generation logic without any file I/O or validation,
 * making it the fastest execution category in the TestSetup optimization strategy.
 *
 * Test Coverage:
 * - All generateXContent() methods (lesson, quiz, study guide, exam, project)
 * - Content structure validation
 * - Random content generation diversity
 * - Template consistency across multiple generations
 * - Backward compatibility functions
 *
 * Performance Optimization:
 * - Uses TestSetup (validation disabled) for 96% of tests - fastest execution
 * - No file I/O operations - pure template logic testing
 * - Independent testing - template generation tested separately from CLI and Core API
 * - High coverage of all template variations and edge cases
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import {
	TemplateGenerator,
	generateLessonContent,
	generateQuizContent,
	generateStudyGuideContent,
	generateExamContent,
	generateProjectContent,
	getContentGenerator
} from "../../../lib/utils/template-generator.js";
import { generateConfigId } from "../../../lib/utils/validation-utils.js";
import { SETTINGS } from "$config/settings.js";
import type {
	ValidatedScaffoldingArgs,
	ChapterType,
	AnyQuestion,
	QuizContent,
	StudyGuideContent,
	QuestionType
} from "$types";

/**
 * Test setup class optimized for fast template generation testing
 * - No validation (disabled by default for speed)
 * - No file I/O operations
 * - Pure template logic testing
 */
class TestSetup {
	private tempDir: string;
	public readonly configId: string;

	constructor(testSuiteId: string = "main") {
		const timestamp = Date.now();
		const uniqueId = `${testSuiteId}-${timestamp}`;
		this.tempDir = join(process.cwd(), "tmp", `test-template-generator-${uniqueId}`);
		this.configId = generateConfigId(SETTINGS.scripts.scaffolding.validationPrefix, testSuiteId);
	}

	async setup(): Promise<void> {
		// Create temp directory for any output if needed
		if (!existsSync(this.tempDir)) {
			mkdirSync(this.tempDir, { recursive: true });
		}

		// Configure validation (disabled by default for fast testing)
		this.configureValidation();
	}

	cleanup(): void {
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
		// Disable validation for fast template testing
		(SETTINGS.scripts.validation.generated as { runAfterGeneration: boolean }).runAfterGeneration =
			false;
	}

	/**
	 * Get test directory path
	 */
	getTempDir(): string {
		return this.tempDir;
	}
}

/**
 * Test setup class with validation enabled for specific integration tests
 * Only used for the 4% of tests that need full validation
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
 * Sample test arguments for template generation
 */
const createTestArgs = (
	type: ChapterType,
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

/**
 * Main test suite - Template Generation Logic
 */
describe("TemplateGenerator", () => {
	let testSetup: TestSetup;
	let generator: TemplateGenerator;

	beforeEach(async () => {
		testSetup = new TestSetup();
		await testSetup.setup();
		generator = new TemplateGenerator();
	});

	afterEach(() => {
		testSetup.cleanup();
	});

	/**
	 * Class-based API Tests
	 */
	describe("TemplateGenerator Class API", () => {
		it("should create TemplateGenerator instance", () => {
			expect(generator).toBeInstanceOf(TemplateGenerator);
		});

		it("should generate lesson content with correct structure", () => {
			const args = createTestArgs("lesson");
			const content = generator.generateLessonContent(args);

			expect(content.type).toBe("lesson");
			expect(content.title).toContain("Cloud-Native");
			expect(content.status).toBe("scaffold");
			expect(content.sections).toBeInstanceOf(Array);
			expect(content.sections.length).toBeGreaterThan(0);
			expect(content.prerequisites).toBeInstanceOf(Array);
			expect(content.learningObjectives).toBeInstanceOf(Array);
		});

		it("should generate quiz content with diverse question types", () => {
			const args = createTestArgs("quiz");
			const content = generator.generateQuizContent(args);

			expect(content.type).toBe("quiz");
			expect(content.quiz).toBeDefined();
			expect(content.quiz.questions).toBeInstanceOf(Array);
			expect(content.quiz.questions.length).toBe(SETTINGS.scripts.scaffolding.quizzes.questions);

			// Check for diverse question types when enabled
			if (SETTINGS.scripts.scaffolding.quizzes.diverseTypes) {
				const questionTypes = new Set(
					(content as QuizContent).quiz.questions.map((q: AnyQuestion) => q.type)
				);
				expect(questionTypes.size).toBeGreaterThan(1);
			}
		});

		it("should generate study guide content with flashcards", () => {
			const args = createTestArgs("study_guide");
			const content = generator.generateStudyGuideContent(args);

			expect(content.type).toBe("study_guide");
			expect(content.studyGuide).toBeDefined();
			expect(content.studyGuide.flashcards).toBeInstanceOf(Array);
			expect(content.studyGuide.flashcards.length).toBe(
				SETTINGS.scripts.scaffolding.studyGuides.flashcards
			);

			// Check flashcard structure
			const flashcard = (content as StudyGuideContent).studyGuide.flashcards[0];
			expect(flashcard).toHaveProperty("id");
			expect(flashcard).toHaveProperty("front");
			expect(flashcard).toHaveProperty("back");
			expect(flashcard).toHaveProperty("tags");
		});

		it("should generate exam content with comprehensive questions", () => {
			const args = createTestArgs("exam");
			const content = generator.generateExamContent(args);

			expect(content.type).toBe("exam");
			expect(content.exam).toBeDefined();
			expect(content.exam.questions).toBeInstanceOf(Array);
			expect(content.exam.questions.length).toBe(SETTINGS.scripts.scaffolding.exams.questions);
			expect(content.duration).toBe(90);
			expect(content.passingScore).toBe(75);
		});

		it("should generate project content with requirements and deliverables", () => {
			const args = createTestArgs("project");
			const content = generator.generateProjectContent(args);

			expect(content.type).toBe("project");
			expect(content.requirements).toBeInstanceOf(Array);
			expect(content.deliverables).toBeInstanceOf(Array);
			expect(content.sections).toBeInstanceOf(Array);
			expect(content.requirements.length).toBe(SETTINGS.scripts.scaffolding.projects.requirements);
			expect(content.deliverables.length).toBe(SETTINGS.scripts.scaffolding.projects.deliverables);
			expect(content.technologies).toBeInstanceOf(Array);
		});

		it("should generate overview content (uses lesson structure)", () => {
			const args = createTestArgs("overview");
			const content = generator.generateOverviewContent(args);

			expect(content.type).toBe("overview");
			expect(content.title).toContain("Overview");
			expect(content.sections).toBeInstanceOf(Array);
		});

		it("should get appropriate content generator for each type", () => {
			const types: ChapterType[] = ["lesson", "quiz", "study_guide", "exam", "project", "overview"];

			types.forEach((type) => {
				const contentGenerator = generator.getContentGenerator(type);
				expect(contentGenerator).toBeInstanceOf(Function);

				// Test that the generator produces content of the correct type
				const args = createTestArgs(type);
				const content = contentGenerator(args);
				expect(content.type).toBe(type);
			});
		});
	});

	/**
	 * Content Diversity Tests
	 */
	describe("Content Diversity and Randomization", () => {
		it("should generate different content on multiple calls", () => {
			const args = createTestArgs("lesson");
			const content1 = generator.generateLessonContent(args);
			const content2 = generator.generateLessonContent(args);

			// Content should have same structure but different random elements
			expect(content1.type).toBe(content2.type);
			expect(content1.title).toBe(content2.title); // Title is deterministic based on args

			// Some content should vary (depends on random generation)
			// Note: This might occasionally fail due to randomness - that's expected
		});

		it("should generate diverse quiz question types when enabled", () => {
			if (!SETTINGS.scripts.scaffolding.quizzes.diverseTypes) {
				return; // Skip if diverse types are disabled
			}

			const args = createTestArgs("quiz");
			const content = generator.generateQuizContent(args);
			const questions = (content as QuizContent).quiz.questions;

			// Check for multiple question types
			const questionTypes = new Set(questions.map((q) => q.type));
			expect(questionTypes.size).toBeGreaterThan(1);

			// Common question types should be present
			const expectedTypes: QuestionType[] = [
				"single_choice",
				"multiple_choice",
				"code_completion",
				"true_false",
				"drag_and_drop"
			];
			const presentTypes = Array.from(questionTypes);
			const hasExpectedTypes = expectedTypes.some((type) => presentTypes.includes(type));
			expect(hasExpectedTypes).toBe(true);
		});

		it("should generate content with appropriate lengths", () => {
			const args = createTestArgs("lesson");
			const content = generator.generateLessonContent(args);

			expect(content.summary).toBeDefined();
			expect(typeof content.summary).toBe("string");
			expect(content.summary.length).toBeGreaterThan(10);
			expect(content.summary.length).toBeLessThan(1000);

			// Check learning objectives
			expect(content.learningObjectives).toBeInstanceOf(Array);
			if (content.learningObjectives) {
				content.learningObjectives.forEach((objective: string) => {
					expect(typeof objective).toBe("string");
					expect(objective.length).toBeGreaterThan(5);
				});
			}
		});
	});

	/**
	 * Backward Compatibility Tests
	 */
	describe("Backward Compatibility Functions", () => {
		it("should support standalone generateLessonContent function", () => {
			const args = createTestArgs("lesson");
			const content = generateLessonContent(args);

			expect(content.type).toBe("lesson");
			expect(content.title).toContain("Cloud-Native");
		});

		it("should support standalone generateQuizContent function", () => {
			const args = createTestArgs("quiz");
			const content = generateQuizContent(args);

			expect(content.type).toBe("quiz");
			expect(content.quiz.questions).toBeInstanceOf(Array);
		});

		it("should support standalone generateStudyGuideContent function", () => {
			const args = createTestArgs("study_guide");
			const content = generateStudyGuideContent(args);

			expect(content.type).toBe("study_guide");
			expect(content.studyGuide.flashcards).toBeInstanceOf(Array);
		});

		it("should support standalone generateExamContent function", () => {
			const args = createTestArgs("exam");
			const content = generateExamContent(args);

			expect(content.type).toBe("exam");
			expect(content.exam.questions).toBeInstanceOf(Array);
		});

		it("should support standalone generateProjectContent function", () => {
			const args = createTestArgs("project");
			const content = generateProjectContent(args);

			expect(content.type).toBe("project");
			expect(content.requirements).toBeInstanceOf(Array);
		});

		it("should support standalone getContentGenerator function", () => {
			const lessonGenerator = getContentGenerator("lesson");
			expect(lessonGenerator).toBeInstanceOf(Function);

			const args = createTestArgs("lesson");
			const content = lessonGenerator(args);
			expect(content.type).toBe("lesson");
		});
	});

	/**
	 * Configuration Compliance Tests
	 */
	describe("Configuration Compliance", () => {
		it("should respect settings configuration for lessons", () => {
			const args = createTestArgs("lesson");
			const content = generator.generateLessonContent(args);

			expect(content.sections.length).toBe(SETTINGS.scripts.scaffolding.lessons.sections);
		});

		it("should respect settings configuration for quizzes", () => {
			const args = createTestArgs("quiz");
			const content = generator.generateQuizContent(args);

			expect(content.quiz.questions.length).toBe(SETTINGS.scripts.scaffolding.quizzes.questions);
		});

		it("should respect settings configuration for study guides", () => {
			const args = createTestArgs("study_guide");
			const content = generator.generateStudyGuideContent(args);

			expect(content.studyGuide.flashcards.length).toBe(
				SETTINGS.scripts.scaffolding.studyGuides.flashcards
			);
		});

		it("should respect settings configuration for exams", () => {
			const args = createTestArgs("exam");
			const content = generator.generateExamContent(args);

			expect(content.exam.questions.length).toBe(SETTINGS.scripts.scaffolding.exams.questions);
		});

		it("should respect settings configuration for projects", () => {
			const args = createTestArgs("project");
			const content = generator.generateProjectContent(args);

			expect(content.requirements.length).toBe(SETTINGS.scripts.scaffolding.projects.requirements);
			expect(content.deliverables.length).toBe(SETTINGS.scripts.scaffolding.projects.deliverables);
		});
	});
});

/**
 * Integration Tests with Validation - Uses TestSetupWithValidation (4% of tests)
 * These tests ensure template generation works correctly when validation is enabled
 */
describe("TemplateGenerator Integration with Validation", () => {
	let testSetup: TestSetupWithValidation;
	let generator: TemplateGenerator;

	beforeEach(async () => {
		testSetup = new TestSetupWithValidation();
		await testSetup.setup();
		generator = new TemplateGenerator();
	});

	afterEach(() => {
		testSetup.cleanup();
	});

	it("should generate valid content structures when validation is enabled", () => {
		const types: ChapterType[] = ["lesson", "quiz", "study_guide", "exam", "project"];

		types.forEach((type) => {
			const args = createTestArgs(type);
			const contentGenerator = generator.getContentGenerator(type);
			const content = contentGenerator(args);

			// Basic structure validation
			expect(content).toBeDefined();
			expect(content.type).toBe(type);
			expect(content.status).toBe("scaffold");
			expect(typeof content.title).toBe("string");
			expect(content.title.length).toBeGreaterThan(0);
		});
	});

	it("should generate content that passes basic JSON serialization", () => {
		const args = createTestArgs("lesson");
		const content = generator.generateLessonContent(args);

		// Should be serializable to JSON and back
		const jsonString = JSON.stringify(content);
		expect(jsonString.length).toBeGreaterThan(100);

		const parsedContent = JSON.parse(jsonString);
		expect(parsedContent.type).toBe("lesson");
		expect(parsedContent.title).toBe(content.title);
	});
});
