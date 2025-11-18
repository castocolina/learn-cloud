#!/usr/bin/env node
/**
 * Post-Edit Svelte Check Hook
 *
 * Invokes component-validator skill for .svelte files.
 * Non-blocking - shows warnings but doesn't block.
 *
 * Event: PostEdit
 * Filter: *.svelte files
 */

const { execSync } = require("child_process");
const fs = require("fs");

function main(input) {
	const { tool_input } = input;
	const { file_path } = tool_input || {};

	if (!file_path || !file_path.endsWith(".svelte")) {
		return; // Not a Svelte file
	}

	if (!fs.existsSync(file_path)) {
		return; // File doesn't exist
	}

	try {
		console.log(`🔍 Validating Svelte component: ${file_path}`);
		execSync(
			`npx tsx .claude/skills/component-validator/scripts/check-component.ts "${file_path}"`,
			{
				stdio: "inherit"
			}
		);
		console.log(`✅ Svelte validation passed for ${file_path}`);
	} catch {
		// Non-blocking: show error but don't fail
		console.warn(`⚠️  Svelte validation found issues in ${file_path}`);
	}
}

const input = JSON.parse(fs.readFileSync(0, "utf-8"));
main(input);
