#!/usr/bin/env tsx

/**
 * Content Creator CLI - Unified Interface for All Content Operations
 *
 * This CLI provides a unified interface for all content manipulation operations,
 * supporting both automated scaffold generation and manual content CRUD operations.
 * All content operations flow through the shared Core API (ValidationService + RepositoryService).
 *
 * Architecture:
 * - Scaffold flow: CLI → ContentScaffoldingGenerator → TemplateGenerator → Core API
 * - Real content flow: CLI → Content Input (--inline/--file) → Core API
 * - Both flows converge on ValidationService + RepositoryService
 *
 * Commands:
 * - scaffold: Auto-generates placeholder content using ContentScaffoldingGenerator
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
 * Phase 2 Implementation:
 * - Uses Commander.js for command structure
 * - Integrates with ContentScaffoldingGenerator for scaffold command
 * - Implements Core API integration for all content operations
 * - Supports both template and real content workflows
 */

import { Command } from "commander";
import { readFileSync } from "fs";
import { join } from "path";
import { ContentScaffoldingGenerator } from "./content-scaffolding.js";
import { isValidChapterType } from "../lib/utils/content-type-utils.js";
import { parseJsonSafely } from "../lib/utils/validation-utils.js";
import type { ChapterType, ValidatedScaffoldingArgs } from "$types";

// ============================================================================
// CLI PROGRAM SETUP
// ============================================================================

const program = new Command();

// Read package.json for version info
let version = "1.0.0";
try {
	const packagePath = join(process.cwd(), "package.json");
	const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
	version = packageJson.version || "1.0.0";
} catch {
	// Use default version if package.json can't be read
}

program
	.name("content-creator")
	.description("Unified CLI for cloud-native learning content creation and management")
	.version(version);

// Global options
program
	.option("--dry-run", "Simulate operations without making changes to files")
	.option("--force-overwrite", "Required to overwrite or delete content with 'final' status");

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse JSON content from string using consolidated utility
 */
function parseContentInput(input: string): Record<string, unknown> {
	const result = parseJsonSafely<Record<string, unknown>>(input);
	if (!result.isValid) {
		console.error("❌ Error parsing JSON content:");
		console.error(result.error);
		process.exit(1);
	}
	return result.data!;
}

/**
 * Read content from file path
 */
