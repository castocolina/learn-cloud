#!/usr/bin/env node
/**
 * Session Start Hook
 *
 * Auto-injects project context at session start.
 * Displays project standards and agent architecture status.
 *
 * Event: SessionStart
 * Performance: ~10ms (JavaScript native)
 *
 * @typedef {Object} SessionData
 * @property {string} session_id - Session identifier
 */

const fs = require("fs");
const path = require("path");

/**
 * Display project context on session start
 *
 * @param {SessionData} input - Session data from stdin
 */
function main(input) {
	const projectRoot = process.cwd();
	const claudeFile = path.join(projectRoot, "CLAUDE.md");

	console.log("━".repeat(60));
	console.log("🚀 Cloud-Native Learning Platform - Agent Architecture Active");
	console.log("━".repeat(60));

	// Check for CLAUDE.md
	if (fs.existsSync(claudeFile)) {
		console.log("✅ Project standards loaded from CLAUDE.md");
	} else {
		console.log("⚠️  CLAUDE.md not found - project standards unavailable");
	}

	// Check for agent architecture
	const agentsDir = path.join(projectRoot, ".claude/skills");
	if (fs.existsSync(agentsDir)) {
		const skills = fs.readdirSync(agentsDir);
		console.log(`✅ Agent Architecture: ${skills.length} skills active`);
		console.log(`   Skills: ${skills.join(", ")}`);
	}

	// Check for hooks
	const hooksDir = path.join(projectRoot, ".claude/hooks");
	if (fs.existsSync(hooksDir)) {
		const hooks = fs.readdirSync(hooksDir).filter((f) => f.endsWith(".cjs"));
		console.log(`✅ Hooks: ${hooks.length} hooks active`);
	}

	// Display key settings
	console.log("\n📋 Key Configuration:");
	console.log("   • Mobile-first: ≤390px viewport");
	console.log("   • Test coverage: ≥90%");
	console.log("   • TypeScript: Strict mode");
	console.log("   • Validation: 3-tier strategy (check-wip → tests → full)");

	console.log("\n🎯 Ready for collaborative development!");
	console.log("━".repeat(60) + "\n");
}

// Read input from stdin (JSON from Claude Code)
const input = JSON.parse(fs.readFileSync(0, "utf-8"));
main(input);
