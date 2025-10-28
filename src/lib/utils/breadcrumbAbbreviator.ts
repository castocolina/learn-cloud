/**
 * Breadcrumb Abbreviation Utility
 *
 * Intelligent title abbreviation for mobile breadcrumb display.
 * Reduces long chapter titles to 22 characters while preserving key information.
 *
 * Features:
 * - Preserves chapter numbers (e.g., "1.6:")
 * - Removes common articles and prepositions
 * - Smart truncation with ellipsis
 *
 * @module breadcrumbAbbreviator
 */

import type { BreadcrumbItem } from "$types";

/**
 * Configuration for title abbreviation
 */
export interface AbbreviationConfig {
	/** Maximum character length for abbreviated title */
	maxLength: number;
	/** Whether to preserve articles (a, the) in abbreviation */
	preserveArticles: boolean;
}

/**
 * Default abbreviation configuration
 */
export const DEFAULT_CONFIG: AbbreviationConfig = {
	maxLength: 22,
	preserveArticles: false
};

/**
 * Abbreviates a chapter title for mobile display
 *
 * Algorithm:
 * 1. Extract and preserve chapter number (e.g., "1.6:")
 * 2. Remove common words (articles, prepositions)
 * 3. Truncate to maxLength with ellipsis if needed
 *
 * @param breadcrumb - The breadcrumb item to abbreviate
 * @param config - Abbreviation configuration
 * @returns Abbreviated title (max 22 chars)
 *
 * @example
 * ```typescript
 * const crumb = {
 *   label: "1.6: Building a RESTful API with FastAPI and PostgreSQL"
 * };
 * abbreviateChapterTitle(crumb);
 * // Returns: "1.6: Building REST..."
 * ```
 */
export function abbreviateChapterTitle(
	breadcrumb: BreadcrumbItem,
	config: AbbreviationConfig = DEFAULT_CONFIG
): string {
	const title = breadcrumb.label;

	// Early return for short titles
	if (title.length <= config.maxLength) return title;

	// Extract chapter number (e.g., "1.6:", "2.3:")
	const chapterMatch = title.match(/^(\d+\.\d+:)/);
	const chapterNumber = chapterMatch ? chapterMatch[1] : "";
	const restOfTitle = chapterNumber ? title.slice(chapterNumber.length).trim() : title;

	// Words to filter out for abbreviation
	const wordsToRemove = config.preserveArticles
		? ["with", "for", "in", "on", "and", "or", "to"]
		: ["a", "the", "with", "for", "in", "on", "and", "or", "to", "of"];

	// Filter and rejoin words
	const abbreviated = restOfTitle
		.split(" ")
		.filter((word) => !wordsToRemove.includes(word.toLowerCase()))
		.join(" ");

	// Combine chapter number with abbreviated text
	const combined = chapterNumber + " " + abbreviated;

	// Truncate if still too long
	return combined.length > config.maxLength
		? combined.slice(0, config.maxLength - 3) + "..."
		: combined.trim();
}

/**
 * Get the full title (unabbreviated) from a breadcrumb
 *
 * @param breadcrumb - The breadcrumb item
 * @returns Full unabbreviated title
 */
export function getFullTitle(breadcrumb: BreadcrumbItem): string {
	return breadcrumb.label;
}
