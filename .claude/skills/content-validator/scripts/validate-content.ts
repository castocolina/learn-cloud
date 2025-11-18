#!/usr/bin/env node
/**
 * Content Quality Validator
 *
 * Validates educational content against CONTENT-STANDARDS.md:
 * 1. TypeScript interface compliance
 * 2. Content status lifecycle (scaffold → draft → final)
 * 3. Interactive standards (quiz: 5q/80%, study guide: ≥8 flashcards)
 * 4. Educational quality (specific objectives, secure code)
 * 5. Metadata completeness
 *
 * Usage:
 *   node validate-content.ts <content-file>
 *   node validate-content.ts <directory>
 */

import { readFileSync, existsSync, statSync, readdirSync } from "fs";
import { join, extname } from "path";

interface ContentViolation {
	category: string;
	severity: "blocking" | "high" | "medium" | "low";
	line?: number;
	found?: string;
	fix: string;
}

interface ValidationResult {
	file: string;
	status?: string;
	contentType?: string;
	violations: ContentViolation[];
}

// Check 1: TypeScript import compliance
function checkTypeScriptImports(content: string): ContentViolation[] {
	const violations: ContentViolation[] = [];

	// Check for direct file imports
	if (
		content.includes('from "$lib/types/types.js"') ||
		content.includes("from '$lib/types/types.js'")
	) {
		violations.push({
			category: "TypeScript Interface",
			severity: "high",
			found: 'Direct file import: "$lib/types/types.js"',
			fix: 'Use unified alias: import type { ... } from "$types"'
		});
	}

	// Check for proper type imports
	const hasContentImport =
		content.includes("LessonContent") ||
		content.includes("QuizContent") ||
		content.includes("StudyGuideContent");

	if (hasContentImport) {
		const hasProperImport =
			content.includes('from "$types"') || content.includes('from "$lib/types"');

		if (!hasProperImport) {
			violations.push({
				category: "TypeScript Interface",
				severity: "high",
				fix: 'Add import: import type { LessonContent } from "$types"'
			});
		}
	}

	return violations;
}

// Check 2: Content status lifecycle
function checkStatusLifecycle(content: string, status?: string): ContentViolation[] {
	const violations: ContentViolation[] = [];

	// Check for template content
	const templatePatterns = ["lorem ipsum", "TODO:", "FIXME:", "placeholder", "example content"];

	for (const pattern of templatePatterns) {
		if (content.toLowerCase().includes(pattern)) {
			violations.push({
				category: "Status Lifecycle",
				severity: status === "final" ? "blocking" : "high",
				found: `Template content: "${pattern}"`,
				fix: "Replace with real educational content"
			});
		}
	}

	return violations;
}

// Check 3: Interactive standards
function checkInteractiveStandards(content: string, contentType?: string): ContentViolation[] {
	const violations: ContentViolation[] = [];

	// Quiz standards: 5 questions, 80% passing
	if (contentType === "quiz" || content.includes("quiz:")) {
		const questionMatches = content.match(/question:/gi);
		const questionCount = questionMatches ? questionMatches.length : 0;

		if (questionCount > 0 && questionCount !== 5) {
			violations.push({
				category: "Interactive Standards",
				severity: "blocking",
				found: `${questionCount} questions`,
				fix: "Quizzes must have exactly 5 questions"
			});
		}

		if (content.includes("passingScore") && !content.includes("passingScore: 80")) {
			violations.push({
				category: "Interactive Standards",
				severity: "high",
				fix: "Set passingScore: 80 for quizzes"
			});
		}
	}

	// Study guide standards: ≥8 flashcards
	if (contentType === "study-guide" || content.includes("studyGuide:")) {
		const flashcardMatches = content.match(/front:/gi);
		const flashcardCount = flashcardMatches ? flashcardMatches.length : 0;

		if (flashcardCount > 0 && flashcardCount < 8) {
			violations.push({
				category: "Interactive Standards",
				severity: "blocking",
				found: `${flashcardCount} flashcards`,
				fix: "Study guides must have at least 8 flashcards"
			});
		}
	}

	// Code completion: exactly 5 underscores
	if (content.includes("codeCompletion")) {
		const underscorePattern = /_+/g;
		const underscoreMatches = content.match(underscorePattern);

		if (underscoreMatches) {
			for (const match of underscoreMatches) {
				if (match.length !== 5) {
					violations.push({
						category: "Interactive Standards",
						severity: "high",
						found: `${match.length} underscores`,
						fix: "Code completion blanks must have exactly 5 underscores: _____"
					});
				}
			}
		}
	}

	return violations;
}

// Check 4: Educational quality
function checkEducationalQuality(content: string): ContentViolation[] {
	const violations: ContentViolation[] = [];

	// Check for vague learning objectives
	const vagueObjectives = ["understand", "learn about", "know", "be familiar with"];

	if (content.includes("learningObjectives")) {
		for (const vague of vagueObjectives) {
			const pattern = new RegExp(`["']${vague}`, "i");
			if (pattern.test(content)) {
				violations.push({
					category: "Educational Quality",
					severity: "high",
					found: `Vague objective starting with "${vague}"`,
					fix: "Make objectives specific and measurable (use action verbs: build, implement, configure)"
				});
			}
		}
	}

	// Check for insecure code patterns
	const insecurePatterns = [
		{ pattern: /password\s*=\s*["'][^"']+["']/, message: "Hardcoded password" },
		{ pattern: /api[_-]?key\s*=\s*["'][^"']+["']/, message: "Hardcoded API key" },
		{ pattern: /secret\s*=\s*["'][^"']+["']/, message: "Hardcoded secret" }
	];

	for (const { pattern, message } of insecurePatterns) {
		if (pattern.test(content)) {
			violations.push({
				category: "Educational Quality",
				severity: "high",
				found: message,
				fix: "Use environment variables or secrets management"
			});
		}
	}

	return violations;
}

