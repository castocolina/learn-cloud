/**
 * Shared validation utilities for content generation scripts
 *
 * This module provides common validation functions that can be used by both
 * content scaffolding and content menu generation scripts.
 */

import { spawn, type ChildProcess } from "child_process";
import { SETTINGS } from "$config/settings.js";
import type { ValidationOptions, ValidationResult } from "$types";
import fs from "fs";
import { join, isAbsolute, dirname, basename, extname, resolve, normalize } from "path";
import crypto from "crypto";
import { parseArgs } from "util";

// Destructure validation configuration at module level for cleaner code
const {
	scripts: { validation: validationConf }
} = SETTINGS;

/**
 * Execute a command with real-time streaming output
 */
async function executeWithStreaming(
	command: string,
	args: string[],
	cwd: string = process.cwd()
): Promise<ValidationResult> {
	const { logging: validationLogging } = validationConf;

	return new Promise((resolve) => {
		const fullCommand = `${command} ${args.join(" ")}`;

		if (validationLogging.showCommands) {
			if (validationLogging.useEmojis) {
				console.log(`🔄 Running: ${fullCommand}`);
			} else {
				console.log(`Running: ${fullCommand}`);
			}
		}

		const child: ChildProcess = spawn(command, args, {
			cwd,
			stdio: ["pipe", "pipe", "pipe"],
			shell: true
		});

		let output = "";
		let errorOutput = "";

		// Stream stdout in real-time
		child.stdout?.on("data", (data: Buffer) => {
			const chunk = data.toString();
			output += chunk;
			if (validationLogging.verboseOutput) {
				process.stdout.write(chunk); // Show real-time output only if verbose
			}
		});

		// Stream stderr in real-time
		child.stderr?.on("data", (data: Buffer) => {
			const chunk = data.toString();
			errorOutput += chunk;
			if (validationLogging.verboseOutput) {
				process.stderr.write(chunk); // Show real-time errors only if verbose
			}
		});

		child.on("close", (code: number) => {
			const success = code === 0;

			if (validationLogging.showCommands) {
				if (success) {
					if (validationLogging.useEmojis) {
						console.log(`✅ ${fullCommand} completed successfully\n`);
					} else {
						console.log(`${fullCommand} completed successfully\n`);
					}
				} else {
					if (validationLogging.useEmojis) {
						console.error(`❌ ${fullCommand} failed with exit code ${code}\n`);
					} else {
						console.error(`${fullCommand} failed with exit code ${code}\n`);
					}
				}
			}

			resolve({
				success,
				command: fullCommand,
				output,
				error: success ? undefined : errorOutput
			});
		});

		child.on("error", (error: Error) => {
			if (validationLogging.showCommands) {
				if (validationLogging.useEmojis) {
					console.error(`❌ Failed to start command: ${error.message}`);
				} else {
					console.error(`Failed to start command: ${error.message}`);
				}
			}
			resolve({
				success: false,
				command: fullCommand,
				output,
				error: error.message
			});
		});
	});
}

/**
 * Run TypeScript check validation specifically for generated content
 * Uses dynamic tsconfig file to check only specified target files
 * @param configPath Absolute path to the TypeScript config file to use
 */
export async function runGeneratedTypeScriptCheck(configPath: string): Promise<ValidationResult> {
	// return executeWithStreaming("npx", ["svelte-check", "--tsconfig", configPath]);
	const { commands: validationCommands } = validationConf;
	return executeWithStreaming(validationCommands.checkGenerated[0], [
		...validationCommands.checkGenerated.slice(1),
		configPath
	]);
}

/**
 * Run ESLint validation on specific target
 */
export async function runLintValidation(target: string): Promise<ValidationResult> {
	const { commands: validationCommands } = validationConf;
	return executeWithStreaming(validationCommands.lint[0], [
		...validationCommands.lint.slice(1),
		target
	]);
}

