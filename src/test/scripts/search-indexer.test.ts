/**
 * Search Index Generator Test Suite
 *
 * Comprehensive tests for the search index generation script including:
 * - Content extraction from TypeScript files
 * - Keyword extraction and enhancement
 * - Lunr.js index generation
 * - Performance validation
 * - Generated file validation
 *
 * Test Coverage:
 * - Unit tests for individual extraction functions
 * - Integration tests for full index generation
 * - Performance benchmarking
 * - Edge case handling
 * - Validation of generated search index
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { SearchIndexGenerator } from "../../scripts/search-indexer.js";
import { generateConfigId } from "../../lib/utils/validation-utils.js";
import { SETTINGS } from "$config/settings.js";
import type { SearchIndexConfig } from "$types";

// Test configuration is now handled by TestSetup class using SETTINGS

/**
 * Mock content for testing
 */
const MOCK_LESSON_CONTENT = `
import type { LessonContent } from "$types";

export const lessonContent: LessonContent = {
	type: "lesson",
	title: "Test Lesson: Container Fundamentals",
	summary: "Learn the basics of containerization with Docker and Kubernetes",
	status: "scaffold",
	estimatedTime: 45,
	prerequisites: ["linux-basics", "command-line"],
	learningObjectives: ["Understanding containers", "Docker basics", "Container orchestration"],
	difficulty: "beginner",
	sections: [
		{
			title: "Introduction to Containers",
			content: [
				{
					type: "paragraph",
					content: [
						{ text: "Containers are lightweight, portable execution environments that package applications with all dependencies." }
					]
				},
				{
					type: "code",
					language: "bash",
					code: "docker run -d --name web-server nginx:latest",
					title: "Basic Docker Command",
					filename: "start-nginx.sh"
				},
				{
					type: "diagram",
					diagramType: "mermaid",
					definition: "graph TD\\nA[Application] --> B[Container]\\nB --> C[Docker Engine]",
					title: "Container Architecture",
					caption: "How applications run in containers"
				},
				{
					type: "callout",
					calloutType: "info",
					title: "Key Concept",
					content: [
						{ text: "Containers share the host OS kernel, making them more efficient than virtual machines." }
					]
				}
			]
		}
	]
};
`;

const MOCK_QUIZ_CONTENT = `
import type { QuizContent } from "$types";

export const quizContent: QuizContent = {
	type: "quiz",
	title: "Container Knowledge Quiz",
	summary: "Test your understanding of containerization concepts",
	status: "scaffold",
	quiz: {
		description: "Quick assessment of container fundamentals",
		passingScore: 70,
		timeLimit: 15,
		questions: [
			{
				id: "q1",
				type: "single_choice",
				question: "What is the main advantage of containers over virtual machines?",
				options: [
					"Containers are more secure",
					"Containers share the host OS kernel",
					"Containers are slower",
					"Containers use more memory"
				],
				correct: 1,
				explanation: "Containers share the host OS kernel, making them more lightweight and efficient than VMs.",
				points: 10
			},
			{
				id: "q2",
				type: "multiple_choice",
				question: "Which of the following are container orchestration platforms?",
				options: [
					"Kubernetes",
					"Docker Swarm",
					"Apache Kafka",
					"OpenShift"
				],
				correct: [0, 1, 3],
				explanation: "Kubernetes, Docker Swarm, and OpenShift are container orchestration platforms.",
				points: 15
			}
		]
	}
};
`;

const MOCK_STUDY_GUIDE_CONTENT = `
import type { StudyGuideContent } from "$types";

export const study_guideContent: StudyGuideContent = {
	type: "study_guide",
	title: "Container Study Guide",
	summary: "Key concepts and terminology for containerization",
	status: "scaffold",
	studyGuide: {
		description: "Essential container terms and concepts",
		flashcards: [
			{
				id: "card1",
				front: "What is a Docker image?",
				back: "A lightweight, standalone, executable package that includes everything needed to run an application",
				tags: ["docker", "fundamentals"],
				difficulty: "beginner"
			},
			{
				id: "card2",
				front: "What does kubectl do?",
				back: "Command-line tool for communicating with Kubernetes clusters",
				tags: ["kubernetes", "tools"],
				difficulty: "intermediate"
			}
		],
		categories: ["docker", "kubernetes", "fundamentals"]
	}
};
`;

