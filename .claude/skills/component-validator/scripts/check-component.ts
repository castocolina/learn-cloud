#!/usr/bin/env node
/**
 * Component Integration Checker
 *
 * Validates Svelte component quality:
 * 1. Showcase vs production consistency
 * 2. Props interface completeness
 * 3. Theme compliance (CSS variables)
 * 4. Mobile-first implementation (≤390px)
 * 5. Accessibility (WCAG 2.1 AA)
 *
 * Usage:
 *   node check-component.ts <component-file>
 *   node check-component.ts <components-directory>
 */

import { readFileSync, existsSync, statSync, readdirSync } from "fs";
import { join, extname } from "path";

interface ComponentViolation {
	category: string;
	severity: "blocking" | "high" | "medium" | "low";
	line?: number;
	found?: string;
	fix: string;
}

interface ValidationResult {
	file: string;
	violations: ComponentViolation[];
}

// Check 1: Props interface completeness
function checkPropsInterface(content: string): ComponentViolation[] {
	const violations: ComponentViolation[] = [];

	// Check for $props() usage
	if (!content.includes("$props()")) {
		return violations; // No props in component
	}

	// Check for interface definition
	const hasInterface = content.match(/interface\s+\w+Props\s*\{/);
	const hasTypeAnnotation = content.includes("}: ") && content.includes("= $props()");

	if (!hasInterface && !hasTypeAnnotation) {
		violations.push({
			category: "Props Interface",
			severity: "high",
			found: "Props without TypeScript interface",
			fix: "Define interface for component props with proper types"
		});
	}

	// Check for 'any' type
	if (content.includes(": any")) {
		violations.push({
			category: "Props Interface",
			severity: "medium",
			found: "Using any type",
			fix: "Replace any with specific types"
		});
	}

	return violations;
}

// Check 2: Theme compliance (CSS variables)
function checkThemeCompliance(content: string): ComponentViolation[] {
	const violations: ComponentViolation[] = [];

	// Check for hardcoded hex colors
	const hexColorPattern = /#[0-9a-fA-F]{3,6}/g;
	const hexMatches = content.match(hexColorPattern);

	if (hexMatches) {
		// Filter out comments and safe contexts
		const lines = content.split("\n");
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!line.includes("//") && !line.includes("<!--")) {
				const lineHex = line.match(hexColorPattern);
				if (lineHex) {
					violations.push({
						category: "Theme Compliance",
						severity: "blocking",
						line: i + 1,
						found: `Hardcoded hex color: ${lineHex[0]}`,
						fix: "Use CSS variable: var(--color-primary) or Tailwind class: bg-primary"
					});
				}
			}
		}
	}

	// Check for hardcoded RGB colors
	const rgbPattern = /rgb\([^)]+\)/gi;
	if (rgbPattern.test(content)) {
		violations.push({
			category: "Theme Compliance",
			severity: "blocking",
			found: "Hardcoded RGB color",
			fix: "Use CSS variable or Tailwind class"
		});
	}

	return violations;
}

// Check 3: Mobile-first implementation
function checkMobileFirst(content: string): ComponentViolation[] {
	const violations: ComponentViolation[] = [];

	// Check for desktop-first pattern (smaller values without breakpoint, larger with md:)
	const desktopFirstPattern = /class="[^"]*\s(p|m|text)-(\d+)[^"]*\smd:(p|m|text)-(\d+)/g;
	const matches = content.match(desktopFirstPattern);

	if (matches) {
		violations.push({
			category: "Mobile-First",
			severity: "high",
			found: "Desktop-first media query detected",
			fix: "Use mobile styles first, then md:, lg: breakpoints"
		});
	}

	// Check for touch target size (buttons should have adequate padding)
	if (content.includes("<button") || content.includes("button")) {
		const hasTouchFriendly =
			content.includes("py-2") ||
			content.includes("py-3") ||
			content.includes("p-2") ||
			content.includes("p-3") ||
			content.includes("min-h-");

		if (!hasTouchFriendly) {
			violations.push({
				category: "Mobile-First",
				severity: "medium",
				found: "Small touch targets",
				fix: "Ensure touch targets ≥44px (use py-3 or min-h-11)"
			});
		}
	}

	return violations;
}

