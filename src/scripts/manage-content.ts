#!/usr/bin/env tsx

/**
 * Content Creator CLI - Refactored Architecture with Separated Concerns
 *
 * This script provides the core content management API and CLI interface for CRUD operations.
 * It has been refactored to separate scaffolding concerns (now in scaffold-generator.ts)
 * and focus on real content creation, validation, and management.
 *
 * Architecture:
 * - ContentCore: Core API for content validation and persistence
 * - ContentCreatorCLI: Command-line interface for CRUD operations
 * - Service Integration: ValidationService + RepositoryService for business logic
 *
 * Commands:
 * - create: Creates new content with user-provided data
 * - update: Updates existing content
 * - validate: Validates content without writing
 * - list: Lists existing content with filtering
 * - delete: Safely deletes content files
 *
 * Global Flags:
 * - --dry-run: Simulates operations without making changes
 * - --force-overwrite: Required to modify/delete 'final' status content
 *
 * Service API:
 * - processGeneratedContent(): Entry point for external content (e.g., from scaffold-generator)
 * - State-aware CRUD operations with content status validation
 * - Centralized validation and safety checks
 */

import { Command } from "commander";
import {
	readFileSync,
	existsSync,
	readdirSync,
	statSync,
	writeFileSync,
	mkdirSync,
	unlinkSync
} from "fs";
import { join } from "path";
import { ContentSafetyService } from "../lib/services/ContentSafetyService.js";
import { ContentCore } from "../lib/services/ContentCore.js";
import { parseJsonSafely } from "../lib/utils/validation-utils.js";
import type {
	CliExecutionResult,
	ContentInventoryItem,
	InventoryStats,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	FormatOptions,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	ExtendedCommandOptions,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	ContentCreatorOptions,
	ContentStatus,
	SupportedFormat,
	ChapterType
} from "$types";
import {
	generateContentId
	// parseContentId, parseFilePath reserved for future use in content queries
} from "../lib/utils/content-identifiers.js";
import { SETTINGS } from "$config/settings.js";

// ============================================================================
// CONTENT CREATOR CLI - ENHANCED UX WITH FORMAT SUPPORT
// ============================================================================

/**
 * FormatProcessor - Utility class for handling input/output format transformations
 *
 * Supports unified --format and granular --input-format/--output-format flags
 * with intelligent defaults based on command context.
 */

class FormatProcessor {
	private static yamlParser: unknown = null;

	/**
	 * Get the effective output format based on flags and command defaults
	 */
	static getEffectiveOutputFormat(
		options: Record<string, unknown>,
		command: string
	): SupportedFormat {
		// Priority: --output-format > --format > command default
		if (options.outputFormat && this.isFormatSupported(options.outputFormat as string)) {
			return options.outputFormat as SupportedFormat;
		}
		if (options.format && this.isFormatSupported(options.format as string)) {
			return options.format as SupportedFormat;
		}

		// Command-specific defaults
		switch (command) {
			case "list":
				return "plain";
			case "view":
				return "json";
			default:
				return "json";
		}
	}

	/**
	 * Get the effective input format based on flags and defaults
	 */
	static getEffectiveInputFormat(options: Record<string, unknown>): SupportedFormat {
		// Priority: --input-format > --format > json (default)
		if (options.inputFormat && this.isFormatSupported(options.inputFormat as string)) {
			return options.inputFormat as SupportedFormat;
		}
		if (options.format && this.isFormatSupported(options.format as string)) {
			return options.format as SupportedFormat;
		}
		return "json";
	}

