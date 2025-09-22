/**
 * Unified Navigation Store - Centralized Navigation System
 *
 * This store provides a unified navigation system that handles:
 * - Cross-unit navigation (seamless unit boundary traversal)
 * - Consistent state management across all components
 * - URL parsing and state initialization for both hash and route-based URLs
 * - Integration between layout and floating navigation
 */

import { writable, derived, type Readable } from "svelte/store";
import { page } from "$app/stores";
import { browser } from "$app/environment";
import {
	demoSidebarMenu,
	type DemoLesson,
	type DemoUnit,
	DemoContentType
} from "../../data/demo/navigation/demo-sidebar-menu.js";

/**
 * Enhanced lesson interface with navigation metadata
 */
export interface NavigationLesson extends DemoLesson {
	unitId: string;
	unitTitle: string;
	unitIcon: string;
	lessonIndex: number; // Index within unit (-1 for unit overviews)
	globalIndex: number; // Index across all lessons
	isHashBased: boolean; // Whether this lesson uses hash-based navigation
	isUnitOverview: boolean; // Whether this is a unit overview page
}

/**
 * Navigation state interface
 */
export interface UnifiedNavigationState {
	// Core navigation data
	flattenedLessons: NavigationLesson[];
	totalLessons: number;

	// Current navigation context
	currentLesson: NavigationLesson | null;
	currentUnit: DemoUnit | null;
	currentLessonIndex: number | null;
	currentUnitIndex: number | null;

	// Navigation URLs
	previousLessonUrl: string | null;
	nextLessonUrl: string | null;
	previousLesson: NavigationLesson | null;
	nextLesson: NavigationLesson | null;

	// Progress tracking
	completionPercentage: number;

	// State flags
	isLoading: boolean;
	canNavigatePrevious: boolean;
	canNavigateNext: boolean;
}

/**
 * Navigation action interface for external actions
 */
export interface NavigationActions {
	navigateToLesson: (lessonId: string) => Promise<void>;
	navigateToUnit: (unitId: string) => Promise<void>;
	navigateToPrevious: () => Promise<void>;
	navigateToNext: () => Promise<void>;
	updateCurrentContext: (unitId?: string, lessonId?: string) => void;
	initializeFromUrl: (url: URL) => void;
}

/**
 * Create flattened lesson list with enhanced navigation metadata, including unit overviews
 */
function createFlattenedLessons(): NavigationLesson[] {
	const flattened: NavigationLesson[] = [];
	let globalIndex = 0;

	demoSidebarMenu.units.forEach((unit: DemoUnit) => {
		// Add all lessons in the unit first
		unit.lessons.forEach((lesson: DemoLesson, lessonIndex: number) => {
			// Determine if lesson uses hash-based navigation
			const isHashBased = lesson.url.startsWith("#");

			flattened.push({
				...lesson,
				unitId: unit.id,
				unitTitle: unit.title,
				unitIcon: unit.icon,
				lessonIndex,
				globalIndex,
				isHashBased,
				isUnitOverview: false
			});
			globalIndex++;
		});

		// Add unit overview at the end of each unit (except the last one)
		// The last unit overview will transition to the next unit's overview
		const unitOverview: NavigationLesson = {
			id: `${unit.id}-overview`,
			title: `${unit.title} - Overview`,
			description: `Unit overview for ${unit.title}`,
			url: `#/demo/unit/${unit.id}`,
			contentType: unit.lessons[0]?.contentType || DemoContentType.TEXT,
			duration: "5 min",
			difficulty: unit.difficulty,
			icon: unit.icon,
			unitId: unit.id,
			unitTitle: unit.title,
			unitIcon: unit.icon,
			lessonIndex: -1, // Special index for unit overviews
			globalIndex,
			isHashBased: true,
			isUnitOverview: true
		};

		flattened.push(unitOverview);
		globalIndex++;
	});

	return flattened;
}

/**
 * Create lesson URL with hash-based routing for /demo/ routes only
 */
