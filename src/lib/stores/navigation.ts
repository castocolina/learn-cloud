/**
 * Navigation Store - Global Lesson Navigation System
 *
 * This store acts as the central "GPS" for the learning platform, providing:
 * - Flattened, ordered list of all lessons across units
 * - Current lesson index tracking based on URL
 * - Previous/Next lesson URLs for floating navigation
 * - Progress completion percentage across all content
 *
 * Architecture:
 * - Reactive to SvelteKit's $page store for URL changes
 * - Integrates with demoSidebarMenu data structure
 * - Provides seamless navigation between any two lessons
 * - Updates sidebar active state automatically via URL changes
 */

import { derived, type Readable } from "svelte/store";
import { page } from "$app/stores";
import { browser } from "$app/environment";
import {
	demoSidebarMenu,
	type DemoLesson,
	type DemoUnit
} from "$data/demo/navigation/demo-sidebar-menu.js";

export interface FlattenedLesson {
	id: string;
	title: string;
	description: string;
	url: string;
	contentType: string;
	duration: string;
	difficulty: string;
	icon: string;
	unitId: string;
	unitTitle: string;
	unitIcon: string;
	lessonIndex: number; // Index within the unit
	globalIndex: number; // Index across all lessons
}

export interface NavigationState {
	flattenedLessons: FlattenedLesson[];
	currentLessonIndex: number | null;
	previousLessonUrl: string | null;
	nextLessonUrl: string | null;
	currentLesson: FlattenedLesson | null;
	totalLessons: number;
	completionPercentage: number;
}

/**
 * Create flattened lesson list from demo sidebar menu
 */
function createFlattenedLessons(): FlattenedLesson[] {
	const flattened: FlattenedLesson[] = [];
	let globalIndex = 0;

	demoSidebarMenu.units.forEach((unit: DemoUnit) => {
		unit.lessons.forEach((lesson: DemoLesson, lessonIndex: number) => {
			flattened.push({
				id: lesson.id,
				title: lesson.title,
				description: lesson.description,
				url: lesson.url,
				contentType: lesson.contentType,
				duration: lesson.duration,
				difficulty: lesson.difficulty,
				icon: lesson.icon,
				unitId: unit.id,
				unitTitle: unit.title,
				unitIcon: unit.icon,
				lessonIndex,
				globalIndex
			});
			globalIndex++;
		});
	});

	return flattened;
}

/**
 * Parse current URL to extract lesson/unit information
 */
function parseCurrentUrl(pathname: string, hash: string): { unitId?: string; lessonId?: string } {
	// Handle hash-based navigation: #/demo/unit/unitId/lesson/lessonId
	if (hash) {
		const hashPath = hash.slice(1); // Remove #
		const pathParts = hashPath.split("/").filter(Boolean);

		if (pathParts[0] === "demo" && pathParts[1] === "unit" && pathParts[2]) {
			const unitId = pathParts[2];

			if (pathParts[3] === "lesson" && pathParts[4]) {
				const lessonId = pathParts[4];
				return { unitId, lessonId };
			}

			return { unitId };
		}
	}

	// Handle route-based navigation: /demo/...
	if (pathname.startsWith("/demo")) {
		const pathParts = pathname.split("/").filter(Boolean);

		// Check for specific routes like /demo/mermaid, /demo/code-examples, etc.
		if (pathParts.length >= 2) {
			const lessonType = pathParts[1];

			// Map special routes to lesson IDs
			const routeToLessonMap: Record<string, string> = {
				mermaid: "demo-lesson-showcase-1",
				"code-examples": "demo-lesson-showcase-2",
				"flip-cards": "demo-lesson-showcase-3",
				quiz: "demo-lesson-showcase-4"
			};

			const lessonId = routeToLessonMap[lessonType];
			if (lessonId) {
				return { unitId: "demo-unit-showcase", lessonId };
			}
		}
	}

	return {};
}

/**
 * Find lesson index by lesson ID
 */
function findLessonIndex(flattenedLessons: FlattenedLesson[], lessonId?: string): number | null {
	if (!lessonId) return null;

	const index = flattenedLessons.findIndex((lesson) => lesson.id === lessonId);
	return index >= 0 ? index : null;
}

/**
 * Create navigation URLs for lessons
 */
function createLessonUrl(lesson: FlattenedLesson): string {
	// Handle special showcase lessons with direct routes
	const showcaseRouteMap: Record<string, string> = {
		"demo-lesson-showcase-1": "/demo/mermaid",
		"demo-lesson-showcase-2": "/demo/code-examples",
		"demo-lesson-showcase-3": "/demo/flip-cards",
		"demo-lesson-showcase-4": "/demo/quiz"
	};

	if (showcaseRouteMap[lesson.id]) {
		return showcaseRouteMap[lesson.id];
	}

	// Default hash-based navigation for other lessons
	return `#/demo/unit/${lesson.unitId}/lesson/${lesson.id}`;
}

/**
 * Create the navigation store
 */
