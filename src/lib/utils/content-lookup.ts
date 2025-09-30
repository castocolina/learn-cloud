/**
 * Content Cross-Reference and Lookup Utilities
 *
 * This module provides functions to look up content across all generated data sources
 * (content-menu, flatnav, search-index) using the unified ID and URL system.
 *
 * KEY FEATURES:
 * - O(1) lookup by ID across all data sources
 * - URL-to-ID resolution with graceful fallbacks
 * - File path-to-content resolution
 * - Comprehensive cross-reference validation
 *
 * USAGE:
 * - Search Results: lookupContentById() to navigate to content
 * - URL Resolution: lookupContentByUrl() for bookmark/external links
 * - File Operations: lookupContentByFilePath() for content management tools
 *
 * INTEGRATION:
 * - Requires generated files: content-menu.ts, flatnav.ts, search-index.ts
 * - Uses content-identifiers.ts for ID/URL parsing
 */

import type { ContentLookupResult, MenuChapter, FlatNavEntry, SearchableItem } from "$types";
import { parseContentId, parseContentUrl, parseFilePath } from "./content-identifiers";
import { contentMenu } from "$data/generated/content-menu";
import { flatNavigation } from "$data/generated/flatnav";
import { searchIndex } from "$data/generated/search-index";

// ============================================================================
// LOOKUP BY ID
// ============================================================================

/**
 * Lookup content by ID across all data sources
 * Provides comprehensive cross-reference information for navigation
 *
 * @param id - Content ID to look up (e.g., "01_01L", "01_01SG")
 * @returns Complete content lookup result with all cross-references
 *
 * @example
 * const result = lookupContentById("01_01L");
 * if (result.isFound) {
 *   console.log(result.menuEntry?.title);      // "1.1: Development Environment"
 *   console.log(result.url);                   // "#unit01/chapter01"
 *   console.log(result.contentUrl);            // "01_01_lesson_dev_env.html"
 * }
 */
export function lookupContentById(id: string): ContentLookupResult {
	// Parse ID to extract components
	const parsed = parseContentId(id);

	if (!parsed.isValid) {
		return createEmptyResult();
	}

	// Look up in all data sources
	const menuEntry = findInContentMenu(id);
	const flatNavEntry = findInFlatNav(id);
	const searchEntry = findInSearchIndex(id);

	// If found in any source, construct full result
	if (menuEntry || flatNavEntry || searchEntry) {
		// Get chapterUrl and filePath from available entries
		const chapterUrl = menuEntry?.chapterUrl || flatNavEntry?.chapterUrl || "";
		const filePath = menuEntry?.filePath || flatNavEntry?.filePath || "";

		return {
			menuEntry,
			flatNavEntry,
			searchEntry,
			filePath,
			chapterUrl,
			isFound: true
		};
	}

	return createEmptyResult();
}

// ============================================================================
// LOOKUP BY URL
// ============================================================================

/**
 * Lookup content by URL (descriptive or hash-based)
 * Resolves URLs to content IDs and provides full cross-reference data
 *
 * @param url - URL to resolve (descriptive or hash format)
 * @returns Content lookup result
 *
 * @example
 * // Descriptive URL
 * lookupContentByUrl("01_01_lesson_dev_env.html");
 *
 * // Hash-based URL
 * lookupContentByUrl("#unit01/chapter01");
 */
export function lookupContentByUrl(url: string): ContentLookupResult {
	// Try parsing as descriptive URL
	const parsed = parseContentUrl(url);

	if (parsed.isValid && parsed.id) {
		return lookupContentById(parsed.id);
	}

	// Try matching chapterUrl in flat navigation
	const flatNavEntry = flatNavigation.entries.find((entry) => entry.chapterUrl === url);
	if (flatNavEntry) {
		return lookupContentById(flatNavEntry.id);
	}

	// Try matching chapterUrl in menu
	const menuEntry = findMenuEntryByUrl(url);
	if (menuEntry) {
		return lookupContentById(menuEntry.id);
	}

	return createEmptyResult();
}

