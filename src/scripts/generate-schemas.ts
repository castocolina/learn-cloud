#!/usr/bin/env tsx

/**
 * JSON Schema Generator CLI - Consolidated Schema Generation
 *
 * Generates a single consolidated JSON Schema file from all Zod schema definitions
 * in ContentSchemas.ts. This allows external systems to validate data structures
 * using standard JSON Schema.
 *
 * Architecture:
 * - JsonSchemaGeneratorCLI: Command-line interface coordination
 * - JsonSchemaGenerator: Core schema generation logic
 * - ValidationService: Schema validation and type checking
 * - RepositoryService: Safe file operations
 *
 * Features:
 * - Single consolidated JSON Schema file with all schema definitions
 * - Consumes all schemas from CONTENT_SCHEMAS object (35+ schemas)
 * - JSON Schema Draft 7 format
 * - Reference resolution and $ref handling
 * - Comprehensive validation and error reporting
 * - Safe file operations with backup support
 * - No parameters required - fixed responsibility pattern
 *
 * Usage:
 *   Generate all schemas (consolidated file):
 *     npx tsx src/scripts/generate-schemas.ts
 *
 *   Generate with dry-run:
 *     npx tsx src/scripts/generate-schemas.ts --dry-run
 *
 *   Generate with verbose output:
 *     npx tsx src/scripts/generate-schemas.ts --verbose
 */

import { Command } from "commander";
import { readFileSync, existsSync, mkdirSync } from "fs";
import { join, basename, dirname } from "path";
import { z } from "zod";
import { ValidationService } from "../lib/services/ValidationService.js";
import { RepositoryService } from "../lib/services/RepositoryService.js";
import { SETTINGS } from "$config/settings.js";
import { CONTENT_SCHEMAS } from "$lib/schemas/ContentSchemas.js";
import type { CliExecutionResult } from "$types";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

/**
 * Schema generation options
 */
export interface SchemaGenerationOptions {
	outputFile: string;
	includeReferences: boolean;
	validateOutput: boolean;
	dryRun: boolean;
	verbose: boolean;
}

/**
 * Schema generation result
 */
