/**
 * Educational Content Validation Schemas
 *
 * This module provides Zod schema definitions for educational content types
 * in the Cloud-Native Learning Platform. These schemas validate user-created
 * content (lessons, quizzes, study guides, etc.) at runtime.
 *
 * Purpose:
 * - User content validation (via content-schemas.json)
 * - Runtime validation in ValidationService
 * - Type safety for educational content structures
 *
 * Features:
 * - Rich text and content block validation
 * - Question type validation (quiz, exam)
 * - Interactive component validation (FlipCard)
 * - Content metadata and structure validation
 *
 * Note: Internal CLI schemas (scaffolding, navigation, search) are defined
 * locally in their respective scripts, not in this file.
 */

import { z } from "zod";
import {
	DIFFICULTY_LEVELS,
	CHAPTER_TYPES,
	TEXT_STYLES,
	LINK_TARGETS,
	CALLOUT_STYLES,
	PROJECT_RESOURCE_TYPES,
	FLIPCARD_RESOURCE_TYPES
} from "$types";

/**
 * Reusable Centralized Schemas
 * - Single source of truth for all enum validation
 * - Matches type definitions from types.ts
 * - Eliminates hardcoded values in validation schemas
 * - Future-proof: adding/removing values only requires changing types.ts
 */

/** Difficulty level schema - used across all educational content */
export const DifficultyLevelSchema = z.enum(DIFFICULTY_LEVELS as [string, ...string[]]);

/** Chapter type schema - used in content metadata and navigation */
export const ChapterTypeSchema = z.enum(CHAPTER_TYPES as [string, ...string[]]);

/** Text style schema - used in rich text nodes */
export const TextStyleSchema = z.enum(TEXT_STYLES as [string, ...string[]]);

/** Link target schema - used in hyperlink nodes */
export const LinkTargetSchema = z.enum(LINK_TARGETS as [string, ...string[]]);

/** Callout style schema - used in callout blocks */
export const CalloutStyleSchema = z.enum(CALLOUT_STYLES as [string, ...string[]]);

/** Project resource type schema - used in project deliverables */
export const ProjectResourceTypeSchema = z.enum(PROJECT_RESOURCE_TYPES as [string, ...string[]]);

/** FlipCard resource type schema - used in study guide additional resources */
export const FlipCardResourceTypeSchema = z.enum(FLIPCARD_RESOURCE_TYPES as [string, ...string[]]);

/**
 * Base content validation schemas
 */

// ============================================================================
// RICH TEXT SCHEMAS (TASK 7B: Union-based architecture)
// ============================================================================

/**
 * Base rich text node schema - shared properties
 */
export const BaseRichTextNodeSchema = z.object({
	content: z.string().min(1, "Content cannot be empty"),
	styles: z.array(TextStyleSchema).optional(),
	color: z.string().optional(),
	highlight: z.string().optional(),
	className: z.string().optional(),
	ariaLabel: z.string().optional()
});

/**
 * Text node schema - plain or formatted text
 */
export const TextNodeSchema = BaseRichTextNodeSchema.extend({
	type: z.literal("text")
});

/**
 * Link node schema - hyperlinks with auto-detection
 */
export const LinkNodeSchema = BaseRichTextNodeSchema.extend({
	type: z.literal("link"),
	href: z.string().min(1, "Link href is required"),
	target: LinkTargetSchema.optional()
});

/**
 * Heading node schema - semantic headings
 */
export const HeadingNodeSchema = BaseRichTextNodeSchema.extend({
	type: z.literal("heading"),
	level: z.union([
		z.literal(1),
		z.literal(2),
		z.literal(3),
		z.literal(4),
		z.literal(5),
		z.literal(6)
	])
});

/**
 * Rich text node schema - discriminated union
 */
export const RichTextNodeSchema = z.discriminatedUnion("type", [
	TextNodeSchema,
	LinkNodeSchema,
	HeadingNodeSchema
]);

/**
 * Rich paragraph schema - array of rich text nodes
 */
export const RichParagraphSchema = z
	.array(RichTextNodeSchema)
	.min(1, "Paragraph must contain at least one node");

