/**
 * Centralized Type System Exports
 *
 * This file provides a single entry point for all type definitions in the
 * Cloud-Native Learning Platform. It re-exports all types from domain-specific
 * modules to enable consistent imports throughout the application.
 *
 * Usage:
 * import type { ContentType, NavigationItem, RichParagraph } from '$lib/types';
 *
 * Following SvelteKit 2024 conventions and union-first design patterns.
 */

// Union Type exports - All project union types consolidated for zero runtime overhead
export type {
	ContentStatus,
	ContentDifficulty,
	ChapterType,
	ContentType,
	NavigationSection,
	ComponentState,
	ProgressStatus,
	MermaidDirection,
	QuestionType,
	TechnologyUnit,
	ThemeMode,
	ProgrammingLanguage,
	EducationalCategory,
	MermaidDiagramType,
	EducationalResourceType,
	BreadcrumbType,
	FontSize,
	AspectRatio,
	Layout,
	CardStyle
} from "./types.js";

// Union type constants - For iteration and Object.values() replacement
export { CONTENT_DIFFICULTIES, CHAPTER_TYPES, QUESTION_TYPES, CONTENT_TYPES } from "./types.js";

// Rich text exports - Structured content system
export type {
	RichTextFragment,
	RichParagraph,
	RichTextSection,
	RichTextDocument,
	SimpleRichText,
	RichTextValidation
} from "./rich-text.js";

// Content exports - All content-related interfaces
export type {
	BaseContent,
	ContentMetadata,
	ContentSection,
	ContentBlock,
	ParagraphBlock,
	CodeBlock,
	DiagramBlock,
	CalloutBlock,
	ImageBlock,
	VideoBlock,
	InteractiveBlock,
	LessonContent,
	QuizContent,
	StudyGuideContent,
	ExamContent,
	ProjectContent,
	Quiz,
	Exam,
	StudyGuide,
	Question,
	SingleChoiceQuestion,
	MultipleChoiceQuestion,
	CodeCompletionQuestion,
	CodeBlank,
	TrueFalseQuestion,
	ShortAnswerQuestion,
	DragAndDropQuestion,
	Flashcard,
	ContentValidation
} from "./content.js";

// Navigation exports - Unified navigation architecture
export type {
	NavigationItem,
	NavigationItemMetadata,
	FlatNavEntry,
	FlatNavStructure,
	BreadcrumbItem,
	BreadcrumbPath,
	BreadcrumbIcon,
	MenuStructure,
	MenuUnit,
	MenuChapter,
	NavigationContext,
	RouteInfo,
	NavigationEvent,
	UnifiedPathConfig,
	NavigationPaths,
	ParsedNavigation
} from "./navigation.js";

// Search exports - Enhanced search with navigation integration
export type {
	SearchCategory,
	SearchableItem,
	SearchNavigationMetadata,
	SearchFilters,
	SearchResult,
	SearchState,
	SearchOptions,
	SearchAnalytics
} from "./search.js";

// Interactive learning exports - Educational components and configuration
export type {
	InteractiveAnimation,
	InteractiveConfiguration,
	LearningProgress as InteractiveLearningProgress,
	EducationalMetadata,
	FlipCard,
	QuizTiming,
	QuizScoring,
	QuizProgressTracking,
	AccessibilityConfiguration,
	QuizConfiguration,
	InteractiveQuestion
} from "./interactive.js";

// Educational content exports - Learning materials and examples
export type {
	CodeExample,
	MermaidDiagram,
	EducationalLesson,
	LearningPath
} from "./educational.js";

// Learning management exports - Analytics and progress tracking
export type {
	LearningStyle,
	LearningPace,
	MasteryLevel,
	AssessmentType,
	LearningEventType,
	LearnerProfile,
	SkillCompetency,
	LearningProgress,
	LearningEvent,
	LearningRecommendation,
	LearningAchievement
} from "./learning.js";

// Configuration exports - Application settings and validation
export type { AppSettings } from "./config.js";

/**
 * Common type utilities for the application
 */

// Import types for utility type definitions
import type {
	LessonContent,
	QuizContent,
	StudyGuideContent,
	ExamContent,
	ProjectContent,
	SingleChoiceQuestion,
	MultipleChoiceQuestion,
	CodeCompletionQuestion,
	TrueFalseQuestion,
	ShortAnswerQuestion,
	DragAndDropQuestion,
	BaseContent
} from "./content.js";
import type { RichTextFragment, RichParagraph } from "./rich-text.js";
import type { NavigationItem } from "./navigation.js";
import type { SearchableItem } from "./search.js";

/**
 * Union type of all content interfaces
 */
export type AnyContent =
	| LessonContent
	| QuizContent
	| StudyGuideContent
	| ExamContent
	| ProjectContent;

/**
 * Union type of all question interfaces
 */
export type AnyQuestion =
	| SingleChoiceQuestion
	| MultipleChoiceQuestion
	| CodeCompletionQuestion
	| TrueFalseQuestion
	| ShortAnswerQuestion
	| DragAndDropQuestion;

/**
 * Content type discriminator utility
 */
export type ContentTypeMap = {
	lesson: LessonContent;
	quiz: QuizContent;
	study_guide: StudyGuideContent;
	exam: ExamContent;
	project: ProjectContent;
};

/**
 * Navigation item type guards for type checking
 */
export function isNavigationItem(obj: unknown): obj is NavigationItem {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"id" in obj &&
		"title" in obj &&
		"section" in obj &&
		"state" in obj &&
		"path" in obj
	);
}

/**
 * Content type guards for type checking
 */
export function isBaseContent(obj: unknown): obj is BaseContent {
	return typeof obj === "object" && obj !== null && "title" in obj && "summary" in obj;
}

export function isLessonContent(obj: unknown): obj is LessonContent {
	return (
		isBaseContent(obj) &&
		"type" in obj &&
		(obj as { type: string }).type === "lesson" &&
		"sections" in obj
	);
}

export function isQuizContent(obj: unknown): obj is QuizContent {
	return (
		isBaseContent(obj) &&
		"type" in obj &&
		(obj as { type: string }).type === "quiz" &&
		"quiz" in obj
	);
}

/**
 * Rich text type guards
 */
export function isRichTextFragment(obj: unknown): obj is RichTextFragment {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"text" in obj &&
		typeof (obj as { text: unknown }).text === "string"
	);
}

export function isRichParagraph(obj: unknown): obj is RichParagraph {
	return Array.isArray(obj) && obj.every(isRichTextFragment);
}

/**
 * Search type guards
 */
export function isSearchableItem(obj: unknown): obj is SearchableItem {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"id" in obj &&
		"title" in obj &&
		"description" in obj &&
		"content" in obj &&
		"type" in obj &&
		"nav" in obj
	);
}

/**
 * Interactive learning type guards
 */
export { isFlipCard, isQuizConfiguration, isInteractiveQuestion } from "./interactive.js";

/**
 * Educational content type guards
 */
export {
	isCodeExample,
	isMermaidDiagram,
	isEducationalLesson,
	isLearningPath
} from "./educational.js";

/**
 * Learning management type guards
 */
export {
	isLearnerProfile,
	isSkillCompetency,
	isLearningProgress,
	isLearningEvent
} from "./learning.js";

// Validation exports - Testing and validation utilities
export type { ValidationOptions, ValidationResult } from "./validation.js";

/**
 * Configuration type guards
 */
export { isAppSettings, isMermaidConfig, isUIConfig, isContentGenerationConfig } from "./config.js";