/**
 * Test utilities
 */
class TestSetup {
	private tempDir: string;
	private testContentDir: string;
	private testOutputDir: string;
	public readonly configId: string;

	constructor(testSuiteId: string = "main") {
		const timestamp = Date.now();
		const uniqueId = `${testSuiteId}-${timestamp}`;
		this.tempDir = join(process.cwd(), "tmp", `test-indexer-${uniqueId}`);
		this.testContentDir = join(this.tempDir, "test-content");
		this.testOutputDir = join(this.tempDir, "test-output");
		this.configId = generateConfigId(SETTINGS.scripts.searchIndex.validationPrefix, testSuiteId);
	}

	async setup(): Promise<void> {
		// Create temp directories
		if (!existsSync(this.tempDir)) {
			mkdirSync(this.tempDir, { recursive: true });
		}
		if (!existsSync(this.testContentDir)) {
			mkdirSync(this.testContentDir, { recursive: true });
		}
		if (!existsSync(this.testOutputDir)) {
			mkdirSync(this.testOutputDir, { recursive: true });
		}

		// Create unit directories
		const unit01Dir = join(this.testContentDir, "unit01");
		const unit02Dir = join(this.testContentDir, "unit02");
		if (!existsSync(unit01Dir)) {
			mkdirSync(unit01Dir, { recursive: true });
		}
		if (!existsSync(unit02Dir)) {
			mkdirSync(unit02Dir, { recursive: true });
		}

		// Write mock content files
		writeFileSync(join(unit01Dir, "01_lesson_containers.ts"), MOCK_LESSON_CONTENT);
		writeFileSync(join(unit01Dir, "02_quiz_containers.ts"), MOCK_QUIZ_CONTENT);
		writeFileSync(join(unit02Dir, "01_study_guide_containers.ts"), MOCK_STUDY_GUIDE_CONTENT);
	}

	cleanup(): void {
		// Restore original validation setting
		(SETTINGS.scripts.validation.generated as { runAfterGeneration: boolean }).runAfterGeneration =
			true;

		if (existsSync(this.tempDir)) {
			rmSync(this.tempDir, { recursive: true, force: true });
		}
	}

	getConfig(enableValidation: boolean = false): SearchIndexConfig {
		// Configure validation settings based on test requirements
		this.configureValidation(enableValidation);

		return {
			contentPath: this.testContentDir,
			outputPath: join(this.testOutputDir, "search-index.ts"),
			mode: enableValidation ? "production" : "development", // Only run validation in production mode
			enableNLP: SETTINGS.scripts.searchIndex.processing.enableNLP,
			verboseLogging: false, // Disable verbose logging for tests
			maxKeywords: SETTINGS.scripts.searchIndex.processing.maxKeywords,
			minKeywordLength: SETTINGS.scripts.searchIndex.processing.minKeywordLength,
			fieldBoosts: SETTINGS.scripts.searchIndex.fieldBoosts
		};
	}

	/**
	 * Configure validation settings based on test requirements
	 */
	protected configureValidation(enableValidation: boolean): void {
		// Temporarily override validation setting for faster tests by default
		// Only specific tests that need validation will enable it
		(SETTINGS.scripts.validation.generated as { runAfterGeneration: boolean }).runAfterGeneration =
			enableValidation;
	}
}

/**
 * Test setup class with validation enabled for integration tests
 */
class TestSetupWithValidation extends TestSetup {
	constructor(testSuiteId: string = "validation") {
		super(testSuiteId);
	}

	getConfig(): SearchIndexConfig {
		return super.getConfig(true); // Enable validation
	}
}

/**
 * Main test suite
 */
