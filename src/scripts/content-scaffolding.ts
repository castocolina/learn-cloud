#!/usr/bin/env tsx

/**
 * Content Scaffolding Generator for Cloud-Native Learning Platform
 *
 * Modern TypeScript replacement for the Python content scaffolding generator.
 * Uses ts-morph for AST-based generation to ensure syntactic correctness and type safety.
 *
 * Features:
 * - CLI argument parsing for unit, type, and ID specification
 * - AST-based TypeScript code generation using ts-morph
 * - Type-safe content generation using unified TypeScript interfaces
 * - Configurable content requirements via src/config/settings.ts
 * - Diverse question types for quizzes and exams
 * - Diverse diagram types for lessons and projects
 * - Automatic placeholder content with lorem ipsum text
 * - Integration with project build system (package.json, Makefile)
 *
 * Usage:
 *   pnpm run scaffold-content -- --unit="python-backend" --type="lesson" --id="1-1"
 *   npx tsx src/scripts/content-scaffolding.ts --unit="python-backend" --type="quiz" --id="1-2"
 *
 * Generated files follow the pattern defined in CONTENT-STANDARDS.md and use
 * the unified type system from src/lib/types/ for maximum type safety.
 */

import {
	Project,
	SourceFile,
	VariableDeclarationKind,
	ModuleKind,
	ModuleResolutionKind,
	ScriptTarget
} from "ts-morph";
import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { dirname, join, basename } from "path";
import { parseArgs } from "util";
import { SETTINGS } from "$config/settings.js";
import { writeFormattedFile } from "../lib/utils/prettier-writer.js";
import { runGeneratedFileValidation } from "../lib/utils/validation-utils.js";
import { generateNavigationPaths } from "../lib/utils/navigation-paths.js";
import { contentMenu } from "../data/generated/content-menu.js";
import { TemplateGenerator } from "../lib/utils/template-generator.js";
import type {
	MenuUnit,
	MenuChapter,
	ChapterType,
	UnifiedPathConfig,
	LessonContent,
	QuizContent,
	StudyGuideContent,
	ExamContent,
	ProjectContent
} from "$types";
import type {
	ValidatedScaffoldingArgs,
	UnitIdentification,
	ScaffoldingStats
} from "$types/scaffolding";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// CLI argument interface - enhanced for flexible unit identification (used internally by parseArgs)
interface _ScaffoldingArgs {
	unit?: string;
	type?: ChapterType;
	id?: string;
	help?: boolean;
	"list-units"?: boolean;
	"list-chapters"?: boolean;
}

// Internal types kept in this script

// Get configuration from settings
const CONFIG = SETTINGS.scripts.scaffolding;

// Template generation moved to TemplateGenerator utility
// This keeps the CLI coordination focused and clean

// ============================================================================
// CLI COORDINATION UTILITIES
// ============================================================================

/**
 * Normalize ID input to consistent zero-padded underscore format
 *
 * This function standardizes all ID variations into the project's consistent format:
 * - Converts dots to underscores: "1.1" → "01_01"
 * - Applies zero-padding: "1" → "01_01", "1.10" → "01_10"
 * - Preserves existing format if already correct: "01_01" → "01_01"
 * - Handles edge cases: "1-1" → "01_01", "1_1" → "01_01"
 *
 * @param idInput - Raw ID string from command line (e.g., "1", "1.1", "01_01")
 * @returns Normalized ID in format "XX_YY" (e.g., "01_01", "01_10")
 *
 * @example
 * normalizeId("1") → "01_01"
 * normalizeId("1.1") → "01_01"
 * normalizeId("1.10") → "01_10"
 * normalizeId("2.3") → "02_03"
 * normalizeId("01_01") → "01_01"
 */
function normalizeId(idInput: string): string {
	// Remove any whitespace
	const cleanInput = idInput.trim();

	// If input is empty or invalid, return default format
	if (!cleanInput) {
		return "01_01";
	}

	// Handle various separators: dots, dashes, underscores, or spaces
	const separatorRegex = /[.\-_\s]+/;
	const parts = cleanInput.split(separatorRegex);

	// If no separator found, treat as single number (assume it's the chapter)
	if (parts.length === 1) {
		const num = parseInt(parts[0], 10);
		if (isNaN(num) || num < 1) {
			return "01_01"; // Default fallback
		}
		// Single number becomes "0X_01" (unit X, chapter 1)
		return `${num.toString().padStart(2, "0")}_01`;
	}

	// Extract first two meaningful parts (unit and chapter)
	const unitPart = parts[0];
	const chapterPart = parts[1];

	// Parse unit number
	const unitNum = parseInt(unitPart, 10);
	const unit = isNaN(unitNum) || unitNum < 1 ? 1 : unitNum;

	// Parse chapter number
	const chapterNum = parseInt(chapterPart, 10);
	const chapter = isNaN(chapterNum) || chapterNum < 1 ? 1 : chapterNum;

	// Return zero-padded format
	return `${unit.toString().padStart(2, "0")}_${chapter.toString().padStart(2, "0")}`;
}

/**
 * Get human-readable description for content type
 */
function getTypeDescription(type: ChapterType): string {
	switch (type) {
		case "overview":
			return "Unit overview and introduction";
		case "lesson":
			return "Learning content with sections and examples";
		case "study_guide":
			return "Flashcards and study materials";
		case "quiz":
			return "Assessment with multiple question types";
		case "exam":
			return "Comprehensive examination";
		case "project":
			return "Hands-on project with requirements";
		default:
			return "Content type";
	}
}

// ============================================================================
// UNIT IDENTIFICATION FUNCTIONS
// ============================================================================

/**
 * Identify unit based on string or numeric input
 */
