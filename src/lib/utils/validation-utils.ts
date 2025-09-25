/**
 * Shared validation utilities for content generation scripts
 *
 * This module provides common validation functions that can be used by both
 * content scaffolding and content menu generation scripts.
 */

import { spawn, type ChildProcess } from "child_process";
import { SETTINGS } from "$config/settings.js";
import type { ValidationOptions, ValidationResult } from "$types";

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
	return executeWithStreaming("pnpm", ["run", "format:fix", target]);
}

/**
 * Run TypeScript check validation
 * Note: SvelteKit check doesn't support targeting specific files, so it always checks the entire project
 */
export async function runTypeScriptCheck(): Promise<ValidationResult> {
	return executeWithStreaming("pnpm", ["run", "check"]);
}

/**
 * Run TypeScript check validation specifically for generated content
 * Uses tsconfig.generated.json to check only src/data/book/ and src/data/generated/
 */
export async function runGeneratedTypeScriptCheck(): Promise<ValidationResult> {
	return executeWithStreaming("pnpm", ["run", "check:generated"]);
}

/**
 * Run ESLint validation on specific target
 */
export async function runLintValidation(target: string): Promise<ValidationResult> {
	return executeWithStreaming("pnpm", ["run", "lint:fix", target]);
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
		// Run format validation if enabled
		if (config.includeFormat) {
			const formatResult = await runFormatValidation(config.target);
			results.push(formatResult);
		}

		// Run TypeScript check validation for generated content
		if (config.includeCheck) {
			const checkResult = await runGeneratedTypeScriptCheck();
			results.push(checkResult);
		}

		// Run lint validation if enabled
		if (config.includeLint) {
			const lintResult = await runLintValidation(config.target);
			results.push(lintResult);
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
