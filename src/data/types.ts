/**
 * TypeScript interfaces for content structure with inheritance
 * Following SvelteKit and cloud-native learning platform standards
 */

/**
 * Content lifecycle status tracking for content maturity management
 */
export enum ContentStatus {
  SCAFFOLD = 'scaffold',
  DRAFT = 'draft',
  FINAL = 'final'
}

/**
 * Content difficulty levels for educational content classification
 */
export enum ContentDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

/**
 * Mermaid diagram direction options for visual flow representation
 */
export enum MermaidDirection {
  TB = 'TB', // Top-Bottom
  LR = 'LR', // Left-Right
  BT = 'BT', // Bottom-Top
  RL = 'RL'  // Right-Left
}

/**
 * Content types for menu chapters - ensures type safety for chapter types
 */
export enum ChapterType {
  LESSON = 'lesson',
  STUDY_GUIDE = 'study_guide',
  QUIZ = 'quiz',
  EXAM = 'exam',
  PROJECT = 'project'
}

/**
 * Callout types for important notes and warnings
 */
export enum CalloutType {
  INFO = 'info',
  WARNING = 'warning',
  DANGER = 'danger',
  SUCCESS = 'success'
}

/**
 * Diagram types for visual representations
 */
export enum DiagramType {
  MERMAID = 'mermaid',
  FLOWCHART = 'flowchart',
  SEQUENCE = 'sequence',
  GANTT = 'gantt',
  GITGRAPH = 'gitgraph'
}

// Type aliases for string literal unions that match enum values
export type ChapterTypeValue = `${ChapterType}`;
export type CalloutTypeValue = `${CalloutType}`;
export type DiagramTypeValue = `${DiagramType}`;

// Base interface - common fields for all content types
export interface BaseContent {
	title: string;
	summary: string;
	status?: ContentStatus; // Track content maturity from scaffold to final (optional during migration)
}

/**
 * FLEXIBLE CONTENT BLOCK SYSTEM
 *
 * This system supports narrative-driven content composition where text, code,
 * diagrams, and callouts can be interleaved freely within sections.
 *
 * Each content block has a 'type' discriminator enabling polymorphic behavior
 * and type-safe rendering based on block type.
 */

// Individual content block types with discriminated union pattern

/**
 * Text content block for paragraphs and rich HTML content
 */
export interface ParagraphBlock {
	type: 'paragraph';
	content: string; // HTML content with proper formatting
}

/**
 * Code block for syntax-highlighted code examples
 *
 * MIGRATION NOTE: The 'type' field is optional for backward compatibility.
 * New content should always include type: 'code'.
 */
export interface CodeBlock {
	type?: 'code'; // Optional during migration for backward compatibility
	language: string;
	code: string;
	title?: string;
	filename?: string;
	highlight?: number[]; // Line numbers to highlight
}

/**
 * Diagram block for visual representations (Mermaid, flowcharts, etc.)
 */
export interface DiagramBlock {
	type: 'diagram';
	diagramType: DiagramType | DiagramTypeValue;
	definition: string;
	title?: string;
	caption?: string;
	direction?: MermaidDirection; // Type-safe diagram orientation
}

/**
 * Callout block for important notes, warnings, and highlighted information
 */
export interface CalloutBlock {
	/**
	 * Callout block for important notes, warnings, and highlighted information
	 *
	 * Uses CalloutType enum for strict type safety (no string literals allowed)
	 */
	type: 'callout';
	calloutType: CalloutType;
	title?: string;
	content: string;
}

/**
 * Polymorphic content block union type
 *
 * This discriminated union allows sections to contain any combination
 * of content types in any order, enabling flexible narrative flow.
 */
export type ContentBlock = ParagraphBlock | CodeBlock | DiagramBlock | CalloutBlock;

/**
 * Type guard functions for content block discrimination
 */
export function isParagraphBlock(block: ContentBlock): block is ParagraphBlock {
	return block.type === 'paragraph';
}

export function isCodeBlock(block: ContentBlock): block is CodeBlock {
	return block.type === 'code';
}

export function isDiagramBlock(block: ContentBlock): block is DiagramBlock {
	return block.type === 'diagram';
}

export function isCalloutBlock(block: ContentBlock): block is CalloutBlock {
	return block.type === 'callout';
}

/**
 * BACKWARD COMPATIBILITY EXPORTS
 *
 * These maintain compatibility with existing content files during migration.
 * Remove after all content has been migrated to the new flexible structure.
 */

// Legacy Diagram interface for backward compatibility
export interface Diagram {
	type: DiagramType | DiagramTypeValue;
	definition: string;
	title?: string;
	caption?: string;
	direction?: MermaidDirection;
}

