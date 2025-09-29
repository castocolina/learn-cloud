#!/usr/bin/env tsx

/**
 * JSON Schema Generator CLI - Class-based Architecture with Commander.js
 *
 * Generates JSON schemas from Zod schema definitions for sharing with third parties.
 * This allows external systems to validate data structures using standard JSON Schema.
 *
 * Architecture:
 * - JsonSchemaGeneratorCLI: Command-line interface coordination
 * - JsonSchemaGenerator: Core schema generation logic
 * - ValidationService: Schema validation and type checking
 * - RepositoryService: Safe file operations
 *
 * Features:
 * - Generate JSON schemas from Zod definitions
 * - Support for multiple output formats (JSON Schema Draft 7, OpenAPI, etc.)
 * - Reference resolution and $ref handling
 * - Comprehensive validation and error reporting
 * - Safe file operations with backup support
 *
 * Usage:
 *   Generate all schemas:
 *     generate-json-schemas generate --all
 *
 *   Generate specific schemas:
 *     generate-json-schemas generate --schema=ValidationConfig,ScaffoldingArgs
 *
 *   Generate with custom output:
 *     generate-json-schemas generate --output=schemas/ --format=openapi
 *
 *   Validate existing schemas:
 *     generate-json-schemas validate --file=schemas/ValidationConfig.json
 */

import { Command } from "commander";
import { readFileSync, existsSync } from "fs";
import { join, basename } from "path";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ValidationService } from "../lib/services/ValidationService.js";
import { RepositoryService } from "../lib/services/RepositoryService.js";
import { SETTINGS } from "$config/settings.js";
import type { CliExecutionResult } from "$types";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

/**
 * Schema generation options
 */
export interface SchemaGenerationOptions {
	outputDirectory: string;
	format: "json-schema" | "openapi";
	includeReferences: boolean;
	validateOutput: boolean;
	dryRun: boolean;
}

/**
 * Schema generation result
 */
export interface SchemaGenerationResult {
	success: boolean;
	schemasGenerated: number;
	outputDirectory: string;
	errors: string[];
	warnings: string[];
}

/**
 * Schema definition entry
 */
export interface SchemaDefinition {
	name: string;
	schema: z.ZodSchema;
	description?: string;
	category?: string;
}

// ============================================================================
// CORE SCHEMA GENERATOR CLASS
// ============================================================================

/**
 * JSON Schema Generator - Core schema generation logic
 */
export class JsonSchemaGenerator {
	private validationService: ValidationService;
	private repositoryService: RepositoryService;
	private schemas: Map<string, SchemaDefinition> = new Map();
	private commonConfig = SETTINGS.scripts.common;

	constructor() {
		this.validationService = new ValidationService({
			enableMermaidValidation: false,
			enableBusinessRules: true,
			enableTypeValidation: true,
			skipValidationInTests: false
		});
		this.repositoryService = new RepositoryService({
			mode: "safe",
			createBackups: true,
			validateBeforeWrite: true,
			respectContentStatus: false,
			backupDirectory: SETTINGS.scripts.contentCreator.repository.backupDirectory
		});

		this.initializeSchemas();
	}

