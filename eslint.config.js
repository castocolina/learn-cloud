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

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	globalIgnores(
		[
			"src/book/**", // Legacy directory
			"src/js/validate-mermaid.cjs", // Existing mermaid validation
			"src/data/demo/**", // Demo content (will be removed)
			"src/lib/components/demo/**", // Demo components (will be removed)
			"src/routes/demo/**", // Demo routes (will be removed)
			"src/lib/components/ThemeSwitch.svelte", // Technical debt - TASK 8F
			"src/lib/components/search/SearchBox.svelte", // Technical debt - TASK 8D
			"src/lib/components/search/SearchModal.svelte", // Technical debt - TASK 8D
			"src/lib/components/search/SearchFilters.svelte", // Technical debt - TASK 8D
			"src/lib/components/search/SearchResults.svelte", // Technical debt - TASK 8D
			"src/lib/components/ui/button/button.svelte", // shadcn-svelte component (external)
			"src/lib/actions/swipe.ts" // Technical debt - TASK 8X
		],
		"Ignore legacy directories, demo content (temporary), and problematic components (technical debt)"
	),
	js.configs.recommended,
	...tsConfigs.recommended,
	...svelte.configs.recommended,
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.typescript,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		settings: {
			"import/resolver": {
				typescript: {
					alwaysTryTypes: true,
					project: "./.svelte-kit/tsconfig.json"
				},
				node: {
					extensions: [".js", ".jsx", ".ts", ".tsx", ".svelte"]
				}
			}
		},
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			"no-undef": "off",
			// Allow unused variables that start with underscore (convention for intentionally unused)
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
			],
			// Configure import rules to work with TypeScript path mapping
			"import/no-unresolved": [
				"error",
				{
					ignore: ["^\\$app/", "^\\$lib/", "^\\$types", "^\\$config/", "^\\$data/", "^\\$ui/"]
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
		files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: [".svelte"],
				parser: tsParser,
				svelteConfig
			}
		}
	},
	{
		files: ["src/lib/stores/**/*.ts"],
		rules: {
			"import/extensions": "off" // Disable for SvelteKit store files that use $app imports
		}
	}
);
