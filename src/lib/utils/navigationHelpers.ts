/**
 * Navigation Helpers Utility
 *
 * Quick navigation utilities for BreadcrumbSheet component.
 * Provides prev/next chapter and unit overview logic.
 *
 * @module navigationHelpers
 */

import type { BreadcrumbItem, AdjacentChapters, UnitOverviewLink } from "$types";
import { contentMenu } from "$data/generated/content-menu";

/**
 * Get previous and next chapters for quick navigation
 *
 * Flattens all chapters from all units into a single array
 * and finds the adjacent chapters for sequential navigation.
 *
 * @param currentChapterId - ID of current chapter (e.g., "01_06L")
 * @returns Object with previousChapter and nextChapter (or undefined if at boundaries)
 *
 * @example
 * getAdjacentChapters("01_06L")
 * // Returns: {
 * //   previousChapter: { id: "01_05L", title: "1.5: Concurrency...", url: "..." },
 * //   nextChapter: { id: "01_07L", title: "1.7: Advanced...", url: "..." }
 * // }
 */
export function getAdjacentChapters(currentChapterId: string): AdjacentChapters {
	// Flatten all chapters from all units
	const allChapters = contentMenu.units.flatMap((unit) =>
		unit.chapters.map((chapter) => ({
			id: chapter.id,
			title: chapter.title,
			url: chapter.chapterUrl
		}))
	);

	const currentIndex = allChapters.findIndex((ch) => ch.id === currentChapterId);

	if (currentIndex === -1) {
		return {};
	}

	return {
		previousChapter: currentIndex > 0 ? allChapters[currentIndex - 1] : undefined,
		nextChapter: currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : undefined
	};
}

/**
 * Get unit overview link from breadcrumb hierarchy
 *
 * Extracts the unit from the breadcrumb trail and finds
 * the corresponding unit overview chapter (type: "overview").
 *
 * @param breadcrumbs - Full breadcrumb hierarchy (Home → Unit → Chapter)
 * @returns Unit overview link object or undefined if not found
 *
 * @example
 * getUnitOverview([
 *   { id: "home", label: "Home", ... },
 *   { id: "unit_1", label: "Unit 1: Python...", ... },
 *   { id: "01_06L", label: "1.6: RESTful API", ... }
 * ])
 * // Returns: { id: "01_00O", title: "Unit 1: Overview...", url: "..." }
 */
export function getUnitOverview(breadcrumbs: BreadcrumbItem[]): UnitOverviewLink | undefined {
	// Find unit breadcrumb (second item: Home → Unit → Chapter)
	const unitBreadcrumb = breadcrumbs.find((crumb) => crumb.id?.includes("unit_"));

	if (!unitBreadcrumb) return undefined;

	// Extract unit number
	const unitNumber = unitBreadcrumb.id.match(/unit_(\d+)/)?.[1];
	if (!unitNumber) return undefined;

	const unit = contentMenu.units.find((u) => u.unitNumber === parseInt(unitNumber));
	const overviewChapter = unit?.chapters.find((ch) => ch.type === "overview");

	if (!overviewChapter) return undefined;

	return {
		id: overviewChapter.id,
		title: overviewChapter.title,
		url: overviewChapter.chapterUrl
	};
}
