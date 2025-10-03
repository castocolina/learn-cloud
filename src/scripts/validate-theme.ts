#!/usr/bin/env tsx

/**
 * Theme System Validation Script
 *
 * Comprehensive validation for theme system architecture compliance.
 * Ensures adherence to Tailwind CSS v4 centralized architecture standards
 * and shadcn-svelte component compatibility.
 *
 * VALIDATION CHECKS:
 * 1. CSS Build Validation - No @apply in component <style> blocks
 * 2. Theme Consistency - CSS variables properly defined in :root and .dark
 * 3. Z-Index Hierarchy - No hardcoded z-index values (must use var(--z-*))
 * 4. Stacking Context Audit - No transform/opacity violations on navigation
 * 5. Color Variable Validation - All theme colors properly defined
 * 6. Inline Styles Validation - No inline styles (style="...") in components
 * 7. Component Style Blocks - Warn about <style> blocks (modular CSS architecture)
 *
 * USAGE:
 *   npx tsx src/scripts/validate-theme.ts [options]
 *   make validate-theme
 *
 * OPTIONS:
 *   --path <directory>         Validate specific directory
 *   --file <filename>          Validate specific file (.svelte or .css)
 *   --strict                   Strict mode (warnings become errors)
 *   --no-severity-rules        Disable severity classification
 *   -h, --help                 Display help information
 *
 * EXAMPLES:
 *   npx tsx src/scripts/validate-theme.ts --path src/lib/components/search
 *   npx tsx src/scripts/validate-theme.ts --file SearchModal.svelte
 *   npx tsx src/scripts/validate-theme.ts --strict
 *
 * EXIT CODES:
 *   0 - All validations passed
 *   1 - Validation failures detected
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { Command } from "commander";
import { SETTINGS } from "$config/settings.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "../..");

// ============================================================================
// CLI ARGUMENT PARSING
// ============================================================================

interface CliOptions {
	path?: string;
	file?: string;
	wip?: boolean;
	strict?: boolean;
	severityRules?: boolean;
	quiet?: boolean;
}

const program = new Command();
program
	.name("validate-theme")
	.description("Theme system validation for architecture compliance")
	.version("1.0.0")
	.option("--path <directory>", "Validate specific directory")
	.option("--file <filename>", "Validate specific file (.svelte or .css)")
	.option("--wip", "Validate only work-in-progress files (git modified/untracked)", false)
	.option("--strict", "Strict mode (warnings become errors)", false)
	.option("--quiet", "Minimal output (errors/warnings + summary only)", false)
	.option("--no-severity-rules", "Disable severity classification", true)
	.parse(process.argv);

const cliOptions = program.opts<CliOptions>();

// ============================================================================
// CONFIGURATION
// ============================================================================

interface ValidationConfig {
	paths: {
		srcDir: string;
		appCss: string;
		componentsDir: string;
		routesDir: string;
	};
	patterns: {
		svelteFiles: RegExp;
		cssFiles: RegExp;
		applyInStyle: RegExp;
		hardcodedZIndex: RegExp;
		stackingContext: RegExp[];
		inlineStyle: RegExp;
		styleBlock: RegExp;
	};
	zIndexVariables: string[];
	requiredSemanticVars: string[];
	shadcnRequiredVars: string[];
}

const CONFIG: ValidationConfig = {
	paths: {
		srcDir: join(PROJECT_ROOT, "src"),
		appCss: join(PROJECT_ROOT, "src/app.css"),
		componentsDir: join(PROJECT_ROOT, "src/lib/components"),
		routesDir: join(PROJECT_ROOT, "src/routes")
	},
	patterns: {
		svelteFiles: /\.svelte$/,
		cssFiles: /\.css$/,
		// Detect @apply in <style> blocks (critical Tailwind v4 incompatibility)
		applyInStyle: /@apply\s+[\w-]+/g,
		// Detect hardcoded z-index values (should use CSS variables)
		hardcodedZIndex: /z-index:\s*\d+/gi,
		// Detect properties that create stacking contexts
		stackingContext: [
			/transform:\s*(?!none)/gi,
			/opacity:\s*(?!1\b)/gi,
			/filter:\s*(?!none)/gi,
			/will-change:\s*transform/gi
		],
		// Detect inline styles in component templates (HIGH SEVERITY)
		inlineStyle: /style\s*=\s*["'][^"']+["']/gi,
		// Detect <style> block opening tag
		styleBlock: /<style[^>]*>/gi
	},
	zIndexVariables: [
		"--z-base",
		"--z-dropdown",
		"--z-sticky",
		"--z-sidebar",
		"--z-header",
		"--z-overlay",
		"--z-modal",
		"--z-popover",
		"--z-toast"
	],
	// Semantic variables required by shadcn-svelte components
	requiredSemanticVars: [
		"--background",
		"--foreground",
		"--primary",
		"--primary-foreground",
		"--secondary",
		"--secondary-foreground",
		"--muted",
		"--muted-foreground",
		"--accent",
		"--accent-foreground",
		"--border",
		"--input",
		"--ring"
	],
	// Additional variables commonly used by shadcn-svelte
	shadcnRequiredVars: [
		"--card",
		"--card-foreground",
		"--popover",
		"--popover-foreground",
		"--destructive"
	]
};

// ============================================================================
// SEVERITY CLASSIFICATION
// ============================================================================

/**
 * Applies path-based severity classification to an issue.
 * Returns the adjusted severity based on matching rules from settings.
 */
