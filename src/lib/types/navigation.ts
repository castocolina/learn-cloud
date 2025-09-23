/**
 * Navigation Type Definitions for Unified Navigation Architecture
 *
 * This module defines the navigation interfaces that power all navigation systems:
 * - Menu scaffolding and generation
 * - Sidebar accordion navigation
 * - URL generation and parsing (hash-based routing)
 * - Breadcrumb generation
 * - Search index with navigation metadata
 * - Sequential navigation (previous/next)
 * - Direct navigation and deep linking
 *
 * Critical: This is the foundation for a single, cohesive navigation architecture
 * where all navigation systems are interdependent and driven by the same data model.
 */

import type {
	ChapterType,
	ContentType,
	NavigationSection,
	ComponentState,
	ProgressStatus,
	TechnologyUnit,
	ContentDifficulty,
	BreadcrumbType
} from "./types.js";

/**
 * Base navigation item interface for all navigable content
 *
 * This is the foundation interface that all navigation items must implement
 * to ensure consistency across menu, sidebar, breadcrumb, and search systems.
 */
export interface NavigationItem {
	/** Unique identifier for this navigation item */
	id: string;

	/** Display title for the navigation item */
	title: string;

	/** Optional description or subtitle */
	description?: string;

	/** Navigation section this item belongs to */
	section: NavigationSection;

	/** Current state of this navigation item */
	state: ComponentState;

	/** Icon identifier or emoji for display */
	icon?: string;

	/** URL path or hash for navigation */
	path: string;

	/** Parent navigation item ID for hierarchical structure */
	parentId?: string;

	/** Child navigation items */
	children?: NavigationItem[];

	/** Order/priority for sorting */
	order?: number;

	/** Whether this item is currently active */
	isActive?: boolean;

	/** Whether this item is expanded (for collapsible items) */
	isExpanded?: boolean;

	/** Metadata for additional context */
	metadata?: NavigationItemMetadata;
}

/**
 * Navigation item metadata for enhanced context and functionality
 *
 * Comprehensive metadata supporting educational content organization,
 * progress tracking, and learning analytics integration.
 */
export interface NavigationItemMetadata {
	/** Chapter type for content categorization */
	chapterType?: ChapterType;

	/** Content type for search and display */
	contentType?: ContentType;

	/** Technology unit for styling and organization */
	technologyUnit?: TechnologyUnit;

	/** Unit identifier */
	unitId?: string;

	/** Chapter number within unit */
	chapterNumber?: string;

	/** Progress status for completion tracking */
	progress?: ProgressStatus;

	/** Estimated completion time in minutes */
	estimatedTime?: number;

	/** Difficulty level */
	difficulty?: ContentDifficulty;

	/** Prerequisites for this content */
	prerequisites?: string[];

	/** Learning objectives */
	learningObjectives?: string[];

	/** Tags for categorization and search */
	tags?: string[];

	/** Last accessed timestamp */
	lastAccessed?: Date;

	/** Completion timestamp */
	completedAt?: Date;

	/** Enhanced educational metadata */
	education?: {
		/** Core concepts covered in this content */
		concepts?: string[];

		/** Skills developed through this content */
		skills?: string[];

		/** Assessment methods available */
		assessments?: ("quiz" | "exercise" | "project" | "exam")[];

		/** Interactive elements included */
		interactiveElements?: ("flipcards" | "diagrams" | "code-examples" | "simulations")[];

		/** Related content recommendations */
		related?: {
			/** Prerequisites that should be completed first */
			prerequisites?: string[];

			/** Follow-up content recommendations */
			nextSteps?: string[];

			/** Alternative content covering similar topics */
			alternatives?: string[];

			/** Deep-dive content for advanced learning */
			deepDive?: string[];
		};

		/** Content accessibility features */
		accessibility?: {
			/** Screen reader optimized */
			screenReader?: boolean;

			/** Keyboard navigation support */
			keyboardNav?: boolean;

			/** High contrast mode available */
			highContrast?: boolean;

			/** Alternative text for visual content */
			altText?: boolean;

			/** Reduced motion option */
			reducedMotion?: boolean;
		};

		/** Performance and analytics metadata */
		analytics?: {
			/** Average completion time from analytics */
			avgCompletionTime?: number;

			/** Success rate for assessments */
			successRate?: number;

			/** User engagement score */
			engagementScore?: number;

			/** Difficulty rating from user feedback */
			userDifficultyRating?: number;

			/** Last content review date */
			lastReviewed?: Date;
		};
	};
}

/**
 * Flat navigation entry for sequential navigation (previous/next)
 *
 * Provides a linear sequence of all content items for seamless browsing
 * through the entire learning path with bidirectional navigation.
 */
export interface FlatNavEntry {
	/** Unique identifier matching NavigationItem.id */
	id: string;

	/** Display title */
	title: string;

	/** URL for navigation (hash-based routing) */
	url: string;

	/** Unit identifier this entry belongs to */
	unitId: string;

	/** Unit title for context */
	unitTitle: string;