// ============================================================================
// LOOKUP BY FILE PATH
// ============================================================================

/**
 * Lookup content by file path
 * Used by content management tools to resolve file paths to content metadata
 *
 * @param path - File path to resolve
 * @returns Content lookup result
 *
 * @example
 * lookupContentByFilePath("book/unit01/01_01_lesson_dev_env.ts");
 */
export function lookupContentByFilePath(path: string): ContentLookupResult {
	const parsed = parseFilePath(path);

	if (parsed.isValid && parsed.id) {
		return lookupContentById(parsed.id);
	}

	// Try direct path matching in menu
	const menuEntry = findMenuEntryByPath(path);
	if (menuEntry) {
		return lookupContentById(menuEntry.id);
	}

	return createEmptyResult();
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find entry in content menu by ID
 */
function findInContentMenu(id: string): MenuChapter | null {
	for (const unit of contentMenu.units) {
		const chapter = unit.chapters.find((ch) => ch.id === id);
		if (chapter) {
			return chapter;
		}
	}
	return null;
}

/**
 * Find entry in flat navigation by ID
 */
function findInFlatNav(id: string): FlatNavEntry | null {
	const entry = flatNavigation.sequenceMap.get(id);
	return entry || null;
}

/**
 * Find entry in search index by ID
 */
function findInSearchIndex(id: string): SearchableItem | null {
	const item = searchIndex.find((item) => item.id === id);
	return item || null;
}

/**
 * Find menu entry by URL
 */
function findMenuEntryByUrl(url: string): MenuChapter | null {
	for (const unit of contentMenu.units) {
		const chapter = unit.chapters.find((ch) => ch.chapterUrl === url);
		if (chapter) {
			return chapter;
		}
	}
	return null;
}

/**
 * Find menu entry by file path
 */
function findMenuEntryByPath(path: string): MenuChapter | null {
	for (const unit of contentMenu.units) {
		const chapter = unit.chapters.find((ch) => ch.filePath === path);
		if (chapter) {
			return chapter;
		}
	}
	return null;
}

/**
 * Create empty lookup result
 */
function createEmptyResult(): ContentLookupResult {
	return {
		menuEntry: null,
		flatNavEntry: null,
		searchEntry: null,
		filePath: "",
		chapterUrl: "",
		isFound: false
	};
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate cross-reference integrity
 * Checks if ID exists in all expected data sources
 *
 * @param id - Content ID to validate
 * @returns Validation result with details
 */
export function validateCrossReference(id: string): {
	isValid: boolean;
	foundIn: string[];
	missingFrom: string[];
} {
	const foundIn: string[] = [];
	const missingFrom: string[] = [];

	const result = lookupContentById(id);

	if (result.menuEntry) foundIn.push("content-menu");
	else missingFrom.push("content-menu");

	if (result.flatNavEntry) foundIn.push("flatnav");
	else missingFrom.push("flatnav");

	if (result.searchEntry) foundIn.push("search-index");
	else missingFrom.push("search-index");

	return {
		isValid: foundIn.length > 0,
		foundIn,
		missingFrom
	};
}

/**
 * Get all unique IDs from content menu
 * Used for validation and testing
 */
export function getAllContentIds(): string[] {
	const ids: string[] = [];
	for (const unit of contentMenu.units) {
		for (const chapter of unit.chapters) {
			ids.push(chapter.id);
		}
	}
	return ids;
}

/**
 * Find duplicate IDs in content menu
 * Returns map of ID to count
 */
export function findDuplicateIds(): Map<string, number> {
	const idCounts = new Map<string, number>();

	for (const unit of contentMenu.units) {
		for (const chapter of unit.chapters) {
			const count = idCounts.get(chapter.id) || 0;
			idCounts.set(chapter.id, count + 1);
		}
	}

	// Filter to only duplicates
	const duplicates = new Map<string, number>();
	for (const [id, count] of idCounts.entries()) {
		if (count > 1) {
			duplicates.set(id, count);
		}
	}

	return duplicates;
}
