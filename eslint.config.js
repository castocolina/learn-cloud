import prettier from "eslint-config-prettier";
import { fileURLToPath } from "node:url";
import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import { configs as tsConfigs, parser as tsParser } from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import svelteConfig from "./svelte.config.js"; // eslint-disable-line import/extensions

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

// Generate ESLint paths dynamically from SvelteKit aliases
const generateESLintPaths = (aliases) => {
	const paths = {};
	for (const [alias, path] of Object.entries(aliases)) {
		// Add both exact alias and wildcard versions with proper relative paths
		paths[alias] = [`./${path}`];
		paths[`${alias}/*`] = [`./${path}/*`];
	}
	return paths;
};

const dynamicPaths = generateESLintPaths(svelteConfig.kit.alias);

// Custom ESLint rule: Prefer $app/state over $app/stores (Svelte 5 runes)
const preferAppState = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Prefer $app/state over deprecated $app/stores for Svelte 5 runes",
			category: "Best Practices"
		},
		messages: {
			preferAppState:
				'Use `page` from "$app/state" instead of "$app/stores" (Svelte 5 runes). Migration: Replace `derived(page, ($page) => ...)` with `$derived.by(() => { const p = page; ... })`. Docs: https://svelte.dev/docs/kit/$app-state'
		}
	},
	create(context) {
		return {
			ImportDeclaration(node) {
				// Check if importing from $app/stores
				if (node.source.value === "$app/stores") {
					// Check if importing 'page' specifically
					const pageImport = node.specifiers.find(
						(spec) => spec.type === "ImportSpecifier" && spec.imported.name === "page"
					);

					if (pageImport) {
						context.report({
							node: pageImport,
							messageId: "preferAppState"
						});
					}
				}
			}
		};
	}
};

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	globalIgnores(
		[
			"node_modules/**", // Dependencies (never lint third-party code)
			".svelte-kit/**", // SvelteKit generated files
			"build/**", // Build output
			"dist/**", // Distribution output
			"src/book/**", // Legacy directory
			"src/data/demo/**", // Demo content (will be removed)
			"src/lib/components/demo/**", // Demo components (will be removed)
			"src/routes/demo/**", // Demo routes (will be removed)
			"src/lib/components/ThemeSwitch.svelte", // Technical debt - TASK 8F
			"src/lib/components/search/SearchBox.svelte", // Technical debt - TASK 8D
			"src/lib/components/search/SearchModal.svelte", // Technical debt - TASK 8D
			"src/lib/components/search/SearchFilters.svelte", // Technical debt - TASK 8D
			"src/lib/components/search/SearchResults.svelte", // Technical debt - TASK 8D
			"src/lib/components/ui/**", // shadcn-svelte components (external)
			"src/lib/actions/swipe.ts", // Technical debt - TASK 8X
			"src/lib/stores/demo-navigation.svelte.ts", // Legacy demo store (not used in production)
			"src/lib/stores/demo-unified-navigation.svelte.ts", // Legacy demo store (not used in production)
			"**/*.md", // Markdown files (handled by Prettier only)
			"package.json", // Configuration file (handled by Prettier only)
			"components.json", // Configuration file (handled by Prettier only)
			".github/**/*.md" // GitHub configuration markdown files
		],
		"Ignore generated files, dependencies, legacy directories, demo content (temporary), problematic components (technical debt), and files handled by Prettier only"
	),
	js.configs.recommended,
	...tsConfigs.recommended,
	...svelte.configs.recommended,
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.typescript,
	prettier,
	...svelte.configs.prettier,
	{
		// CUSTOM RULE: Prefer $app/state over $app/stores (Svelte 5 migration)
		// This rule educates developers about the modern pattern
		plugins: {
			"custom-rules": {
				rules: {
					"prefer-app-state": preferAppState
				}
			}
		},
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		settings: {
			"import/resolver": {
				typescript: {
					alwaysTryTypes: true,
					// Use standard TypeScript configs
					project: ["./.svelte-kit/tsconfig.json", "./tsconfig.json"],
					// Dynamically map SvelteKit aliases from svelte.config.js
					paths: dynamicPaths,
					// Suppress multiple projects warning
					noWarnOnMultipleProjects: true
				},
				node: {
					extensions: [".js", ".jsx", ".ts", ".tsx", ".svelte"]
				}
			}
		},
		rules: {
			// Custom rule: Prefer $app/state over $app/stores
			"custom-rules/prefer-app-state": "error",
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			"no-undef": "off",
			// Allow unused variables that start with underscore (convention for intentionally unused)
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					ignoreRestSiblings: true
				}
			],
			// Configure import rules to work with SvelteKit path aliases
			"import/no-unresolved": [
				"error",
				{
					// Only ignore core SvelteKit aliases that ESLint resolver might not understand
					ignore: [
						"^\\$app/" // SvelteKit internal app module
					]
				}
			],
			"import/extensions": [
				"error",
				"ignorePackages",
				{
					js: "never",
					jsx: "never",
					ts: "never",
					tsx: "never",
					svelte: "always"
				}
			]
		}
	},
	{
		// PERFORMANCE OPTIMIZATION: Enable projectService ONLY for deprecated API checking
		// This is the only rule that requires type information
		// Excludes: shadcn-svelte components, demo content, test files
		files: [
			"src/**/*.{ts,tsx}",
			// Exclude patterns
			"!src/lib/components/demo/**/*",
			"!src/routes/demo/**/*",
			"!src/data/demo/**/*",
			"!src/test/**/*"
		],
		languageOptions: {
			parserOptions: {
				projectService: true // Enable type-aware parsing ONLY here
			}
		},
		rules: {
			// Detect usage of deprecated APIs to maintain code quality
			// Note: This is slow (requires type-checking), limited to src/ for performance
			"@typescript-eslint/no-deprecated": "warn"
		}
	},
	{
		// PERFORMANCE OPTIMIZATION: Type-aware linting for Svelte files
		// Same deprecated API checking as TypeScript files
		files: [
			"src/**/*.svelte",
			// Exclude patterns
			"!src/lib/components/demo/**/*.svelte",
			"!src/routes/demo/**/*.svelte"
		],
		languageOptions: {
			parserOptions: {
				projectService: true, // Enable type-aware parsing ONLY here
				extraFileExtensions: [".svelte"],
				parser: tsParser,
				svelteConfig
			}
		},
		rules: {
			// Detect usage of deprecated APIs in Svelte components
			"@typescript-eslint/no-deprecated": "warn"
		}
	},
	{
		// ExternalLink component handles both external and internal links
		// External links should NOT use resolve(), so disable this rule
		files: ["src/lib/components/renderers/ExternalLink.svelte"],
		rules: {
			"svelte/no-navigation-without-resolve": "off"
		}
	},
	{
		// Store files use $app/stores for now (inline suppressions added for specific imports)
		files: ["src/lib/stores/**/*.ts"],
		rules: {
			"import/extensions": "off" // Disable for SvelteKit store files that use $app imports
		}
	},
	{
		// Reduce severity for files importing from node_modules/svelte
		// Svelte 5 in node_modules causes parsing errors in import/namespace
		// Convert to warning until eslint-plugin-import fully supports Svelte 5
		// Also allow deprecated APIs in shadcn-svelte components (external library)
		files: ["src/lib/components/ui/**/*.svelte.ts", "src/lib/components/ui/**/*.ts"],
		rules: {
			"import/namespace": "warn", // Parse errors from Svelte 5 internal files
			"@typescript-eslint/no-deprecated": "off" // shadcn components may use deprecated Svelte 5 APIs
		}
	},
	{
		// Config files don't need type-aware linting (not included in tsconfig project)
		// This block must come LAST to override projectService from previous blocks
		files: ["*.config.{js,ts}", "*.config.*.{js,ts}", "vitest.config.ts", "playwright.config.ts"],
		languageOptions: {
			parserOptions: {
				projectService: false // Disable projectService for config files
			}
		},
		rules: {
			"@typescript-eslint/no-deprecated": "off" // Type information not available for config files
		}
	}
);