// Check 5: Metadata completeness
function checkMetadata(content: string, status?: string): ContentViolation[] {
	const violations: ContentViolation[] = [];

	if (status === "final") {
		// Check for estimated time
		if (!content.includes("estimatedMinutes")) {
			violations.push({
				category: "Metadata",
				severity: "medium",
				fix: "Add estimatedMinutes for final content"
			});
		}

		// Check for lastModified
		if (!content.includes("lastModified")) {
			violations.push({
				category: "Metadata",
				severity: "low",
				fix: "Add lastModified timestamp"
			});
		}
	}

	return violations;
}

// Validate single content file
function validateContentFile(filePath: string): ValidationResult {
	const content = readFileSync(filePath, "utf-8");

	// Extract content type and status (simplified)
	const statusMatch = content.match(/status:\s*["'](\w+)["']/);
	const typeMatch = content.match(/type:\s*["'](\w+)["']/);

	const status = statusMatch ? statusMatch[1] : undefined;
	const contentType = typeMatch ? typeMatch[1] : undefined;

	const violations = [
		...checkTypeScriptImports(content),
		...checkStatusLifecycle(content, status),
		...checkInteractiveStandards(content, contentType),
		...checkEducationalQuality(content),
		...checkMetadata(content, status)
	];

	return { file: filePath, status, contentType, violations };
}

// Recursively validate directory
function validateDirectory(dirPath: string): ValidationResult[] {
	const results: ValidationResult[] = [];
	const entries = readdirSync(dirPath);

	for (const entry of entries) {
		const fullPath = join(dirPath, entry);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			if (!["node_modules", ".git", "dist"].includes(entry)) {
				results.push(...validateDirectory(fullPath));
			}
		} else if (stat.isFile()) {
			const ext = extname(fullPath);
			if (ext === ".ts" && fullPath.includes("src/data/")) {
				results.push(validateContentFile(fullPath));
			}
		}
	}

	return results;
}

// Print validation report
function printReport(results: ValidationResult[]): void {
	console.log("\n" + "━".repeat(60));
	console.log("📚 Content Validation Report\n");

	let totalViolations = 0;
	let blockingCount = 0;

	for (const result of results) {
		if (result.violations.length === 0) continue;

		console.log(`\n📄 File: ${result.file}`);
		console.log(`   Type: ${result.contentType || "unknown"}`);
		console.log(`   Status: ${result.status || "unknown"}`);

		// Group by category and severity
		const blocking = result.violations.filter((v) => v.severity === "blocking");
		const high = result.violations.filter((v) => v.severity === "high");
		const medium = result.violations.filter((v) => v.severity === "medium");

		if (blocking.length > 0) {
			console.log("\n  ❌ BLOCKING (for final status):");
			blocking.forEach((v) => {
				console.log(`    - ${v.category}`);
				if (v.found) console.log(`      Found: ${v.found}`);
				console.log(`      Fix: ${v.fix}`);
			});
			if (result.status === "final") blockingCount += blocking.length;
		}

		if (high.length > 0) {
			console.log("\n  ⚠️  HIGH:");
			high.forEach((v) => {
				console.log(`    - ${v.category}`);
				if (v.found) console.log(`      Found: ${v.found}`);
				console.log(`      Fix: ${v.fix}`);
			});
		}

		if (medium.length > 0) {
			console.log("\n  ℹ️  MEDIUM:");
			medium.forEach((v) => {
				console.log(`    - ${v.category}: ${v.fix}`);
			});
		}

		totalViolations += result.violations.length;
	}

	console.log("\n" + "━".repeat(60));
	console.log(`\n📊 Summary:`);
	console.log(`   Total violations: ${totalViolations}`);
	console.log(`   Blocking for final: ${blockingCount}`);

	if (blockingCount > 0) {
		console.log("\n❌ BLOCKED: Fix violations before setting status=final\n");
		process.exit(1);
	} else if (totalViolations > 0) {
		console.log("\n⚠️  WARNING: Non-blocking issues found (OK for draft)\n");
	} else {
		console.log("\n✅ PASSED: All content validation checks passed\n");
	}
}

// Main
function main(): void {
	const args = process.argv.slice(2);

	if (args.length !== 1) {
		console.log("Usage: node validate-content.ts <content-file|directory>");
		console.log("\nExamples:");
		console.log("  node validate-content.ts src/data/book/unit1/lesson.ts");
		console.log("  node validate-content.ts src/data/");
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
		: [validateContentFile(targetPath)];

	printReport(results);
}

// Run if called directly (ESM check)
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
	main();
}

export { validateContentFile };
export type { ContentViolation };