export const RichTextSectionSchema = z.object({
	title: z.string().min(1, "Section title is required"),
	content: z.array(RichParagraphSchema).min(1, "Section must have content")
});

export const RichTextDocumentSchema = z.object({
	title: z.string().min(1, "Document title is required"),
	sections: z.array(RichTextSectionSchema).min(1, "Document must have at least one section")
});

/**
 * Educational fields schema - Root-level educational metadata
 *
 * These fields appear at root level on all content types (not nested).
 * Matches EducationalContent interface from content.ts
 */
export const EducationalFieldsSchema = z.object({
	difficulty: DifficultyLevelSchema.optional(),
	estimatedTime: z.number().int().min(1, "Estimated time must be positive").optional(),
	prerequisites: z.array(z.string()).optional(),
	learningObjectives: z.array(z.string()).optional(),
	keywords: z
		.array(z.string())
		.min(3, "Minimum 3 keywords required for search functionality")
		.max(20, "Too many keywords")
		.optional(),
	tags: z.array(z.string()).optional(),
	technologyUnit: z.string().optional()
});

/**
 * Navigation metadata schema - Optional navigation context
 *
 * Contains ONLY navigation-related fields. Used optionally for
 * breadcrumbs, sidebar state, etc. Most content relies on root-level fields.
 */
export const NavigationMetadataSchema = z.object({
	id: z.string().min(1, "ID is required"),
	unitId: z.string().min(1, "Unit ID is required"),
	chapterNumber: z.string().min(1, "Chapter number is required"),
	type: ChapterTypeSchema,
	timestamps: z
		.object({
			created: z.date().optional(),
			modified: z.date().optional(),
			published: z.date().optional()
		})
		.optional(),
	author: z.string().optional(),
	version: z.string().optional(),
	language: z.string().optional()
});

// Base content schema with root-level educational fields
export const BaseContentSchema = z
	.object({
		id: z.string().min(1, "ID is required"),
		type: ChapterTypeSchema,
		title: z.string().min(1, "Title is required"),
		summary: z.string().min(10, "Summary is required and must be descriptive"),
		metadata: NavigationMetadataSchema.optional()
	})
	.extend(EducationalFieldsSchema.shape);

/**
 * Content block schemas
 */

export const ParagraphBlockSchema = z.object({
	type: z.literal("paragraph"),
	content: RichParagraphSchema
});

export const CodeBlockSchema = z.object({
	type: z.literal("code"),
	language: z.string().min(1, "Programming language is required"),
	code: z.string().min(1, "Code content is required"),
	title: z.string().optional(),
	description: z.string().optional(),
	filename: z.string().optional()
});

export const DiagramBlockSchema = z.object({
	type: z.literal("diagram"),
	diagramType: z.enum(["mermaid", "flowchart", "sequence", "class", "er", "state", "gantt"]),
	definition: z.string().min(1, "Diagram definition is required"),
	title: z.string().optional(),
	caption: z.string().optional()
});

export const CalloutBlockSchema = z.object({
	type: z.literal("callout"),
	style: CalloutStyleSchema,
	title: z.string().optional(),
	content: RichParagraphSchema
});

export const ImageBlockSchema = z.object({
	type: z.literal("image"),
	src: z.url({ message: "Invalid image URL" }),
	alt: z.string().min(1, "Alt text is required for accessibility"),
	title: z.string().optional(),
	caption: z.string().optional(),
	width: z.number().int().positive().optional(),
	height: z.number().int().positive().optional()
});

export const VideoBlockSchema = z.object({
	type: z.literal("video"),
	src: z.url({ message: "Invalid video URL" }),
	title: z.string().min(1, "Video title is required"),
	description: z.string().optional(),
	duration: z.number().positive().optional(),
	transcript: z.string().optional()
});

export const InteractiveBlockSchema = z.object({
	type: z.literal("interactive"),
	title: z.string().min(1, "Interactive title is required"),
	description: z.string().optional(),
	config: z.record(z.string(), z.unknown()) // Flexible config object
});