function readContentFromFile(filePath: string): Record<string, unknown> {
	try {
		const content = readFileSync(filePath, "utf-8");
		return parseContentInput(content);
	} catch (error) {
		console.error(`❌ Error reading file ${filePath}:`);
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

/**
 * Validate content type using consolidated utility
 */
function validateContentType(type: string): ChapterType {
	if (!isValidChapterType(type)) {
		console.error(`❌ Invalid content type: ${type}`);
		console.error(`Valid types: overview, lesson, study_guide, quiz, exam, project`);
		process.exit(1);
	}
	return type;
}

/**
 * Display dry-run information
 */
function displayDryRunInfo(operation: string, details: string): void {
	console.log("🏃 DRY-RUN MODE - No changes will be made");
	console.log(`Operation: ${operation}`);
	console.log(`Details: ${details}`);
	console.log("");
}

// ============================================================================
// COMMAND IMPLEMENTATIONS
// ============================================================================

/**
 * Scaffold Command - Auto-generates placeholder content
 */
program
	.command("scaffold")
	.description("Auto-generate placeholder content for missing files")
	.option("-u, --unit <unit>", "Unit filter (number or string)")
	.option("-t, --type <type>", "Content type filter")
	.option("-i, --id <id>", "Chapter ID filter")
	.action(async (options) => {
		const globalOptions = program.opts();

		if (globalOptions.dryRun) {
			const filters = [];
			if (options.unit) filters.push(`Unit: ${options.unit}`);
			if (options.type) filters.push(`Type: ${options.type}`);
			if (options.id) filters.push(`ID: ${options.id}`);

			displayDryRunInfo(
				"Scaffold Generation",
				filters.length > 0 ? filters.join(", ") : "All missing content"
			);
		}

		try {
			console.log("🔄 Content Creator CLI - Scaffold Command");
			console.log("=========================================");
			console.log("");

			// Use ContentScaffoldingGenerator for scaffold operations
			const generator = new ContentScaffoldingGenerator();

			// Build arguments for ContentScaffoldingGenerator
			let args: ValidatedScaffoldingArgs | undefined;

			// If all three parameters are provided, use single-file mode
			if (options.unit && options.type && options.id) {
				args = {
					unit: options.unit,
					type: validateContentType(options.type),
					id: options.id
				};
			}
			// Otherwise, use flexible batch mode by manipulating process.argv
			else if (options.unit || options.type || options.id) {
				// Build argv for ContentScaffoldingGenerator
				const scaffoldArgs = [];
				if (options.unit) scaffoldArgs.push(`--unit=${options.unit}`);
				if (options.type) scaffoldArgs.push(`--type=${options.type}`);
				if (options.id) scaffoldArgs.push(`--id=${options.id}`);

				// Temporarily modify process.argv
				const originalArgv = process.argv.slice();
				process.argv = ["node", "content-scaffolding.ts", ...scaffoldArgs];

				const success = await generator.generate();

				// Restore original argv
				process.argv = originalArgv;

				if (!success) {
					console.error("❌ Scaffold generation failed");
					process.exit(1);
				}
				return;
			}

			// Execute scaffolding
			const success = await generator.generate(args);

			if (!success) {
				console.error("❌ Scaffold generation failed");
				process.exit(1);
			}

			console.log("✅ Scaffold generation completed successfully!");
		} catch (error) {
			console.error("❌ Error in scaffold command:");
			console.error(error instanceof Error ? error.message : String(error));
			process.exit(1);
		}
	});

/**
 * Create Command - Creates new content with user-provided data
 */
program
	.command("create")
	.description("Create new content with real, user-provided data")
	.requiredOption("-t, --type <type>", "Content type (lesson, quiz, study_guide, exam, project)")
	.requiredOption("-u, --unit <unit>", "Unit number")
	.requiredOption("-c, --chapter <id>", "Chapter ID")
	.option("--inline <json>", "Inline JSON content")
	.option("--file <path>", "Path to JSON content file")
	.action(async (options) => {
		const globalOptions = program.opts();

		// Validate input options
		if (!options.inline && !options.file) {
			console.error("❌ Either --inline or --file must be specified");
			process.exit(1);
		}

		if (options.inline && options.file) {
			console.error("❌ Cannot specify both --inline and --file");
			process.exit(1);
		}

		// Get content from input
		const content = options.inline
			? parseContentInput(options.inline)
			: readContentFromFile(options.file);

		const contentType = validateContentType(options.type);

		if (globalOptions.dryRun) {
			displayDryRunInfo(
				"Create Content",
				`${contentType} for Unit ${options.unit}, Chapter ${options.chapter}`
			);
			console.log("Content preview:", JSON.stringify(content, null, 2).substring(0, 200) + "...");
			return;
		}

		try {
			console.log("🔄 Content Creator CLI - Create Command");
			console.log("======================================");
			console.log("");
			console.log(`Creating ${contentType} content...`);
			console.log(`Unit: ${options.unit}`);
			console.log(`Chapter: ${options.chapter}`);
			console.log("");

			// TODO: Implement Core API integration
			// This will be implemented in Phase 2 as the Core API services are developed
			console.log(
				"⚠️  Core API integration pending - content creation workflow not yet implemented"
			);
			console.log("📋 Planned workflow:");
			console.log("   1. Validate content using ValidationService");
			console.log("   2. Check safety constraints using RepositoryService");
			console.log("   3. Write formatted file using RepositoryService");
			console.log("");
			console.log("Current implementation uses ContentScaffoldingGenerator for reference.");
		} catch (error) {
			console.error("❌ Error in create command:");
			console.error(error instanceof Error ? error.message : String(error));
			process.exit(1);
		}
	});

/**
 * Update Command - Updates existing content
 */
program
	.command("update")
	.description("Update existing content file")
	.requiredOption("-f, --file <path>", "Path to content file to update")
	.option("--inline <json>", "Inline JSON content")
	.option("--input <path>", "Path to JSON content file")
	.action(async (options) => {
		const globalOptions = program.opts();

		// Validate input options
		if (!options.inline && !options.input) {
			console.error("❌ Either --inline or --input must be specified");
			process.exit(1);
		}

		if (options.inline && options.input) {
			console.error("❌ Cannot specify both --inline and --input");
			process.exit(1);
		}

		// Get content from input
		const content = options.inline
			? parseContentInput(options.inline)
			: readContentFromFile(options.input);

		if (globalOptions.dryRun) {
			displayDryRunInfo("Update Content", `File: ${options.file}`);
			console.log("Content preview:", JSON.stringify(content, null, 2).substring(0, 200) + "...");
			return;
		}

		try {
			console.log("🔄 Content Creator CLI - Update Command");
			console.log("======================================");
			console.log("");
			console.log(`Updating content file: ${options.file}`);
			console.log("");

			// TODO: Implement Core API integration
			console.log("⚠️  Core API integration pending - content update workflow not yet implemented");
			console.log("📋 Planned workflow:");
			console.log("   1. Read existing content and check status");
			console.log("   2. Apply safety constraints (final status requires --force-overwrite)");
			console.log("   3. Validate new content using ValidationService");
			console.log("   4. Write updated file using RepositoryService");
		} catch (error) {
			console.error("❌ Error in update command:");
			console.error(error instanceof Error ? error.message : String(error));
			process.exit(1);
		}
	});

/**
 * Validate Command - Validates content without writing
 */
program
	.command("validate")
	.description("Validate content file against the full validation pipeline")
	.requiredOption("-f, --file <path>", "Path to content file to validate")
	.action(async (options) => {
		const globalOptions = program.opts();

		if (globalOptions.dryRun) {
			displayDryRunInfo("Validate Content", `File: ${options.file}`);
			return;
		}

		try {
			console.log("🔄 Content Creator CLI - Validate Command");
			console.log("========================================");
			console.log("");
			console.log(`Validating content file: ${options.file}`);
			console.log("");

			// TODO: Implement ValidationService integration
			console.log(
				"⚠️  ValidationService integration pending - validation workflow not yet implemented"
			);
			console.log("📋 Planned workflow:");
			console.log("   1. Read content file");
			console.log("   2. Run Zod schema validation");
			console.log("   3. Run content-specific validation (e.g., Mermaid diagrams)");
			console.log("   4. Report validation results");
		} catch (error) {
			console.error("❌ Error in validate command:");
			console.error(error instanceof Error ? error.message : String(error));
			process.exit(1);
		}
	});

/**
 * List Command - Lists existing content with filtering
 */
program
	.command("list")
	.description("List existing content with filtering capabilities")
	.option("-u, --unit <number>", "Filter by unit number")
	.option("-c, --chapter <id>", "Filter by chapter ID")
	.option("-t, --type <type>", "Filter by content type")
	.option("-s, --status <status>", "Filter by content status (scaffold, draft, final)")
	.action(async (options) => {
		const globalOptions = program.opts();

		if (globalOptions.dryRun) {
			const filters = [];
			if (options.unit) filters.push(`Unit: ${options.unit}`);
			if (options.chapter) filters.push(`Chapter: ${options.chapter}`);
			if (options.type) filters.push(`Type: ${options.type}`);
			if (options.status) filters.push(`Status: ${options.status}`);

			displayDryRunInfo("List Content", filters.length > 0 ? filters.join(", ") : "All content");
			return;
		}

		try {
			console.log("🔄 Content Creator CLI - List Command");
			console.log("====================================");
			console.log("");

			// TODO: Implement RepositoryService integration for discovery
			console.log(
				"⚠️  RepositoryService integration pending - content discovery not yet implemented"
			);
			console.log("📋 Planned workflow:");
			console.log("   1. Scan content directories using RepositoryService");
			console.log("   2. Apply filters based on command options");
			console.log("   3. Display formatted list with status information");
			console.log("");
			console.log("Applied filters:");
			if (options.unit) console.log(`  Unit: ${options.unit}`);
			if (options.chapter) console.log(`  Chapter: ${options.chapter}`);
			if (options.type) console.log(`  Type: ${options.type}`);
			if (options.status) console.log(`  Status: ${options.status}`);
		} catch (error) {
			console.error("❌ Error in list command:");
			console.error(error instanceof Error ? error.message : String(error));
			process.exit(1);
		}
	});

/**
 * Delete Command - Safely deletes content files
 */
program
	.command("delete")
	.description("Delete content file with safety constraints")
	.requiredOption("-f, --file <path>", "Path to content file to delete")
	.action(async (options) => {
		const globalOptions = program.opts();

		if (globalOptions.dryRun) {
			displayDryRunInfo("Delete Content", `File: ${options.file}`);
			return;
		}

		try {
			console.log("🔄 Content Creator CLI - Delete Command");
			console.log("======================================");
			console.log("");
			console.log(`Deleting content file: ${options.file}`);
			console.log("");

			// TODO: Implement RepositoryService integration
			console.log(
				"⚠️  RepositoryService integration pending - content deletion not yet implemented"
			);
			console.log("📋 Planned workflow:");
			console.log("   1. Read existing content and check status");
			console.log("   2. Apply safety constraints (final status requires --force-overwrite)");
			console.log("   3. Confirm deletion with user prompt");
			console.log("   4. Delete file using RepositoryService");

			if (globalOptions.forceOverwrite) {
				console.log("🔓 Force overwrite enabled - will delete even 'final' status content");
			}
		} catch (error) {
			console.error("❌ Error in delete command:");
			console.error(error instanceof Error ? error.message : String(error));
			process.exit(1);
		}
	});

// ============================================================================
// ERROR HANDLING AND EXECUTION
// ============================================================================

/**
 * Handle unknown commands
 */
program.on("command:*", (operands) => {
	console.error(`❌ Unknown command: ${operands[0]}`);
	console.error("");
	console.error("Available commands:");
	console.error("  scaffold  - Auto-generate placeholder content");
	console.error("  create    - Create new content with user data");
	console.error("  update    - Update existing content");
	console.error("  validate  - Validate content file");
	console.error("  list      - List existing content");
	console.error("  delete    - Delete content file");
	console.error("");
	console.error("Use --help for detailed usage information");
	process.exit(1);
});

/**
 * Handle no command provided
 */
if (process.argv.length <= 2) {
	console.log("🔄 Content Creator CLI");
	console.log("======================");
	console.log("");
	console.log("Unified interface for cloud-native learning content creation and management.");
	console.log("");
	console.log("Usage: content-creator <command> [options]");
	console.log("");
	console.log("Commands:");
	console.log("  scaffold  Auto-generate placeholder content for missing files");
	console.log("  create    Create new content with real, user-provided data");
	console.log("  update    Update existing content file");
	console.log("  validate  Validate content file against validation pipeline");
	console.log("  list      List existing content with filtering capabilities");
	console.log("  delete    Delete content file with safety constraints");
	console.log("");
	console.log("Global Options:");
	console.log("  --dry-run          Simulate operations without making changes");
	console.log("  --force-overwrite  Required to modify/delete 'final' status content");
	console.log("  --help            Display help information");
	console.log("  --version         Display version information");
	console.log("");
	console.log("Examples:");
	console.log("  content-creator scaffold --unit=1 --type=lesson");
	console.log(
		'  content-creator create --type=lesson --unit=1 --chapter="01_01" --inline \'{"type":"lesson"}\''
	);
	console.log("  content-creator validate --file=src/data/book/unit01/lesson.ts");
	console.log("  content-creator list --unit=1 --status=draft");
	console.log("");
	console.log("Use 'content-creator <command> --help' for command-specific help.");
	process.exit(0);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Parse command line arguments and execute
 */
async function main(): Promise<void> {
	try {
		await program.parseAsync(process.argv);
	} catch (error) {
		console.error("❌ Fatal error:");
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

// Execute main function if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error("Fatal error:", error);
		process.exit(1);
	});
}

export { main };
