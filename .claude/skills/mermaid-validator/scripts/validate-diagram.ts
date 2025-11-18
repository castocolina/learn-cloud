#!/usr/bin/env node
/**
 * Mermaid Diagram Validator
 *
 * Validates Mermaid diagrams using mmdc (Mermaid CLI) for ~95% syntax accuracy.
 * Supports both Markdown files (```mermaid blocks) and TypeScript files (diagram properties).
 *
 * Usage:
 *   node validate-diagram.ts <file-path>
 *   node validate-diagram.ts <directory>
 *
 * Examples:
 *   node validate-diagram.ts docs/README.md
 *   node validate-diagram.ts src/data/diagrams.ts
 *   node validate-diagram.ts src/data/
 *
 * Dependencies: @mermaid-js/mermaid-cli (npx @mermaid-js/mermaid-cli)
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync, statSync, readdirSync } from "fs";
import { execSync } from "child_process";
import { join, extname } from "path";

interface ValidationError {
	file: string;
	location: string; // Line number or variable name
	error: string;
	severity: "high" | "medium" | "low";
	fix?: string;
}

interface ValidationResult {
	file: string;
	totalDiagrams: number;
	validDiagrams: number;
	errors: ValidationError[];
}

// ANSI color codes
const colors = {
	red: "\x1b[0;31m",
	green: "\x1b[0;32m",
	yellow: "\x1b[1;33m",
	reset: "\x1b[0m"
};

function logInfo(message: string): void {
	console.log(`${colors.green}[INFO]${colors.reset} ${message}`);
}

function logWarn(message: string): void {
	console.log(`${colors.yellow}[WARN]${colors.reset} ${message}`);
}

function logError(message: string): void {
	console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
}

/**
 * Extract Mermaid code blocks from Markdown file
 */
function extractMermaidFromMarkdown(filePath: string): string[] {
	const content = readFileSync(filePath, "utf-8");
	const diagrams: string[] = [];
	const lines = content.split("\n");

	let inMermaidBlock = false;
	let currentDiagram: string[] = [];

	for (const line of lines) {
		if (line.trim().startsWith("```mermaid")) {
			inMermaidBlock = true;
			currentDiagram = [];
		} else if (line.trim() === "```" && inMermaidBlock) {
			inMermaidBlock = false;
			if (currentDiagram.length > 0) {
				diagrams.push(currentDiagram.join("\n"));
			}
		} else if (inMermaidBlock) {
			currentDiagram.push(line);
		}
	}

	return diagrams;
}

/**
 * Extract Mermaid diagrams from TypeScript file
 * Looks for properties: diagram, definition, diagramDefinition
 */
