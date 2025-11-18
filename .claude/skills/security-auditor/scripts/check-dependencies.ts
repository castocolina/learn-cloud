#!/usr/bin/env tsx
/**
 * Dependency Vulnerability Scanner
 *
 * Scans package.json dependencies for known vulnerabilities using npm audit.
 * Detects outdated packages with security patches and restrictive licenses.
 *
 * Usage:
 *   tsx check-dependencies.ts [--strict]
 *
 * Flags:
 *   --strict  Exit with code 1 if ANY vulnerabilities found (default: only critical/high)
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

interface AuditResult {
	vulnerabilities: {
		info: number;
		low: number;
		moderate: number;
		high: number;
		critical: number;
	};
	metadata: {
		dependencies: number;
		devDependencies: number;
		vulnerabilities: {
			total: number;
		};
	};
}

const RESTRICTIVE_LICENSES = ["GPL", "AGPL", "LGPL", "SSPL", "BUSL"];
const SEVERITY_COLORS = {
	critical: "\x1b[41m\x1b[97m", // Red background, white text
	high: "\x1b[31m", // Red
	moderate: "\x1b[33m", // Yellow
	low: "\x1b[36m", // Cyan
	info: "\x1b[90m", // Gray
	reset: "\x1b[0m"
};

function main() {
	const strict = process.argv.includes("--strict");
	const projectRoot = resolve(process.cwd());
	const packageJsonPath = resolve(projectRoot, "package.json");

	console.log("🔍 Security Auditor: Dependency Vulnerability Scan\n");

	// Check package.json exists
	if (!existsSync(packageJsonPath)) {
		console.error("❌ No package.json found in project root");
		process.exit(1);
	}

	// Step 1: Run npm audit
	console.log("📋 Running npm audit...\n");
	let auditResult: AuditResult;

	try {
		const auditOutput = execSync("npm audit --json", {
			cwd: projectRoot,
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"]
		});
		auditResult = JSON.parse(auditOutput);
	} catch (error: unknown) {
		// npm audit exits with code 1 if vulnerabilities found
		if (error && typeof error === "object" && "stdout" in error) {
			auditResult = JSON.parse(error.stdout as string);
		} else {
			console.error("❌ Failed to run npm audit");
			process.exit(1);
		}
	}

	// Step 2: Display results
	const { vulnerabilities } = auditResult;

	console.log("📊 Vulnerability Summary:\n");
	console.log(
		`   ${SEVERITY_COLORS.critical}CRITICAL${SEVERITY_COLORS.reset}: ${vulnerabilities.critical}`
	);
	console.log(
		`   ${SEVERITY_COLORS.high}HIGH${SEVERITY_COLORS.reset}:     ${vulnerabilities.high}`
	);
	console.log(
		`   ${SEVERITY_COLORS.moderate}MODERATE${SEVERITY_COLORS.reset}: ${vulnerabilities.moderate}`
	);
	console.log(`   ${SEVERITY_COLORS.low}LOW${SEVERITY_COLORS.reset}:      ${vulnerabilities.low}`);
	console.log(
		`   ${SEVERITY_COLORS.info}INFO${SEVERITY_COLORS.reset}:     ${vulnerabilities.info}\n`
	);

	// Step 3: Check for critical/high vulnerabilities
	const hasCriticalOrHigh = vulnerabilities.critical > 0 || vulnerabilities.high > 0;

	if (hasCriticalOrHigh) {
		console.error(
			`\n❌ ${SEVERITY_COLORS.critical}BLOCKING${SEVERITY_COLORS.reset}: Found ${vulnerabilities.critical} CRITICAL and ${vulnerabilities.high} HIGH severity vulnerabilities\n`
		);
		console.log("🔧 Fix with:\n");
		console.log("   npm audit fix\n");
		console.log("   # Or for breaking changes:");
		console.log("   npm audit fix --force\n");
		process.exit(1);
	}

	// Step 4: Check moderate/low in strict mode
	if (strict && (vulnerabilities.moderate > 0 || vulnerabilities.low > 0)) {
		console.error(
			`\n⚠️  STRICT MODE: Found ${vulnerabilities.moderate} MODERATE and ${vulnerabilities.low} LOW severity vulnerabilities\n`
		);
		process.exit(1);
	}

	// Step 5: Check for restrictive licenses (informational)
	console.log("📜 Checking licenses...\n");
	try {
		const licenses = execSync("npx license-checker --json", {
			cwd: projectRoot,
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"]
		});
		const licenseData = JSON.parse(licenses);
		const restrictive: string[] = [];

		for (const [pkg, data] of Object.entries(licenseData)) {
			const license = (data as { licenses?: string }).licenses || "";
			if (RESTRICTIVE_LICENSES.some((rl) => license.includes(rl))) {
				restrictive.push(`${pkg} (${license})`);
			}
		}

		if (restrictive.length > 0) {
			console.warn(`\n⚠️  Found ${restrictive.length} packages with restrictive licenses:\n`);
			restrictive.forEach((pkg) => console.warn(`   - ${pkg}`));
			console.warn("\n   Review license compatibility with your project before production.\n");
		} else {
			console.log("✅ No restrictive licenses detected\n");
		}
	} catch {
		console.log("⚠️  License check skipped (install: npx license-checker)\n");
	}

	// Success
	console.log("✅ No critical or high severity vulnerabilities found\n");
	process.exit(0);
}

main();
