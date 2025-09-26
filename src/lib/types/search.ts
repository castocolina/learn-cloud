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

/**
 * Search Index Generation Types
 *
 * The following interfaces support the automatic search index generation
 * process using Lunr.js and ts-morph for content extraction.
 */

/**
 * Search index generation configuration options
 */
export interface SearchIndexConfig {
	/** Content source directory */
	contentPath: string;

	/** Output file path for generated index */
	outputPath: string;

	/** Generation mode for development vs production */
	mode: "development" | "production";

	/** Enable/disable NLP processing for keyword extraction */
	enableNLP: boolean;

	/** Enable/disable verbose logging during generation */
	verboseLogging: boolean;

	/** Maximum keywords to extract per content item */
	maxKeywords: number;

	/** Minimum keyword length for filtering */
	minKeywordLength: number;

	/** Lunr.js field boost configuration */
	fieldBoosts: {
		title: number;
		summary: number;
		content: number;
		codeBlocks: number;
		diagrams: number;
		flashcards: number;
		questions: number;
		requirements: number;
		keywords: number;
		tags: number;
	};
}

/**
 * Raw content item extracted from TypeScript files
 * Before processing into SearchableItem format
 */
export interface RawContentItem {
	/** File path where content was found */
	sourceFile: string;

	/** Content identifier */
	id: string;

	/** Content title */
	title: string;

	/** Content summary/description */
	summary: string;

	/** Content type for classification */
	type: ChapterType;

	/** Unit identifier extracted from file structure */
	unitId: string;

	/** Chapter number extracted from filename */
	chapterNumber: string;

	/** Raw content object from TypeScript file */
	rawContent: unknown;

	/** Extracted searchable text */
	searchableText: string;

	/** Extracted code blocks with metadata */
	codeBlocks: ExtractedCodeBlock[];

	/** Extracted diagrams with metadata */
	diagrams: ExtractedDiagram[];

	/** Extracted flashcards (for study guides) */
	flashcards: ExtractedFlashcard[];

	/** Extracted questions (for quizzes/exams) */
	questions: ExtractedQuestion[];

	/** Extracted project requirements */
	requirements: string[];

	/** Manual keywords from content metadata */
	manualKeywords: string[];

	/** Tags from content metadata */
	tags: string[];

	/** Content difficulty level */
	difficulty?: ContentDifficulty;

	/** Technology unit classification */
	technologyUnit?: TechnologyUnit;

	/** Estimated completion time */
	estimatedTime?: number;

	/** Prerequisites */
	prerequisites?: string[];

	/** Learning objectives */
	learningObjectives?: string[];
}

/**
 * Extracted code block with metadata
 */
export interface ExtractedCodeBlock {
	/** Programming language */
	language: string;

	/** Code content */
	code: string;

	/** Optional title */
	title?: string;

	/** Optional filename */
	filename?: string;

	/** Extracted technical terms from code */
	technicalTerms: string[];
}

/**
 * Extracted diagram with searchable metadata
 */
export interface ExtractedDiagram {
	/** Diagram type */
	diagramType: string;

	/** Diagram definition (Mermaid syntax) */
	definition: string;

	/** Optional title */
	title?: string;

	/** Optional caption */
	caption?: string;

	/** Extracted terms from diagram text */
	extractedTerms: string[];
}

/**
 * Extracted flashcard for indexing
 */
export interface ExtractedFlashcard {
	/** Front text */
	front: string;

	/** Back text */
	back: string;

	/** Tags */
	tags: string[];

	/** Category */
	category?: string;

	/** Difficulty level */
	difficulty?: ContentDifficulty;
}

/**
 * Extracted question for indexing
 */
export interface ExtractedQuestion {
	/** Question type */
	type: import("./types.js").QuestionType;

	/** Question text */
	question: string;

	/** Answer options (for choice questions) */
	options?: string[];

	/** Code snippet (for code completion) */
	codeSnippet?: string;

	/** Explanation text */
	explanation?: string;

	/** Question tags */
	tags?: string[];

	/** Extracted technical terms */
	technicalTerms: string[];
}

/**
 * Content extraction result from ts-morph parsing
 */
export interface ContentExtractionResult {
	/** Successfully processed content items */
	items: RawContentItem[];

	/** Files that failed to process */
	failures: ContentExtractionFailure[];

	/** Processing statistics */
	stats: ExtractionStats;
}

/**
 * Failed content extraction details
 */
export interface ContentExtractionFailure {
	/** File path that failed */
	filePath: string;

	/** Error message */
	error: string;

	/** Error stack trace */
	stackTrace?: string;

	/** Timestamp of failure */
	timestamp: Date;
}

/**
 * Content extraction statistics
 */
export interface ExtractionStats {
	/** Total files scanned */
	totalFiles: number;

	/** Successfully processed files */
	successfulFiles: number;

	/** Failed files */
	failedFiles: number;

	/** Processing time in milliseconds */
	processingTime: number;

	/** Content type distribution */
	typeDistribution: Record<ChapterType, number>;

	/** Total extracted items by type */
	itemCounts: {
		lessons: number;
		studyGuides: number;
		quizzes: number;
		exams: number;
		projects: number;
		codeBlocks: number;
		diagrams: number;
		flashcards: number;
		questions: number;
	};
}

/**
 * Lunr.js index generation result
 */
export interface LunrIndexResult {
	/** Generated Lunr.js index (serialized) */
	index: object;

	/** Searchable items array */
	items: SearchableItem[];

	/** Index metadata */
	metadata: SearchIndexMetadata;

	/** Generation statistics */
	generationStats: IndexGenerationStats;
}

/**
 * Search index metadata
 */
export interface SearchIndexMetadata {
	/** Generation timestamp */
	generatedAt: string;

	/** Total searchable items */
	totalItems: number;

	/** Content type distribution */
	typeDistribution: Record<ContentType, number>;

	/** Chapter type distribution */
	chapterTypeDistribution: Record<ChapterType, number>;

	/** Generation mode used */
	mode: "development" | "production";

	/** NLP processing enabled */
	nlpEnabled: boolean;

	/** Index version */
	version: string;

	/** Configuration used */
	config: Partial<SearchIndexConfig>;
}

/**
 * Index generation performance statistics
 */
export interface IndexGenerationStats {
	/** Total generation time in milliseconds */
	totalTime: number;

	/** Content extraction time */
	extractionTime: number;

	/** Keyword enrichment time */
	enrichmentTime: number;

	/** Lunr.js index build time */
	indexBuildTime: number;

	/** File writing time */
	writeTime: number;

	/** Average processing time per item */
	avgTimePerItem: number;

	/** Memory usage peak */
	memoryUsage?: {
		heapUsed: number;
		heapTotal: number;
		external: number;
	};
}

/**
 * Search index validation result
 */
export interface SearchIndexValidation {
	/** Validation success */
	isValid: boolean;

	/** Validation errors */
	errors: string[];

	/** Validation warnings */
	warnings: string[];

	/** Validation statistics */
	stats: {
		totalItems: number;
		itemsWithNavigation: number;
		itemsWithContent: number;
		itemsWithKeywords: number;
		duplicateIds: string[];
		missingRequiredFields: string[];
	};
}
