/**
 * Unified SPA Navigation System
 *
 * Central navigation coordinator that updates ALL navigation components atomically.
 * Implements the unified navigation architecture from PLAN-SEARCH-ARCHITECTURE.md
 *
 * ARCHITECTURE:
 * - Single source of truth for all navigation operations
 * - Updates: stores, URL hash, breadcrumbs, progress tracking
 * - Coordinates: Sidebar (8A), Header (8B), Breadcrumb (8C), Sequential Nav (8L)
 * - Integrates: flatNavigation, contentMenu, progress tracking
 *
 * NAVIGATION FLOW:
 * 1. navigateToContent() called from any source (sidebar, search, etc.)
 * 2. Parse chapterUrl → get chapterId
 * 3. Update URL hash (triggers hashchange)
 * 4. Update navigation store (sidebar listens)
 * 5. Update breadcrumb store (breadcrumb listens)
 * 6. Update sequential nav (previous/next)
 * 7. Track progress visit
 * 8. Dispatch content-load event
 *
 * INTEGRATION POINTS:
 * - TASK 8A (Sidebar): Call navigateToContent() on chapter click
 * - TASK 8B (Header): Display breadcrumb from breadcrumbStore
 * - TASK 8C (Breadcrumb): Use breadcrumbStore, call navigateToContent() on click
 * - TASK 8K (Progress): Listens to navigation events
 * - TASK 8L (Sequential Nav): Use previousEntry/nextEntry from navigationStore
 * - TASK 8M (Search): Call navigateToContent() on result click
 *
 * @module spaNavigation
 */

import { get } from "svelte/store";
import { navigationStore } from "$lib/stores/spaNavigation.js";
import { breadcrumbStore } from "$lib/stores/breadcrumb.js";
import { flatNavigation } from "$data/generated/flatnav.js";
import { contentMenu } from "$data/generated/content-menu.js";
import { parseContentUrl } from "./content-identifiers.js";
import { padNumber } from "./string-utils.js";
import type { NavigationEvent, BreadcrumbItem } from "$types";

/**
 * Unified navigation handler - Single source of truth
 *
 * Updates ALL navigation components atomically to maintain consistency.
 * This function is called from all navigation sources (sidebar, search, etc.)
 *
 * @param event - Navigation event with type, target, source, and data
 *
 * @example
 * // From sidebar click
 * navigateToContent({
 *   type: "navigate",
 *   target: "01_01_lesson_dev.html",
 *   source: "sidebar",
 *   data: { unitId: "unit_1", chapterId: "01_01L" },
 *   timestamp: new Date()
 * });
 *
 * // From search result
 * navigateToContent({
 *   type: "navigate",
 *   target: searchResult.chapterUrl,
 *   source: "search",
 *   data: { chapterId: searchResult.id },
 *   timestamp: new Date()
 * });
 */
export function navigateToContent(event: NavigationEvent): void {
	const { target, source } = event;
	const chapterUrl = typeof target === "string" ? target : target.path || "";

	// Parse chapterUrl to get ID and components
	const parsed = parseContentUrl(chapterUrl);
	if (!parsed.isValid || !parsed.id) {
		console.error("Invalid navigation target:", chapterUrl, parsed.error);
		navigationStore.update((state) => ({
			...state,
			error: `Invalid navigation: ${parsed.error || "Unknown error"}`
		}));
		return;
	}

	const chapterId = parsed.id;
	const { unitNum } = parsed;

	// 1. Update URL hash (triggers hashchange event)
	window.location.hash = `/${chapterUrl}`;

	// 2. Update navigation store (sidebar, breadcrumb listen to this)
	navigationStore.update((state) => ({
		...state,
		currentId: chapterId,
		currentChapterUrl: chapterUrl,
		source,
		isLoading: false,
		error: null
	}));

	// 3. Update breadcrumb trail
	const unitId = `unit_${unitNum}`;
	const breadcrumbs = generateBreadcrumbs(unitId, chapterId, chapterUrl);
	breadcrumbStore.set(breadcrumbs);

	// 4. Update sequential navigation (previous/next)
	const entry = flatNavigation.sequenceMap.get(chapterId);
	if (entry) {
		navigationStore.update((state) => ({
			...state,
			previousEntry: entry.previousEntry || null,
			nextEntry: entry.nextEntry || null
		}));
	}

	// 5. Track visit in progress (TODO: TASK 8K - integrate when progress tracking is ready)
	// const finalUnitId = data?.unitId || unitId;
	// visitChapter(finalUnitId, chapterId);

	// 6. Dispatch content-load event for ContentRouter
	window.dispatchEvent(
		new CustomEvent("content-load", {
			detail: {
				chapterId,
				chapterUrl,
				filePath: entry?.filePath || ""
			}
		})
	);
}

