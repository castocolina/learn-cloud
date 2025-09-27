/**
 * Content Navigation Utilities
 *
 * Utilities for managing units, chapters, and content organization.
 * Provides functions for unit identification, chapter management,
 * and content navigation across the learning platform.
 *
 * Features:
 * - Unit identification and validation
 * - Chapter management and ordering
 * - Content path generation
 * - Navigation hierarchy utilities
 */

import { contentMenu } from "$data/generated/content-menu.js";
import type { ChapterType, MenuChapter } from "$types";

/**
 * Interface for unit information
 */
export interface UnitInfo {
	id: string;
	title: string;
	description?: string;
	chapters: MenuChapter[];
	order: number;
}

/**
 * Interface for chapter information
 */
export interface ChapterInfo {
	id: string;
	title: string;
	type: ChapterType;
	unitId: string;
	order: number;
	path?: string;
}

/**
 * Interface for content path configuration
 */
export interface ContentPathInfo {
	unit: string;
	type: ChapterType;
	id: string;
	fullPath: string;
	directory: string;
	filename: string;
}

/**
 * Interface for unified path configuration
 */
export interface UnifiedPathConfig {
	unit: string;
	type: ChapterType;
	id: string;
	contentPath: string;
	routePath: string;
	navPath: string;
	directory: string;
}

/**
 * Get all available units from content menu
 */
export function getAllUnits(): UnitInfo[] {
	return contentMenu.units.map((unit, index) => ({
		id: unit.id,
		title: unit.title,
		description: unit.description,
		chapters: unit.chapters,
		order: index
	}));
}

/**
 * Get unit information by ID
 */
export function getUnitById(unitId: string): UnitInfo | null {
	const unitIndex = contentMenu.units.findIndex((unit) => unit.id === unitId);
	if (unitIndex === -1) {
		return null;
	}

	const unit = contentMenu.units[unitIndex];
	return {
		id: unit.id,
		title: unit.title,
		description: unit.description,
		chapters: unit.chapters,
		order: unitIndex
	};
}

/**
 * Get all chapters for a specific unit
 */
export function getChaptersByUnit(unitId: string): ChapterInfo[] {
	const unit = getUnitById(unitId);
	if (!unit) {
		return [];
	}

	return unit.chapters.map((chapter, index) => ({
		id: chapter.id,
		title: chapter.title,
		type: chapter.type,
		unitId: unitId,
		order: index,
		path: chapter.chapterUrl
	}));
}

/**
 * Get chapter information by ID within a unit
 */
export function getChapterById(unitId: string, chapterId: string): ChapterInfo | null {
	const chapters = getChaptersByUnit(unitId);
	return chapters.find((chapter) => chapter.id === chapterId) || null;
}

/**
 * Check if unit exists in content menu
 */
export function unitExists(unitId: string): boolean {
	return contentMenu.units.some((unit) => unit.id === unitId);
}

/**
 * Check if chapter exists within a unit
 */
export function chapterExists(unitId: string, chapterId: string): boolean {
	const unit = getUnitById(unitId);
	if (!unit) {
		return false;
	}

	return unit.chapters.some((chapter) => chapter.id === chapterId);
}

/**
 * Get next chapter in sequence
 */
export function getNextChapter(unitId: string, currentChapterId: string): ChapterInfo | null {
	const chapters = getChaptersByUnit(unitId);
	const currentIndex = chapters.findIndex((chapter) => chapter.id === currentChapterId);

	if (currentIndex === -1 || currentIndex === chapters.length - 1) {
		return null;
	}

	return chapters[currentIndex + 1];
}

/**
 * Get previous chapter in sequence
 */
export function getPreviousChapter(unitId: string, currentChapterId: string): ChapterInfo | null {
	const chapters = getChaptersByUnit(unitId);
	const currentIndex = chapters.findIndex((chapter) => chapter.id === currentChapterId);

	if (currentIndex <= 0) {
		return null;
	}

	return chapters[currentIndex - 1];
}

/**
 * Get chapters by type within a unit
 */
export function getChaptersByType(unitId: string, type: ChapterType): ChapterInfo[] {
	const chapters = getChaptersByUnit(unitId);
	return chapters.filter((chapter) => chapter.type === type);
}

/**
 * Get all chapters of a specific type across all units
 */
export function getAllChaptersByType(type: ChapterType): ChapterInfo[] {
	const allChapters: ChapterInfo[] = [];

	for (const unit of contentMenu.units) {
		const unitChapters = getChaptersByType(unit.id, type);
		allChapters.push(...unitChapters);
	}

	return allChapters;
}

/**
 * Generate file path for content based on unit, type, and ID
 */
