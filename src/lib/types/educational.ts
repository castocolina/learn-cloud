/**
 * Educational Content Types for Cloud-Native Learning Platform
 *
 * This module defines types for educational content including code examples,
 * Mermaid diagrams, and comprehensive learning materials designed for
 * technical education in cloud-native technologies.
 *
 * All content types support educational metadata, progress tracking,
 * and accessibility features for inclusive learning experiences.
 */

import type {
	DifficultyLevel,
	ChapterType,
	TechnologyUnit,
	MermaidDirection,
	ProgrammingLanguage,
	EducationalCategory,
	MermaidDiagramType,
	EducationalResourceType,
	ContentStatus
} from "./types.js";

/**
 * Code example interface for technical education
 *
 * Comprehensive code example system with syntax highlighting,
 * educational context, and progressive learning support.
 */
export interface CodeExample {
	/** Unique identifier for the code example */
	id: string;

	/** Descriptive title for the example */
	title: string;

	/** Programming language or technology */
	language: ProgrammingLanguage;

	/** Educational complexity level */
	complexity: DifficultyLevel;

	/** Content category for organization */
	category: EducationalCategory;

	/** Brief description of functionality */
	description: string;

	/** The code snippet (properly escaped for TypeScript strings) */
	code: string;

	/** Detailed explanation of the code */
	explanation?: string;

	/** Educational metadata */
	education: {
		/** Learning objectives this example addresses */
		learningObjectives: string[];

		/** Prerequisites knowledge */
		prerequisites: string[];

		/** Key concepts demonstrated */
		concepts: string[];

		/** Estimated time to understand (minutes) */
		estimatedTime: number;

		/** Difficulty level */
		difficulty: DifficultyLevel;

		/** Technology unit classification */
		technologyUnit?: TechnologyUnit;
	};

	/** Additional context and resources */
	context?: {
		/** Related examples */
		relatedExamples?: string[];

		/** External resources */
		resources?: {
			title: string;
			url: string;
			type: EducationalResourceType;
		}[];

		/** Common use cases */
		useCases?: string[];

		/** Best practices highlighted */
		bestPractices?: string[];

		/** Security considerations */
		securityNotes?: string[];
	};

	/** Metadata for tracking and organization */
	metadata: {
		/** Content creation status */
		status: ContentStatus;

		/** Version of the example */
		version: string;

		/** Creation date */
		createdAt: string;

		/** Last update date */
		updatedAt: string;

		/** Author information */
		author?: string;

		/** Review status */
		reviewed?: boolean;

		/** Tags for flexible categorization */
		tags: string[];
	};
}

/**
 * Mermaid diagram for visual learning
 *
 * Educational diagram system with syntax validation,
 * rendering configuration, and learning context.
 */
export interface MermaidDiagram {
	/** Unique identifier for the diagram */
	id: string;

	/** Descriptive title */
	title: string;

	/** Type of Mermaid diagram */
	type: MermaidDiagramType;

	/** Educational complexity level */
	complexity: DifficultyLevel;

	/** Diagram category for organization */
	category: EducationalCategory;

	/** Brief description of the diagram purpose */
	description: string;

	/** The Mermaid diagram syntax */
	diagram: string;

	/** Detailed explanation of the diagram components */
	explanation: string;

	/** Educational metadata */
	education: {
		/** Learning objectives */
		learningObjectives: string[];

		/** Prerequisites */
		prerequisites: string[];

		/** Key concepts illustrated */
		concepts: string[];

		/** Estimated time to understand (minutes) */
		estimatedTime: number;

		/** Difficulty level */
		difficulty: DifficultyLevel;

		/** Technology unit */
		technologyUnit?: TechnologyUnit;
	};

	/** Rendering configuration */
	rendering?: {
		/** Diagram direction/orientation */
		direction?: MermaidDirection;

		/** Theme for rendering */
		theme?: "default" | "dark" | "forest" | "neutral";

		/** Custom styling options */
		styling?: {
			backgroundColor?: string;
			primaryColor?: string;
			fontFamily?: string;
			fontSize?: number;
		};

		/** Size constraints */
		dimensions?: {
			maxWidth?: number;
			maxHeight?: number;
			aspectRatio?: string;
		};
	};

	/** Additional context */
	context?: {
		/** Real-world applications */
		applications?: string[];

		/** Related diagrams */
		relatedDiagrams?: string[];

		/** Implementation considerations */
		implementation?: string[];

		/** Common variations */
		variations?: string[];
	};

	/** Metadata */
	metadata: {
		status: ContentStatus;
		version: string;
		createdAt: string;
		updatedAt: string;
		author?: string;
		reviewed?: boolean;
		tags: string[];
	};
}

/**
 * Educational lesson content structure
 *
 * Comprehensive lesson framework supporting multimodal content delivery
 * with embedded interactive elements and assessment integration.
 */
export interface EducationalLesson {
	/** Unique lesson identifier */
	id: string;

	/** Lesson title */
	title: string;

	/** Brief lesson description */
	description: string;

	/** Chapter type classification */
	type: ChapterType;