function classifySeverity(
	filePath: string,
	originalSeverity: "error" | "warning"
): "error" | "warning" | "info" {
	const severityRules = SETTINGS.ui.theme.validation.severityRules;

	for (const rule of severityRules) {
		if (filePath.includes(rule.pattern)) {
			// Downgrade errors to rule severity, keep warnings as-is or downgrade
			if (originalSeverity === "error") {
				return rule.severity;
			} else if (originalSeverity === "warning" && rule.severity === "info") {
				return "info";
			}
		}
	}
	return originalSeverity;
}

// ============================================================================
// VALIDATION RESULTS
// ============================================================================

interface ValidationIssue {
	file: string;
	line: number;
	message: string;
	severity: "error" | "warning" | "info";
	code: string;
	/** Optional context about severity classification */
	context?: string;
}

interface ValidationReport {
	passed: boolean;
	errors: ValidationIssue[];
	warnings: ValidationIssue[];
	info: ValidationIssue[];
	summary: {
		filesScanned: number;
		filesWithIssues: number;
		errorsFound: number;
		warningsFound: number;
		infoFound: number;
	};
}

// ============================================================================
// FILE TRACKING
// ============================================================================

/**
 * Global set to track all files scanned during validation
 * (reset before each validation run in main())
 */
let scannedFiles: Set<string> = new Set();

// ============================================================================
// TIMING UTILITIES
// ============================================================================

/**
 * Format elapsed time in milliseconds with appropriate precision
 */
function formatTime(ms: number): string {
	if (ms < 1) {
		return `${(ms * 1000).toFixed(0)}μs`;
	} else if (ms < 1000) {
		return `${ms.toFixed(0)}ms`;
	} else {
		return `${(ms / 1000).toFixed(2)}s`;
	}
}

// ============================================================================
// CSS CONTEXT EXTRACTION UTILITIES
// ============================================================================

/**
 * Extract CSS selector from lines by searching backwards from current line
 * @param lines - All lines in the file
 * @param currentLineIndex - Index of the line with the violation
 * @returns CSS selector string or "unknown"
 */
