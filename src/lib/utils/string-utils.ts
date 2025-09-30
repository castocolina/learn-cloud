/**
 * String Utility Functions for Cloud-Native Learning Platform
 *
 * Centralized string manipulation utilities used across the application.
 * These functions provide consistent behavior for:
 * - Number padding (for sorting and display)
 * - Slug generation (for URLs and file names)
 * - Chapter number normalization (parsing various formats)
 *
 * This module eliminates duplication across:
 * - content-identifiers.ts
 * - generate-menu.ts (navigation path generation)
 * - Other scripts and utilities
 */

/**
 * Zero-pad numbers for consistent sorting and display
 *
 * @param num - Number or string to pad
 * @param length - Desired length (default: 2)
 * @returns Zero-padded string
 *
 * @example
 * padNumber(1)     → "01"
 * padNumber("5")   → "05"
 * padNumber(10)    → "10"
 * padNumber(1, 3)  → "001"
 */
export function padNumber(num: string | number, length: number = 2): string {
	return String(num).padStart(length, "0");
}

/**
 * Generate URL-friendly slug from title
 *
 * Converts text to lowercase, replaces spaces with underscores,
 * removes special characters, and normalizes multiple underscores.
 *
 * @param title - Title text to convert
 * @returns URL-friendly slug
 *
 * @example
 * generateSlug("Development Environment")  → "development_environment"
 * generateSlug("Unit 1: Overview")         → "unit_1_overview"
 * generateSlug("Test & Deploy")            → "test_deploy"
 */
export function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^\w\s-]/g, "") // Remove special characters
		.replace(/\s+/g, "_") // Replace spaces with underscores
		.replace(/__+/g, "_") // Replace multiple underscores with single
		.replace(/^_+|_+$/g, ""); // Remove leading/trailing underscores
}

/**
 * Normalize chapter number from various input formats
 *
 * Accepts multiple formats and returns consistent unit/chapter structure:
 * - Decimal format: "1.1" → { unit: "1", chapter: "1" }
 * - Underscore format: "1_1" → { unit: "1", chapter: "1" }
 * - Padded format: "01_01" → { unit: "1", chapter: "1" }
 * - Single number: "1" → { unit: "1", chapter: "1" }
 *
 * @param input - Chapter number in any supported format
 * @returns Object with normalized unit and chapter numbers
 *
 * @example
 * normalizeChapterNumber("1.1")    → { unit: "1", chapter: "1" }
 * normalizeChapterNumber("1_1")    → { unit: "1", chapter: "1" }
 * normalizeChapterNumber("01_01")  → { unit: "1", chapter: "1" }
 * normalizeChapterNumber("1")      → { unit: "1", chapter: "1" }
 */
export function normalizeChapterNumber(input: string): { unit: string; chapter: string } {
	// Handle decimal format: "1.1", "2.3"
	if (input.includes(".")) {
		const [unit, chapter] = input.split(".");
		return {
			unit: String(parseInt(unit, 10)),
			chapter: String(parseInt(chapter, 10))
		};
	}

	// Handle underscore format: "1_1", "01_01"
	if (input.includes("_")) {
		const [unit, chapter] = input.split("_");
		return {
			unit: String(parseInt(unit, 10)),
			chapter: String(parseInt(chapter, 10))
		};
	}

	// Handle single number: "1", "01"
	const num = String(parseInt(input, 10));
	return {
		unit: num,
		chapter: num
	};
}

/**
 * Extract chapter number from full chapter string
 *
 * For formats like "1.1", extracts the chapter part after the decimal.
 * For simple numbers, returns as-is.
 *
 * @param chapterNum - Chapter number string
 * @returns Extracted chapter number
 *
 * @example
 * extractChapterNumber("1.1")   → "1"
 * extractChapterNumber("2.10")  → "10"
 * extractChapterNumber("5")     → "5"
 */
export function extractChapterNumber(chapterNum: string): string {
	if (chapterNum.includes(".")) {
		const parts = chapterNum.split(".");
		return parts[1] || "1";
	}
	return chapterNum;
}
