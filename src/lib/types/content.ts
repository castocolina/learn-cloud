/**
 * Content Type Definitions for Cloud-Native Learning Platform
 *
 * This module defines all content-related interfaces and types used throughout
 * the application. It integrates with the rich text system for secure content
 * display and follows union-first patterns for type safety.
 *
 * Synthesizes foundational types from feature/spa branch with current
 * demo extensions and rich text integration from TASK 2B.
 */

import type {
	ContentStatus,
	ContentDifficulty,
	ChapterType,
	QuestionType,
	TechnologyUnit,
	MermaidDirection
} from "./types.js";
import type {
	RichParagraph,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	RichTextSection,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	RichTextDocument,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	SimpleRichText
} from "./rich-text.js";

/**
 * Base content interface with common properties and lifecycle tracking
 *
 * All content types extend this interface to ensure consistent metadata
 * and status tracking across the entire content system.
 */
export interface BaseContent {
	/** Content title */
	title: string;

	/** Brief content summary */
	summary: string;

	/** Content lifecycle status for maturity tracking */
	status?: ContentStatus;

	/** Unique content identifier */
	id?: string;

	/** Unit this content belongs to */
	unitId?: string;

	/** Chapter or section number */
	chapterNumber?: string;

	/** Content creation metadata */
	metadata?: ContentMetadata;
}

/**
 * Content metadata interface for tracking and management
 *
 * Provides comprehensive metadata for content organization,
 * authoring, and lifecycle management.
 */
export interface ContentMetadata {
	/** Unique content identifier */
	id: string;

	/** Unit identifier this content belongs to */
	unitId: string;

	/** Chapter or section number */
	chapterNumber: string;

	/** Content type for renderer selection */
	type: ChapterType;

	/** Technology unit for styling and organization */
	technologyUnit?: TechnologyUnit;

	/** Content difficulty level */
	difficulty?: ContentDifficulty;

	/** Estimated completion time in minutes */
	estimatedTime?: number;

	/** Content prerequisites */
	prerequisites?: string[];

	/** Learning objectives */
	learningObjectives?: string[];

	/** Content tags for categorization */
	tags?: string[];

	/** Content creation and modification tracking */
	timestamps?: {
		created?: Date;
		modified?: Date;
		published?: Date;
	};

	/** Author information */
	author?: string;

	/** Content version */
	version?: string;

	/** Content language */
	language?: string;
}

/**
 * Consolidated content section interface
 *
 * Used across all content types for consistent section structure
 * with rich text integration for secure content display.
 */
export interface ContentSection {
	/** Optional section title */
	title?: string;

	/** Rich text content blocks */
	content: ContentBlock[];

	/** Section identifier for navigation */
	id?: string;

	/** Section type for styling */
	type?: "introduction" | "main" | "conclusion" | "exercise" | "example";
}

/**
 * Content block union type for flexible content composition
 *
 * Supports various content types while maintaining type safety
 * and enabling rich content experiences.
 */
export type ContentBlock =
	| ParagraphBlock
	| ListBlock
	| CodeBlock
	| DiagramBlock
	| CalloutBlock
	| ImageBlock
	| VideoBlock
	| InteractiveBlock;

/**
 * Rich text paragraph block
 */
export interface ParagraphBlock {
	type: "paragraph";
	content: RichParagraph;
	id?: string;
	className?: string;
}

/**
 * List block for ordered and unordered lists
 */
export interface ListBlock {
	type: "list";
	ordered: boolean;
	items: string[];
	id?: string;
}

/**
 * Code block with syntax highlighting
 */
export interface CodeBlock {
	type: "code";
	language: string;
	code: string;
	title?: string;
	filename?: string;
	highlightLines?: number[];
	showLineNumbers?: boolean;
	id?: string;
}

/**
 * Diagram block with Mermaid integration
 */
export interface DiagramBlock {
	type: "diagram";
	diagramType: "mermaid" | "flowchart" | "sequence" | "gantt" | "gitgraph";
	definition: string;
	title?: string;
	caption?: string;
	direction?: MermaidDirection;
	id?: string;
}