	/** Chapter type for renderer selection */
	chapterType: ChapterType;

	/** Index within the unit (0-based) */
	chapterIndex: number;

	/** Global sequence index across all content (0-based) */
	globalIndex: number;

	/** Reference to previous entry in sequence */
	previousEntry?: FlatNavEntry | null;

	/** Reference to next entry in sequence */
	nextEntry?: FlatNavEntry | null;

	/** Technology unit for styling */
	technologyUnit?: TechnologyUnit;

	/** Progress status */
	progress?: ProgressStatus;

	/** Estimated completion time */
	estimatedTime?: number;
}

/**
 * Flat navigation structure interface
 *
 * Provides the complete sequential navigation system with utility methods
 * for efficient navigation and progress tracking.
 */
export interface FlatNavStructure {
	/** Array of all navigation entries in sequence */
	entries: FlatNavEntry[];

	/** Total number of entries */
	totalCount: number;

	/** Map for O(1) lookup of entries by ID */
	sequenceMap: Map<string, FlatNavEntry>;

	/** Get the next entry in sequence */
	getNextEntry: (currentId: string) => FlatNavEntry | null;

	/** Get the previous entry in sequence */
	getPreviousEntry: (currentId: string) => FlatNavEntry | null;

	/** Get entry by global index */
	getEntryByIndex: (index: number) => FlatNavEntry | null;

	/** Get entries by unit */
	getEntriesByUnit: (unitId: string) => FlatNavEntry[];

	/** Calculate progress percentage */
	calculateProgress: (completedIds: string[]) => number;
}

/**
 * Icon types for breadcrumb navigation elements
 * These correspond to common icon libraries (Lucide, Heroicons, etc.)
 */
export type BreadcrumbIcon =
	| "Home"
	| "Layers"
	| "BookOpen"
	| "FileText"
	| "Layout"
	| "Zap"
	| "Eye"
	| "Settings"
	| "Archive"
	| "Navigation"
	| "Monitor"
	| "Smartphone"
	| "Users"
	| "Code"
	| "Database"
	| "Server"
	| "Cloud"
	| "Shield"
	| "Activity"
	| "BarChart"
	| "GitBranch"
	| "Package"
	| "Terminal"
	| "Workflow"
	| "Globe"
	| "Lock"
	| "Key"
	| "Search"
	| "Star"
	| "Tag"
	| "Tool";

/**
 * Enhanced breadcrumb item interface
 *
 * Comprehensive breadcrumb item with full navigation context,
 * accessibility support, and visual configuration options.
 */
export interface BreadcrumbItem {
	/** Unique identifier for the breadcrumb item */
	id: string;

	/** Display label for the breadcrumb */
	label: string;

	/** Navigation URL (supports hash-based SPA routing) */
	url: string;

	/** Optional icon identifier from BreadcrumbIcon types */
	icon?: BreadcrumbIcon;

	/** Whether this breadcrumb item is currently active */
	isActive?: boolean;

	/** Optional aria-label for accessibility */
	ariaLabel?: string;

	/** Whether this item should be clickable */
	isClickable?: boolean;

	/** Breadcrumb type for styling and behavior */
	type?: BreadcrumbType;

	/** Additional metadata for enhanced context */
	metadata?: {
		unitId?: string;
		chapterType?: ChapterType;
		technologyUnit?: TechnologyUnit;
		estimatedTime?: number;
		difficulty?: ContentDifficulty;
	};
}

/**
 * Breadcrumb path configuration for different navigation scenarios
 *
 * Defines complete breadcrumb trails with metadata for SEO and accessibility.
 */
export interface BreadcrumbPath {
	/** Current section identifier */
	section: string;

	/** Array of breadcrumb items forming the navigation path */
	items: BreadcrumbItem[];

	/** Page title for the current path */
	pageTitle?: string;

	/** Meta description for the current path */
	description?: string;

	/** Additional SEO and accessibility metadata */
	metadata?: {
		keywords?: string[];
		lastModified?: Date;
		estimatedReadTime?: number;
	};
}

/**
 * Menu structure interface for content organization
 *
 * Defines the hierarchical menu structure used for content organization
 * and navigation scaffolding throughout the application.
 */
export interface MenuStructure {
	/** Menu metadata */
	metadata: {
		title: string;
		totalUnits: number;
		totalChapters: number;
		version?: string;
		lastUpdated?: Date;
	};

	/** Array of units in the menu */
	units: MenuUnit[];
}

/**
 * Menu unit interface for top-level content organization
 */
export interface MenuUnit {
	/** Unit identifier */
	id: string;

	/** Unit title */
	title: string;

	/** Unit description */
	description: string;

	/** Unit icon */
	icon: string;

	/** Unit emoji for enhanced visual display */
	emoji?: string;

	/** Technology unit for styling */
	technologyUnit: TechnologyUnit;

	/** Unit number/order */
	unitNumber: number;

	/** Estimated total hours for unit completion */
	estimatedHours?: number;

	/** Array of chapters in this unit */
	chapters: MenuChapter[];