/**
 * Get validation configuration from settings, with overrides
 */
export function getValidationConfig(
	overrides?: Partial<ValidationOptions>,
	target?: string
): Required<ValidationOptions> {
	const { generated: generatedValidationConfig } = validationConf;

	return {
		target: target || overrides?.target || "",
		includeCheck: overrides?.includeCheck ?? generatedValidationConfig.includeCheck,
		includeLint: overrides?.includeLint ?? generatedValidationConfig.includeLint,
		enabled: overrides?.enabled ?? generatedValidationConfig.runAfterGeneration
	};
}

/**
 * Run validation for generated TypeScript files (content-menu.ts, search-index.ts, etc.)
 *
 * CRITICAL: Test Concurrency Issue Documentation
 * ============================================
 *
 * PROBLEM IDENTIFICATION:
 * This function is called by multiple content generation scripts:
 * - src/scripts/search-indexer.ts (line 1025)
 * - src/scripts/content-menu-generator.ts (line 1023)
 * - src/scripts/content-creator.ts (scaffold command)
 *
 * During concurrent test execution (Vitest parallel mode), multiple instances
 * call this function simultaneously, causing race conditions in the TypeScript
 * validation step (line 208: createDynamicTsConfig) which writes to a shared
 * configuration file: tmp/config/tsconfig.generated.json
 *
 * SYMPTOMS:
 * - Random test failures during parallel execution
 * - "Configuration file not found" errors
 * - Tests overwriting each other's TypeScript configs
 * - Inconsistent validation results
 *
 * SOLUTION (Implementation Required):
 * Add optional `configId` parameter to enable test isolation:
 *
 * ```typescript
 * export async function runGeneratedFileValidation(
 *   target: string,
 *   options?: ValidationOptions,
 *   configId?: string  // NEW: Unique identifier for test isolation
 * ): Promise<ValidationResult[]>
 * ```
 *
 * When `configId` is provided (test environment):
 * - Use unique config filenames: `${configId}.tsconfig.json`
 * - Create test-specific temporary directories
 * - Override cleanup settings from SETTINGS.scripts.validation.cleanup
 * - Enable retainOnError for debugging failed tests
 * - Generate hash-based IDs: `test-search-idx-a3f2b1c4`
 *
 * When `configId` is NOT provided (normal script execution):
 * - Use current behavior with fixed paths (backward compatibility)
 * - Single-process execution works correctly
 *
 * CRITICAL: ALL scripts calling this function need test isolation:
 * - search-indexer.ts tests
 * - content-menu-generator.ts tests
 * - content-creator.ts tests (scaffold command)
 * - Any future flatnav-generator.ts tests (Task 3E)
 *
 * @param target Path to TypeScript file(s) to validate
 * @param options Validation configuration options
 * @param configId Optional unique identifier for test isolation (Task 3E)
 */
