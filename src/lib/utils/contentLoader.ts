import { contentActions, type ContentType } from "$lib/stores/content";
import type {
	LessonContent,
	QuizContent,
	StudyGuideContent,
	ExamContent,
	ProjectContent
} from "$data/types";

/**
 * Loads content dynamically from src/data/ directory
 * @param dataPath - Path from content-menu.ts (e.g., "book/unit1/1_1_lesson_development_environment_tooling.ts")
 * @param urlHash - Optional hash to set in URL (e.g., "book/unit/1/1_1_lesson_development_environment_tooling.html")
 */
export async function loadContent(dataPath: string, urlHash?: string): Promise<void> {
	// Start loading state with hash
	contentActions.startLoading(urlHash);

	try {
		// Construct the full path for dynamic import
		// dataPath comes like "book/unit1/1_1_lesson_development_environment_tooling.ts"
		// We need to import from "/src/data/book/unit1/1_1_lesson_development_environment_tooling.ts"
		const fullPath = `/src/data/${dataPath}`;

		console.log(`Loading content from: ${fullPath}`);

		// Dynamic import of the content module
		const contentModule = await import(/* @vite-ignore */ fullPath);

		// Extract the content - try default export first, then named exports
		let content = contentModule.default;

		if (!content) {
			// Try common named exports
			content =
				contentModule.lessonContent ||
				contentModule.quizContent ||
				contentModule.studyGuideContent ||
				contentModule.examContent ||
				contentModule.projectContent;
		}

		if (!content) {
			throw new Error(
				`No content export found in ${fullPath}. Expected default export or named export like 'lessonContent'.`
			);
		}

		// Validate that the content has the required properties
		if (!content.title || !content.type) {
			throw new Error(`Invalid content structure in ${fullPath}. Missing title or type.`);
		}

		// Set the loaded content with hash
		contentActions.setContent(content as ContentType, urlHash);

		console.log(`Successfully loaded content: ${content.title}`);
	} catch (error) {
		console.error("Error loading content:", error);

		let errorMessage = "Failed to load content";
		if (error instanceof Error) {
			errorMessage = error.message;
		}

		// Include the attempted path in the error for debugging
		errorMessage += ` (Path: ${dataPath})`;

		contentActions.setError(errorMessage);
	}
}

/**
 * Load content for a unit overview page
 * @param unitData - Path to unit data file
 * @param unitLink - URL hash (from unit_link field)
 */
export async function loadUnitContent(unitData: string, unitLink?: string): Promise<void> {
	await loadContent(unitData, unitLink);
}

/**
 * Load content for a chapter (lesson, quiz, study guide, etc.)
 * @param chapterData - Path to chapter data file
 * @param chapterLink - URL hash (from chapter_link field)
 */
export async function loadChapterContent(chapterData: string, chapterLink?: string): Promise<void> {
	await loadContent(chapterData, chapterLink);
}

/**
 * Show the welcome screen
 */
export function showWelcome(): void {
	contentActions.showWelcome();
}

/**
 * Load content from hash URL
 * @param hash - URL hash (e.g., "book/unit/1/1_1_lesson_development_environment_tooling.html")
 */
export async function loadContentFromHash(hash: string): Promise<void> {
	// Convert hash URL to data path
	// book/unit/1/1_1_lesson_development_environment_tooling.html -> book/unit1/1_1_lesson_development_environment_tooling.ts
	const pathParts = hash.split("/");

	if (pathParts.length >= 4 && pathParts[0] === "book" && pathParts[1] === "unit") {
		const unitNumber = pathParts[2];
		const filename = pathParts[3];

		// Convert HTML filename to TypeScript data path
		const tsFilename = filename.replace(".html", ".ts");
		const dataPath = `book/unit${unitNumber}/${tsFilename}`;

		console.log(`Loading from hash: ${hash} -> ${dataPath}`);
		await loadContent(dataPath, hash);
	} else {
		contentActions.setError(`Invalid hash format: ${hash}`);
	}
}

/**
 * Initialize content from current hash
 */
export function initializeFromHash(): void {
	const hash = contentActions.initFromHash();
	if (hash) {
		loadContentFromHash(hash);
	}
}

/**
 * Clear any error state
 */
export function clearError(): void {
	contentActions.clearError();
}

/**
 * Type guards for content validation
 */
export function isLessonContent(content: ContentType): content is LessonContent {
	return content.type === "lesson";
}

export function isQuizContent(content: ContentType): content is QuizContent {
	return content.type === "quiz";
}

export function isStudyGuideContent(content: ContentType): content is StudyGuideContent {
	return content.type === "study_guide";
}

export function isExamContent(content: ContentType): content is ExamContent {
	return content.type === "exam";
}

export function isProjectContent(content: ContentType): content is ProjectContent {
	return content.type === "project";
}