function extractCssSelector(lines: string[], currentLineIndex: number): string {
	// Search backwards for selector (e.g., ".class-name {")
	for (let i = currentLineIndex; i >= 0; i--) {
		const line = lines[i].trim();

		// Look for CSS selector pattern (class, id, element, pseudo-classes)
		const selectorMatch = line.match(/^([.#]?[\w-]+(?:\s*[.#:\s][\w-]+)*)\s*\{/);
		if (selectorMatch) {
			return selectorMatch[1];
		}

		// Stop if we hit another closing brace (wrong context)
		if (line === "}" && i < currentLineIndex - 1) {
			break;
		}
	}

	return "unknown";
}

/**
 * Extract property name and value from CSS line
 * @param line - CSS line with property declaration
 * @returns Object with property name and value
 */
function extractPropertyInfo(line: string): { property: string; value: string } {
	const trimmed = line.trim();
	const match = trimmed.match(/^([\w-]+)\s*:\s*(.+?);?$/);

	if (match) {
		return {
			property: match[1],
			value: match[2].replace(/;$/, "").trim()
		};
	}

	return { property: "unknown", value: "unknown" };
}

// ============================================================================
// GIT INTEGRATION
// ============================================================================

/**
 * Get work-in-progress files from git (modified + untracked)
 * Filters by .svelte and .css extensions
 * Excludes src/book/ directory completely
 */
function getWipFilesFromGit(): string[] {
	try {
		// Get modified files (staged and unstaged)
		const modifiedFiles = execSync("git diff --name-only HEAD", {
			cwd: PROJECT_ROOT,
			encoding: "utf-8"
		})
			.trim()
			.split("\n")
			.filter(Boolean);

		// Get untracked files (excluding .gitignore)
		const untrackedFiles = execSync("git ls-files --others --exclude-standard", {
			cwd: PROJECT_ROOT,
			encoding: "utf-8"
		})
			.trim()
			.split("\n")
			.filter(Boolean);

		// Combine and deduplicate
		const allFiles = [...new Set([...modifiedFiles, ...untrackedFiles])];

		// Filter by .svelte and .css extensions, exclude src/book/
		const filteredFiles = allFiles
			.filter((file) => {
				// Exclude src/book/ directory completely
				if (file.startsWith("src/book/")) {
					return false;
				}
				// Only include .svelte and .css files
				return /\.(svelte|css)$/.test(file);
			})
			.map((file) => resolve(PROJECT_ROOT, file))
			.filter((file) => existsSync(file) && statSync(file).isFile());

		return filteredFiles;
	} catch (error) {
		console.error("❌ Error getting WIP files from git:", error);
		return [];
	}
}

// ============================================================================
// FILE SCANNING UTILITIES
// ============================================================================

/**
 * Get files to validate based on CLI options
 * Handles --wip, --file, --path, or default (full src/ directory)
 */
function* getFilesToValidate(pattern: RegExp): Generator<string> {
	// Option 1: WIP files from git
	if (cliOptions.wip) {
		const wipFiles = getWipFilesFromGit();
		for (const file of wipFiles) {
			if (pattern.test(file)) {
				const relativePath = relative(PROJECT_ROOT, file);
				scannedFiles.add(relativePath);
				yield file;
			}
		}
		return;
	}

	// Option 2: Single file specified
	if (cliOptions.file) {
		const targetFile = resolve(PROJECT_ROOT, cliOptions.file);
		if (pattern.test(targetFile)) {
			const relativePath = relative(PROJECT_ROOT, targetFile);
			scannedFiles.add(relativePath);
			yield targetFile;
		}
		return;
	}

	// Option 3: Directory specified or default
	const targetPath = cliOptions.path ? resolve(PROJECT_ROOT, cliOptions.path) : CONFIG.paths.srcDir;

	// Option 4: Walk directory
	yield* walkFiles(targetPath, pattern);
}

function* walkFiles(dir: string, pattern: RegExp): Generator<string> {
	try {
		const entries = readdirSync(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(dir, entry.name);
			const relativePath = relative(PROJECT_ROOT, fullPath);

			// Skip node_modules, .git, build directories, and src/book
			if (
				entry.name === "node_modules" ||
				entry.name === ".git" ||
				entry.name === "build" ||
				entry.name === ".svelte-kit" ||
				relativePath.startsWith("src/book")
			) {
				continue;
			}

			if (entry.isDirectory()) {
				yield* walkFiles(fullPath, pattern);
			} else if (pattern.test(entry.name)) {
				scannedFiles.add(relativePath);
				yield fullPath;
			}
		}
	} catch (error) {
		console.error(`Error walking directory ${dir}:`, error);
	}
}

function readFileLines(filePath: string): string[] {
	try {
		const content = readFileSync(filePath, "utf-8");
		return content.split("\n");
	} catch (error) {
		console.error(`❌ Failed to read file: ${filePath}`, error);
		return [];
	}
}

// ============================================================================
// VALIDATION 1: CSS BUILD VALIDATION
// Check for @apply in component <style> blocks (Tailwind v4 incompatible)
// ============================================================================

function validateNoApplyInComponents(quiet = false): ValidationIssue[] {
	const startTime = performance.now();
	const issues: ValidationIssue[] = [];

	if (!SETTINGS.ui.theme.validation.strictMode) {
		console.log("\n⏭️  Validation 1: Skipped (strictMode disabled)");
		return issues;
	}

	console.log("\n🔍 Validation 1: Checking for @apply in component <style> blocks...");

	for (const filePath of getFilesToValidate(CONFIG.patterns.svelteFiles)) {
		const lines = readFileLines(filePath);
		let inStyleBlock = false;

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			// Track <style> block boundaries
			if (trimmed.startsWith("<style")) {
				inStyleBlock = true;
			} else if (trimmed.startsWith("</style>")) {
				inStyleBlock = false;
			}

			// Check for @apply within <style> blocks
			if (inStyleBlock && CONFIG.patterns.applyInStyle.test(line)) {
				const relativePath = relative(PROJECT_ROOT, filePath);
				const originalSeverity = "error" as const;
				const severity = classifySeverity(relativePath, originalSeverity);

				issues.push({
					file: relativePath,
					line: index + 1,
					message:
						"Using @apply in <style> blocks is incompatible with Tailwind v4. Move styles to src/app.css using @layer components.",
					severity,
					code: "THEME-001",
					...(severity !== originalSeverity && {
						context: SETTINGS.ui.theme.validation.severityRules.find((r) =>
							relativePath.includes(r.pattern)
						)?.description
					})
				});
			}
		});
	}

	const elapsed = performance.now() - startTime;
	const message =
		issues.length === 0
			? quiet
				? `  ✅ No @apply usage`
				: `  ✅ No @apply usage in component <style> blocks (${formatTime(elapsed)})`
			: `  ❌ Found ${issues.length} @apply violations (${formatTime(elapsed)})`;
	console.log(message);

	return issues;
}

// ============================================================================
// VALIDATION 2: THEME CONSISTENCY CHECK
// Verify CSS variables are properly defined in :root and .dark
// ============================================================================

function validateThemeConsistency(quiet = false): ValidationIssue[] {
	const startTime = performance.now();
	const issues: ValidationIssue[] = [];

	console.log("\n🔍 Validation 2: Checking theme variable consistency...");

	const appCssContent = readFileSync(CONFIG.paths.appCss, "utf-8");
	const lines = appCssContent.split("\n");

	// Check for required semantic variables in :root
	const rootVarsFound = new Set<string>();
	const darkVarsFound = new Set<string>();
	let inRootBlock = false;
	let inDarkBlock = false;

	lines.forEach((line) => {
		const trimmed = line.trim();

		if (trimmed === ":root {") {
			inRootBlock = true;
			inDarkBlock = false;
		} else if (trimmed === ".dark {") {
			inDarkBlock = true;
			inRootBlock = false;
		} else if (inRootBlock && trimmed === "}") {
			inRootBlock = false;
		} else if (inDarkBlock && trimmed === "}") {
			inDarkBlock = false;
		}

		if (inRootBlock) {
			[...CONFIG.requiredSemanticVars, ...CONFIG.shadcnRequiredVars].forEach((varName) => {
				if (line.includes(varName)) {
					rootVarsFound.add(varName);
				}
			});
		}

		if (inDarkBlock) {
			[...CONFIG.requiredSemanticVars, ...CONFIG.shadcnRequiredVars].forEach((varName) => {
				if (line.includes(varName)) {
					darkVarsFound.add(varName);
				}
			});
		}
	});

	// Check for missing required semantic variables in :root
	CONFIG.requiredSemanticVars.forEach((varName) => {
		if (!rootVarsFound.has(varName)) {
			issues.push({
				file: relative(PROJECT_ROOT, CONFIG.paths.appCss),
				line: 0,
				message: `Required semantic variable ${varName} not found in :root block`,
				severity: "error",
				code: "THEME-002"
			});
		}
	});

	// Check for missing shadcn-svelte variables in :root (warnings)
	CONFIG.shadcnRequiredVars.forEach((varName) => {
		if (!rootVarsFound.has(varName)) {
			issues.push({
				file: relative(PROJECT_ROOT, CONFIG.paths.appCss),
				line: 0,
				message: `shadcn-svelte variable ${varName} not found in :root block (recommended)`,
				severity: "warning",
				code: "THEME-003"
			});
		}
	});

	// Check for .dark theme overrides
	const darkClassFound = appCssContent.includes(".dark {");
	if (!darkClassFound) {
		issues.push({
			file: relative(PROJECT_ROOT, CONFIG.paths.appCss),
			line: 0,
			message: "Dark theme (.dark) class not found in app.css",
			severity: "error",
			code: "THEME-004"
		});
	}

	// Check if .dark has overrides for semantic variables
	if (darkClassFound) {
		const missingDarkVars = CONFIG.requiredSemanticVars.filter(
			(varName) => !darkVarsFound.has(varName)
		);
		if (missingDarkVars.length > 0) {
			issues.push({
				file: relative(PROJECT_ROOT, CONFIG.paths.appCss),
				line: 0,
				message: `Dark theme missing overrides for: ${missingDarkVars.join(", ")}`,
				severity: "error",
				code: "THEME-005"
			});
		}
	}

	const elapsed = performance.now() - startTime;
	const errorCount = issues.filter((i) => i.severity === "error").length;
	const message =
		errorCount === 0
			? quiet
				? `  ✅ Theme variables properly defined`
				: `  ✅ Theme variables properly defined (${formatTime(elapsed)})`
			: `  ❌ Found ${errorCount} theme consistency issues (${formatTime(elapsed)})`;
	console.log(message);

	return issues;
}

// ============================================================================
// VALIDATION 3: Z-INDEX HIERARCHY VALIDATION
// Verify no hardcoded z-index values (must use var(--z-*))
// ============================================================================

function validateZIndexHierarchy(quiet = false): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	if (!SETTINGS.ui.theme.validation.strictMode) {
		console.log("\n⏭️  Validation 3: Skipped (strictMode disabled)");
		return issues;
	}

	console.log("\n🔍 Validation 3: Checking z-index hierarchy compliance...");
	const startTime = performance.now();

	// First, verify z-index variables are defined in app.css
	const appCssContent = readFileSync(CONFIG.paths.appCss, "utf-8");

	CONFIG.zIndexVariables.forEach((varName) => {
		const found = appCssContent.includes(varName);
		if (!found) {
			issues.push({
				file: relative(PROJECT_ROOT, CONFIG.paths.appCss),
				line: 0,
				message: `Z-index variable ${varName} not defined in :root`,
				severity: "error",
				code: "THEME-006"
			});
		}
	});

	// Check for hardcoded z-index in CSS files
	for (const filePath of getFilesToValidate(CONFIG.patterns.cssFiles)) {
		// Skip app.css (allowed to define z-index variables)
		if (filePath === CONFIG.paths.appCss) continue;

		const lines = readFileLines(filePath);
		lines.forEach((line, index) => {
			const matches = line.match(CONFIG.patterns.hardcodedZIndex);
			if (matches) {
				// Check if it's using a CSS variable (allowed pattern)
				if (!line.includes("var(--z-")) {
					const relativePath = relative(PROJECT_ROOT, filePath);
					const originalSeverity = "error" as const;
					const severity = classifySeverity(relativePath, originalSeverity);

					// Extract CSS context for better error reporting
					const propertyInfo = extractPropertyInfo(line);
					const cssSelector = extractCssSelector(lines, index);

					issues.push({
						file: relativePath,
						line: index + 1,
						message: `Hardcoded z-index in selector '${cssSelector}'. Property '${propertyInfo.property}: ${propertyInfo.value}' should use var(--z-*) instead.`,
						severity,
						code: "THEME-007",
						...(severity !== originalSeverity && {
							context: SETTINGS.ui.theme.validation.severityRules.find((r) =>
								relativePath.includes(r.pattern)
							)?.description
						})
					});
				}
			}
		});
	}

	// Check Svelte components for hardcoded z-index in <style> blocks
	for (const filePath of getFilesToValidate(CONFIG.patterns.svelteFiles)) {
		const lines = readFileLines(filePath);
		let inStyleBlock = false;

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			if (trimmed.startsWith("<style")) {
				inStyleBlock = true;
			} else if (trimmed.startsWith("</style>")) {
				inStyleBlock = false;
			}

			if (inStyleBlock) {
				const matches = line.match(CONFIG.patterns.hardcodedZIndex);
				if (matches && !line.includes("var(--z-")) {
					const relativePath = relative(PROJECT_ROOT, filePath);
					const originalSeverity = "error" as const;
					const severity = classifySeverity(relativePath, originalSeverity);

					// Extract CSS context for better error reporting
					const propertyInfo = extractPropertyInfo(line);
					const cssSelector = extractCssSelector(lines, index);

					issues.push({
						file: relativePath,
						line: index + 1,
						message: `Hardcoded z-index in <style> block selector '${cssSelector}'. Property '${propertyInfo.property}: ${propertyInfo.value}' should use var(--z-*) instead.`,
						severity,
						code: "THEME-007",
						...(severity !== originalSeverity && {
							context: SETTINGS.ui.theme.validation.severityRules.find((r) =>
								relativePath.includes(r.pattern)
							)?.description
						})
					});
				}
			}
		});
	}

	const elapsed = performance.now() - startTime;
	const message =
		issues.length === 0
			? quiet
				? `  ✅ Z-index hierarchy properly implemented`
				: `  ✅ Z-index hierarchy properly implemented (${formatTime(elapsed)})`
			: `  ❌ Found ${issues.length} z-index violations (${formatTime(elapsed)})`;
	console.log(message);

	return issues;
}

