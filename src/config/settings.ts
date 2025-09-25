/**
 * Application Configuration Settings
 *
 * Centralized, type-safe configuration for the entire application.
 * This file exports a single SETTINGS object that contains all
 * global application parameters.
 *
 * Type definitions are now centralized in the unified type system
 * at src/lib/types/config.ts and imported via the $types alias.
 */

import type { AppSettings } from "$types";

// Export a single, constant object with all settings.
export const SETTINGS: AppSettings = {
	ui: {
		mermaid: {
			debug: true, // Enabled for development - provides detailed error logging
			modalPagePercent: 90 // Default modal viewport percentage
		},
		flipCard: {
			modalPagePercent: 90 // Default modal viewport percentage for flip cards
		},
		breadcrumb: {
			showIcon: true // Show emoji icon in breadcrumbs by default
		},
		sidebar: {
			collapsible: true, // Enable sidebar collapse functionality
			defaultCollapsed: false // Sidebar expanded by default
		}
	},
	scripts: {
		validation: {
			generated: {
				runAfterGeneration: true, // Run validation after content generation (enabled by default)
				includeFormat: true, // Run format validation
				includeCheck: true, // Run TypeScript check validation
				includeLint: true // Run lint validation
			},
			mermaid: {
				maxParallelFiles: 4, // Process up to 4 files in parallel for optimal performance
				diagramPropertyNames: ["diagram", "definition", "diagramDefinition"], // Property names to search for mermaid diagrams
				verbose: false // Disable verbose output by default
			},
			paths: {
				tempConfigDir: "tmp/config", // Temporary configuration directory
				generatedConfigFile: "tsconfig.generated.json", // Generated TypeScript config filename
				wipConfigFile: "tsconfig.wip.json", // Work-in-progress config filename
				rootTsConfig: "tsconfig.json", // Root TypeScript config path
				svelteKitTsConfig: ".svelte-kit/tsconfig.json" // SvelteKit TypeScript config path
			},
			commands: {
				format: ["pnpm", "run", "format:fix"], // Prettier format command
				check: ["pnpm", "run", "check"], // TypeScript check command
				checkGenerated: ["pnpm", "run", "check:generated"], // Generated content check command
				lint: ["pnpm", "run", "lint:fix", "--no-ignore"] // ESLint command
			},
			typescript: {
				strictness: {
					allowUnusedLocals: true, // Allow unused local variables for flexibility
					allowUnusedParameters: true, // Allow unused parameters for interface compatibility
					allowUnusedTypes: true // Allow unused type definitions for preparatory work
				},
				suppressionPatterns: {
					unusedPrefix: "_", // Prefix for variables to ignore
					typePrefix: "_", // Prefix for types to ignore
					futureUseComment: "// @future-use" // Comment to mark future use items
				},
				compilerOptions: {
					noEmit: true, // Disable emit during validation
					verbatimModuleSyntax: true, // Use verbatim module syntax
					isolatedModules: true // Isolated modules
				},
				extendsPath: ".svelte-kit/tsconfig.json" // Path to extend from (relative to project root)
			},
			eslint: {
				autoFix: true, // Enable auto-fix
				ignoreWarnings: true, // Ignore warnings during validation
				unusedVarPattern: "^_" // Pattern for unused variables to ignore
			},
			logging: {
				showCommands: true, // Show command execution
				useEmojis: true, // Use emojis in output
				showTimestamps: false, // Disable timestamps by default
				verboseOutput: true // Show verbose output by default
			},
			cleanup: {
				autoCleanup: true, // Automatically clean temporary files
				retainOnError: false, // Clean up even on error (change to true for debugging)
				tempFilePrefix: "tsconfig", // Prefix for temporary config files
				fileListName: "files.txt" // Name for file list temporary file
			}
		},
		scaffolding: {
			lessons: {
				sections: 5, // Minimum 5 sections per lesson
				codeBlocks: 1, // Minimum 1 code block per lesson
				diagrams: 1 // Minimum 1 diagram per lesson
			},
			quizzes: {
				questions: 10, // Minimum 10 questions per quiz
				diverseTypes: true // Use diverse question types
			},
			exams: {
				questions: 30, // Minimum 30 questions per exam
				diverseTypes: true // Use diverse question types
			},
			studyGuides: {
				flashcards: 5 // Minimum 5 flashcards per study guide
			},
			projects: {
				sections: 5, // Minimum 5 sections per project
				requirements: 5, // Minimum 5 requirements per project
				deliverables: 3 // Minimum 3 deliverables per project
			},
			contentLengths: {
				summary: 200,
				paragraph: 500,
				longParagraph: 800,
				question: 80,
				explanation: 300,
				flashcardQuestion: 60,
				flashcardAnswer: 400,
				objective: 50,
				requirement: 100,
				deliverable: 80,
				diagramTitle: 60,
				diagramCaption: 150
			}
		}
	}
};

// Note: AppSettings type is now centralized in src/lib/types/config.ts
// and can be imported via: import type { AppSettings } from "$types";