	/**
	 * Parse input data from specified format
	 */
	static parseInput<T = unknown>(input: string, format: SupportedFormat): T {
		try {
			switch (format) {
				case "json":
					return JSON.parse(input);
				case "yaml":
				case "yml":
					// Lazy load yaml for performance
					if (!this.yamlParser) {
						try {
							// eslint-disable-next-line @typescript-eslint/no-require-imports
							this.yamlParser = require("js-yaml");
						} catch {
							throw new Error(
								"YAML parser not available. Please install js-yaml: npm install js-yaml"
							);
						}
					}
					return (this.yamlParser as { load: (input: string) => unknown }).load(input) as T;
				case "plain":
					// For plain text, return as-is or try to parse as JSON
					try {
						return JSON.parse(input);
					} catch {
						return input as T;
					}
				default:
					throw new Error(`Unsupported input format: ${format}`);
			}
		} catch (error) {
			throw new Error(
				`Failed to parse ${format.toUpperCase()} input: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	/**
	 * Format output data to specified format
	 */
	static formatOutput<T = unknown>(data: T, format: SupportedFormat, command?: string): string {
		try {
			switch (format) {
				case "json":
					return JSON.stringify(data, null, 2);
				case "yaml":
				case "yml":
					// Lazy load yaml for performance
					if (!this.yamlParser) {
						try {
							// eslint-disable-next-line @typescript-eslint/no-require-imports
							this.yamlParser = require("js-yaml");
						} catch {
							throw new Error(
								"YAML parser not available. Please install js-yaml: npm install js-yaml"
							);
						}
					}
					return (this.yamlParser as { dump: (data: unknown, options?: unknown) => string }).dump(
						data,
						{ indent: 2, lineWidth: 120 }
					);
				case "plain":
					// For plain format, use command-specific formatting
					if (command === "list") {
						return this.formatTableOutput(data);
					}
					// For other commands, return formatted JSON
					return JSON.stringify(data, null, 2);
				default:
					throw new Error(`Unsupported output format: ${format}`);
			}
		} catch (error) {
			throw new Error(
				`Failed to format ${format.toUpperCase()} output: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	/**
	 * Format data as table for list command (when format=plain)
	 */
	private static formatTableOutput(data: unknown): string {
		// If data has items array (list command), use existing table logic
		if (Array.isArray(data)) {
			// Use existing table formatting logic from executeList
			return "Table formatting - use existing list logic";
		}
		// For other data types, fallback to JSON
		return JSON.stringify(data, null, 2);
	}

	/**
	 * Validate if a format is supported
	 */
	static isFormatSupported(format: string): format is SupportedFormat {
		return ["plain", "json", "yaml", "yml"].includes(format);
	}
}

// ============================================================================
// CONTENT CREATOR CLI CLASS
// ============================================================================

/**
 * ContentCreatorCLI - Commander.js based command interface for CRUD operations
 * Coordinates between CLI commands and ContentCore API for content management
 */
export class ContentCreatorCLI {
	private program: Command;
	private contentCore: ContentCore;
	private config = SETTINGS.scripts.contentCreator;
	private commonConfig = SETTINGS.scripts.common;
	private version: string;

	constructor() {
		this.program = new Command();
		this.contentCore = new ContentCore();
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
			.name("content-creator")
			.description("CLI for cloud-native learning content CRUD operations and management")
			.version(this.version);

		// Global options
		this.program
			.option("--dry-run", "Simulate operations without making changes to files", false)
			.option(
				"--force-overwrite",
				"Required to overwrite or delete content with 'final' status",
				false
			)
			.option("--format <format>", "Unified format for input/output (plain|json|yaml|yml)")
			.option("--input-format <format>", "Specific input format (overrides --format)")
			.option("--output-format <format>", "Specific output format (overrides --format)")
			.option("--verbose", "Show detailed output and progress information", false);

		// List command - browse and filter existing content
		this.program
			.command("list")
			.description("📋 Browse and filter existing content")
			.option("-u, --unit <unit>", "Filter by unit (comma-separated)")
			.option("-t, --type <type>", "Filter by content type (comma-separated)")
			.option("--status <status>", "Filter by content status (comma-separated)")
			.action(async (options, command) => {
				const globalOptions = command.parent?.opts() || {};
				const mergedOptions = { ...options, ...globalOptions };
				await this.executeList(mergedOptions);
			});

		// Show command - display detailed content information (alias: view)
		this.program
			.command("show")
			.alias("view")
			.description("👁️  Display detailed content information")
			.option("--id <id>", "Content ID to show")
			.option("--file <path>", "File path to show")
			.action(async (options, command) => {
				const globalOptions = command.parent?.opts() || {};
				const mergedOptions = { ...options, ...globalOptions };
				await this.executeShow(mergedOptions);
			});

		// Create command - create new educational content with safety checks
		this.program
			.command("create")
			.description("✨ Create new educational content with safety checks")
			.option("-f, --file <path>", "Path to content JSON file")
			.option("--id <id>", "Content unique identifier (for automatic path mapping)")
			.option("-u, --unit <unit>", "Unit number (1-20)")
			.option("-c, --chapter <chapter>", "Chapter number")
			.option("-t, --type <type>", "Content type (lesson|quiz|study_guide)")
			.option("--data <content>", "Inline content data (JSON/YAML)")
			.option("--override", "Override existing scaffold content")
			.action(async (options, command) => {
				const globalOptions = command.parent?.opts() || {};
				const mergedOptions = { ...options, ...globalOptions };
				await this.executeCreate(mergedOptions);
			});

		// Update command - modify content using JSON paths and bulk operations
		this.program
			.command("update")
			.description("📝 Modify content using JSON paths and bulk operations")
			.option("-f, --file <path>", "Path to existing content file")
			.option("--id <id>", "Content ID to update")
			.option("-u, --unit <unit>", "Update all content in unit (comma-separated)")
			.option("-t, --type <type>", "Update all content of type (comma-separated)")
			.option("--content <json>", "JSON content to merge")
			.option("--content-file <path>", "Path to JSON content file to merge")
			.option("--data <content>", "Inline content data to merge (JSON/YAML)")
			.option("--set <updates>", "JSON path updates: key=value,key2=value2 or key.nested=value")
			.action(async (options, command) => {
				const globalOptions = command.parent?.opts() || {};
				const mergedOptions = { ...options, ...globalOptions };
				await this.executeUpdate(mergedOptions);
			});

		// Delete command - remove content with safety protections
		this.program
			.command("delete")
			.description("🗑️  Remove content with safety protections")
			.option("--file <path>", "Path to content file to delete")
			.option("--id <id>", "Content ID to delete")
			.option("-u, --unit <unit>", "Delete all content from unit (comma-separated)")
			.option("-t, --type <type>", "Delete content by type (comma-separated)")
			.option("--status <status>", "Delete content by status (comma-separated)")
			.action(async (options, command) => {
				const globalOptions = command.parent?.opts() || {};
				const mergedOptions = { ...options, ...globalOptions };
				await this.executeDelete(mergedOptions);
			});

		// Validate command - check content quality and structure
		this.program
			.command("validate")
			.description("✅ Check content quality and structure")
			.option("-f, --file <path>", "Path to content file to validate")
			.option("--content <json>", "JSON content to validate")
			.option("--data <content>", "Inline content data to validate (JSON/YAML)")
			.action(async (options, command) => {
				const globalOptions = command.parent?.opts() || {};
				const mergedOptions = { ...options, ...globalOptions };
				await this.executeValidate(mergedOptions);
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
	 * Execute create command
	 */
	private async executeCreate(options: {
		file?: string;
		id?: string;
		unit?: string;
		chapter?: string;
		type?: string;
		data?: string;
		dryRun?: boolean;
		forceOverwrite?: boolean;
		verbose?: boolean;
	}): Promise<CliExecutionResult> {
		try {
			console.log("📝 Content Creation");
			console.log("==================");

			// Validate input parameters
			if (!options.file && !options.data) {
				console.error("❌ Error: Must specify either --file or --data");
				console.log("Usage examples:");
				console.log(
					'  --id=lesson_containers --data=\'{"title":"New Lesson"}\'     # Create by ID'
				);
				console.log(
					'  --unit=1 --chapter=1 --type=lesson --data=\'{"title":"New"}\' # Create by unit/chapter/type'
				);
				console.log(
					"  --file=input.json --id=lesson_containers                    # Create from file"
				);
				return { success: false, error: "Missing content input" };
			}

			// Validate path mapping parameters
			if (!options.id && !(options.unit && options.chapter && options.type)) {
				console.error(
					"❌ Error: Must specify either --id or --unit/--chapter/--type for automatic path mapping"
				);
				console.log("Path mapping options:");
				console.log("  --id=lesson_containers                          # Map by unique ID");
				console.log("  --unit=1 --chapter=1 --type=lesson              # Map by unit/chapter/type");
				return { success: false, error: "Missing path mapping parameters" };
			}

			// Parse and merge content from different sources
			let content: Record<string, unknown> = {};

			if (options.file) {
				content = this.readContentFromFile(options.file);
			}

			if (options.data) {
				const inputFormat = this.getInputFormat(options as Record<string, unknown>);
				const inlineData = FormatProcessor.parseInput<Record<string, unknown>>(
					options.data,
					inputFormat
				);
				// Merge inline data with file content (inline data takes precedence)
				if (typeof inlineData === "object" && inlineData !== null && !Array.isArray(inlineData)) {
					content = { ...content, ...inlineData };
				} else {
					throw new Error("Inline data must be a JSON object, not an array or primitive value");
				}
			}

			// Determine output path using internal mapping
			const outputPath = await this.mapContentToInternalPath(options, content);
			if (options.verbose) {
				console.log(`📍 Internal mapping: ${outputPath}`);
			}

			// Safety checks are handled by ContentCore
			if (options.dryRun) {
				console.log("🔍 DRY RUN MODE - Content validation only");
				// Validate content
				const validationResult = await this.contentCore.validateContent(content);
				if (validationResult.success) {
					console.log(`✅ Content validation passed - would create: ${outputPath}`);
				} else {
					console.error("❌ Content validation failed:");
					validationResult.errors.forEach((error) => console.error(`   • ${error}`));
					return { success: false, error: validationResult.errors.join("; ") };
				}
				return { success: true };
			}

			// Process content using ContentCore API
			const result = await this.contentCore.processGeneratedContent(outputPath, content, {
				mode: options.forceOverwrite ? "force" : "safe",
				createBackups: true
			});

			if (result.success) {
				console.log(`✅ Content created: ${outputPath}`);
			} else {
				console.error(`❌ Failed to create content: ${result.error}`);
				return { success: false, error: result.error };
			}

			return { success: true };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`❌ Content creation failed: ${errorMessage}`);
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * Execute update command
	 */
	private async executeUpdate(options: {
		file?: string;
		id?: string;
		unit?: string;
		type?: string;
		content?: string;
		contentFile?: string;
		data?: string;
		set?: string;
		dryRun?: boolean;
		forceOverwrite?: boolean;
		verbose?: boolean;
	}): Promise<CliExecutionResult> {
		try {
			console.log("📝 Content Update");
			console.log("=================");

			// Determine target files for update
			let targetFiles: string[] = [];

			if (options.file) {
				targetFiles = [options.file];
			} else if (options.id || options.unit || options.type) {
				// Get content inventory for filtering
				const inventory = await this.buildContentInventory();
				let filteredItems = inventory.items;

				// Apply filters
				if (options.id) {
					const ids = options.id.split(",").map((id) => id.trim());
					filteredItems = filteredItems.filter((item) => ids.includes(item.id));
				}
				if (options.unit) {
					const units = options.unit.split(",").map((u) => u.trim());
					filteredItems = filteredItems.filter((item) => units.includes(item.unit));
				}
				if (options.type) {
					const types = options.type.split(",").map((t) => t.trim());
					filteredItems = filteredItems.filter((item) => types.includes(item.type));
				}

				targetFiles = filteredItems.filter((item) => item.fileExists).map((item) => item.filePath);

				if (targetFiles.length === 0) {
					console.error("❌ No matching content found for update");
					return { success: false, error: "No matching content found" };
				}

				console.log(`📁 Found ${targetFiles.length} file(s) to update`);
			} else {
				console.error("❌ Must specify target: --file, --id, --unit, or --type");
				return { success: false, error: "Missing target specification" };
			}

			// Get update data
			let updateData: Record<string, unknown> = {};

			if (options.set) {
				// Parse JSON path updates
				updateData = this.parseJsonPathUpdates(options.set);
			} else if (options.content) {
				updateData = this.parseContentInput(options.content);
			} else if (options.contentFile) {
				updateData = this.readContentFromFile(options.contentFile);
			} else if (options.data) {
				updateData = this.parseContentInput(options.data);
			} else {
				console.error("❌ Must specify update data: --set, --content, --content-file, or --data");
				return { success: false, error: "Missing update data" };
			}

			// Process each target file
			let successCount = 0;
			let errorCount = 0;

			for (const filePath of targetFiles) {
				try {
					console.log(`\n🎯 Processing: ${filePath}`);

					// Safety checks are handled by ContentCore
					if (options.dryRun) {
						console.log("   🔍 DRY RUN - Would update with:");
						console.log(`   ${JSON.stringify(updateData, null, 2)}`);
						successCount++;
						continue;
					}

					// Update content using ContentCore API
					const result = await this.contentCore.updateContent(filePath, updateData, {
						mode: options.forceOverwrite ? "force" : "safe",
						createBackups: true
					});

					if (result.success) {
						console.log(`   ✅ Updated successfully`);
						successCount++;
					} else {
						console.error(`   ❌ Failed: ${result.error}`);
						errorCount++;
					}
				} catch (error) {
					console.error(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
					errorCount++;
				}
			}

			const summary = options.dryRun ? "Dry run completed" : "Update operations completed";
			console.log(`\n✅ ${summary}: ${successCount} successful, ${errorCount} failed`);

			return {
				success: errorCount === 0,
				message: `${summary}: ${successCount} successful, ${errorCount} failed`
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`❌ Content update failed: ${errorMessage}`);
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * Parse JSON path updates from string format
	 * Examples: "status=review,metadata.difficulty=advanced"
	 */
	private parseJsonPathUpdates(setString: string): Record<string, unknown> {
		const updates: Record<string, unknown> = {};

		// Split by comma and process each update
		const assignments = setString.split(",").map((s) => s.trim());

		for (const assignment of assignments) {
			const [path, value] = assignment.split("=", 2);
			if (!path || value === undefined) {
				continue; // Skip malformed assignments
			}

			const cleanPath = path.trim();
			const cleanValue = value.trim();

			// Parse value (try as JSON, fallback to string)
			let parsedValue: unknown;
			try {
				// Try parsing as JSON for numbers, booleans, arrays, objects
				parsedValue = JSON.parse(cleanValue);
			} catch {
				// Fallback to string if not valid JSON
				parsedValue = cleanValue;
			}

			// Set nested property using dot notation
			this.setNestedProperty(updates, cleanPath, parsedValue);
		}

		return updates;
	}

	/**
	 * Set nested property using dot notation
	 */
	private setNestedProperty(obj: Record<string, unknown>, path: string, value: unknown): void {
		const keys = path.split(".");
		let current = obj;

		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			if (!(key in current) || typeof current[key] !== "object" || current[key] === null) {
				current[key] = {};
			}
			current = current[key] as Record<string, unknown>;
		}

		const finalKey = keys[keys.length - 1];
		current[finalKey] = value;
	}

	/**
	 * Execute validate command
	 */
	private async executeValidate(options: {
		file?: string;
		content?: string;
	}): Promise<CliExecutionResult> {
		try {
			console.log("🔍 Content Validation");
			console.log("=====================");

			let content: Record<string, unknown>;

			if (options.file) {
				content = this.readContentFromFile(options.file);
				console.log(`📁 Validating file: ${options.file}`);
			} else if (options.content) {
				content = this.parseContentInput(options.content);
				console.log("📄 Validating inline content");
			} else {
				console.error("❌ Either --file or --content is required");
				return { success: false, error: "Missing content to validate" };
			}

			// Validate content using ContentCore API
			const validationResult = await this.contentCore.validateContent(content);

			if (validationResult.success) {
				console.log("✅ Content validation passed");
				if (validationResult.warnings && validationResult.warnings.length > 0) {
					console.log("⚠️  Warnings:");
					validationResult.warnings.forEach((warning) => console.log(`   • ${warning}`));
				}
			} else {
				console.error("❌ Content validation failed:");
				validationResult.errors.forEach((error) => console.error(`   • ${error}`));
			}

			return {
				success: validationResult.success,
				error: validationResult.success ? undefined : validationResult.errors.join("; ")
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`❌ Content validation failed: ${errorMessage}`);
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * Execute list command with enhanced table-based output
	 */
	private async executeList(options: {
		unit?: string;
		type?: string;
		status?: string;
		format?: string;
		outputFile?: boolean;
	}): Promise<CliExecutionResult> {
		try {
			console.log("📋 Content Listing");
			console.log("==================");

			// Get content inventory
			const inventory = await this.buildContentInventory();

			// Apply filters
			let filteredItems = inventory.items;

			if (options.unit) {
				const units = options.unit.split(",").map((u) => u.trim().padStart(2, "0"));
				filteredItems = filteredItems.filter((item) => units.includes(item.unit));
			}

			if (options.type) {
				const types = options.type.split(",").map((t) => t.trim());
				filteredItems = filteredItems.filter((item) => types.includes(item.type));
			}

			if (options.status) {
				const statuses = options.status.split(",").map((s) => s.trim());
				filteredItems = filteredItems.filter((item) => statuses.includes(item.status));
			}

			// Clean up old temporary files
			this.cleanupOldTempFiles();

			// Output based on format and output preference
			const outputFunction = () => {
				if (options.format === "json") {
					console.log(JSON.stringify(filteredItems, null, 2));
				} else if (options.format === "csv") {
					this.outputCsvFormat(filteredItems);
				} else {
					// Default table format
					this.outputTableFormat(filteredItems, inventory.stats);
				}
			};

			// Use temporary file if requested, otherwise output to stdout
			this.captureOutput(outputFunction, !!options.outputFile, options.format || "table", "list");

			return { success: true };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`❌ Content listing failed: ${errorMessage}`);
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * Build comprehensive content inventory by comparing content-menu with filesystem
	 */
	private async buildContentInventory(): Promise<{
		items: ContentInventoryItem[];
		stats: InventoryStats;
	}> {
		const items: ContentInventoryItem[] = [];
		const contentDir = join(process.cwd(), this.config.paths.outputFolder);

		// Load content menu to get expected items
		const { contentMenu } = await import(
			this.config.paths.inputFile.replace(
				new RegExp(`\\${this.commonConfig.extensions.typescript}$`),
				this.commonConfig.extensions.javascript
			)
		);

		// Get actual files from filesystem
		const actualFiles = new Map<string, string>();
		if (existsSync(contentDir)) {
			this.scanContentFiles(contentDir, actualFiles);
		}

		// Process each unit and chapter in content menu
		for (const unit of contentMenu.units) {
			const unitNumber = unit.unitNumber.toString().padStart(2, "0");

			for (const chapter of unit.chapters) {
				const chapterNumber = chapter.chapterNumber;
				const expectedFileName = this.generateFileName(
					unitNumber,
					chapterNumber,
					chapter.type,
					chapter.title
				);
				const actualFile = actualFiles.get(expectedFileName);

				// Determine content status
				let status: ContentStatus = "expected";
				let title = chapter.title;

				if (actualFile) {
					const fileStatus = await this.getContentStatus(actualFile);
					status = fileStatus || "scaffold";
					// Try to get actual title from file content
					const actualTitle = await this.extractTitleFromFile(actualFile);
					if (actualTitle) {
						title = actualTitle;
					}
				}

				items.push({
					unit: unitNumber,
					chapter: chapterNumber.toString(),
					type: chapter.type,
					id: this.generateUniqueId(unitNumber, chapterNumber, chapter.type, chapter.title),
					title: title,
					status: status,
					fileExists: !!actualFile,
					filePath: actualFile || expectedFileName,
					estimatedTime: chapter.estimatedTime,
					difficulty: chapter.difficulty
				});
			}
		}

		// Add orphaned files (files not in content menu)
		for (const [fileName, filePath] of actualFiles) {
			if (!items.some((item) => item.filePath === filePath)) {
				const orphanInfo = this.parseFileName(fileName);
				if (orphanInfo) {
					const fileStatus = await this.getContentStatus(filePath);
					const actualTitle = await this.extractTitleFromFile(filePath);

					items.push({
						...orphanInfo,
						id: this.generateUniqueId(
							orphanInfo.unit,
							orphanInfo.chapter,
							orphanInfo.type,
							actualTitle || fileName
						),
						title: actualTitle || fileName,
						status: fileStatus || "orphan",
						fileExists: true,
						filePath: filePath
					});
				}
			}
		}

		// Calculate stats
		const stats = this.calculateInventoryStats(items);

		return { items: items.sort(this.compareContentItems), stats };
	}

	/**
	 * Scan content directory for TypeScript files
	 */
	private scanContentFiles(dir: string, files: Map<string, string>, prefix: string = ""): void {
		try {
			const items = readdirSync(dir);
			for (const item of items) {
				const fullPath = join(dir, item);
				const stat = statSync(fullPath);

				if (stat.isDirectory()) {
					this.scanContentFiles(fullPath, files, `${prefix}${item}/`);
				} else if (
					item.endsWith(this.commonConfig.extensions.typescript) &&
					!item.startsWith("index.")
				) {
					files.set(item, fullPath);
				}
			}
		} catch (error) {
			console.warn(
				`⚠️  Could not scan directory ${dir}: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * Output content inventory in table format
	 */
	private outputTableFormat(items: ContentInventoryItem[], stats: InventoryStats): void {
		if (items.length === 0) {
			console.log("ℹ️  No content items found matching the criteria");
			return;
		}

		// Table header
		console.log("");
		console.log(
			"Unit | Chapter | Type        | ID                     | Title                          | Status    | File"
		);
		console.log(
			"-----|---------|-------------|------------------------|--------------------------------|-----------|------"
		);

		// Table rows
		for (const item of items) {
			const unit = item.unit.padEnd(4);
			const chapter = item.chapterNumber?.padEnd(7) || item.chapter.toString().padEnd(7);
			const type = item.type.padEnd(11);
			const id = item.id.padEnd(22);
			const title = this.truncateString(item.title, 30).padEnd(30);
			const status = this.getStatusDisplay(item.status).padEnd(9);
			const fileIcon = item.fileExists ? "✅" : "❌";

			console.log(`${unit} | ${chapter} | ${type} | ${id} | ${title} | ${status} | ${fileIcon}`);
		}

		// Summary stats
		console.log("");
		console.log("📊 Summary:");
		console.log(`   Total items: ${stats.total}`);
		console.log(
			`   Existing files: ${stats.existing} (${Math.round((stats.existing / stats.total) * 100)}%)`
		);
		console.log(
			`   Missing files: ${stats.missing} (${Math.round((stats.missing / stats.total) * 100)}%)`
		);
		console.log(
			`   By status: scaffold: ${stats.byStatus.scaffold}, draft: ${stats.byStatus.draft}, final: ${stats.byStatus.final}, expected: ${stats.byStatus.expected}`
		);
		if (stats.byStatus.orphan > 0) {
			console.log(`   Orphaned files: ${stats.byStatus.orphan}`);
		}
	}

	/**
	 * Output content inventory in CSV format
	 */
	private outputCsvFormat(items: ContentInventoryItem[]): void {
		console.log("Unit,Chapter,Type,ID,Title,Status,FileExists,EstimatedTime,Difficulty");
		for (const item of items) {
			const title = `"${item.title.replace(/"/g, '""')}"`;
			console.log(
				`${item.unit},${item.chapter},${item.type},${item.id},${title},${item.status},${item.fileExists},${item.estimatedTime || ""},${item.difficulty || ""}`
			);
		}
	}

	/**
	 * Execute view command
	 */
	private async executeShow(options: {
		id?: string;
		file?: string;
		format?: string;
		outputFile?: boolean;
	}): Promise<CliExecutionResult> {
		try {
			console.log("👁️ Content Viewer");
			console.log("=================");

			if (!options.id && !options.file) {
				console.error("❌ Error: Must specify either --id or --file");
				console.log("Usage examples:");
				console.log(
					"  npx tsx content-creator.ts view --id=01_01_lesson_development_environment_too"
				);
				console.log(
					`  npx tsx content-creator.ts view --file=${this.config.paths.outputFolder}/unit01/01_01_lesson.ts`
				);
				return { success: false, error: "Missing required parameter" };
			}

			let targetFile: string | undefined;
			let contentData: Record<string, unknown>;

			if (options.file) {
				// Direct file path provided
				targetFile = options.file;
			} else if (options.id) {
				// Look up file by ID
				const inventory = await this.buildContentInventory();
				const item = inventory.items.find((item) => item.id === options.id);

				if (!item) {
					console.error(`❌ Content with ID "${options.id}" not found`);
					console.log("💡 Use 'list' command to see available content IDs");
					return { success: false, error: "Content not found" };
				}

				if (!item.fileExists) {
					console.log(`⚠️ Content ID "${options.id}" exists in content-menu but file is missing`);
					console.log(`   Expected file: ${item.filePath}`);
					console.log(`   Status: ${item.status}`);
					return { success: true };
				}

				targetFile = item.filePath;
			}

			// Ensure targetFile is defined
			if (!targetFile) {
				console.error(`❌ No target file specified`);
				return { success: false, error: "No target file" };
			}

			// Read and parse content file
			if (!existsSync(targetFile)) {
				console.error(`❌ File not found: ${targetFile}`);
				return { success: false, error: "File not found" };
			}

			try {
				// Import the content file dynamically
				let absolutePath: string;
				if (targetFile!.startsWith("/")) {
					absolutePath = targetFile!;
				} else {
					absolutePath = join(process.cwd(), targetFile!);
				}
				const contentModule = await import(absolutePath);
				contentData = contentModule.content || contentModule.default || contentModule;
			} catch (error) {
				console.error(
					`❌ Error reading content file: ${error instanceof Error ? error.message : String(error)}`
				);
				return { success: false, error: "Failed to read content" };
			}

			// Clean up old temporary files
			this.cleanupOldTempFiles();

			// Output based on format and output preference
			const outputFunction = () => {
				if (options.format === "json") {
					console.log(JSON.stringify(contentData, null, 2));
				} else if (options.format === "yaml") {
					// Simple YAML-like output (not using a YAML library for simplicity)
					this.outputYamlFormat(contentData);
				} else {
					// Default summary format
					this.outputSummaryFormat(contentData, targetFile!);
				}
			};

			// Use temporary file if requested, otherwise output to stdout
			this.captureOutput(outputFunction, !!options.outputFile, options.format || "summary", "view");

			return { success: true };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`❌ Content viewing failed: ${errorMessage}`);
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * Execute delete command
	 */
	private async executeDelete(options: {
		file?: string;
		id?: string;
		unit?: string;
		type?: string;
		status?: string;
		dryRun?: boolean;
		forceOverwrite?: boolean;
		verbose?: boolean;
	}): Promise<CliExecutionResult> {
		try {
			console.log("🗑️ Content Deletion");
			console.log("===================");

			if (options.dryRun) {
				console.log("🔍 DRY RUN MODE - Preview deletions only");
			}

			// Validate that at least one deletion criteria is provided
			if (!options.file && !options.id && !options.unit && !options.type && !options.status) {
				console.error("❌ Error: Must specify deletion criteria");
				console.log("Usage examples:");
				console.log("  --file=src/data/book/unit01/lesson.ts    # Delete specific file");
				console.log("  --id=01_01_lesson_dev_env                # Delete by unique ID");
				console.log("  --unit=1,2                               # Delete all Unit 1 and 2 content");
				console.log("  --type=quiz                              # Delete all quizzes");
				console.log("  --status=scaffold                        # Delete all scaffolded content");
				console.log("  --unit=1 --type=quiz                     # Delete Unit 1 quizzes only");
				return { success: false, error: "Missing deletion criteria" };
			}

			// Get content inventory for filtering
			const inventory = await this.buildContentInventory();
			let itemsToDelete = inventory.items;

			// Apply filters to determine what to delete
			if (options.file) {
				// Direct file deletion
				itemsToDelete = itemsToDelete.filter((item) => item.filePath === options.file);
				if (itemsToDelete.length === 0) {
					console.error(`❌ File not found: ${options.file}`);
					return { success: false, error: "File not found" };
				}
			} else {
				// Filter by provided criteria
				if (options.id) {
					const ids = options.id.split(",").map((id) => id.trim());
					itemsToDelete = itemsToDelete.filter((item) => ids.includes(item.id));
				}

				if (options.unit) {
					const units = options.unit.split(",").map((u) => u.trim().padStart(2, "0"));
					itemsToDelete = itemsToDelete.filter((item) => units.includes(item.unit));
				}

				if (options.type) {
					const types = options.type.split(",").map((t) => t.trim());
					itemsToDelete = itemsToDelete.filter((item) => types.includes(item.type));
				}

				if (options.status) {
					const statuses = options.status.split(",").map((s) => s.trim());
					itemsToDelete = itemsToDelete.filter((item) => statuses.includes(item.status));
				}

				// Only include items that actually exist
				itemsToDelete = itemsToDelete.filter((item) => item.fileExists);
			}

			if (itemsToDelete.length === 0) {
				console.log("ℹ️ No files found matching deletion criteria");
				return { success: true };
			}

			// Show what will be deleted
			console.log("");
			console.log(`📋 Files to delete: ${itemsToDelete.length} items`);
			console.log("");
			console.log(
				"Unit | Type        | ID                     | Title                          | File"
			);
			console.log(
				"-----|-------------|------------------------|--------------------------------|-----"
			);

			for (const item of itemsToDelete) {
				const unit = item.unit.padEnd(4);
				const type = item.type.padEnd(11);
				const id = item.id.padEnd(22);
				const title = this.truncateString(item.title, 30).padEnd(30);
				const fileIcon = item.fileExists ? "✅" : "❌";

				console.log(`${unit} | ${type} | ${id} | ${title} | ${fileIcon}`);
			}

			// Safety checks for bulk operations
			if (itemsToDelete.length > 10 && !options.forceOverwrite) {
				console.log("");
				console.error("❌ Safety check: Attempting to delete more than 10 files");
				console.error("   Use --force-overwrite flag if you're sure");
				console.error("   Or use --dry-run to preview deletions first");
				return { success: false, error: "Bulk deletion safety check failed" };
			}

			// Pre-check for final status content using ContentSafetyService
			const finalContent = itemsToDelete.filter((item) => item.status === "final");
			if (finalContent.length > 0) {
				console.log("");
				console.warn(
					`⚠️  Warning: ${finalContent.length} file(s) have 'final' status and require --force-overwrite:`
				);
				for (const item of finalContent) {
					console.warn(
						`   ${ContentSafetyService.getStatusDisplay(item.status as ContentStatus)} ${item.title}`
					);
				}
				if (!options.forceOverwrite) {
					console.error("❌ Use --force-overwrite flag to proceed with final content deletion");
					return { success: false, error: "Final content deletion requires force flag" };
				}
			}

			if (options.dryRun) {
				console.log("");
				console.log("✅ Dry run completed - No files were actually deleted");
				console.log("💡 Remove --dry-run flag to perform actual deletion");
				return { success: true };
			}

			// Perform actual deletions
			console.log("");
			console.log("🔄 Deleting files...");

			let deletedCount = 0;
			let errorCount = 0;

			for (const item of itemsToDelete) {
				try {
					// Safety checks are handled by ContentCore
					// Use ContentCore for deletion
					const result = await this.contentCore.deleteContent(item.filePath, {
						mode: options.forceOverwrite ? "force" : "safe"
					});

					if (result.success) {
						console.log(`✅ Deleted: ${item.filePath}`);
						deletedCount++;
					} else {
						console.error(`   ❌ SKIPPED: ${result.error}`);
						errorCount++;
					}
				} catch (error) {
					console.error(
						`❌ Failed to delete ${item.filePath}: ${error instanceof Error ? error.message : String(error)}`
					);
					errorCount++;
				}
			}

			console.log("");
			console.log("📊 Deletion Summary:");
			console.log(`   ✅ Successfully deleted: ${deletedCount} files`);
			if (errorCount > 0) {
				console.log(`   ❌ Failed to delete: ${errorCount} files`);
			}

			return { success: errorCount === 0 };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`❌ Content deletion failed: ${errorMessage}`);
			return { success: false, error: errorMessage };
		}
	}

	// ========================================================================
	// UTILITY METHODS
	// ========================================================================
	/**
	 * Parse JSON content from string
	 */
	private parseContentInput(input: string): Record<string, unknown> {
		const result = parseJsonSafely<Record<string, unknown>>(input);
		if (!result.isValid) {
			throw new Error(`Invalid JSON content: ${result.error}`);
		}
		return result.data!;
	}

	/**
	 * Read content from file path
	 */
	private readContentFromFile(filePath: string): Record<string, unknown> {
		try {
			const content = readFileSync(filePath, "utf-8");
			return this.parseContentInput(content);
		} catch (error) {
			throw new Error(
				`Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * Generate output path from content metadata
	 */
	private generateOutputPath(content: Record<string, unknown>): string {
		// Extract metadata for path generation
		const type = (content.type as string) || "content";
		const id = (content.id as string) || "unknown";

		// Generate path based on content structure
		return `${this.config.paths.outputFolder}/generated/${type}_${id}.ts`;
	}

	/**
	 * Get input format for data parsing
	 */
	private getInputFormat(options: Record<string, unknown>): SupportedFormat {
		return FormatProcessor.getEffectiveInputFormat(options);
	}

	/**
	 * Map content to internal file path based on ID or unit/chapter/type
	 */
	private async mapContentToInternalPath(
		options: {
			id?: string;
			unit?: string;
			chapter?: string;
			type?: string;
		},
		content: Record<string, unknown>
	): Promise<string> {
		// Extract or use content metadata
		const unit = options.unit || (content.unit as string);
		const chapter = options.chapter || (content.chapter as string);
		const type = options.type || (content.type as string);
		const id = options.id || (content.id as string);

		if (id) {
			// Use ID-based mapping - look up in content inventory
			try {
				const inventory = await this.buildContentInventory();
				const item = inventory.items.find((item) => item.id === id);
				if (item) {
					return item.filePath;
				}
			} catch {
				// Fallback to generation if inventory fails
			}
			// Generate path from ID if not found in inventory
			return this.generatePathFromId(id);
		}

		if (unit && chapter && type) {
			// Generate path from unit/chapter/type structure
			const unitPadded = unit.padStart(2, "0");
			const chapterPadded = chapter.padStart(2, "0");
			return `${this.config.paths.outputFolder}/unit${unitPadded}/${unitPadded}_${chapterPadded}_${type}.ts`;
		}

		throw new Error("Insufficient information to determine internal path");
	}

	/**
	 * Generate internal file path from content ID
	 */
	private generatePathFromId(id: string): string {
		// Parse ID to extract structure (e.g., "01_01_lesson_containers")
		const parts = id.split("_");
		if (parts.length >= 3) {
			const unit = parts[0];
			const chapter = parts[1];
			const type = parts[2];
			return `${this.config.paths.outputFolder}/unit${unit}/${unit}_${chapter}_${type}.ts`;
		}
		// Fallback to generated directory
		return `${this.config.paths.outputFolder}/generated/${id}.ts`;
	}

	// ============================================================================
	// HELPER METHODS FOR ENHANCED LIST COMMAND
	// ============================================================================

	/**
	 * Generate filename from unit, chapter, type and title
	 */
	private generateFileName(unit: string, chapter: string, type: string, title: string): string {
		const slug = this.createSlug(title);
		return `${unit}_${chapter}_${type}_${slug}.ts`;
	}

	/**
	 * Generate unique ID for content item using unified ID system
	 * Uses letter-based type suffixes for 100% uniqueness
	 */
	private generateUniqueId(unit: string, chapter: string, type: string, _title: string): string {
		// Convert unit and chapter to proper format
		const unitNum = unit.padStart(2, "0");
		const chapterNum = chapter.padStart(2, "0");

		// Use unified ID generation with type suffix
		return generateContentId(unitNum, chapterNum, type as ChapterType);
	}

	/**
	 * Create URL-safe slug from title
	 */
	private createSlug(title: string): string {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "_")
			.replace(/_+/g, "_")
			.replace(/^_|_$/g, "")
			.substring(0, 30);
	}

	/**
	 * Parse filename to extract unit, chapter, type info
	 */
	private parseFileName(fileName: string): { unit: string; chapter: string; type: string } | null {
		const match = fileName.match(/^(\d{2})_(\d{2})_([^_]+)_/);
		if (match) {
			return {
				unit: match[1],
				chapter: match[2],
				type: match[3]
			};
		}
		return null;
	}

	/**
	 * Get content status from file
	 */
	private async getContentStatus(filePath: string): Promise<ContentStatus | null> {
		try {
			const content = readFileSync(filePath, "utf-8");
			const statusMatch = content.match(/"status":\s*"([^"]+)"/);
			if (statusMatch) {
				return statusMatch[1] as ContentStatus;
			}
		} catch {
			// File doesn't exist or can't be read
		}
		return null;
	}

	/**
	 * Extract title from file content
	 */
	private async extractTitleFromFile(filePath: string): Promise<string | null> {
		try {
			const content = readFileSync(filePath, "utf-8");
			const titleMatch = content.match(/"title":\s*"([^"]+)"/);
			if (titleMatch) {
				return titleMatch[1];
			}
		} catch {
			// File doesn't exist or can't be read
		}
		return null;
	}

	/**
	 * Calculate inventory statistics
	 */
	private calculateInventoryStats(items: ContentInventoryItem[]): InventoryStats {
		const stats: InventoryStats = {
			total: items.length,
			existing: 0,
			missing: 0,
			byStatus: {
				expected: 0,
				scaffold: 0,
				draft: 0,
				review: 0,
				final: 0,
				orphan: 0
			}
		};

		for (const item of items) {
			if (item.fileExists) {
				stats.existing++;
			} else {
				stats.missing++;
			}

			stats.byStatus[item.status]++;
		}

		return stats;
	}

	/**
	 * Compare content items for sorting
	 */
	private compareContentItems(a: ContentInventoryItem, b: ContentInventoryItem): number {
		// Sort by unit, then chapter, then type
		if (a.unit !== b.unit) {
			return a.unit.localeCompare(b.unit);
		}
		if (a.chapter !== b.chapter) {
			return a.chapter.localeCompare(b.chapter);
		}
		return a.type.localeCompare(b.type);
	}

	/**
	 * Truncate string to specified length
	 */
	private truncateString(str: string, maxLength: number): string {
		if (str.length <= maxLength) {
			return str;
		}
		return str.substring(0, maxLength - 3) + "...";
	}

	/**
	 * Get display representation of content status
	 */
	private getStatusDisplay(status: ContentStatus): string {
		const statusMap: Record<ContentStatus, string> = {
			expected: "⏳ expected",
			scaffold: "🚧 scaffold",
			draft: "📝 draft",
			review: "👀 review",
			final: "✅ final",
			orphan: "🚨 orphan"
		};
		return statusMap[status] || status;
	}

	// ============================================================================
	// HELPER METHODS FOR VIEW COMMAND
	// ============================================================================

	/**
	 * Output content in summary format
	 */
	private outputSummaryFormat(content: Record<string, unknown>, filePath: string): void {
		console.log(`📄 File: ${filePath}`);
		console.log("");

		// Basic metadata
		if (content.type) console.log(`📋 Type: ${content.type}`);
		if (content.title) console.log(`📝 Title: ${content.title}`);
		if (content.status)
			console.log(`🏷️ Status: ${this.getStatusDisplay(content.status as ContentStatus)}`);
		if (content.difficulty) console.log(`📊 Difficulty: ${content.difficulty}`);
		if (content.estimatedTime) console.log(`⏱️ Estimated Time: ${content.estimatedTime} minutes`);

		// Learning objectives
		if (content.learningObjectives && Array.isArray(content.learningObjectives)) {
			console.log("");
			console.log("🎯 Learning Objectives:");
			content.learningObjectives.forEach((objective: string, index: number) => {
				console.log(`   ${index + 1}. ${objective}`);
			});
		}

		// Prerequisites
		if (content.prerequisites && Array.isArray(content.prerequisites)) {
			console.log("");
			console.log("📚 Prerequisites:");
			content.prerequisites.forEach((prereq: string) => {
				console.log(`   • ${prereq}`);
			});
		}

		// Summary/Description
		if (content.summary) {
			console.log("");
			console.log("📋 Summary:");
			console.log(`   ${content.summary}`);
		} else if (content.description) {
			console.log("");
			console.log("📋 Description:");
			console.log(`   ${content.description}`);
		}

		// Content structure
		if (content.sections && Array.isArray(content.sections)) {
			console.log("");
			console.log(`📖 Sections: ${content.sections.length} sections`);
			content.sections.forEach((section: Record<string, unknown>, index: number) => {
				if (section.title) {
					console.log(`   ${index + 1}. ${section.title}`);
				}
			});
		}

		// Questions for quizzes
		if (content.questions && Array.isArray(content.questions)) {
			console.log("");
			console.log(`❓ Questions: ${content.questions.length} questions`);
		}

		// Study guide items
		if (content.studyGuide && Array.isArray(content.studyGuide)) {
			console.log("");
			console.log(`📚 Study Items: ${content.studyGuide.length} items`);
		}

		// File size info
		try {
			const stats = statSync(filePath);
			const fileSizeKB = Math.round(stats.size / 1024);
			console.log("");
			console.log(`📊 File Size: ${fileSizeKB} KB`);
			console.log(`📅 Last Modified: ${stats.mtime.toLocaleDateString()}`);
		} catch {
			// Ignore file stat errors
		}
	}

	/**
	 * Output content in YAML-like format
	 */
	private outputYamlFormat(content: unknown, indent: number = 0): void {
		const indentStr = "  ".repeat(indent);

		if (typeof content === "string") {
			console.log(`${indentStr}"${content}"`);
		} else if (typeof content === "number" || typeof content === "boolean") {
			console.log(`${indentStr}${content}`);
		} else if (Array.isArray(content)) {
			content.forEach((item, _index) => {
				console.log(`${indentStr}- `);
				if (typeof item === "string") {
					console.log(`${indentStr}  "${item}"`);
				} else {
					this.outputYamlFormat(item, indent + 1);
				}
			});
		} else if (typeof content === "object" && content !== null) {
			for (const [key, value] of Object.entries(content)) {
				if (Array.isArray(value)) {
					console.log(`${indentStr}${key}:`);
					value.forEach((item, _index) => {
						console.log(`${indentStr}  - `);
						if (typeof item === "string") {
							console.log(`${indentStr}    "${item}"`);
						} else {
							this.outputYamlFormat(item, indent + 2);
						}
					});
				} else if (typeof value === "object" && value !== null) {
					console.log(`${indentStr}${key}:`);
					this.outputYamlFormat(value, indent + 1);
				} else if (typeof value === "string") {
					console.log(`${indentStr}${key}: "${value}"`);
				} else {
					console.log(`${indentStr}${key}: ${value}`);
				}
			}
		}
	}

	// ============================================================================
	// TEMPORARY FILE MANAGEMENT
	// ============================================================================

	/**
	 * Generate temporary output file path with timestamp and random ID
	 */
	private generateTempFilePath(format: string, operation: string): string {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const randomId = Math.random().toString(36).substring(2, 8);
		const extension = format === "json" ? "json" : format === "csv" ? "csv" : "txt";

		const tempDir = join(process.cwd(), "tmp");
		if (!existsSync(tempDir)) {
			mkdirSync(tempDir, { recursive: true });
		}

		return join(tempDir, `content-out-${operation}-${timestamp}-${randomId}.${extension}`);
	}

	/**
	 * Write output to temporary file and return path
	 */
	private writeToTempFile(content: string, format: string, operation: string): string {
		const tempPath = this.generateTempFilePath(format, operation);
		writeFileSync(tempPath, content, "utf-8");
		return tempPath;
	}

	/**
	 * Capture console output and optionally save to temporary file
	 */
	private captureOutput(
		outputFunction: () => void,
		saveToFile: boolean,
		format: string,
		operation: string
	): string | null {
		if (!saveToFile) {
			outputFunction();
			return null;
		}

		// Capture console output
		const originalLog = console.log;
		const outputs: string[] = [];

		console.log = (...args: unknown[]) => {
			outputs.push(
				args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ")
			);
		};

		try {
			outputFunction();
		} finally {
			console.log = originalLog;
		}

		const content = outputs.join("\n");
		const tempPath = this.writeToTempFile(content, format, operation);

		console.log(`📁 Output saved to temporary file: ${tempPath}`);
		console.log(`💡 File will be automatically cleaned up after 24 hours`);

		return tempPath;
	}

	/**
	 * Clean up old temporary files (called automatically)
	 */
	private cleanupOldTempFiles(): void {
		const tempDir = join(process.cwd(), "tmp");
		if (!existsSync(tempDir)) return;

		const now = Date.now();
		const dayInMs = 24 * 60 * 60 * 1000; // 24 hours

		try {
			const files = readdirSync(tempDir);
			for (const file of files) {
				if (file.startsWith("content-out-")) {
					const filePath = join(tempDir, file);
					const stats = statSync(filePath);

					if (now - stats.mtime.getTime() > dayInMs) {
						try {
							unlinkSync(filePath);
							console.log(`🧹 Cleaned up old temporary file: ${file}`);
						} catch {
							// Ignore cleanup errors
						}
					}
				}
			}
		} catch {
			// Ignore cleanup errors
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
	const cli = new ContentCreatorCLI();
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
