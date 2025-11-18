#!/usr/bin/env node
/**
 * Post-Edit Bash Syntax Check Hook
 *
 * Validates bash script syntax for .sh files.
 * Non-blocking - shows warnings but doesn't block.
 *
 * Event: PostEdit
 * Filter: *.sh files
 */

const { execSync } = require("child_process");
const fs = require("fs");

function main(input) {
	const { tool_input } = input;
	const { file_path } = tool_input || {};

	if (!file_path || !file_path.endsWith(".sh")) {
		return; // Not a bash script
	}

	if (!fs.existsSync(file_path)) {
		return; // File doesn't exist
	}

	try {
		console.log(`🔍 Checking bash syntax: ${file_path}`);
		// bash -n checks syntax without executing
		execSync(`bash -n "${file_path}"`, {
			stdio: "inherit"
		});
		console.log(`✅ Bash syntax valid for ${file_path}`);
	} catch {
		// Non-blocking: show error but don't fail
		console.warn(`⚠️  Bash syntax error in ${file_path}`);
	}
}

const input = JSON.parse(fs.readFileSync(0, "utf-8"));
main(input);
