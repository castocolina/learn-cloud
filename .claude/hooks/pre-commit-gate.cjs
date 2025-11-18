#!/usr/bin/env node
/**
 * Pre-Commit Quality Gate Hook
 *
 * Runs validation-orchestrator tier 1 + 2 before commit.
 * BLOCKING - prevents commit if validation fails.
 *
 * Event: Pre-commit (via husky)
 * Exit: 1 if validation fails (blocks commit)
 */

const { execSync } = require("child_process");

function main() {
	console.log("🚧 Running pre-commit quality gates...\n");

	try {
		// Tier 1: Modified files only (quick)
		console.log("📋 Tier 1: Checking modified files (make check-wip)...");
		execSync("make check-wip", { stdio: "inherit" });

		// Tier 2: Unit + E2E tests
		console.log("\n🧪 Tier 2: Running tests (pnpm test)...");
		execSync("pnpm test", { stdio: "inherit" });

		console.log("\n✅ Pre-commit validation passed! Proceeding with commit.\n");
		process.exit(0);
	} catch (error) {
		console.error("\n❌ Pre-commit validation FAILED. Fix errors before committing.\n");
		console.error("To bypass (NOT recommended): git commit --no-verify\n");
		process.exit(1); // Block commit
	}
}

main();
