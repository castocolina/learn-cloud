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
		/**
		 * Theme System Configuration
		 *
		 * Centralized theme configuration including color palettes, modes, and validation.
		 * Provides robust dark mode support with localStorage persistence and system preference detection.
		 *
		 * Color Palettes (shadcn-svelte compatible):
		 * - "slate": Blue-gray tones (current/default) - professional, technical feel
		 * - "gray": Pure gray tones - neutral, balanced
		 * - "zinc": Cool gray tones - modern, clean
		 * - "neutral": Warm gray tones - softer, warmer
		 * - "stone": Warm brown-gray tones - organic, earthy
		 *
		 * Reference: https://ui.shadcn.com/themes
		 */
		theme: {
			/**
			 * Default theme mode on first load
			 * @default "system" - Follows OS preference automatically
			 */
			defaultMode: "system" as const,

			/**
			 * localStorage key for persisting user's theme preference
			 * @default "theme"
			 */
			storageKey: "theme",

			/**
			 * Selected color palette for the application
			 * Changes require updating CSS variables in src/app.css
			 * @default "slate"
			 */
			colorPalette: "slate" as const,

			/**
			 * Border radius in rem units
			 * @default 0.625 (10px at 16px base font size)
			 */
			radius: 0.625,

			/**
			 * Theme validation configuration
			 */
			validation: {
				/**
				 * Enable theme validation during development/build
				 * @default true
				 */
				enabled: true,

				/**
				 * Strict mode: Prevent anti-patterns
				 * - Hardcoded z-index values (must use var(--z-*))
				 * - @apply in component <style> blocks (Tailwind v4 incompatible)
				 * @default true
				 */
				strictMode: true,

				/**
				 * Check WCAG AA color contrast compliance
				 * - Normal text: 4.5:1 minimum
				 * - Large text: 3:1 minimum
				 * @default true
				 */
				checkColorContrast: true,

				/**
				 * Verify stacking context violations
				 * - Detect transform/opacity on navigation elements
				 * - Prevent z-index conflicts
				 * @default true
				 */
				checkStackingContext: true,

				/**
				 * Check for inline styles (style="...") in component templates
				 * - HIGH SEVERITY: Violates modular CSS architecture
				 * - Use Tailwind utility classes or app.css instead
				 * @default true
				 */
				checkInlineStyles: true,

				/**
				 * Check for <style> blocks in components
				 * - WARNING: Suggests modular CSS architecture violation
				 * - Becomes ERROR in strict mode
				 * - Exceptions allowed via severityRules
				 * @default true
				 */
				checkComponentStyleBlocks: true,

				/**
				 * Path-based severity rules for downgrading errors in legacy/demo code
				 * to informational level while maintaining strict validation for production.
				 *
				 * Patterns use String.includes() matching for flexibility.
				 */
				severityRules: [
					{
						pattern: "src/lib/components/search/SearchModal.svelte",
						severity: "info" as const,
						description: "Legacy SearchModal component (to be refactored)"
					},
					{
						pattern: "src/lib/components/ui/",
						severity: "info" as const,
						description: "ShadCN UI components (external library code)"
					},
					{
						pattern: "src/book/",
						severity: "info" as const,
						description: "Legacy HTML content (reference only, not production code)"
					},
					{
						pattern: "demo",
						severity: "info" as const,
						description: "Demo components (not production code)"
					},
					{
						pattern: "src/routes/demo/",
						severity: "warning" as const,
						description: "Demo route pages (may be adopted but require review)"
					}
				]
			}
		},

		/**
		 * Layout Configuration - Flexbox + Grid Hybrid Architecture
		 *
		 * Responsive layout system using CSS variables with rem units for scalability.
		 * Compatible with shadcn/ui Sidebar components and patterns.
		 */
		layout: {
			/**
			 * Sidebar Width Configuration (responsive rem units)
			 *
			 * Common proportions at 1280px viewport:
			 * - "16rem" (256px): 20/80 split ✅ RECOMMENDED (shadcn default)
			 * - "20rem" (320px): 25/75 split (extensive navigation)
			 * - "12rem" (192px): 15/85 split (content-focused)
			 *
			 * Acceptable range: "12rem" to "24rem" (192px to 384px)
			 */
			sidebarWidth: "16rem", // Desktop expanded: 256px (~20% at 1280px)
			sidebarWidthMobile: "18rem", // Mobile expanded: 288px
			sidebarWidthIcon: "4rem", // Collapsed state: 64px (increased for full emoji visibility)

			/**
			 * Header and Footer Heights
			 *
			 * Standard heights for sticky header and floating navigation.
			 * Acceptable range: "3rem" to "5rem" (48px to 80px)
			 */
			headerHeight: "4rem", // 64px - standard header height
			footerHeight: "4rem", // 64px - floating navigation height

			/**
			 * Responsive Breakpoints (Tailwind CSS defaults)
			 *
			 * These match Tailwind's responsive design system:
			 * - mobile (sm): 640px - small devices
			 * - tablet (md): 768px - medium devices
			 * - desktop (lg): 1024px - large screens
			 * - wide (xl): 1280px - extra large screens
			 */
			breakpoints: {
				mobile: "640px", // sm breakpoint
				tablet: "768px", // md breakpoint
				desktop: "1024px", // lg breakpoint
				wide: "1280px" // xl breakpoint
			}
		},
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
			defaultCollapsed: false, // Sidebar expanded by default
			/**
			 * Collapse Mode for shadcn/ui Sidebar integration
			 *
			 * - "icon": Collapses to icon-only view (uses sidebarWidthIcon)
			 * - "offcanvas": Slides off-screen completely (mobile-friendly)
			 * - "none": Non-collapsible sidebar (always visible)
			 */
			collapsibleMode: "icon" as "icon" | "offcanvas" | "none",
			/**
			 * Sidebar Header Configuration
			 *
			 * Displays navigation title and chapter count in sidebar header
			 */
			header: {
				title: "Navigation", // Header title text
				description: "{units} units • {chapters} chapters" // Template with placeholders
			},
			/**
			 * Sidebar Footer Configuration
			 *
			 * Displays book title and version in sidebar footer
			 */
			footer: {
				version: "1.0.0" // Version number (displayed as "v{version}")
			}
		},
		stores: {
			spaNavigation: {
				cacheSize: 50, // Maximum number of loaded content items to cache
				loadingTimeout: 5000, // Timeout in ms for content loading operations
				enableAnalytics: true // Track navigation events for analytics
			}
		},
		/**
		 * Content Layout Configuration
		 *
		 * Controls how content articles are displayed for optimal readability.
		 * Based on typography research showing 60-80 character lines are ideal.
		 *
		 * LAYOUT MODES:
		 * ┌─────────────────────────────────────────────────────────────┐
		 * │ "centered" (RECOMMENDED - Industry Standard)                │
		 * │ Content centered with auto margins                          │
		 * │ Used by: GitHub Docs, MDN, Tailwind, Next.js, Medium       │
		 * │                                                              │
		 * │        ┌──────────────────────┐                            │
		 * │        │   Content Area       │                            │
		 * │        │   (max-width)        │                            │
		 * │        └──────────────────────┘                            │
		 * │                                                              │
		 * ├─────────────────────────────────────────────────────────────┤
		 * │ "left" (Left-Aligned Alternative)                           │
		 * │ Content left-aligned with max-width                         │
		 * │                                                              │
		 * │  ┌──────────────────────┐                                  │
		 * │  │   Content Area       │                                  │
		 * │  │   (max-width)        │                                  │
		 * │  └──────────────────────┘                                  │
		 * │                                                              │
		 * ├─────────────────────────────────────────────────────────────┤
		 * │ "full" (Full Width)                                         │
		 * │ Content spans entire viewport (minus sidebar)               │
		 * │ Use for: dashboards, wide tables, data visualizations       │
		 * │                                                              │
		 * │  ┌──────────────────────────────────────────────────────┐  │
		 * │  │   Content Area (100% width)                          │  │
		 * │  └──────────────────────────────────────────────────────┘  │
		 * └─────────────────────────────────────────────────────────────┘
		 *
		 * MAX WIDTH OPTIONS (Character Count Guide):
		 * - "prose": 65ch (~65 chars) ✅ OPTIMAL for academic/technical reading
		 * - "3xl": 48rem (~750px, ~60-70 chars) - Compact, mobile-friendly
		 * - "4xl": 56rem (~900px, ~70-80 chars) ✅ RECOMMENDED - Balanced
		 * - "5xl": 64rem (~1000px, ~80-90 chars) - Wider, more content
		 * - "6xl": 72rem (~1150px, ~90-100 chars) - Wide format
		 * - "full": 100% - No constraint (use with "full" layout mode)
		 *
		 * PADDING OPTIONS (Whitespace Control):
		 * - "4": 1rem (16px) - Minimal spacing
		 * - "6": 1.5rem (24px) - Compact
		 * - "8": 2rem (32px) ✅ RECOMMENDED - Balanced breathing room
		 * - "12": 3rem (48px) - Spacious, premium feel
		 * - "16": 4rem (64px) - Generous whitespace, luxury
		 */
		content: {
			/**
			 * Layout mode for content presentation
			 *
			 * Options: "centered" | "left" | "full"
			 * @default "centered" - Industry standard (GitHub, MDN, Tailwind)
			 */
			layoutMode: "centered" as const,

			/**
			 * Maximum content width for readability
			 *
			 * Options: "prose" | "3xl" | "4xl" | "5xl" | "6xl" | "full"
			 * @default "4xl" - 56rem (~900px) - Optimal 70-80 character lines
			 *
			 * Scientific Basis: Studies show 60-80 characters per line maximize
			 * reading comprehension and reduce eye fatigue.
			 */
			maxWidth: "4xl" as const,

			/**
			 * Content padding (horizontal and vertical spacing)
			 *
			 * Options: "4" | "6" | "8" | "12" | "16"
			 * @default "8" - 2rem (32px) - Balanced whitespace
			 */
			padding: "8" as const
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
			bookOverview: {
				id: "00_BOOK", // Unique identifier for book overview entry
				title: "Welcome to Mastering Cloud-Native Technologies", // Display title
				chapterUrl: "overview.html", // Chapter URL for navigation
				filePath: "book/overview.ts", // TypeScript data file path
				unitTitle: "Book Overview", // Unit title for display context
				defaultSource: "direct" as const // Navigation source for analytics
			},
			navigation: {
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
