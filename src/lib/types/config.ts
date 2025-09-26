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
			/** Path configurations for validation */
			paths: {
				/** Temporary configuration directory */
				tempConfigDir: string;
				/** Generated TypeScript config filename */
				generatedConfigFile: string;
				/** Work-in-progress config filename */
				wipConfigFile: string;
				/** Root TypeScript config path */
				rootTsConfig: string;
				/** SvelteKit TypeScript config path */
				svelteKitTsConfig: string;
			};
			/** Command configurations for validation tools */
			commands: {
				/** Prettier format command */
				format: readonly string[];
				/** TypeScript check command */
				check: readonly string[];
				/** Generated content check command */
				checkGenerated: readonly string[];
				/** ESLint command */
				lint: readonly string[];
			};
			/** TypeScript compiler configuration */
			typescript: {
				/** Compiler strictness settings */
				strictness: {
					/** Allow unused local variables */
					allowUnusedLocals: boolean;
					/** Allow unused parameters */
					allowUnusedParameters: boolean;
					/** Allow unused type definitions */
					allowUnusedTypes: boolean;
				};
				/** Suppression patterns for unused items */
				suppressionPatterns: {
					/** Prefix for variables to ignore (default: "_") */
					unusedPrefix: string;
					/** Prefix for types to ignore (default: "_") */
					typePrefix: string;
					/** Comment to mark future use items */
					futureUseComment: string;
				};
				/** Compiler options to apply */
				compilerOptions: {
					/** Disable emit during validation */
					noEmit: boolean;
					/** Use verbatim module syntax */
					verbatimModuleSyntax: boolean;
					/** Isolated modules */
					isolatedModules: boolean;
				};
				/** Path to extend from */
				extendsPath: string;
			};
			/** ESLint configuration */
			eslint: {
				/** Enable auto-fix */
				autoFix: boolean;
				/** Ignore warnings during validation */
				ignoreWarnings: boolean;
				/** Pattern for unused variables to ignore */
				unusedVarPattern: string;
			};
			/** Logging configuration */
			logging: {
				/** Show command execution */
				showCommands: boolean;
				/** Use emojis in output */
				useEmojis: boolean;
				/** Show timestamps */
				showTimestamps: boolean;
				/** Enable verbose output */
				verboseOutput: boolean;
			};
			/** File cleanup configuration */
			cleanup: {
				/** Automatically clean temporary files */
				autoCleanup: boolean;
				/** Retain files on error for debugging */
				retainOnError: boolean;
				/** Prefix for temporary config files */
				tempFilePrefix: string;
				/** Name for file list temporary file */
				fileListName: string;
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
		/** Search index generation configuration */
		searchIndex: {
			/** Path configuration for input and output */
			paths: {
				/** Input directory containing content files */
				inputFolder: string;
				/** Output file path for generated search index */
				outputFile: string;
			};
			/** Processing options and behavior settings */
			processing: {
				/** Generation mode for development vs production */
				mode: "development" | "production";
				/** Enable/disable NLP processing for keyword extraction */
				enableNLP: boolean;
				/** Enable/disable verbose logging during generation */
				verboseLogging: boolean;
				/** Maximum keywords to extract per content item */
				maxKeywords: number;
				/** Minimum keyword length for filtering */
				minKeywordLength: number;
			};
			/** Lunr.js field boost configuration for search relevance */
			fieldBoosts: {
				title: number;
				summary: number;
				content: number;
				codeBlocks: number;
				diagrams: number;
				flashcards: number;
				questions: number;
				requirements: number;
				keywords: number;
				tags: number;
			};
			/** Prefix for generating unique validation config IDs */
			validationPrefix: string;
			/** Technical keywords organized by category for enhanced search */
			keywords: {
				cloudNative: string[];
				infrastructure: string[];
				languages: string[];
				databases: string[];
				webTechnologies: string[];
				cloudProviders: string[];
				security: string[];
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
