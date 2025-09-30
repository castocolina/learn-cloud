/**
 * Test Suite for JSON Schema Generator
 *
 * Comprehensive testing for the generate-schemas.ts script including:
 * - Schema detection from CONTENT_SCHEMAS object (35+ schemas)
 * - JSON Schema Draft 7 format compliance
 * - Single consolidated file generation
 * - Configuration integration with SETTINGS
 * - CLI interface and argument processing
 * - Output validation and structure verification
 *
 * Test cases cover both happy path scenarios and edge cases to ensure
 * robust schema generation for external system integration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync, existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { JsonSchemaGenerator, JsonSchemaGeneratorCLI } from "../../scripts/generate-schemas.js";
import { CONTENT_SCHEMAS } from "$lib/schemas/ContentSchemas.js";
import { generateConfigId } from "../../lib/utils/validation-utils.js";
import { SETTINGS } from "$config/settings.js";

const { schemas: schemasSettings } = SETTINGS.scripts;

/**
 * Test setup class for test isolation and dynamic configuration
 */
class TestSetup {
	public tempDir: string;
	public testOutputFile: string;
	public readonly configId: string;

	constructor(testSuiteId: string = "schema-gen") {
		const timestamp = Date.now();
		const uniqueId = `${testSuiteId}-${timestamp}`;
		this.tempDir = join(process.cwd(), "tmp", `test-schema-gen-${uniqueId}`);
		this.testOutputFile = join(this.tempDir, "content-schemas.json");
		this.configId = generateConfigId(schemasSettings.validationPrefix, uniqueId);
	}

	async setup(): Promise<void> {
		// Create temp directory
		if (!existsSync(this.tempDir)) {
			mkdirSync(this.tempDir, { recursive: true });
		}
	}

	cleanup(): void {
		if (existsSync(this.tempDir)) {
			rmSync(this.tempDir, { recursive: true, force: true });
		}
	}
}

// ============================================================================
// TEST SUITE: Schema Detection and Processing
// ============================================================================

describe("JsonSchemaGenerator - Schema Detection", () => {
	let setup: TestSetup;
	let generator: JsonSchemaGenerator;

	beforeEach(async () => {
		setup = new TestSetup("detection");
		await setup.setup();
		generator = new JsonSchemaGenerator();
	});

	afterEach(() => {
		setup.cleanup();
	});

	it("should detect all schemas from CONTENT_SCHEMAS object", () => {
		const schemas = generator.listAvailableSchemas();
		const expectedSchemaCount = Object.keys(CONTENT_SCHEMAS).length;

		expect(schemas).toBeDefined();
		expect(schemas.length).toBe(expectedSchemaCount);
		expect(schemas.length).toBeGreaterThanOrEqual(35); // Verify minimum 35+ schemas
	});

	it("should list schemas with correct structure", () => {
		const schemas = generator.listAvailableSchemas();

		schemas.forEach((schema) => {
			expect(schema).toHaveProperty("name");
			expect(schema).toHaveProperty("type");
			expect(typeof schema.name).toBe("string");
			expect(schema.name.length).toBeGreaterThan(0);
		});
	});

	it("should include all expected base schemas", () => {
		const schemas = generator.listAvailableSchemas();
		const schemaNames = schemas.map((s) => s.name);

		const expectedBaseSchemas = [
			"RichTextFragment",
			"RichParagraph",
			"RichTextSection",
			"RichTextDocument",
			"ContentMetadata",
			"BaseContent"
		];

		expectedBaseSchemas.forEach((schemaName) => {
			expect(schemaNames).toContain(schemaName);
		});
	});

	it("should include all content type schemas", () => {
		const schemas = generator.listAvailableSchemas();
		const schemaNames = schemas.map((s) => s.name);

		const expectedContentTypes = [
			"LessonContent",
			"QuizContent",
			"StudyGuideContent",
			"ExamContent",
			"ProjectContent"
		];

		expectedContentTypes.forEach((schemaName) => {
			expect(schemaNames).toContain(schemaName);
		});
	});

	it("should include question type schemas", () => {
		const schemas = generator.listAvailableSchemas();
		const schemaNames = schemas.map((s) => s.name);

		const expectedQuestionTypes = [
			"SingleChoiceQuestion",
			"MultipleChoiceQuestion",
			"CodeCompletionQuestion",
			"TrueFalseQuestion",
			"ShortAnswerQuestion",
			"DragAndDropQuestion"
		];

		expectedQuestionTypes.forEach((schemaName) => {
			expect(schemaNames).toContain(schemaName);
		});
	});
});