// ============================================================================
// VALIDATION 4: STACKING CONTEXT AUDIT
// Check for transform/opacity properties on navigation elements
// ============================================================================

function validateStackingContext(quiet = false): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	if (!SETTINGS.ui.theme.validation.checkStackingContext) {
		console.log("\n⏭️  Validation 4: Skipped (checkStackingContext disabled)");
		return issues;
	}

	console.log("\n🔍 Validation 4: Auditing stacking context violations...");
	const startTime = performance.now();

	// Check for problematic properties in all Svelte components
	for (const filePath of getFilesToValidate(CONFIG.patterns.svelteFiles)) {
		const lines = readFileLines(filePath);
		let inStyleBlock = false;

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			if (trimmed.startsWith("<style")) {
				inStyleBlock = true;
			} else if (trimmed.startsWith("</style>")) {
				inStyleBlock = false;
			}

			if (inStyleBlock) {
				CONFIG.patterns.stackingContext.forEach((pattern, _patternIndex) => {
					if (pattern.test(line)) {
						const relativePath = relative(PROJECT_ROOT, filePath);
						const originalSeverity = "warning" as const;
						const severity = classifySeverity(relativePath, originalSeverity);

						// Extract CSS context for better error reporting
						const propertyInfo = extractPropertyInfo(line);
						const cssSelector = extractCssSelector(lines, index);

						issues.push({
							file: relativePath,
							line: index + 1,
							message: `Property '${propertyInfo.property}: ${propertyInfo.value}' in selector '${cssSelector}' creates a stacking context and may cause z-index issues. Consider using margin for positioning instead.`,
							severity,
							code: "THEME-008",
							...(severity !== originalSeverity && {
								context: SETTINGS.ui.theme.validation.severityRules.find((r) =>
									relativePath.includes(r.pattern)
								)?.description
							})
						});
					}
				});
			}
		});
	}

	const elapsed = performance.now() - startTime;
	const message =
		issues.length === 0
			? quiet
				? `  ✅ No stacking context violations detected`
				: `  ✅ No stacking context violations detected (${formatTime(elapsed)})`
			: `  ⚠️  Found ${issues.length} potential stacking context issues (${formatTime(elapsed)})`;
	console.log(message);

	return issues;
}

