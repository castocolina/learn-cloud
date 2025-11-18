#!/usr/bin/env node
/**
 * Mermaid Best Practices Checker
 *
 * Validates Mermaid diagrams against MERMAID-STANDARDS.md best practices:
 * 1. Double quote all text
 * 2. Prefer raw special characters (< > &)
 * 3. Escape quotes within text
 * 4. Consistent bracket syntax
 * 5. Link text format
 *
 * Usage:
 *   node best-practices-check.ts <diagram-code>
 *   node best-practices-check.ts <file-path>
 *
 * Examples:
 *   node best-practices-check.ts 'graph LR\n  A[Node]'
 *   node best-practices-check.ts src/data/diagrams.ts
 */

import { readFileSync, existsSync } from "fs";

interface BestPracticeViolation {
	type: string;
	severity: "high" | "medium" | "low";
	line?: number;
	found?: string;
	fix: string;
	rationale?: string;
}

/**
 * Find line number of match in diagram code
 */
function findLineNumber(diagramCode: string, index: number): number {
	const upToMatch = diagramCode.substring(0, index);
	return upToMatch.split("\n").length;
}

/**
 * Check 1: Double quote all text
 */
function checkDoubleQuotes(diagramCode: string): BestPracticeViolation[] {
	const violations: BestPracticeViolation[] = [];

	// Pattern: Node definitions like A[Text] or A["Text"]
	const nodePattern = /(\w+)\[([^\]]+)\]/g;
	let match;

	while ((match = nodePattern.exec(diagramCode)) !== null) {
		const nodeText = match[2];

		// Skip if already properly quoted
		if (nodeText.startsWith('"') && nodeText.endsWith('"')) {
			continue;
		}

		violations.push({
			type: "missing-quotes",
			severity: "high",
			line: findLineNumber(diagramCode, match.index),
			found: match[0],
			fix: `Use double quotes: ${match[1]}["${nodeText}"]`,
			rationale: "Prevents parsing errors with special characters"
		});
	}

	// Pattern: Link text like -->|Yes| or -->|"Yes"|
	const linkTextPattern = /-->\|([^|]+)\|/g;

	while ((match = linkTextPattern.exec(diagramCode)) !== null) {
		const linkText = match[1];

		if (!linkText.startsWith('"') || !linkText.endsWith('"')) {
			violations.push({
				type: "unquoted-link-text",
				severity: "high",
				line: findLineNumber(diagramCode, match.index),
				found: match[0],
				fix: `Quote link text: -->|"${linkText}"|`,
				rationale: "Ensures consistent link text formatting"
			});
		}
	}

	return violations;
}

/**
 * Check 2: Prefer raw special characters
 */
function checkHtmlEntities(diagramCode: string): BestPracticeViolation[] {
	const violations: BestPracticeViolation[] = [];
	const htmlEntities = ["&lt;", "&gt;", "&amp;", "&quot;"];

	for (const entity of htmlEntities) {
		if (diagramCode.includes(entity)) {
			violations.push({
				type: "html-entities-used",
				severity: "low",
				found: entity,
				fix: `Prefer raw special characters (< > & ") instead of HTML entities`,
				rationale: "Raw characters produce clearer diagrams in modern Mermaid"
			});
		}
	}

	return violations;
}

/**
 * Check 3: Escape quotes within text
 */
function checkQuoteEscaping(diagramCode: string): BestPracticeViolation[] {
	const violations: BestPracticeViolation[] = [];

	// Pattern: Unescaped quotes within quoted text like ["Function: "getName()""]
	// This is a simplified check - complex cases need full parser
	const unescapedQuotePattern = /\["[^"]*"[^"]*"\]/g;
	let match;

	while ((match = unescapedQuotePattern.exec(diagramCode)) !== null) {
		violations.push({
			type: "unescaped-quotes",
			severity: "high",
			line: findLineNumber(diagramCode, match.index),
			found: match[0],
			fix: 'Escape quotes within text: ["Function: \\"getName()\\""]',
			rationale: "Prevents parsing errors with nested quotes"
		});
	}

	return violations;
}

/**
 * Check 4: Consistent bracket syntax
 */
