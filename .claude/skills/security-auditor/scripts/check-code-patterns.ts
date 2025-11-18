#!/usr/bin/env tsx
/**
 * Code Pattern Security Scanner
 *
 * Detects insecure code patterns: XSS, SQL injection, hardcoded secrets,
 * weak crypto, path traversal, and other OWASP Top 10 vulnerabilities.
 *
 * Usage:
 *   tsx check-code-patterns.ts <directory>
 *
 * Example:
 *   tsx check-code-patterns.ts src/
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

interface SecurityIssue {
	file: string;
	line: number;
	severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
	category: string;
	pattern: string;
	fix?: string;
}

const SECURITY_PATTERNS = [
	// XSS vulnerabilities
	{
		pattern: /\.innerHTML\s*=\s*(?!['"`])/g,
		severity: "CRITICAL" as const,
		category: "XSS",
		description: "Unsafe innerHTML assignment",
		fix: "Use textContent or sanitize with DOMPurify"
	},
	{
		pattern: /eval\s*\(/g,
		severity: "CRITICAL" as const,
		category: "Code Injection",
		description: "eval() usage detected",
		fix: "Never use eval() - refactor to safe alternative"
	},
	{
		pattern: /dangerouslySetInnerHTML/g,
		severity: "HIGH" as const,
		category: "XSS",
		description: "dangerouslySetInnerHTML usage",
		fix: "Sanitize with DOMPurify or use safer alternatives"
	},

	// SQL Injection
	{
		pattern: /\.query\s*\(\s*`[^`]*\$\{/g,
		severity: "CRITICAL" as const,
		category: "SQL Injection",
		description: "Template literal in SQL query",
		fix: "Use parameterized queries with ? placeholders"
	},
	{
		pattern: /\.query\s*\(\s*['"][^'"]*\+/g,
		severity: "CRITICAL" as const,
		category: "SQL Injection",
		description: "String concatenation in SQL query",
		fix: "Use parameterized queries with ? placeholders"
	},

	// Hardcoded secrets (common patterns)
	{
		pattern: /(?:api[_-]?key|apikey|secret[_-]?key)\s*[:=]\s*['"][a-zA-Z0-9_-]{20,}['"]/gi,
		severity: "CRITICAL" as const,
		category: "Hardcoded Secret",
		description: "Potential API key in source code",
		fix: "Move to environment variable (process.env.VITE_*)"
	},
	{
		pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{6,}['"]/gi,
		severity: "CRITICAL" as const,
		category: "Hardcoded Secret",
		description: "Hardcoded password detected",
		fix: "Move to secure credential storage"
	},
	{
		pattern: /(?:token|bearer|auth)\s*[:=]\s*['"][a-zA-Z0-9_-]{30,}['"]/gi,
		severity: "HIGH" as const,
		category: "Hardcoded Secret",
		description: "Hardcoded authentication token",
		fix: "Move to environment variable or secure storage"
	},

	// Weak cryptography
	{
		pattern: /crypto\.createHash\s*\(\s*['"]md5['"]\s*\)/g,
		severity: "HIGH" as const,
		category: "Weak Crypto",
		description: "MD5 hash usage (cryptographically broken)",
		fix: "Use SHA-256 minimum or bcrypt for passwords"
	},
	{
		pattern: /crypto\.createHash\s*\(\s*['"]sha1['"]\s*\)/g,
		severity: "MODERATE" as const,
		category: "Weak Crypto",
		description: "SHA-1 hash usage (deprecated)",
		fix: "Use SHA-256 or stronger"
	},

	// Path traversal
	{
		pattern: /readFileSync\s*\([^)]*\+/g,
		severity: "HIGH" as const,
		category: "Path Traversal",
		description: "Unsafe file path construction",
		fix: "Validate and sanitize file paths, use path.join()"
	},

	// Command injection
	{
		pattern: /exec(?:Sync)?\s*\([^)]*\$\{/g,
		severity: "CRITICAL" as const,
		category: "Command Injection",
		description: "Template literal in exec command",
		fix: "Use array syntax: execSync(['cmd', arg1, arg2])"
	}
];

const SEVERITY_COLORS = {
	CRITICAL: "\x1b[41m\x1b[97m", // Red background, white text
	HIGH: "\x1b[31m", // Red
	MODERATE: "\x1b[33m", // Yellow
	LOW: "\x1b[36m", // Cyan
	reset: "\x1b[0m"
};

function scanFile(filePath: string): SecurityIssue[] {
	const content = readFileSync(filePath, "utf-8");
	const issues: SecurityIssue[] = [];

	for (const patternDef of SECURITY_PATTERNS) {
		const matches = content.matchAll(patternDef.pattern);

		for (const match of matches) {
			const index = match.index ?? 0;
			const lineNumber = content.substring(0, index).split("\n").length;

			issues.push({
				file: filePath,
				line: lineNumber,
				severity: patternDef.severity,
				category: patternDef.category,
				pattern: match[0],
				fix: patternDef.fix
			});
		}
	}

	return issues;
}

function scanDirectory(
	dirPath: string,
	extensions: string[] = [".ts", ".js", ".svelte"]
): SecurityIssue[] {
	let allIssues: SecurityIssue[] = [];

	const entries = readdirSync(dirPath);

	for (const entry of entries) {
		const fullPath = join(dirPath, entry);
		const stat = statSync(fullPath);

		// Skip node_modules and .git
		if (entry === "node_modules" || entry === ".git" || entry === "dist") {
			continue;
		}

		if (stat.isDirectory()) {
			allIssues = allIssues.concat(scanDirectory(fullPath, extensions));
		} else if (stat.isFile()) {
			const hasValidExt = extensions.some((ext) => entry.endsWith(ext));
			if (hasValidExt) {
				const issues = scanFile(fullPath);
				allIssues = allIssues.concat(issues);
			}
		}
	}

	return allIssues;
}

function main() {
	const targetPath = process.argv[2];

	if (!targetPath) {
		console.error("Usage: tsx check-code-patterns.ts <directory>");
		console.error("Example: tsx check-code-patterns.ts src/");
		process.exit(1);
	}

	const resolvedPath = resolve(targetPath);

	if (!existsSync(resolvedPath)) {
		console.error(`❌ Path not found: ${resolvedPath}`);
		process.exit(1);
	}

	console.log("🔍 Security Auditor: Code Pattern Scanner\n");
	console.log(`📂 Scanning: ${resolvedPath}\n`);

	const issues = scanDirectory(resolvedPath);

	if (issues.length === 0) {
		console.log("✅ No security issues detected\n");
		process.exit(0);
	}

	// Group by severity
	const bySeverity: Record<string, SecurityIssue[]> = {
		CRITICAL: [],
		HIGH: [],
		MODERATE: [],
		LOW: []
	};

	for (const issue of issues) {
		bySeverity[issue.severity].push(issue);
	}

	// Display results
	let hasBlockingIssues = false;

	for (const severity of ["CRITICAL", "HIGH", "MODERATE", "LOW"] as const) {
		const severityIssues = bySeverity[severity];
		if (severityIssues.length === 0) continue;

		const color = SEVERITY_COLORS[severity];
		console.log(
			`\n${color}${severity}${SEVERITY_COLORS.reset}: ${severityIssues.length} issue(s)\n`
		);

		for (const issue of severityIssues) {
			console.log(`📄 ${issue.file}:${issue.line}`);
			console.log(`   Category: ${issue.category}`);
			console.log(`   Pattern:  ${issue.pattern}`);
			if (issue.fix) {
				console.log(`   Fix:      ${issue.fix}`);
			}
			console.log();
		}

		if (severity === "CRITICAL" || severity === "HIGH") {
			hasBlockingIssues = true;
		}
	}

	// Summary
	console.log("📊 Summary:\n");
	console.log(`   Total issues: ${issues.length}`);
	console.log(`   CRITICAL: ${bySeverity.CRITICAL.length}`);
	console.log(`   HIGH: ${bySeverity.HIGH.length}`);
	console.log(`   MODERATE: ${bySeverity.MODERATE.length}`);
	console.log(`   LOW: ${bySeverity.LOW.length}\n`);

	if (hasBlockingIssues) {
		console.error(
			`❌ BLOCKING: Found ${bySeverity.CRITICAL.length} CRITICAL and ${bySeverity.HIGH.length} HIGH severity issues\n`
		);
		process.exit(1);
	}

	console.log("✅ No critical or high severity issues (review moderate/low issues)\n");
	process.exit(0);
}

main();
