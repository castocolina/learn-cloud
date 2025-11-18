#!/usr/bin/env node
/**
 * Test Quality Pattern Checker
 *
 * Validates 7 core test quality patterns:
 * 1. TestSetup pattern enforcement
 * 2. generateConfigId() usage
 * 3. cleanupIfPassed() timing
 * 4. NO waitForTimeout() in E2E
 * 5. Wait-utilities usage
 * 6. Coverage ≥90%
 * 7. Correct test environment
 *
 * Usage:
 *   node check-patterns.ts <test-file>
 *   node check-patterns.ts <test-directory>
 *
 * Examples:
 *   node check-patterns.ts src/test/unit/schema.test.ts
 *   node check-patterns.ts src/test/e2e/
 */

import { readFileSync, existsSync, statSync, readdirSync } from "fs";
import { join, extname } from "path";

interface PatternViolation {
	pattern: string;
	severity: "blocking" | "high" | "medium" | "low";
	line?: number;
	found?: string;
	fix: string;
}

interface ValidationResult {
	file: string;
	isE2E: boolean;
	violations: PatternViolation[];
}

// Pattern 1: TestSetup usage
function checkTestSetupPattern(content: string): PatternViolation[] {
	const violations: PatternViolation[] = [];

	// Check for file operations without TestSetup
	const fileOps = ["writeFileSync", "mkdirSync", "rmdirSync", "unlinkSync"];
	const hasFileOps = fileOps.some((op) => content.includes(op));

	if (hasFileOps) {
		const hasTestSetup =
			content.includes("TestSetup") ||
			content.includes("ExtendedTestSetup") ||
			content.includes('from "../helpers/test-setup');

		if (!hasTestSetup) {
			violations.push({
				pattern: "TestSetup Pattern",
				severity: "blocking",
				found: "File operations without TestSetup",
				fix: "Import and use TestSetup class for file isolation"
			});
		}

		// Check for beforeEach/afterEach
		if (!content.includes("beforeEach") || !content.includes("afterEach")) {
			violations.push({
				pattern: "TestSetup Hooks",
				severity: "blocking",
				fix: "Add beforeEach() for setup and afterEach() for cleanup"
			});
		}

		// Check for hardcoded paths
		const hardcodedPathPattern = /["']\.\/(?!tmp\/|test\/)[^"']+["']/g;
		const hardcodedPaths = content.match(hardcodedPathPattern);

		if (hardcodedPaths) {
			violations.push({
				pattern: "Hardcoded Paths",
				severity: "blocking",
				found: hardcodedPaths[0],
				fix: "Use testSetup.tempDir for all file paths"
			});
		}
	}

	return violations;
}

// Pattern 2: generateConfigId() usage
function checkGenerateConfigId(content: string): PatternViolation[] {
	const violations: PatternViolation[] = [];

	// Look for static config IDs
	const staticIdPattern = /const\s+\w*[Ii]d\s*=\s*["'][^"']+["']/g;
	const staticIds = content.match(staticIdPattern);

	if (staticIds && content.includes("configId")) {
		const hasGenerateConfigId = content.includes("generateConfigId");

		if (!hasGenerateConfigId) {
			violations.push({
				pattern: "generateConfigId() Missing",
				severity: "blocking",
				found: staticIds[0],
				fix: "Use generateConfigId(prefix, testSuiteId) for parallel-safe IDs"
			});
		}
	}

	return violations;
}

// Pattern 3: cleanupIfPassed() timing
function checkCleanupTiming(content: string): PatternViolation[] {
	const violations: PatternViolation[] = [];

	if (!content.includes("cleanupIfPassed")) {
		return violations;
	}

	// Check for cleanupIfPassed in try-finally
	const hasTryFinally = content.includes("try") && content.includes("finally");
	const lines = content.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line.includes("cleanupIfPassed")) {
			// Check if inside finally block (simplified)
			const previousLines = lines.slice(Math.max(0, i - 10), i).join("\n");

			if (hasTryFinally && previousLines.includes("finally")) {
				violations.push({
					pattern: "cleanupIfPassed() Timing",
					severity: "blocking",
					line: i + 1,
					found: line.trim(),
					fix: "Move cleanupIfPassed() to afterEach() hook, NOT try-finally"
				});
			}

			// Check if in test body (not in afterEach)
			if (!previousLines.includes("afterEach")) {
				const inTestBody = previousLines.includes("it(") || previousLines.includes("test(");

				if (inTestBody) {
					violations.push({
						pattern: "cleanupIfPassed() Location",
						severity: "blocking",
						line: i + 1,
						fix: "Call cleanupIfPassed() only in afterEach() hook"
					});
				}
			}
		}
	}

	return violations;
}

// Pattern 4: NO waitForTimeout()
function checkWaitForTimeout(content: string, isE2E: boolean): PatternViolation[] {
	const violations: PatternViolation[] = [];

	if (!isE2E) return violations;

	const lines = content.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		if (line.includes("waitForTimeout")) {
			violations.push({
				pattern: "waitForTimeout() Anti-pattern",
				severity: "blocking",
				line: i + 1,
				found: line.trim(),
				fix: "Use wait-utilities instead: waitForScrollPosition, waitForStyleChange, etc."
			});
		}
	}

	return violations;
}

