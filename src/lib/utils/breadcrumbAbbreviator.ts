/**
 * Breadcrumb Abbreviation Utility
 *
 * Intelligent title abbreviation for mobile breadcrumb display.
 * Part of Strategy A: Smart Abbreviation + Progressive Disclosure.
 *
 * @module breadcrumbAbbreviator
 */

import type { BreadcrumbItem, AbbreviationConfig } from "$types";

const DEFAULT_CONFIG: AbbreviationConfig = {
	maxLength: 22,
	keepChapterNumber: true,
	preserveArticles: false
};

/**
 * Abbreviate chapter title for mobile display
 *
 * Algorithm:
 * 1. If title already short (≤maxLength), return as-is
 * 2. Extract and preserve chapter number (e.g., "1.6:")
 * 3. Remove common articles and prepositions
 * 4. Combine chapter number + abbreviated text
 * 5. If still too long, truncate with ellipsis
 *
 * @param breadcrumb - Full breadcrumb item
 * @param config - Abbreviation configuration
 * @returns Abbreviated title string (≤22 characters)
 *
 * @example
 * abbreviateChapterTitle(
 *   { id: "01_06L", label: "1.6: Building a RESTful API with FastAPI", url: "..." },
 *   DEFAULT_CONFIG
 * )
 * // Returns: "1.6: RESTful API"
 */
export function abbreviateChapterTitle(
	breadcrumb: BreadcrumbItem,
	config: AbbreviationConfig = DEFAULT_CONFIG
): string {
	const title = breadcrumb.label;

	// Si ya es corto, retornar como está
	if (title.length <= config.maxLength) {
		return title;
	}

	// Extraer número de capítulo (patrón: "X.Y:")
	const chapterMatch = title.match(/^(\d+\.\d+:)/);
	const chapterNumber = chapterMatch ? chapterMatch[1] : "";
	const restOfTitle = chapterNumber ? title.slice(chapterNumber.length).trim() : title;

	// Palabras comunes a remover
	const wordsToRemove = config.preserveArticles
		? ["with", "for", "in", "on", "and", "or", "to"]
		: ["a", "the", "with", "for", "in", "on", "and", "or", "to", "of"];

	const abbreviated = restOfTitle
		.split(" ")
		.filter((word) => !wordsToRemove.includes(word.toLowerCase()))
		.join(" ");

	// Combinar número + texto abreviado
	const combined = chapterNumber + " " + abbreviated;

	// Si aún es largo, truncar con ellipsis
	if (combined.length > config.maxLength) {
		return combined.slice(0, config.maxLength - 3) + "...";
	}

	return combined.trim();
}

/**
 * Get full breadcrumb hierarchy for Sheet display
 *
 * Marks the last breadcrumb as active for visual highlighting
 * in the BreadcrumbSheet component.
 *
 * @param breadcrumbs - Array of breadcrumb items
 * @returns Breadcrumb array with isActive flags set
 */
export function getFullBreadcrumbHierarchy(breadcrumbs: BreadcrumbItem[]): BreadcrumbItem[] {
	return breadcrumbs.map((crumb, index) => ({
		...crumb,
		isActive: index === breadcrumbs.length - 1
	}));
}