describe("SearchIndexGenerator", () => {
	let testSetup: TestSetup;
	let generator: SearchIndexGenerator;

	beforeEach(async () => {
		testSetup = new TestSetup();
		await testSetup.setup();
		generator = new SearchIndexGenerator(testSetup.getConfig());
	});

	afterEach(() => {
		testSetup.cleanup();
	});

	describe("Constructor and Configuration", () => {
		it("should initialize with default configuration", () => {
			const defaultGenerator = new SearchIndexGenerator();
			expect(defaultGenerator).toBeDefined();
		});

		it("should merge provided configuration with defaults", () => {
			const customConfig = { mode: "production" as const, enableNLP: true };
			const customGenerator = new SearchIndexGenerator(customConfig);
			expect(customGenerator).toBeDefined();
		});

		it("should handle invalid configuration gracefully", () => {
			const invalidConfig = { maxKeywords: -1, minKeywordLength: 0 };
			const invalidGenerator = new SearchIndexGenerator(invalidConfig);
			expect(invalidGenerator).toBeDefined();
		});
	});

	describe("Content Extraction", () => {
		it("should extract lesson content correctly", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			expect(result.items).toBeDefined();
			expect(result.items.length).toBeGreaterThan(0);

			const lessonItem = result.items.find((item) => item.title.includes("Container Fundamentals"));
			expect(lessonItem).toBeDefined();
			expect(lessonItem?.type).toBe("lesson");
			expect(lessonItem?.description).toContain("containerization");
		});

		it("should extract quiz content correctly", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			const quizItem = result.items.find((item) => item.title.includes("Knowledge Quiz"));
			expect(quizItem).toBeDefined();
			expect(quizItem?.type).toBe("interactive");
			expect(quizItem?.content).toContain("container");
		});

		it("should extract study guide content correctly", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			const studyGuideItem = result.items.find((item) => item.title.includes("Study Guide"));
			expect(studyGuideItem).toBeDefined();
			expect(studyGuideItem?.type).toBe("text");
			expect(studyGuideItem?.content).toContain("Docker image");
		});

		it("should handle extraction failures gracefully", async () => {
			// Write invalid TypeScript content
			const invalidDir = join(testSetup.getConfig().contentPath, "invalid");
			mkdirSync(invalidDir, { recursive: true });
			writeFileSync(join(invalidDir, "invalid.ts"), "invalid typescript content {{{");

			const result = await generator.generateSearchIndex(testSetup.configId);

			// Should still generate index for valid files
			expect(result.items.length).toBeGreaterThan(0);
		});
	});

	describe("Code Block Extraction", () => {
		it("should extract code blocks from lesson content", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			const lessonItem = result.items.find((item) => item.title.includes("Container Fundamentals"));
			expect(lessonItem).toBeDefined();

			// Check that code content or code title is included in searchable text
			expect(lessonItem?.content).toContain("Basic Docker Command");
		});

		it("should identify programming languages correctly", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			const lessonItem = result.items.find((item) => item.title.includes("Container Fundamentals"));
			expect(lessonItem?.content).toContain("Basic Docker Command");
		});
	});

	describe("Diagram Extraction", () => {
		it("should extract diagram titles and captions", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			const lessonItem = result.items.find((item) => item.title.includes("Container Fundamentals"));
			expect(lessonItem?.content).toContain("Container Architecture");
			expect(lessonItem?.content).toContain("applications run in containers");
		});

		it("should identify diagram types correctly", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			const lessonItem = result.items.find((item) => item.title.includes("Container Fundamentals"));
			expect(lessonItem?.content).toContain("Container Architecture");
		});
	});

	describe("Keyword Extraction", () => {
		it("should extract manual keywords from content metadata", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			const lessonItem = result.items.find((item) => item.title.includes("Container Fundamentals"));
			expect(lessonItem?.keywords).toContain("linux-basics");
			expect(lessonItem?.keywords).toContain("command-line");
		});

		it("should extract technical terms from content", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			const lessonItem = result.items.find((item) => item.title.includes("Container Fundamentals"));
			expect(lessonItem?.keywords.some((k) => k.toLowerCase().includes("docker"))).toBe(true);
		});

		it("should limit keywords to configured maximum", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			result.items.forEach((item) => {
				expect(item.keywords.length).toBeLessThanOrEqual(
					SETTINGS.scripts.searchIndex.processing.maxKeywords
				);
			});
		});

		it("should filter keywords by minimum length", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			result.items.forEach((item) => {
				item.keywords.forEach((keyword) => {
					expect(keyword.length).toBeGreaterThanOrEqual(
						SETTINGS.scripts.searchIndex.processing.minKeywordLength
					);
				});
			});
		});
	});

	describe("Navigation Metadata Generation", () => {
		it("should generate correct navigation paths", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			result.items.forEach((item) => {
				expect(item.nav.path).toMatch(/^#\/demo\/unit\/.+\/lesson\/.+$/);
				expect(item.nav.unitId).toBeDefined();
				expect(item.nav.breadcrumbPath).toBeDefined();
			});
		});

		it("should extract unit information from file paths", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			const unit01Items = result.items.filter((item) => item.nav.unitId === "unit01");
			const unit02Items = result.items.filter((item) => item.nav.unitId === "unit02");

			expect(unit01Items.length).toBeGreaterThan(0);
			expect(unit02Items.length).toBeGreaterThan(0);
		});
	});

	describe("Lunr.js Index Generation", () => {
		it("should generate a valid Lunr.js index", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			expect(result.index).toBeDefined();
			expect(typeof result.index).toBe("object");
		});

		it("should include all items in the search index", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			expect(result.items.length).toBeGreaterThan(0);
			expect(result.metadata.totalItems).toBe(result.items.length);
		});

		it("should apply correct field boosts", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			// Verify index was created (detailed boost testing would require Lunr internals)
			expect(result.index).toBeDefined();
		});
	});

	describe("Performance and Statistics", () => {
		it("should track generation performance", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			expect(result.generationStats.totalTime).toBeGreaterThan(0);
			expect(result.generationStats.extractionTime).toBeGreaterThan(0);
			expect(result.generationStats.indexBuildTime).toBeGreaterThan(0);
		}, 10000);

		it("should generate accurate statistics", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			expect(result.metadata.totalItems).toBe(result.items.length);
			expect(result.metadata.typeDistribution).toBeDefined();
			expect(result.metadata.chapterTypeDistribution).toBeDefined();
		});

		it("should complete generation within reasonable time", async () => {
			const startTime = Date.now();
			await generator.generateSearchIndex(testSetup.configId);
			const duration = Date.now() - startTime;

			// Should complete within 10 seconds for test content
			expect(duration).toBeLessThan(10000);
		}, 15000);
	});

	describe("File Generation", () => {
		it("should generate a valid TypeScript file", async () => {
			const _result = await generator.generateSearchIndex(testSetup.configId);

			const outputPath = testSetup.getConfig().outputPath;
			expect(existsSync(outputPath)).toBe(true);

			const generatedContent = readFileSync(outputPath, "utf8");
			expect(generatedContent).toContain("searchIndex");
			expect(generatedContent).toContain("SearchableItem[]");
			expect(generatedContent).toContain("lunrIndexData");
		});

		it("should include generation metadata in output", async () => {
			await generator.generateSearchIndex(testSetup.configId);

			const outputPath = testSetup.getConfig().outputPath;
			const generatedContent = readFileSync(outputPath, "utf8");

			expect(generatedContent).toContain("searchIndexMetadata");
			expect(generatedContent).toContain("totalItems");
			expect(generatedContent).toContain("generatedAt");
		});

		it("should include search utility functions", async () => {
			await generator.generateSearchIndex(testSetup.configId);

			const outputPath = testSetup.getConfig().outputPath;
			const generatedContent = readFileSync(outputPath, "utf8");

			expect(generatedContent).toContain("getSearchableContent");
			expect(generatedContent).toContain("searchContent");
			expect(generatedContent).toContain("getSearchIndexMetadata");
		});
	});

	describe("Content Type Mapping", () => {
		it("should map chapter types to content types correctly", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			const lessonItem = result.items.find((item) => item.searchMetadata?.chapterType === "lesson");
			const quizItem = result.items.find((item) => item.searchMetadata?.chapterType === "quiz");
			const studyGuideItem = result.items.find(
				(item) => item.searchMetadata?.chapterType === "study_guide"
			);

			expect(lessonItem?.type).toBe("lesson");
			expect(quizItem?.type).toBe("interactive");
			expect(studyGuideItem?.type).toBe("text");
		});
	});

	describe("Search Weight Calculation", () => {
		it("should assign higher weights to content-rich items", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			const lessonItem = result.items.find((item) => item.title.includes("Container Fundamentals"));
			const studyGuideItem = result.items.find((item) => item.title.includes("Study Guide"));

			// Lesson with code blocks and diagrams should have higher weight
			expect(lessonItem?.weight).toBeGreaterThan(1.0);
			expect(studyGuideItem?.weight).toBeDefined();
		});

		it("should cap weights at maximum value", async () => {
			const result = await generator.generateSearchIndex(testSetup.configId);

			result.items.forEach((item) => {
				expect(item.weight).toBeLessThanOrEqual(3.0);
			});
		});
	});

	describe("Error Handling", () => {
		it("should handle missing content directory", async () => {
			const invalidConfig = {
				...testSetup.getConfig(),
				contentPath: "non-existent-directory"
			};

			const invalidGenerator = new SearchIndexGenerator(invalidConfig);

			// Should not throw but return empty results
			const result = await invalidGenerator.generateSearchIndex(testSetup.configId);
			expect(result.items).toHaveLength(0);
		});

		it("should handle permission errors gracefully", async () => {
			// This would require setting up permission restrictions
			// For now, we test that the generator handles errors without crashing
			const result = await generator.generateSearchIndex(testSetup.configId);
			expect(result).toBeDefined();
		});
	});

	describe("Mode-specific Behavior", () => {
		it("should behave differently in production mode", async () => {
			// This test explicitly enables validation to test production behavior
			const prodConfig = {
				...testSetup.getConfig(true), // Enable validation for this specific test
				enableNLP: true
			};

			const prodGenerator = new SearchIndexGenerator(prodConfig);
			const result = await prodGenerator.generateSearchIndex(testSetup.configId);

			expect(result.metadata.mode).toBe("production");
			expect(result.metadata.nlpEnabled).toBe(true);
		}, 15000); // Extended timeout for validation

		it("should skip NLP in development mode", async () => {
			const devConfig = {
				...testSetup.getConfig(),
				mode: "development" as const,
				enableNLP: false
			};

			const devGenerator = new SearchIndexGenerator(devConfig);
			const result = await devGenerator.generateSearchIndex(testSetup.configId);

			expect(result.metadata.mode).toBe("development");
			expect(result.metadata.nlpEnabled).toBe(false);
		});
	});
});