/**
 * Callout block for highlighted information
 */
export interface CalloutBlock {
	type: "callout";
	calloutType: "info" | "warning" | "danger" | "success" | "tip";
	title?: string;
	content: RichParagraph;
	id?: string;
}

/**
 * Image block for visual content
 */
export interface ImageBlock {
	type: "image";
	src: string;
	alt: string;
	caption?: string;
	width?: number;
	height?: number;
	id?: string;
}

/**
 * Video track for captions/subtitles (accessibility)
 */
export interface VideoTrack {
	src: string;
	kind: "captions" | "subtitles" | "descriptions" | "chapters" | "metadata";
	srclang: string;
	label: string;
	default?: boolean;
}

/**
 * Video block for multimedia content
 */
export interface VideoBlock {
	type: "video";
	src: string;
	poster?: string;
	caption?: string;
	controls?: boolean;
	autoplay?: boolean;
	tracks?: VideoTrack[];
	id?: string;
}

/**
 * Interactive block for embedded components
 */
export interface InteractiveBlock {
	type: "interactive";
	component: string;
	props?: Record<string, unknown>;
	title?: string;
	description?: string;
	id?: string;
}

/**
 * Lesson content interface
 */
export interface LessonContent extends BaseContent {
	type: "lesson";
	sections: ContentSection[];
	prerequisites?: string[];
	estimatedTime?: number;
	learningObjectives?: string[];
	difficulty?: ContentDifficulty;
	technologyUnit?: TechnologyUnit;
}

/**
 * Overview content interface
 * Used for book overview and unit overview pages
 */
export interface OverviewContent extends BaseContent {
	type: "overview";
	sections: ContentSection[];
	prerequisites?: string[];
	estimatedTime?: number;
	learningObjectives?: string[];
	difficulty?: ContentDifficulty;
	technologyUnit?: TechnologyUnit;
}

/**
 * Quiz content interface
 */
export interface QuizContent extends BaseContent {
	type: "quiz";
	quiz: Quiz;
	relatedLesson?: string;
	passingScore?: number;
}

/**
 * Study guide content interface
 */
export interface StudyGuideContent extends BaseContent {
	type: "study_guide";
	studyGuide: StudyGuide;
	relatedLessons?: string[];
}

/**
 * Exam content interface
 */
export interface ExamContent extends BaseContent {
	type: "exam";
	exam: Exam;
	duration?: number;
	passingScore?: number;
	prerequisites?: string[];
}

/**
 * Project content interface
 */
export interface ProjectContent extends BaseContent {
	type: "project";
	sections: ContentSection[];
	requirements: string[];
	deliverables: string[];
	estimatedHours: number;
	difficulty?: ContentDifficulty;
	technologies?: string[];
	technologyUnit?: TechnologyUnit;
}

/**
 * Quiz interface with comprehensive question support
 */
export interface Quiz {
	description?: string;
	passingScore: number;
	timeLimit?: number;
	questions: AnyQuestion[];
	randomizeQuestions?: boolean;
	showResults?: boolean;
}

/**
 * Exam interface for formal assessments
 */
export interface Exam {
	description?: string;
	instructions?: RichParagraph;
	passingScore: number;
	timeLimit?: number;
	questions: AnyQuestion[];
	randomizeQuestions?: boolean;
	questionsToShow?: number;
	showResults?: boolean;
}

/**
 * Study guide interface with flashcard system
 */
export interface StudyGuide {
	description?: string;
	flashcards: Flashcard[];
	categories?: string[];
	randomizeCards?: boolean;
}

/**
 * Question interface supporting multiple question types
 */
export interface Question {
	id: string;
	type: QuestionType;
	question: string;
	points?: number;
	explanation?: string;
	tags?: string[];
	difficulty?: ContentDifficulty;
}

/**
 * Single choice question
 */
