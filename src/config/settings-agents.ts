/**
 * Agent Settings - Automated Agent Behaviors
 *
 * Configuration for automated agents that enhance development workflows:
 * - Validation agents (quality gates, pre-commit hooks)
 * - Component integration agents (consistency checks, theme compliance)
 * - Test quality agents (pattern enforcement, anti-pattern detection)
 *
 * @module settings-agents
 */

import type { AgentsSettings } from "$types";

/**
 * Agent Configuration Settings
 *
 * Defines behavior for automated agents that validate, integrate, and enforce
 * quality standards across the development lifecycle.
 */
export const AGENTS_SETTINGS: AgentsSettings = {
	validation: {
		/**
		 * Auto-trigger validation when files change
		 * Enables pre-commit hooks and watch mode validation
		 */
		autoTriggerOnFileChange: true,

		/**
		 * Block completion if validation fails
		 * When true, prevents commits/builds on validation errors
		 */
		blockCompletionOnFailure: true,

		/**
		 * Timeout configurations for three-tiered validation strategy
		 */
		tiers: {
			/** Tier 1: Fast WIP check (modified files only) */
			tier1Timeout: 15000, // 15s

			/** Tier 2: Quality checks (theme + unit tests) */
			tier2Timeout: 90000, // 90s

			/** Tier 3: Comprehensive checks (format + lint + check) */
			tier3Timeout: 180000 // 3m
		}
	},

	componentIntegration: {
		/**
		 * Auto-trigger component integration checks after component creation/modification
		 * Ensures new components follow architectural standards
		 */
		autoTriggerAfterComponent: true,

		/**
		 * Required checks that must pass for component integration
		 * Each check enforces specific quality standards:
		 * - showcase-consistency: Component matches showcase patterns
		 * - theme-compliance: Uses theme variables, no hardcoded colors
		 * - mobile-first: Mobile responsive design (≤390px)
		 * - props-interface: TypeScript interfaces for component props
		 * - accessibility: WCAG 2.1 Level AA compliance
		 */
		requiredChecks: [
			"showcase-consistency",
			"theme-compliance",
			"mobile-first",
			"props-interface",
			"accessibility"
		]
	},

	testQuality: {
		/**
		 * Enforce TestSetup pattern for isolated test environments
		 * Prevents race conditions and path duplication issues
		 */
		enforceTestSetupPattern: true,

		/**
		 * Enforce generateConfigId() usage for parallel-safe test IDs
		 * Prevents collisions when tests run in parallel
		 */
		enforceGenerateConfigId: true,

		/**
		 * Enforce wait utilities (waitFor, waitForElement) in E2E tests
		 * Prevents flaky tests from hardcoded delays
		 */
		enforceWaitUtilities: true,

		/**
		 * Disallow waitForTimeout() in E2E tests
		 * Forces proper use of state-based wait utilities
		 */
		noWaitForTimeout: true,

		/**
		 * Minimum test coverage percentage for new features
		 * Default: 90% (lines, functions, statements)
		 */
		minCoverage: 90,

		/**
		 * Auto-block test-architect completion if quality checks fail
		 * When true, prevents task completion until all quality standards met
		 */
		autoBlockOnFailure: true
	},

	tsRefactor: {
		/**
		 * AST manipulation configuration for TypeScript refactoring
		 */
		ast: {
			/**
			 * Preserve original code formatting during AST transformations
			 * Prevents unnecessary formatting changes in refactored code
			 */
			preserveFormatting: true,

			/**
			 * Validate TypeScript compilation after AST changes
			 * Ensures refactored code maintains type safety
			 */
			validateAfter: true,

			/**
			 * Create backup before performing AST refactoring
			 * Enables rollback if refactoring introduces issues
			 */
			backupBeforeRefactor: true,

			/**
			 * Maximum files to process in a single batch
			 * Prevents memory issues with large-scale refactoring
			 */
			maxFilesPerBatch: 50
		},

		/**
		 * ts-morph library configuration for AST manipulation
		 */
		tsmorph: {
			/**
			 * TypeScript compiler options for ts-morph project
			 * Must match tsconfig.json for accurate AST parsing
			 */
			compilerOptions: {
				/** ECMAScript target version */
				target: "ES2022" as const,

				/** Module system */
				module: "ESNext" as const,

				/** Enable all strict type-checking options */
				strict: true
			}
		}
	},

	contentGuardian: {
		/**
		 * Auto-trigger content validation after content creation/modification
		 * Validates educational quality and TypeScript interface compliance
		 */
		autoTriggerAfterContentChange: true,

		/**
		 * Blocking level for content validation
		 * - draft: Non-blocking (warnings only)
		 * - final: Blocking (must pass all validation)
		 */
		blockingLevel: {
			/** Allow draft content with warnings */
			draft: false,

			/** Block final content with violations */
			final: true
		},

		/**
		 * Content status lifecycle validation
		 * Ensures quality gates at each transition
		 */
		statusLifecycle: {
			/** Validate scaffold → draft transition (no template content) */
			validateScaffoldToDraft: true,

			/** Validate draft → final transition (comprehensive checks) */
			validateDraftToFinal: true
		},

		/**
		 * Interactive component standards
		 */
		interactiveStandards: {
			/** Quiz standards: 5 questions, 80% pass */
			quiz: {
				questionCount: 5,
				passingScore: 80
			},

			/** Study guide standards: minimum 8 flashcards */
			studyGuide: {
				minFlashcards: 8
			},

			/** Code completion: exactly 5 underscores per blank */
			codeCompletion: {
				underscoreCount: 5
			}
		},

		/**
		 * Educational quality requirements
		 */
		qualityRequirements: {
			/** Minimum sections for final lesson content */
			minLessonSections: 3,

			/** Require specific, measurable learning objectives */
			requireMeasurableObjectives: true,

			/** Require secure-by-default code examples */
			requireSecureCodeExamples: true,

			/** Validate estimated time is realistic */
			validateEstimatedTime: true
		}
	},

	mermaidValidator: {
		/**
		 * Auto-trigger Mermaid validation after diagram creation/modification
		 * Validates syntax, best practices, and mobile optimization
		 */
		autoTriggerAfterDiagramChange: true,

		/**
		 * Use mmdc (Mermaid CLI) for server-side validation
		 * Provides ~95%+ accuracy compared to browser rendering
		 */
		useMmdcValidation: true,

		/**
		 * Best practice enforcement level
		 * - strict: All best practices required
		 * - recommended: Best practices as warnings
		 */
		bestPracticeLevel: "strict" as const,

		/**
		 * Syntax validation requirements
		 */
		syntaxValidation: {
			/** Enforce double quotes on all node text */
			enforceDoubleQuotes: true,

			/** Warn about HTML entities (prefer raw characters) */
			warnHtmlEntities: true,

			/** Validate bracket syntax consistency */
			validateBracketSyntax: true,

			/** Enforce quote escaping within text */
			enforceQuoteEscaping: true
		},

		/**
		 * Mobile optimization preferences
		 */
		mobileOptimization: {
			/** Prefer Left-to-Right layout for mobile (≤390px) */
			preferLRLayout: true,

			/** Warn when using Top-Down layout */
			warnTDLayout: true,

			/** Test diagrams at mobile viewport width */
			mobileViewportWidth: 390
		},

		/**
		 * TypeScript integration requirements
		 */
		typeScriptIntegration: {
			/** Valid property names for diagram definitions */
			validPropertyNames: ["diagram", "definition", "diagramDefinition"] as const,

			/** Validate all exported diagram objects */
			validateExportedDiagrams: true
		},

		/**
		 * Component integration requirements
		 */
		componentRequirements: {
			/** Require expand functionality (modal) */
			requireExpandButton: true,

			/** Require debug mode support */
			requireDebugMode: true,

			/** Require error handling and fallback UI */
			requireErrorHandling: true,

			/** Require orphaned element cleanup */
			requireCleanup: true,

			/** Require ARIA labels for accessibility */
			requireAriaLabels: true
		},

		/**
		 * Validation blocking behavior
		 * When true, blocks build/commit on Mermaid validation failures
		 */
		blockOnFailure: true
	}
};