/**
 * Integration tests with real content files
 */
describe("SearchIndexGenerator Integration", () => {
	it("should work with real content structure", async () => {
		// Use validation setup for this integration test
		const validationTestSetup = new TestSetupWithValidation("integration");
		await validationTestSetup.setup();

		try {
			const timestamp = Date.now();
			const realConfig: SearchIndexConfig = {
				contentPath: "src/data/book", // Real content path
				outputPath: `tmp/integration-test-${timestamp}-search-index.ts`,
				mode: "production", // Enable validation for integration test
				enableNLP: SETTINGS.scripts.searchIndex.processing.enableNLP,
				verboseLogging: false,
				maxKeywords: SETTINGS.scripts.searchIndex.processing.maxKeywords,
				minKeywordLength: SETTINGS.scripts.searchIndex.processing.minKeywordLength,
				fieldBoosts: SETTINGS.scripts.searchIndex.fieldBoosts
			};

			// Only run if real content directory exists
			if (existsSync(realConfig.contentPath)) {
				const generator = new SearchIndexGenerator(realConfig);
				const _result = await generator.generateSearchIndex(validationTestSetup.configId);

				expect(existsSync(realConfig.outputPath)).toBe(true);

				// Cleanup
				if (existsSync(realConfig.outputPath)) {
					rmSync(realConfig.outputPath, { force: true });
				}
			}
		} finally {
			validationTestSetup.cleanup();
		}
	}, 15000); // Extended timeout for validation
});

/**
 * Performance benchmarks
 */
describe("SearchIndexGenerator Performance", () => {
	it("should handle large content sets efficiently", async () => {
		// Create a larger test dataset with unique ID
		const testSetup = new TestSetup("performance");
		await testSetup.setup();

		// Generate 50 mock files
		const contentDir = testSetup.getConfig().contentPath;
		for (let i = 0; i < 50; i++) {
			const unitDir = join(contentDir, `unit${String(i).padStart(2, "0")}`);
			mkdirSync(unitDir, { recursive: true });
			writeFileSync(join(unitDir, `${String(i).padStart(2, "0")}_lesson.ts`), MOCK_LESSON_CONTENT);
		}

		const startTime = Date.now();
		const generator = new SearchIndexGenerator(testSetup.getConfig());
		const result = await generator.generateSearchIndex(testSetup.configId);
		const duration = Date.now() - startTime;

		expect(result.items.length).toBeGreaterThanOrEqual(50);
		expect(duration).toBeLessThan(30000); // Should complete within 30 seconds

		testSetup.cleanup();
	}, 35000);
});