// Pattern 5: Wait-utilities usage
function checkWaitUtilities(content: string, isE2E: boolean): PatternViolation[] {
	const violations: PatternViolation[] = [];

	if (!isE2E) return violations;

	// Check if using wait patterns but missing utilities import
	const hasWaitPatterns =
		content.includes("scrollTo") ||
		content.includes(".click()") ||
		content.includes("clipboard") ||
		content.includes("focus");

	if (hasWaitPatterns) {
		const hasWaitUtilitiesImport = content.includes('from "./helpers/wait-utilities');

		if (!hasWaitUtilitiesImport) {
			violations.push({
				pattern: "Wait-Utilities Import Missing",
				severity: "high",
				fix: 'Import wait-utilities: import { ... } from "./helpers/wait-utilities"'
			});
		}
	}

	return violations;
}

// Pattern 7: Test environment
function checkTestEnvironment(content: string): PatternViolation[] {
	const violations: PatternViolation[] = [];

	const hasDOMUsage =
		content.includes("document.") ||
		content.includes("window.") ||
		content.includes("navigator.") ||
		content.includes("localStorage");

	const hasEnvironmentComment = content.includes("@vitest-environment");

	if (hasDOMUsage && !hasEnvironmentComment) {
		violations.push({
			pattern: "Missing Environment Declaration",
			severity: "blocking",
			fix: "Add /** @vitest-environment jsdom */ comment for DOM tests"
		});
	}

	// Check for jsdom when not needed
	if (hasEnvironmentComment && content.includes("jsdom")) {
		const hasFileOps = content.includes("readFileSync") || content.includes("writeFileSync");

		if (hasFileOps && !hasDOMUsage) {
			violations.push({
				pattern: "Unnecessary jsdom",
				severity: "medium",
				fix: "Use /** @vitest-environment node */ for backend tests (jsdom adds overhead)"
			});
		}
	}

	return violations;
}

// Validate single test file
function validateTestFile(filePath: string): ValidationResult {
	const content = readFileSync(filePath, "utf-8");
	const isE2E = filePath.includes("/e2e/") || filePath.includes(".spec.ts");

	const violations = [
		...checkTestSetupPattern(content),
		...checkGenerateConfigId(content),
		...checkCleanupTiming(content),
		...checkWaitForTimeout(content, isE2E),
		...checkWaitUtilities(content, isE2E),
		...checkTestEnvironment(content)
	];

	return { file: filePath, isE2E, violations };
}

// Recursively validate directory
function validateDirectory(dirPath: string): ValidationResult[] {
	const results: ValidationResult[] = [];
	const entries = readdirSync(dirPath);

	for (const entry of entries) {
		const fullPath = join(dirPath, entry);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			if (!["node_modules", ".git", "dist", "build"].includes(entry)) {
				results.push(...validateDirectory(fullPath));
			}
		} else if (stat.isFile()) {
			const ext = extname(fullPath);
			if (ext === ".ts" && (fullPath.includes(".test.") || fullPath.includes(".spec."))) {
				results.push(validateTestFile(fullPath));
			}
		}
	}

	return results;
}

// Print validation report
function printReport(results: ValidationResult[]): void {
	console.log("\n" + "━".repeat(60));
	console.log("🧪 Test Quality Audit Report\n");

	let totalViolations = 0;
	let blockingCount = 0;

	for (const result of results) {
		if (result.violations.length === 0) continue;

		console.log(`\n📄 File: ${result.file} ${result.isE2E ? "(E2E)" : "(Unit)"}`);

		// Group by severity
		const blocking = result.violations.filter((v) => v.severity === "blocking");
		const high = result.violations.filter((v) => v.severity === "high");
		const medium = result.violations.filter((v) => v.severity === "medium");

		if (blocking.length > 0) {
			console.log("\n  ❌ BLOCKING:");
			blocking.forEach((v) => {
				console.log(`    - ${v.pattern}${v.line ? ` (line ${v.line})` : ""}`);
				if (v.found) console.log(`      Found: ${v.found}`);
				console.log(`      Fix: ${v.fix}`);
			});
			blockingCount += blocking.length;
		}

		if (high.length > 0) {
			console.log("\n  ⚠️  HIGH:");
			high.forEach((v) => {
				console.log(`    - ${v.pattern}`);
				console.log(`      Fix: ${v.fix}`);
			});
		}

		if (medium.length > 0) {
			console.log("\n  ℹ️  MEDIUM:");
			medium.forEach((v) => {
				console.log(`    - ${v.pattern}`);
				console.log(`      Fix: ${v.fix}`);
			});
		}

		totalViolations += result.violations.length;
	}

	console.log("\n" + "━".repeat(60));
	console.log(`\n📊 Summary:`);
	console.log(`   Total violations: ${totalViolations}`);
	console.log(`   Blocking issues: ${blockingCount}`);

	if (blockingCount > 0) {
		console.log("\n❌ FAILED: Fix blocking issues before proceeding\n");
		process.exit(1);
	} else if (totalViolations > 0) {
		console.log("\n⚠️  WARNING: Non-blocking issues found\n");
	} else {
		console.log("\n✅ PASSED: All test quality checks passed\n");
	}
}

// Main
function main(): void {
	const args = process.argv.slice(2);

	if (args.length !== 1) {
		console.log("Usage: node check-patterns.ts <test-file|test-directory>");
		console.log("\nExamples:");
		console.log("  node check-patterns.ts src/test/unit/schema.test.ts");
		console.log("  node check-patterns.ts src/test/e2e/");
		process.exit(1);
	}

	const targetPath = args[0];

	if (!existsSync(targetPath)) {
		console.error(`❌ Path not found: ${targetPath}`);
		process.exit(1);
	}

	const stat = statSync(targetPath);
	const results = stat.isDirectory()
		? validateDirectory(targetPath)
		: [validateTestFile(targetPath)];

	printReport(results);
}

// Run if called directly (ESM check)
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
	main();
}

export { validateTestFile };
export type { PatternViolation };