export interface SingleChoiceQuestion extends Question {
	type: "single_choice";
	options: string[];
	correct: number;
}

/**
 * Multiple choice question
 */
export interface MultipleChoiceQuestion extends Question {
	type: "multiple_choice";
	options: string[];
	correct: number[];
}

/**
 * Code completion question with underscore patterns
 */
export interface CodeCompletionQuestion extends Question {
	type: "code_completion";
	codeSnippet: string;
	blanks: CodeBlank[];
	correctAnswers: Record<string, string>;
}

/**
 * Code blank for code completion questions
 */
export interface CodeBlank {
	id: string;
	options: string[];
}

/**
 * True/false question
 */
export interface TrueFalseQuestion extends Question {
	type: "true_false";
	correct: boolean;
}

/**
 * Short answer question
 */
export interface ShortAnswerQuestion extends Question {
	type: "short_answer";
	acceptedAnswers: string[];
	caseSensitive?: boolean;
}

/**
 * Drag and drop question with matching items to targets
 */
export interface DragAndDropQuestion extends Question {
	/** Question type discriminator */
	type: "drag_and_drop";

	/** Items to be dragged */
	items: Array<{
		id: string;
		content: string;
		category: string;
	}>;

	/** Drop targets */
	targets: Array<{
		id: string;
		label: string;
		acceptsItems: string[]; // Array of item IDs that belong in this target
	}>;

	/** Correct matches between items and targets */
	correctMatches: Array<{
		itemId: string;
		targetId: string;
	}>;
}

/**
 * Union type for all question types
 */
export type AnyQuestion =
	| SingleChoiceQuestion
	| MultipleChoiceQuestion
	| CodeCompletionQuestion
	| TrueFalseQuestion
	| ShortAnswerQuestion
	| DragAndDropQuestion;

/**
 * Flashcard interface for study guides
 */
export interface Flashcard {
	id: string;
	front: string;
	back: string;
	tags?: string[];
	category?: string;
	difficulty?: ContentDifficulty;
	lastReviewed?: Date;
	reviewCount?: number;
}

/**
 * Content validation interface
 */
export interface ContentValidation {
	isValid: boolean;
	errors: string[];
	warnings: string[];
	suggestions: string[];
	contentType?: ChapterType;
}

/**
 * Content Renderer Props Interface
 *
 * Standardized props interface for all content renderer components.
 * Used by type-specific renderers (Overview, Lesson, StudyGuide, Quiz, Exam, Project).
 *
 * Architecture:
 * - Type-safe union type (AnyContent) ensures correct content structure
 * - Renderers use discriminated union to handle specific content types
 * - Consistent props across all renderer components
 *
 * @see components/renderers/LessonRenderer.svelte
 * @see components/renderers/QuizRenderer.svelte
 * @see types/index.ts - AnyContent union type definition
 */
export interface ContentRendererProps {
	/** Content object to render (type-safe union of all content types) */
	content: BaseContent;
}

/**
 * Rich Text Viewer Props Interface (Task 7)
 *
 * Generic renderer for ContentBlock union types with type-safe delegation
 * to specialized components.
 *
 * Supported Block Types:
 * - ParagraphBlock: Rich text paragraphs with inline formatting
 * - CodeBlock: Syntax-highlighted code (placeholder for Task 8F)
 * - DiagramBlock: Mermaid diagrams (placeholder for Task 8G)
 * - CalloutBlock: Highlighted information boxes
 * - ImageBlock: Images with captions
 * - VideoBlock: Video embeds with controls
 * - InteractiveBlock: Embedded interactive components
 *
 * Architecture:
 * - Uses type guards for safe block type discrimination
 * - Centralized CSS in src/styles/components.css
 *
 * @see components/renderers/RichTextViewer.svelte
 * @see ContentBlock union type definition (lines 139-146)
 */
export interface RichTextViewerProps {
	/** Array of content blocks to render */
	blocks: ContentBlock[];
	/** Optional CSS class for custom styling */
	class?: string;
}
