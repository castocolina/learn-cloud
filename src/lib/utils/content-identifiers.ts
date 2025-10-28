/**
 * Unified ID and URL Normalization System for Cloud-Native Learning Platform
 *
 * This module provides the single source of truth for ALL content identifier generation,
 * parsing, and validation across the entire application. It resolves critical cross-reference
 * incompatibility issues identified in TASK 3G3 by implementing:
 *
 * 1. Letter-Based ID System with Type Suffixes (100% uniqueness)
 * 2. Descriptive URL System (SEO-friendly, bookmarkable)
 * 3. File Path Generation (consistent directory structure)
 * 4. Parsing and Validation (robust error handling)
 *
 * KEY FEATURES:
 * - Unique IDs for every content piece (no duplicates across types)
 * - Compact letter-based type suffixes (L, SG, Q, O, E, P)
 * - Descriptive URLs with content type and title slug
 * - 100% cross-reference compatibility between menu/flatnav/search
 * - Backward-compatible parsing for legacy formats
 * - Special handling for book overview (not bound to unit/chapter)
 *
 * USAGE:
 * - Content Menu Generator: generateContentId() for unique identifiers
 * - Search Index Generator: generateContentUrl() for descriptive URLs
 * - FlatNav Generator: Both ID and URL generation
 * - Scaffold Generator: generateFilePath() for file creation
 * - Content Management: parseContentId(), parseFilePath() for queries
 *
 * EXAMPLES:
 *   generateContentId("1", "1", "lesson")         → "01_01L"
 *   generateContentId("1", "1", "study_guide")    → "01_01SG"
 *   generateContentId("1", "0", "overview")       → "01_00O"
 *   generateContentUrl("1", "1", "lesson", "Development Environment")
 *     → "01_01_lesson_development_environment.html"
 *   generateFilePath("1", "1", "lesson", "dev-env")
 *     → "book/unit01/01_01_lesson_dev_env.ts"
 */

import type { ChapterType } from "$types";
import { padNumber, generateSlug } from "./string-utils.js";
import { SETTINGS } from "$config/settings.js";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Type suffix mapping for letter-based ID system
 * Uses first letter of content type, fallback to 2+ letters on collision
 */
const TYPE_SUFFIXES: Record<ChapterType, string> = {
	overview: "O", // O - Overview
	lesson: "L", // L - Lesson
	study_guide: "SG", // SG - Study Guide (2 letters to avoid collision)
	quiz: "Q", // Q - Quiz
	exam: "E", // E - Exam
	project: "P" // P - Project
};

/**
 * Reverse mapping from suffix to content type for parsing
 */
