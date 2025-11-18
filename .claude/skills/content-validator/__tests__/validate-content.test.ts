/**
 * Test Suite for Content Guardian
 *
 * Tests 5 validation categories for educational content:
 * 1. TypeScript interface compliance
 * 2. Content status lifecycle (scaffold → draft → final)
 * 3. Interactive standards (quiz: 5q/80%, study guide: ≥8 flashcards, code completion: 5 underscores)
 * 4. Educational quality (measurable objectives, secure code)
 * 5. Metadata completeness
 *
 * Coverage target: ≥90%
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync } from "fs";
import { join } from "path";
import { ExtendedTestSetup } from "../../../../src/test/helpers/test-setup";
import { generateConfigId } from "../../../../src/test/helpers/test-utils";
import { validateContentFile, type ContentViolation } from "../scripts/validate-content";

/**
 * Test setup for content validation
 */
class ContentTestSetup extends ExtendedTestSetup {
	public configId: string;
	public contentPath: string;

	constructor(testSuiteId: string = "main") {
		super("scripts", `content-${testSuiteId}`);
		this.configId = generateConfigId("test-content", testSuiteId);
		this.contentPath = join(this.tempDir, "content.ts");
	}

	/**
	 * Write TypeScript content to test file
	 */
	writeContent(code: string): void {
		writeFileSync(this.contentPath, code, "utf-8");
	}
}

describe("Content Guardian - TypeScript Imports", () => {
	let testSetup: ContentTestSetup;

	beforeEach(() => {
		testSetup = new ContentTestSetup("ts-imports");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for proper type imports using $types alias", () => {
			const content = `
import type { LessonContent } from "$types";

export const lesson: LessonContent = {
	title: "Introduction",
	status: "draft"
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const importViolations = result.violations.filter(
				(v) => v.category === "TypeScript Interface"
			);
			expect(importViolations).toHaveLength(0);
		});

		it("should pass for content without type imports", () => {
			const content = `
export const simpleData = {
	title: "Test",
	value: 123
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const importViolations = result.violations.filter(
				(v) => v.category === "TypeScript Interface"
			);
			expect(importViolations).toHaveLength(0);
		});
	});

	describe("Negative Cases", () => {
		it("should detect direct file import instead of alias", () => {
			const content = `
import type { LessonContent } from "$lib/types/types.js";

export const lesson: LessonContent = {
	title: "Test"
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const importViolations = result.violations.filter(
				(v) => v.category === "TypeScript Interface"
			);
			expect(importViolations.length).toBeGreaterThan(0);
			expect(importViolations[0].severity).toBe("high");
			expect(importViolations[0].found).toContain("$lib/types/types.js");
		});

		it("should detect missing type import when using content types", () => {
			const content = `
export const quiz: QuizContent = {
	title: "Test Quiz"
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const importViolations = result.violations.filter(
				(v) => v.category === "TypeScript Interface"
			);
			expect(importViolations.length).toBeGreaterThan(0);
			expect(importViolations[0].fix).toContain("import type");
		});
	});
});

