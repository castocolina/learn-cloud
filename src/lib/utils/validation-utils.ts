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
import { join } from "path";

/**
 * Execute a command with real-time streaming output
 */
async function executeWithStreaming(
	command: string,
	args: string[],
	cwd: string = process.cwd()
): Promise<ValidationResult> {
	const logging = SETTINGS.scripts.validation.logging;

	return new Promise((resolve) => {
		const fullCommand = `${command} ${args.join(" ")}`;

		if (logging.showCommands) {
			if (logging.useEmojis) {
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
			if (logging.verboseOutput) {
				process.stdout.write(chunk); // Show real-time output only if verbose
			}
		});

		// Stream stderr in real-time
		child.stderr?.on("data", (data: Buffer) => {
			const chunk = data.toString();
			errorOutput += chunk;
			if (logging.verboseOutput) {
				process.stderr.write(chunk); // Show real-time errors only if verbose
			}
		});

		child.on("close", (code: number) => {
			const success = code === 0;

			if (logging.showCommands) {
				if (success) {
					if (logging.useEmojis) {
						console.log(`✅ ${fullCommand} completed successfully`);
					} else {
						console.log(`${fullCommand} completed successfully`);
					}
				} else {
					if (logging.useEmojis) {
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
			if (logging.showCommands) {
				if (logging.useEmojis) {
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
 * Run prettier format validation on specific target
 */
export async function runFormatValidation(target: string): Promise<ValidationResult> {
	const formatCmd = SETTINGS.scripts.validation.commands.format;
	return executeWithStreaming(formatCmd[0], [...formatCmd.slice(1), target]);
}

/**
 * Run TypeScript check validation
 * Note: SvelteKit check doesn't support targeting specific files, so it always checks the entire project
 */
export async function runTypeScriptCheck(): Promise<ValidationResult> {
	const checkCmd = SETTINGS.scripts.validation.commands.check;
	return executeWithStreaming(checkCmd[0], checkCmd.slice(1));
}

/**
 * Run TypeScript check validation specifically for generated content
 * Uses dynamic tsconfig.generated.json to check only specified target files
 */
export async function runGeneratedTypeScriptCheck(): Promise<ValidationResult> {
	const checkCmd = SETTINGS.scripts.validation.commands.checkGenerated;
	return executeWithStreaming(checkCmd[0], checkCmd.slice(1));
}

/**
 * Run ESLint validation on specific target
 */
export async function runLintValidation(target: string): Promise<ValidationResult> {
	const lintCmd = SETTINGS.scripts.validation.commands.lint;
	return executeWithStreaming(lintCmd[0], [...lintCmd.slice(1), target]);
}

/**
 * Get validation configuration from settings, with overrides
 */
export function getValidationConfig(
	overrides?: Partial<ValidationOptions>,
	target?: string
): Required<ValidationOptions> {
	const config = SETTINGS.scripts.validation.generated;

	return {
		target: target || overrides?.target || "",
		includeFormat: overrides?.includeFormat ?? config.includeFormat,
		includeCheck: overrides?.includeCheck ?? config.includeCheck,
		includeLint: overrides?.includeLint ?? config.includeLint,
		enabled: overrides?.enabled ?? config.runAfterGeneration
	};
}

/**
 * Run validation for generated TypeScript files (content-menu.ts, search-index.ts, etc.)
 */
export async function runGeneratedFileValidation(
	target: string,
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
	console.log(`🎨 Format: ${config.includeFormat ? "✅" : "⏭️"}`);
	console.log(`🔍 Check: ${config.includeCheck ? "✅" : "⏭️"}`);
	console.log(`🧹 Lint: ${config.includeLint ? "✅" : "⏭️"}`);
	console.log("");

	// For generated TypeScript files, we run our specific TypeScript check
	const results: ValidationResult[] = [];

	try {
		// Run format validation if enabled (Step 1)
		if (config.includeFormat) {
			const formatResult = await runFormatValidation(config.target);
			results.push(formatResult);
		}

		// Run lint validation if enabled (Step 2 - BEFORE TypeScript check)
		if (config.includeLint) {
			const lintResult = await runLintValidation(config.target);
			results.push(lintResult);
		}

		// Run TypeScript check validation for generated content (Step 3 - AFTER lint)
		if (config.includeCheck) {
			// Create dynamic tsconfig for this specific target
			await createDynamicTsConfig(config.target);
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

	return results;
}

/**
 * Create dynamic TypeScript configuration for generated file validation
 * Dynamically generates tmp/config/tsconfig.generated.json based on target
 */
export async function createDynamicTsConfig(target: string): Promise<void> {
	const paths = SETTINGS.scripts.validation.paths;
	const tsConfig = SETTINGS.scripts.validation.typescript;
	const logging = SETTINGS.scripts.validation.logging;

	const configDir = paths.tempConfigDir;
	const configPath = join(configDir, paths.generatedConfigFile);

	// Ensure temp config directory exists
	if (!fs.existsSync(configDir)) {
		fs.mkdirSync(configDir, { recursive: true });
	}

	// Read root tsconfig.json and strip JavaScript-style comments
	const rootTsConfigPath = paths.rootTsConfig;
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
	const dynamicConfig = {
		...rootTsConfig,
		extends: `${projectRoot}/${tsConfig.extendsPath}`, // Absolute path to extends
		compilerOptions: {
			...rootTsConfig.compilerOptions,
			...tsConfig.compilerOptions // Apply configured compiler options
		},
		include: [`${target}`], // Absolute path to target
		exclude: rootTsConfig.exclude?.map((path: string) => `${projectRoot}/${path}`) || [] // Absolute paths for excludes
	};

	// Write dynamic configuration
	fs.writeFileSync(configPath, JSON.stringify(dynamicConfig, null, 2));

	if (logging.showCommands && logging.useEmojis) {
		console.log(`📝 Created dynamic TypeScript config: ${configPath}`);
		console.log(`🎯 Target: ${target}`);
	} else if (logging.showCommands) {
		console.log(`Created dynamic TypeScript config: ${configPath}`);
		console.log(`Target: ${target}`);
	}
}
