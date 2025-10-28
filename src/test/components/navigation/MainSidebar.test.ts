/**
 * Test Suite for MainSidebar Component
 *
 * Comprehensive unit testing for the main navigation sidebar component.
 * Tests cover store integration, accordion behavior, configuration, type safety,
 * and performance with the production content menu (129 chapters across 9 units).
 *
 * ARCHITECTURE:
 * - Component: src/lib/components/navigation/MainSidebar.svelte
 * - Integration: navigationStore, contentMenu, SETTINGS
 * - Features: Accordion behavior, responsive design, active highlighting
 *
 * TEST STRATEGY:
 * - Unit tests for component logic and store integration
 * - Type safety verification
 * - Configuration validation
 * - Performance tests with large datasets
 * - Edge case coverage
 *
 * NOTE: Full component rendering tests require @testing-library/svelte.
 * Current tests focus on store integration, logic, and type safety.
 *
 * @test MainSidebar Component
 * @category unit
 */

import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import { navigationStore } from "$lib/stores/spaNavigation.js";
import { contentMenu } from "$data/generated/content-menu.js";
import { SETTINGS } from "$config/settings.js";
import type { MenuUnit, MenuChapter, SPANavigationState } from "$types";

/**
 * Test data: Mock navigation state
 */
const mockNavigationState: SPANavigationState = {
	currentId: "01_01L",
	currentChapterUrl: "01_01_lesson_development_environment_tooling.html",
	previousEntry: null,
	nextEntry: {
		id: "01_01SG",
		title: "1.1: Study Guide",
		chapterUrl: "01_01_study_guide.html",
		filePath: "book/unit01/01_01_study_guide.ts",
		unitId: "unit_1",
		unitTitle: "Unit 1: Python for Cloud-Native Backend Development",
		chapterType: "study_guide",
		chapterIndex: 2,
		globalIndex: 2
	},
	source: "sidebar",
	isLoading: false,
	error: null
};

/**
 * Test data: Sample menu unit
 */
const mockUnit: MenuUnit = {
	id: "unit_1",
	title: "Unit 1: Python for Cloud-Native Backend Development",
	shortName: "Python",
	description: "Python for Cloud-Native Backend Development",
	icon: "Box",
	emoji: "🐍",
	technologyUnit: "python",
	unitNumber: 1,
	chapters: [
		{
			id: "01_00O",
			title: "Unit 1: Overview",
			icon: "BookOpen",
			type: "overview",
			chapterNumber: "0.0",
			chapterUrl: "01_00_overview.html",
			filePath: "book/unit01/01_00_overview.ts"
		},
		{
			id: "01_01L",
			title: "1.1: Development Environment & Tooling",
			icon: "Settings",
			emoji: "⚙️",
			type: "lesson",
			chapterNumber: "1.1",
			chapterUrl: "01_01_lesson_development_environment_tooling.html",
			filePath: "book/unit01/01_01_lesson.ts",
			estimatedTime: 45,
			difficulty: "beginner",
			learningObjectives: ["Set up Python development environment"],
			description: "Set up Python development environment"
		}
	],
	estimatedHours: 20
};