function identifyUnit(unitInput: string): UnitIdentification {
	const units = contentMenu.units;

	// Check if input is numeric
	const numericUnit = parseInt(unitInput, 10);
	if (!isNaN(numericUnit)) {
		// Numeric identification (most precise)
		const matchedUnit = units.find((unit) => unit.unitNumber === numericUnit);
		if (matchedUnit) {
			return {
				unitNumber: matchedUnit.unitNumber,
				technologyUnit: matchedUnit.technologyUnit,
				isAmbiguous: false
			};
		} else {
			// Invalid unit number
			return {
				isAmbiguous: false,
				matchedUnits: []
			};
		}
	}

	// String-based identification
	const normalizedInput = unitInput.toLowerCase();
	const exactMatches = units.filter(
		(unit) => unit.technologyUnit.toLowerCase() === normalizedInput
	);

	if (exactMatches.length === 1) {
		// Unique string match
		const match = exactMatches[0];
		return {
			unitNumber: match.unitNumber,
			technologyUnit: match.technologyUnit,
			isAmbiguous: false
		};
	} else if (exactMatches.length > 1) {
		// Ambiguous string match
		return {
			isAmbiguous: true,
			matchedUnits: exactMatches.map((unit) => ({
				unitNumber: unit.unitNumber,
				title: unit.title,
				technologyUnit: unit.technologyUnit
			}))
		};
	}

	// No matches found
	return {
		isAmbiguous: false,
		matchedUnits: []
	};
}

/**
 * Display available units for discovery
 */
function displayAvailableUnits(): void {
	console.log("📋 Available Units:");
	console.log("===================");

	contentMenu.units.forEach((unit) => {
		console.log(`  ${unit.unitNumber}: ${unit.technologyUnit} - ${unit.title}`);
	});

	console.log("\nUsage Examples:");
	console.log("  --unit=1          (numeric - most precise)");
	console.log('  --unit="python"    (string - for unique technologies)');
	console.log('  --unit="go"        (string - for unique technologies)');
	console.log("  --unit=3          (numeric - required for microservices units)");
}

/**
 * Display available chapters for a specific unit
 */
