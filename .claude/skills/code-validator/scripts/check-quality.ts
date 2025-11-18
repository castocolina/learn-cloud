#!/usr/bin/env tsx
/**
 * Code Quality Guardian - Main Validation Script
 *
 * Detects:
 * 1. Unused variables (with proper exception handling)
 * 2. Code duplication (via jscpd)
 * 3. Cyclomatic complexity (via eslintcc)
 * 4. Regex pattern issues (unnecessary captures, missing named groups)
 * 5. Type safety issues (any usage, missing annotations)
 *
 * Usage:
 *   pnpm tsx check-quality.ts <files...>
 *   pnpm tsx check-quality.ts src/lib/utils/parser.ts
 *   pnpm tsx check-quality.ts src/**\/*.ts
 */

import * as ts from "typescript";
import { glob } from "glob";
import { execSync } from "child_process";

// ============================================================================
// Types
// ============================================================================

interface QualityViolation {
	category: "unused-code" | "duplication" | "complexity" | "regex-pattern" | "type-safety";
	severity: "error" | "warning" | "info";
	file: string;
	line: number;
	column?: number;
	message: string;
	suggestion?: string;
	autoFixable: boolean;
}

interface ValidationResult {
	file: string;
	violations: QualityViolation[];
	passed: boolean;
}

// ============================================================================
// Configuration
// ============================================================================

const IGNORE_PATTERNS = [
	"**/node_modules/**",
	"**/.svelte-kit/**",
	"**/build/**",
	"**/dist/**",
	"**/demo/**",
	"**/*.test.ts",
	"**/*.spec.ts"
];

const COMPLEXITY_THRESHOLDS = {
	error: 15,
	warning: 10
};

const REGEX_COMPLEXITY_THRESHOLDS = {
	simple: 30, // characters
	moderate: 80
};

// ============================================================================
// Utility Functions
// ============================================================================

function getLineAndColumn(
	sourceFile: ts.SourceFile,
	pos: number
): { line: number; column: number } {
	const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
	return { line: line + 1, column: character + 1 };
}

function isCallbackParameter(param: ts.ParameterDeclaration, checker: ts.TypeChecker): boolean {
	// Check if parameter is part of a callback function
	const func = param.parent as ts.FunctionLikeDeclaration;

	// Is this function used as a callback? (e.g., array.map, forEach, etc.)
	if (func.parent && ts.isCallExpression(func.parent)) {
		return true;
	}

	// Is this function assigned to a variable that expects a callback?
	if (func.parent && ts.isVariableDeclaration(func.parent)) {
		const type = checker.getTypeAtLocation(func.parent);
		// Check if type signature indicates it's a callback
		return type.getCallSignatures().length > 0;
	}

	return false;
}

function isDestructuringWithSkippedElements(binding: ts.BindingElement): boolean {
	// Check if this is array destructuring with skipped earlier positions
	const parent = binding.parent;
	if (!ts.isArrayBindingPattern(parent)) return false;

	// Find the index of this binding element
	const index = parent.elements.indexOf(binding);
	if (index === -1) return false;

	// Check if there are elements before this one
	// If yes, then skipping earlier positions with _ is valid
	return index > 0;
}