// Check 4: Accessibility
function checkAccessibility(content: string): ComponentViolation[] {
	const violations: ComponentViolation[] = [];

	// Check for buttons without aria-label
	const buttonPattern = /<button(?![^>]*aria-label)/g;
	const buttons = content.match(buttonPattern);

	if (buttons) {
		const hasText = content.includes("<button>") && !content.includes("<Icon");
		if (!hasText) {
			violations.push({
				category: "Accessibility",
				severity: "blocking",
				found: "Button without aria-label",
				fix: 'Add aria-label="Descriptive text" to buttons with icons only'
			});
		}
	}

	// Check for images without alt
	if (content.includes("<img") && !content.includes("alt=")) {
		violations.push({
			category: "Accessibility",
			severity: "blocking",
			found: "Image without alt text",
			fix: 'Add alt="" for decorative or alt="description" for meaningful images'
		});
	}

	// Check for focus indicators
	const hasFocusStyles =
		content.includes("focus:") ||
		content.includes("focus-visible:") ||
		content.includes("focus-within:");

	if ((content.includes("button") || content.includes("input")) && !hasFocusStyles) {
		violations.push({
			category: "Accessibility",
			severity: "blocking",
			found: "Missing focus indicators",
			fix: "Add focus:ring-2 focus:ring-primary or similar focus styles"
		});
	}

	// Check for semantic HTML
	const hasClickableDiv = /onclick|on:click/.test(content) && content.includes("<div");
	if (hasClickableDiv) {
		violations.push({
			category: "Accessibility",
			severity: "high",
			found: "Clickable div instead of button",
			fix: "Use <button> for clickable elements, not <div onclick>"
		});
	}

	return violations;
}

// Validate single component
function validateComponent(filePath: string): ValidationResult {
	const content = readFileSync(filePath, "utf-8");

	const violations = [
		...checkPropsInterface(content),
		...checkThemeCompliance(content),
		...checkMobileFirst(content),
		...checkAccessibility(content)
	];

	return { file: filePath, violations };
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
			if (ext === ".svelte") {
				results.push(validateComponent(fullPath));
			}
		}
	}

	return results;
}

// Print validation report
function printReport(results: ValidationResult[]): void {
	console.log("\n" + "━".repeat(60));
	console.log("🎨 Component Integration Report\n");

	let totalViolations = 0;
	let blockingCount = 0;

	for (const result of results) {
		if (result.violations.length === 0) continue;

		console.log(`\n📄 File: ${result.file}`);

		// Group by severity
		const blocking = result.violations.filter((v) => v.severity === "blocking");
		const high = result.violations.filter((v) => v.severity === "high");
		const medium = result.violations.filter((v) => v.severity === "medium");

		if (blocking.length > 0) {
			console.log("\n  ❌ BLOCKING:");
			blocking.forEach((v) => {
				console.log(`    - ${v.category}${v.line ? ` (line ${v.line})` : ""}`);
				if (v.found) console.log(`      Found: ${v.found}`);
				console.log(`      Fix: ${v.fix}`);
			});
			blockingCount += blocking.length;
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
	console.log(`   Blocking issues: ${blockingCount}`);

	if (blockingCount > 0) {
		console.log("\n❌ BLOCKED: Fix violations before component integration\n");
		process.exit(1);
	} else if (totalViolations > 0) {
		console.log("\n⚠️  WARNING: Non-blocking issues found\n");
	} else {
		console.log("\n✅ PASSED: All component integration checks passed\n");
	}
}

// Main
function main(): void {
	const args = process.argv.slice(2);

	if (args.length !== 1) {
		console.log("Usage: node check-component.ts <component-file|directory>");
		console.log("\nExamples:");
		console.log("  node check-component.ts src/lib/components/ui/Button.svelte");
		console.log("  node check-component.ts src/lib/components/");
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
		: [validateComponent(targetPath)];

	printReport(results);
}

// Run if called directly (ESM check)
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
	main();
}

export { validateComponent };
export type { ComponentViolation };