function createNavigationStore(): Readable<NavigationState> {
	const flattenedLessons = createFlattenedLessons();

	return derived(page, ($page) => {
		const { unitId: _unitId, lessonId } = parseCurrentUrl($page.url.pathname, $page.url.hash);
		const currentLessonIndex = findLessonIndex(flattenedLessons, lessonId);

		const currentLesson = currentLessonIndex !== null ? flattenedLessons[currentLessonIndex] : null;

		// Calculate previous and next lesson URLs
		let previousLessonUrl: string | null = null;
		let nextLessonUrl: string | null = null;

		if (currentLessonIndex !== null) {
			// Previous lesson
			if (currentLessonIndex > 0) {
				const previousLesson = flattenedLessons[currentLessonIndex - 1];
				previousLessonUrl = createLessonUrl(previousLesson);
			}

			// Next lesson
			if (currentLessonIndex < flattenedLessons.length - 1) {
				const nextLesson = flattenedLessons[currentLessonIndex + 1];
				nextLessonUrl = createLessonUrl(nextLesson);
			}
		}

		// Calculate completion percentage (simplified - could integrate with progress store later)
		const completionPercentage =
			currentLessonIndex !== null
				? Math.round(((currentLessonIndex + 1) / flattenedLessons.length) * 100)
				: 0;

		return {
			flattenedLessons,
			currentLessonIndex,
			previousLessonUrl,
			nextLessonUrl,
			currentLesson,
			totalLessons: flattenedLessons.length,
			completionPercentage
		};
	});
}

export const navigationStore = createNavigationStore();

/**
 * Navigation utility functions
 */

/**
 * Navigate to a specific lesson by ID
 */
export function navigateToLesson(lessonId: string): void {
	if (!browser) return;

	const flattenedLessons = createFlattenedLessons();
	const lesson = flattenedLessons.find((l) => l.id === lessonId);

	if (lesson) {
		const url = createLessonUrl(lesson);

		if (url.startsWith("#")) {
			// Hash-based navigation
			window.location.hash = url.slice(1);
		} else {
			// Route-based navigation
			window.location.href = url;
		}
	}
}

/**
 * Navigate to previous lesson
 */
export function navigateToPrevious(currentUrl: string): void {
	if (!browser) return;

	const flattenedLessons = createFlattenedLessons();
	const currentLesson = flattenedLessons.find((lesson) => {
		const lessonUrl = createLessonUrl(lesson);
		return lessonUrl === currentUrl || lessonUrl.slice(1) === currentUrl;
	});

	if (currentLesson && currentLesson.globalIndex > 0) {
		const previousLesson = flattenedLessons[currentLesson.globalIndex - 1];
		const url = createLessonUrl(previousLesson);

		if (url.startsWith("#")) {
			window.location.hash = url.slice(1);
		} else {
			window.location.href = url;
		}
	}
}

/**
 * Navigate to next lesson
 */
export function navigateToNext(currentUrl: string): void {
	if (!browser) return;

	const flattenedLessons = createFlattenedLessons();
	const currentLesson = flattenedLessons.find((lesson) => {
		const lessonUrl = createLessonUrl(lesson);
		return lessonUrl === currentUrl || lessonUrl.slice(1) === currentUrl;
	});

	if (currentLesson && currentLesson.globalIndex < flattenedLessons.length - 1) {
		const nextLesson = flattenedLessons[currentLesson.globalIndex + 1];
		const url = createLessonUrl(nextLesson);

		if (url.startsWith("#")) {
			window.location.hash = url.slice(1);
		} else {
			window.location.href = url;
		}
	}
}

/**
 * Get lesson by ID
 */
export function getLessonById(lessonId: string): FlattenedLesson | null {
	const flattenedLessons = createFlattenedLessons();
	return flattenedLessons.find((l) => l.id === lessonId) || null;
}

/**
 * Get lessons by unit ID
 */
export function getLessonsByUnitId(unitId: string): FlattenedLesson[] {
	const flattenedLessons = createFlattenedLessons();
	return flattenedLessons.filter((l) => l.unitId === unitId);
}

/**
 * Get navigation context for a specific lesson
 */
export function getNavigationContext(lessonId: string): {
	previous: FlattenedLesson | null;
	current: FlattenedLesson | null;
	next: FlattenedLesson | null;
	progress: { current: number; total: number; percentage: number };
} {
	const flattenedLessons = createFlattenedLessons();
	const currentIndex = flattenedLessons.findIndex((l) => l.id === lessonId);

	if (currentIndex === -1) {
		return {
			previous: null,
			current: null,
			next: null,
			progress: { current: 0, total: flattenedLessons.length, percentage: 0 }
		};
	}

	return {
		previous: currentIndex > 0 ? flattenedLessons[currentIndex - 1] : null,
		current: flattenedLessons[currentIndex],
		next: currentIndex < flattenedLessons.length - 1 ? flattenedLessons[currentIndex + 1] : null,
		progress: {
			current: currentIndex + 1,
			total: flattenedLessons.length,
			percentage: Math.round(((currentIndex + 1) / flattenedLessons.length) * 100)
		}
	};
}
