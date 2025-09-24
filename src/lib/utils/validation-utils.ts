/**
 * Shared validation utilities for content generation scripts
 *
 * This module provides common validation functions that can be used by both
 * content scaffolding and content menu generation scripts.
 */

import { spawn, type ChildProcess } from "child_process";
import { SETTINGS } from "../../config/settings.js";

export interface ValidationOptions {
	/** Target files or directories to validate */
	target?: string;
	/** Whether to run format validation (prettier) */
	includeFormat?: boolean;
	/** Whether to run TypeScript check validation */
	includeCheck?: boolean;
	/** Whether to run lint validation (eslint) */
	includeLint?: boolean;
	/** Whether validation should run at all */
	enabled?: boolean;
}

export interface ValidationResult {
	success: boolean;
	command: string;
	output: string;
	error?: string;
}

/**
 * Execute a command with real-time streaming output
 */
async function executeWithStreaming(
	command: string,
	args: string[],
	cwd: string = process.cwd()
): Promise<ValidationResult> {
	return new Promise((resolve) => {
		console.log(`🔄 Running: ${command} ${args.join(" ")}`);

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
			process.stdout.write(chunk); // Show real-time output
		});

		// Stream stderr in real-time
		child.stderr?.on("data", (data: Buffer) => {
			const chunk = data.toString();
			errorOutput += chunk;
			process.stderr.write(chunk); // Show real-time errors
		});

		child.on("close", (code: number) => {
			const success = code === 0;
			const fullCommand = `${command} ${args.join(" ")}`;

			if (success) {
				console.log(`✅ ${fullCommand} completed successfully`);
			} else {
				console.error(`❌ ${fullCommand} failed with exit code ${code}`);
			}

			resolve({
				success,
				command: fullCommand,
				output,
				error: success ? undefined : errorOutput
			});
		});

		child.on("error", (error: Error) => {
			console.error(`❌ Failed to start command: ${error.message}`);
			resolve({
				success: false,
				command: `${command} ${args.join(" ")}`,
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
	return executeWithStreaming("pnpm", ["run", "format", target]);
}

/**
 * Run TypeScript check validation
 * Note: SvelteKit check doesn't support targeting specific files, so it always checks the entire project
 */
export async function runTypeScriptCheck(): Promise<ValidationResult> {
	return executeWithStreaming("pnpm", ["run", "check"]);
}

/**
 * Run ESLint validation on specific target
 */
export async function runLintValidation(target: string): Promise<ValidationResult> {
	return executeWithStreaming("pnpm", ["run", "lint", target]);
}

/**
 * Get validation configuration from settings, with overrides
 */
export function getValidationConfig(
	overrides?: Partial<ValidationOptions>
): Required<ValidationOptions> {
	const config = SETTINGS.contentScaffolding.validation;

	return {
		target: overrides?.target || "",
		includeFormat: overrides?.includeFormat ?? config.includeFormat,
		includeCheck: overrides?.includeCheck ?? config.includeCheck,
		includeLint: overrides?.includeLint ?? config.includeLint,
		enabled: overrides?.enabled ?? config.runAfterGeneration
	};
}

/**
 * Run comprehensive validation based on configuration
 */
export async function runValidation(options?: ValidationOptions): Promise<ValidationResult[]> {
	const config = getValidationConfig(options);

	if (!config.enabled) {
		console.log("⏭️  Validation disabled in configuration");
		return [];
	}

	if (!config.target) {
		console.error("❌ Validation target is required");
		return [];
	}

	console.log("");
	console.log("🔍 Running post-generation validation...");
	console.log("=====================================");
	console.log(`📁 Target: ${config.target}`);
	console.log(`🎨 Format: ${config.includeFormat ? "✅" : "⏭️"}`);
	console.log(`🔍 Check: ${config.includeCheck ? "✅" : "⏭️"}`);
	console.log(`🧹 Lint: ${config.includeLint ? "✅" : "⏭️"}`);
	console.log("");

	const results: ValidationResult[] = [];

	try {
		// Run format validation
		if (config.includeFormat) {
			const formatResult = await runFormatValidation(config.target);
			results.push(formatResult);

			if (!formatResult.success) {
				console.error("⚠️  Format validation failed, but continuing with other checks...");
			}
		}

		// Run TypeScript check validation
		if (config.includeCheck) {
			const checkResult = await runTypeScriptCheck();
			results.push(checkResult);

			if (!checkResult.success) {
				console.error("⚠️  TypeScript check failed, but continuing with other checks...");
			}
		}

		// Run lint validation
		if (config.includeLint) {
			const lintResult = await runLintValidation(config.target);
			results.push(lintResult);

			if (!lintResult.success) {
				console.error("⚠️  Lint validation failed, but continuing with other checks...");
			}
		}

		// Summary
		const allSuccessful = results.every((r) => r.success);
		const failedCount = results.filter((r) => !r.success).length;

		console.log("");
		if (allSuccessful) {
			console.log("✅ All validation checks completed successfully!");
		} else {
			console.log(`⚠️  ${failedCount}/${results.length} validation checks failed`);
		}
	} catch (error) {
		console.error("");
		console.error("❌ Validation process failed:");
		console.error(error instanceof Error ? error.message : String(error));
		console.error("");
		console.error(
			"💡 You can disable validation by setting contentScaffolding.validation.runAfterGeneration to false in src/config/settings.ts"
		);

		results.push({
			success: false,
			command: "validation",
			output: "",
			error: error instanceof Error ? error.message : String(error)
		});
	}

	return results;
}

/**
 * Run validation for generated content in src/data/book
 */
export async function runContentValidation(): Promise<ValidationResult[]> {
	return runValidation({
		target: "src/data/book/",
		enabled: SETTINGS.contentScaffolding.validation.runAfterGeneration
	});
}

/**
 * Run validation for generated content menu in src/data/generated
 */
export async function runContentMenuValidation(): Promise<ValidationResult[]> {
	return runValidation({
		target: "src/data/generated/content-menu.ts",
		enabled: SETTINGS.contentScaffolding.validation.runAfterGeneration
	});
}

/**
 * Run script-specific validation (prettier + eslint only, no svelte-check)
 * Used for utility scripts in Task 3A-3E
 */
export async function runScriptValidation(target: string): Promise<ValidationResult[]> {
	const config = SETTINGS.scriptValidation;

	if (!config.runAfterGeneration) {
		console.log("⏭️  Script validation disabled in configuration");
		return [];
	}

	if (!target) {
		console.error("❌ Script validation target is required");
		return [];
	}

	console.log("");
	console.log("🔍 Running post-generation script validation...");
	console.log("==============================================");
	console.log(`📁 Target: ${target}`);
	console.log(
		`🎨 Format: ${config.includeFormat ? "✅" : "⏭️"} ${config.autoFix ? "(auto-fix)" : "(check only)"}`
	);
	console.log(
		`🧹 Lint: ${config.includeLint ? "✅" : "⏭️"} ${config.autoFix ? "(auto-fix)" : "(check only)"}`
	);
	console.log(
		`🔍 Svelte Check: ${config.includeSvelteCheck ? "✅" : "⏭️  (scripts don't need svelte-check)"}`
	);
	console.log("");

	const results: ValidationResult[] = [];

	try {
		// Run format validation (with or without auto-fix)
		if (config.includeFormat) {
			const formatArgs = config.autoFix
				? ["run", "format:fix", target]
				: ["run", "format:check", target];

			const formatResult = await executeWithStreaming("pnpm", formatArgs);
			results.push(formatResult);

			if (!formatResult.success) {
				console.error("⚠️  Format validation failed, but continuing with other checks...");
			}
		}

		// Run lint validation (with or without auto-fix)
		if (config.includeLint) {
			const lintArgs = config.autoFix ? ["run", "lint:fix", target] : ["run", "lint:check", target];

			const lintResult = await executeWithStreaming("pnpm", lintArgs);
			results.push(lintResult);

			if (!lintResult.success) {
				console.error("⚠️  Lint validation failed, but continuing with other checks...");
			}
		}

		// NOTE: No svelte-check for scripts (config.includeSvelteCheck should be false)
		if (config.includeSvelteCheck) {
			console.log("⚠️  svelte-check requested for scripts but not recommended - skipping");
		}

		// Summary
		const allSuccessful = results.every((r) => r.success);
		const failedCount = results.filter((r) => !r.success).length;

		console.log("");
		if (allSuccessful) {
			console.log("✅ All script validation checks completed successfully!");
			if (config.autoFix) {
				console.log("🔧 Auto-fix applied for format and lint issues");
			}
		} else {
			console.log(`⚠️  ${failedCount}/${results.length} script validation checks failed`);
		}
	} catch (error) {
		console.error("");
		console.error("❌ Script validation process failed:");
		console.error(error instanceof Error ? error.message : String(error));
		console.error("");
		console.error(
			"💡 You can disable script validation by setting scriptValidation.runAfterGeneration to false in src/config/settings.ts"
		);

		results.push({
			success: false,
			command: "script-validation",
			output: "",
			error: error instanceof Error ? error.message : String(error)
		});
	}

	return results;
}
