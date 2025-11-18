#!/usr/bin/env node
/**
 * Post-Edit JSON Check Hook
 *
 * Invokes content-validator skill for .json files in src/data/.
 * Non-blocking - shows warnings but doesn't block.
 *
 * Event: PostEdit
 * Filter: src/data/**\/*.json files
 */

const { execSync } = require("child_process");
const fs = require("fs");

function main(input) {
	const { tool_input } = input;
	const { file_path } = tool_input || {};

	if (!file_path || !file_path.endsWith(".json")) {
		return; // Not a JSON file
	}

	if (!file_path.includes("src/data/")) {
		return; // Not in src/data/ directory
	}

	if (!fs.existsSync(file_path)) {
		return; // File doesn't exist
	}

	try {
		console.log(`🔍 Validating JSON content: ${file_path}`);
		execSync(
			`npx tsx .claude/skills/content-validator/scripts/validate-content.ts "${file_path}"`,
			{
				stdio: "inherit"
			}
		);
		console.log(`✅ JSON validation passed for ${file_path}`);
	} catch {
		// Non-blocking: show error but don't fail
		console.warn(`⚠️  JSON validation found issues in ${file_path}`);
	}
}

const input = JSON.parse(fs.readFileSync(0, "utf-8"));
main(input);