function createLessonUrl(lesson: NavigationLesson): string {
	// Handle unit overviews differently from regular lessons
	if (lesson.isUnitOverview) {
		return `#/demo/unit/${lesson.unitId}`;
	}

	// Use hash-based navigation for regular lessons
	return `#/demo/unit/${lesson.unitId}/lesson/${lesson.id}`;
}

/**
 * Parse URL to extract navigation context from hash-based /demo/ routes only
 */
function parseUrlContext(url: URL): { unitId?: string; lessonId?: string } {
	const hash = url.hash;

	// Handle hash-based navigation for /demo/ routes only
	if (hash) {
		const hashPath = hash.slice(1); // Remove #
		const pathParts = hashPath.split("/").filter(Boolean);

		// Expected formats:
		// - /demo/unit/unitId/lesson/lessonId (for lessons)
		// - /demo/unit/unitId (for unit overviews)
		if (pathParts[0] === "demo" && pathParts[1] === "unit" && pathParts[2]) {
			const unitId = pathParts[2];

			if (pathParts[3] === "lesson" && pathParts[4]) {
				// Regular lesson: /demo/unit/unitId/lesson/lessonId
				const lessonId = pathParts[4];
				return { unitId, lessonId };
			} else if (pathParts.length === 3) {
				// Unit overview: /demo/unit/unitId
				// We need to find the unit overview lesson ID
				const flattenedLessons = createFlattenedLessons();
				const unitOverview = flattenedLessons.find(
					(lesson) => lesson.isUnitOverview && lesson.unitId === unitId
				);
				if (unitOverview) {
					return { unitId, lessonId: unitOverview.id };
				}
			}

			// Fallback for unit only
			return { unitId };
		}
	}

	return {};
}

/**
 * Find lesson by ID in flattened lessons
 */
function findLessonById(lessons: NavigationLesson[], lessonId: string): NavigationLesson | null {
	return lessons.find((lesson) => lesson.id === lessonId) || null;
}

/**
 * Find unit by ID
 */
function findUnitById(unitId: string): DemoUnit | null {
	return demoSidebarMenu.units.find((unit) => unit.id === unitId) || null;
}

/**
 * Create the unified navigation store
 */
