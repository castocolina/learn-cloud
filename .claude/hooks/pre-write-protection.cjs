#!/usr/bin/env node
/**
 * Pre-Write Validation Hook
 *
 * Blocks writes to protected files (node_modules, .git, lock files).
 * Uses JavaScript for performance (~15ms execution).
 *
 * Event: PreToolUse (before Write/Edit)
 * Blocks: Protected file patterns
 *
 * @typedef {Object} ToolUseData
 * @property {string} tool_name - Name of tool (Write, Edit)
 * @property {string} file_path - Path to file being written
 */

const fs = require("fs");

/**
 * Protected file patterns
 * These files should never be modified by AI agents
 *
 * @type {Array<RegExp>}
 */
const PROTECTED_PATTERNS = [
	/node_modules\//,
	/\.git\//,
	/pnpm-lock\.yaml$/,
	/package-lock\.json$/,
	/yarn\.lock$/,
	/\.env$/,
	/\.env\.local$/,
	/\.env\.production$/,
	/credentials\.json$/,
	/\.ssh\//,
	/\.aws\//
];

/**
 * Check if file path matches protected patterns
 *
 * @param {string} filePath - Path to check
 * @returns {boolean} True if protected
 */
function isProtectedFile(filePath) {
	return PROTECTED_PATTERNS.some((pattern) => pattern.test(filePath));
}

/**
 * Validate write operation
 *
 * @param {ToolUseData} input - Tool use data from stdin
 */
function main(input) {
	const { tool_name, tool_input } = input;
	const { file_path } = tool_input || {};

	if (!file_path) {
		// No file path, allow
		return;
	}

	// Only check Write and Edit tools
	if (tool_name !== "Write" && tool_name !== "Edit") {
		return;
	}

	if (isProtectedFile(file_path)) {
		console.error(`❌ BLOCKED: Cannot modify protected file ${file_path}`);
		console.error("   Protected patterns: node_modules/, .git/, lock files, .env, credentials");
		process.exit(2); // Exit code 2 = BLOCK operation
	}

	// Allow operation
	console.log(`✓ Write validation passed for ${file_path}`);
}

// Read input from stdin (JSON from Claude Code)
const input = JSON.parse(fs.readFileSync(0, "utf-8"));
main(input);