	/** Unit progress status */
	progress?: ProgressStatus;

	/** Prerequisites for this unit */
	prerequisites?: string[];
}

/**
 * Menu chapter interface for individual content items
 */
export interface MenuChapter {
	/** Chapter identifier */
	id: string;

	/** Chapter title */
	title: string;

	/** Chapter description */
	description?: string;

	/** Chapter icon */
	icon: string;

	/** Chapter emoji for enhanced visual display */
	emoji?: string;

	/** Chapter type for renderer selection */
	type: ChapterType;

	/** Chapter number within unit */
	chapterNumber: string;

	/** Link to chapter content (legacy HTML) */
	chapterLink?: string;

	/** Link to chapter data (JSON/TypeScript) */
	chapterDataLink: string;

	/** Estimated completion time in minutes */
	estimatedTime?: number;

	/** Chapter difficulty level */
	difficulty?: ContentDifficulty;

	/** Chapter progress status */
	progress?: ProgressStatus;

	/** Prerequisites for this chapter */
	prerequisites?: string[];

	/** Learning objectives */
	learningObjectives?: string[];

	/** Related chapters */
	relatedChapters?: string[];
}

/**
 * Navigation context interface for current navigation state
 *
 * Provides context about the current navigation location and state
 * for use in components and routing logic.
 */
export interface NavigationContext {
	/** Current navigation item */
	currentItem?: NavigationItem;

	/** Current flat navigation entry */
	currentEntry?: FlatNavEntry;

	/** Breadcrumb trail to current item */
	breadcrumbs: BreadcrumbItem[];

	/** Current unit information */
	currentUnit?: MenuUnit;

	/** Current chapter information */
	currentChapter?: MenuChapter;

	/** Previous navigation entry */
	previousEntry?: FlatNavEntry | null;

	/** Next navigation entry */
	nextEntry?: FlatNavEntry | null;

	/** Navigation history */
	history?: string[];

	/** Whether navigation is loading */
	isLoading?: boolean;

	/** Navigation error state */
	error?: string;
}

/**
 * Route information interface for URL-based navigation
 *
 * Defines the structure for parsing and generating URLs in the
 * hash-based routing system.
 */
export interface RouteInfo {
	/** Route pattern or path */
	path: string;

	/** Route parameters */
	params: Record<string, string>;

	/** Query parameters */
	query: Record<string, string>;

	/** Hash fragment */
	hash?: string;

	/** Route metadata */
	metadata?: {
		unitId?: string;
		chapterType?: ChapterType;
		chapterId?: string;
		section?: string;
	};
}

/**
 * Navigation event interface for routing and state changes
 */
export interface NavigationEvent {
	/** Event type */
	type: "navigate" | "back" | "forward" | "reload" | "external";

	/** Target navigation item or URL */
	target: string | NavigationItem;

	/** Source of the navigation event */
	source: "menu" | "sidebar" | "breadcrumb" | "search" | "sequential" | "direct";

	/** Additional event data */
	data?: Record<string, unknown>;

	/** Timestamp of the event */
	timestamp: Date;
}

/**
 * Configuration interface for unified path generation
 * Used by both build-time generation and runtime navigation components
 */
export interface UnifiedPathConfig {
	/** Type of content (overview, lesson, quiz, exam, etc.) */
	contentType: ChapterType;

	/** Unit number (e.g., "1", "2", "10") */
	unitNum: string;

	/** Chapter number within unit (e.g., "1", "2", "10") - optional for unit-level content like overview/exam */
	chapterNum?: string;

	/** URL-friendly slug from title (optional for some content types) */
	titleSlug?: string;
}

/**
 * Comprehensive path result covering all navigation scenarios
 * Used by build-time generators and runtime navigation handlers
 */
export interface NavigationPaths {
	// Build-time paths (for menu generation and static references)
	/** Legacy HTML path for backward compatibility */
	htmlPath: string;

	/** TypeScript data file path for $data imports */
	dataPath: string;

	// Runtime navigation paths
	/** Hash-based URL for SPA navigation (#unit01/chapter01_01) */
	hashUrl: string;

	/** SvelteKit route path for server-side routing */
	routePath: string;

	/** Complete SPA URL including hash for external sharing */
	spaUrl: string;

	// Asset resolution
	/** Import path for dynamic asset loading */
	importPath: string;

	/** Unique asset key for caching and tracking */
	assetKey: string;

	// UI identifiers and display
	/** Zero-padded identifier for sorting and uniqueness */
	id: string;

	/** Human-readable path for breadcrumbs and UI display */
	displayPath: string;

	/** Short display name for compact UI elements */
	shortName: string;
}

/**
 * Parse result from URL parsing operations
 */
export interface ParsedNavigation {
	/** Parsed configuration */
	config: UnifiedPathConfig;

	/** Generated paths based on parsed config */
	paths: NavigationPaths;

	/** Whether the URL was successfully parsed */
	isValid: boolean;

	/** Error message if parsing failed */
	error?: string;
}