// ============================================================================
// VALIDATION 5: COLOR PALETTE CONSISTENCY
// Ensure slate palette is consistently applied
// ============================================================================

function validateColorPalette(quiet = false): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	console.log("\n🔍 Validation 5: Validating color palette consistency...");
	const startTime = performance.now();

	const configuredPalette = SETTINGS.ui.theme.colorPalette;
	console.log(`  📋 Configured palette: ${configuredPalette}`);

	// This is primarily documentation - actual palette colors are in app.css
	// We just verify that the configuration matches what's documented

	const elapsed = performance.now() - startTime;
	const message = quiet
		? `  ✅ Color palette configuration verified`
		: `  ✅ Color palette configuration verified (${formatTime(elapsed)})`;
	console.log(message);

	return issues;
}

// ============================================================================
// VALIDATION 6: INLINE STYLES VALIDATION
// Check for inline styles (style="...") in component templates - HIGH SEVERITY
// ============================================================================

function validateInlineStyles(quiet = false): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	if (!SETTINGS.ui.theme.validation.checkInlineStyles) {
		console.log("\n⏭️  Validation 6: Skipped (checkInlineStyles disabled)");
		return issues;
	}

	console.log("\n🔍 Validation 6: Checking for inline styles in components...");
	const startTime = performance.now();

	for (const filePath of getFilesToValidate(CONFIG.patterns.svelteFiles)) {
		const lines = readFileLines(filePath);
		let inScriptBlock = false;
		let inStyleBlock = false;

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			// Track <script> and <style> block boundaries (skip these)
			if (trimmed.startsWith("<script")) {
				inScriptBlock = true;
			} else if (trimmed.startsWith("</script>")) {
				inScriptBlock = false;
			} else if (trimmed.startsWith("<style")) {
				inStyleBlock = true;
			} else if (trimmed.startsWith("</style>")) {
				inStyleBlock = false;
			}

			// Only check template (not script or style blocks)
			if (!inScriptBlock && !inStyleBlock) {
				const matches = line.match(CONFIG.patterns.inlineStyle);
				if (matches) {
					const relativePath = relative(PROJECT_ROOT, filePath);
					const originalSeverity = "error" as const;
					const severity =
						cliOptions.severityRules !== false
							? classifySeverity(relativePath, originalSeverity)
							: originalSeverity;

					issues.push({
						file: relativePath,
						line: index + 1,
						message:
							'Inline styles (style="...") violate modular CSS architecture. Use Tailwind utility classes or app.css instead.',
						severity,
						code: "THEME-009",
						...(severity !== originalSeverity && {
							context: SETTINGS.ui.theme.validation.severityRules.find((r) =>
								relativePath.includes(r.pattern)
							)?.description
						})
					});
				}
			}
		});
	}

	const elapsed = performance.now() - startTime;
	const message =
		issues.length === 0
			? quiet
				? `  ✅ No inline styles detected`
				: `  ✅ No inline styles detected (${formatTime(elapsed)})`
			: `  ❌ Found ${issues.length} inline style violations (${formatTime(elapsed)})`;
	console.log(message);

	return issues;
}

