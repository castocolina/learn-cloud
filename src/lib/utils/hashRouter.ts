/**
 * Hash-Based Router for SPA Navigation
 *
 * Provides utilities for hash-based routing in the Cloud-Native Learning Platform.
 * Works seamlessly with chapterUrl format from generated files (content-menu, flatnav).
 *
 * KEY FEATURES:
 * - Parse window.location.hash to get content lookup
 * - Navigate to content by chapterUrl
 * - Get current hash state
 * - Reuses existing utilities (content-identifiers, content-lookup)
 *
 * URL FORMAT:
 * - Hash: #/01_01_lesson_development_environment.html
 * - Pattern: #/{unitNum}_{chapterNum}_{type}_{slug}.html
 *
 * INTEGRATION:
 * - Used by ContentRouter for initial load and hashchange events
 * - Used by navigation components (sidebar, breadcrumb, search)
 * - Browser back/forward support via hashchange listener
 *
 * @module hashRouter
 */

import { parseContentUrl } from "./content-identifiers.js";
import { lookupContentByUrl } from "./content-lookup.js";
import type { ContentLookupResult } from "$types";

/**
 * Parse hash to get content lookup result
 *
 * Removes hash prefix and delegates to existing lookup utilities
 * for consistency across the application.
 *
 * @param hash - Hash string from window.location.hash
 * @returns Content lookup result with menu/flatnav/search entries
 *
 * @example
 * parseHash("#/01_01_lesson_dev.html")
 *   → { isFound: true, flatNavEntry: {...}, menuEntry: {...} }
 *
 * parseHash("")
 *   → { isFound: false, ... }
 */
export function parseHash(hash: string): ContentLookupResult {
	// Remove #/ prefix: "#/01_01_lesson_dev.html" → "01_01_lesson_dev.html"
	const chapterUrl = hash.replace(/^#?\/?/, "");

	if (!chapterUrl) {
		return createEmptyResult();
	}

	// Use existing lookup utility for consistency
	return lookupContentByUrl(chapterUrl);
}

/**
 * Navigate to content by updating hash
 *
 * Updates window.location.hash which triggers hashchange event
 * that ContentRouter listens to for navigation.
 *
 * @param chapterUrl - Chapter URL from MenuChapter or FlatNavEntry
 *
 * @example
 * navigateToChapter("01_01_lesson_dev.html")
 *   → Updates hash to #/01_01_lesson_dev.html
 */
export function navigateToChapter(chapterUrl: string): void {
	window.location.hash = `/${chapterUrl}`;
}

/**
 * Get current hash without prefix
 *
 * Removes #/ prefix for consistent processing
 *
 * @returns Current chapterUrl from hash or empty string
 *
 * @example
 * // window.location.hash = "#/01_01_lesson_dev.html"
 * getCurrentHash() → "01_01_lesson_dev.html"
 */
export function getCurrentHash(): string {
	return window.location.hash.replace(/^#?\/?/, "");
}

/**
 * Validate hash format
 *
 * Checks if hash matches expected chapterUrl pattern
 *
 * @param hash - Hash string to validate
 * @returns True if valid chapterUrl format
 *
 * @example
 * isValidHash("#/01_01_lesson_dev.html") → true
 * isValidHash("#/invalid") → false
 */
export function isValidHash(hash: string): boolean {
	const chapterUrl = hash.replace(/^#?\/?/, "");
	if (!chapterUrl) return false;

	const parsed = parseContentUrl(chapterUrl);
	return parsed.isValid;
}

/**
 * Create empty lookup result
 * Helper for consistent empty state
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