export const ContentBlockSchema = z.discriminatedUnion("type", [
	ParagraphBlockSchema,
	CodeBlockSchema,
	DiagramBlockSchema,
	CalloutBlockSchema,
	ImageBlockSchema,
	VideoBlockSchema,
	InteractiveBlockSchema
]);

export const ContentSectionSchema = z.object({
	id: z.string().min(1, "Section ID is required"),
	title: z.string().min(1, "Section title is required"),
	content: z.array(ContentBlockSchema).min(1, "Section must have content"),
	learningObjectives: z.array(z.string()).optional()
});

/**
 * Question schemas for quizzes and exams
 */

export const SingleChoiceQuestionSchema = z
	.object({
		type: z.literal("single_choice"),
		id: z.string().min(1, "Question ID is required"),
		question: z.string().min(1, "Question text is required"),
		options: z.array(z.string()).min(2, "At least 2 options required").max(6, "Too many options"),
		correctAnswer: z.number().int().min(0, "Correct answer index invalid"),
		explanation: z.string().min(1, "Explanation is required"),
		difficulty: DifficultyLevelSchema,
		tags: z.array(z.string()).min(1, "Tags required for search functionality")
	})
	.refine((data) => data.correctAnswer < data.options.length, {
		message: "Correct answer index out of range",
		path: ["correctAnswer"]
	});

export const MultipleChoiceQuestionSchema = z
	.object({
		type: z.literal("multiple_choice"),
		id: z.string().min(1, "Question ID is required"),
		question: z.string().min(1, "Question text is required"),
		options: z.array(z.string()).min(3, "At least 3 options required").max(8, "Too many options"),
		correctAnswers: z.array(z.number().int().min(0)).min(2, "At least 2 correct answers required"),
		explanation: z.string().min(1, "Explanation is required"),
		difficulty: DifficultyLevelSchema,
		tags: z.array(z.string()).min(1, "Tags required for search functionality")
	})
	.refine((data) => data.correctAnswers.every((idx) => idx < data.options.length), {
		message: "Correct answer index out of range",
		path: ["correctAnswers"]
	});

export const CodeCompletionQuestionSchema = z.object({
	type: z.literal("code_completion"),
	id: z.string().min(1, "Question ID is required"),
	question: z.string().min(1, "Question text is required"),
	language: z.string().min(1, "Programming language is required"),
	codeTemplate: z.string().min(1, "Code template is required"),
	blanks: z
		.array(
			z.object({
				id: z.string().min(1, "Blank ID is required"),
				expectedAnswer: z.string().min(1, "Expected answer is required"),
				hint: z.string().optional(),
				alternatives: z.array(z.string()).optional()
			})
		)
		.min(1, "At least one blank required"),
	explanation: z.string().min(1, "Explanation is required"),
	difficulty: DifficultyLevelSchema,
	tags: z.array(z.string()).min(1, "Tags required for search functionality")
});

export const TrueFalseQuestionSchema = z.object({
	type: z.literal("true_false"),
	id: z.string().min(1, "Question ID is required"),
	question: z.string().min(1, "Question text is required"),
	correctAnswer: z.boolean(),
	explanation: z.string().min(1, "Explanation is required"),
	difficulty: DifficultyLevelSchema,
	tags: z.array(z.string()).min(1, "Tags required for search functionality")
});

export const ShortAnswerQuestionSchema = z.object({
	type: z.literal("short_answer"),
	id: z.string().min(1, "Question ID is required"),
	question: z.string().min(1, "Question text is required"),
	expectedAnswer: z.string().min(1, "Expected answer is required"),
	alternatives: z.array(z.string()).optional(),
	caseSensitive: z.boolean().default(false),
	explanation: z.string().min(1, "Explanation is required"),
	difficulty: DifficultyLevelSchema,
	tags: z.array(z.string()).min(1, "Tags required for search functionality")
});