export async function runGeneratedFileValidation(
	target: string,
	configId?: string,
	options?: ValidationOptions
): Promise<ValidationResult[]> {
	const config = getValidationConfig(options, target);

	if (!config.enabled) {
		console.log("🔄 Content generation validation is disabled in settings");
		return [
			{
				command: "validation-check",
				success: true,
				output: "Validation disabled",
				error: ""
			}
		];
	}

	// Auto-generate configId if not provided
	const actualConfigId = configId || `random-${crypto.randomBytes(2).toString("hex")}`;

	console.log("");
	console.log("🔍 Running post-generation validation...");
	console.log("=====================================");
	console.log(`🔧 Config ID: ${actualConfigId}`);
	console.log(`📁 Target: ${config.target}`);
	console.log(`🔍 Check: ${config.includeCheck ? "✅" : "⏭️"}`);
	console.log(`🧹 Lint: ${config.includeLint ? "✅" : "⏭️"}`);
	console.log("");

	// For generated TypeScript files, we run our specific TypeScript check
	const results: ValidationResult[] = [];
	let configPath = "";

	try {
		// Run lint validation if enabled (Step 1 - BEFORE TypeScript check)
		if (config.includeLint) {
			const lintResult = await runLintValidation(config.target);
			results.push(lintResult);
		}

		// Run TypeScript check validation for generated content (Step 2 - AFTER lint)
		if (config.includeCheck) {
			// Create dynamic tsconfig for this specific target
			configPath = await createDynamicTsConfig(config.target, actualConfigId);
			const checkResult = await runGeneratedTypeScriptCheck(configPath);
			results.push(checkResult);
		}

		// Summary
		const allSuccessful = results.every((r) => r.success);
		const failedCount = results.filter((r) => !r.success).length;

		console.log("");
		if (allSuccessful) {
			console.log("✅ All generated file validation checks completed successfully!");
		} else {
			console.log(`⚠️  ${failedCount}/${results.length} generated file validation checks failed`);
			if (configPath) {
				console.log(`💡 Failed validation used config: ${configPath}`);
			}
		}
	} catch (error) {
		console.error("");
		console.error("❌ Generated file validation process failed:");
		console.error(error instanceof Error ? error.message : String(error));
		if (configPath) {
			console.error(`💡 Failed validation used config: ${configPath}`);
		}

		results.push({
			success: false,
			command: "generated-file-validation",
			output: "",
			error: error instanceof Error ? error.message : String(error)
		});
	}

	// Cleanup temporary files if enabled
	const hasErrors = results.some((r) => !r.success);
	if (results.length > 0 && configPath) {
		await cleanupValidationFiles(configPath, hasErrors);
	}

	// Exit with error code if validation failed and not in test mode
	if (hasErrors) {
		// Only exit if configId was not provided (not a test)
		console.error(`❌ Validation failed - config used: ${configPath}`);
		process.exit(1);
	}

	return results;
}

/**
 * Create dynamic TypeScript configuration for generated file validation
 * Dynamically generates tmp/config/tsconfig.generated.json based on target
 *
 * @param target Path to TypeScript file(s) to validate
 * @param configId Optional unique identifier for test isolation
 */