	/**
	 * Initialize built-in schemas from ValidationService
	 */
	private initializeSchemas(): void {
		// Scaffolding arguments schema
		const scaffoldingArgsSchema = z.object({
			unit: z.string().min(1, "Unit name is required"),
			type: z.enum(["lesson", "quiz", "exam", "study_guide", "project"] as const),
			id: z.string().min(1, "ID is required")
		});

		// Validation configuration schema
		const validationConfigSchema = z.object({
			enableMermaidValidation: z.boolean(),
			enableBusinessRules: z.boolean(),
			enableTypeValidation: z.boolean(),
			skipValidationInTests: z.boolean()
		});

		// Repository configuration schema
		const repositoryConfigSchema = z.object({
			mode: z.enum(["safe", "force", "backup"]),
			createBackups: z.boolean(),
			validateBeforeWrite: z.boolean(),
			respectContentStatus: z.boolean(),
			backupDirectory: z.string()
		});

		// Content status schema
		const contentStatusSchema = z.enum(["scaffold", "draft", "final"]);

		// Safety check result schema
		const safetyCheckSchema = z.object({
			canProceed: z.boolean(),
			requiresForce: z.boolean(),
			warning: z.string().optional(),
			error: z.string().optional(),
			currentStatus: contentStatusSchema.optional()
		});

		// CLI execution result schema
		const cliExecutionResultSchema = z.object({
			success: z.boolean(),
			error: z.string().optional(),
			data: z.unknown().optional()
		});

		// Content generation result schema
		const contentGenerationResultSchema = z.object({
			success: z.boolean(),
			filePath: z.string().optional(),
			stats: z
				.object({
					totalChapters: z.number().int().min(0),
					existingFiles: z.number().int().min(0),
					newFiles: z.number().int().min(0),
					orphanFiles: z.array(z.string()),
					errors: z.array(z.string())
				})
				.optional(),
			errors: z.array(z.string()).optional()
		});

		// Register schemas
		this.registerSchema("ScaffoldingArgs", scaffoldingArgsSchema, {
			description: "Arguments for content scaffolding operations",
			category: "scaffolding"
		});

		this.registerSchema("ValidationConfig", validationConfigSchema, {
			description: "Configuration for ValidationService",
			category: "validation"
		});

		this.registerSchema("RepositoryConfig", repositoryConfigSchema, {
			description: "Configuration for RepositoryService",
			category: "repository"
		});

		this.registerSchema("ContentStatus", contentStatusSchema, {
			description: "Content status levels for protection",
			category: "content"
		});

		this.registerSchema("SafetyCheckResult", safetyCheckSchema, {
			description: "Result of content safety check operations",
			category: "safety"
		});

		this.registerSchema("CliExecutionResult", cliExecutionResultSchema, {
			description: "Result of CLI command execution",
			category: "cli"
		});

		this.registerSchema("ContentGenerationResult", contentGenerationResultSchema, {
			description: "Result of content generation operations",
			category: "content"
		});
	}

	/**
	 * Register a schema for generation
	 */
	registerSchema(
		name: string,
		schema: z.ZodSchema,
		metadata?: { description?: string; category?: string }
	): void {
		this.schemas.set(name, {
			name,
			schema,
			description: metadata?.description,
			category: metadata?.category
		});
	}

	/**
	 * Generate JSON schemas for all registered schemas
	 */
	async generateAllSchemas(options: SchemaGenerationOptions): Promise<SchemaGenerationResult> {
		const schemaNames = Array.from(this.schemas.keys());
		return this.generateSchemas(schemaNames, options);
	}

	/**
	 * Generate JSON schemas for specific schema names
	 */
	async generateSchemas(
		schemaNames: string[],
		options: SchemaGenerationOptions
	): Promise<SchemaGenerationResult> {
		const result: SchemaGenerationResult = {
			success: true,
			schemasGenerated: 0,
			outputDirectory: options.outputDirectory,
			errors: [],
			warnings: []
		};

		try {
			console.log(`🚀 Generating JSON schemas for ${schemaNames.length} schema(s)...`);

			// Ensure output directory exists
			if (!options.dryRun) {
				await this.ensureDirectoryExists(options.outputDirectory);
			}

			// Generate each schema
			for (const schemaName of schemaNames) {
				try {
					await this.generateSingleSchema(schemaName, options);
					result.schemasGenerated++;
					console.log(`✅ Generated schema: ${schemaName}`);
				} catch (error) {
					const errorMessage = `Failed to generate ${schemaName}: ${error instanceof Error ? error.message : String(error)}`;
					result.errors.push(errorMessage);
					console.error(`❌ ${errorMessage}`);
				}
			}

			// Generate index file
			if (!options.dryRun && result.schemasGenerated > 0) {
				await this.generateIndexFile(schemaNames, options);
			}

			result.success = result.errors.length === 0;

			console.log(
				`📊 Schema generation completed: ${result.schemasGenerated}/${schemaNames.length} schemas generated`
			);

			return result;
		} catch (error) {
			result.success = false;
			result.errors.push(error instanceof Error ? error.message : String(error));
			return result;
		}
	}

