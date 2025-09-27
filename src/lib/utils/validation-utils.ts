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
import { join, isAbsolute } from "path";
import crypto from "crypto";

// Destructure validation configuration at module level for cleaner code
const {
	scripts: { validation: validationConf }
} = SETTINGS;

/**
 * Generate unique configuration ID for test isolation
 * @param prefix Prefix for the config ID (e.g., "test-search-idx")
 * @param testName Optional test name for uniqueness
 */
export function generateConfigId(prefix: string, testName?: string): string {
	const timestamp = Date.now().toString();
	const pid = process.pid.toString();
	const hashInput = `${testName || "default"}-${timestamp}-${pid}`;
	const hash = crypto.createHash("md5").update(hashInput).digest("hex").substring(0, 8);
	return `${prefix}-${hash}`;
}

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
						console.log(`✅ ${fullCommand} completed successfully`);
					} else {
						console.log(`${fullCommand} completed successfully`);
					}
				} else {
					if (validationLogging.useEmojis) {
						console.error(`❌ ${fullCommand} failed with exit code ${code}`);
					} else {
						console.error(`${fullCommand} failed with exit code ${code}`);
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
 * Uses dynamic tsconfig.generated.json to check only specified target files
 */
export async function runGeneratedTypeScriptCheck(): Promise<ValidationResult> {
	const { commands: validationCommands } = validationConf;
	return executeWithStreaming(
		validationCommands.checkGenerated[0],
		validationCommands.checkGenerated.slice(1)
	);
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
 * - src/scripts/content-scaffolding.ts (lines 2005, 2303, 2402)
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
 * - content-scaffolding.ts tests
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

	console.log("");
	console.log("🔍 Running post-generation validation...");
	console.log("=====================================");
	console.log(`📁 Target: ${config.target}`);
	console.log(`🔍 Check: ${config.includeCheck ? "✅" : "⏭️"}`);
	console.log(`🧹 Lint: ${config.includeLint ? "✅" : "⏭️"}`);
	console.log("");

	// For generated TypeScript files, we run our specific TypeScript check
	const results: ValidationResult[] = [];

	try {
		// Run lint validation if enabled (Step 1 - BEFORE TypeScript check)
		if (config.includeLint) {
			const lintResult = await runLintValidation(config.target);
			results.push(lintResult);
		}

		// Run TypeScript check validation for generated content (Step 2 - AFTER lint)
		if (config.includeCheck) {
			// Create dynamic tsconfig for this specific target
			await createDynamicTsConfig(config.target, configId);
			const checkResult = await runGeneratedTypeScriptCheck();
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
		}
	} catch (error) {
		console.error("");
		console.error("❌ Generated file validation process failed:");
		console.error(error instanceof Error ? error.message : String(error));

		results.push({
			success: false,
			command: "generated-file-validation",
			output: "",
			error: error instanceof Error ? error.message : String(error)
		});
	}

	// Cleanup temporary files if enabled
	if (results.length > 0) {
		const hasErrors = results.some((r) => !r.success);
		await cleanupValidationFiles(configId, hasErrors);
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
export async function createDynamicTsConfig(target: string, configId?: string): Promise<void> {
	const {
		paths: validationPaths,
		typescript: tsValidationConfig,
		logging: validationLogging
	} = validationConf;

	// Generate unique config filename if configId is provided (test isolation)
	const configDir = validationPaths.tempConfigDir;
	const configFileName = configId
		? `${configId}.tsconfig.json`
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

	const dynamicConfig = {
		...rootTsConfig,
		extends: `${projectRoot}/${tsValidationConfig.extendsPath}`, // Absolute path to extends
		include: [absoluteTarget], // Always use absolute path
		exclude: [...baseExcludes, ...wipExcludes] // Combine base and conditional excludes
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
}

/**
 * Clean up temporary validation files based on cleanup configuration
 * @param configId Optional unique identifier for test isolation
 */
export async function cleanupValidationFiles(
	configId?: string,
	hasErrors?: boolean
): Promise<void> {
	const {
		paths: validationPaths,
		cleanup: cleanupConf,
		logging: validationLogging
	} = validationConf;

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
					console.log("🔍 Retaining temporary files for debugging (validation errors detected)");
				} else {
					console.log("Retaining temporary files for debugging (validation errors detected)");
				}
			}
		}
		return;
	}

	const tempConfigDir = validationPaths.tempConfigDir;

	try {
		if (configId) {
			// Clean up specific test isolation files
			const configFileName = `${configId}.tsconfig.json`;
			const configPath = join(tempConfigDir, configFileName);

			if (fs.existsSync(configPath)) {
				fs.unlinkSync(configPath);
				if (validationLogging.showCommands) {
					if (validationLogging.useEmojis) {
						console.log(`🧹 Cleaned up test config: ${configPath}`);
					} else {
						console.log(`Cleaned up test config: ${configPath}`);
					}
				}
			}
		} else {
			// Clean up standard temporary files
			const generatedConfigPath = join(tempConfigDir, validationPaths.generatedConfigFile);
			const wipConfigPath = join(tempConfigDir, validationPaths.wipConfigFile);
			const fileListPath = join(tempConfigDir, cleanupConf.fileListName);

			const filesToClean = [generatedConfigPath, wipConfigPath, fileListPath];

			for (const filePath of filesToClean) {
				if (fs.existsSync(filePath)) {
					fs.unlinkSync(filePath);
					if (validationLogging.showCommands) {
						if (validationLogging.useEmojis) {
							console.log(`🧹 Cleaned up: ${filePath}`);
						} else {
							console.log(`Cleaned up: ${filePath}`);
						}
					}
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