describe("Content Guardian - Status Lifecycle", () => {
	let testSetup: ContentTestSetup;

	beforeEach(() => {
		testSetup = new ContentTestSetup("lifecycle");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for draft content with proper text", () => {
			const content = `
import type { LessonContent } from "$types";

export const lesson: LessonContent = {
	title: "Kubernetes Fundamentals",
	status: "draft",
	content: "Learn about container orchestration with Kubernetes."
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const lifecycleViolations = result.violations.filter(
				(v) => v.category === "Status Lifecycle"
			);
			expect(lifecycleViolations).toHaveLength(0);
		});
	});

	describe("Negative Cases", () => {
		it("should detect TODO markers with high severity for draft", () => {
			const content = `
export const lesson = {
	title: "Test",
	status: "draft",
	content: "TODO: Add content here"
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const lifecycleViolations = result.violations.filter(
				(v) => v.category === "Status Lifecycle"
			);
			expect(lifecycleViolations.length).toBeGreaterThan(0);
			expect(lifecycleViolations[0].severity).toBe("high");
		});

		it("should detect placeholder content with blocking severity for final", () => {
			const content = `
export const lesson = {
	title: "Test",
	status: "final",
	content: "This is placeholder content that needs to be replaced"
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const lifecycleViolations = result.violations.filter(
				(v) => v.category === "Status Lifecycle"
			);
			expect(lifecycleViolations.length).toBeGreaterThan(0);
			expect(lifecycleViolations[0].severity).toBe("blocking");
		});

		it("should detect lorem ipsum", () => {
			const content = `
export const lesson = {
	title: "Test",
	content: "Lorem ipsum dolor sit amet"
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const lifecycleViolations = result.violations.filter(
				(v) => v.category === "Status Lifecycle"
			);
			expect(lifecycleViolations.length).toBeGreaterThan(0);
		});

		it("should detect FIXME markers", () => {
			const content = `
export const lesson = {
	title: "Test",
	content: "FIXME: Update this section"
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const lifecycleViolations = result.violations.filter(
				(v) => v.category === "Status Lifecycle"
			);
			expect(lifecycleViolations.length).toBeGreaterThan(0);
		});
	});
});

describe("Content Guardian - Interactive Standards", () => {
	let testSetup: ContentTestSetup;

	beforeEach(() => {
		testSetup = new ContentTestSetup("interactive");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases - Quiz", () => {
		it("should pass for quiz with exactly 5 questions and 80% passing score", () => {
			const content = `
export const quiz = {
	type: "quiz",
	passingScore: 80,
	questions: [
		{ question: "Q1?", answer: "A1" },
		{ question: "Q2?", answer: "A2" },
		{ question: "Q3?", answer: "A3" },
		{ question: "Q4?", answer: "A4" },
		{ question: "Q5?", answer: "A5" }
	]
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const interactiveViolations = result.violations.filter(
				(v) => v.category === "Interactive Standards"
			);
			expect(interactiveViolations).toHaveLength(0);
		});
	});

	describe("Negative Cases - Quiz", () => {
		it("should detect quiz with wrong number of questions", () => {
			const content = `
export const quiz = {
	type: "quiz",
	questions: [
		{ question: "Q1?", answer: "A1" },
		{ question: "Q2?", answer: "A2" },
		{ question: "Q3?", answer: "A3" }
	]
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const interactiveViolations = result.violations.filter(
				(v) => v.category === "Interactive Standards"
			);
			expect(interactiveViolations.length).toBeGreaterThan(0);
			expect(interactiveViolations[0].severity).toBe("blocking");
			expect(interactiveViolations[0].found).toContain("3 questions");
		});

		it("should detect quiz without 80% passing score", () => {
			const content = `
export const quiz = {
	type: "quiz",
	passingScore: 70,
	questions: [
		{ question: "Q1?" }, { question: "Q2?" }, { question: "Q3?" },
		{ question: "Q4?" }, { question: "Q5?" }
	]
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const interactiveViolations = result.violations.filter(
				(v) => v.category === "Interactive Standards"
			);
			expect(interactiveViolations.length).toBeGreaterThan(0);
			expect(interactiveViolations[0].severity).toBe("high");
		});
	});

	describe("Positive Cases - Study Guide", () => {
		it("should pass for study guide with 8+ flashcards", () => {
			const content = `
export const studyGuide = {
	type: "study-guide",
	flashcards: [
		{ front: "F1", back: "B1" }, { front: "F2", back: "B2" },
		{ front: "F3", back: "B3" }, { front: "F4", back: "B4" },
		{ front: "F5", back: "B5" }, { front: "F6", back: "B6" },
		{ front: "F7", back: "B7" }, { front: "F8", back: "B8" }
	]
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const interactiveViolations = result.violations.filter(
				(v) => v.category === "Interactive Standards"
			);
			expect(interactiveViolations).toHaveLength(0);
		});
	});

	describe("Negative Cases - Study Guide", () => {
		it("should detect study guide with fewer than 8 flashcards", () => {
			const content = `
export const studyGuide = {
	type: "study-guide",
	flashcards: [
		{ front: "F1", back: "B1" },
		{ front: "F2", back: "B2" },
		{ front: "F3", back: "B3" }
	]
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const interactiveViolations = result.violations.filter(
				(v) => v.category === "Interactive Standards"
			);
			expect(interactiveViolations.length).toBeGreaterThan(0);
			expect(interactiveViolations[0].severity).toBe("blocking");
			expect(interactiveViolations[0].found).toContain("3 flashcards");
		});
	});

	describe("Positive Cases - Code Completion", () => {
		it("should pass for code completion with exactly 5 underscores", () => {
			const content = `
export const codeCompletion = {
	code: "const name = _____;"
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const interactiveViolations = result.violations.filter(
				(v) => v.category === "Interactive Standards"
			);
			expect(interactiveViolations).toHaveLength(0);
		});
	});

	describe("Negative Cases - Code Completion", () => {
		it("should detect code completion with wrong number of underscores", () => {
			const content = `
export const codeCompletion = {
	code: "const name = ___;"
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const interactiveViolations = result.violations.filter(
				(v) => v.category === "Interactive Standards"
			);
			expect(interactiveViolations.length).toBeGreaterThan(0);
			expect(interactiveViolations[0].severity).toBe("high");
			expect(interactiveViolations[0].found).toContain("3 underscores");
		});
	});

	describe("Edge Cases", () => {
		it("should handle boundary value of exactly 8 flashcards", () => {
			const content = `
export const studyGuide = {
	type: "study-guide",
	flashcards: [
		{ front: "F1" }, { front: "F2" }, { front: "F3" }, { front: "F4" },
		{ front: "F5" }, { front: "F6" }, { front: "F7" }, { front: "F8" }
	]
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const interactiveViolations = result.violations.filter(
				(v) => v.category === "Interactive Standards"
			);
			expect(interactiveViolations).toHaveLength(0);
		});

		it("should handle mixed content types", () => {
			const content = `
export const mixed = {
	quiz: [
		{ question: "Q1?" }, { question: "Q2?" }, { question: "Q3?" },
		{ question: "Q4?" }, { question: "Q5?" }
	],
	studyGuide: {
		flashcards: [
			{ front: "F1" }, { front: "F2" }, { front: "F3" }, { front: "F4" },
			{ front: "F5" }, { front: "F6" }, { front: "F7" }, { front: "F8" }
		]
	}
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			expect(result.violations).toHaveLength(0);
		});
	});
});

describe("Content Guardian - Educational Quality", () => {
	let testSetup: ContentTestSetup;

	beforeEach(() => {
		testSetup = new ContentTestSetup("quality");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for specific measurable learning objectives", () => {
			const content = `
export const lesson = {
	learningObjectives: [
		"Build a Kubernetes cluster",
		"Deploy containerized applications",
		"Configure pod networking"
	]
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const qualityViolations = result.violations.filter(
				(v) => v.category === "Educational Quality"
			);
			expect(qualityViolations).toHaveLength(0);
		});

		it("should pass for secure code examples", () => {
			const content = `
export const lesson = {
	codeExample: \`
		const apiKey = process.env.API_KEY;
		const password = getSecretFromVault();
	\`
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const qualityViolations = result.violations.filter(
				(v) => v.category === "Educational Quality"
			);
			expect(qualityViolations).toHaveLength(0);
		});
	});

	describe("Negative Cases", () => {
		it("should detect vague learning objectives starting with 'understand'", () => {
			const content = `
export const lesson = {
	learningObjectives: [
		"Understand Kubernetes basics"
	]
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const qualityViolations = result.violations.filter(
				(v) => v.category === "Educational Quality"
			);
			expect(qualityViolations.length).toBeGreaterThan(0);
			expect(qualityViolations[0].severity).toBe("high");
			expect(qualityViolations[0].found).toContain("understand");
		});

		it("should detect hardcoded passwords", () => {
			const content = `
export const example = {
	code: \`const password = "admin123";\`
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const qualityViolations = result.violations.filter(
				(v) => v.category === "Educational Quality"
			);
			expect(qualityViolations.length).toBeGreaterThan(0);
			expect(qualityViolations[0].found).toContain("password");
		});

		it("should detect hardcoded API keys", () => {
			const content = `
export const example = {
	code: \`const api_key = "sk-1234567890";\`
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const qualityViolations = result.violations.filter(
				(v) => v.category === "Educational Quality"
			);
			expect(qualityViolations.length).toBeGreaterThan(0);
			expect(qualityViolations[0].found).toContain("API key");
		});

		it("should detect hardcoded secrets", () => {
			const content = `
export const example = {
	code: \`const secret = "my-secret-token";\`
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const qualityViolations = result.violations.filter(
				(v) => v.category === "Educational Quality"
			);
			expect(qualityViolations.length).toBeGreaterThan(0);
		});
	});

	describe("Edge Cases", () => {
		it("should detect all vague objective verbs", () => {
			const content = `
export const lesson = {
	learningObjectives: [
		"Understand containers",
		"Learn about Kubernetes",
		"Know Docker commands",
		"Be familiar with pods"
	]
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const qualityViolations = result.violations.filter(
				(v) => v.category === "Educational Quality"
			);
			// Should detect all 4 vague objectives
			expect(qualityViolations.length).toBeGreaterThanOrEqual(4);
		});
	});
});

describe("Content Guardian - Metadata", () => {
	let testSetup: ContentTestSetup;

	beforeEach(() => {
		testSetup = new ContentTestSetup("metadata");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for final content with complete metadata", () => {
			const content = `
export const lesson = {
	title: "Kubernetes Basics",
	status: "final",
	estimatedMinutes: 30,
	lastModified: "2025-01-15"
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const metadataViolations = result.violations.filter((v) => v.category === "Metadata");
			expect(metadataViolations).toHaveLength(0);
		});

		it("should pass for draft content without estimatedMinutes", () => {
			const content = `
export const lesson = {
	title: "Kubernetes Basics",
	status: "draft"
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const metadataViolations = result.violations.filter((v) => v.category === "Metadata");
			expect(metadataViolations).toHaveLength(0);
		});
	});

	describe("Negative Cases", () => {
		it("should detect missing estimatedMinutes for final content", () => {
			const content = `
export const lesson = {
	title: "Test",
	status: "final"
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const metadataViolations = result.violations.filter((v) => v.category === "Metadata");
			expect(metadataViolations.length).toBeGreaterThan(0);
			expect(metadataViolations.some((v) => v.fix.includes("estimatedMinutes"))).toBe(true);
		});

		it("should detect missing lastModified for final content", () => {
			const content = `
export const lesson = {
	title: "Test",
	status: "final",
	estimatedMinutes: 20
};
			`;
			testSetup.writeContent(content);

			const result = validateContentFile(testSetup.contentPath);
			const metadataViolations = result.violations.filter((v) => v.category === "Metadata");
			expect(metadataViolations.length).toBeGreaterThan(0);
			expect(metadataViolations.some((v) => v.fix.includes("lastModified"))).toBe(true);
		});
	});
});

describe("Content Guardian - Integration Tests", () => {
	let testSetup: ContentTestSetup;

	beforeEach(() => {
		testSetup = new ContentTestSetup("integration");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	it("should validate entire content file and aggregate violations", () => {
		const content = `
import type { QuizContent } from "$lib/types/types.js";

export const quiz: QuizContent = {
	type: "quiz",
	status: "final",
	learningObjectives: ["Understand Docker"],
	questions: [
		{ question: "Q1?" },
		{ question: "Q2?" },
		{ question: "Q3?" }
	],
	codeExample: \`const password = "admin";\`
};
		`;
		testSetup.writeContent(content);

		const result = validateContentFile(testSetup.contentPath);
		expect(result.file).toBe(testSetup.contentPath);
		expect(result.status).toBe("final");
		expect(result.contentType).toBe("quiz");
		expect(result.violations.length).toBeGreaterThan(0);

		// Should have violations from multiple categories
		const categories = new Set(result.violations.map((v) => v.category));
		expect(categories.size).toBeGreaterThan(2);
	});

	it("should pass for well-structured content", () => {
		const content = `
import type { LessonContent } from "$types";

export const lesson: LessonContent = {
	title: "Docker Fundamentals",
	status: "final",
	estimatedMinutes: 45,
	lastModified: "2025-01-15",
	learningObjectives: [
		"Build Docker images",
		"Deploy containerized applications",
		"Configure Docker networking"
	],
	content: "Learn container technology with Docker."
};
		`;
		testSetup.writeContent(content);

		const result = validateContentFile(testSetup.contentPath);
		expect(result.violations).toHaveLength(0);
	});
});