export async function createDynamicTsConfig(target: string, configId?: string): Promise<string> {
	const {
		paths: validationPaths,
		typescript: tsValidationConfig,
		logging: validationLogging
	} = validationConf;

	// Generate unique config filename if configId is provided (test isolation)
	const configDir = validationPaths.tempConfigDir;
	const configFileName = configId
		? `tsconfig.generated.${configId}.json`
		: validationPaths.generatedConfigFile;
	const configPath = join(configDir, configFileName);

	// Ensure temp config directory exists
	if (!fs.existsSync(configDir)) {
		fs.mkdirSync(configDir, { recursive: true });
	}

	// Read root tsconfig.json and strip JavaScript-style comments
	const rootTsConfigPath = validationPaths.rootTsConfig;
	if (!fs.existsSync(rootTsConfigPath)) {
		throw new Error(`Root tsconfig.json not found at ${rootTsConfigPath}`);
	}

	const rawConfig = fs.readFileSync(rootTsConfigPath, "utf8");
	// Remove JavaScript-style comments (lines starting with //) and parse
	const cleanedConfig = rawConfig
		.split("\n")
		.filter((line) => !line.trim().startsWith("//"))
		.join("\n");

	const rootTsConfig = JSON.parse(cleanedConfig);

	// Create new configuration with absolute paths for consistency
	const projectRoot = process.cwd();
	// Ensure target is absolute path
	const absoluteTarget = isAbsolute(target) ? target : join(projectRoot, target);

	// Base exclude patterns from root config
	const baseExcludes = rootTsConfig.exclude?.map((path: string) => `${projectRoot}/${path}`) || [];

	// For WIP-style validations (when configId is provided), add additional exclusions
	// to avoid TypeScript errors from problematic node_modules dependencies
	const wipExcludes = configId
		? ["**/node_modules/**", "**/.pnpm/**", "**/dist/**", "**/build/**"]
		: [];

	// ============================================================================
	// TypeScript node_modules Error Prevention Strategy
	// ============================================================================
	// PROBLEM: TypeScript validates dependencies even when excluded because:
	// • "exclude" only prevents compilation, not type checking of imports
	// • Broad include patterns can pull in node_modules indirectly
	// SOLUTION: Multi-layer approach with compiler options + comprehensive exclusions
	// MAINTENANCE: Never remove skipLibCheck or increase maxNodeModuleJsDepth above 0

	const dynamicConfig = {
		...rootTsConfig,
		extends: `${projectRoot}/${tsValidationConfig.extendsPath}`, // Absolute path to extends
		compilerOptions: {
			// CRITICAL: Skip checking .d.ts files in node_modules
			// This prevents TypeScript from validating third-party library definitions
			// which often contain errors that we cannot fix and don't need to validate
			skipLibCheck: true,

			// CRITICAL: Skip checking default library files
			// Prevents validation of built-in TypeScript libs (DOM, ES6, etc.)
			// which can have conflicts with different versions
			skipDefaultLibCheck: true,

			// IMPORTANT: Control how deep TypeScript looks into node_modules
			// Setting to 0 prevents deep traversal of JS files in dependencies
			// This stops cascading errors from poorly typed third-party packages
			maxNodeModuleJsDepth: 0,

			// IMPORTANT: Suppress excess property errors on object literals
			// Allows more flexible object usage without strict property checking
			// Useful for config objects and API responses that may have extra fields
			suppressExcessPropertyErrors: true,

			// HELPFUL: Don't truncate error messages too early
			// Allows us to see full error context for better debugging
			noErrorTruncation: false,

			// PERFORMANCE: Enable incremental compilation
			// Speeds up subsequent runs by reusing previous compilation info
			incremental: true,

			// PERFORMANCE: Store incremental info in cache directory
			// Keeps the main project clean while enabling faster builds and better cache persistence
			tsBuildInfoFile: `${projectRoot}/tmp/cache/.tsbuildinfo-${configId || "validation"}`,

			// Inherit existing compiler options from root config
			...rootTsConfig.compilerOptions
		},
		include: [absoluteTarget], // Always use absolute path
		exclude: [
			// CRITICAL: Exclude entire node_modules tree
			// Multiple patterns ensure complete exclusion regardless of path structure
			`${projectRoot}/node_modules/`,
			`${projectRoot}/node_modules/**/*`,
			"**/node_modules/**",
			"../../node_modules/**",

			// IMPORTANT: Exclude package manager directories
			// These contain duplicate dependencies and cache files
			`${projectRoot}/.pnpm/`,
			`${projectRoot}/.yarn/`,
			`${projectRoot}/.npm/`,

			// IMPORTANT: Exclude build artifacts
			// These are generated files that shouldn't be type-checked
			`${projectRoot}/dist/`,
			`${projectRoot}/build/`,
			`${projectRoot}/.svelte-kit/`,

			// HELPFUL: Exclude temporary and legacy directories
			// These either don't need checking or are deprecated
			`${projectRoot}/tmp/config/`,
			`${projectRoot}/src/book/`,

			// PERFORMANCE: Exclude common non-TS files that might match patterns
			"**/*.min.js",
			"**/*.bundle.js",
			"**/*.vendor.js",

			// Include additional WIP-style exclusions if configId is provided
			...wipExcludes,
			// Include base excludes from root config
			...baseExcludes
		]
	};

	// Write dynamic configuration
	fs.writeFileSync(configPath, JSON.stringify(dynamicConfig, null, 2));

	if (validationLogging.showCommands) {
		if (validationLogging.useEmojis) {
			console.log(`📝 Created dynamic TypeScript config: ${configPath}`);
			console.log(`🎯 Target: ${absoluteTarget}`);
			if (configId) {
				console.log(`🔧 Config ID: ${configId} (test isolation)`);
			}
		} else {
			console.log(`Created dynamic TypeScript config: ${configPath}`);
			console.log(`Target: ${absoluteTarget}`);
			if (configId) {
				console.log(`Config ID: ${configId} (test isolation)`);
			}
		}
	}
	return configPath;
}