const SUFFIX_TO_TYPE: Record<string, ChapterType> = {
	O: "overview",
	L: "lesson",
	SG: "study_guide",
	Q: "quiz",
	E: "exam",
	P: "project"
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract type suffix from ID string
 * Handles both single-letter (L, Q, O) and multi-letter (SG) suffixes
 */
function extractTypeSuffix(id: string): { basePart: string; suffix: string } | null {
	// Try multi-letter suffixes first (SG)
	const multiLetterMatch = id.match(/^(\d+_\d+)(SG)$/);
	if (multiLetterMatch) {
		return {
			basePart: multiLetterMatch[1],
			suffix: multiLetterMatch[2]
		};
	}

	// Try single-letter suffixes (L, Q, O, E, P)
	const singleLetterMatch = id.match(/^(\d+_\d+)([LQOEP])$/);
	if (singleLetterMatch) {
		return {
			basePart: singleLetterMatch[1],
			suffix: singleLetterMatch[2]
		};
	}

	return null;
}

// ============================================================================
// ID OPERATIONS
// ============================================================================

/**
 * Generate unique ID from content metadata
 * Format: {unit_padded}_{chapter_padded}{type_suffix}
 *
 * @param unitNum - Unit number (e.g., "1", "2", "10")
 * @param chapterNum - Chapter number (e.g., "1", "2", "10")
 * @param contentType - Type of content (lesson, study_guide, quiz, etc.)
 * @returns Unique content ID with type suffix
 *
 * @example
 * generateContentId("1", "1", "lesson")      → "01_01L"
 * generateContentId("1", "1", "study_guide") → "01_01SG"
 * generateContentId("1", "0", "overview")    → "01_00O"
 * generateContentId("1", "99", "exam")       → "01_99E"
 */
export function generateContentId(
	unitNum: string,
	chapterNum: string,
	contentType: ChapterType
): string {
	const paddedUnit = padNumber(unitNum);
	const paddedChapter = padNumber(chapterNum);
	const suffix = TYPE_SUFFIXES[contentType];

	if (!suffix) {
		throw new Error(`Unknown content type: ${contentType}`);
	}

	return `${paddedUnit}_${paddedChapter}${suffix}`;
}

/**
 * Parse ID back to components
 * Extracts unit number, chapter number, and content type from ID string
 *
 * @param id - Content ID to parse (e.g., "01_01L", "01_01SG")
 * @returns Parsed components with validation status
 *
 * @example
 * parseContentId("01_01L")  → { unitNum: "1", chapterNum: "1", contentType: "lesson", isValid: true }
 * parseContentId("01_01SG") → { unitNum: "1", chapterNum: "1", contentType: "study_guide", isValid: true }
 * parseContentId("00_BOOK") → { unitNum: "0", chapterNum: "0", contentType: "overview", isValid: true }
 * parseContentId("invalid") → { isValid: false, error: "..." }
 */
export function parseContentId(id: string): {
	unitNum: string;
	chapterNum: string;
	contentType: ChapterType;
	isValid: boolean;
	error?: string;
} {
	try {
		// SPECIAL CASE: Book overview (00_BOOK)
		if (id === SETTINGS.scripts.flatNav.bookOverview.id) {
			return {
				unitNum: "0",
				chapterNum: "0",
				contentType: "overview",
				isValid: true
			};
		}

		const extracted = extractTypeSuffix(id);

		if (!extracted) {
			return {
				unitNum: "",
				chapterNum: "",
				contentType: "lesson",
				isValid: false,
				error: `Invalid ID format: ${id}. Expected format: XX_XXTYPE (e.g., 01_01L, 01_01SG)`
			};
		}

		const { basePart, suffix } = extracted;
		const contentType = SUFFIX_TO_TYPE[suffix];

		if (!contentType) {
			return {
				unitNum: "",
				chapterNum: "",
				contentType: "lesson",
				isValid: false,
				error: `Unknown type suffix: ${suffix}`
			};
		}

		// Parse unit and chapter numbers
		const [unitStr, chapterStr] = basePart.split("_");
		const unitNum = String(parseInt(unitStr));
		const chapterNum = String(parseInt(chapterStr));

		return {
			unitNum,
			chapterNum,
			contentType,
			isValid: true
		};
	} catch (error) {
		return {
			unitNum: "",
			chapterNum: "",
			contentType: "lesson",
			isValid: false,
			error: error instanceof Error ? error.message : "Unknown parsing error"
		};
	}
}

/**
 * Validate ID format
 * Checks if ID follows the expected pattern and has valid components
 *
 * @param id - Content ID to validate
 * @returns Validation result with detailed errors if invalid
 *
 * @example
 * validateContentId("01_01L")  → { isValid: true, errors: [] }
 * validateContentId("invalid") → { isValid: false, errors: ["Invalid ID format: ..."] }
 */
export function validateContentId(id: string): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (!id || typeof id !== "string") {
		errors.push("ID must be a non-empty string");
		return { isValid: false, errors };
	}

	const parsed = parseContentId(id);
	if (!parsed.isValid) {
		errors.push(parsed.error || "Invalid ID format");
		return { isValid: false, errors };
	}

	// SPECIAL CASE: Book overview (00_BOOK) is always valid
	if (id === SETTINGS.scripts.flatNav.bookOverview.id) {
		return { isValid: true, errors: [] };
	}

	// Additional validation for unit and chapter numbers
	const unitNum = parseInt(parsed.unitNum);
	const chapterNum = parseInt(parsed.chapterNum);

	if (isNaN(unitNum) || unitNum < 1 || unitNum > 99) {
		errors.push(`Unit number must be between 1-99, got: ${parsed.unitNum}`);
	}

	if (isNaN(chapterNum) || chapterNum < 0 || chapterNum > 99) {
		errors.push(`Chapter number must be between 0-99, got: ${parsed.chapterNum}`);
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

// ============================================================================
// URL OPERATIONS
// ============================================================================

/**
 * Generate descriptive URL from content metadata
 * Format: {unit_padded}_{chapter_padded}_{type_name}_{title_slug}.html
 *
 * Automatically avoids redundant type names (e.g., prevents "quiz_quiz")
 *
 * @param unitNum - Unit number
 * @param chapterNum - Chapter number
 * @param contentType - Type of content
 * @param titleSlug - URL-friendly title (will be slugified if needed)
 * @returns Descriptive content URL
 *
 * @example
 * generateContentUrl("1", "1", "lesson", "Development Environment")
 *   → "01_01_lesson_development_environment.html"
 * generateContentUrl("1", "1", "quiz", "quiz")
 *   → "01_01_quiz.html" (avoids redundant "quiz_quiz")
 * generateContentUrl("1", "1", "study_guide", "")
 *   → "01_01_study_guide.html"
 * generateContentUrl("1", "0", "overview", "Python for Cloud Native")
 *   → "01_00_overview_python_for_cloud_native.html"
 */
export function generateContentUrl(
	unitNum: string,
	chapterNum: string,
	contentType: ChapterType,
	titleSlug: string
): string {
	const paddedUnit = padNumber(unitNum);
	const paddedChapter = padNumber(chapterNum);

	// Convert content type to URL format (study_guide stays as study_guide)
	const typeStr = contentType;

	// Generate slug from title if provided
	let slug = titleSlug ? generateSlug(titleSlug) : "";

	// Avoid redundant type names (e.g., "quiz_quiz" → just "quiz")
	// Remove the type from slug if it's the same as contentType
	if (slug === typeStr) {
		slug = "";
	}

	// Add underscore prefix if slug exists
	const slugPart = slug ? `_${slug}` : "";

	return `${paddedUnit}_${paddedChapter}_${typeStr}${slugPart}.html`;
}

/**
 * Parse URL back to components and ID
 * Extracts all metadata from descriptive URL format
 *
 * @param url - Content URL to parse
 * @returns Parsed components including ID, with validation status
 *
 * @example
 * parseContentUrl("01_01_lesson_dev_env.html")
 *   → { id: "01_01L", unitNum: "1", chapterNum: "1", contentType: "lesson", ... }
 * parseContentUrl("01_01_study_guide.html")
 *   → { id: "01_01SG", unitNum: "1", chapterNum: "1", contentType: "study_guide", ... }
 * parseContentUrl("overview.html")
 *   → { id: "00_BOOK", unitNum: "0", chapterNum: "0", contentType: "overview", ... }
 */
export function parseContentUrl(url: string): {
	id: string;
	unitNum: string;
	chapterNum: string;
	contentType: ChapterType;
	titleSlug: string;
	isValid: boolean;
	error?: string;
} {
	try {
		// Remove .html extension
		const cleanUrl = url.replace(/\.html$/, "");

		// SPECIAL CASE: Book overview (not bound to unit/chapter)
		if (cleanUrl === "overview") {
			return {
				id: SETTINGS.scripts.flatNav.bookOverview.id,
				unitNum: "0",
				chapterNum: "0",
				contentType: "overview",
				titleSlug: "",
				isValid: true
			};
		}

		// REGULAR CONTENT: Pattern XX_XX_type_slug or XX_XX_type
		// Handle both study_guide (with underscore) and other types
		const match = cleanUrl.match(
			/^(\d+)_(\d+)_(lesson|study_guide|quiz|overview|exam|project)(?:_(.+))?$/
		);

		if (!match) {
			return {
				id: "",
				unitNum: "",
				chapterNum: "",
				contentType: "lesson",
				titleSlug: "",
				isValid: false,
				error: `Invalid URL format: ${url}. Expected format: XX_XX_type_slug.html or overview.html`
			};
		}

		const unitNum = String(parseInt(match[1]));
		const chapterNum = String(parseInt(match[2]));
		const contentType = match[3] as ChapterType;
		const titleSlug = match[4] || "";

		// Generate ID from parsed components
		const id = generateContentId(unitNum, chapterNum, contentType);

		return {
			id,
			unitNum,
			chapterNum,
			contentType,
			titleSlug,
			isValid: true
		};
	} catch (error) {
		return {
			id: "",
			unitNum: "",
			chapterNum: "",
			contentType: "lesson",
			titleSlug: "",
			isValid: false,
			error: error instanceof Error ? error.message : "Unknown parsing error"
		};
	}
}

// ============================================================================
// FILE PATH OPERATIONS
// ============================================================================

/**
 * Generate file path from content metadata
 * Format: book/unit{XX}/XX_XX_{type}_{slug}.ts
 *
 * @param unitNum - Unit number
 * @param chapterNum - Chapter number
 * @param contentType - Type of content
 * @param titleSlug - URL-friendly title
 * @returns File path for content TypeScript file
 *
 * @example
 * generateFilePath("1", "1", "lesson", "dev-env")
 *   → "book/unit01/01_01_lesson_dev_env.ts"
 * generateFilePath("1", "1", "study_guide", "")
 *   → "book/unit01/01_01_study_guide.ts"
 */
export function generateFilePath(
	unitNum: string,
	chapterNum: string,
	contentType: ChapterType,
	titleSlug: string
): string {
	const paddedUnit = padNumber(unitNum);
	const paddedChapter = padNumber(chapterNum);

	// Generate slug from title if provided
	const slug = titleSlug ? `_${generateSlug(titleSlug)}` : "";

	// Convert content type to file format
	const typeStr = contentType;

	return `book/unit${paddedUnit}/${paddedUnit}_${paddedChapter}_${typeStr}${slug}.ts`;
}

/**
 * Parse file path back to ID and components
 * Extracts all metadata from file path
 *
 * @param path - File path to parse
 * @returns Parsed components including ID, with validation status
 *
 * @example
 * parseFilePath("book/unit01/01_01_lesson_dev_env.ts")
 *   → { id: "01_01L", unitNum: "1", chapterNum: "1", contentType: "lesson", ... }
 */
export function parseFilePath(path: string): {
	id: string;
	unitNum: string;
	chapterNum: string;
	contentType: ChapterType;
	titleSlug: string;
	isValid: boolean;
	error?: string;
} {
	try {
		// Pattern: book/unitXX/XX_XX_type_slug.ts
		const match = path.match(
			/book\/unit(\d+)\/(\d+)_(\d+)_(lesson|study_guide|quiz|overview|exam|project)(?:_(.+?))?\.ts$/
		);

		if (!match) {
			return {
				id: "",
				unitNum: "",
				chapterNum: "",
				contentType: "lesson",
				titleSlug: "",
				isValid: false,
				error: `Invalid file path format: ${path}. Expected format: book/unitXX/XX_XX_type_slug.ts`
			};
		}

		const unitNum = String(parseInt(match[2]));
		const chapterNum = String(parseInt(match[3]));
		const contentType = match[4] as ChapterType;
		const titleSlug = match[5] || "";

		// Validate unit consistency
		if (match[1] !== padNumber(unitNum)) {
			return {
				id: "",
				unitNum: "",
				chapterNum: "",
				contentType: "lesson",
				titleSlug: "",
				isValid: false,
				error: `Unit mismatch in path: directory unit${match[1]} vs file unit ${unitNum}`
			};
		}

		// Generate ID from parsed components
		const id = generateContentId(unitNum, chapterNum, contentType);

		return {
			id,
			unitNum,
			chapterNum,
			contentType,
			titleSlug,
			isValid: true
		};
	} catch (error) {
		return {
			id: "",
			unitNum: "",
			chapterNum: "",
			contentType: "lesson",
			titleSlug: "",
			isValid: false,
			error: error instanceof Error ? error.message : "Unknown parsing error"
		};
	}
}