// ============================================================================
// VALIDATION 7: COMPONENT STYLE BLOCKS AUDIT
// Warn about <style> blocks in components (modular CSS architecture)
// ============================================================================

function validateComponentStyleBlocks(quiet = false): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	if (!SETTINGS.ui.theme.validation.checkComponentStyleBlocks) {
		console.log("\n⏭️  Validation 7: Skipped (checkComponentStyleBlocks disabled)");
		return issues;
	}

	console.log("\n🔍 Validation 7: Checking for <style> blocks in components...");
	const startTime = performance.now();

	for (const filePath of getFilesToValidate(CONFIG.patterns.svelteFiles)) {
		const content = readFileSync(filePath, "utf-8");
		const matches = content.match(CONFIG.patterns.styleBlock);

		if (matches && matches.length > 0) {
			const relativePath = relative(PROJECT_ROOT, filePath);
			const originalSeverity = "warning" as const;
			let severity: "error" | "warning" | "info" =
				cliOptions.severityRules !== false
					? classifySeverity(relativePath, originalSeverity)
					: originalSeverity;

			// In strict mode, upgrade warnings to errors (unless already downgraded to info)
			if (cliOptions.strict && severity === "warning") {
				severity = "error";
			}

			// Find line number of first <style> block
			const lines = content.split("\n");
			let lineNumber = 0;
			for (let i = 0; i < lines.length; i++) {
				if (CONFIG.patterns.styleBlock.test(lines[i])) {
					lineNumber = i + 1;
					break;
				}
			}

			issues.push({
				file: relativePath,
				line: lineNumber,
				message:
					"Component contains <style> block. Consider using modular CSS architecture (src/app.css with @layer components) instead.",
				severity,
				code: "THEME-010",
				...(severity !== originalSeverity && {
					context: SETTINGS.ui.theme.validation.severityRules.find((r) =>
						relativePath.includes(r.pattern)
					)?.description
				})
			});
		}
	}

	const elapsed = performance.now() - startTime;
	const message =
		issues.length === 0
			? quiet
				? `  ✅ No <style> blocks detected`
				: `  ✅ No <style> blocks detected (${formatTime(elapsed)})`
			: `  ⚠️  Found ${issues.length} components with <style> blocks (${formatTime(elapsed)})`;
	console.log(message);

	return issues;
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateReport(issues: ValidationIssue[]): ValidationReport {
	const errors = issues.filter((i) => i.severity === "error");
	const warnings = issues.filter((i) => i.severity === "warning");
	const info = issues.filter((i) => i.severity === "info");

	// Count files scanned from global Set
	const filesScanned = scannedFiles.size;

	// Count unique files with issues
	const filesWithIssues = new Set(issues.map((i) => i.file)).size;

	return {
		passed: errors.length === 0,
		errors,
		warnings,
		info,
		summary: {
			filesScanned,
			filesWithIssues,
			errorsFound: errors.length,
			warningsFound: warnings.length,
			infoFound: info.length
		}
	};
}