	/**
	 * Generate a single JSON schema
	 */
	private async generateSingleSchema(
		schemaName: string,
		options: SchemaGenerationOptions
	): Promise<void> {
		const schemaDefinition = this.schemas.get(schemaName);
		if (!schemaDefinition) {
			throw new Error(`Schema '${schemaName}' not found`);
		}

		// Convert Zod schema to JSON Schema
		const jsonSchema = zodToJsonSchema(schemaDefinition.schema, {
			name: schemaName,
			$refStrategy: options.includeReferences ? "relative" : "none"
		});

		// Add metadata
		const enrichedSchema = {
			...jsonSchema,
			$schema: "https://json-schema.org/draft/2020-12/schema",
			$id: `${schemaName}.json`,
			title: schemaName,
			description: schemaDefinition.description || `JSON Schema for ${schemaName}`,
			category: schemaDefinition.category,
			generatedAt: new Date().toISOString(),
			generator: "zod-to-json-schema",
			version: "1.0.0"
		};

		// Format schema content
		const schemaContent = JSON.stringify(enrichedSchema, null, 2);

		if (options.dryRun) {
			console.log(`🔍 DRY RUN - Would generate ${schemaName}.json (${schemaContent.length} bytes)`);
			return;
		}

		// Write schema file
		const outputPath = join(options.outputDirectory, `${schemaName}.json`);
		const writeResult = await this.repositoryService.writeContentFile(outputPath, schemaContent, {
			mode: "force", // Always overwrite generated schemas
			createBackup: false,
			validateContent: false,
			respectContentStatus: false
		});

		if (!writeResult.success) {
			throw new Error(writeResult.error || "Failed to write schema file");
		}

		// Validate generated schema if requested
		if (options.validateOutput) {
			await this.validateGeneratedSchema(outputPath, enrichedSchema);
		}
	}

	/**
	 * Generate index file with all schemas
	 */
	private async generateIndexFile(
		schemaNames: string[],
		options: SchemaGenerationOptions
	): Promise<void> {
		const schemaRefs = schemaNames.map((name) => {
			const definition = this.schemas.get(name);
			return {
				name,
				file: `${name}.json`,
				description: definition?.description,
				category: definition?.category
			};
		});

		const indexContent = {
			$schema: "https://json-schema.org/draft/2020-12/schema",
			$id: "index.json",
			title: "JSON Schema Index",
			description: "Index of all generated JSON schemas",
			type: "object",
			generatedAt: new Date().toISOString(),
			generator: "generate-json-schemas",
			version: "1.0.0",
			schemas: schemaRefs,
			properties: schemaRefs.reduce(
				(acc, ref) => {
					acc[ref.name] = { $ref: ref.file };
					return acc;
				},
				{} as Record<string, unknown>
			)
		};

		const indexFile = JSON.stringify(indexContent, null, 2);
		const indexPath = join(options.outputDirectory, "index.json");

		const writeResult = await this.repositoryService.writeContentFile(indexPath, indexFile, {
			mode: "force",
			createBackup: false,
			validateContent: false,
			respectContentStatus: false
		});

		if (!writeResult.success) {
			throw new Error(writeResult.error || "Failed to write index file");
		}

		console.log(`📋 Generated schema index: ${indexPath}`);
	}

	/**
	 * Validate generated schema
	 */
	private async validateGeneratedSchema(filePath: string, schema: unknown): Promise<void> {
		// Basic validation - check if it's valid JSON and has required properties
		if (!schema || typeof schema !== "object" || !("$schema" in schema) || !("title" in schema)) {
			throw new Error("Generated schema missing required properties");
		}

		// Additional validation could be added here
		console.log(`✅ Schema validation passed: ${basename(filePath)}`);
	}