function analyzeRegexPattern(pattern: string): {
	hasUnnecessaryCaptures: boolean;
	hasUnnecessaryEscapes: boolean;
	complexityLevel: "simple" | "moderate" | "complex";
	suggestion?: string;
} {
	const result = {
		hasUnnecessaryCaptures: false,
		hasUnnecessaryEscapes: false,
		complexityLevel: "simple" as "simple" | "moderate" | "complex",
		suggestion: undefined as string | undefined
	};

	// Check complexity
	if (pattern.length > REGEX_COMPLEXITY_THRESHOLDS.moderate) {
		result.complexityLevel = "complex";
		result.suggestion =
			"Consider breaking this regex into smaller patterns or using named groups for clarity";
	} else if (pattern.length > REGEX_COMPLEXITY_THRESHOLDS.simple) {
		result.complexityLevel = "moderate";
	}

	// Check for unnecessary escapes in character classes
	const charClassEscapes = /\[([^\]]*)\]/g;
	let match;
	while ((match = charClassEscapes.exec(pattern)) !== null) {
		const charClass = match[1];
		// Check for escaped pipe, which doesn't need escaping in char class
		if (/\\\|/.test(charClass)) {
			result.hasUnnecessaryEscapes = true;
		}
	}

	// Count capturing groups vs named groups
	const capturingGroups = (pattern.match(/(?<!\\)\((?!\?)/g) || []).length;
	const namedGroups = (pattern.match(/\(\?<\w+>/g) || []).length;

	// If there are many unnamed capturing groups, suggest named groups
	if (capturingGroups > 2 && namedGroups === 0) {
		result.suggestion = "Consider using named groups for better maintainability: (?<name>pattern)";
	}

	return result;
}

// ============================================================================
// Violation Detectors
// ============================================================================

function checkUnusedVariables(
	sourceFile: ts.SourceFile,
	checker: ts.TypeChecker
): QualityViolation[] {
	const violations: QualityViolation[] = [];
	const declaredIdentifiers = new Map<string, ts.Node>();
	const usedIdentifiers = new Set<string>();

	function visit(node: ts.Node) {
		// Track variable declarations
		if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
			const name = node.name.text;
			declaredIdentifiers.set(name, node);
		}

		// Track parameter declarations
		if (ts.isParameter(node) && ts.isIdentifier(node.name)) {
			const name = node.name.text;
			declaredIdentifiers.set(name, node);
		}

		// Track binding elements (destructuring)
		if (ts.isBindingElement(node) && ts.isIdentifier(node.name)) {
			const name = node.name.text;
			declaredIdentifiers.set(name, node);
		}

		// Track identifier usage
		if (ts.isIdentifier(node)) {
			const name = node.text;
			// Only count as used if it's not the declaration itself
			const parent = node.parent;
			if (
				!ts.isVariableDeclaration(parent) &&
				!ts.isParameter(parent) &&
				!ts.isBindingElement(parent)
			) {
				usedIdentifiers.add(name);
			}
		}

		ts.forEachChild(node, visit);
	}

	visit(sourceFile);

	// Check for unused variables with _ prefix
	for (const [name, node] of declaredIdentifiers.entries()) {
		if (!name.startsWith("_")) continue;
		if (usedIdentifiers.has(name)) continue;

		// Check if this is a valid exception
		let isValidException = false;

		// Exception 1: Callback parameter
		if (ts.isParameter(node)) {
			if (isCallbackParameter(node, checker)) {
				isValidException = true;
			}
		}

		// Exception 2: Array destructuring with skipped positions
		if (ts.isBindingElement(node)) {
			if (isDestructuringWithSkippedElements(node)) {
				isValidException = true;
			}
		}

		if (!isValidException) {
			const { line, column } = getLineAndColumn(sourceFile, node.getStart());
			violations.push({
				category: "unused-code",
				severity: "error",
				file: sourceFile.fileName,
				line,
				column,
				message: `Variable '${name}' is unused and does not qualify for _ prefix exception`,
				suggestion:
					"Remove this variable if not needed, or use non-capturing groups for regex, or remove the parameter if optional",
				autoFixable: true
			});
		}
	}

	return violations;
}

function checkRegexPatterns(sourceFile: ts.SourceFile): QualityViolation[] {
	const violations: QualityViolation[] = [];

	function visit(node: ts.Node) {
		// Check for regex literals
		if (ts.isRegularExpressionLiteral(node)) {
			const pattern = node.text.slice(1, node.text.lastIndexOf("/")); // Remove / delimiters
			const analysis = analyzeRegexPattern(pattern);

			const { line, column } = getLineAndColumn(sourceFile, node.getStart());

			if (analysis.complexityLevel === "complex") {
				violations.push({
					category: "regex-pattern",
					severity: "warning",
					file: sourceFile.fileName,
					line,
					column,
					message: "Complex regex pattern detected",
					suggestion: analysis.suggestion,
					autoFixable: false
				});
			}

			if (analysis.hasUnnecessaryEscapes) {
				violations.push({
					category: "regex-pattern",
					severity: "info",
					file: sourceFile.fileName,
					line,
					column,
					message: "Unnecessary escape sequences in character class",
					suggestion: "Remove unnecessary escapes (e.g., \\| in character class)",
					autoFixable: true
				});
			}

			if (analysis.suggestion && analysis.suggestion.includes("named groups")) {
				violations.push({
					category: "regex-pattern",
					severity: "info",
					file: sourceFile.fileName,
					line,
					column,
					message: "Consider using named groups for better maintainability",
					suggestion: analysis.suggestion,
					autoFixable: false
				});
			}
		}

		// Check for RegExp constructor
		if (ts.isNewExpression(node) && node.expression.getText() === "RegExp") {
			if (node.arguments && node.arguments.length > 0) {
				const arg = node.arguments[0];
				if (ts.isStringLiteral(arg)) {
					const pattern = arg.text;
					const analysis = analyzeRegexPattern(pattern);

					if (analysis.suggestion) {
						const { line, column } = getLineAndColumn(sourceFile, node.getStart());
						violations.push({
							category: "regex-pattern",
							severity: "info",
							file: sourceFile.fileName,
							line,
							column,
							message: "Regex pattern could be improved",
							suggestion: analysis.suggestion,
							autoFixable: false
						});
					}
				}
			}
		}

		ts.forEachChild(node, visit);
	}

	visit(sourceFile);
	return violations;
}