/**
 * Clean up temporary validation files based on cleanup configuration
 * @param configPath Path to the config file to clean up
 * @param hasErrors Whether validation had errors
 */
export async function cleanupValidationFiles(
	configPath: string,
	hasErrors?: boolean
): Promise<void> {
	const { cleanup: cleanupConf, logging: validationLogging } = validationConf;

	// Skip cleanup if disabled or retaining files on error
	if (!cleanupConf.autoCleanup || (hasErrors && cleanupConf.retainOnError)) {
		if (validationLogging.showCommands) {
			if (!cleanupConf.autoCleanup) {
				if (validationLogging.useEmojis) {
					console.log("🚫 Automatic cleanup is disabled");
				} else {
					console.log("Automatic cleanup is disabled");
				}
			} else if (hasErrors && cleanupConf.retainOnError) {
				if (validationLogging.useEmojis) {
					console.log(`🔍 Retaining config for debugging: ${configPath}`);
				} else {
					console.log(`Retaining config for debugging: ${configPath}`);
				}
			}
		}
		return;
	}

	try {
		// Clean up the specific config file
		if (fs.existsSync(configPath)) {
			fs.unlinkSync(configPath);
			if (validationLogging.showCommands) {
				if (validationLogging.useEmojis) {
					console.log(`🧹 Cleaned up config: ${configPath}`);
				} else {
					console.log(`Cleaned up config: ${configPath}`);
				}
			}
		}
	} catch (error) {
		if (validationLogging.showCommands) {
			if (validationLogging.useEmojis) {
				console.warn(
					`⚠️  Cleanup warning: ${error instanceof Error ? error.message : String(error)}`
				);
			} else {
				console.warn(`Cleanup warning: ${error instanceof Error ? error.message : String(error)}`);
			}
		}
	}
}

// ============================================================================
// INPUT PARSING AND VALIDATION UTILITIES
// ============================================================================

/**
 * Parse and validate CLI arguments for content scripts
 */
export interface ParsedScaffoldingArgs {
	unit: string;
	type: string;
	id: string;
	dryRun?: boolean;
	forceOverwrite?: boolean;
}

/**
 * Parse CLI arguments using Node.js parseArgs utility
 */
