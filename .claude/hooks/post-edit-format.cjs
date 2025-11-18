#!/usr/bin/env node
/**
 * Post-Edit Format Hook
 *
 * Auto-formats files by type after Edit/Write tools.
 * Uses JavaScript for 10x performance (15ms vs 155ms with tsx).
 *
 * Events: PostEdit, PostWrite
 * Filters: All file types with formatters configured
 *
 * @typedef {Object} ToolUseData
 * @property {string} tool_name - Name of tool used (Edit, Write)
 * @property {string} file_path - Path to edited file
 * @property {string} [new_string] - New content (Edit tool)
 * @property {string} [content] - File content (Write tool)
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * File type formatters configuration
 * Maps file extension to formatter command
 *
 * @type {Record<string, (filePath: string) => void>}
 */
const formatters = {
	".ts": (filePath) => {
		execSync(`pnpm prettier --write "${filePath}"`, { stdio: "pipe" });
	},
	".tsx": (filePath) => {
		execSync(`pnpm prettier --write "${filePath}"`, { stdio: "pipe" });
	},
	".js": (filePath) => {
		execSync(`pnpm prettier --write "${filePath}"`, { stdio: "pipe" });
	},
	".svelte": (filePath) => {
		execSync(`pnpm prettier --write "${filePath}"`, { stdio: "pipe" });
	},
	".md": (filePath) => {
		execSync(`pnpm prettier --write "${filePath}"`, { stdio: "pipe" });
	},
	".json": (filePath) => {
		execSync(`pnpm prettier --write "${filePath}"`, { stdio: "pipe" });
	},
	".sh": (filePath) => {
		// Only format if shfmt is available
		try {
			execSync("which shfmt", { stdio: "pipe" });
			execSync(`shfmt -w "${filePath}"`, { stdio: "pipe" });
		} catch {
			// shfmt not available, skip
		}
	}
};

/**
 * Auto-format edited files by extension
 *
 * @param {ToolUseData} inputs - Tool use data from stdin
 */
function main(inputs) {
	const { tool_input } = inputs;
	const { file_path } = tool_input || {};

	if (!file_path) {
		// No file path provided, skip
		return;
	}

	// Get file extension
	const ext = path.extname(file_path);
	const formatter = formatters[ext];

	if (!formatter) {
		// No formatter for this file type, skip
		return;
	}

	// Check file exists
	if (!fs.existsSync(file_path)) {
		console.error(`⚠️  File not found: ${file_path}`);
		return;
	}

	try {
		formatter(file_path);
		console.log(`✓ Formatted ${file_path}`);
	} catch (err) {
		// Don't block on format failures
		console.error(`✗ Format failed for ${file_path}: ${err.message}`);
	}
}

// Read input from stdin (JSON from Claude Code)
const input = JSON.parse(fs.readFileSync(0, "utf-8"));
main(input);