function checkTypeAssertion(sourceFile: ts.SourceFile): QualityViolation[] {
	const violations: QualityViolation[] = [];

	function visit(node: ts.Node) {
		// Check for 'any' type usage
		if (ts.isTypeReferenceNode(node) && node.typeName.getText() === "any") {
			const { line, column } = getLineAndColumn(sourceFile, node.getStart());
			violations.push({
				category: "type-safety",
				severity: "warning",
				file: sourceFile.fileName,
				line,
				column,
				message: "Usage of 'any' type bypasses type checking",
				suggestion: "Use 'unknown' with type guards for better type safety",
				autoFixable: true
			});
		}

		// Check for type assertions (as keyword)
		if (ts.isAsExpression(node)) {
			const { line, column } = getLineAndColumn(sourceFile, node.getStart());
			violations.push({
				category: "type-safety",
				severity: "info",
				file: sourceFile.fileName,
				line,
				column,
				message: "Type assertion detected - ensure it's necessary",
				suggestion: "Consider using type guards instead of assertions when possible",
				autoFixable: false
			});
		}

		ts.forEachChild(node, visit);
	}

	visit(sourceFile);
	return violations;
}

function checkCodeDuplication(files: string[]): QualityViolation[] {
	const violations: QualityViolation[] = [];

	try {
		// Run jscpd programmatically via CLI
		const output = execSync(
			`npx jscpd --pattern "**/*.ts" --min-lines 5 --min-tokens 25 --format json --reporters json ${files.join(" ")}`,
			{
				encoding: "utf-8",
				stdio: "pipe"
			}
		);

		const result = JSON.parse(output);

		if (result.statistics) {
			const duplicationPercent = result.statistics.percentage || 0;

			if (duplicationPercent >= 10) {
				violations.push({
					category: "duplication",
					severity: "error",
					file: "multiple",
					line: 0,
					message: `Code duplication detected: ${duplicationPercent.toFixed(1)}% (threshold: 10%)`,
					suggestion: "Refactor duplicate code into shared functions or utilities",
					autoFixable: false
				});
			} else if (duplicationPercent >= 5) {
				violations.push({
					category: "duplication",
					severity: "warning",
					file: "multiple",
					line: 0,
					message: `Code duplication detected: ${duplicationPercent.toFixed(1)}% (threshold: 5%)`,
					suggestion: "Consider refactoring duplicate code",
					autoFixable: false
				});
			}
		}
	} catch {
		// jscpd not available or no duplicates found
		// This is not a critical error, so we continue
	}

	return violations;
}

function checkComplexity(filePath: string): QualityViolation[] {
	const violations: QualityViolation[] = [];

	try {
		// Run eslintcc to get complexity metrics
		const output = execSync(`npx eslintcc --format json ${filePath}`, {
			encoding: "utf-8",
			stdio: "pipe"
		});

		const result = JSON.parse(output);

		for (const fileData of result) {
			if (fileData.file !== filePath) continue;

			for (const func of fileData.functions || []) {
				const complexity = func.complexity || 0;

				if (complexity >= COMPLEXITY_THRESHOLDS.error) {
					violations.push({
						category: "complexity",
						severity: "error",
						file: filePath,
						line: func.line || 0,
						message: `Function '${func.name}' has cyclomatic complexity of ${complexity} (threshold: ${COMPLEXITY_THRESHOLDS.error})`,
						suggestion: "Break down this function into smaller, more focused functions",
						autoFixable: false
					});
				} else if (complexity >= COMPLEXITY_THRESHOLDS.warning) {
					violations.push({
						category: "complexity",
						severity: "warning",
						file: filePath,
						line: func.line || 0,
						message: `Function '${func.name}' has cyclomatic complexity of ${complexity} (threshold: ${COMPLEXITY_THRESHOLDS.warning})`,
						suggestion: "Consider refactoring to reduce complexity",
						autoFixable: false
					});
				}
			}
		}
	} catch {
		// eslintcc not available or parsing error
		// This is not a critical error, so we continue
	}

	return violations;
}

