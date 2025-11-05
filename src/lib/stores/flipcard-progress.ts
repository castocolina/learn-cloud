/**
 * FlipCard Progress Store - Persistent Progress Tracking with localStorage
 *
 * Manages user progress through flip cards with localStorage persistence.
 * Tracks learning progress, mastery status, and engagement analytics.
 */

import { writable, type Writable } from "svelte/store";
import { browser } from "$app/environment";
import type { InteractiveLearningProgress } from "$types";
import { defaultLearningProgress } from "$types";

export interface FlipCardProgressState {
	/** Map of card ID to learning progress */
	cards: Map<string, InteractiveLearningProgress>;

	/** Set of card IDs marked as mastered */
	masteredCards: Set<string>;

	/** Last accessed card information */
	lastAccessed: {
		cardId: string;
		timestamp: number;
	} | null;

	/** Global statistics */
	statistics: {
		totalCardsViewed: number;
		totalCardsCompleted: number;
		totalCardsMastered: number;
		totalTimeSpent: number;
		lastSessionDate: Date | null;
	};
}

export interface FlipCardProgressStats {
	totalCards: number;
	viewedCards: number;
	completedCards: number;
	masteredCards: number;
	viewedPercentage: number;
	completedPercentage: number;
	masteredPercentage: number;
	averageTimePerCard: number;
	totalTimeSpent: number;
}

const STORAGE_KEY = "demo-flipcard-progress";

/**
 * Create the flipcard progress store
 */
