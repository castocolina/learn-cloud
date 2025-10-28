/**
 * Navigation Helper Utilities
 *
 * Functions for finding adjacent chapters, unit overviews, and other
 * navigation-related operations using the content menu.
 *
 * @module navigationHelpers
 */

import { contentMenu } from "$data/generated/content-menu";
import type { BreadcrumbItem, MenuChapter } from "$types";

/**
 * Adjacent chapter information
 */
export interface AdjacentChapters {
	previousChapter?: MenuChapter;
	nextChapter?: MenuChapter;
}

/**
 * Unit overview link information
 */
export interface UnitOverviewLink {
	id: string;
	title: string;
	url: string;
	unitNumber: number;
}

/**
 * Flattens the content menu into a single array of chapters
 * Preserves order for sequential navigation
 *
 * @returns Flattened array of all chapters across all units
 */
function flattenContentMenu(): MenuChapter[] {
	const allChapters: MenuChapter[] = [];

	for (const unit of contentMenu.units) {
		for (const chapter of unit.chapters) {
			allChapters.push(chapter);
		}
	}

	return allChapters;
}

/**
 * Finds the previous and next chapters relative to a given chapter ID
 *
 * @param currentChapterId - The ID of the current chapter
 * @returns Object containing previousChapter and nextChapter (if they exist)
 *
 * @example
 * ```typescript
 * const { previousChapter, nextChapter } = getAdjacentChapters("01_02L");
 * ```
 */
export function getAdjacentChapters(currentChapterId: string): AdjacentChapters {
	const allChapters = flattenContentMenu();
	const currentIndex = allChapters.findIndex((ch) => ch.id === currentChapterId);

	if (currentIndex === -1) {
		return {}; // Chapter not found
	}

	return {
		previousChapter: currentIndex > 0 ? allChapters[currentIndex - 1] : undefined,
		nextChapter: currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : undefined
	};
}

/**
 * Extracts unit overview information from breadcrumbs
 *
 * Looks for a "Unit X: Overview" breadcrumb or constructs the overview URL
 * from the unit information in the breadcrumb trail.
 *
 * @param breadcrumbs - Array of breadcrumb items
 * @returns Unit overview link information, or undefined if not in a unit context
 *
 * @example
 * ```typescript
 * const overview = getUnitOverview(breadcrumbs);
 * if (overview) {
 *   console.log(`Unit ${overview.unitNumber} Overview: ${overview.title}`);
 * }
 * ```
 */
export function getUnitOverview(breadcrumbs: BreadcrumbItem[]): UnitOverviewLink | undefined {
	// Find the breadcrumb that represents a unit
	const unitBreadcrumb = breadcrumbs.find((crumb) => crumb.label.startsWith("Unit "));

	if (!unitBreadcrumb) return undefined;

	// Extract unit number from label (e.g., "Unit 1: Python..." -> 1)
	const unitMatch = unitBreadcrumb.label.match(/^Unit (\d+):/);
	if (!unitMatch) return undefined;

	const unitNumber = parseInt(unitMatch[1], 10);

	// Find the unit in content menu
	const unit = contentMenu.units.find((u) => u.unitNumber === unitNumber);
	if (!unit) return undefined;

	// Find the overview chapter (type === "overview")
	const overviewChapter = unit.chapters.find((ch) => ch.type === "overview");

	if (overviewChapter) {
		return {
			id: overviewChapter.id,
			title: overviewChapter.title,
			url: overviewChapter.chapterUrl,
			unitNumber
		};
	}

	// Fallback: construct overview URL pattern
	const paddedUnit = unitNumber.toString().padStart(2, "0");
	return {
		id: `${paddedUnit}_00O`,
		title: `Unit ${unitNumber}: Overview`,
		url: `${paddedUnit}_00_overview.html`,
		unitNumber
	};
}

/**
 * Gets the full breadcrumb hierarchy with enriched data
 *
 * Adds emoji icons and ensures all breadcrumbs have proper metadata
 *
 * @param breadcrumbs - Raw breadcrumb items from store
 * @returns Enriched breadcrumb hierarchy
 */
export function getFullBreadcrumbHierarchy(breadcrumbs: BreadcrumbItem[]): BreadcrumbItem[] {
	return breadcrumbs.map((crumb) => {
		// Add default emoji if missing
		if (!crumb.emoji) {
			if (crumb.label.toLowerCase().includes("home")) {
				return { ...crumb, emoji: "🏠" };
			} else if (crumb.label.startsWith("Unit")) {
				return { ...crumb, emoji: "📚" };
			} else {
				return { ...crumb, emoji: "📄" };
			}
		}
		return crumb;
	});
}

/**
 * Checks if a chapter ID belongs to a specific unit
 *
 * @param chapterId - The chapter ID to check
 * @param unitNumber - The unit number to check against
 * @returns True if the chapter belongs to the specified unit
 */
export function isChapterInUnit(chapterId: string, unitNumber: number): boolean {
	const paddedUnit = unitNumber.toString().padStart(2, "0");
	return chapterId.startsWith(paddedUnit);
}