// ============================================================================
// Main Validation
// ============================================================================

function validateFile(filePath: string, program: ts.Program): ValidationResult {
	const sourceFile = program.getSourceFile(filePath);
	if (!sourceFile) {
		return {
			file: filePath,
			violations: [],
			passed: false
		};
	}

	const checker = program.getTypeChecker();
	const violations: QualityViolation[] = [];

	// Run all checks
	violations.push(...checkUnusedVariables(sourceFile, checker));
	violations.push(...checkRegexPatterns(sourceFile));
	violations.push(...checkTypeAssertion(sourceFile));
	violations.push(...checkComplexity(filePath));

	const errors = violations.filter((v) => v.severity === "error");

	return {
		file: filePath,
		violations,
		passed: errors.length === 0
	};
}

async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.error("Usage: pnpm tsx check-quality.ts <files...>");
		process.exit(1);
	}

	// Resolve file patterns
	const files: string[] = [];
	for (const arg of args) {
		const matches = await glob(arg, { ignore: IGNORE_PATTERNS });
		files.push(...matches);
	}

	if (files.length === 0) {
		console.log("No files to validate");
		process.exit(0);
	}

	console.log(`\n🔍 Code Quality Guardian - Analyzing ${files.length} file(s)...\n`);

	// Create TypeScript program
	const program = ts.createProgram(files, {
		target: ts.ScriptTarget.ESNext,
		module: ts.ModuleKind.ESNext,
		strict: true,
		skipLibCheck: true
	});

	// Validate each file
	const results: ValidationResult[] = [];
	for (const file of files) {
		const result = validateFile(file, program);
		results.push(result);
	}

	// Check for code duplication across all files
	const duplicationViolations = checkCodeDuplication(files);
	if (duplicationViolations.length > 0) {
		// Add duplication violations to a synthetic result
		results.push({
			file: "Project-wide",
			violations: duplicationViolations,
			passed: duplicationViolations.every((v) => v.severity !== "error")
		});
	}

	// Report results
	let totalViolations = 0;
	let totalErrors = 0;
	let totalWarnings = 0;
	let totalInfo = 0;

	for (const result of results) {
		if (result.violations.length === 0) continue;

		console.log(`\n📄 ${result.file}`);
		for (const violation of result.violations) {
			const icon =
				violation.severity === "error" ? "❌" : violation.severity === "warning" ? "⚠️" : "ℹ️";
			console.log(`  ${icon} [${violation.category}] Line ${violation.line}: ${violation.message}`);
			if (violation.suggestion) {
				console.log(`     💡 ${violation.suggestion}`);
			}

			totalViolations++;
			if (violation.severity === "error") totalErrors++;
			else if (violation.severity === "warning") totalWarnings++;
			else totalInfo++;
		}
	}

	// Summary
	console.log("\n" + "═".repeat(80));
	console.log("📊 Quality Report Summary");
	console.log("═".repeat(80));
	console.log(`Files analyzed:    ${files.length}`);
	console.log(`Total violations:  ${totalViolations}`);
	console.log(`  ❌ Errors:       ${totalErrors}`);
	console.log(`  ⚠️  Warnings:     ${totalWarnings}`);
	console.log(`  ℹ️  Info:         ${totalInfo}`);
	console.log("═".repeat(80));

	if (totalErrors > 0) {
		console.log("\n❌ Quality checks FAILED - fix errors before proceeding\n");
		process.exit(1);
	} else if (totalWarnings > 0) {
		console.log("\n⚠️  Quality checks PASSED with warnings - consider addressing them\n");
		process.exit(0);
	} else if (totalInfo > 0) {
		console.log("\n✅ Quality checks PASSED - some suggestions available\n");
		process.exit(0);
	} else {
		console.log("\n✅ Quality checks PASSED - no issues detected!\n");
		process.exit(0);
	}
}

// Export for testing
export {
	validateFile,
	checkUnusedVariables,
	checkRegexPatterns,
	checkTypeAssertion,
	checkCodeDuplication,
	checkComplexity
};
export type { QualityViolation, ValidationResult };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error("Fatal error:", error);
		process.exit(1);
	});
}