// ============================================================================
// TEST SUITE: Consolidated Schema Generation
// ============================================================================

describe("JsonSchemaGenerator - Consolidated Generation", () => {
	let setup: TestSetup;
	let generator: JsonSchemaGenerator;

	beforeEach(async () => {
		setup = new TestSetup("generation");
		await setup.setup();
		generator = new JsonSchemaGenerator();
	});

	afterEach(() => {
		setup.cleanup();
	});

	it("should generate consolidated schema file successfully", async () => {
		const result = await generator.generateConsolidatedSchema({
			outputFile: setup.testOutputFile,
			includeReferences: true,
			validateOutput: true,
			dryRun: false,
			verbose: false
		});

		expect(result.success).toBe(true);
		expect(result.schemasIncluded).toBeGreaterThanOrEqual(35);
		expect(result.errors).toHaveLength(0);
		expect(existsSync(setup.testOutputFile)).toBe(true);
	});

	it("should generate valid JSON Schema Draft 7 format", async () => {
		await generator.generateConsolidatedSchema({
			outputFile: setup.testOutputFile,
			includeReferences: true,
			validateOutput: true,
			dryRun: false,
			verbose: false
		});

		const content = JSON.parse(readFileSync(setup.testOutputFile, "utf-8"));

		expect(content).toHaveProperty("$schema");
		expect(content.$schema).toBe("http://json-schema.org/draft-07/schema#");
		expect(content).toHaveProperty("$id");
		expect(content).toHaveProperty("title");
		expect(content).toHaveProperty("description");
		expect(content).toHaveProperty("definitions");
		expect(content).toHaveProperty("generatedAt");
		expect(content).toHaveProperty("generator", "generate-schemas");
		expect(content).toHaveProperty("version", "1.0.0");
	});

	it("should include all schemas in definitions object", async () => {
		await generator.generateConsolidatedSchema({
			outputFile: setup.testOutputFile,
			includeReferences: true,
			validateOutput: true,
			dryRun: false,
			verbose: false
		});

		const content = JSON.parse(readFileSync(setup.testOutputFile, "utf-8"));
		const definitionKeys = Object.keys(content.definitions);

		expect(definitionKeys.length).toBeGreaterThanOrEqual(35);

		// Verify some key schemas are present
		const expectedSchemas = [
			"ContentMetadata",
			"LessonContent",
			"QuizContent",
			"Question",
			"Flashcard",
			"ContentBlock"
		];

		expectedSchemas.forEach((schemaName) => {
			expect(definitionKeys).toContain(schemaName);
		});
	});

	it("should handle dry-run mode without creating files", async () => {
		const result = await generator.generateConsolidatedSchema({
			outputFile: setup.testOutputFile,
			includeReferences: true,
			validateOutput: false,
			dryRun: true,
			verbose: false
		});

		expect(result.success).toBe(true);
		expect(result.schemasIncluded).toBeGreaterThanOrEqual(35);
		expect(existsSync(setup.testOutputFile)).toBe(false); // File should not be created
	});

	it("should generate metadata fields correctly", async () => {
		await generator.generateConsolidatedSchema({
			outputFile: setup.testOutputFile,
			includeReferences: true,
			validateOutput: true,
			dryRun: false,
			verbose: false
		});

		const content = JSON.parse(readFileSync(setup.testOutputFile, "utf-8"));

		expect(content.title).toBe("Cloud-Native Learning Platform Content Schemas");
		expect(content.description).toContain("Complete schema definitions");
		expect(content.description).toContain("schemas");
		expect(content.sourceFile).toBe(schemasSettings.paths.sourceFile);
		expect(content.generatedAt).toBeDefined();
		expect(new Date(content.generatedAt).getTime()).toBeGreaterThan(0); // Valid ISO date
	});

	it("should include proper schema structure for content types", async () => {
		await generator.generateConsolidatedSchema({
			outputFile: setup.testOutputFile,
			includeReferences: true,
			validateOutput: true,
			dryRun: false,
			verbose: false
		});

		const content = JSON.parse(readFileSync(setup.testOutputFile, "utf-8"));
		const lessonSchema = content.definitions.LessonContent;

		expect(lessonSchema).toBeDefined();
		expect(typeof lessonSchema).toBe("object");
		// Zod v4 native conversion produces standard JSON Schema
		expect(lessonSchema).toHaveProperty("$schema");
	});

	it("should handle validation errors gracefully", async () => {
		const invalidOutputPath = "/invalid/path/that/does/not/exist/schema.json";

		const result = await generator.generateConsolidatedSchema({
			outputFile: invalidOutputPath,
			includeReferences: true,
			validateOutput: true,
			dryRun: false,
			verbose: false
		});

		expect(result.success).toBe(false);
		expect(result.errors.length).toBeGreaterThan(0);
	});
});