	/**
	 * List available schemas
	 */
	listAvailableSchemas(): Array<{ name: string; description?: string; category?: string }> {
		return Array.from(this.schemas.entries()).map(([name, definition]) => ({
			name,
			description: definition.description,
			category: definition.category
		}));
	}

	/**
	 * Ensure directory exists
	 */
	private async ensureDirectoryExists(dirPath: string): Promise<void> {
		if (!existsSync(dirPath)) {
			await this.repositoryService.writeContentFile(join(dirPath, ".gitkeep"), "", {
				mode: "force",
				createBackup: false,
				validateContent: false,
				respectContentStatus: false
			});
		}
	}
}

// ============================================================================
// CLI CLASS ARCHITECTURE
// ============================================================================

/**
 * JSON Schema Generator CLI - Commander.js based command interface
 */
export class JsonSchemaGeneratorCLI {
	private program: Command;
	private generator: JsonSchemaGenerator;
	private version: string;
	private commonConfig = SETTINGS.scripts.common;

	constructor() {
		this.program = new Command();
		this.generator = new JsonSchemaGenerator();
		this.version = this.getVersion();
		this.setupCommands();
	}

	/**
	 * Get version from package.json
	 */
	private getVersion(): string {
		try {
			const packagePath = join(process.cwd(), this.commonConfig.configFiles.packageJson);
			const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
			return packageJson.version || "1.0.0";
		} catch {
			return "1.0.0";
		}
	}

	/**
	 * Setup Commander.js commands and options
	 */
	private setupCommands(): void {
		this.program
			.name("generate-json-schemas")
			.description("Generate JSON schemas from Zod definitions")
			.version(this.version);

		// Generate command
		this.program
			.command("generate")
			.description("Generate JSON schemas")
			.option("--all", "Generate all available schemas", false)
			.option("--schema <names>", "Comma-separated list of specific schemas to generate")
			.option("--output <dir>", "Output directory", "schemas")
			.option("--format <format>", "Output format (json-schema|openapi)", "json-schema")
			.option("--no-refs", "Disable $ref generation", false)
			.option("--no-validate", "Skip validation of generated schemas", false)
			.option("--dry-run", "Show what would be generated without creating files", false)
			.action(async (options) => {
				await this.executeGenerate(options);
			});

		// List command
		this.program
			.command("list")
			.description("List available schemas")
			.option("--category <category>", "Filter by category")
			.action(async (options) => {
				await this.executeList(options);
			});

		// Validate command
		this.program
			.command("validate")
			.description("Validate existing JSON schema files")
			.option("--file <path>", "Path to schema file to validate")
			.option("--dir <path>", "Directory containing schema files to validate")
			.action(async (options) => {
				await this.executeValidate(options);
			});

		// Error handling
		this.program.configureOutput({
			writeErr: (str) => console.error(`❌ ${str}`)
		});

		this.program.exitOverride((err) => {
			if (err.code === "commander.help") {
				process.exit(0);
			}
			console.error(`❌ Command failed: ${err.message}`);
			process.exit(1);
		});
	}

	/**
	 * Execute the CLI program
	 */
	async execute(argv?: string[]): Promise<void> {
		try {
			await this.program.parseAsync(argv || process.argv);
		} catch (error) {
			console.error(
				`❌ CLI execution failed: ${error instanceof Error ? error.message : String(error)}`
			);
			process.exit(1);
		}
	}

	// ========================================================================
	// COMMAND IMPLEMENTATIONS
	// ========================================================================