export const DragAndDropQuestionSchema = z.object({
	type: z.literal("drag_and_drop"),
	id: z.string().min(1, "Question ID is required"),
	question: z.string().min(1, "Question text is required"),
	items: z
		.array(
			z.object({
				id: z.string().min(1, "Item ID is required"),
				content: z.string().min(1, "Item content is required"),
				category: z.string().min(1, "Item category is required")
			})
		)
		.min(4, "At least 4 items required"),
	categories: z
		.array(
			z.object({
				id: z.string().min(1, "Category ID is required"),
				title: z.string().min(1, "Category title is required"),
				description: z.string().optional()
			})
		)
		.min(2, "At least 2 categories required"),
	explanation: z.string().min(1, "Explanation is required"),
	difficulty: DifficultyLevelSchema,
	tags: z.array(z.string()).min(1, "Tags required for search functionality")
});

export const QuestionSchema = z.discriminatedUnion("type", [
	SingleChoiceQuestionSchema,
	MultipleChoiceQuestionSchema,
	CodeCompletionQuestionSchema,
	TrueFalseQuestionSchema,
	ShortAnswerQuestionSchema,
	DragAndDropQuestionSchema
]);

/**
 * FlipCard schema for study guides
 * Matches FlipCard interface from interactive.ts
 */

const EducationalMetadataSchema = z.object({
	learningObjectives: z.array(z.string()).optional(),
	prerequisites: z.array(z.string()).optional(),
	relatedConcepts: z.array(z.string()).optional(),
	estimatedTime: z.number().int().positive().optional(),
	difficulty: DifficultyLevelSchema.optional(),
	keywords: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
	additionalResources: z
		.array(
			z.object({
				title: z.string(),
				url: z.url(),
				type: FlipCardResourceTypeSchema,
				estimatedTime: z.number().int().positive().optional()
			})
		)
		.optional()
});

export const FlipCardSchema = z.object({
	id: z.string().min(1, "FlipCard ID is required"),
	front: z.string().min(1, "Front content is required"),
	back: z.string().min(1, "Back content is required"),
	category: z.string().optional(),
	education: EducationalMetadataSchema,
	animation: z.any().optional(),
	interaction: z.any().optional(),
	progress: z.any().optional(),
	display: z.any().optional()
});

/**
 * Content type schemas
 */

export const LessonContentSchema = BaseContentSchema.extend({
	type: z.literal("lesson"),
	sections: z.array(ContentSectionSchema).min(5, "Lesson must have at least 5 sections")
});

export const QuizContentSchema = BaseContentSchema.extend({
	type: z.literal("quiz"),
	quiz: z.object({
		timeLimit: z.number().int().positive().optional(),
		passingScore: z.number().min(0).max(100).default(70),
		shuffleQuestions: z.boolean().default(false),
		showResults: z.boolean().default(true),
		allowRetry: z.boolean().default(true),
		questions: z.array(QuestionSchema).min(10, "Quiz must have at least 10 questions")
	})
}).refine(
	(data) => {
		// Validate diversity of difficulty levels
		const difficulties = new Set(data.quiz.questions.map((q) => q.difficulty));
		return difficulties.size >= 2;
	},
	{
		message: "Quiz must include questions of at least 2 different difficulty levels",
		path: ["quiz", "questions"]
	}
);

export const StudyGuideContentSchema = BaseContentSchema.extend({
	type: z.literal("study_guide"),
	flipCards: z.array(FlipCardSchema).min(6, "Study guide must have at least 6 flip cards"),
	categories: z.array(z.string()).optional()
});

export const ExamContentSchema = BaseContentSchema.extend({
	type: z.literal("exam"),
	exam: z.object({
		timeLimit: z.number().int().positive(),
		passingScore: z.number().min(0).max(100).default(80),
		shuffleQuestions: z.boolean().default(true),
		showResults: z.boolean().default(false),
		allowRetry: z.boolean().default(false),
		questionsToShow: z.number().int().positive(),
		questions: z.array(QuestionSchema).min(35, "Exam must have at least 35 questions")
	})
})
	.refine((data) => data.exam.questions.length >= data.exam.questionsToShow, {
		message: "Not enough questions for the exam",
		path: ["exam", "questionsToShow"]
	})
	.refine(
		(data) => {
			// Validate diversity of difficulty levels (at least 3 levels for exams)
			const difficulties = new Set(data.exam.questions.map((q) => q.difficulty));
			return difficulties.size >= 3;
		},
		{
			message: `Exam must include questions of at least 3 different difficulty levels (available: ${DIFFICULTY_LEVELS.join(", ")})`,
			path: ["exam", "questions"]
		}
	);