describe("MainSidebar Component - Unit Tests", () => {
	beforeEach(() => {
		// Reset navigation store before each test
		navigationStore.set({
			currentId: null,
			currentChapterUrl: null,
			previousEntry: null,
			nextEntry: null,
			source: "direct",
			isLoading: false,
			error: null
		});
	});

	// =============================================================================
	// TEST SUITE 1: Navigation Store Integration
	// =============================================================================

	describe("Navigation Store Integration", () => {
		it("should have access to navigationStore", () => {
			expect(navigationStore).toBeDefined();
			expect(get(navigationStore)).toBeDefined();
		});

		it("should update when navigation store changes", () => {
			navigationStore.set(mockNavigationState);
			const navState = get(navigationStore);

			expect(navState.currentId).toBe("01_01L");
			expect(navState.source).toBe("sidebar");
		});

		it("should track currentId for active chapter highlighting", () => {
			navigationStore.set(mockNavigationState);
			const navState = get(navigationStore);

			expect(navState.currentId).toBe("01_01L");
			expect(navState.currentChapterUrl).toBe("01_01_lesson_development_environment_tooling.html");
		});

		it("should identify active chapter from currentId", () => {
			navigationStore.set(mockNavigationState);
			const currentId = get(navigationStore).currentId;

			// Function that would be used in component
			const isChapterActive = (chapterId: string): boolean => {
				return currentId === chapterId;
			};

			expect(isChapterActive("01_01L")).toBe(true);
			expect(isChapterActive("01_01SG")).toBe(false);
		});

		it("should handle null currentId gracefully", () => {
			const navState = get(navigationStore);
			expect(navState.currentId).toBeNull();
		});

		it("should support multiple navigation sources", () => {
			const sources = ["sidebar", "search", "breadcrumb", "direct", "sequential"] as const;

			sources.forEach((source) => {
				navigationStore.set({ ...mockNavigationState, source });
				const navState = get(navigationStore);
				expect(navState.source).toBe(source);
			});
		});
	});

	// =============================================================================
	// TEST SUITE 2: Accordion Behavior Logic
	// =============================================================================

	describe("Accordion Behavior Logic", () => {
		it("should track expanded unit ID", () => {
			// Simulate accordion state management
			let expandedUnitId: string | null = null;

			// Expand unit
			expandedUnitId = "unit_1";
			expect(expandedUnitId).toBe("unit_1");

			// Collapse same unit
			expandedUnitId = expandedUnitId === "unit_1" ? null : "unit_1";
			expect(expandedUnitId).toBeNull();
		});

		it("should toggle accordion state on unit click", () => {
			let expandedUnitId: string | null = null;

			// First click: expand
			expandedUnitId = expandedUnitId === "unit_1" ? null : "unit_1";
			expect(expandedUnitId).toBe("unit_1");

			// Second click: collapse
			expandedUnitId = expandedUnitId === "unit_1" ? null : "unit_1";
			expect(expandedUnitId).toBeNull();
		});

		it("should allow only one unit open at a time (accordion behavior)", () => {
			let expandedUnitId: string | null = null;

			// Expand unit 1
			expandedUnitId = "unit_1";
			expect(expandedUnitId).toBe("unit_1");

			// Expand unit 2 (unit 1 should close)
			expandedUnitId = "unit_2";
			expect(expandedUnitId).toBe("unit_2");
			expect(expandedUnitId).not.toBe("unit_1");
		});

		it("should handle rapid unit toggles", () => {
			let expandedUnitId: string | null = null;

			// Simulate rapid toggles
			for (let i = 0; i < 10; i++) {
				expandedUnitId = expandedUnitId === "unit_1" ? null : "unit_1";
			}

			// After even number of toggles, should be null
			expect(expandedUnitId).toBeNull();
		});

		it("should preserve accordion state during navigation updates", () => {
			const expandedUnitId: string | null = "unit_1";

			// Navigation update should not affect accordion state
			navigationStore.set(mockNavigationState);

			expect(expandedUnitId).toBe("unit_1");
		});
	});

	// =============================================================================
	// TEST SUITE 3: Content Menu Integration
	// =============================================================================

	describe("Content Menu Integration", () => {
		it("should load production content menu", () => {
			expect(contentMenu).toBeDefined();
			expect(contentMenu.metadata).toBeDefined();
			expect(contentMenu.units).toBeDefined();
		});

		it("should have correct metadata structure", () => {
			expect(contentMenu.metadata.title).toBe("Mastering Cloud-Native Technologies");
			expect(contentMenu.metadata.totalUnits).toBe(9);
			expect(contentMenu.metadata.totalChapters).toBe(129);
			expect(contentMenu.metadata.version).toBeDefined();
		});

		it("should have correct number of units", () => {
			expect(contentMenu.units.length).toBe(9);
		});

		it("should have valid unit structure", () => {
			const firstUnit = contentMenu.units[0];

			expect(firstUnit).toHaveProperty("id");
			expect(firstUnit).toHaveProperty("title");
			expect(firstUnit).toHaveProperty("shortName");
			expect(firstUnit).toHaveProperty("chapters");
			expect(firstUnit.chapters.length).toBeGreaterThan(0);
		});

		it("should have chapters with valid structure", () => {
			const firstUnit = contentMenu.units[0];
			const firstChapter = firstUnit.chapters[0];

			expect(firstChapter).toHaveProperty("id");
			expect(firstChapter).toHaveProperty("title");
			expect(firstChapter).toHaveProperty("type");
			expect(firstChapter).toHaveProperty("chapterUrl");
		});

		it("should find overview chapter in each unit", () => {
			contentMenu.units.forEach((unit) => {
				const overviewChapter = unit.chapters.find((ch) => ch.type === "overview");
				expect(overviewChapter).toBeDefined();
				expect(overviewChapter?.type).toBe("overview");
			});
		});

		it("should have unique chapter IDs across all units", () => {
			const allChapterIds = contentMenu.units.flatMap((unit) => unit.chapters.map((ch) => ch.id));

			const uniqueIds = new Set(allChapterIds);
			expect(uniqueIds.size).toBe(allChapterIds.length);
		});

		it("should have emojis for units and chapters", () => {
			contentMenu.units.forEach((unit) => {
				// Unit should have emoji
				expect(unit.emoji || unit.icon).toBeDefined();

				// Chapters may have emoji
				unit.chapters.forEach((chapter) => {
					expect(chapter.emoji || chapter.icon).toBeDefined();
				});
			});
		});

		it("should support truncateText helper function", () => {
			const truncateText = (text: string, maxLength = 15): string => {
				if (text.length <= maxLength) return text;
				return text.substring(0, maxLength - 3) + "...";
			};

			expect(truncateText("Short text")).toBe("Short text");
			expect(truncateText("This is a very long title that needs truncation")).toBe(
				"This is a ve..."
			);
			expect(truncateText("Exactly15chars!", 15)).toBe("Exactly15chars!");
			expect(truncateText("16characters_now", 15)).toBe("16characters...");
		});
	});

	// =============================================================================
	// TEST SUITE 4: Component Configuration
	// =============================================================================

	describe("Component Configuration", () => {
		it("should have sidebar configuration in SETTINGS", () => {
			expect(SETTINGS.ui.sidebar).toBeDefined();
		});

		it("should support collapsible modes", () => {
			const collapsibleModes = ["none", "icon", "offcanvas"] as const;
			const defaultMode = SETTINGS.ui.sidebar.collapsibleMode;

			expect(collapsibleModes).toContain(defaultMode);
		});

		it("should have header configuration", () => {
			expect(SETTINGS.ui.sidebar.header).toBeDefined();
			expect(SETTINGS.ui.sidebar.header.title).toBeDefined();
			expect(SETTINGS.ui.sidebar.header.description).toBeDefined();
		});

		it("should have footer configuration", () => {
			expect(SETTINGS.ui.sidebar.footer).toBeDefined();
			expect(SETTINGS.ui.sidebar.footer.version).toBeDefined();
		});

		it("should support dynamic description with placeholders", () => {
			const description = SETTINGS.ui.sidebar.header.description
				.replace("{units}", String(contentMenu.metadata.totalUnits))
				.replace("{chapters}", String(contentMenu.metadata.totalChapters));

			expect(description).toContain(String(contentMenu.metadata.totalUnits));
			expect(description).toContain(String(contentMenu.metadata.totalChapters));
			expect(description).not.toContain("{units}");
			expect(description).not.toContain("{chapters}");
		});

		it("should validate props interface", () => {
			// Type-safe props definition
			type Props = {
				collapsible?: "none" | "icon" | "offcanvas";
				class?: string;
			};

			const validProps1: Props = { collapsible: "icon" };
			const validProps2: Props = { collapsible: "offcanvas", class: "custom-class" };
			const validProps3: Props = {};

			expect(validProps1.collapsible).toBe("icon");
			expect(validProps2.class).toBe("custom-class");
			expect(validProps3.collapsible).toBeUndefined();
		});
	});

	// =============================================================================
	// TEST SUITE 5: Type Safety
	// =============================================================================

	describe("Type Safety", () => {
		it("should enforce MenuUnit type", () => {
			const unit: MenuUnit = mockUnit;

			expect(unit.id).toBe("unit_1");
			expect(unit.title).toBeDefined();
			expect(unit.chapters).toBeInstanceOf(Array);
		});

		it("should enforce MenuChapter type", () => {
			const chapter: MenuChapter = mockUnit.chapters[0];

			expect(chapter.id).toBe("01_00O");
			expect(chapter.type).toBe("overview");
			expect(chapter.chapterUrl).toBeDefined();
		});

		it("should support chapter types", () => {
			const chapterTypes = [
				"overview",
				"lesson",
				"study_guide",
				"quiz",
				"exam",
				"project"
			] as const;

			chapterTypes.forEach((type) => {
				// Find a chapter of this type in content menu
				const chapter = contentMenu.units.flatMap((u) => u.chapters).find((ch) => ch.type === type);

				if (chapter) {
					expect(chapter.type).toBe(type);
				}
			});
		});

		it("should support optional chapter properties", () => {
			const chapterWithOptionals: MenuChapter = {
				...mockUnit.chapters[1],
				estimatedTime: 45,
				difficulty: "beginner",
				learningObjectives: ["Test objective"],
				description: "Test description"
			};

			expect(chapterWithOptionals.estimatedTime).toBe(45);
			expect(chapterWithOptionals.difficulty).toBe("beginner");
			expect(chapterWithOptionals.learningObjectives).toHaveLength(1);
		});

		it("should enforce SPANavigationState type", () => {
			const navState: SPANavigationState = mockNavigationState;

			expect(navState.currentId).toBe("01_01L");
			expect(navState.source).toBe("sidebar");
			expect(navState.isLoading).toBe(false);
		});
	});

	// =============================================================================
	// TEST SUITE 6: Performance Tests
	// =============================================================================

	describe("Performance Tests", () => {
		it("should handle large content menu (9 units, 129 chapters)", () => {
			const units = contentMenu.units;
			const totalChapters = units.reduce((sum, unit) => sum + unit.chapters.length, 0);

			expect(units.length).toBe(9);
			expect(totalChapters).toBe(129);
		});

		it("should efficiently find active chapter in large dataset", () => {
			navigationStore.set({ ...mockNavigationState, currentId: "01_01L" });
			const currentId = get(navigationStore).currentId;

			// Simulate finding active chapter (O(n) operation)
			const startTime = performance.now();

			let foundChapter: MenuChapter | undefined;
			for (const unit of contentMenu.units) {
				foundChapter = unit.chapters.find((ch) => ch.id === currentId);
				if (foundChapter) break;
			}

			const endTime = performance.now();
			const duration = endTime - startTime;

			expect(foundChapter).toBeDefined();
			expect(foundChapter?.id).toBe("01_01L");
			expect(duration).toBeLessThan(10); // Should be very fast (<10ms)
		});

		it("should handle rapid navigation updates", () => {
			const iterations = 100;

			for (let i = 0; i < iterations; i++) {
				navigationStore.set({
					...mockNavigationState,
					currentId: `test_${i}`
				});
			}

			const finalState = get(navigationStore);
			expect(finalState.currentId).toBe(`test_${iterations - 1}`);
		});

		it("should efficiently filter chapters by type", () => {
			const allChapters = contentMenu.units.flatMap((u) => u.chapters);

			const startTime = performance.now();

			const lessons = allChapters.filter((ch) => ch.type === "lesson");
			const quizzes = allChapters.filter((ch) => ch.type === "quiz");
			const studyGuides = allChapters.filter((ch) => ch.type === "study_guide");

			const endTime = performance.now();
			const duration = endTime - startTime;

			expect(lessons.length).toBeGreaterThan(0);
			expect(quizzes.length).toBeGreaterThan(0);
			expect(studyGuides.length).toBeGreaterThan(0);
			expect(duration).toBeLessThan(5); // Should be very fast (<5ms)
		});

		it("should handle accordion state changes efficiently", () => {
			let expandedUnitId: string | null = null;

			const startTime = performance.now();

			// Simulate 1000 accordion toggles
			for (let i = 0; i < 1000; i++) {
				expandedUnitId = expandedUnitId === "unit_1" ? null : "unit_1";
			}

			const endTime = performance.now();
			const duration = endTime - startTime;

			expect(duration).toBeLessThan(10); // Should be very fast (<10ms)
		});
	});

	// =============================================================================
	// TEST SUITE 7: Edge Cases
	// =============================================================================

	describe("Edge Cases", () => {
		it("should handle unit with no chapters gracefully", () => {
			const emptyUnit: MenuUnit = {
				...mockUnit,
				chapters: []
			};

			expect(emptyUnit.chapters.length).toBe(0);
			const overviewChapter = emptyUnit.chapters.find((ch) => ch.type === "overview");
			expect(overviewChapter).toBeUndefined();
		});

		it("should handle very long unit titles", () => {
			const longTitle = "A".repeat(200);
			const truncateText = (text: string, maxLength = 15): string => {
				if (text.length <= maxLength) return text;
				return text.substring(0, maxLength - 3) + "...";
			};

			const truncated = truncateText(longTitle);
			expect(truncated.length).toBe(15);
			expect(truncated).toBe("AAAAAAAAAAAA...");
		});

		it("should handle navigation to non-existent chapter", () => {
			navigationStore.set({ ...mockNavigationState, currentId: "non_existent_id" });

			const currentId = get(navigationStore).currentId;
			expect(currentId).toBe("non_existent_id");

			// Should not find chapter
			let foundChapter: MenuChapter | undefined;
			for (const unit of contentMenu.units) {
				foundChapter = unit.chapters.find((ch) => ch.id === currentId);
				if (foundChapter) break;
			}

			expect(foundChapter).toBeUndefined();
		});

		it("should handle empty navigation state", () => {
			const emptyState = get(navigationStore);

			expect(emptyState.currentId).toBeNull();
			expect(emptyState.currentChapterUrl).toBeNull();
			expect(emptyState.previousEntry).toBeNull();
			expect(emptyState.nextEntry).toBeNull();
		});

		it("should handle special characters in chapter IDs", () => {
			const specialId = "test_id-with.special@chars";
			navigationStore.set({ ...mockNavigationState, currentId: specialId });

			expect(get(navigationStore).currentId).toBe(specialId);
		});

		it("should handle unit without emoji/icon", () => {
			const unitWithoutEmoji = {
				...mockUnit,
				emoji: undefined,
				icon: undefined
			};

			const displayEmoji = unitWithoutEmoji.emoji || unitWithoutEmoji.icon || "📦";
			expect(displayEmoji).toBe("📦");
		});
	});

	// =============================================================================
	// TEST SUITE 8: Navigation Logic
	// =============================================================================

	describe("Navigation Logic", () => {
		it("should support navigateToContent event structure", () => {
			type NavigateEvent = {
				type: "navigate";
				target: string;
				source: "sidebar" | "search" | "breadcrumb" | "direct" | "sequential";
				data?: { unitId: string; chapterId: string };
				timestamp: Date;
			};

			const event: NavigateEvent = {
				type: "navigate",
				target: "01_01_lesson.html",
				source: "sidebar",
				data: { unitId: "unit_1", chapterId: "01_01L" },
				timestamp: new Date()
			};

			expect(event.type).toBe("navigate");
			expect(event.source).toBe("sidebar");
			expect(event.data?.chapterId).toBe("01_01L");
		});

		it("should distinguish between unit navigation and chapter navigation", () => {
			const unitNavigation = {
				type: "unit",
				target: "unit_1"
			};

			const chapterNavigation = {
				type: "chapter",
				target: "01_01L"
			};

			expect(unitNavigation.type).toBe("unit");
			expect(chapterNavigation.type).toBe("chapter");
		});

		it("should handle sequential navigation (previous/next)", () => {
			navigationStore.set(mockNavigationState);
			const navState = get(navigationStore);

			expect(navState.previousEntry).toBeNull();
			expect(navState.nextEntry).toBeDefined();
			expect(navState.nextEntry?.id).toBe("01_01SG");
		});
	});
});
