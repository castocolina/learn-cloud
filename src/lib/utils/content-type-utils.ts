/**
 * Content Type Utilities
 *
 * Utilities for content type validation, checking, and conversion.
 * Provides functions to validate content types, check content structure,
 * and ensure type safety across content operations.
 *
 * Features:
 * - Content type validation functions
 * - Type guards for content interfaces
 * - Content structure validation
 * - Type conversion utilities
 */

import type {
	ChapterType,
	LessonContent,
	QuizContent,
	StudyGuideContent,
	ExamContent,
	ProjectContent,
	QuestionType
} from "$types";

/**
 * Union type for all content types
 */
export type AnyContent =
	| LessonContent
	| QuizContent
	| StudyGuideContent
	| ExamContent
	| ProjectContent;

/**
 * Valid chapter types array for validation
 */
export const VALID_CHAPTER_TYPES: ChapterType[] = [
	"lesson",
	"overview",
	"quiz",
	"study_guide",
	"exam",
	"project"
];

/**
 * Valid question types array for validation
 */
export const VALID_QUESTION_TYPES: QuestionType[] = [
	"single_choice",
	"multiple_choice",
	"code_completion",
	"true_false",
	"short_answer",
	"drag_and_drop"
];

/**
 * Type guard to check if a value is a valid ChapterType
 */
export function isValidChapterType(value: unknown): value is ChapterType {
	return typeof value === "string" && VALID_CHAPTER_TYPES.includes(value as ChapterType);
}

/**
 * Type guard to check if a value is a valid QuestionType
 */
export function isValidQuestionType(value: unknown): value is QuestionType {
	return typeof value === "string" && VALID_QUESTION_TYPES.includes(value as QuestionType);
}

/**
 * Type guard to check if content is LessonContent
 */
export function isLessonContent(content: unknown): content is LessonContent {
	return (
		typeof content === "object" &&
		content !== null &&
		(content as LessonContent).type === "lesson" &&
		Array.isArray((content as LessonContent).sections)
	);
}

/**
 * Type guard to check if content is QuizContent
 */
export function isQuizContent(content: unknown): content is QuizContent {
	return (
		typeof content === "object" &&
		content !== null &&
		(content as QuizContent).type === "quiz" &&
		typeof (content as QuizContent).quiz === "object" &&
		Array.isArray((content as QuizContent).quiz.questions)
	);
}

/**
 * Type guard to check if content is StudyGuideContent
 */
export function isStudyGuideContent(content: unknown): content is StudyGuideContent {
	return (
		typeof content === "object" &&
		content !== null &&
		(content as StudyGuideContent).type === "study_guide" &&
		typeof (content as StudyGuideContent).studyGuide === "object" &&
		Array.isArray((content as StudyGuideContent).studyGuide.flashcards)
	);
}

/**
 * Type guard to check if content is ExamContent
 */
export function isExamContent(content: unknown): content is ExamContent {
	return (
		typeof content === "object" &&
		content !== null &&
		(content as ExamContent).type === "exam" &&
		typeof (content as ExamContent).exam === "object" &&
		Array.isArray((content as ExamContent).exam.questions)
	);
}

/**
 * Type guard to check if content is ProjectContent
 */
export function isProjectContent(content: unknown): content is ProjectContent {
	return (
		typeof content === "object" &&
		content !== null &&
		(content as ProjectContent).type === "project" &&
		Array.isArray((content as ProjectContent).sections) &&
		Array.isArray((content as ProjectContent).requirements) &&
		Array.isArray((content as ProjectContent).deliverables)
	);
}

/**
 * Type guard to check if content is any valid content type
 */
export function isValidContent(content: unknown): content is AnyContent {
	return (
		isLessonContent(content) ||
		isQuizContent(content) ||
		isStudyGuideContent(content) ||
		isExamContent(content) ||
		isProjectContent(content)
	);
}

/**
 * Validate content structure based on its type
 */
export function validateContentStructure(content: unknown): {
	isValid: boolean;
	errors: string[];
	contentType?: ChapterType;
} {
	const errors: string[] = [];

	// Basic structure validation
	if (!content || typeof content !== "object") {
		return {
			isValid: false,
			errors: ["Content must be an object"]
		};
	}

	const contentObj = content as Record<string, unknown>;

	// Check required base properties
	if (!contentObj.type || typeof contentObj.type !== "string") {
		errors.push("Content must have a valid type property");
	}

	if (!contentObj.title || typeof contentObj.title !== "string") {
		errors.push("Content must have a title");
	}

	if (!contentObj.summary || typeof contentObj.summary !== "string") {
		errors.push("Content must have a summary");
	}

	const contentType = contentObj.type as ChapterType;

	// Validate based on specific content type
	if (isValidChapterType(contentType)) {
		switch (contentType) {
			case "lesson":
				if (!isLessonContent(content)) {
					errors.push("Invalid lesson content structure");
				}
				break;
			case "quiz":
				if (!isQuizContent(content)) {
					errors.push("Invalid quiz content structure");
				}
				break;
			case "study_guide":
				if (!isStudyGuideContent(content)) {
					errors.push("Invalid study guide content structure");
				}
				break;
			case "exam":
				if (!isExamContent(content)) {
					errors.push("Invalid exam content structure");
				}
				break;
			case "project":
				if (!isProjectContent(content)) {
					errors.push("Invalid project content structure");
				}
				break;
		}
	} else {
		errors.push(`Invalid content type: ${contentType}`);
	}

	return {
		isValid: errors.length === 0,
		errors,
		contentType: isValidChapterType(contentType) ? contentType : undefined
	};
}

/**
 * Validate ContentSection structure
 */
export function validateContentSection(section: unknown): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (!section || typeof section !== "object") {
		return {
			isValid: false,
			errors: ["Section must be an object"]
		};
	}

	const sectionObj = section as Record<string, unknown>;

	if (!Array.isArray(sectionObj.content)) {
		errors.push("Section must have a content array");
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Validate ContentBlock structure
 */
export function validateContentBlock(block: unknown): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (!block || typeof block !== "object") {
		return {
			isValid: false,
			errors: ["Block must be an object"]
		};
	}

	const blockObj = block as Record<string, unknown>;

	if (!blockObj.type || typeof blockObj.type !== "string") {
		errors.push("Block must have a type property");
	}

	// Validate specific block types
	switch (blockObj.type) {
		case "paragraph":
			if (!blockObj.content) {
				errors.push("Paragraph block must have content");
			}
			break;
		case "code":
			if (!blockObj.language || typeof blockObj.language !== "string") {
				errors.push("Code block must have a language");
			}
			if (!blockObj.code || typeof blockObj.code !== "string") {
				errors.push("Code block must have code content");
			}
			break;
		case "diagram":
			if (!blockObj.diagramType || typeof blockObj.diagramType !== "string") {
				errors.push("Diagram block must have a diagramType");
			}
			if (!blockObj.definition || typeof blockObj.definition !== "string") {
				errors.push("Diagram block must have a definition");
			}
			break;
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Get content type from content object
 */
export function getContentType(content: unknown): ChapterType | null {
	if (!content || typeof content !== "object") {
		return null;
	}

	const contentObj = content as Record<string, unknown>;
	const type = contentObj.type;

	return isValidChapterType(type) ? type : null;
}

/**
 * Convert content to specific type (with validation)
 */
export function convertToContentType<T extends AnyContent>(
	content: unknown,
	expectedType: ChapterType
): T | null {
	if (!isValidContent(content)) {
		return null;
	}

	const contentType = getContentType(content);
	if (contentType !== expectedType) {
		return null;
	}

	return content as T;
}