export function parseScaffoldingArgs(argv: string[] = process.argv): ParsedScaffoldingArgs {
	try {
		const { values } = parseArgs({
			args: argv.slice(2),
			options: {
				unit: { type: "string" },
				type: { type: "string" },
				id: { type: "string" },
				"dry-run": { type: "boolean", default: false },
				"force-overwrite": { type: "boolean", default: false }
			}
		});

		// Validate required arguments
		if (!values.unit || !values.type || !values.id) {
			throw new Error("Missing required arguments: --unit, --type, and --id are required");
		}

		return {
			unit: values.unit,
			type: values.type,
			id: values.id,
			dryRun: values["dry-run"],
			forceOverwrite: values["force-overwrite"]
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to parse CLI arguments: ${message}`);
	}
}

/**
 * Validate unit name format
 */
export function validateUnitName(unit: string): { isValid: boolean; error?: string } {
	if (!unit || typeof unit !== "string") {
		return { isValid: false, error: "Unit name must be a non-empty string" };
	}

	// Check for valid unit name format (kebab-case recommended)
	const validFormat = /^[a-z0-9]+(-[a-z0-9]+)*$/;
	if (!validFormat.test(unit)) {
		return {
			isValid: false,
			error: "Unit name must be lowercase, alphanumeric, and use hyphens (e.g., 'python-backend')"
		};
	}

	return { isValid: true };
}

/**
 * Validate content ID format
 */
export function validateContentId(id: string): { isValid: boolean; error?: string } {
	if (!id || typeof id !== "string") {
		return { isValid: false, error: "Content ID must be a non-empty string" };
	}

	// Check for valid ID format (numbers, hyphens, underscores)
	const validFormat = /^[a-zA-Z0-9]+([_-][a-zA-Z0-9]+)*$/;
	if (!validFormat.test(id)) {
		return {
			isValid: false,
			error:
				"Content ID must be alphanumeric and can use hyphens or underscores (e.g., '1-1', 'final_exam')"
		};
	}

	return { isValid: true };
}

/**
 * Parse and validate file path components
 */
export function parseFilePath(filePath: string): {
	isValid: boolean;
	directory?: string;
	filename?: string;
	extension?: string;
	error?: string;
} {
	if (!filePath || typeof filePath !== "string") {
		return { isValid: false, error: "File path must be a non-empty string" };
	}

	try {
		const directory = dirname(filePath);
		const filename = basename(filePath, extname(filePath));
		const extension = extname(filePath);

		return {
			isValid: true,
			directory,
			filename,
			extension
		};
	} catch (error) {
		return {
			isValid: false,
			error: `Invalid file path: ${error instanceof Error ? error.message : String(error)}`
		};
	}
}

/**
 * Normalize and validate directory path
 */
export function validateDirectoryPath(dirPath: string): {
	isValid: boolean;
	normalizedPath?: string;
	error?: string;
} {
	if (!dirPath || typeof dirPath !== "string") {
		return { isValid: false, error: "Directory path must be a non-empty string" };
	}

	try {
		const normalizedPath = normalize(resolve(dirPath));

		// Check if path is within project directory for security
		const projectRoot = process.cwd();
		if (!normalizedPath.startsWith(projectRoot)) {
			return {
				isValid: false,
				error: "Directory path must be within project root for security"
			};
		}

		return {
			isValid: true,
			normalizedPath
		};
	} catch (error) {
		return {
			isValid: false,
			error: `Invalid directory path: ${error instanceof Error ? error.message : String(error)}`
		};
	}
}

/**
 * Parse configuration object with validation
 */
export function parseConfigurationObject<T>(
	input: unknown,
	validator: (obj: unknown) => obj is T
): { isValid: boolean; config?: T; error?: string } {
	try {
		if (!input || typeof input !== "object") {
			return { isValid: false, error: "Configuration must be an object" };
		}

		if (validator(input)) {
			return { isValid: true, config: input };
		} else {
			return { isValid: false, error: "Configuration object failed validation" };
		}
	} catch (error) {
		return {
			isValid: false,
			error: `Configuration parsing error: ${error instanceof Error ? error.message : String(error)}`
		};
	}
}

/**
 * Sanitize string input for safe file operations
 */
export function sanitizeStringInput(input: string): string {
	if (!input || typeof input !== "string") {
		return "";
	}

	// Remove potentially dangerous characters and normalize
	return input
		.trim()
		.replace(/[<>:"|?*]/g, "") // Remove Windows-unsafe characters
		.replace(/\.\./g, "") // Remove parent directory references
		.replace(/^[./]+/, "") // Remove leading dots and slashes
		.substring(0, 255); // Limit length for filesystem compatibility
}

/**
 * Parse JSON string with error handling
 */
export function parseJsonSafely<T = unknown>(
	jsonString: string
): {
	isValid: boolean;
	data?: T;
	error?: string;
} {
	try {
		const data = JSON.parse(jsonString) as T;
		return { isValid: true, data };
	} catch (error) {
		return {
			isValid: false,
			error: `JSON parsing error: ${error instanceof Error ? error.message : String(error)}`
		};
	}
}
