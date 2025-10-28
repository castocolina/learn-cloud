/**
 * Content Loader with Dynamic Imports and Caching
 *
 * Provides content loading functionality for the SPA with:
 * - Dynamic imports from src/data/book/ using filePath
 * - In-memory caching for performance
 * - Preloading of adjacent content for smooth navigation
 * - Type-safe content handling
 *
 * ARCHITECTURE:
 * - Uses filePath from MenuChapter or FlatNavEntry
 * - Caches by chapterId for O(1) lookup
 * - Preloads previous/next for seamless browsing
 * - Handles missing content gracefully
 *
 * USAGE:
 * - ContentRouter: Load current chapter content
 * - Navigation: Preload adjacent chapters
 * - Testing: Clear cache between tests
 *
 * @module contentLoader
 */

import type { AnyContent, FlatNavEntry } from "$types";

/**
 * Content cache - Maps chapterId to loaded content
 * Key: chapterId (e.g., "01_01L")
 * Value: Loaded content object
 */
const contentCache = new Map<string, AnyContent>();

/**
 * Load chapter content by filePath
 *
 * Attempts to dynamically import content from src/data/{filePath}
 * and caches the result for subsequent requests.
 *
 * @param filePath - File path from MenuChapter/FlatNavEntry (e.g., "book/unit01/01_01_lesson_dev.ts")
 * @param chapterId - Unique chapter ID for caching (e.g., "01_01L")
 * @returns Loaded content or null if not found
 *
 * @example
 * const content = await loadChapterContent(
 *   "book/unit01/01_01_lesson_dev.ts",
 *   "01_01L"
 * );
 * if (content) {
 *   console.log(content.title);
 * }
 */
export async function loadChapterContent(
	filePath: string,
	chapterId: string
): Promise<AnyContent | null> {
	console.log("[contentLoader] Loading chapter content:", {
		chapterId,
		filePath,
		cached: contentCache.has(chapterId)
	});

	// Check cache first
	if (contentCache.has(chapterId)) {
		console.log("[contentLoader] Content loaded from cache:", chapterId);
		return contentCache.get(chapterId)!;
	}

	try {
		// Dynamic import: "book/unit01/01_01_lesson_dev.ts"
		// Vite requires relative path from this file
		const modulePath = `../../data/${filePath}`;
		console.log("[contentLoader] Attempting dynamic import:", modulePath);

		const contentModule = await import(/* @vite-ignore */ modulePath);
		console.log("[contentLoader] Module imported successfully:", {
			hasDefault: !!contentModule.default,
			hasContent: !!contentModule.content,
			moduleKeys: Object.keys(contentModule)
		});

		// Handle both default export and named 'content' export
		const content = contentModule.default || contentModule.content || contentModule;

		// Validate content has required properties
		if (!content || typeof content !== "object") {
			console.error("[contentLoader] Invalid content structure:", {
				filePath,
				content,
				type: typeof content
			});
			return null;
		}

		console.log("[contentLoader] Content loaded successfully:", {
			chapterId,
			type: content.type,
			title: content.title,
			hasSections: !!content.sections
		});

		// Cache result for future requests
		contentCache.set(chapterId, content);

		return content;
	} catch (error) {
		console.error("[contentLoader] Failed to load content:", {
			filePath,
			chapterId,
			error: error instanceof Error ? error.message : String(error),
			errorStack: error instanceof Error ? error.stack : undefined
		});
		return null;
	}
}

/**
 * Preload adjacent content for smooth navigation
 *
 * Loads previous and next chapters in the background
 * to eliminate loading delays during sequential navigation.
 *
 * @param previousEntry - Previous FlatNavEntry or null
 * @param nextEntry - Next FlatNavEntry or null
 *
 * @example
 * await preloadAdjacent(
 *   flatNavigation.previousEntry,
 *   flatNavigation.nextEntry
 * );
 */
export async function preloadAdjacent(
	previousEntry: FlatNavEntry | null,
	nextEntry: FlatNavEntry | null
): Promise<void> {
	const toPreload = [previousEntry, nextEntry]
		.filter(Boolean)
		.map((entry) => loadChapterContent(entry!.filePath, entry!.id));

	// Use Promise.allSettled to avoid failing if one preload fails
	await Promise.allSettled(toPreload);
}

/**
 * Clear content cache
 *
 * Useful for:
 * - Testing: Clear between test suites
 * - Memory management: Clear on route changes
 * - Development: Force reload after content updates
 *
 * @example
 * // In tests
 * afterEach(() => {
 *   clearContentCache();
 * });
 */
export function clearContentCache(): void {
	contentCache.clear();
}

/**
 * Get cache statistics
 *
 * Returns information about current cache state
 * for debugging and monitoring.
 *
 * @returns Cache statistics
 *
 * @example
 * const stats = getCacheStats();
 * console.log(`Cached: ${stats.size} items`);
 */
export function getCacheStats(): {
	size: number;
	ids: string[];
} {
	return {
		size: contentCache.size,
		ids: Array.from(contentCache.keys())
	};
}

/**
 * Check if content is cached
 *
 * @param chapterId - Chapter ID to check
 * @returns True if content is in cache
 *
 * @example
 * if (isContentCached("01_01L")) {
 *   console.log("Content ready!");
 * }
 */
export function isContentCached(chapterId: string): boolean {
	return contentCache.has(chapterId);
}