export interface SchemaGenerationResult {
	success: boolean;
	schemasIncluded: number;
	outputFile: string;
	errors: string[];
	warnings: string[];
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
	private schemasConfig = SETTINGS.scripts.schemas;
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
	}

	/**
	 * Generate consolidated JSON Schema file from all CONTENT_SCHEMAS
	 */
	async generateConsolidatedSchema(
		options: SchemaGenerationOptions
	): Promise<SchemaGenerationResult> {
		const result: SchemaGenerationResult = {
			success: true,
			schemasIncluded: 0,
			outputFile: options.outputFile,
			errors: [],
			warnings: []
		};

		try {
			if (options.verbose) {
				console.log("🚀 Generating consolidated JSON Schema from CONTENT_SCHEMAS...");
				console.log(`📁 Source: ${this.schemasConfig.paths.sourceFile}`);
				console.log(`📄 Output: ${options.outputFile}`);
			}

			// Ensure output directory exists
			if (!options.dryRun) {
				const outputDir = dirname(options.outputFile);
				if (!existsSync(outputDir)) {
					mkdirSync(outputDir, { recursive: true });
					if (options.verbose) {
						console.log(`✅ Created output directory: ${outputDir}`);
					}
				}
			}

			// Convert all schemas using Zod v4 native z.toJSONSchema()
			const definitions: Record<string, unknown> = {};
			const schemaEntries = Object.entries(CONTENT_SCHEMAS);

			// Prepare conversion options from settings
			const conversionOptions = {
				target: this.schemasConfig.generation.target,
				io: this.schemasConfig.generation.io,
				unrepresentable: this.schemasConfig.generation.unrepresentable,
				cycles: this.schemasConfig.generation.cycles
			} as const;

			for (const [name, zodSchema] of schemaEntries) {
				try {
					// Use Zod v4 native conversion with settings
					const jsonSchema = z.toJSONSchema(zodSchema, conversionOptions);

					// Store the schema definition
					definitions[name] = jsonSchema;
					result.schemasIncluded++;

					if (options.verbose) {
						console.log(`✅ Processed schema: ${name}`);
					}
				} catch (error) {
					const errorMessage = `Failed to convert ${name}: ${error instanceof Error ? error.message : String(error)}`;
					result.errors.push(errorMessage);
					if (options.verbose) {
						console.error(`❌ ${errorMessage}`);
					}
				}
			}

			// Build consolidated schema document using configuration
			const consolidatedSchema = {
				$schema: "http://json-schema.org/draft-07/schema#",
				$id: this.schemasConfig.generation.schemaId,
				title: this.schemasConfig.generation.title,
				description: `Complete schema definitions for all content types (${result.schemasIncluded} schemas)`,
				type: "object" as const,
				definitions,
				generatedAt: new Date().toISOString(),
				generator: "generate-schemas",
				version: "1.0.0",
				sourceFile: this.schemasConfig.paths.sourceFile
			};

			// Format schema content
			const schemaContent = JSON.stringify(consolidatedSchema, null, 2);

			if (options.dryRun) {
				console.log(
					`🔍 DRY RUN - Would generate ${options.outputFile} (${schemaContent.length} bytes)`
				);
				console.log(`📊 Schemas included: ${result.schemasIncluded}`);
				return result;
			}

			// Write consolidated schema file
			const writeResult = await this.repositoryService.writeContentFile(
				options.outputFile,
				schemaContent,
				{
					mode: "force", // Always overwrite generated schemas
					createBackup: false,
					validateContent: false,
					respectContentStatus: false
				}
			);

			if (!writeResult.success) {
				throw new Error(writeResult.error || "Failed to write schema file");
			}

			// Validate generated schema if requested
			if (options.validateOutput) {
				await this.validateGeneratedSchema(options.outputFile, consolidatedSchema);
			}

			result.success = result.errors.length === 0;

			if (options.verbose) {
				console.log(`📊 Schema generation completed: ${result.schemasIncluded} schemas included`);
			}

			return result;
		} catch (error) {
			result.success = false;
			result.errors.push(error instanceof Error ? error.message : String(error));
			return result;
		}
	}

	/**
	 * Validate generated schema
	 */
	private async validateGeneratedSchema(filePath: string, schema: unknown): Promise<void> {
		// Basic validation - check if it's valid JSON and has required properties
		if (
			!schema ||
			typeof schema !== "object" ||
			!("$schema" in schema) ||
			!("title" in schema) ||
			!("definitions" in schema)
		) {
			throw new Error("Generated schema missing required properties");
		}

		console.log(`✅ Schema validation passed: ${basename(filePath)}`);
	}

	/**
	 * List available schemas from CONTENT_SCHEMAS
	 */
	listAvailableSchemas(): Array<{ name: string; type: string }> {
		return Object.entries(CONTENT_SCHEMAS).map(([name]) => ({
			name,
			type: "ZodSchema"
		}));
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
	private schemasConfig = SETTINGS.scripts.schemas;
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
			.name("generate-schemas")
			.description(
				"Generate consolidated JSON Schema file from ContentSchemas.ts (35+ schema definitions)"
			)
			.version(this.version);

		// Main generation command (default - no subcommands)
		this.program
			.option("--output <file>", "Output file path", this.schemasConfig.paths.outputFile)
			.option("--no-refs", "Disable $ref generation", false)
			.option("--no-validate", "Skip validation of generated schema", false)
			.option("--dry-run", "Show what would be generated without creating files", false)
			.option("--verbose", "Enable verbose output", false)
			.action(async (options) => {
				await this.executeGenerate(options);
			});

		// List command
		this.program
			.command("list")
			.description("List available schemas from CONTENT_SCHEMAS")
			.action(async () => {
				await this.executeList();
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
		output?: string;
		refs?: boolean;
		validate?: boolean;
		dryRun?: boolean;
		verbose?: boolean;
	}): Promise<CliExecutionResult> {
		try {
			if (!options.dryRun) {
				console.log("📄 JSON Schema Generator");
				console.log("========================");
			}

			// Build generation options
			const generationOptions: SchemaGenerationOptions = {
				outputFile: options.output || this.schemasConfig.paths.outputFile,
				includeReferences: options.refs !== false,
				validateOutput: options.validate !== false,
				dryRun: options.dryRun || false,
				verbose: options.verbose || false
			};

			if (options.dryRun) {
				console.log("🔍 DRY RUN MODE - No files will be created");
			}

			// Execute schema generation
			const result = await this.generator.generateConsolidatedSchema(generationOptions);

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
	private async executeList(): Promise<CliExecutionResult> {
		try {
			console.log("📋 Available Schemas in CONTENT_SCHEMAS");
			console.log("========================================");

			const schemas = this.generator.listAvailableSchemas();

			if (schemas.length === 0) {
				console.log("No schemas found");
				return { success: true, data: [] };
			}

			// Group schemas by prefix for better organization
			const grouped: Record<string, typeof schemas> = {};
			schemas.forEach((schema) => {
				const prefix = schema.name.replace(/Schema$/, "");
				const category = prefix.match(/[A-Z][a-z]+/)?.[0] || "Other";
				if (!grouped[category]) grouped[category] = [];
				grouped[category].push(schema);
			});

			// Display schemas by category
			for (const [category, categorySchemas] of Object.entries(grouped)) {
				console.log(`\n📁 ${category}:`);
				categorySchemas.forEach((schema) => {
					console.log(`  • ${schema.name} (${schema.type})`);
				});
			}

			console.log(`\n📊 Total: ${schemas.length} schema(s) available`);
			console.log(`📁 Source: ${this.schemasConfig.paths.sourceFile}`);

			return { success: true, data: schemas };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`❌ List command failed: ${errorMessage}`);
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
		console.log(`Schemas included: ${result.schemasIncluded}`);
		console.log(`Output file: ${result.outputFile}`);

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
