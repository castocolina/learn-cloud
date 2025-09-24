/**
 * Search Type Definitions with Unified Navigation Integration
 *
 * This module extends the existing search system to integrate with the unified
 * navigation architecture while maintaining backward compatibility.
 *
 * Updated to use union-first patterns and enhanced navigation metadata.
 */

import type {
	ContentType,
	ChapterType,
	TechnologyUnit,
	ProgressStatus,
	ContentDifficulty
} from "./types.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { NavigationItemMetadata } from "./navigation.js";

export interface SearchCategory {
	id: string;
	name: string;
	icon: string;
	description?: string;
	color?: string;
}

/**
 * Enhanced searchable item interface with unified navigation metadata
 *
 * Integrates with the navigation system to provide comprehensive
 * search results with navigation context and metadata.
 */
export interface SearchableItem {
	/** Unique identifier matching NavigationItem.id */
	id: string;

	/** Item title */
	title: string;

	/** Item description */
	description: string;

	/** Searchable content text */
	content: string;

	/** Content type for filtering and display */
	type: ContentType;

	/** Category for organization */
	category: string;

	/** Search keywords */
	keywords: string[];

	/** Content tags */
	tags: string[];

	/** Enhanced navigation metadata */
	nav: SearchNavigationMetadata;

	/** Search weight/priority */
	weight: number;

	/** Additional search metadata */
	searchMetadata?: {
		/** Chapter type for renderer selection */
		chapterType?: ChapterType;

		/** Technology unit for styling */
		technologyUnit?: TechnologyUnit;

		/** Difficulty level */
		difficulty?: ContentDifficulty;

		/** Estimated completion time */
		estimatedTime?: number;

		/** Prerequisites */
		prerequisites?: string[];

		/** Learning objectives */
		learningObjectives?: string[];

		/** Progress status */
		progress?: ProgressStatus;

		/** Last modified date */
		lastModified?: Date;

		/** Content author */
		author?: string;
	};
}

/**
 * Enhanced navigation metadata for search integration
 */
export interface SearchNavigationMetadata {
	/** Unit identifier */
	unitId?: string;

	/** Chapter identifier */
	chapterId?: string;

	/** Legacy lesson ID for backward compatibility */
	lessonId?: string;

	/** Navigation path (hash-based routing) */
	path: string;

	/** Unit title for context */
	unitTitle?: string;

	/** Chapter number within unit */
	chapterNumber?: string;

	/** Breadcrumb path for display */
	breadcrumbPath?: string[];

	/** Previous content in sequence */
	previousId?: string;

	/** Next content in sequence */
	nextId?: string;

	/** Parent navigation item */
	parentId?: string;
}

/**
 * Search filters interface with enhanced filtering options
 */
export interface SearchFilters {
	/** Content type filter using union */
	contentType?: ContentType;

	/** Chapter type filter */
	chapterType?: ChapterType;

	/** Technology unit filter */
	technologyUnit?: TechnologyUnit;

	/** Category filter */
	category?: string;

	/** Tags filter */
	tags?: string[];

	/** Difficulty level filter */
	difficulty?: ContentDifficulty;

	/** Unit ID filter */
	unitId?: string;

	/** Progress status filter */
	progress?: ProgressStatus;

	/** Minimum estimated time filter */
	minTime?: number;

	/** Maximum estimated time filter */
	maxTime?: number;
}

export interface SearchResult extends SearchableItem {
	score: number;
	highlightedTitle?: string;
	highlightedDescription?: string;
	highlightedContent?: string;
}

export interface SearchState {
	query: string;
	results: SearchResult[];
	suggestions: string[];
	filters: SearchFilters;
	isLoading: boolean;
	hasMore: boolean;
	totalResults: number;
}

export interface SearchOptions {
	limit?: number;
	offset?: number;
	includeContent?: boolean;
	highlightMatches?: boolean;
}

export interface SearchAnalytics {
	query: string;
	resultCount: number;
	clickedResult?: string;
	timestamp: Date;
	userAgent?: string;
}
