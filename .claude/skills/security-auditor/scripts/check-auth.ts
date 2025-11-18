#!/usr/bin/env tsx
/**
 * Authentication/Authorization Security Scanner
 *
 * Validates authentication implementations for security best practices:
 * - Password hashing (bcrypt, argon2 - NOT plain text or MD5)
 * - JWT validation (signature verification, expiration)
 * - Session security (httpOnly, secure, sameSite cookies)
 * - Authorization checks (RBAC patterns)
 *
 * Usage:
 *   tsx check-auth.ts <directory>
 *
 * Example:
 *   tsx check-auth.ts src/
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

interface AuthIssue {
	file: string;
	line: number;
	severity: "CRITICAL" | "HIGH" | "MODERATE" | "INFO";
	category: string;
	description: string;
	fix?: string;
}

const AUTH_PATTERNS = [
	// Weak password hashing
	{
		pattern: /(?:md5|sha1)\s*\(\s*password/gi,
		severity: "CRITICAL" as const,
		category: "Weak Password Hashing",
		description: "Using MD5/SHA1 for password hashing (insecure)",
		fix: "Use bcrypt or argon2: await bcrypt.hash(password, 10)"
	},
	{
		pattern: /password\s*===?\s*['"][^'"]+['"]/g,
		severity: "CRITICAL" as const,
		category: "Hardcoded Password Comparison",
		description: "Hardcoded password comparison detected",
		fix: "Use bcrypt.compare() for password verification"
	},

	// Missing JWT verification
	{
		pattern: /jwt\.decode\s*\(/g,
		severity: "HIGH" as const,
		category: "JWT Decode Without Verification",
		description: "Using jwt.decode() instead of jwt.verify()",
		fix: "Use jwt.verify() to validate signature and expiration"
	},

	// Insecure session configuration
	{
		pattern: /httpOnly\s*:\s*false/g,
		severity: "HIGH" as const,
		category: "Insecure Cookie",
		description: "Cookie without httpOnly flag (XSS vulnerable)",
		fix: "Set httpOnly: true to prevent JavaScript access"
	},
	{
		pattern: /secure\s*:\s*false/g,
		severity: "MODERATE" as const,
		category: "Insecure Cookie",
		description: "Cookie without secure flag (MITM vulnerable)",
		fix: "Set secure: true to require HTTPS"
	},
	{
		pattern: /sameSite\s*:\s*['"]none['"]/gi,
		severity: "HIGH" as const,
		category: "CSRF Vulnerable",
		description: "Cookie with sameSite: 'none' (CSRF risk)",
		fix: "Use sameSite: 'strict' or 'lax' for CSRF protection"
	},

	// Missing authorization checks
	{
		pattern: /(?:delete|update|create).*(?:user|admin|role).*\{[^}]*\}/gs,
		severity: "INFO" as const,
		category: "Authorization Check Needed",
		description: "Sensitive operation detected - ensure authorization check",
		fix: "Verify user permissions before sensitive operations"
	},

	// Weak token generation
	{
		pattern: /Math\.random\s*\(\s*\).*(?:token|session|id)/gi,
		severity: "HIGH" as const,
		category: "Weak Random",
		description: "Using Math.random() for security-sensitive value",
		fix: "Use crypto.randomBytes() for cryptographically secure random"
	}
];

const GOOD_PATTERNS = {
	bcrypt: /(?:bcrypt|argon2)\.(?:hash|compare)/g,
	jwtVerify: /jwt\.verify\s*\(/g,
	secureSession: /httpOnly\s*:\s*true.*secure\s*:\s*true/gs,
	cryptoRandom: /crypto\.randomBytes/g
};

const SEVERITY_COLORS = {
	CRITICAL: "\x1b[41m\x1b[97m",
	HIGH: "\x1b[31m",
	MODERATE: "\x1b[33m",
	INFO: "\x1b[36m",
	reset: "\x1b[0m"
};

function scanAuthFile(filePath: string): AuthIssue[] {
	const content = readFileSync(filePath, "utf-8");
	const issues: AuthIssue[] = [];

	for (const patternDef of AUTH_PATTERNS) {
		const matches = content.matchAll(patternDef.pattern);

		for (const match of matches) {
			const index = match.index ?? 0;
			const lineNumber = content.substring(0, index).split("\n").length;

			issues.push({
				file: filePath,
				line: lineNumber,
				severity: patternDef.severity,
				category: patternDef.category,
				description: patternDef.description,
				fix: patternDef.fix
			});
		}
	}

	return issues;
}

function findGoodPatterns(dirPath: string): { file: string; pattern: string }[] {
	const goodMatches: { file: string; pattern: string }[] = [];
	const entries = readdirSync(dirPath);

	for (const entry of entries) {
		const fullPath = join(dirPath, entry);
		const stat = statSync(fullPath);

		if (entry === "node_modules" || entry === ".git" || entry === "dist") {
			continue;
		}

		if (stat.isDirectory()) {
			goodMatches.push(...findGoodPatterns(fullPath));
		} else if (stat.isFile() && /\.(ts|js|svelte)$/.test(entry)) {
			const content = readFileSync(fullPath, "utf-8");

			for (const [name, pattern] of Object.entries(GOOD_PATTERNS)) {
				if (pattern.test(content)) {
					goodMatches.push({ file: fullPath, pattern: name });
				}
			}
		}
	}

	return goodMatches;
}

function scanDirectory(dirPath: string): AuthIssue[] {
	let allIssues: AuthIssue[] = [];
	const entries = readdirSync(dirPath);

	for (const entry of entries) {
		const fullPath = join(dirPath, entry);
		const stat = statSync(fullPath);

		if (entry === "node_modules" || entry === ".git" || entry === "dist") {
			continue;
		}

		if (stat.isDirectory()) {
			allIssues = allIssues.concat(scanDirectory(fullPath));
		} else if (stat.isFile() && /\.(ts|js|svelte)$/.test(entry)) {
			const issues = scanAuthFile(fullPath);
			allIssues = allIssues.concat(issues);
		}
	}

	return allIssues;
}

function main() {
	const targetPath = process.argv[2];

	if (!targetPath) {
		console.error("Usage: tsx check-auth.ts <directory>");
		console.error("Example: tsx check-auth.ts src/");
		process.exit(1);
	}

	const resolvedPath = resolve(targetPath);

	if (!existsSync(resolvedPath)) {
		console.error(`❌ Path not found: ${resolvedPath}`);
		process.exit(1);
	}

	console.log("🔍 Security Auditor: Authentication/Authorization Scanner\n");
	console.log(`📂 Scanning: ${resolvedPath}\n`);

	const issues = scanDirectory(resolvedPath);
	const goodPatterns = findGoodPatterns(resolvedPath);

	// Display good patterns first
	if (goodPatterns.length > 0) {
		console.log("✅ Secure patterns detected:\n");
		const grouped = goodPatterns.reduce(
			(acc, { pattern }) => {
				acc[pattern] = (acc[pattern] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		for (const [pattern, count] of Object.entries(grouped)) {
			console.log(`   ${pattern}: ${count} usage(s)`);
		}
		console.log();
	}

	if (issues.length === 0) {
		console.log("✅ No authentication/authorization issues detected\n");
		process.exit(0);
	}

	// Group by severity
	const bySeverity: Record<string, AuthIssue[]> = {
		CRITICAL: [],
		HIGH: [],
		MODERATE: [],
		INFO: []
	};

	for (const issue of issues) {
		bySeverity[issue.severity].push(issue);
	}

	// Display issues
	let hasBlockingIssues = false;

	for (const severity of ["CRITICAL", "HIGH", "MODERATE", "INFO"] as const) {
		const severityIssues = bySeverity[severity];
		if (severityIssues.length === 0) continue;

		const color = SEVERITY_COLORS[severity];
		console.log(
			`\n${color}${severity}${SEVERITY_COLORS.reset}: ${severityIssues.length} issue(s)\n`
		);

		for (const issue of severityIssues) {
			console.log(`📄 ${issue.file}:${issue.line}`);
			console.log(`   Category: ${issue.category}`);
			console.log(`   Issue:    ${issue.description}`);
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
	console.log(`   INFO: ${bySeverity.INFO.length}\n`);

	if (hasBlockingIssues) {
		console.error(
			`❌ BLOCKING: Found ${bySeverity.CRITICAL.length} CRITICAL and ${bySeverity.HIGH.length} HIGH severity auth issues\n`
		);
		process.exit(1);
	}

	console.log("✅ No critical or high severity auth issues\n");
	process.exit(0);
}

main();