function extractMermaidFromTypeScript(filePath: string): Array<{ name: string; code: string }> {
	const content = readFileSync(filePath, "utf-8");
	const diagrams: Array<{ name: string; code: string }> = [];

	// Regex to find diagram properties (simplified - for complex AST use ts-morph)
	const patterns = [
		/(\w+)\s*:\s*\{\s*diagram:\s*`([^`]+)`/gs,
		/(\w+)\s*:\s*\{\s*definition:\s*`([^`]+)`/gs,
		/(\w+)\s*:\s*\{\s*diagramDefinition:\s*`([^`]+)`/gs,
		/const\s+(\w+)\s*=\s*\{\s*diagram:\s*`([^`]+)`/gs,
		/const\s+(\w+)\s*=\s*\{\s*definition:\s*`([^`]+)`/gs,
		/const\s+(\w+)\s*=\s*\{\s*diagramDefinition:\s*`([^`]+)`/gs
	];

	for (const pattern of patterns) {
		let match;
		const regex = new RegExp(pattern);
		while ((match = regex.exec(content)) !== null) {
			diagrams.push({
				name: match[1],
				code: match[2].trim()
			});
		}
	}

	return diagrams;
}

/**
 * Validate single diagram using mmdc
 */
function validateDiagramWithMmdc(diagramCode: string, identifier: string): ValidationError | null {
	const tempFile = `/tmp/mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}.mmd`;

	try {
		// Write diagram to temp file
		writeFileSync(tempFile, diagramCode);

		// Run mmdc validation (output to /dev/null, we only care about exit code)
		execSync(`npx -y @mermaid-js/mermaid-cli@latest mmdc -i "${tempFile}" -o /dev/null 2>&1`, {
			encoding: "utf-8",
			stdio: "pipe"
		});

		// Success - diagram is valid
		return null;
	} catch (error: unknown) {
		// Parse mmdc error output
		const err = error as { stdout?: string; stderr?: string; message?: string };
		const errorMessage = err.stdout || err.stderr || err.message;

		return {
			file: "",
			location: identifier,
			error: errorMessage.split("\n")[0], // First line of error
			severity: "high",
			fix: "Review syntax against MERMAID-STANDARDS.md and fix parsing errors"
		};
	} finally {
		// Cleanup temp file
		if (existsSync(tempFile)) {
			unlinkSync(tempFile);
		}
	}
}

/**
 * Validate Markdown file
 */
function validateMarkdownFile(filePath: string): ValidationResult {
	const diagrams = extractMermaidFromMarkdown(filePath);
	const errors: ValidationError[] = [];
	let validCount = 0;

	if (diagrams.length === 0) {
		logWarn(`No Mermaid diagrams found in ${filePath}`);
	}

	diagrams.forEach((diagram, index) => {
		const identifier = `Diagram ${index + 1}`;
		const error = validateDiagramWithMmdc(diagram, identifier);

		if (error) {
			errors.push({ ...error, file: filePath });
			logError(`${identifier}: ✗ Invalid`);
		} else {
			validCount++;
			logInfo(`${identifier}: ✓ Valid`);
		}
	});

	return {
		file: filePath,
		totalDiagrams: diagrams.length,
		validDiagrams: validCount,
		errors
	};
}

/**
 * Validate TypeScript file
 */
function validateTypeScriptFile(filePath: string): ValidationResult {
	const diagrams = extractMermaidFromTypeScript(filePath);
	const errors: ValidationError[] = [];
	let validCount = 0;

	if (diagrams.length === 0) {
		logWarn(`No Mermaid diagrams found in ${filePath}`);
	}

	diagrams.forEach(({ name, code }) => {
		const error = validateDiagramWithMmdc(code, `Variable '${name}'`);

		if (error) {
			errors.push({ ...error, file: filePath });
			logError(`${name}: ✗ Invalid`);
		} else {
			validCount++;
			logInfo(`${name}: ✓ Valid`);
		}
	});

	return {
		file: filePath,
		totalDiagrams: diagrams.length,
		validDiagrams: validCount,
		errors
	};
}

/**
 * Validate single file (auto-detect type)
 */
function validateFile(filePath: string): ValidationResult {
	const ext = extname(filePath);

	if (ext === ".md") {
		return validateMarkdownFile(filePath);
	} else if (ext === ".ts" || ext === ".tsx") {
		return validateTypeScriptFile(filePath);
	} else {
		logWarn(`Unsupported file type: ${ext} (${filePath})`);
		return {
			file: filePath,
			totalDiagrams: 0,
			validDiagrams: 0,
			errors: []
		};
	}
}

/**
 * Recursively validate directory
 */
function validateDirectory(dirPath: string): ValidationResult[] {
	const results: ValidationResult[] = [];

	const entries = readdirSync(dirPath);

	for (const entry of entries) {
		const fullPath = join(dirPath, entry);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			// Skip node_modules, .git, etc.
			if (!["node_modules", ".git", "dist", "build", ".svelte-kit"].includes(entry)) {
				results.push(...validateDirectory(fullPath));
			}
		} else if (stat.isFile()) {
			const ext = extname(fullPath);
			if (ext === ".md" || ext === ".ts" || ext === ".tsx") {
				results.push(validateFile(fullPath));
			}
		}
	}

	return results;
}

/**
 * Print validation summary
 */
function printSummary(results: ValidationResult[]): void {
	console.log("\n" + "━".repeat(60));

	const totalDiagrams = results.reduce((sum, r) => sum + r.totalDiagrams, 0);
	const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

	if (totalDiagrams === 0) {
		logWarn("No Mermaid diagrams found");
		return;
	}

	if (totalErrors === 0) {
		console.log(`${colors.green}✓ All ${totalDiagrams} diagram(s) are valid${colors.reset}`);
	} else {
		console.log(
			`${colors.red}✗ ${totalErrors} of ${totalDiagrams} diagram(s) failed validation${colors.reset}\n`
		);

		console.log("Errors:");
		for (const result of results) {
			if (result.errors.length > 0) {
				console.log(`\n  File: ${result.file}`);
				for (const error of result.errors) {
					console.log(`    - ${error.location}: ${error.error}`);
					if (error.fix) {
						console.log(`      Fix: ${error.fix}`);
					}
				}
			}
		}

		process.exit(1);
	}
}

/**
 * Main function
 */
function main(): void {
	const args = process.argv.slice(2);

	if (args.length !== 1) {
		console.log("Usage: node validate-diagram.ts <file-path|directory>");
		console.log("");
		console.log("Examples:");
		console.log("  node validate-diagram.ts docs/README.md");
		console.log("  node validate-diagram.ts src/data/diagrams.ts");
		console.log("  node validate-diagram.ts src/data/");
		process.exit(1);
	}

	const targetPath = args[0];

	if (!existsSync(targetPath)) {
		logError(`Path not found: ${targetPath}`);
		process.exit(1);
	}

	const stat = statSync(targetPath);
	let results: ValidationResult[];

	if (stat.isDirectory()) {
		logInfo(`Validating Mermaid diagrams in directory: ${targetPath}`);
		console.log("");
		results = validateDirectory(targetPath);
	} else {
		logInfo(`Validating Mermaid diagrams in file: ${targetPath}`);
		console.log("");
		results = [validateFile(targetPath)];
	}

	printSummary(results);
}

// Run if called directly (ESM check)
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
	main();
}

export { validateFile, validateDirectory, validateDiagramWithMmdc };
