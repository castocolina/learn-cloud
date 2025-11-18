#!/usr/bin/env node
/**
 * Post-Edit TypeScript Quality Check Hook
 *
 * Invokes code-validator skill for .ts/.tsx files.
 * Validates:
 * - TypeScript compilation errors
 * - Unused code (variables, imports, parameters)
 * - Code duplication
 * - Complexity analysis
 *
 * Non-blocking - shows warnings but doesn't block.
 *
 * Event: PostEdit
 * Filter: *.ts, *.tsx files
 */

const { execSync } = require("child_process");
const fs = require("fs");

function main(input) {
	const { tool_input } = input;
	const { file_path } = tool_input || {};

	if (!file_path) return;

	const isTsFile = file_path.endsWith(".ts") || file_path.endsWith(".tsx");
	if (!isTsFile) {
		return; // Not a TypeScript file
	}

	if (!fs.existsSync(file_path)) {
		return; // File doesn't exist
	}

	try {
		console.log(`🔍 Validating TypeScript code quality: ${file_path}`);
		// Use code-validator skill for comprehensive quality checks
		execSync(`npx tsx .claude/skills/code-validator/scripts/check-quality.ts "${file_path}"`, {
			stdio: "inherit"
		});
		console.log(`✅ Code quality validation passed for ${file_path}`);
	} catch {
		// Non-blocking: show error but don't fail
		console.warn(`⚠️  Code quality issues found in ${file_path}`);
		console.warn(`   Run 'make check-wip' for full validation`);
	}
}

const input = JSON.parse(fs.readFileSync(0, "utf-8"));
main(input);
