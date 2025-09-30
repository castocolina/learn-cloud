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
				checkGenerated: ["npx", "svelte-check", "--tsconfig"], // Generated content check command
				lint: ["pnpm", "eslint", "--fix", "--no-warn-ignored"] // ESLint command
			},
			typescript: {
				extendsPath: ".svelte-kit/tsconfig.json" // Path to extend from (relative to project root)
			},
			logging: {
				showCommands: true, // Show command execution
				useEmojis: true, // Use emojis in output
				showTimestamps: false, // Disable timestamps by default
				verboseOutput: true // Show verbose output by default
			},
			cleanup: {
				autoCleanup: true, // Automatically clean temporary files
				retainOnError: true, // Retain config files on validation errors for debugging
				tempFilePrefix: "tsconfig", // Prefix for temporary config files
				fileListName: "files.txt" // Name for file list temporary file
			}
		},
		contentMenu: {
			paths: {
				inputFile: "CONTENT.md", // Input markdown file path
				outputFile: "src/data/generated/content-menu.ts" // Output TypeScript file path
			},
			validationPrefix: "content-menu" // Prefix for validation config IDs
		},
		searchIndex: {
			validationPrefix: "search-idx",
			paths: {
				inputFolder: "src/data/book",
				outputFile: "src/data/generated/search-index.ts"
			},
			processing: {
				mode: "development",
				enableNLP: false,
				verboseLogging: true,
				maxKeywords: 15,
				minKeywordLength: 3
			},
			fieldBoosts: {
				title: 10,
				summary: 8,
				content: 5,
				codeBlocks: 7,
				diagrams: 6,
				flashcards: 4,
				questions: 5,
				requirements: 6,
				keywords: 9,
				tags: 3
			},
			keywords: {
				cloudNative: [
					"kubernetes",
					"docker",
					"containerization",
					"microservices",
					"orchestration",
					"deployment",
					"scaling",
					"service mesh",
					"istio",
					"helm",
					"operators"
				],
				infrastructure: [
					"terraform",
					"ansible",
					"jenkins",
					"gitlab",
					"ci/cd",
					"infrastructure as code",
					"monitoring",
					"prometheus",
					"grafana",
					"logging",
					"observability"
				],
				languages: ["typescript", "javascript", "python", "go", "rust", "java", "nodejs"],
				databases: [
					"postgresql",
					"mongodb",
					"redis",
					"elasticsearch",
					"database",
					"storage",
					"persistence"
				],
				webTechnologies: [
					"api",
					"rest",
					"graphql",
					"http",
					"websocket",
					"json",
					"xml",
					"oauth",
					"jwt",
					"cors",
					"ssl",
					"tls"
				],
				cloudProviders: [
					"aws",
					"azure",
					"gcp",
					"cloud",
					"serverless",
					"lambda",
					"functions",
					"s3",
					"ec2",
					"rds"
				],
				security: [
					"authentication",
					"authorization",
					"security",
					"encryption",
					"certificate",
					"firewall",
					"vpn",
					"iam",
					"rbac"
				]
			}
		},
		flatNav: {
			paths: {
				inputFile: "src/data/generated/content-menu.ts", // Input from content menu generator
				outputFile: "src/data/generated/flatnav.ts" // Output navigation map
			},
			validationPrefix: "flatnav", // Prefix for validation config IDs
			navigation: {
				homeUrl: "/", // Home page URL for navigation root
				crossUnitNavigation: true, // Allow navigation across unit boundaries
				skipEmptyUnits: true, // Skip units with no available content
				generateDebugInfo: false // Include debug information in output
			}
		},
		contentCreator: {
			paths: {
				inputFile: "src/data/generated/content-menu.ts", // Input file for reading unit structure
				outputFolder: "src/data/book" // Output folder for content files
			},
			validationPrefix: "content-creator", // Prefix for validation config IDs
			repository: {
				backupDirectory: "tmp/backups" // Backup directory for content operations
			}
		},
		common: {
			configFiles: {
				packageJson: "package.json", // Package.json path
				tsConfig: "tsconfig.json" // TypeScript configuration file
			},
			extensions: {
				typescript: ".ts", // TypeScript files
				javascript: ".js", // JavaScript files
				json: ".json", // JSON files
				markdown: ".md" // Markdown files
			}
		},
		scaffolding: {
			paths: {
				inputFile: "src/data/generated/content-menu.ts", // Input file for reading unit structure
				outputFolder: "src/data/book" // Output folder for generated content files
			},
			validationPrefix: "scaffolding", // Prefix for validation config IDs
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
		},
		schemas: {
			paths: {
				sourceFile: "src/lib/schemas/ContentSchemas.ts", // Schema definitions source
				outputFile: "src/data/generated/content-schemas.json" // Single consolidated JSON Schema
			},
			generation: {
				target: "draft-7", // Zod native target: "draft-2020-12" | "draft-7" | "draft-4" | "openapi-3.0"
				schemaId: "https://learn-cloud.example.com/schemas/content-schemas.json", // Schema $id URI
				title: "Cloud-Native Learning Platform Content Schemas", // Schema title
				io: "output", // Zod IO mode: "input" | "output"
				unrepresentable: "any", // How to handle unrepresentable types: "throw" | "any"
				cycles: "ref", // How to handle circular references: "ref" | "throw"
				validateOutput: true // Validate generated schemas
			},
			validationPrefix: "schema-gen" // Prefix for validation config IDs
		}
	}
};

// Note: AppSettings type is now centralized in src/lib/types/config.ts
// and can be imported via: import type { AppSettings } from "$types";