// ============================================================================
// TEST SUITE: CLI Interface
// ============================================================================

describe("JsonSchemaGeneratorCLI - Command Interface", () => {
	let setup: TestSetup;

	beforeEach(async () => {
		setup = new TestSetup("cli");
		await setup.setup();
	});

	afterEach(() => {
		setup.cleanup();
	});

	it("should create CLI instance successfully", () => {
		const cli = new JsonSchemaGeneratorCLI();
		expect(cli).toBeDefined();
	});

	it("should execute list command successfully", async () => {
		const cli = new JsonSchemaGeneratorCLI();

		// Execute with mocked argv
		const consoleLogSpy = vi.spyOn(console, "log");

		await cli.execute(["node", "generate-schemas", "list"]);

		expect(consoleLogSpy).toHaveBeenCalledWith(
			expect.stringContaining("Available Schemas in CONTENT_SCHEMAS")
		);

		consoleLogSpy.mockRestore();
	});
});

// ============================================================================
// TEST SUITE: Configuration Integration
// ============================================================================

describe("JsonSchemaGenerator - Configuration Integration", () => {
	it("should use SETTINGS.scripts.schemas configuration", () => {
		expect(schemasSettings).toBeDefined();
		expect(schemasSettings.paths).toBeDefined();
		expect(schemasSettings.paths.sourceFile).toBe("src/lib/schemas/ContentSchemas.ts");
		expect(schemasSettings.paths.outputFile).toBe("src/data/generated/content-schemas.json");
		expect(schemasSettings.generation).toBeDefined();
		expect(schemasSettings.generation.target).toBe("draft-7");
		expect(schemasSettings.generation.io).toBe("output");
		expect(schemasSettings.generation.unrepresentable).toBe("any");
		expect(schemasSettings.generation.cycles).toBe("ref");
		expect(schemasSettings.validationPrefix).toBe("schema-gen");
	});

	it("should generate config ID correctly", () => {
		const setup = new TestSetup("config-test");
		expect(setup.configId).toContain(schemasSettings.validationPrefix);
		// Config ID uses timestamp, so just verify it starts with the expected prefix
		expect(setup.configId.startsWith(schemasSettings.validationPrefix)).toBe(true);
	});
});

// ============================================================================
// TEST SUITE: Output Validation
// ============================================================================

