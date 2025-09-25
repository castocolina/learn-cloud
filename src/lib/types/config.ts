/**
 * Configuration Type Definitions
 *
 * This file contains all TypeScript interfaces and types related to
 * application configuration. These types define the structure for
 * centralized application settings and validation configurations.
 *
 * Following the unified type architecture pattern, these types are
 * re-exported through the main types index for consistent imports.
 */

/**
 * Main application settings interface defining the complete configuration structure.
 * This interface groups all application parameters by functional domain.
 */
export interface AppSettings {
	/** Mermaid diagram rendering and debug configuration */
	mermaid: {
		/** Enable debug mode for detailed error logging */
		debug: boolean;
		/** Viewport percentage for modal dialogs (default: 90) */
		modalPagePercent: number;
		// Add more Mermaid-specific settings here as needed
	};

	/** Flip card component configuration */
	flipCard: {
		/** Viewport percentage for flip card modal dialogs (default: 90) */
		modalPagePercent: number;
		// Add more flip card-specific settings here as needed
	};

	/** User interface configuration */
	ui: {
		/** Breadcrumb navigation settings */
		breadcrumb: {
			/** Whether to show the emoji icon in breadcrumbs (default: true) */
			showIcon: boolean;
		};
		/** Sidebar navigation settings */
		sidebar: {
			/** Whether sidebar can be collapsed on desktop (default: true) */
			collapsible: boolean;
			/** Default collapsed state (default: false) */
			defaultCollapsed: boolean;
		};
		// Future UI settings can be grouped here
	};

	/** Content generation validation configuration */
	contentGeneration: {
		/** Validation settings for generated content */
		validation: {
			/** Run validation after content generation */
			runAfterGeneration: boolean;
			/** Run format validation */
			includeFormat: boolean;
			/** Run TypeScript check validation */
			includeCheck: boolean;
			/** Run lint validation */
			includeLint: boolean;
		};
	};

	/** Content scaffolding configuration */
	contentScaffolding: {
		/** Minimum content requirements for lessons */
		lessons: {
			/** Minimum sections per lesson */
			sections: number;
			/** Minimum code blocks per lesson */
			codeBlocks: number;
			/** Minimum diagrams per lesson */
			diagrams: number;
		};
		/** Minimum content requirements for quizzes */
		quizzes: {
			/** Minimum questions per quiz */
			questions: number;
			/** Use diverse question types (single, multiple, code_completion, drag_drop) */
			diverseTypes: boolean;
		};
		/** Minimum content requirements for exams */
		exams: {
			/** Minimum questions per exam */
			questions: number;
			/** Use diverse question types */
			diverseTypes: boolean;
		};
		/** Minimum content requirements for study guides */
		studyGuides: {
			/** Minimum flashcards per study guide */
			flashcards: number;
		};
		/** Minimum content requirements for projects */
		projects: {
			/** Minimum sections per project */
			sections: number;
			/** Minimum requirements per project */
			requirements: number;
			/** Minimum deliverables per project */
			deliverables: number;
		};
		/** Content length configurations (in characters) */
		contentLengths: {
			/** Summary length */
			summary: number;
			/** Standard paragraph length */
			paragraph: number;
			/** Extended paragraph length */
			longParagraph: number;
			/** Question text length */
			question: number;
			/** Explanation text length */
			explanation: number;
			/** Flashcard question length */
			flashcardQuestion: number;
			/** Flashcard answer length */
			flashcardAnswer: number;
			/** Learning objective length */
			objective: number;
			/** Project requirement length */
			requirement: number;
			/** Project deliverable length */
			deliverable: number;
			/** Diagram title length */
			diagramTitle: number;
			/** Diagram caption length */
			diagramCaption: number;
		};
	};

	// Future settings can be grouped here (e.g., api, performance)
}

/**
 * Type guards for configuration validation
 */

/**
 * Validates if an object conforms to the AppSettings interface
 * @param obj - Object to validate
 * @returns True if object is valid AppSettings
 */
export function isAppSettings(obj: unknown): obj is AppSettings {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"mermaid" in obj &&
		"flipCard" in obj &&
		"ui" in obj &&
		"contentGeneration" in obj &&
		"contentScaffolding" in obj &&
		typeof (obj as AppSettings).mermaid === "object" &&
		typeof (obj as AppSettings).flipCard === "object" &&
		typeof (obj as AppSettings).ui === "object" &&
		typeof (obj as AppSettings).contentGeneration === "object" &&
		typeof (obj as AppSettings).contentScaffolding === "object"
	);
}

/**
 * Validates mermaid configuration section
 * @param obj - Object to validate
 * @returns True if object is valid mermaid config
 */
export function isMermaidConfig(obj: unknown): obj is AppSettings["mermaid"] {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"debug" in obj &&
		"modalPagePercent" in obj &&
		typeof (obj as AppSettings["mermaid"]).debug === "boolean" &&
		typeof (obj as AppSettings["mermaid"]).modalPagePercent === "number"
	);
}

/**
 * Validates UI configuration section
 * @param obj - Object to validate
 * @returns True if object is valid UI config
 */
export function isUIConfig(obj: unknown): obj is AppSettings["ui"] {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"breadcrumb" in obj &&
		"sidebar" in obj &&
		typeof (obj as AppSettings["ui"]).breadcrumb === "object" &&
		typeof (obj as AppSettings["ui"]).sidebar === "object"
	);
}

/**
 * Validates content generation configuration section
 * @param obj - Object to validate
 * @returns True if object is valid content generation config
 */
export function isContentGenerationConfig(obj: unknown): obj is AppSettings["contentGeneration"] {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"validation" in obj &&
		typeof (obj as AppSettings["contentGeneration"]).validation === "object"
	);
}
