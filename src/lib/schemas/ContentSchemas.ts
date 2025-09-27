/**
 * Comprehensive Zod Schemas for Content Validation
 *
 * This module provides complete Zod schema definitions for all content types
 * in the Cloud-Native Learning Platform. These schemas ensure type safety
 * and data validation across all content generation and processing workflows.
 *
 * Features:
 * - Complete schema definitions for all content interfaces
 * - Business rule validation embedded in schemas
 * - Reusable schema components for composition
 * - Runtime validation with detailed error messages
 * - Integration with ValidationService
 */

import { z } from "zod";

/**
 * Base content validation schemas
 */

// Rich text schemas
export const RichTextFragmentSchema = z.object({
	text: z.string().min(1, "Text content cannot be empty"),
	bold: z.boolean().optional(),
	italic: z.boolean().optional(),
	code: z.boolean().optional(),
	link: z
		.object({
			url: z.string().url("Invalid URL format"),
			title: z.string().optional()
		})
		.optional()
});

export const RichParagraphSchema = z
	.array(RichTextFragmentSchema)
	.min(1, "Paragraph must contain at least one text fragment");

export const RichTextSectionSchema = z.object({
	title: z.string().min(1, "Section title is required"),
	content: z.array(RichParagraphSchema).min(1, "Section must have content")
});

export const RichTextDocumentSchema = z.object({
	title: z.string().min(1, "Document title is required"),
	sections: z.array(RichTextSectionSchema).min(1, "Document must have at least one section")
});

// Content metadata schema
export const ContentMetadataSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	summary: z.string().min(10, "Summary too short").max(500, "Summary too long"),
	description: z.string().optional(),
	keywords: z
		.array(z.string())
		.min(3, "Minimum 3 keywords required for search functionality")
		.max(20, "Too many keywords"),
	difficulty: z.enum(["beginner", "intermediate", "advanced"]),
	estimatedTime: z.number().int().min(1, "Estimated time must be positive").optional(),
	prerequisites: z.array(z.string()).optional(),
	learningObjectives: z.array(z.string()).min(1, "At least one learning objective required"),
	tags: z.array(z.string()).optional()
});

// Base content schema
export const BaseContentSchema = z.object({
	id: z.string().min(1, "ID is required"),
	type: z.enum(["lesson", "quiz", "study_guide", "exam", "project"]),
	title: z.string().min(1, "Title is required"),
	summary: z.string().min(10, "Summary is required and must be descriptive"),
	metadata: ContentMetadataSchema
});

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
	style: z.enum(["info", "warning", "danger", "success", "tip"]),
	title: z.string().optional(),
	content: RichParagraphSchema
});

export const ImageBlockSchema = z.object({
	type: z.literal("image"),
	src: z.string().url("Invalid image URL"),
	alt: z.string().min(1, "Alt text is required for accessibility"),
	title: z.string().optional(),
	caption: z.string().optional(),
	width: z.number().int().positive().optional(),
	height: z.number().int().positive().optional()
});

export const VideoBlockSchema = z.object({
	type: z.literal("video"),
	src: z.string().url("Invalid video URL"),
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
		difficulty: z.enum(["easy", "medium", "hard"]),
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
		difficulty: z.enum(["easy", "medium", "hard"]),
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
	difficulty: z.enum(["easy", "medium", "hard"]),
	tags: z.array(z.string()).min(1, "Tags required for search functionality")
});