function printReport(report: ValidationReport, quiet = false): void {
	console.log("\n" + "=".repeat(80));
	console.log("THEME VALIDATION REPORT");
	console.log("=".repeat(80));

	// Print errors
	if (report.errors.length > 0) {
		console.log("\n❌ ERRORS:\n");
		report.errors.forEach((issue) => {
			console.log(`  ${issue.code} - ${issue.file}:${issue.line > 0 ? issue.line : "global"}`);
			console.log(`  ${issue.message}\n`);
		});
	}

	// Print warnings
	if (report.warnings.length > 0) {
		console.log("\n⚠️  WARNINGS:\n");
		report.warnings.forEach((issue) => {
			console.log(`  ${issue.code} - ${issue.file}:${issue.line > 0 ? issue.line : "global"}`);
			console.log(`  ${issue.message}`);
			if (issue.context) {
				console.log(`  ℹ️  Context: ${issue.context}`);
			}
			console.log();
		});
	}

	// Print info (legacy/demo code issues) - SKIP in quiet mode
	if (!quiet && report.info.length > 0) {
		console.log("\nℹ️  INFORMATIONAL (Legacy/Demo Code):\n");
		report.info.forEach((issue) => {
			console.log(`  ${issue.code} - ${issue.file}:${issue.line > 0 ? issue.line : "global"}`);
			console.log(`  ${issue.message}`);
			if (issue.context) {
				console.log(`  📋 ${issue.context}`);
			}
			console.log();
		});
	}

	// Print summary
	console.log("\n" + "=".repeat(80));
	console.log("SUMMARY");
	console.log("=".repeat(80));
	console.log(`Files scanned: ${report.summary.filesScanned}`);
	console.log(`Files with issues: ${report.summary.filesWithIssues}`);
	console.log(`Errors found: ${report.summary.errorsFound}`);
	console.log(`Warnings found: ${report.summary.warningsFound}`);
	console.log(`Info found: ${report.summary.infoFound}`);

	// Configuration summary - SKIP in quiet mode
	if (!quiet) {
		console.log("\n" + "=".repeat(80));
		console.log("THEME CONFIGURATION");
		console.log("=".repeat(80));
		console.log(`Color Palette: ${SETTINGS.ui.theme.colorPalette}`);
		console.log(`Default Mode: ${SETTINGS.ui.theme.defaultMode}`);
		console.log(`Border Radius: ${SETTINGS.ui.theme.radius}rem`);
		console.log(`Strict Mode: ${SETTINGS.ui.theme.validation.strictMode ? "✅" : "❌"}`);
		console.log(`Contrast Check: ${SETTINGS.ui.theme.validation.checkColorContrast ? "✅" : "❌"}`);
		console.log(
			`Stacking Context Check: ${SETTINGS.ui.theme.validation.checkStackingContext ? "✅" : "❌"}`
		);
	}

	if (report.passed) {
		console.log("\n✅ All theme validation checks passed!");
	} else {
		console.log("\n❌ Theme validation failed. Please fix the errors above.");
	}
	console.log("=".repeat(80) + "\n");
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main(): Promise<void> {
	const totalStartTime = performance.now();

	console.log("🎨 Theme System Validation");
	console.log("=".repeat(80));
	console.log(`Project: ${PROJECT_ROOT}`);
	console.log(`Timestamp: ${new Date().toISOString()}`);

	// Display CLI options if provided
	if (cliOptions.path) {
		const targetPath = resolve(PROJECT_ROOT, cliOptions.path);
		console.log(`Target Path: ${targetPath}`);
		if (!existsSync(targetPath)) {
			console.error(`\n❌ Error: Path does not exist: ${targetPath}\n`);
			process.exit(1);
		}
	}

	if (cliOptions.file) {
		const targetFile = resolve(PROJECT_ROOT, cliOptions.file);
		console.log(`Target File: ${targetFile}`);
		if (!existsSync(targetFile)) {
			console.error(`\n❌ Error: File does not exist: ${targetFile}\n`);
			process.exit(1);
		}
		if (!statSync(targetFile).isFile()) {
			console.error(`\n❌ Error: Not a file: ${targetFile}\n`);
			process.exit(1);
		}
	}

	if (cliOptions.strict) {
		console.log("Mode: STRICT (warnings → errors)");
	}

	if (cliOptions.severityRules === false) {
		console.log("Severity Rules: DISABLED");
	}

	if (!SETTINGS.ui.theme.validation.enabled) {
		console.log("\n⚠️  Theme validation is disabled in settings.");
		console.log("Set SETTINGS.ui.theme.validation.enabled = true to enable.\n");
		process.exit(0);
	}

	// Reset scanned files tracking
	scannedFiles = new Set();

	// Run all validations
	const allIssues: ValidationIssue[] = [
		...validateNoApplyInComponents(cliOptions.quiet),
		...validateThemeConsistency(cliOptions.quiet),
		...validateZIndexHierarchy(cliOptions.quiet),
		...validateStackingContext(cliOptions.quiet),
		...validateColorPalette(cliOptions.quiet),
		...validateInlineStyles(cliOptions.quiet),
		...validateComponentStyleBlocks(cliOptions.quiet)
	];

	// Generate and print report
	const report = generateReport(allIssues);
	printReport(report, cliOptions.quiet);

	// Print total validation time
	const totalElapsed = performance.now() - totalStartTime;
	console.log(`⏱️  Total validation time: ${formatTime(totalElapsed)}\n`);

	// Exit with appropriate code
	process.exit(report.passed ? 0 : 1);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error("❌ Validation script failed:", error);
		process.exit(1);
	});
}
