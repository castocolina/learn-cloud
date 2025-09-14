/**
 * TypeScript interfaces for content structure with inheritance
 * Following SvelteKit and cloud-native learning platform standards
 */

// Base interface - common fields for all content types
export interface BaseContent {
	title: string;
	summary: string;
}

// Code block interface for syntax highlighting
export interface CodeBlock {
	language: string;
	code: string;
	title?: string;
	filename?: string;
	highlight?: number[]; // Line numbers to highlight
}

// Diagram interface for Mermaid diagrams
export interface Diagram {
	type: "mermaid" | "flowchart" | "sequence" | "gantt" | "gitgraph";
	definition: string;
	title?: string;
	caption?: string;
	direction?: "TD" | "LR" | "BT" | "RL"; // Top-Down, Left-Right, etc.
}

// Quiz question interface
export interface QuizQuestion {
	question: string;
	options: string[];
	correct: number | number[]; // Single choice (number) or multiple choice (array)
	explanation?: string;
	difficulty?: "easy" | "medium" | "hard";
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
	difficulty?: "easy" | "medium" | "hard";
}

// Study guide interface
export interface StudyGuide {
	flashcards: Flashcard[];
	minimumCards: number; // Minimum cards required (e.g., 6)
	description?: string;
}

// Content section interface for lessons
export interface ContentSection {
	heading: string;
	paragraphs: string[]; // Array of HTML strings
	codeBlocks?: CodeBlock[];
	diagrams?: Diagram[];
	callouts?: Array<{
		type: "info" | "warning" | "danger" | "success";
		title?: string;
		content: string;
	}>;
}

// Specific content type interfaces extending BaseContent
export interface LessonContent extends BaseContent {
	type: "lesson";
	sections: ContentSection[];
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
	sections: ContentSection[];
	requirements: string[];
	deliverables: string[];
	estimatedHours: number;
	difficulty?: "beginner" | "intermediate" | "advanced";
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
	title: string;
	icon: string;
	type: "lesson" | "study_guide" | "quiz" | "exam" | "project";
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