// Quiz question interface
export interface QuizQuestion {
	question: string;
	options: string[];
	correct: number | number[]; // Single choice (number) or multiple choice (array)
	explanation?: string;
	difficulty?: ContentDifficulty;
	topic?: string;
}

// Quiz interface
export interface Quiz {
	questions: QuizQuestion[];
	passingScore: number; // Percentage required to pass (e.g., 80)
	timeLimit?: number; // Minutes
	shuffleQuestions?: boolean;
	shuffleOptions?: boolean;
}

// Flashcard interface for study guides
export interface Flashcard {
	front: string;
	back: string;
	tags?: string[];
	difficulty?: ContentDifficulty;
}

// Study guide interface
export interface StudyGuide {
	flashcards: Flashcard[];
	minimumCards: number; // Minimum cards required (e.g., 6)
	description?: string;
}

/**
 * Consolidated section interface supporting narrative-driven composition
 *
 * This is the single, canonical interface for all content sections.
 * Uses polymorphic content blocks for flexible, narrative-driven content composition.
 *
 * ```typescript
 * {
 *   title: "Getting Started",
 *   content: [
 *     { type: 'paragraph', content: 'Introduction text...' },
 *     { type: 'code', language: 'typescript', code: '...' },
 *     { type: 'diagram', diagramType: 'mermaid', definition: '...' }
 *   ]
 * }
 * ```
 */
export interface ContentSection {
	title?: string;
	content: ContentBlock[];
}

// Specific content type interfaces extending BaseContent
export interface LessonContent extends BaseContent {
	type: "lesson";
	sections: ContentSection[]; // Updated to use consolidated sections
	prerequisites?: string[];
	estimatedTime?: number; // Minutes
	learningObjectives?: string[];
}

export interface QuizContent extends BaseContent {
	type: "quiz";
	quiz: Quiz;
	relatedLesson?: string; // Reference to lesson ID
}

export interface StudyGuideContent extends BaseContent {
	type: "study_guide";
	studyGuide: StudyGuide;
	relatedLesson?: string; // Reference to lesson ID
}

export interface ExamContent extends BaseContent {
	type: "exam";
	exam: Quiz; // Same structure as quiz but different context
	coverage: string[]; // Topics covered in the exam
	instructions?: string;
}

export interface ProjectContent extends BaseContent {
	type: "project";
	sections: ContentSection[]; // Updated to use consolidated sections
	requirements: string[];
	deliverables: string[];
	estimatedHours: number;
	difficulty?: ContentDifficulty;
	technologies?: string[];
}

// Union type for all content types - ensures type safety
export type ContentData =
	| LessonContent
	| QuizContent
	| StudyGuideContent
	| ExamContent
	| ProjectContent;

// Type guard helper functions for runtime type checking
export function isLessonContent(content: ContentData): content is LessonContent {
	return content.type === "lesson";
}

export function isQuizContent(content: ContentData): content is QuizContent {
	return content.type === "quiz";
}

export function isStudyGuideContent(content: ContentData): content is StudyGuideContent {
	return content.type === "study_guide";
}

export function isExamContent(content: ContentData): content is ExamContent {
	return content.type === "exam";
}

export function isProjectContent(content: ContentData): content is ProjectContent {
	return content.type === "project";
}

// Utility type to extract content type from union
export type ContentType = ContentData["type"];

// Interface for content loading metadata
export interface ContentMetadata {
	id: string;
	unitId: string;
	chapterNumber: string;
	type: ContentType;
	lastModified?: Date;
	author?: string;
	version?: string;
}

// Complete content interface with metadata
export interface ContentWithMetadata {
	metadata: ContentMetadata;
	content: ContentData;
}

// Helper function to create content with metadata
export function createContentWithMetadata(
	metadata: ContentMetadata,
	content: ContentData
): ContentWithMetadata {
	return { metadata, content };
}

// Content menu structure interfaces
export interface ContentMenuChapter {
	/**
	 * Content menu chapter interface with improved type safety
	 *
	 * Uses ChapterType enum for strict type checking (no string literals allowed)
	 */
	title: string;
	icon: string;
	type: ChapterType;
	chapter_link: string;
	chapter_data: string;
}

export interface ContentMenuUnit {
	title: string;
	icon: string;
	unit_link: string;
	unit_data: string;
	chapters: ContentMenuChapter[];
}

export interface ContentMenuMetadata {
	generated_by: string;
	source: string;
	version: string;
	title: string;
	description: string;
	total_units: number;
	total_chapters: number;
}

export interface ContentMenu {
	metadata: ContentMenuMetadata;
	units: ContentMenuUnit[];
}