export const ProjectContentSchema = BaseContentSchema.extend({
	type: z.literal("project"),
	objectives: z.array(z.string()).min(1, "Project must have objectives"),
	requirements: z.array(z.string()).min(1, "Project must have requirements"),
	deliverables: z.array(z.string()).min(1, "Project must have deliverables"),
	sections: z.array(ContentSectionSchema).min(5, "Project must have at least 5 sections"),
	estimatedHours: z.number().positive().optional(),
	skillsRequired: z.array(z.string()).optional(),
	resources: z
		.array(
			z.object({
				type: ProjectResourceTypeSchema,
				title: z.string().min(1, "Resource title is required"),
				url: z.url().optional(),
				description: z.string().optional()
			})
		)
		.optional()
});

/**
 * Union schema for all content types
 */
export const AnyContentSchema = z.discriminatedUnion("type", [
	LessonContentSchema,
	QuizContentSchema,
	StudyGuideContentSchema,
	ExamContentSchema,
	ProjectContentSchema
]);

/**
 * Schema registry for educational content validation
 * Contains ONLY schemas for user-created educational content.
 *
 * Note: Internal CLI schemas (scaffolding, configuration, etc.) are now
 * defined locally in their respective scripts, not here.
 */
export const CONTENT_SCHEMAS = {
	// Base schemas (TASK 7B: Union-based)
	TextStyle: TextStyleSchema,
	LinkTarget: LinkTargetSchema,
	BaseRichTextNode: BaseRichTextNodeSchema,
	TextNode: TextNodeSchema,
	LinkNode: LinkNodeSchema,
	HeadingNode: HeadingNodeSchema,
	RichTextNode: RichTextNodeSchema,
	RichParagraph: RichParagraphSchema,
	RichTextSection: RichTextSectionSchema,
	RichTextDocument: RichTextDocumentSchema,
	// Other base schemas
	EducationalFields: EducationalFieldsSchema,
	NavigationMetadata: NavigationMetadataSchema,
	ContentMetadata: NavigationMetadataSchema,
	BaseContent: BaseContentSchema,

	// Content blocks
	ParagraphBlock: ParagraphBlockSchema,
	CodeBlock: CodeBlockSchema,
	DiagramBlock: DiagramBlockSchema,
	CalloutBlock: CalloutBlockSchema,
	ImageBlock: ImageBlockSchema,
	VideoBlock: VideoBlockSchema,
	InteractiveBlock: InteractiveBlockSchema,
	ContentBlock: ContentBlockSchema,
	ContentSection: ContentSectionSchema,

	// Questions
	SingleChoiceQuestion: SingleChoiceQuestionSchema,
	MultipleChoiceQuestion: MultipleChoiceQuestionSchema,
	CodeCompletionQuestion: CodeCompletionQuestionSchema,
	TrueFalseQuestion: TrueFalseQuestionSchema,
	ShortAnswerQuestion: ShortAnswerQuestionSchema,
	DragAndDropQuestion: DragAndDropQuestionSchema,
	Question: QuestionSchema,

	// Other components
	FlipCard: FlipCardSchema,

	// Content types
	LessonContent: LessonContentSchema,
	QuizContent: QuizContentSchema,
	StudyGuideContent: StudyGuideContentSchema,
	ExamContent: ExamContentSchema,
	ProjectContent: ProjectContentSchema,
	AnyContent: AnyContentSchema
} as const;

/**
 * Type helper to extract types from schemas
 */
export type InferSchemaType<T extends keyof typeof CONTENT_SCHEMAS> = z.infer<
	(typeof CONTENT_SCHEMAS)[T]
>;