export function generateContentPath(unit: string, type: ChapterType, id: string): ContentPathInfo {
	// Base directory structure: src/data/{unit}/{type}
	const directory = `src/data/${unit}/${type}`;

	// Filename: {id}.ts
	const filename = `${id}.ts`;

	// Full path
	const fullPath = `${directory}/${filename}`;

	return {
		unit,
		type,
		id,
		fullPath,
		directory,
		filename
	};
}

/**
 * Generate unified path configuration for navigation
 */
export function generateUnifiedPath(
	unit: string,
	type: ChapterType,
	id: string
): UnifiedPathConfig {
	const contentPath = generateContentPath(unit, type, id);

	// Route path for SvelteKit: /{unit}/{type}/{id}
	const routePath = `/${unit}/${type}/${id}`;

	// Navigation path (same as route for now)
	const navPath = routePath;

	return {
		unit,
		type,
		id,
		contentPath: contentPath.fullPath,
		routePath,
		navPath,
		directory: contentPath.directory
	};
}

/**
 * Validate content hierarchy (unit -> chapter relationship)
 */
export function validateContentHierarchy(
	unitId: string,
	chapterId: string,
	type: ChapterType
): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	// Check if unit exists
	if (!unitExists(unitId)) {
		errors.push(`Unit '${unitId}' does not exist in content menu`);
	}

	// Check if chapter exists within unit
	if (!chapterExists(unitId, chapterId)) {
		errors.push(`Chapter '${chapterId}' does not exist in unit '${unitId}'`);
	}

	// Check if chapter type matches
	const chapter = getChapterById(unitId, chapterId);
	if (chapter && chapter.type !== type) {
		errors.push(`Chapter '${chapterId}' is of type '${chapter.type}', not '${type}'`);
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Get content statistics for a unit
 */
export function getUnitStatistics(unitId: string): {
	totalChapters: number;
	chaptersByType: Record<ChapterType, number>;
	completionOrder: ChapterInfo[];
} {
	const chapters = getChaptersByUnit(unitId);

	// Count chapters by type
	const chaptersByType: Record<ChapterType, number> = {
		lesson: 0,
		overview: 0,
		quiz: 0,
		study_guide: 0,
		exam: 0,
		project: 0
	};

	chapters.forEach((chapter) => {
		chaptersByType[chapter.type]++;
	});

	return {
		totalChapters: chapters.length,
		chaptersByType,
		completionOrder: chapters.sort((a, b) => a.order - b.order)
	};
}

/**
 * Get learning path suggestions for a unit
 */
export function getLearningPath(unitId: string): ChapterInfo[] {
	const chapters = getChaptersByUnit(unitId);

	// Suggested order: overview -> lessons -> study_guides -> quizzes -> projects -> exams
	const typeOrder: ChapterType[] = ["overview", "lesson", "study_guide", "quiz", "project", "exam"];

	// Group chapters by type
	const chaptersByType = chapters.reduce(
		(acc, chapter) => {
			if (!acc[chapter.type]) {
				acc[chapter.type] = [];
			}
			acc[chapter.type].push(chapter);
			return acc;
		},
		{} as Record<ChapterType, ChapterInfo[]>
	);

	// Build learning path in suggested order
	const learningPath: ChapterInfo[] = [];

	for (const type of typeOrder) {
		if (chaptersByType[type]) {
			// Sort chapters of same type by their original order
			const sortedChapters = chaptersByType[type].sort((a, b) => a.order - b.order);
			learningPath.push(...sortedChapters);
		}
	}

	return learningPath;
}

/**
 * Find chapters that reference other chapters
 */
export function findChapterDependencies(
	_unitId: string,
	_chapterId: string
): {
	prerequisites: ChapterInfo[];
	dependencies: ChapterInfo[];
} {
	// For now, return empty arrays as this would require content analysis
	// In future, this could analyze chapter content for references
	return {
		prerequisites: [],
		dependencies: []
	};
}

/**
 * Get content breadcrumb trail
 */
export function getContentBreadcrumbs(
	unitId: string,
	chapterId: string
): Array<{ label: string; path?: string; type: "unit" | "chapter" }> {
	const unit = getUnitById(unitId);
	const chapter = getChapterById(unitId, chapterId);

	const breadcrumbs = [];

	if (unit) {
		breadcrumbs.push({
			label: unit.title,
			path: `/${unitId}`,
			type: "unit" as const
		});
	}

	if (chapter) {
		breadcrumbs.push({
			label: chapter.title,
			path: `/${unitId}/${chapter.type}/${chapterId}`,
			type: "chapter" as const
		});
	}

	return breadcrumbs;
}