function checkBracketSyntax(diagramCode: string): BestPracticeViolation[] {
	const violations: BestPracticeViolation[] = [];

	// Check for mismatched brackets (simplified)
	const lines = diagramCode.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Count different bracket types
		const openBrackets = (line.match(/\[/g) || []).length;
		const closeBrackets = (line.match(/\]/g) || []).length;
		const openParens = (line.match(/\(/g) || []).length;
		const closeParens = (line.match(/\)/g) || []).length;
		const openBraces = (line.match(/\{/g) || []).length;
		const closeBraces = (line.match(/\}/g) || []).length;

		// Check for mismatches on same line
		if (openBrackets !== closeBrackets) {
			violations.push({
				type: "bracket-mismatch",
				severity: "high",
				line: i + 1,
				found: line.trim(),
				fix: "Ensure matching square brackets [] or [[]]",
				rationale: "Mismatched brackets cause parsing failures"
			});
		}

		if (openParens !== closeParens) {
			violations.push({
				type: "parenthesis-mismatch",
				severity: "high",
				line: i + 1,
				found: line.trim(),
				fix: "Ensure matching parentheses () or [()]",
				rationale: "Mismatched parentheses cause parsing failures"
			});
		}

		if (openBraces !== closeBraces) {
			violations.push({
				type: "brace-mismatch",
				severity: "high",
				line: i + 1,
				found: line.trim(),
				fix: "Ensure matching braces {}",
				rationale: "Mismatched braces cause parsing failures"
			});
		}
	}

	return violations;
}

/**
 * Validate diagram against all best practices
 */
function validateBestPractices(diagramCode: string): BestPracticeViolation[] {
	return [
		...checkDoubleQuotes(diagramCode),
		...checkHtmlEntities(diagramCode),
		...checkQuoteEscaping(diagramCode),
		...checkBracketSyntax(diagramCode)
	];
}

/**
 * Print violations
 */
function printViolations(violations: BestPracticeViolation[]): void {
	if (violations.length === 0) {
		console.log("\x1b[0;32m✓ All best practices followed\x1b[0m");
		return;
	}

	console.log(`\x1b[1;33m⚠️  Found ${violations.length} best practice violation(s)\x1b[0m\n`);

	// Group by severity
	const high = violations.filter((v) => v.severity === "high");
	const medium = violations.filter((v) => v.severity === "medium");
	const low = violations.filter((v) => v.severity === "low");

	if (high.length > 0) {
		console.log("\x1b[0;31m❌ High Priority:\x1b[0m");
		high.forEach((v) => {
			console.log(`  - ${v.type}${v.line ? ` (line ${v.line})` : ""}`);
			if (v.found) console.log(`    Found: ${v.found}`);
			console.log(`    Fix: ${v.fix}`);
			if (v.rationale) console.log(`    Why: ${v.rationale}`);
			console.log("");
		});
	}

	if (medium.length > 0) {
		console.log("\x1b[1;33m⚠️  Medium Priority:\x1b[0m");
		medium.forEach((v) => {
			console.log(`  - ${v.type}${v.line ? ` (line ${v.line})` : ""}`);
			if (v.found) console.log(`    Found: ${v.found}`);
			console.log(`    Fix: ${v.fix}`);
			console.log("");
		});
	}

	if (low.length > 0) {
		console.log("\x1b[0;36mℹ️  Low Priority:\x1b[0m");
		low.forEach((v) => {
			console.log(`  - ${v.type}`);
			if (v.found) console.log(`    Found: ${v.found}`);
			console.log(`    Fix: ${v.fix}`);
			console.log("");
		});
	}

	// Exit with error if high severity violations
	if (high.length > 0) {
		process.exit(1);
	}
}

/**
 * Main function
 */
function main(): void {
	const args = process.argv.slice(2);

	if (args.length !== 1) {
		console.log("Usage: node best-practices-check.ts <diagram-code|file-path>");
		console.log("");
		console.log("Examples:");
		console.log('  node best-practices-check.ts "graph LR\\n  A[Node]"');
		console.log("  node best-practices-check.ts src/data/diagrams.ts");
		process.exit(1);
	}

	const input = args[0];
	let diagramCode: string;

	// Check if input is a file path
	if (existsSync(input)) {
		diagramCode = readFileSync(input, "utf-8");
	} else {
		// Treat as direct diagram code
		diagramCode = input;
	}

	const violations = validateBestPractices(diagramCode);
	printViolations(violations);
}

// Run if called directly (ESM check)
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
	main();
}

export { validateBestPractices };
export type { BestPracticeViolation };
