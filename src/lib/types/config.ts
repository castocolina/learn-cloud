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
	/** User interface configuration */
	ui: {
		/** Mermaid diagram rendering and modal configuration */
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

	/** Script execution and validation configuration */
	scripts: {
		/** Validation script configuration */
		validation: {
			/** Generated content validation settings */
			generated: {
				/** Run validation after content generation */
				runAfterGeneration: boolean;
				/** Run format validation */
				includeFormat: boolean;
				/** Run TypeScript check validation */
				includeCheck: boolean;
				/** Run lint validation */
				includeLint: boolean;
			};
			/** Mermaid diagram validation settings */
			mermaid: {
				/** Maximum number of files to process in parallel (default: 4) */
				maxParallelFiles: number;
				/** Supported property names for diagram detection */
				diagramPropertyNames: readonly string[];
				/** Enable verbose output for debugging */
				verbose: boolean;
			};
		};
		/** Content scaffolding configuration */
		scaffolding: {
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
		"ui" in obj &&
		"scripts" in obj &&
		typeof (obj as AppSettings).ui === "object" &&
		typeof (obj as AppSettings).scripts === "object"
	);
}

/**
 * Validates mermaid configuration section
 * @param obj - Object to validate
 * @returns True if object is valid mermaid config
 */
export function isMermaidConfig(obj: unknown): obj is AppSettings["ui"]["mermaid"] {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"debug" in obj &&
		"modalPagePercent" in obj &&
		typeof (obj as AppSettings["ui"]["mermaid"]).debug === "boolean" &&
		typeof (obj as AppSettings["ui"]["mermaid"]).modalPagePercent === "number"
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
		"mermaid" in obj &&
		"flipCard" in obj &&
		"breadcrumb" in obj &&
		"sidebar" in obj &&
		typeof (obj as AppSettings["ui"]).mermaid === "object" &&
		typeof (obj as AppSettings["ui"]).flipCard === "object" &&
		typeof (obj as AppSettings["ui"]).breadcrumb === "object" &&
		typeof (obj as AppSettings["ui"]).sidebar === "object"
	);
}

/**
 * Validates generated content validation configuration section
 * @param obj - Object to validate
 * @returns True if object is valid generated content validation config
 */
export function isGeneratedValidationConfig(
	obj: unknown
): obj is AppSettings["scripts"]["validation"]["generated"] {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"runAfterGeneration" in obj &&
		"includeFormat" in obj &&
		"includeCheck" in obj &&
		"includeLint" in obj &&
		typeof (obj as AppSettings["scripts"]["validation"]["generated"]).runAfterGeneration ===
			"boolean" &&
		typeof (obj as AppSettings["scripts"]["validation"]["generated"]).includeFormat === "boolean" &&
		typeof (obj as AppSettings["scripts"]["validation"]["generated"]).includeCheck === "boolean" &&
		typeof (obj as AppSettings["scripts"]["validation"]["generated"]).includeLint === "boolean"
	);
}

/**
 * Validates scripts configuration section
 * @param obj - Object to validate
 * @returns True if object is valid scripts config
 */
export function isScriptsConfig(obj: unknown): obj is AppSettings["scripts"] {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"validation" in obj &&
		"scaffolding" in obj &&
		typeof (obj as AppSettings["scripts"]).validation === "object" &&
		typeof (obj as AppSettings["scripts"]).scaffolding === "object"
	);
}

/**
 * Validates mermaid validation configuration section
 * @param obj - Object to validate
 * @returns True if object is valid mermaid validation config
 */
export function isMermaidValidationConfig(
	obj: unknown
): obj is AppSettings["scripts"]["validation"]["mermaid"] {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"maxParallelFiles" in obj &&
		"diagramPropertyNames" in obj &&
		"verbose" in obj &&
		typeof (obj as AppSettings["scripts"]["validation"]["mermaid"]).maxParallelFiles === "number" &&
		Array.isArray((obj as AppSettings["scripts"]["validation"]["mermaid"]).diagramPropertyNames) &&
		typeof (obj as AppSettings["scripts"]["validation"]["mermaid"]).verbose === "boolean"
	);
}