	/** Educational metadata */
	education: {
		/** Unit identifier */
		unitId: string;

		/** Chapter number within unit */
		chapterNumber: string;

		/** Learning objectives */
		learningObjectives: string[];

		/** Prerequisites */
		prerequisites: string[];

		/** Estimated completion time (minutes) */
		estimatedTime: number;

		/** Difficulty level */
		difficulty: DifficultyLevel;

		/** Technology focus */
		technologyUnit: TechnologyUnit;
	};

	/** Lesson content sections */
	content: {
		/** Introduction section */
		introduction?: {
			overview: string;
			objectives: string[];
			prerequisites: string[];
		};

		/** Main content sections */
		sections: {
			id: string;
			title: string;
			content: string;
			type: "text" | "code" | "diagram" | "interactive" | "video" | "exercise";
			resources?: {
				codeExamples?: string[]; // References to CodeExample IDs
				diagrams?: string[]; // References to MermaidDiagram IDs
				externalLinks?: {
					title: string;
					url: string;
					type: EducationalResourceType;
				}[];
			};
		}[];

		/** Summary and next steps */
		conclusion?: {
			summary: string;
			keyTakeaways: string[];
			nextSteps: string[];
			additionalResources?: {
				title: string;
				url: string;
				type: EducationalResourceType;
			}[];
		};
	};

	/** Assessment integration */
	assessment?: {
		/** Pre-lesson knowledge check */
		prerequisiteQuiz?: string;

		/** In-lesson checkpoint quizzes */
		checkpoints?: string[];

		/** Post-lesson assessment */
		finalQuiz?: string;

		/** Practical exercises */
		exercises?: string[];
	};

	/** Metadata */
	metadata: {
		status: ContentStatus;
		version: string;
		createdAt: string;
		updatedAt: string;
		author?: string;
		reviewed?: boolean;
		tags: string[];
	};
}

/**
 * Learning path definition for curriculum design
 *
 * Structured learning progression with dependency management
 * and adaptive learning support for personalized education.
 */
export interface LearningPath {
	/** Unique path identifier */
	id: string;

	/** Path title */
	title: string;

	/** Path description */
	description: string;

	/** Target audience */
	audience: {
		/** Experience level required */
		level: DifficultyLevel;

		/** Role/profession target */
		roles: string[];

		/** Prior knowledge assumptions */
		assumptions: string[];
	};

	/** Learning objectives for the entire path */
	objectives: string[];

	/** Path structure */
	structure: {
		/** Required lessons in order */
		required: string[];

		/** Optional supplementary content */
		optional?: string[];

		/** Prerequisites for the entire path */
		prerequisites: string[];

		/** Path dependencies */
		dependencies?: string[];
	};

	/** Estimated completion metrics */
	completion: {
		/** Total estimated hours */
		estimatedHours: number;

		/** Recommended pace (lessons per week) */
		recommendedPace?: number;

		/** Completion criteria */
		criteria: string[];
	};

	/** Progress tracking */
	progress?: {
		/** Completion percentage */
		completionRate: number;

		/** Mastery level achieved */
		masteryLevel: "none" | DifficultyLevel;

		/** Skills acquired */
		skillsAcquired: string[];

		/** Competencies demonstrated */
		competencies: string[];
	};

	/** Metadata */
	metadata: {
		status: ContentStatus;
		version: string;
		createdAt: string;
		updatedAt: string;
		author?: string;
		reviewed?: boolean;
		tags: string[];
	};
}

/**
 * Default educational configurations
 */

/** Default code example metadata */
export const defaultCodeMetadata = {
	status: "draft" as ContentStatus,
	version: "1.0.0",
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	reviewed: false,
	tags: []
};

/** Default Mermaid rendering configuration */
export const defaultMermaidRendering = {
	direction: "TB" as MermaidDirection,
	theme: "default" as const,
	styling: {
		backgroundColor: "#ffffff",
		primaryColor: "#0066cc",
		fontFamily: "Inter, sans-serif",
		fontSize: 14
	}
};

/**
 * Type guards for educational content
 */

/** Type guard for CodeExample interface */
export function isCodeExample(obj: unknown): obj is CodeExample {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"id" in obj &&
		"title" in obj &&
		"language" in obj &&
		"complexity" in obj &&
		"code" in obj &&
		"education" in obj &&
		"metadata" in obj
	);
}

/** Type guard for MermaidDiagram interface */
export function isMermaidDiagram(obj: unknown): obj is MermaidDiagram {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"id" in obj &&
		"title" in obj &&
		"type" in obj &&
		"complexity" in obj &&
		"diagram" in obj &&
		"explanation" in obj &&
		"education" in obj &&
		"metadata" in obj
	);
}

/** Type guard for EducationalLesson interface */
export function isEducationalLesson(obj: unknown): obj is EducationalLesson {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"id" in obj &&
		"title" in obj &&
		"description" in obj &&
		"type" in obj &&
		"education" in obj &&
		"content" in obj &&
		"metadata" in obj
	);
}

/** Type guard for LearningPath interface */
export function isLearningPath(obj: unknown): obj is LearningPath {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"id" in obj &&
		"title" in obj &&
		"description" in obj &&
		"audience" in obj &&
		"objectives" in obj &&
		"structure" in obj &&
		"completion" in obj &&
		"metadata" in obj
	);
}
