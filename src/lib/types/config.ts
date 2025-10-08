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
 * Content Layout Mode
 *
 * - "centered": Content centered with auto margins (industry standard)
 * - "left": Content left-aligned with max-width
 * - "full": Full-width content spanning viewport
 */
export type ContentLayoutMode = "centered" | "left" | "full";

/**
 * Content Maximum Width
 *
 * Tailwind max-width utilities mapped to readable sizes:
 * - "prose": 65ch (~65 characters) - optimal readability
 * - "3xl": 48rem (~750px) - compact
 * - "4xl": 56rem (~900px) - balanced (recommended)
 * - "5xl": 64rem (~1000px) - wider
 * - "6xl": 72rem (~1150px) - widest with constraint
 * - "full": 100% - no constraint
 */
export type ContentMaxWidth = "prose" | "3xl" | "4xl" | "5xl" | "6xl" | "full";

/**
 * Content Padding
 *
 * Tailwind spacing scale (rem units):
 * - "4": 1rem (16px)
 * - "6": 1.5rem (24px)
 * - "8": 2rem (32px) - recommended
 * - "12": 3rem (48px)
 * - "16": 4rem (64px)
 */
export type ContentPadding = "4" | "6" | "8" | "12" | "16";

/**
 * Main application settings interface defining the complete configuration structure.
 * This interface groups all application parameters by functional domain.
 */