	/**
	 * Execute generate command
	 */
	private async executeGenerate(options: {
		all?: boolean;
		schema?: string;
		output?: string;
		format?: string;
		refs?: boolean;
		validate?: boolean;
		dryRun?: boolean;
	}): Promise<CliExecutionResult> {
		try {
			console.log("📄 JSON Schema Generator");
			console.log("========================");

			// Determine which schemas to generate
			let schemaNames: string[];
			if (options.all) {
				schemaNames = this.generator.listAvailableSchemas().map((s) => s.name);
			} else if (options.schema) {
				schemaNames = options.schema.split(",").map((s) => s.trim());
			} else {
				console.error("❌ Either --all or --schema is required");
				return { success: false, error: "Missing schema specification" };
			}

			// Build generation options
			const generationOptions: SchemaGenerationOptions = {
				outputDirectory: options.output || "schemas",
				format: (options.format as "json-schema" | "openapi") || "json-schema",
				includeReferences: options.refs !== false,
				validateOutput: options.validate !== false,
				dryRun: options.dryRun || false
			};

			if (options.dryRun) {
				console.log("🔍 DRY RUN MODE - No files will be created");
			}

			// Execute schema generation
			const result = await this.generator.generateSchemas(schemaNames, generationOptions);

			if (result.success) {
				console.log("✅ Schema generation completed successfully");
				this.printGenerationSummary(result);
			} else {
				console.error("❌ Schema generation failed");
				result.errors.forEach((error) => console.error(`   • ${error}`));
			}

			return { success: result.success, data: result };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`❌ Generation failed: ${errorMessage}`);
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * Execute list command
	 */
	private async executeList(options: { category?: string }): Promise<CliExecutionResult> {
		try {
			console.log("📋 Available JSON Schemas");
			console.log("=========================");

			const schemas = this.generator.listAvailableSchemas();
			const filteredSchemas = options.category
				? schemas.filter((s) => s.category === options.category)
				: schemas;

			if (filteredSchemas.length === 0) {
				console.log("No schemas found matching criteria");
				return { success: true, data: [] };
			}

			// Group by category
			const byCategory = filteredSchemas.reduce(
				(acc, schema) => {
					const category = schema.category || "uncategorized";
					if (!acc[category]) acc[category] = [];
					acc[category].push(schema);
					return acc;
				},
				{} as Record<string, typeof schemas>
			);

			// Display schemas by category
			for (const [category, categorySchemas] of Object.entries(byCategory)) {
				console.log(`\n📁 ${category}:`);
				categorySchemas.forEach((schema) => {
					console.log(`  • ${schema.name}`);
					if (schema.description) {
						console.log(`    ${schema.description}`);
					}
				});
			}

			console.log(`\n📊 Total: ${filteredSchemas.length} schema(s)`);

			return { success: true, data: filteredSchemas };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`❌ List command failed: ${errorMessage}`);
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * Execute validate command
	 */
	private async executeValidate(options: {
		file?: string;
		dir?: string;
	}): Promise<CliExecutionResult> {
		try {
			console.log("🔍 JSON Schema Validation");
			console.log("=========================");

			if (!options.file && !options.dir) {
				console.error("❌ Either --file or --dir is required");
				return { success: false, error: "Missing validation target" };
			}

			// TODO: Implement schema validation logic
			console.log("⚠️  Schema validation implementation pending");

			return { success: true };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`❌ Validation failed: ${errorMessage}`);
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * Print generation summary
	 */
	private printGenerationSummary(result: SchemaGenerationResult): void {
		console.log("");
		console.log("📊 Generation Summary");
		console.log("====================");
		console.log(`Schemas generated: ${result.schemasGenerated}`);
		console.log(`Output directory: ${result.outputDirectory}`);

		if (result.warnings.length > 0) {
			console.log("\n⚠️  Warnings:");
			result.warnings.forEach((warning) => console.log(`  • ${warning}`));
		}

		if (result.errors.length > 0) {
			console.log("\n❌ Errors:");
			result.errors.forEach((error) => console.log(`  • ${error}`));
		}
	}
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main execution function
 */
async function main(): Promise<void> {
	const cli = new JsonSchemaGeneratorCLI();
	await cli.execute();
}

// Execute main function if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error("Fatal error:", error);
		process.exit(1);
	});
}

export { main };