function displayAvailableChapters(unitNumber: number): void {
	const unit = contentMenu.units.find((u) => u.unitNumber === unitNumber);
	if (!unit) {
		console.error(`Unit ${unitNumber} not found`);
		return;
	}

	console.log(`📋 Available Chapters for Unit ${unitNumber}: ${unit.title}`);
	console.log("=".repeat(80));

	const chaptersByType = unit.chapters.reduce(
		(acc, chapter) => {
			if (!acc[chapter.type]) acc[chapter.type] = [];
			acc[chapter.type].push(chapter);
			return acc;
		},
		{} as Record<ChapterType, MenuChapter[]>
	);

	Object.entries(chaptersByType).forEach(([type, chapters]) => {
		console.log(`\n📚 ${type.toUpperCase().replace("_", " ")}:`);
		chapters.forEach((chapter) => {
			console.log(`  ${chapter.id}: ${chapter.title}`);
		});
	});

	console.log("\nUsage Example:");
	console.log(`  --unit=${unitNumber} --type=lesson --id=${unit.chapters[0]?.id || "chapter-id"}`);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Template generation functions moved to TemplateGenerator utility

// Diagram generation moved to TemplateGenerator utility

// Content section generation moved to TemplateGenerator utility

// Question generation moved to TemplateGenerator utility

// Flashcard generation moved to TemplateGenerator utility

// ============================================================================
// CONTENT GENERATORS
// ============================================================================

// Template generation functions moved to TemplateGenerator utility
// This maintains separation of concerns: CLI coordination vs template generation

// All template generation functions moved to TemplateGenerator utility

// Project generation and content generator functions moved to TemplateGenerator utility

// ============================================================================
// FILE GENERATION AND AST MANIPULATION
// ============================================================================

/**
 * Create TypeScript source file with proper imports and content structure
 */
function createContentFile(
	project: Project,
	filePath: string,
	args: ValidatedScaffoldingArgs
): SourceFile {
	// Create source file
	const sourceFile = project.createSourceFile(filePath, "", { overwrite: false });

	// Determine content type for imports
	const contentType = args.type;
	const importTypes: string[] = [];

	switch (contentType) {
		case "lesson":
		case "overview":
			importTypes.push("LessonContent", "ContentSection");
			break;
		case "quiz":
			importTypes.push(
				"QuizContent",
				"Quiz",
				"SingleChoiceQuestion",
				"MultipleChoiceQuestion",
				"CodeCompletionQuestion",
				"TrueFalseQuestion",
				"DragAndDropQuestion"
			);
			break;
		case "study_guide":
			importTypes.push("StudyGuideContent", "StudyGuide", "Flashcard");
			break;
		case "exam":
			importTypes.push(
				"ExamContent",
				"Exam",
				"AnyQuestion",
				"SingleChoiceQuestion",
				"MultipleChoiceQuestion",
				"CodeCompletionQuestion",
				"TrueFalseQuestion",
				"DragAndDropQuestion"
			);
			break;
		case "project":
			importTypes.push("ProjectContent", "ContentSection");
			break;
		default:
			importTypes.push("LessonContent", "ContentSection");
			break;
	}

	// Add import statements with underscore prefix to indicate they're for type validation only
	if (importTypes.length > 0) {
		sourceFile.addImportDeclaration({
			moduleSpecifier: "$types",
			namedImports: importTypes.map((type) => ({
				name: type,
				alias: `_${type}`, // Use underscore prefix to avoid unused variable lint errors
				isTypeOnly: true
			}))
		});
	}

	// Add file header comment
	sourceFile.insertText(
		0,
		`/**
 * Generated content scaffolding for: ${args.unit} - ${args.type} - ${args.id}
 *
 * STATUS: This is scaffolded content with placeholder data.
 * Replace with real educational material following CONTENT-STANDARDS.md
 *
 * Content Requirements (from src/config/settings.ts):
 * - Lessons: ${CONFIG.lessons.sections} sections, ${CONFIG.lessons.codeBlocks} code blocks, ${CONFIG.lessons.diagrams} diagrams
 * - Quizzes: ${CONFIG.quizzes.questions} questions (diverse types: ${CONFIG.quizzes.diverseTypes})
 * - Exams: ${CONFIG.exams.questions} questions (diverse types: ${CONFIG.exams.diverseTypes})
 * - Study Guides: ${CONFIG.studyGuides.flashcards} flashcards
 * - Projects: ${CONFIG.projects.sections} sections, ${CONFIG.projects.requirements} requirements
 *
 * Generated by: content-scaffolding.ts
 * Generated at: ${new Date().toISOString()}
 */

`
	);

	return sourceFile;
}

/**
 * Parse CLI arguments with validation - enhanced for flexible unit identification
 *
 * CRITICAL: This function validates all arguments and terminates early with clear error messages
 * if any required arguments are missing or invalid. It will NEVER return undefined values
 * that could be used in path construction.
 */
async function parseCliArguments(): Promise<ValidatedScaffoldingArgs> {
	const { values } = parseArgs({
		args: process.argv.slice(2),
		options: {
			unit: {
				type: "string",
				short: "u"
			},
			type: {
				type: "string",
				short: "t"
			},
			id: {
				type: "string",
				short: "i"
			},
			help: {
				type: "boolean",
				short: "h"
			},
			"list-units": {
				type: "boolean"
			},
			"list-chapters": {
				type: "boolean"
			}
		},
		strict: false,
		allowPositionals: true
	});

	// Handle discovery options first
	if (values["list-units"]) {
		displayAvailableUnits();
		process.exit(0);
	}

	if (values["list-chapters"]) {
		if (!values.unit || typeof values.unit !== "string") {
			console.error("Error: --list-chapters requires --unit parameter");
			console.error("Use --list-units to see available units first");
			process.exit(1);
		}

		const unitIdentification = identifyUnit(values.unit);
		if (!unitIdentification.unitNumber) {
			console.error(`Error: Unit "${values.unit}" not found`);
			console.error("Use --list-units to see available units");
			process.exit(1);
		}

		displayAvailableChapters(unitIdentification.unitNumber);
		process.exit(0);
	}

	if (values.help) {
		console.log(`
Content Scaffolding Generator - Ultra-Flexible Batch Generation

USAGE:
  Data-driven mode (processes all chapters from content-menu.ts):
    pnpm run scaffold-content
    npx tsx src/scripts/content-scaffolding.ts

  Flexible batch mode (any combination of filters):
    pnpm run scaffold-content -- --unit=1                    # All content for Unit 1
    pnpm run scaffold-content -- --type=lesson               # All lessons across all units
    pnpm run scaffold-content -- --unit=1 --type=lesson      # All lessons for Unit 1
    pnpm run scaffold-content -- --id=01_01                  # All content types for chapter 01_01
    pnpm run scaffold-content -- --unit=1 --id=01_01         # All types for chapter 01_01 in Unit 1
    pnpm run scaffold-content -- --type=quiz --id=01_02      # Quiz for chapter 01_02 across all matching units

  Parameter-based mode (single chapter - all three parameters required):
    pnpm run scaffold-content -- --unit=1 --type="lesson" --id="01_01"

  Discovery mode (explore available content):
    pnpm run scaffold-content -- --list-units
    pnpm run scaffold-content -- --list-chapters --unit=1

MODES:
  🔄 Data-driven mode (default when no arguments provided):
     • Reads all chapters from src/data/generated/content-menu.ts
     • Creates only missing files (idempotent execution)
     • Scans for orphan files not referenced in content menu
     • Provides comprehensive summary report with statistics

  ⚡ Flexible batch mode (when partial arguments provided):
     • Any combination of --unit, --type, --id filters supported
     • Generates all matching content from content-menu.ts
     • Maximum flexibility: mix and match filters as needed
     • Idempotent execution (skips existing files)

  📋 Parameter-based mode (when all three arguments provided):
     • Creates a single content file with specified parameters
     • Supports flexible unit identification (numeric or string)

  🔍 Discovery mode:
     • --list-units: Shows all available units
     • --list-chapters --unit=N: Shows chapters for specific unit

UNIT IDENTIFICATION:
  Numeric (most precise):     --unit=1, --unit=2, --unit=3
  String (for unique techs):  --unit="python", --unit="go"
  Note: Units 3-9 use "microservices" - use numeric identification

ARGUMENTS:
  --unit, -u           Unit filter (number or string)
  --type, -t           Content type filter (lesson, quiz, study_guide, exam, project)
  --id, -i             Chapter ID filter (matches exact or base pattern like 01_01)
  --help, -h           Show this help message
  --list-units         Display all available units
  --list-chapters      Display chapters for specified unit

FLEXIBLE BATCH EXAMPLES:
  --unit=1                    Generate ALL content for Unit 1 (lessons, quizzes, etc.)
  --type=lesson               Generate ALL lessons across ALL units
  --unit=1 --type=lesson      Generate ALL lessons for Unit 1 only
  --id=01_01                  Generate ALL content types for chapter 01_01
  --unit=1 --id=01_01         Generate ALL types for chapter 01_01 in Unit 1
  --type=quiz --id=01_02      Generate quiz for chapter 01_02 (any matching unit)
  --unit="python" --type=quiz Generate ALL quizzes for Python unit

Current Configuration (from src/config/settings.ts):
  Lessons:      ${CONFIG.lessons.sections} sections, ${CONFIG.lessons.codeBlocks} code blocks, ${CONFIG.lessons.diagrams} diagrams
  Quizzes:      ${CONFIG.quizzes.questions} questions (diverse types: ${CONFIG.quizzes.diverseTypes})
  Exams:        ${CONFIG.exams.questions} questions (diverse types: ${CONFIG.exams.diverseTypes})
  Study Guides: ${CONFIG.studyGuides.flashcards} flashcards
  Projects:     ${CONFIG.projects.sections} sections, ${CONFIG.projects.requirements} requirements

Examples:
  pnpm run scaffold-content -- --unit=1 --type="lesson" --id="01_01"  # Single file
  pnpm run scaffold-content -- --unit=1                              # All Unit 1 content
  pnpm run scaffold-content -- --type=lesson                         # All lessons
  pnpm run scaffold-content -- --unit="python" --type="quiz"         # Python quizzes
  pnpm run scaffold-content -- --list-units
  pnpm run scaffold-content -- --list-chapters --unit=1
`);
		process.exit(0);
	}

	// CRITICAL INPUT VALIDATION: Ensure no undefined values can proceed
	// This prevents the creation of files with 'undefined' in their paths
	if (!values.unit && !values.type && !values.id) {
		console.error("❌ ERROR: Missing required arguments");
		console.error("");
		console.error(
			"The content scaffolding generator requires at least one of the following arguments:"
		);
		console.error("  --unit=<unit>     Unit identifier (number or string)");
		console.error("  --type=<type>     Content type (lesson, quiz, study_guide, exam, project)");
		console.error("  --id=<id>         Chapter ID");
		console.error("");
		console.error("Examples:");
		console.error(
			'  npx tsx src/scripts/content-scaffolding.ts --unit=1 --type=lesson --id="01_01"'
		);
		console.error(
			"  npx tsx src/scripts/content-scaffolding.ts --unit=1  # Show all Unit 1 content"
		);
		console.error("  npx tsx src/scripts/content-scaffolding.ts --type=quiz  # Show all quizzes");
		console.error("");
		console.error("For exploration:");
		console.error("  --help            Show full usage information");
		console.error("  --list-units      Show all available units");
		console.error("");
		process.exit(1);
	}

	// Check if this should trigger flexible batch generation
	const hasPartialArgs =
		(values.unit && typeof values.unit === "string") || values.type || values.id;
	const hasAllRequiredArgs = values.unit && values.type && values.id;

	// Handle flexible batch generation - any combination of unit, type, id (but not all three)
	if (hasPartialArgs && !hasAllRequiredArgs) {
		let unitNumber: number | undefined;

		// Validate unit if provided - handle string/boolean type issue
		if (values.unit && typeof values.unit === "string") {
			const unitIdentification = identifyUnit(values.unit);

			if (unitIdentification.isAmbiguous && unitIdentification.matchedUnits) {
				console.error(`Error: Ambiguous unit identifier "${values.unit}"`);
				console.error("Multiple units match this identifier:");
				unitIdentification.matchedUnits.forEach((unit) => {
					console.error(`  Unit ${unit.unitNumber}: ${unit.title}`);
				});
				console.error("\nUse numeric unit identifier for precision:");
				unitIdentification.matchedUnits.forEach((unit) => {
					console.error(`  --unit=${unit.unitNumber}`);
				});
				process.exit(1);
			}

			if (!unitIdentification.unitNumber) {
				console.error(`Error: Unit "${values.unit}" not found`);
				console.error("Use --list-units to see available units");
				process.exit(1);
			}

			unitNumber = unitIdentification.unitNumber;
		}

		// Execute flexible batch generation and exit
		// Normalize ID if provided to ensure consistent filtering
		const normalizedId = values.id ? normalizeId(values.id as string) : undefined;
		await executeFlexibleGeneration(
			unitNumber,
			values.type as ChapterType | undefined,
			normalizedId
		);
		process.exit(0);
	}

	// CRITICAL: Validate all required arguments are present and are proper strings
	// This is the final gate to prevent undefined values from proceeding to path generation
	if (
		!values.unit ||
		typeof values.unit !== "string" ||
		!values.type ||
		typeof values.type !== "string" ||
		!values.id ||
		typeof values.id !== "string"
	) {
		console.error("❌ ERROR: Missing or invalid required arguments for single content generation");
		console.error("");
		console.error("For single content file generation, all three arguments are required:");
		console.error("  --unit=<unit>     Unit identifier (number or string) - REQUIRED");
		console.error("  --type=<type>     Content type - REQUIRED");
		console.error("  --id=<id>         Chapter ID - REQUIRED");
		console.error("");
		console.error("Example:");
		console.error(
			'  npx tsx src/scripts/content-scaffolding.ts --unit=1 --type=lesson --id="01_01"'
		);
		console.error("");
		console.error("For batch generation or exploration:");
		console.error("  --unit=1                        # Generate all content for Unit 1");
		console.error("  --type=quiz                     # Generate all quizzes across all units");
		console.error("  --list-units                    # Show all available units");
		console.error("  --list-chapters --unit=1        # Show chapters for specific unit");
		console.error("");
		process.exit(1);
	}

	// Validate and resolve unit identification
	const unitIdentification = identifyUnit(values.unit);

	if (unitIdentification.isAmbiguous && unitIdentification.matchedUnits) {
		console.error(`Error: Ambiguous unit identifier "${values.unit}"`);
		console.error("Multiple units match this identifier:");
		unitIdentification.matchedUnits.forEach((unit) => {
			console.error(`  Unit ${unit.unitNumber}: ${unit.title}`);
		});
		console.error("\nUse numeric unit identifier for precision:");
		unitIdentification.matchedUnits.forEach((unit) => {
			console.error(`  --unit=${unit.unitNumber} --type="${values.type}" --id="${values.id}"`);
		});
		process.exit(1);
	}

	// CRITICAL: Ensure unit was successfully identified and is not undefined
	if (!unitIdentification.unitNumber) {
		console.error(`❌ ERROR: Unit "${values.unit}" not found`);
		console.error("");
		console.error("Available options:");
		console.error("  --list-units                    # Show all available units");
		console.error("  --unit=1, --unit=2, etc.       # Use numeric unit identifier");
		console.error('  --unit="python", --unit="go"    # Use string for unique technologies');
		console.error("");
		process.exit(1);
	}

	// CRITICAL: Validate content type to prevent undefined type values
	const validTypes: ChapterType[] = [
		"overview",
		"lesson",
		"study_guide",
		"quiz",
		"exam",
		"project"
	];
	if (
		!values.type ||
		typeof values.type !== "string" ||
		!validTypes.includes(values.type as ChapterType)
	) {
		console.error(`❌ ERROR: Invalid content type "${values.type}"`);
		console.error("");
		console.error("Valid content types:");
		validTypes.forEach((type) => {
			console.error(`  ${type.padEnd(12)} - ${getTypeDescription(type)}`);
		});
		console.error("");
		console.error("Example:");
		console.error(`  --type=lesson`);
		console.error("");
		process.exit(1);
	}

	// FINAL VALIDATION: Ensure all returned values are defined strings
	// This is the last checkpoint before values are used in path generation
	const unit = unitIdentification.unitNumber?.toString();
	const type = values.type as ChapterType;

	// CRITICAL: Normalize ID to ensure consistent format across all generated files
	// This converts various input formats (1, 1.1, 01_01) to standardized "01_01" format
	const id = normalizeId(values.id as string);

	if (!unit || !type || !id) {
		console.error("❌ CRITICAL ERROR: Validation failed - undefined values detected");
		console.error(`  unit: ${unit || "UNDEFINED"}`);
		console.error(`  type: ${type || "UNDEFINED"}`);
		console.error(`  id: ${id || "UNDEFINED"}`);
		console.error("");
		console.error("This is a bug in the argument validation logic. Please report this issue.");
		process.exit(1);
	}

	return { unit, type, id };
}

/**
 * Generate output file path based on arguments
 */
function generateFilePath(args: ValidatedScaffoldingArgs): string {
	// Use the unified navigation path generator to ensure consistency
	// with the content-menu-generator.ts
	const config: UnifiedPathConfig = {
		contentType: args.type,
		unitNum: args.unit,
		chapterNum: args.type === "overview" ? undefined : extractChapterFromId(args.id),
		titleSlug: generateTitleSlugForScaffolding(args)
	};

	const paths = generateNavigationPaths(config);

	// Return the data path but as a full file system path
	// Note: paths.dataPath already includes "book/" prefix, so we use "src/data" instead of CONFIG.paths.outputFolder
	return join("src/data", paths.dataPath);
}

/**
 * Extract chapter number from scaffolding ID format
 */
function extractChapterFromId(id: string): string | undefined {
	// Handle formats like "01_01", "01_10", etc.
	const match = id.match(/^\d+_(\d+)$/);
	if (match) {
		return match[1];
	}
	// Fallback for other formats
	return "1";
}

/**
 * Generate a title slug for scaffolding based on type and unit
 */
function generateTitleSlugForScaffolding(args: ValidatedScaffoldingArgs): string {
	const unitTitle = findUnitTitle(args.unit) || `unit_${args.unit}`;

	switch (args.type) {
		case "overview":
			return unitTitle
				.toLowerCase()
				.replace(/[^\w\s-]/g, "")
				.replace(/\s+/g, "_");
		case "exam":
			return "final_exam";
		default:
			return `${args.type}_${args.unit}`;
	}
}

/**
 * Find unit title from content menu for better slug generation
 */
function findUnitTitle(unitNum: string): string | null {
	const unit = contentMenu.units.find((u) => u.unitNumber === parseInt(unitNum));
	if (unit) {
		// Extract title without "Unit X: " prefix
		return unit.title.replace(/^Unit \d+:\s*/, "");
	}
	return null;
}

/**
 * Add content object to source file using AST manipulation
 */
function addContentToSourceFile(
	sourceFile: SourceFile,
	content: LessonContent | QuizContent | StudyGuideContent | ExamContent | ProjectContent,
	args: ValidatedScaffoldingArgs
): void {
	// Determine variable name based on content type
	const variableName = `${args.type}Content`;

	// Create the variable declaration
	const variableDeclaration = sourceFile.addVariableStatement({
		declarationKind: VariableDeclarationKind.Const,
		isExported: true,
		declarations: [
			{
				name: variableName,
				type: getContentTypeAnnotation(args.type),
				initializer: JSON.stringify(content, null, "\t")
			}
		]
	});

	// Add JSDoc comment
	variableDeclaration.addJsDoc({
		description: `Generated ${args.type} content for ${args.unit} unit.

This is scaffolded placeholder content. Replace with real educational material
that follows the content standards defined in CONTENT-STANDARDS.md.

Content includes minimum required elements:
${getContentSummary(args.type)}

@status scaffold - Needs to be developed into final educational content
@unit ${args.unit}
@chapterId ${args.id}`
	});
}

/**
 * Get content summary for JSDoc based on type
 */
function getContentSummary(type: ChapterType): string {
	switch (type) {
		case "lesson":
			return `- ${CONFIG.lessons.sections} content sections with diverse diagrams
- ${CONFIG.lessons.codeBlocks} code block(s) with cloud-native examples
- ${CONFIG.lessons.diagrams} diagram(s) using different types (flowchart, sequence, class, etc.)
- Learning objectives and prerequisites`;
		case "quiz":
			return `- ${CONFIG.quizzes.questions} quiz questions
- Diverse question types: single choice, multiple choice, code completion, true/false, drag & drop
- Explanations for each question`;
		case "exam":
			return `- ${CONFIG.exams.questions} exam questions
- Diverse question types for comprehensive assessment
- Time limit and passing score`;
		case "study_guide":
			return `- ${CONFIG.studyGuides.flashcards} flashcards
- Question/answer format
- Categorization and tags`;
		case "project":
			return `- ${CONFIG.projects.sections} project phases
- ${CONFIG.projects.requirements} requirements
- ${CONFIG.projects.deliverables} deliverables`;
		default:
			return "- Placeholder content structure";
	}
}

/**
 * Get TypeScript type annotation for content type with underscore prefix
 */
function getContentTypeAnnotation(type: ChapterType): string {
	switch (type) {
		case "lesson":
		case "overview":
			return "_LessonContent";
		case "quiz":
			return "_QuizContent";
		case "study_guide":
			return "_StudyGuideContent";
		case "exam":
			return "_ExamContent";
		case "project":
			return "_ProjectContent";
		default:
			return "_LessonContent";
	}
}

// ============================================================================
// BATCH GENERATION FUNCTIONS
// ============================================================================

/**
 * Execute flexible batch generation based on provided filters
 */
async function executeFlexibleGeneration(
	unitFilter?: number,
	typeFilter?: ChapterType,
	idFilter?: string
): Promise<void> {
	console.log("🔄 Content Scaffolding Generator - Flexible Batch Mode");
	console.log("======================================================");
	console.log("");

	// Describe what we're generating
	let description = "📋 Generating content: ";
	const filters = [];

	if (unitFilter) filters.push(`Unit ${unitFilter}`);
	if (typeFilter) filters.push(`Type: ${typeFilter}`);
	if (idFilter) filters.push(`ID: ${idFilter}`);

	if (filters.length === 0) {
		description += "ALL content (all units, all types)";
	} else {
		description += filters.join(" + ");
	}

	console.log(description);
	console.log("");

	// Collect all chapters that match the filters
	const chaptersToProcess: Array<{ unit: MenuUnit; chapter: MenuChapter }> = [];

	// If specific ID is provided, find all related content
	if (idFilter) {
		for (const unit of contentMenu.units) {
			// Skip if unit filter is specified and doesn't match
			if (unitFilter && unit.unitNumber !== unitFilter) continue;

			for (const chapter of unit.chapters) {
				// Match by exact ID only - no base pattern matching for ID filtering
				if (chapter.id === idFilter) {
					// Skip if type filter is specified and doesn't match
					if (typeFilter && chapter.type !== typeFilter) continue;

					chaptersToProcess.push({ unit, chapter });
				}
			}
		}
	} else {
		// Process by unit and/or type filters
		for (const unit of contentMenu.units) {
			// Skip if unit filter is specified and doesn't match
			if (unitFilter && unit.unitNumber !== unitFilter) continue;

			for (const chapter of unit.chapters) {
				// Skip if type filter is specified and doesn't match
				if (typeFilter && chapter.type !== typeFilter) continue;

				chaptersToProcess.push({ unit, chapter });
			}
		}
	}

	if (chaptersToProcess.length === 0) {
		console.log("⚠️  No chapters found matching the specified filters");
		console.log("");
		console.log("Available options:");
		if (unitFilter) {
			const unit = contentMenu.units.find((u) => u.unitNumber === unitFilter);
			if (unit) {
				console.log(`   Unit ${unitFilter}: ${unit.title}`);
				const types = [...new Set(unit.chapters.map((c) => c.type))];
				console.log(`   Available types: ${types.join(", ")}`);
			}
		} else {
			console.log("   Use --list-units to see available units");
			console.log("   Available types: lesson, study_guide, quiz, project, exam");
		}
		return;
	}

	console.log(`🎯 Found ${chaptersToProcess.length} chapters to process`);
	console.log("");

	// Initialize TypeScript compiler
	const project = new Project({
		compilerOptions: {
			target: ScriptTarget.ES2022,
			module: ModuleKind.ESNext,
			moduleResolution: ModuleResolutionKind.Bundler,
			allowJs: true,
			allowSyntheticDefaultImports: true,
			esModuleInterop: true,
			forceConsistentCasingInFileNames: true
		}
	});

	const stats = {
		processed: 0,
		created: 0,
		skipped: 0,
		errors: 0
	};

	// Process each chapter
	for (const item of chaptersToProcess) {
		const { unit, chapter } = item;
		const dataLink = chapter.chapterDataLink;
		const fullPath = join(process.cwd(), CONFIG.paths.outputFolder, dataLink);

		console.log(`   Processing: Unit ${unit.unitNumber} - ${chapter.id} - ${chapter.title}`);

		if (existsSync(fullPath)) {
			stats.skipped++;
			console.log(`     ✅ Exists - skipping`);
			continue;
		}

		try {
			// Parse chapter info
			const chapterInfo = parseChapterDataLink(dataLink);
			if (!chapterInfo) {
				stats.errors++;
				console.log(`     ❌ Failed to parse: ${dataLink}`);
				continue;
			}

			// Generate validated args from chapter data
			const args: ValidatedScaffoldingArgs = {
				unit: unit.unitNumber.toString(),
				type: chapter.type,
				id: chapter.id
			};

			// Ensure directory exists
			const dir = dirname(fullPath);
			if (!existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
				console.log(`     📁 Created directory: ${dir}`);
			}

			// Create source file with imports
			const sourceFile = createContentFile(project, fullPath, args);

			// Generate content based on type
			const templateGenerator = new TemplateGenerator();
			const contentGenerator = templateGenerator.getContentGenerator(args.type);
			const content = contentGenerator(args);

			// Add content to source file using AST
			addContentToSourceFile(sourceFile, content, args);

			// Write formatted file
			const sourceCode = sourceFile.getFullText();
			await writeFormattedFile(fullPath, sourceCode);

			stats.created++;
			console.log(`     ✅ Generated: ${basename(fullPath)}`);
		} catch (error) {
			stats.errors++;
			console.log(`     ❌ Error generating ${chapter.id}: ${error}`);
		}

		stats.processed++;
	}

	// Print final summary
	console.log("");
	console.log("📊 Batch Generation Summary:");
	console.log(`   Total processed: ${stats.processed}`);
	console.log(`   Files created:   ${stats.created}`);
	console.log(`   Files skipped:   ${stats.skipped}`);
	console.log(`   Errors:          ${stats.errors}`);
	console.log("");

	if (stats.created > 0) {
		console.log("✅ Batch generation completed successfully!");

		// Run validation if enabled and files were created
		const validationResults = await runGeneratedFileValidation(bookPath);
		const hasFailures = validationResults.some((result) => !result.success);
		if (hasFailures) {
			console.error("⚠️  Some validation checks failed, but generation was successful");
		}

		console.log("");
		console.log("Next steps:");
		console.log("1. Review the generated content structure");
		console.log("2. Replace placeholder content with real educational material");
	} else if (stats.skipped > 0 && stats.errors === 0) {
		console.log("ℹ️  All files already exist - no new content generated");
	} else if (stats.errors > 0) {
		console.log("⚠️  Batch generation completed with errors");
	}
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

// Validation logic moved to src/lib/utils/validation-utils.ts for reusability

// ============================================================================
// MAIN EXECUTION
// ============================================================================

// ============================================================================
// DATA-DRIVEN EXECUTION MODE
// ============================================================================

/**
 * Interface for tracking scaffolding statistics
 */
// ScaffoldingStats moved to $types/scaffolding

/**
 * Parse chapter data link to extract unit, chapter, and type information
 */
function parseChapterDataLink(chapterDataLink: string): {
	unitNum: string;
	chapterNum?: string;
	contentType: ChapterType;
	fileName: string;
} | null {
	// Expected formats:
	// 1. book/unit01/01_01_lesson_title.ts (lessons with title)
	// 2. book/unit01/01_01_quiz.ts (short format)
	// 3. book/unit01/01_99_exam_title.ts (exams)
	const longMatch = chapterDataLink.match(/book\/unit(\d+)\/(\d+)_(\d+|99)_(\w+)_.*\.ts$/);
	const shortMatch = chapterDataLink.match(/book\/unit(\d+)\/(\d+)_(\d+|99)_(\w+)\.ts$/);

	let unitNum: string;
	let fileChapter: string;
	let contentType: string;

	if (longMatch) {
		[, unitNum, , fileChapter, contentType] = longMatch;
	} else if (shortMatch) {
		[, unitNum, , fileChapter, contentType] = shortMatch;
	} else {
		console.warn(`⚠️  Unable to parse chapterDataLink: ${chapterDataLink}`);
		return null;
	}
	const fileName = basename(chapterDataLink);

	// Map content types from file names to our internal types
	const typeMapping: Record<string, ChapterType> = {
		lesson: "lesson",
		study_guide: "study_guide",
		quiz: "quiz",
		exam: "exam",
		project: "project",
		overview: "overview"
	};

	const mappedType = typeMapping[contentType] || "lesson";

	return {
		unitNum,
		chapterNum: fileChapter === "99" || fileChapter === "00" ? undefined : fileChapter,
		contentType: mappedType,
		fileName
	};
}

/**
 * Extract all chapters from content menu
 */
function extractAllChapters(): MenuChapter[] {
	const allChapters: MenuChapter[] = [];

	for (const unit of contentMenu.units) {
		allChapters.push(...unit.chapters);
	}

	return allChapters;
}

const bookPath = join(process.cwd(), CONFIG.paths.outputFolder);

/**
 * Scan $data/book directory for existing files
 */
function scanBookDirectory(): string[] {
	const existingFiles: string[] = [];

	try {
		if (!existsSync(bookPath)) {
			return existingFiles;
		}

		// Scan unit directories
		const unitDirs = readdirSync(bookPath).filter((dir) => {
			const fullPath = join(bookPath, dir);
			return statSync(fullPath).isDirectory() && dir.startsWith("unit");
		});

		for (const unitDir of unitDirs) {
			const unitPath = join(bookPath, unitDir);
			const files = readdirSync(unitPath).filter((file) => file.endsWith(".ts"));

			for (const file of files) {
				// Store relative path from src/data/
				existingFiles.push(join("book", unitDir, file));
			}
		}
	} catch (error) {
		console.warn(`⚠️  Error scanning book directory: ${error}`);
	}

	return existingFiles;
}

/**
 * Find orphan files not referenced in content menu
 */
function findOrphanFiles(existingFiles: string[], chapterDataLinks: string[]): string[] {
	const normalizedDataLinks = chapterDataLinks.map((link) => link.replace(/^book\//, ""));

	const normalizedExisting = existingFiles.map((file) => file.replace(/^book\//, ""));

	return normalizedExisting.filter((file) => !normalizedDataLinks.includes(file));
}

/**
 * Execute data-driven scaffolding mode
 */
async function executeDataDrivenMode(): Promise<void> {
	console.log("🔄 Content Scaffolding Generator - Data-Driven Mode");
	console.log("==================================================");
	console.log("");

	console.log("📊 Analyzing content structure...");

	// Extract all chapters from content menu
	const allChapters = extractAllChapters();
	const stats: ScaffoldingStats = {
		totalChapters: allChapters.length,
		existingFiles: 0,
		newFiles: 0,
		orphanFiles: [],
		errors: []
	};

	console.log(`📋 Found ${stats.totalChapters} chapters in content menu`);
	console.log("");

	// Create ts-morph project
	const project = new Project({
		compilerOptions: {
			target: 2, // ES2015
			module: 1, // CommonJS
			strict: true,
			esModuleInterop: true,
			skipLibCheck: true,
			forceConsistentCasingInFileNames: true
		}
	});

	console.log("🔍 Processing chapters...");

	// Process each chapter
	for (const chapter of allChapters) {
		const dataLink = chapter.chapterDataLink;
		const fullPath = join(process.cwd(), CONFIG.paths.outputFolder, dataLink);

		console.log(`   Checking: ${dataLink}`);

		if (existsSync(fullPath)) {
			stats.existingFiles++;
			console.log(`     ✅ Exists - skipping`);
			continue;
		}

		// Parse chapter info
		const chapterInfo = parseChapterDataLink(dataLink);
		if (!chapterInfo) {
			stats.errors.push(`Failed to parse: ${dataLink}`);
			continue;
		}

		try {
			// Generate scaffolding args from chapter data
			const args: ValidatedScaffoldingArgs = {
				unit: `unit${chapterInfo.unitNum}`,
				type: chapterInfo.contentType,
				id: chapterInfo.chapterNum || "0"
			};

			// Ensure directory exists
			const dir = dirname(fullPath);
			if (!existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
				console.log(`     📁 Created directory: ${dir}`);
			}

			// Create source file with imports
			const sourceFile = createContentFile(project, fullPath, args);

			// Generate content based on type
			const templateGenerator = new TemplateGenerator();
			const contentGenerator = templateGenerator.getContentGenerator(args.type);
			const content = contentGenerator(args);

			// Add content to source file using AST
			addContentToSourceFile(sourceFile, content, args);

			// Write formatted file
			const sourceCode = sourceFile.getFullText();
			await writeFormattedFile(fullPath, sourceCode);

			stats.newFiles++;
			console.log(`     ✨ Generated successfully`);
		} catch (error) {
			stats.errors.push(`Error generating ${dataLink}: ${error}`);
			console.log(`     ❌ Error: ${error}`);
		}
	}

	console.log("");
	console.log("🔍 Performing final validation...");

	// Scan for existing files and check for orphans
	const existingFiles = scanBookDirectory();
	const chapterDataLinks = allChapters.map((c) => c.chapterDataLink);
	stats.orphanFiles = findOrphanFiles(existingFiles, chapterDataLinks);

	// Print final report
	await printFinalReport(stats);
}

/**
 * Print comprehensive final report
 */
async function printFinalReport(stats: ScaffoldingStats): Promise<void> {
	console.log("");
	console.log("📊 SCAFFOLDING SUMMARY REPORT");
	console.log("=============================");
	console.log("");
	console.log(`📋 Total chapters defined in content-menu.ts: ${stats.totalChapters}`);
	console.log(`✅ Chapter data files that already existed: ${stats.existingFiles}`);
	console.log(`✨ New chapter data files created: ${stats.newFiles}`);
	console.log("");

	if (stats.errors.length > 0) {
		console.log("❌ ERRORS ENCOUNTERED:");
		stats.errors.forEach((error) => console.log(`   • ${error}`));
		console.log("");
	}

	if (stats.orphanFiles.length > 0) {
		console.log("⚠️  ORPHAN FILES DETECTED:");
		console.log(
			"   The following files exist in $data/book but are not mapped in content-menu.ts:"
		);
		stats.orphanFiles.forEach((file) => console.log(`   • ${file}`));
		console.log("");
		console.log("   Consider:");
		console.log("   • Adding these files to content-menu.ts if they should be included");
		console.log("   • Moving them to a different location if they're not content files");
		console.log("   • Removing them if they're no longer needed");
	} else {
		console.log("✅ No orphan files detected - all files are properly mapped!");
	}

	console.log("");

	if (stats.errors.length === 0) {
		console.log("🎉 Content scaffolding completed successfully!");

		// Run validation if enabled and files were created
		if (stats.newFiles > 0) {
			const validationResults = await runGeneratedFileValidation(bookPath);
			const hasFailures = validationResults.some((result) => !result.success);
			if (hasFailures) {
				console.error("⚠️  Some validation checks failed, but generation was successful");
			}
		}
	} else {
		console.log(`⚠️  Content scaffolding completed with ${stats.errors.length} error(s)`);
	}
}

/**
 * Content Scaffolding Generator Class
 *
 * Provides class-based architecture for content scaffolding operations,
 * following the same pattern as other generator scripts in the project.
 */
class ContentScaffoldingGenerator {
	private settings: typeof CONFIG;

	constructor() {
		this.settings = CONFIG;
	}

	/**
	 * Generate content scaffolding based on provided arguments
	 */
	async generate(args?: ValidatedScaffoldingArgs): Promise<boolean> {
		try {
			// If no args provided, parse from CLI
			const validatedArgs = args || (await this.parseCliArguments());

			console.log("🔄 Content Scaffolding Generator");
			console.log("================================");
			console.log("");
			console.log("📋 Configuration (from src/config/settings.ts):");
			console.log(
				`  Lessons:      ${this.settings.lessons.sections} sections, ${this.settings.lessons.codeBlocks} code blocks, ${this.settings.lessons.diagrams} diagrams`
			);
			console.log(
				`  Quizzes:      ${this.settings.quizzes.questions} questions (diverse types: ${this.settings.quizzes.diverseTypes})`
			);
			console.log(
				`  Exams:        ${this.settings.exams.questions} questions (diverse types: ${this.settings.exams.diverseTypes})`
			);
			console.log(`  Study Guides: ${this.settings.studyGuides.flashcards} flashcards`);
			console.log(
				`  Projects:     ${this.settings.projects.sections} sections, ${this.settings.projects.requirements} requirements, ${this.settings.projects.deliverables} deliverables`
			);
			console.log("");

			// Generate file path
			const filePath = this.generateFilePath(validatedArgs);
			console.log(`📍 Target: ${filePath}`);

			// Create output directory
			const bookPath = dirname(filePath);
			if (!existsSync(bookPath)) {
				mkdirSync(bookPath, { recursive: true });
			}

			// Generate content using TemplateGenerator
			const templateGenerator = new TemplateGenerator();
			const contentGenerator = templateGenerator.getContentGenerator(validatedArgs.type);
			const content = contentGenerator(validatedArgs);

			// Create TypeScript project for AST generation
			const project = new Project({
				compilerOptions: {
					target: ScriptTarget.ES2022,
					module: ModuleKind.ES2022,
					moduleResolution: ModuleResolutionKind.Bundler,
					allowSyntheticDefaultImports: true,
					esModuleInterop: true
				}
			});

			// Create and write content file
			const sourceCode = this.createContentFile(project, filePath, validatedArgs, content);
			await writeFormattedFile(filePath, sourceCode);

			console.log("✅ Content scaffolding generated successfully!");

			// Run validation if enabled
			const validationResults = await runGeneratedFileValidation(bookPath);
			const hasFailures = validationResults.some((result) => !result.success);
			if (hasFailures) {
				console.error("⚠️  Some validation checks failed, but generation was successful");
			}

			console.log("");
			console.log("📝 Next steps:");
			console.log("1. Review the generated scaffolding content");
			console.log("2. Replace placeholder content with real educational material");
			console.log("3. Modify requirements in src/config/settings.ts if needed");

			return true;
		} catch (error) {
			console.error("❌ Error generating content scaffolding:");
			console.error(error instanceof Error ? error.message : String(error));
			return false;
		}
	}

	/**
	 * Parse CLI arguments and validate them
	 */
	async parseCliArguments(): Promise<ValidatedScaffoldingArgs> {
		// Implementation stays the same as the original function
		return parseCliArguments();
	}

	/**
	 * Generate file path based on arguments
	 */
	generateFilePath(args: ValidatedScaffoldingArgs): string {
		// Implementation stays the same as the original function
		return generateFilePath(args);
	}

	/**
	 * Get content generator function for the specified type (delegates to TemplateGenerator)
	 */
	getContentGenerator(
		type: ChapterType
	): (
		args: ValidatedScaffoldingArgs
	) => LessonContent | QuizContent | StudyGuideContent | ExamContent | ProjectContent {
		// Delegate to TemplateGenerator for consistent behavior
		const templateGenerator = new TemplateGenerator();
		return templateGenerator.getContentGenerator(type);
	}

	/**
	 * Create TypeScript content file using AST
	 */
	private createContentFile(
		project: Project,
		filePath: string,
		args: ValidatedScaffoldingArgs,
		content: LessonContent | QuizContent | StudyGuideContent | ExamContent | ProjectContent
	): string {
		// Use the existing createContentFile function but as a method
		const sourceFile = createContentFile(project, filePath, args);

		// Add the content export
		const contentVarName = `${args.type}Content`;
		sourceFile.addVariableStatement({
			declarationKind: VariableDeclarationKind.Const,
			isExported: true,
			declarations: [
				{
					name: contentVarName,
					type: this.getTypeAnnotation(args.type),
					initializer: JSON.stringify(content, null, 2)
				}
			]
		});

		return sourceFile.getFullText();
	}

	/**
	 * Get TypeScript type annotation for content type
	 */
	private getTypeAnnotation(type: ChapterType): string {
		switch (type) {
			case "lesson":
			case "overview":
				return "LessonContent";
			case "quiz":
				return "QuizContent";
			case "study_guide":
				return "StudyGuideContent";
			case "exam":
				return "ExamContent";
			case "project":
				return "ProjectContent";
			default:
				return "LessonContent";
		}
	}
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
	try {
		// Check if running in data-driven mode (no arguments provided)
		const hasArgs = process.argv.slice(2).length > 0;

		if (!hasArgs) {
			// Execute data-driven mode
			await executeDataDrivenMode();
			return;
		}

		// Use the new class-based approach for parameter-based mode
		const generator = new ContentScaffoldingGenerator();
		const success = await generator.generate();

		if (!success) {
			process.exit(1);
		}
		return;
	} catch (error) {
		console.error("❌ Error generating content scaffolding:");
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

// Execute main function
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error("Fatal error:", error);
		process.exit(1);
	});
}

export { main, parseCliArguments, generateFilePath, ContentScaffoldingGenerator };