export const TrueFalseQuestionSchema = z.object({
	type: z.literal("true_false"),
	id: z.string().min(1, "Question ID is required"),
	question: z.string().min(1, "Question text is required"),
	correctAnswer: z.boolean(),
	explanation: z.string().min(1, "Explanation is required"),
	difficulty: z.enum(["easy", "medium", "hard"]),
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
	difficulty: z.enum(["easy", "medium", "hard"]),
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
	difficulty: z.enum(["easy", "medium", "hard"]),
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
 * Flashcard schema for study guides
 */

export const FlashcardSchema = z.object({
	id: z.string().min(1, "Flashcard ID is required"),
	question: z.string().min(1, "Question is required"),
	answer: z.string().min(1, "Answer is required"),
	hint: z.string().optional(),
	category: z.string().optional(),
	difficulty: z.enum(["easy", "medium", "hard"]),
	tags: z.array(z.string()).min(1, "Tags required for search functionality")
});

/**
 * Content type schemas
 */

export const LessonContentSchema = BaseContentSchema.extend({
	type: z.literal("lesson"),
	sections: z.array(ContentSectionSchema).min(5, "Lesson must have at least 5 sections"),
	duration: z.number().int().positive().optional(),
	prerequisites: z.array(z.string()).optional()
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
	flashcards: z.array(FlashcardSchema).min(6, "Study guide must have at least 6 flashcards"),
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
			message: "Exam must include questions of all 3 difficulty levels (easy, medium, hard)",
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
				type: z.enum(["link", "file", "tool", "documentation"]),
				title: z.string().min(1, "Resource title is required"),
				url: z.string().url().optional(),
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
 * Navigation and structure schemas
 */

export const NavigationItemSchema = z.object({
	id: z.string().min(1, "Navigation ID is required"),
	title: z.string().min(1, "Navigation title is required"),
	path: z.string().min(1, "Navigation path is required"),
	type: z.enum(["overview", "lesson", "quiz", "study_guide", "exam", "project"]),
	section: z.enum(["overview", "content", "assessment", "resources"]),
	state: z.enum(["locked", "available", "in_progress", "completed"]),
	icon: z.string().optional(),
	description: z.string().optional(),
	estimatedTime: z.number().positive().optional()
});

export const MenuUnitSchema = z.object({
	unitNumber: z.number().int().positive(),
	title: z.string().min(1, "Unit title is required"),
	icon: z.string().optional(),
	technologyUnit: z.string().min(1, "Technology unit is required"),
	chapters: z
		.array(
			z.object({
				id: z.string().min(1, "Chapter ID is required"),
				title: z.string().min(1, "Chapter title is required"),
				type: z.enum(["overview", "lesson", "quiz", "study_guide", "exam", "project"]),
				path: z.string().min(1, "Chapter path is required")
			})
		)
		.min(1, "Unit must have at least one chapter")
});

export const MenuStructureSchema = z.object({
	units: z.array(MenuUnitSchema).min(1, "Menu must have at least one unit"),
	metadata: z.object({
		generatedAt: z.string().datetime(),
		totalUnits: z.number().int().positive(),
		totalChapters: z.number().int().positive()
	})
});

/**
 * Scaffolding and generation schemas
 */

export const ScaffoldingArgsSchema = z.object({
	unit: z
		.string()
		.min(1, "Unit name is required")
		.regex(/^[\w-]+$/, "Unit name must be alphanumeric with hyphens"),
	type: z.enum(["lesson", "quiz", "exam", "study_guide", "project"]),
	id: z
		.string()
		.min(1, "ID is required")
		.regex(/^[\w-]+$/, "ID must be alphanumeric with hyphens")
});

export const ScaffoldingStatsSchema = z.object({
	totalChapters: z.number().int().min(0),
	existingFiles: z.number().int().min(0),
	newFiles: z.number().int().min(0),
	orphanFiles: z.array(z.string()),
	errors: z.array(z.string())
});

export const ContentGenerationResultSchema = z.object({
	success: z.boolean(),
	filePath: z.string().optional(),
	stats: ScaffoldingStatsSchema.optional(),
	errors: z.array(z.string()).optional()
});

export const SafetyCheckResultSchema = z.object({
	canProceed: z.boolean(),
	requiresForce: z.boolean(),
	warning: z.string().optional(),
	error: z.string().optional(),
	currentStatus: z.enum(["scaffold", "draft", "final"]).optional()
});

/**
 * Search and indexing schemas
 */

export const SearchableItemSchema = z.object({
	id: z.string().min(1, "Search item ID is required"),
	title: z.string().min(1, "Search item title is required"),
	description: z.string(),
	content: z.string(),
	type: z.enum(["lesson", "quiz", "study_guide", "exam", "project"]),
	keywords: z.array(z.string()),
	nav: z.object({
		unit: z.string(),
		chapter: z.string(),
		path: z.string().min(1, "Navigation path is required")
	}),
	metadata: z
		.object({
			difficulty: z.enum(["beginner", "intermediate", "advanced"]),
			estimatedTime: z.number().positive().optional(),
			tags: z.array(z.string()).optional()
		})
		.optional()
});

/**
 * Validation configuration schema
 */
export const ValidationConfigSchema = z.object({
	enableMermaidValidation: z.boolean().default(true),
	enableBusinessRules: z.boolean().default(true),
	enableTypeValidation: z.boolean().default(true),
	skipValidationInTests: z.boolean().default(false)
});

/**
 * Repository configuration schema
 */
export const RepositoryConfigSchema = z.object({
	mode: z.enum(["safe", "force", "backup"]).default("safe"),
	createBackups: z.boolean().default(true),
	validateBeforeWrite: z.boolean().default(true),
	respectContentStatus: z.boolean().default(true),
	backupDirectory: z.string().default("tmp/backups")
});

/**
 * Schema registry for easy access
 */
export const CONTENT_SCHEMAS = {
	// Base schemas
	RichTextFragment: RichTextFragmentSchema,
	RichParagraph: RichParagraphSchema,
	RichTextSection: RichTextSectionSchema,
	RichTextDocument: RichTextDocumentSchema,
	ContentMetadata: ContentMetadataSchema,
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
	Flashcard: FlashcardSchema,

	// Content types
	LessonContent: LessonContentSchema,
	QuizContent: QuizContentSchema,
	StudyGuideContent: StudyGuideContentSchema,
	ExamContent: ExamContentSchema,
	ProjectContent: ProjectContentSchema,
	AnyContent: AnyContentSchema,

	// Navigation
	NavigationItem: NavigationItemSchema,
	MenuUnit: MenuUnitSchema,
	MenuStructure: MenuStructureSchema,

	// Scaffolding
	ScaffoldingArgs: ScaffoldingArgsSchema,
	ScaffoldingStats: ScaffoldingStatsSchema,
	ContentGenerationResult: ContentGenerationResultSchema,
	SafetyCheckResult: SafetyCheckResultSchema,

	// Search
	SearchableItem: SearchableItemSchema,

	// Configuration
	ValidationConfig: ValidationConfigSchema,
	RepositoryConfig: RepositoryConfigSchema
} as const;

/**
 * Type helper to extract types from schemas
 */
export type InferSchemaType<T extends keyof typeof CONTENT_SCHEMAS> = z.infer<
	(typeof CONTENT_SCHEMAS)[T]
>;
