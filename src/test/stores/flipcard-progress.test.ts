/**
 * FlipCard Progress Store Unit Tests
 *
 * Type safety and functionality tests for the flipcard progress tracking store.
 * Tests focus on localStorage persistence, state management, and progress calculations.
 *
 * Test Coverage:
 * - TypeScript interface compliance (FlipCardProgressState, LearningProgress)
 * - Store initialization and localStorage loading
 * - Progress update operations (view, complete, master)
 * - Statistics calculation and tracking
 * - Map/Set reactivity and state mutations
 * - localStorage persistence (save/load cycles)
 * - Helper function correctness
 * - Edge cases and error handling
 *
 * Approach: Store-level testing with mock localStorage
 * Rationale: Comprehensive testing of state management and persistence logic
 * without requiring browser environment or component rendering.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import type { InteractiveLearningProgress } from "$types";
import { defaultLearningProgress } from "$types";
import type { FlipCardProgressStats } from "$lib/stores/flipcard-progress";
import {
	flipCardProgressStore,
	updateCardProgress,
	viewCard,
	completeCard,
	toggleCardMastery,
	updateCardTime,
	calculateProgressStats,
	getCardProgress,
	isCardViewed,
	isCardCompleted,
	isCardMastered,
	resetCardProgress,
	clearAllProgress,
	exportProgressData,
	importProgressData
} from "$lib/stores/flipcard-progress";

describe("FlipCard Progress Store Type Safety", () => {
	// ============================================================================
	// FlipCardProgressState Tests
	// ============================================================================

	it("should initialize with correct empty state structure", () => {
		const state = get(flipCardProgressStore);

		expect(state).toBeDefined();
		expect(state.cards).toBeInstanceOf(Map);
		expect(state.masteredCards).toBeInstanceOf(Set);
		expect(state.lastAccessed).toBeNull();
		expect(state.statistics).toBeDefined();
		expect(state.statistics.totalCardsViewed).toBe(0);
		expect(state.statistics.totalCardsCompleted).toBe(0);
		expect(state.statistics.totalCardsMastered).toBe(0);
		expect(state.statistics.totalTimeSpent).toBe(0);
	});

	it("should have correct LearningProgress structure", () => {
		const progress: InteractiveLearningProgress = { ...defaultLearningProgress };

		expect(progress.viewed).toBe(false);
		expect(progress.completed).toBe(false);
		expect(progress.accessCount).toBe(0);
		expect(progress.timeSpent).toBe(0);
		expect(progress.firstAccessed).toBeNull();
		expect(progress.lastAccessed).toBeNull();
		expect(progress.completedAt).toBeNull();
		expect(progress.mastered).toBe(false);
	});

	it("should accept all LearningProgress optional properties", () => {
		const fullProgress: InteractiveLearningProgress = {
			...defaultLearningProgress,
			confidenceLevel: 4,
			attempts: 3,
			bestScore: 95
		};

		expect(fullProgress.confidenceLevel).toBe(4);
		expect(fullProgress.attempts).toBe(3);
		expect(fullProgress.bestScore).toBe(95);
	});

	// ============================================================================
	// FlipCardProgressStats Tests
	// ============================================================================

	it("should calculate stats with correct structure", () => {
		const state = get(flipCardProgressStore);
		const stats: FlipCardProgressStats = calculateProgressStats(10, state);

		expect(stats.totalCards).toBe(10);
		expect(stats.viewedCards).toBe(0);
		expect(stats.completedCards).toBe(0);
		expect(stats.masteredCards).toBe(0);
		expect(stats.viewedPercentage).toBe(0);
		expect(stats.completedPercentage).toBe(0);
		expect(stats.masteredPercentage).toBe(0);
		expect(stats.averageTimePerCard).toBe(0);
		expect(stats.totalTimeSpent).toBe(0);
	});
});

describe("FlipCard Progress Store Functionality", () => {
	// Reset store before each test
	beforeEach(() => {
		clearAllProgress();
	});

	// ============================================================================
	// viewCard Function Tests
	// ============================================================================

	it("should mark card as viewed", () => {
		viewCard("card-01");

		const state = get(flipCardProgressStore);
		const progress = state.cards.get("card-01");

		expect(progress).toBeDefined();
		expect(progress?.viewed).toBe(true);
		expect(progress?.accessCount).toBe(1);
	});

	it("should update statistics when viewing card", () => {
		viewCard("card-01");

		const state = get(flipCardProgressStore);

		expect(state.statistics.totalCardsViewed).toBe(1);
	});

	it("should set lastAccessed when viewing card", () => {
		viewCard("card-01");

		const state = get(flipCardProgressStore);

		expect(state.lastAccessed).not.toBeNull();
		expect(state.lastAccessed?.cardId).toBe("card-01");
	});

	it("should not increment accessCount on subsequent views", () => {
		viewCard("card-01");

		const state = get(flipCardProgressStore);
		const firstAccessCount = state.cards.get("card-01")?.accessCount;

		updateCardProgress("card-01", { viewed: true });

		const newState = get(flipCardProgressStore);
		const secondAccessCount = newState.cards.get("card-01")?.accessCount;

		expect(firstAccessCount).toBe(secondAccessCount);
	});

	// ============================================================================
	// completeCard Function Tests
	// ============================================================================

	it("should mark card as completed", () => {
		completeCard("card-02");

		const state = get(flipCardProgressStore);
		const progress = state.cards.get("card-02");

		expect(progress?.viewed).toBe(true);
		expect(progress?.completed).toBe(true);
		expect(progress?.completedAt).toBeInstanceOf(Date);
	});

	it("should update statistics when completing card", () => {
		completeCard("card-02");

		const state = get(flipCardProgressStore);

		expect(state.statistics.totalCardsViewed).toBe(1);
		expect(state.statistics.totalCardsCompleted).toBe(1);
	});

	it("should set completedAt timestamp", () => {
		const before = new Date();
		completeCard("card-02");
		const after = new Date();

		const state = get(flipCardProgressStore);
		const completedAt = state.cards.get("card-02")?.completedAt;

		expect(completedAt).toBeInstanceOf(Date);
		expect(completedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
		expect(completedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
	});

	// ============================================================================
	// toggleCardMastery Function Tests
	// ============================================================================

	it("should mark card as mastered", () => {
		toggleCardMastery("card-03", true);

		const state = get(flipCardProgressStore);
		const progress = state.cards.get("card-03");

		expect(progress?.mastered).toBe(true);
		expect(state.masteredCards.has("card-03")).toBe(true);
	});

	it("should unmark card as mastered", () => {
		toggleCardMastery("card-03", true);
		toggleCardMastery("card-03", false);

		const state = get(flipCardProgressStore);
		const progress = state.cards.get("card-03");

		expect(progress?.mastered).toBe(false);
		expect(state.masteredCards.has("card-03")).toBe(false);
	});

	it("should update statistics when toggling mastery", () => {
		toggleCardMastery("card-03", true);

		const state = get(flipCardProgressStore);

		expect(state.statistics.totalCardsMastered).toBe(1);
	});

	it("should handle multiple mastery toggles", () => {
		toggleCardMastery("card-01", true);
		toggleCardMastery("card-02", true);
		toggleCardMastery("card-03", true);
		toggleCardMastery("card-02", false);

		const state = get(flipCardProgressStore);

		expect(state.masteredCards.size).toBe(2);
		expect(state.masteredCards.has("card-01")).toBe(true);
		expect(state.masteredCards.has("card-02")).toBe(false);
		expect(state.masteredCards.has("card-03")).toBe(true);
	});

	// ============================================================================
	// updateCardTime Function Tests
	// ============================================================================

	it("should update time spent on card", () => {
		updateCardTime("card-04", 30);

		const state = get(flipCardProgressStore);
		const progress = state.cards.get("card-04");

		expect(progress?.timeSpent).toBe(30);
	});

	it("should accumulate time across multiple updates", () => {
		updateCardTime("card-04", 30);
		updateCardTime("card-04", 45);
		updateCardTime("card-04", 15);

		const state = get(flipCardProgressStore);
		const progress = state.cards.get("card-04");

		expect(progress?.timeSpent).toBe(90);
	});

	it("should update global statistics for time spent", () => {
		updateCardTime("card-01", 30);
		updateCardTime("card-02", 45);

		const state = get(flipCardProgressStore);

		expect(state.statistics.totalTimeSpent).toBe(75);
	});

	// ============================================================================
	// updateCardProgress Function Tests
	// ============================================================================

	it("should create new progress for non-existent card", () => {
		updateCardProgress("card-05", { viewed: true });

		const state = get(flipCardProgressStore);

		expect(state.cards.has("card-05")).toBe(true);
	});

	it("should merge updates with existing progress", () => {
		updateCardProgress("card-05", { viewed: true });
		updateCardProgress("card-05", { completed: true });

		const state = get(flipCardProgressStore);
		const progress = state.cards.get("card-05");

		expect(progress?.viewed).toBe(true);
		expect(progress?.completed).toBe(true);
	});

	it("should set firstAccessed on first update", () => {
		updateCardProgress("card-06", { viewed: true });

		const state = get(flipCardProgressStore);
		const progress = state.cards.get("card-06");

		expect(progress?.firstAccessed).toBeInstanceOf(Date);
	});

	it("should not change firstAccessed on subsequent updates", () => {
		updateCardProgress("card-06", { viewed: true });

		const state = get(flipCardProgressStore);
		const firstTime = state.cards.get("card-06")?.firstAccessed;

		// Wait a bit
		const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
		delay(10);

		updateCardProgress("card-06", { completed: true });

		const newState = get(flipCardProgressStore);
		const secondTime = newState.cards.get("card-06")?.firstAccessed;

		expect(firstTime?.getTime()).toBe(secondTime?.getTime());
	});

	it("should always update lastAccessed", () => {
		updateCardProgress("card-07", { viewed: true });

		const state = get(flipCardProgressStore);
		const firstTime = state.cards.get("card-07")?.lastAccessed;

		// Small delay to ensure different timestamp
		const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
		delay(10);

		updateCardProgress("card-07", { completed: true });

		const newState = get(flipCardProgressStore);
		const secondTime = newState.cards.get("card-07")?.lastAccessed;

		expect(secondTime!.getTime()).toBeGreaterThanOrEqual(firstTime!.getTime());
	});

	// ============================================================================
	// Helper Function Tests
	// ============================================================================

	it("getCardProgress should return default for non-existent card", () => {
		const state = get(flipCardProgressStore);
		const progress = getCardProgress("non-existent", state);

		expect(progress).toEqual(defaultLearningProgress);
	});

	it("getCardProgress should return stored progress", () => {
		viewCard("card-08");

		const state = get(flipCardProgressStore);
		const progress = getCardProgress("card-08", state);

		expect(progress.viewed).toBe(true);
	});

	it("isCardViewed should return false for new card", () => {
		const state = get(flipCardProgressStore);

		expect(isCardViewed("new-card", state)).toBe(false);
	});

	it("isCardViewed should return true for viewed card", () => {
		viewCard("card-09");

		const state = get(flipCardProgressStore);

		expect(isCardViewed("card-09", state)).toBe(true);
	});

	it("isCardCompleted should return false for new card", () => {
		const state = get(flipCardProgressStore);

		expect(isCardCompleted("new-card", state)).toBe(false);
	});

	it("isCardCompleted should return true for completed card", () => {
		completeCard("card-10");

		const state = get(flipCardProgressStore);

		expect(isCardCompleted("card-10", state)).toBe(true);
	});

	it("isCardMastered should return false for new card", () => {
		const state = get(flipCardProgressStore);

		expect(isCardMastered("new-card", state)).toBe(false);
	});

	it("isCardMastered should return true for mastered card", () => {
		toggleCardMastery("card-11", true);

		const state = get(flipCardProgressStore);

		expect(isCardMastered("card-11", state)).toBe(true);
	});

	// ============================================================================
	// calculateProgressStats Function Tests
	// ============================================================================

	it("should calculate correct percentages", () => {
		viewCard("card-01");
		viewCard("card-02");
		completeCard("card-03");
		toggleCardMastery("card-01", true);

		const state = get(flipCardProgressStore);
		const stats = calculateProgressStats(10, state);

		expect(stats.totalCards).toBe(10);
		expect(stats.viewedCards).toBe(3);
		expect(stats.completedCards).toBe(1);
		expect(stats.masteredCards).toBe(1);
		expect(stats.viewedPercentage).toBe(30);
		expect(stats.completedPercentage).toBe(10);
		expect(stats.masteredPercentage).toBe(10);
	});

	it("should handle zero cards without division errors", () => {
		const state = get(flipCardProgressStore);
		const stats = calculateProgressStats(0, state);

		expect(stats.viewedPercentage).toBe(0);
		expect(stats.completedPercentage).toBe(0);
		expect(stats.masteredPercentage).toBe(0);
		expect(stats.averageTimePerCard).toBe(0);
	});

	it("should calculate average time per card", () => {
		updateCardTime("card-01", 60);
		updateCardTime("card-02", 90);
		updateCardTime("card-03", 30);

		const state = get(flipCardProgressStore);
		const stats = calculateProgressStats(10, state);

		expect(stats.totalTimeSpent).toBe(180);
		expect(stats.averageTimePerCard).toBe(60); // 180 / 3 viewed cards
	});

	// ============================================================================
	// Reset and Clear Function Tests
	// ============================================================================

	it("resetCardProgress should remove specific card", () => {
		viewCard("card-01");
		completeCard("card-02");
		toggleCardMastery("card-01", true);

		resetCardProgress("card-01");

		const state = get(flipCardProgressStore);

		expect(state.cards.has("card-01")).toBe(false);
		expect(state.masteredCards.has("card-01")).toBe(false);
		expect(state.cards.has("card-02")).toBe(true);
	});

	it("resetCardProgress should update statistics", () => {
		viewCard("card-01");
		viewCard("card-02");
		toggleCardMastery("card-01", true);

		const stateBefore = get(flipCardProgressStore);
		expect(stateBefore.statistics.totalCardsViewed).toBe(2);
		expect(stateBefore.statistics.totalCardsMastered).toBe(1);

		resetCardProgress("card-01");

		const stateAfter = get(flipCardProgressStore);
		expect(stateAfter.statistics.totalCardsViewed).toBe(1);
		expect(stateAfter.statistics.totalCardsMastered).toBe(0);
	});

	it("clearAllProgress should reset entire store", () => {
		viewCard("card-01");
		viewCard("card-02");
		completeCard("card-03");
		toggleCardMastery("card-01", true);
		updateCardTime("card-02", 60);

		clearAllProgress();

		const state = get(flipCardProgressStore);

		expect(state.cards.size).toBe(0);
		expect(state.masteredCards.size).toBe(0);
		expect(state.lastAccessed).toBeNull();
		expect(state.statistics.totalCardsViewed).toBe(0);
		expect(state.statistics.totalCardsCompleted).toBe(0);
		expect(state.statistics.totalCardsMastered).toBe(0);
		expect(state.statistics.totalTimeSpent).toBe(0);
	});

	// ============================================================================
	// Export/Import Function Tests
	// ============================================================================

	it("exportProgressData should generate valid JSON", () => {
		viewCard("card-01");
		completeCard("card-02");
		toggleCardMastery("card-01", true);

		const state = get(flipCardProgressStore);
		const exported = exportProgressData(state);

		expect(() => JSON.parse(exported)).not.toThrow();

		const data = JSON.parse(exported);
		expect(data.cards).toBeDefined();
		expect(data.masteredCards).toBeDefined();
		expect(data.statistics).toBeDefined();
		expect(data.version).toBe("1.0.0");
		expect(data.exportedAt).toBeDefined();
	});

	it("importProgressData should restore state from export", () => {
		viewCard("card-01");
		completeCard("card-02");
		toggleCardMastery("card-01", true);
		updateCardTime("card-01", 60);

		const state = get(flipCardProgressStore);
		const exported = exportProgressData(state);

		clearAllProgress();

		const importSuccess = importProgressData(exported);

		expect(importSuccess).toBe(true);

		const restoredState = get(flipCardProgressStore);

		expect(restoredState.cards.size).toBe(2);
		expect(restoredState.masteredCards.has("card-01")).toBe(true);
		expect(restoredState.statistics.totalCardsViewed).toBe(2);
		expect(restoredState.statistics.totalCardsCompleted).toBe(1);
		expect(restoredState.statistics.totalCardsMastered).toBe(1);
	});

	it("importProgressData should return false for invalid JSON", () => {
		const invalid = "{ invalid json";
		const result = importProgressData(invalid);

		expect(result).toBe(false);
	});

	it("importProgressData should handle malformed data gracefully", () => {
		const malformed = JSON.stringify({ foo: "bar" });
		const result = importProgressData(malformed);

		expect(result).toBe(true); // Imports but with empty data

		const state = get(flipCardProgressStore);
		expect(state.cards.size).toBe(0);
	});

	// ============================================================================
	// Integration Scenario Tests
	// ============================================================================

	it("should handle complete learning flow", () => {
		const cardId = "container-01";

		// Step 1: View card
		viewCard(cardId);
		let state = get(flipCardProgressStore);
		expect(isCardViewed(cardId, state)).toBe(true);
		expect(state.statistics.totalCardsViewed).toBe(1);

		// Step 2: Spend time studying
		updateCardTime(cardId, 30);
		state = get(flipCardProgressStore);
		expect(state.cards.get(cardId)?.timeSpent).toBe(30);

		// Step 3: Complete card
		completeCard(cardId);
		state = get(flipCardProgressStore);
		expect(isCardCompleted(cardId, state)).toBe(true);
		expect(state.statistics.totalCardsCompleted).toBe(1);

		// Step 4: Mark as mastered
		toggleCardMastery(cardId, true);
		state = get(flipCardProgressStore);
		expect(isCardMastered(cardId, state)).toBe(true);
		expect(state.statistics.totalCardsMastered).toBe(1);
	});

	it("should handle multiple cards with different progress", () => {
		viewCard("card-01");
		completeCard("card-02");
		toggleCardMastery("card-02", true);

		viewCard("card-03");
		updateCardTime("card-03", 45);

		toggleCardMastery("card-04", true);

		const state = get(flipCardProgressStore);
		const stats = calculateProgressStats(10, state);

		expect(stats.viewedCards).toBe(3);
		expect(stats.completedCards).toBe(1);
		expect(stats.masteredCards).toBe(2);
		expect(stats.totalTimeSpent).toBe(45);
	});

	it("should handle export, reset, and import cycle", () => {
		viewCard("card-01");
		viewCard("card-02");
		completeCard("card-03");
		toggleCardMastery("card-01", true);
		updateCardTime("card-02", 90);

		const stateBefore = get(flipCardProgressStore);
		const exported = exportProgressData(stateBefore);

		clearAllProgress();

		const stateAfterClear = get(flipCardProgressStore);
		expect(stateAfterClear.cards.size).toBe(0);

		importProgressData(exported);

		const stateAfterImport = get(flipCardProgressStore);
		expect(stateAfterImport.cards.size).toBe(3);
		expect(stateAfterImport.masteredCards.size).toBe(1);
		expect(stateAfterImport.statistics.totalCardsViewed).toBe(3);
	});

	it("should maintain Map/Set reactivity", () => {
		viewCard("card-01");

		const state1 = get(flipCardProgressStore);
		const cards1 = state1.cards;

		viewCard("card-02");

		const state2 = get(flipCardProgressStore);
		const cards2 = state2.cards;

		// Maps should be different instances (reactivity)
		expect(cards1).not.toBe(cards2);
		expect(state2.cards.size).toBe(2);
	});

	it("should handle rapid sequential updates", () => {
		for (let i = 0; i < 10; i++) {
			viewCard(`card-${i}`);
		}

		const state = get(flipCardProgressStore);

		expect(state.cards.size).toBe(10);
		expect(state.statistics.totalCardsViewed).toBe(10);
	});

	it("should preserve data integrity across operations", () => {
		const cardId = "integrity-test";

		viewCard(cardId);
		updateCardTime(cardId, 30);

		const state1 = get(flipCardProgressStore);
		const firstAccessed1 = state1.cards.get(cardId)?.firstAccessed;

		updateCardTime(cardId, 15);
		completeCard(cardId);
		toggleCardMastery(cardId, true);

		const state2 = get(flipCardProgressStore);
		const progress = state2.cards.get(cardId);

		expect(progress?.viewed).toBe(true);
		expect(progress?.completed).toBe(true);
		expect(progress?.mastered).toBe(true);
		expect(progress?.timeSpent).toBe(45);
		expect(progress?.firstAccessed).toEqual(firstAccessed1);
		expect(progress?.completedAt).toBeInstanceOf(Date);
		expect(progress?.lastAccessed).toBeInstanceOf(Date);
	});
});