export interface AppSettings {
	/** User interface configuration */
	ui: {
		/**
		 * Theme System Configuration
		 *
		 * Centralized theme configuration including color palettes, modes, and validation.
		 * Provides robust dark mode support with localStorage persistence.
		 */
		theme: {
			/** Default theme mode on first load (before user selection) */
			defaultMode: "light" | "dark" | "system";
			/** localStorage key for persisting user's theme preference */
			storageKey: string;
			/** Selected color palette for the application (shadcn-svelte compatible) */
			colorPalette: "slate" | "gray" | "zinc" | "neutral" | "stone";
			/** Border radius in rem units (e.g., 0.625 = 10px) */
			radius: number;
			/** Theme validation configuration */
			validation: {
				/** Enable theme validation during development/build */
				enabled: boolean;
				/** Strict mode: Prevent hardcoded z-index, @apply in components */
				strictMode: boolean;
				/** Check WCAG color contrast compliance (AA level) */
				checkColorContrast: boolean;
				/** Verify stacking context violations (transform/opacity on navigation) */
				checkStackingContext: boolean;
				/** Check for inline styles (style="...") in component templates - HIGH SEVERITY */
				checkInlineStyles: boolean;
				/** Check for <style> blocks in components (modular CSS architecture) - WARNING */
				checkComponentStyleBlocks: boolean;
				/**
				 * Path-based severity rules for downgrading errors in legacy/demo code
				 * to informational level while maintaining strict validation for production.
				 */
				severityRules: Array<{
					pattern: string;
					severity: "info" | "warning";
					description: string;
				}>;
				/**
				 * Optional: Paths to completely ignore during validation
				 * (Use for third-party code or deprecated files)
				 * Note: Built-in severity classification handles demo/legacy code automatically
				 */
				ignorePaths?: string[];
			};
		};
		/**
		 * Layout Configuration - Flexbox + Grid Hybrid Architecture
		 *
		 * Responsive layout system using CSS variables with rem units for scalability.
		 * Compatible with shadcn/ui Sidebar components and patterns.
		 */
		layout: {
			/**
			 * Sidebar width in expanded state (desktop)
			 * Acceptable range: "12rem" to "24rem" (192px to 384px)
			 * Common values: "12rem" (15/85), "16rem" (20/80 - recommended), "20rem" (25/75)
			 */
			sidebarWidth: string;
			/**
			 * Sidebar width in expanded state (mobile)
			 * Acceptable range: "16rem" to "20rem" (256px to 320px)
			 */
			sidebarWidthMobile: string;
			/**
			 * Sidebar width in collapsed/icon mode
			 * Acceptable range: "3rem" to "4rem" (48px to 64px)
			 */
			sidebarWidthIcon: string;
			/**
			 * Sticky header height
			 * Acceptable range: "3rem" to "5rem" (48px to 80px)
			 */
			headerHeight: string;
			/**
			 * Floating navigation footer height
			 * Acceptable range: "3rem" to "5rem" (48px to 80px)
			 */
			footerHeight: string;
			/**
			 * Responsive breakpoints matching Tailwind CSS defaults
			 */
			breakpoints: {
				/** Small devices (sm) - 640px */
				mobile: string;
				/** Medium devices (md) - 768px */
				tablet: string;
				/** Large screens (lg) - 1024px */
				desktop: string;
				/** Extra large screens (xl) - 1280px */
				wide: string;
			};
		};
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
			/**
			 * Collapse mode for shadcn/ui Sidebar integration
			 * - "icon": Collapses to icon-only view
			 * - "offcanvas": Slides off-screen completely
			 * - "none": Non-collapsible sidebar
			 */
			collapsibleMode: "icon" | "offcanvas" | "none";
			/** Header section configuration */
			header: {
				/** Title text displayed in sidebar header */
				title: string;
				/** Description text displayed in sidebar header */
				description: string;
			};
			/** Footer section configuration */
			footer: {
				/** Version text displayed in sidebar footer */
				version: string;
			};
		};
		/** Store configuration for reactive state management */
		stores: {
			/** SPA navigation store configuration */
			spaNavigation: {
				/** Maximum number of loaded content items to cache */
				cacheSize: number;
				/** Timeout in milliseconds for content loading operations */
				loadingTimeout: number;
				/** Enable navigation event tracking for analytics */
				enableAnalytics: boolean;
			};
		};
		/**
		 * Content Layout Configuration
		 *
		 * Controls the layout and typography presentation of content articles.
		 * Based on readability research showing optimal 60-80 character line length.
		 *
		 * Layout Modes:
		 * - "centered": Content centered with max-width (industry standard - GitHub, MDN, Tailwind)
		 * - "left": Content left-aligned with max-width, no auto margins
		 * - "full": Full-width content, spans entire viewport minus sidebar
		 *
		 * Max Width Options (approximate character counts at 16px font):
		 * - "prose": 65ch (~65 chars) - optimal readability, academic papers
		 * - "3xl": 48rem (~750px) - compact, mobile-friendly
		 * - "4xl": 56rem (~900px) - balanced readability (recommended)
		 * - "5xl": 64rem (~1000px) - wider content, more screen usage
		 * - "6xl": 72rem (~1150px) - wide format, data-heavy content
		 * - "full": 100% - no max-width constraint
		 *
		 * Padding Options (rem units):
		 * - "4": 1rem (16px) - minimal spacing
		 * - "6": 1.5rem (24px) - compact
		 * - "8": 2rem (32px) - balanced (recommended)
		 * - "12": 3rem (48px) - spacious
		 * - "16": 4rem (64px) - generous whitespace
		 */
		content: {
			/**
			 * Content layout mode
			 * @default "centered"
			 */
			layoutMode: ContentLayoutMode;
			/**
			 * Maximum content width
			 * @default "4xl"
			 */
			maxWidth: ContentMaxWidth;
			/**
			 * Content padding (horizontal and vertical)
			 * @default "8"
			 */
			padding: ContentPadding;
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
				/** Generated content check command */
				checkGenerated: readonly string[];
				/** ESLint command */
				lint: readonly string[];
			};
			/** TypeScript compiler configuration */
			typescript: {
				/** Path to extend from */
				extendsPath: string;
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
			/** Path configurations for content scaffolding */
			paths: {
				/** Input file for reading unit structure */
				inputFile: string;
				/** Output folder for generated content files */
				outputFolder: string;
			};
			/** Validation prefix for generating unique config IDs */
			validationPrefix: string;
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
		/** Content menu generator configuration */
		contentMenu: {
			/** Path configurations for content menu generation */
			paths: {
				/** Input markdown file path */
				inputFile: string;
				/** Output TypeScript file path */
				outputFile: string;
			};
			/** Validation prefix for generating unique config IDs */
			validationPrefix: string;
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
		/** Flat navigation generator configuration */
		flatNav: {
			/** Path configurations for flat navigation generation */
			paths: {
				/** Input file from content menu generator */
				inputFile: string;
				/** Output navigation map file */
				outputFile: string;
			};
			/** Validation prefix for generating unique config IDs */
			validationPrefix: string;
			/** Book Overview Entry Configuration */
			bookOverview: {
				/** Unique identifier for book overview entry */
				id: string;
				/** Display title for book overview */
				title: string;
				/** Chapter URL for navigation */
				chapterUrl: string;
				/** TypeScript data file path */
				filePath: string;
				/** Unit title for display context */
				unitTitle: string;
				/** Navigation source for analytics */
				defaultSource: "menu" | "sidebar" | "search" | "breadcrumb" | "sequential" | "direct";
			};
			/** Navigation behavior settings */
			navigation: {
				/** Allow navigation across unit boundaries */
				crossUnitNavigation: boolean;
				/** Skip units with no available content */
				skipEmptyUnits: boolean;
				/** Include debug information in output */
				generateDebugInfo: boolean;
			};
		};
		/** Content creator configuration for CRUD operations */
		contentCreator: {
			/** Path configurations for content creation */
			paths: {
				/** Input file for reading unit structure */
				inputFile: string;
				/** Output folder for content files */
				outputFolder: string;
			};
			/** Validation prefix for generating unique config IDs */
			validationPrefix: string;
			/** Repository service configuration */
			repository: {
				/** Backup directory for content operations */
				backupDirectory: string;
			};
		};
		/** Common file configurations used across multiple scripts */
		common: {
			/** Project configuration files */
			configFiles: {
				/** Package.json path */
				packageJson: string;
				/** TypeScript configuration file */
				tsConfig: string;
			};
			/** File extension patterns */
			extensions: {
				/** TypeScript files */
				typescript: string;
				/** JavaScript files */
				javascript: string;
				/** JSON files */
				json: string;
				/** Markdown files */
				markdown: string;
			};
		};
		/** JSON Schema generation configuration */
		schemas: {
			/** Path configurations for schema generation */
			paths: {
				/** Source file containing Zod schema definitions */
				sourceFile: string;
				/** Output file for consolidated JSON schemas */
				outputFile: string;
			};
			/** Schema generation options (Zod v4 native conversion) */
			generation: {
				/** Zod native target: "draft-2020-12" | "draft-7" | "draft-4" | "openapi-3.0" */
				target: "draft-2020-12" | "draft-7" | "draft-4" | "openapi-3.0";
				/** Schema $id URI */
				schemaId: string;
				/** Schema title */
				title: string;
				/** Zod IO mode: "input" | "output" */
				io: "input" | "output";
				/** How to handle unrepresentable types: "throw" | "any" */
				unrepresentable: "throw" | "any";
				/** How to handle circular references: "ref" | "throw" */
				cycles: "ref" | "throw";
				/** Validate generated schemas */
				validateOutput: boolean;
			};
			/** Validation prefix for generating unique config IDs */
			validationPrefix: string;
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
		"includeCheck" in obj &&
		"includeLint" in obj &&
		typeof (obj as AppSettings["scripts"]["validation"]["generated"]).runAfterGeneration ===
			"boolean" &&
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