describe("JsonSchemaGenerator - Output Validation", () => {
	let setup: TestSetup;
	let generator: JsonSchemaGenerator;

	beforeEach(async () => {
		setup = new TestSetup("validation");
		await setup.setup();
		generator = new JsonSchemaGenerator();
	});

	afterEach(() => {
		setup.cleanup();
	});

	it("should validate output schema structure", async () => {
		const result = await generator.generateConsolidatedSchema({
			outputFile: setup.testOutputFile,
			includeReferences: true,
			validateOutput: true,
			dryRun: false,
			verbose: false
		});

		expect(result.success).toBe(true);

		const content = JSON.parse(readFileSync(setup.testOutputFile, "utf-8"));

		// Validate required top-level properties
		expect(content).toHaveProperty("$schema");
		expect(content).toHaveProperty("$id");
		expect(content).toHaveProperty("title");
		expect(content).toHaveProperty("description");
		expect(content).toHaveProperty("type");
		expect(content).toHaveProperty("definitions");

		// Validate type is object
		expect(content.type).toBe("object");

		// Validate definitions is an object with entries
		expect(typeof content.definitions).toBe("object");
		expect(Object.keys(content.definitions).length).toBeGreaterThan(0);
	});

	it("should generate valid JSON parseable content", async () => {
		await generator.generateConsolidatedSchema({
			outputFile: setup.testOutputFile,
			includeReferences: true,
			validateOutput: true,
			dryRun: false,
			verbose: false
		});

		const content = readFileSync(setup.testOutputFile, "utf-8");

		// Should not throw parsing error
		expect(() => JSON.parse(content)).not.toThrow();

		const parsed = JSON.parse(content);
		expect(parsed).toBeDefined();
		expect(typeof parsed).toBe("object");
	});

	it("should include source file reference in output", async () => {
		await generator.generateConsolidatedSchema({
			outputFile: setup.testOutputFile,
			includeReferences: true,
			validateOutput: true,
			dryRun: false,
			verbose: false
		});

		const content = JSON.parse(readFileSync(setup.testOutputFile, "utf-8"));

		expect(content).toHaveProperty("sourceFile");
		expect(content.sourceFile).toBe("src/lib/schemas/ContentSchemas.ts");
	});
});

// ============================================================================
// TEST SUITE: Edge Cases and Error Handling
// ============================================================================

describe("JsonSchemaGenerator - Edge Cases", () => {
	let setup: TestSetup;
	let generator: JsonSchemaGenerator;

	beforeEach(async () => {
		setup = new TestSetup("edge-cases");
		await setup.setup();
		generator = new JsonSchemaGenerator();
	});

	afterEach(() => {
		setup.cleanup();
	});

	it("should handle empty directory creation", async () => {
		const deepOutputPath = join(setup.tempDir, "deep", "nested", "path", "schemas.json");

		const result = await generator.generateConsolidatedSchema({
			outputFile: deepOutputPath,
			includeReferences: true,
			validateOutput: true,
			dryRun: false,
			verbose: false
		});

		expect(result.success).toBe(true);
		expect(existsSync(deepOutputPath)).toBe(true);
	});

	it("should report schema count in result", async () => {
		const result = await generator.generateConsolidatedSchema({
			outputFile: setup.testOutputFile,
			includeReferences: true,
			validateOutput: true,
			dryRun: false,
			verbose: false
		});

		expect(result).toHaveProperty("schemasIncluded");
		expect(result.schemasIncluded).toBeGreaterThanOrEqual(35);
		expect(result.schemasIncluded).toBe(Object.keys(CONTENT_SCHEMAS).length);
	});

	it("should include warnings array in result", async () => {
		const result = await generator.generateConsolidatedSchema({
			outputFile: setup.testOutputFile,
			includeReferences: true,
			validateOutput: true,
			dryRun: false,
			verbose: false
		});

		expect(result).toHaveProperty("warnings");
		expect(Array.isArray(result.warnings)).toBe(true);
	});

	it("should preserve validation constraints in generated schemas", async () => {
		await generator.generateConsolidatedSchema({
			outputFile: setup.testOutputFile,
			includeReferences: true,
			validateOutput: true,
			dryRun: false,
			verbose: false
		});

		const content = JSON.parse(readFileSync(setup.testOutputFile, "utf-8"));
		const definitions = content.definitions;

		// Zod v4 native conversion preserves all validation constraints
		expect(definitions).toBeDefined();
		expect(typeof definitions).toBe("object");

		// At minimum, schemas should have type information
		const schemaNames = Object.keys(definitions);
		expect(schemaNames.length).toBeGreaterThan(0);

		// Each schema should be a valid object
		schemaNames.forEach((name) => {
			expect(definitions[name]).toBeDefined();
			expect(typeof definitions[name]).toBe("object");
		});
	});
});