function createFlipCardProgressStore(): Writable<FlipCardProgressState> {
	const initialState: FlipCardProgressState = {
		cards: new Map<string, InteractiveLearningProgress>(),
		masteredCards: new Set<string>(),
		lastAccessed: null,
		statistics: {
			totalCardsViewed: 0,
			totalCardsCompleted: 0,
			totalCardsMastered: 0,
			totalTimeSpent: 0,
			lastSessionDate: null
		}
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

export const flipCardProgressStore = createFlipCardProgressStore();

/**
 * Load progress from localStorage
 */
async function loadProgress(): Promise<FlipCardProgressState> {
	if (!browser) {
		return {
			cards: new Map<string, InteractiveLearningProgress>(),
			masteredCards: new Set<string>(),
			lastAccessed: null,
			statistics: {
				totalCardsViewed: 0,
				totalCardsCompleted: 0,
				totalCardsMastered: 0,
				totalTimeSpent: 0,
				lastSessionDate: null
			}
		};
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const data = JSON.parse(stored);

			// Convert arrays back to Map and Set
			const cardsMap = new Map<string, InteractiveLearningProgress>();
			if (data.cards && Array.isArray(data.cards)) {
				for (const [cardId, progress] of data.cards) {
					// Convert date strings back to Date objects
					cardsMap.set(cardId, {
						...progress,
						firstAccessed: progress.firstAccessed ? new Date(progress.firstAccessed) : null,
						lastAccessed: progress.lastAccessed ? new Date(progress.lastAccessed) : null,
						completedAt: progress.completedAt ? new Date(progress.completedAt) : null
					});
				}
			}

			return {
				cards: cardsMap,
				masteredCards: new Set(data.masteredCards || []),
				lastAccessed: data.lastAccessed || null,
				statistics: {
					...data.statistics,
					lastSessionDate: data.statistics?.lastSessionDate
						? new Date(data.statistics.lastSessionDate)
						: null
				}
			};
		}
	} catch (error) {
		console.warn("Failed to load flipcard progress from localStorage:", error);
	}

	return {
		cards: new Map<string, InteractiveLearningProgress>(),
		masteredCards: new Set<string>(),
		lastAccessed: null,
		statistics: {
			totalCardsViewed: 0,
			totalCardsCompleted: 0,
			totalCardsMastered: 0,
			totalTimeSpent: 0,
			lastSessionDate: null
		}
	};
}

/**
 * Save progress to localStorage
 */
async function saveProgress(state: FlipCardProgressState): Promise<void> {
	if (!browser) return;

	try {
		const data = {
			cards: Array.from(state.cards.entries()),
			masteredCards: Array.from(state.masteredCards),
			lastAccessed: state.lastAccessed,
			statistics: state.statistics
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch (error) {
		console.warn("Failed to save flipcard progress to localStorage:", error);
	}
}

/**
 * Update card progress with automatic statistics tracking
 */
export function updateCardProgress(
	cardId: string,
	updates: Partial<InteractiveLearningProgress>
): void {
	flipCardProgressStore.update((state) => {
		const currentProgress = state.cards.get(cardId) || { ...defaultLearningProgress };
		const now = new Date();

		// Merge updates with current progress
		const updatedProgress: InteractiveLearningProgress = {
			...currentProgress,
			...updates,
			lastAccessed: now,
			firstAccessed: currentProgress.firstAccessed || now
		};

		// Auto-increment access count if being viewed
		if (updates.viewed && !currentProgress.viewed) {
			updatedProgress.accessCount = (currentProgress.accessCount || 0) + 1;
		}

		// Set completedAt timestamp if being marked complete
		if (updates.completed && !currentProgress.completed) {
			updatedProgress.completedAt = now;
		}

		// Update cards map
		const newCards = new Map(state.cards);
		newCards.set(cardId, updatedProgress);

		// Update mastered set
		const newMasteredCards = new Set(state.masteredCards);
		if (updatedProgress.mastered) {
			newMasteredCards.add(cardId);
		} else {
			newMasteredCards.delete(cardId);
		}

		// Recalculate statistics
		const newStatistics = calculateStatistics(newCards, newMasteredCards);

		const newState = {
			cards: newCards,
			masteredCards: newMasteredCards,
			lastAccessed: {
				cardId,
				timestamp: now.getTime()
			},
			statistics: {
				...newStatistics,
				lastSessionDate: now
			}
		};

		saveProgress(newState);
		return newState;
	});
}

/**
 * Mark a card as viewed (first interaction)
 */
export function viewCard(cardId: string): void {
	updateCardProgress(cardId, {
		viewed: true,
		accessCount: 1
	});
}

/**
 * Mark a card as completed (flipped and read)
 */
export function completeCard(cardId: string): void {
	updateCardProgress(cardId, {
		viewed: true,
		completed: true
	});
}

/**
 * Toggle card mastery status
 */
export function toggleCardMastery(cardId: string, mastered: boolean): void {
	updateCardProgress(cardId, {
		mastered
	});
}

/**
 * Update time spent on a card
 */
export function updateCardTime(cardId: string, additionalSeconds: number): void {
	flipCardProgressStore.update((state) => {
		const currentProgress = state.cards.get(cardId) || { ...defaultLearningProgress };
		const updatedProgress: InteractiveLearningProgress = {
			...currentProgress,
			timeSpent: (currentProgress.timeSpent || 0) + additionalSeconds,
			lastAccessed: new Date()
		};

		const newCards = new Map(state.cards);
		newCards.set(cardId, updatedProgress);

		const newStatistics = calculateStatistics(newCards, state.masteredCards);

		const newState = {
			...state,
			cards: newCards,
			statistics: {
				...newStatistics,
				lastSessionDate: new Date()
			}
		};

		saveProgress(newState);
		return newState;
	});
}

/**
 * Calculate global statistics from card data
 */
function calculateStatistics(
	cards: Map<string, InteractiveLearningProgress>,
	masteredCards: Set<string>
): Omit<FlipCardProgressState["statistics"], "lastSessionDate"> {
	let totalCardsViewed = 0;
	let totalCardsCompleted = 0;
	let totalTimeSpent = 0;

	for (const progress of cards.values()) {
		if (progress.viewed) totalCardsViewed++;
		if (progress.completed) totalCardsCompleted++;
		totalTimeSpent += progress.timeSpent || 0;
	}

	return {
		totalCardsViewed,
		totalCardsCompleted,
		totalCardsMastered: masteredCards.size,
		totalTimeSpent
	};
}

/**
 * Calculate progress statistics for a set of cards
 */
export function calculateProgressStats(
	totalCards: number,
	state: FlipCardProgressState
): FlipCardProgressStats {
	const viewedCards = state.statistics.totalCardsViewed;
	const completedCards = state.statistics.totalCardsCompleted;
	const masteredCards = state.statistics.totalCardsMastered;

	const viewedPercentage = totalCards > 0 ? Math.round((viewedCards / totalCards) * 100) : 0;
	const completedPercentage = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;
	const masteredPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

	const averageTimePerCard =
		viewedCards > 0 ? Math.round(state.statistics.totalTimeSpent / viewedCards) : 0;

	return {
		totalCards,
		viewedCards,
		completedCards,
		masteredCards,
		viewedPercentage,
		completedPercentage,
		masteredPercentage,
		averageTimePerCard,
		totalTimeSpent: state.statistics.totalTimeSpent
	};
}

/**
 * Get progress for a specific card
 */
export function getCardProgress(
	cardId: string,
	state: FlipCardProgressState
): InteractiveLearningProgress {
	return state.cards.get(cardId) || { ...defaultLearningProgress };
}

/**
 * Check if a card has been viewed
 */
export function isCardViewed(cardId: string, state: FlipCardProgressState): boolean {
	const progress = state.cards.get(cardId);
	return progress?.viewed || false;
}

/**
 * Check if a card has been completed
 */
export function isCardCompleted(cardId: string, state: FlipCardProgressState): boolean {
	const progress = state.cards.get(cardId);
	return progress?.completed || false;
}

/**
 * Check if a card has been mastered
 */
export function isCardMastered(cardId: string, state: FlipCardProgressState): boolean {
	return state.masteredCards.has(cardId);
}

/**
 * Reset progress for a specific card
 */
export function resetCardProgress(cardId: string): void {
	flipCardProgressStore.update((state) => {
		const newCards = new Map(state.cards);
		newCards.delete(cardId);

		const newMasteredCards = new Set(state.masteredCards);
		newMasteredCards.delete(cardId);

		const newStatistics = calculateStatistics(newCards, newMasteredCards);

		const newState = {
			...state,
			cards: newCards,
			masteredCards: newMasteredCards,
			statistics: {
				...newStatistics,
				lastSessionDate: new Date()
			}
		};

		saveProgress(newState);
		return newState;
	});
}

/**
 * Clear all flipcard progress data
 */
export function clearAllProgress(): void {
	flipCardProgressStore.set({
		cards: new Map<string, InteractiveLearningProgress>(),
		masteredCards: new Set<string>(),
		lastAccessed: null,
		statistics: {
			totalCardsViewed: 0,
			totalCardsCompleted: 0,
			totalCardsMastered: 0,
			totalTimeSpent: 0,
			lastSessionDate: null
		}
	});

	if (browser) {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch (error) {
			console.warn("Failed to clear flipcard progress from localStorage:", error);
		}
	}
}

/**
 * Export all progress data (for backup/migration)
 */
export function exportProgressData(state: FlipCardProgressState): string {
	const data = {
		cards: Array.from(state.cards.entries()),
		masteredCards: Array.from(state.masteredCards),
		lastAccessed: state.lastAccessed,
		statistics: state.statistics,
		exportedAt: new Date().toISOString(),
		version: "1.0.0"
	};
	return JSON.stringify(data, null, 2);
}

/**
 * Import progress data (from backup/migration)
 */
export function importProgressData(jsonData: string): boolean {
	try {
		const data = JSON.parse(jsonData);

		const cardsMap = new Map<string, InteractiveLearningProgress>();
		if (data.cards && Array.isArray(data.cards)) {
			for (const [cardId, progress] of data.cards) {
				cardsMap.set(cardId, {
					...progress,
					firstAccessed: progress.firstAccessed ? new Date(progress.firstAccessed) : null,
					lastAccessed: progress.lastAccessed ? new Date(progress.lastAccessed) : null,
					completedAt: progress.completedAt ? new Date(progress.completedAt) : null
				});
			}
		}

		const newState: FlipCardProgressState = {
			cards: cardsMap,
			masteredCards: new Set(data.masteredCards || []),
			lastAccessed: data.lastAccessed || null,
			statistics: {
				...data.statistics,
				lastSessionDate: data.statistics?.lastSessionDate
					? new Date(data.statistics.lastSessionDate)
					: null
			}
		};

		flipCardProgressStore.set(newState);
		saveProgress(newState);

		return true;
	} catch (error) {
		console.error("Failed to import flipcard progress data:", error);
		return false;
	}
}
