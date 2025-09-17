/**
 * Progress Store - Persistent Progress Tracking with localStorage
 *
 * Manages user progress through units and lessons with localStorage persistence.
 * Tracks visited units, completed lessons, and overall progress.
 */

import { writable, type Writable } from "svelte/store";
import { browser } from "$app/environment";

export interface ProgressState {
	visitedUnits: Set<string>;
	completedLessons: Set<string>;
	lastVisited: {
		unitId?: string;
		lessonId?: string;
		timestamp: number;
	} | null;
}

export interface ProgressStats {
	totalUnits: number;
	visitedUnits: number;
	totalLessons: number;
	completedLessons: number;
	progressPercentage: number;
}

const STORAGE_KEY = "demo-learning-progress";

// Create the store
function createProgressStore(): Writable<ProgressState> {
	const initialState: ProgressState = {
		visitedUnits: new Set<string>(),
		completedLessons: new Set<string>(),
		lastVisited: null
	};

	const store = writable(initialState);

	// Load from localStorage on initialization
	if (browser) {
		loadProgress().then((state) => {
			store.set(state);
		});
	}

	return store;
}

export const progressStore = createProgressStore();

/**
 * Load progress from localStorage
 */
async function loadProgress(): Promise<ProgressState> {
	if (!browser) {
		return {
			visitedUnits: new Set<string>(),
			completedLessons: new Set<string>(),
			lastVisited: null
		};
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const data = JSON.parse(stored);
			return {
				visitedUnits: new Set(data.visitedUnits || []),
				completedLessons: new Set(data.completedLessons || []),
				lastVisited: data.lastVisited || null
			};
		}
	} catch (error) {
		console.warn("Failed to load progress from localStorage:", error);
	}

	return {
		visitedUnits: new Set<string>(),
		completedLessons: new Set<string>(),
		lastVisited: null
	};
}

/**
 * Save progress to localStorage
 */
async function saveProgress(state: ProgressState): Promise<void> {
	if (!browser) return;

	try {
		const data = {
			visitedUnits: Array.from(state.visitedUnits),
			completedLessons: Array.from(state.completedLessons),
			lastVisited: state.lastVisited
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch (error) {
		console.warn("Failed to save progress to localStorage:", error);
	}
}

/**
 * Mark a unit as visited
 */
export function visitUnit(unitId: string): void {
	progressStore.update((state) => {
		const newState = {
			...state,
			visitedUnits: new Set([...state.visitedUnits, unitId]),
			lastVisited: {
				unitId,
				timestamp: Date.now()
			}
		};
		saveProgress(newState);
		return newState;
	});
}

/**
 * Mark a lesson as completed
 */
export function completeLesson(unitId: string, lessonId: string): void {
	progressStore.update((state) => {
		const newState = {
			...state,
			visitedUnits: new Set([...state.visitedUnits, unitId]),
			completedLessons: new Set([...state.completedLessons, lessonId]),
			lastVisited: {
				unitId,
				lessonId,
				timestamp: Date.now()
			}
		};
		saveProgress(newState);
		return newState;
	});
}

/**
 * Calculate progress statistics
 */
export function calculateProgressStats(
	totalUnits: number,
	totalLessons: number,
	state: ProgressState
): ProgressStats {
	const visitedUnitsCount = state.visitedUnits.size;
	const completedLessonsCount = state.completedLessons.size;

	// Calculate progress percentage based on completed lessons
	const progressPercentage =
		totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

	return {
		totalUnits,
		visitedUnits: visitedUnitsCount,
		totalLessons,
		completedLessons: completedLessonsCount,
		progressPercentage
	};
}

/**
 * Clear all progress data
 */
export function clearProgress(): void {
	progressStore.set({
		visitedUnits: new Set<string>(),
		completedLessons: new Set<string>(),
		lastVisited: null
	});

	if (browser) {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch (error) {
			console.warn("Failed to clear progress from localStorage:", error);
		}
	}
}

/**
 * Check if a unit has been visited
 */
export function isUnitVisited(unitId: string, state: ProgressState): boolean {
	return state.visitedUnits.has(unitId);
}

/**
 * Check if a lesson has been completed
 */
export function isLessonCompleted(lessonId: string, state: ProgressState): boolean {
	return state.completedLessons.has(lessonId);
}