function createUnifiedNavigationStore(): Readable<UnifiedNavigationState> & NavigationActions {
	const flattenedLessons = createFlattenedLessons();

	// Internal state stores
	const isLoading = writable(false);
	const currentContext = writable<{ unitId?: string; lessonId?: string }>({});

	// Derived store for navigation state
	const navigationState = derived(
		[page, currentContext, isLoading],
		([$page, $currentContext, $isLoading]) => {
			// Parse URL context, preferring explicit context over URL parsing
			const urlContext = parseUrlContext($page.url);
			const { unitId, lessonId } = { ...urlContext, ...$currentContext };

			// Find current lesson and unit
			const currentLesson = lessonId ? findLessonById(flattenedLessons, lessonId) : null;
			const currentUnit = unitId ? findUnitById(unitId) : null;
			const currentLessonIndex = currentLesson
				? flattenedLessons.findIndex((l) => l.id === lessonId)
				: null;
			const currentUnitIndex = currentUnit
				? demoSidebarMenu.units.findIndex((u) => u.id === unitId)
				: null;

			// Calculate navigation URLs and lessons
			let previousLessonUrl: string | null = null;
			let nextLessonUrl: string | null = null;
			let previousLesson: NavigationLesson | null = null;
			let nextLesson: NavigationLesson | null = null;

			if (currentLessonIndex !== null) {
				// Previous lesson (cross-unit navigation)
				if (currentLessonIndex > 0) {
					previousLesson = flattenedLessons[currentLessonIndex - 1];
					previousLessonUrl = createLessonUrl(previousLesson);
				}

				// Next lesson (cross-unit navigation)
				if (currentLessonIndex < flattenedLessons.length - 1) {
					nextLesson = flattenedLessons[currentLessonIndex + 1];
					nextLessonUrl = createLessonUrl(nextLesson);
				}
			}

			// Calculate completion percentage
			const completionPercentage =
				currentLessonIndex !== null
					? Math.round(((currentLessonIndex + 1) / flattenedLessons.length) * 100)
					: 0;

			return {
				flattenedLessons,
				totalLessons: flattenedLessons.length,
				currentLesson,
				currentUnit,
				currentLessonIndex,
				currentUnitIndex,
				previousLessonUrl,
				nextLessonUrl,
				previousLesson,
				nextLesson,
				completionPercentage,
				isLoading: $isLoading,
				canNavigatePrevious: previousLessonUrl !== null,
				canNavigateNext: nextLessonUrl !== null
			} satisfies UnifiedNavigationState;
		}
	);

	// Navigation actions
	const actions: NavigationActions = {
		/**
		 * Navigate to a specific lesson by ID
		 */
		async navigateToLesson(lessonId: string): Promise<void> {
			if (!browser) return;

			const lesson = findLessonById(flattenedLessons, lessonId);
			if (!lesson) {
				console.warn(`Lesson not found: ${lessonId}`);
				return;
			}

			isLoading.set(true);

			try {
				// Update context first
				currentContext.set({ unitId: lesson.unitId, lessonId: lesson.id });

				// Navigate using hash-based navigation for all demo routes
				const url = createLessonUrl(lesson);
				window.location.hash = url.slice(1);
			} catch (error) {
				console.error("Navigation error:", error);
			} finally {
				isLoading.set(false);
			}
		},

		/**
		 * Navigate to a specific unit by ID
		 */
		async navigateToUnit(unitId: string): Promise<void> {
			if (!browser) return;

			const unit = findUnitById(unitId);
			if (!unit) {
				console.warn(`Unit not found: ${unitId}`);
				return;
			}

			isLoading.set(true);

			try {
				// Update context
				currentContext.set({ unitId });

				// Navigate to unit overview (hash-based)
				window.location.hash = `/demo/unit/${unitId}`;
			} catch (error) {
				console.error("Unit navigation error:", error);
			} finally {
				isLoading.set(false);
			}
		},

		/**
		 * Navigate to previous lesson with cross-unit support
		 */
		async navigateToPrevious(): Promise<void> {
			if (!browser) return;

			const state = navigationState;
			// Get current state synchronously
			let currentState: UnifiedNavigationState;
			const unsubscribe = state.subscribe((s) => {
				currentState = s;
			});
			unsubscribe();

			if (currentState!.previousLesson) {
				await actions.navigateToLesson(currentState!.previousLesson.id);
			}
		},

		/**
		 * Navigate to next lesson with cross-unit support
		 */
		async navigateToNext(): Promise<void> {
			if (!browser) return;

			const state = navigationState;
			// Get current state synchronously
			let currentState: UnifiedNavigationState;
			const unsubscribe = state.subscribe((s) => {
				currentState = s;
			});
			unsubscribe();

			if (currentState!.nextLesson) {
				await actions.navigateToLesson(currentState!.nextLesson.id);
			}
		},

		/**
		 * Update current navigation context manually
		 */
		updateCurrentContext(unitId?: string, lessonId?: string): void {
			currentContext.update((current) => ({
				...current,
				...(unitId && { unitId }),
				...(lessonId && { lessonId })
			}));
		},

		/**
		 * Initialize navigation state from URL
		 */
		initializeFromUrl(url: URL): void {
			const context = parseUrlContext(url);
			if (context.unitId || context.lessonId) {
				currentContext.set(context);
			}
		}
	};

	// Return store with actions
	return {
		subscribe: navigationState.subscribe,
		...actions
	};
}

// Create and export the unified navigation store
export const unifiedNavigation = createUnifiedNavigationStore();

// Export utility functions for external use
export { createLessonUrl, parseUrlContext, findLessonById, findUnitById };