/**
 * Generate breadcrumb trail for current navigation
 *
 * Creates breadcrumb array: Home → Unit → Chapter
 * Uses content-menu for unit/chapter information
 *
 * @param unitId - Unit ID (e.g., "unit_1")
 * @param chapterId - Chapter ID (e.g., "01_01L")
 * @param chapterUrl - Chapter URL for navigation
 * @returns Breadcrumb trail array
 */
function generateBreadcrumbs(
	unitId: string,
	chapterId: string,
	chapterUrl: string
): BreadcrumbItem[] {
	const breadcrumbs: BreadcrumbItem[] = [];

	// Always start with Home
	breadcrumbs.push({
		id: "home",
		label: "Home",
		url: "#/",
		icon: "Home",
		isClickable: true,
		isActive: false
	});

	// Find unit in content menu
	const unit = contentMenu.units.find((u) => u.id === unitId);
	if (unit) {
		// Extract unit number for overview URL
		const unitNum = unit.id.replace("unit_", "");
		const paddedUnitNum = padNumber(unitNum);

		// Find overview chapter for unit
		const overviewChapter = unit.chapters.find((ch) => ch.type === "overview");
		const unitUrl = overviewChapter ? `#/${overviewChapter.chapterUrl}` : `#/unit${paddedUnitNum}`;

		breadcrumbs.push({
			id: unitId,
			label: unit.title,
			url: unitUrl,
			icon: "BookOpen",
			isClickable: true,
			isActive: false
		});

		// Find current chapter
		const chapter = unit.chapters.find((ch) => ch.id === chapterId);
		if (chapter) {
			breadcrumbs.push({
				id: chapterId,
				label: chapter.title,
				url: `#/${chapterUrl}`,
				icon: "FileText",
				isClickable: false, // Current page is not clickable
				isActive: true
			});
		}
	}

	return breadcrumbs;
}

/**
 * Navigate to previous chapter in sequence
 *
 * Convenience function for sequential navigation
 * Uses current navigation state to find previous chapter
 *
 * @example
 * <button onclick={navigateToPrevious}>Previous</button>
 */
export function navigateToPrevious(): void {
	const currentState = get(navigationStore);

	if (currentState.previousEntry) {
		navigateToContent({
			type: "navigate",
			target: currentState.previousEntry.chapterUrl,
			source: "sequential",
			data: {
				unitId: currentState.previousEntry.unitId,
				chapterId: currentState.previousEntry.id
			},
			timestamp: new Date()
		});
	}
}

/**
 * Navigate to next chapter in sequence
 *
 * Convenience function for sequential navigation
 * Uses current navigation state to find next chapter
 *
 * @example
 * <button onclick={navigateToNext}>Next</button>
 */
export function navigateToNext(): void {
	const currentState = get(navigationStore);

	if (currentState.nextEntry) {
		navigateToContent({
			type: "navigate",
			target: currentState.nextEntry.chapterUrl,
			source: "sequential",
			data: {
				unitId: currentState.nextEntry.unitId,
				chapterId: currentState.nextEntry.id
			},
			timestamp: new Date()
		});
	}
}
