#!/usr/bin/env node
/**
 * Mermaid Mobile Optimization Checker
 *
 * Validates Mermaid diagram layout for mobile devices (≤390px viewport).
 * Recommends LR (Left-to-Right) layout over TD (Top-Down) for better mobile reflow.
 *
 * Usage:
 *   node mobile-optimizer.ts <diagram-code>
 *   node mobile-optimizer.ts <file-path>
 *
 * Examples:
 *   node mobile-optimizer.ts 'graph TD\n  A --> B'
 *   node mobile-optimizer.ts src/data/diagrams.ts
 */

import { readFileSync, existsSync } from "fs";

interface LayoutViolation {
	type: string;
	severity: "high" | "medium" | "low";
	direction?: string;
	recommendation: string;
	rationale: string;
}

/**
 * Validate layout direction for mobile optimization
 */
function validateLayoutDirection(diagramCode: string): LayoutViolation[] {
	const violations: LayoutViolation[] = [];

	// Extract diagram direction (non-capturing group for diagram type)
	const diagramTypePattern = /^(?:graph|flowchart)\s+(TD|TB|LR|RL)/m;
	const match = diagramCode.match(diagramTypePattern);

	if (!match) {
		violations.push({
			type: "missing-direction",
			severity: "medium",
			recommendation: "graph LR",
			rationale:
				"Specify layout direction. Left-to-Right (LR) is preferred for mobile (≤390px) as it prevents horizontal scrolling."
		});
		return violations;
	}

	const direction = match[1];

	// Check for mobile-unfriendly directions
	if (direction === "TD" || direction === "TB") {
		violations.push({
			type: "suboptimal-mobile-layout",
			severity: "low",
			direction,
			recommendation: "graph LR",
			rationale:
				"Left-to-right layout reflows better on mobile (≤390px), preventing horizontal scrolling. Use TD only when vertical hierarchy is semantically important (e.g., organizational charts, layered architecture)."
		});
	}

	// Check for Right-to-Left (less common but also suboptimal)
	if (direction === "RL") {
		violations.push({
			type: "right-to-left-layout",
			severity: "low",
			direction,
			recommendation: "graph LR",
			rationale:
				"Right-to-left layout is uncommon and may confuse users. Use LR for standard left-to-right reading flow."
		});
	}

	return violations;
}

/**
 * Check diagram complexity for mobile
 */
function checkDiagramComplexity(diagramCode: string): LayoutViolation[] {
	const violations: LayoutViolation[] = [];

	// Count nodes (rough estimate)
	const nodePattern = /(\w+)\[/g;
	const nodes = diagramCode.match(nodePattern) || [];

	if (nodes.length > 10) {
		violations.push({
			type: "complex-diagram",
			severity: "low",
			recommendation: "Consider splitting into multiple simpler diagrams",
			rationale: `Diagram has ${nodes.length} nodes. Complex diagrams (>10 nodes) may be difficult to read on mobile. Consider splitting into multiple focused diagrams or using expand functionality.`
		});
	}

	return violations;
}

/**
 * Check subgraph direction and layout balance
 * Context: Subgraphs inherit parent direction and cannot override it
 * Reference: https://docs.mermaidchart.com/mermaid-oss/syntax/flowchart.html#direction-in-subgraphs
 */
function checkSubgraphLayoutBalance(diagramCode: string): LayoutViolation[] {
	const violations: LayoutViolation[] = [];

	// Detect subgraphs
	const subgraphPattern = /subgraph\s+(\w+)\s*(?:\[([^\]]+)\])?\s*\n([\s\S]*?)end/gi;
	const subgraphs = [...diagramCode.matchAll(subgraphPattern)];

	if (subgraphs.length === 0) {
		return violations; // No subgraphs, no violations
	}

	// Extract main diagram direction
	const diagramTypePattern = /^(?:graph|flowchart)\s+(?<direction>TD|TB|LR|RL)/m;
	const directionMatch = diagramCode.match(diagramTypePattern);
	const mainDirection = directionMatch?.groups?.direction || "TD";

	// Warning about subgraph direction inheritance
	violations.push({
		type: "subgraph-direction-inheritance",
		severity: "medium",
		direction: mainDirection,
		recommendation: "Be aware that subgraphs inherit the parent direction and cannot override it",
		rationale: `Mermaid subgraphs always inherit the parent diagram's direction (${mainDirection}). If you need different layouts for different sections, consider creating separate diagrams instead of using subgraphs. Mobile-friendly tip: Use LR direction for better horizontal space utilization.`
	});

	// Check for visual balance: count nodes in each subgraph
	const subgraphNodeCounts = subgraphs.map((match) => {
		const subgraphContent = match[3];
		const nodes = subgraphContent.match(/\w+\[/g) || [];
		return nodes.length;
	});

	// Calculate balance
	if (subgraphNodeCounts.length >= 2) {
		const max = Math.max(...subgraphNodeCounts);
		const min = Math.min(...subgraphNodeCounts);
		const imbalanceRatio = max / (min || 1);

		// If one subgraph has 3x or more nodes than another, suggest rebalancing
		if (imbalanceRatio >= 3) {
			violations.push({
				type: "subgraph-imbalance",
				severity: "low",
				recommendation: "Consider rebalancing subgraph content for better visual layout",
				rationale: `Detected significant imbalance: largest subgraph has ${max} nodes, smallest has ${min} nodes (${imbalanceRatio.toFixed(1)}x difference). For mobile viewing (≤390px), more balanced subgraphs provide better visual hierarchy. Consider redistributing nodes or splitting large subgraphs.`
			});
		}
	}

	// Check for excessive subgraphs
	if (subgraphs.length > 4) {
		violations.push({
			type: "excessive-subgraphs",
			severity: "medium",
			recommendation:
				"Consider reducing the number of subgraphs or splitting into multiple diagrams",
			rationale: `Diagram has ${subgraphs.length} subgraphs. On mobile (≤390px), too many subgraphs can create visual clutter and make the diagram hard to navigate. Recommended maximum: 4 subgraphs per diagram. Consider creating separate focused diagrams for complex hierarchies.`
		});
	}

	return violations;
}

/**
 * Validate diagram for mobile optimization
 */
function validateMobileOptimization(diagramCode: string): LayoutViolation[] {
	return [
		...validateLayoutDirection(diagramCode),
		...checkDiagramComplexity(diagramCode),
		...checkSubgraphLayoutBalance(diagramCode)
	];
}

/**
 * Print violations
 */
function printViolations(violations: LayoutViolation[]): void {
	if (violations.length === 0) {
		console.log("\x1b[0;32m✓ Diagram is optimized for mobile\x1b[0m");
		return;
	}

	console.log(`\x1b[1;33m📱 Found ${violations.length} mobile optimization suggestion(s)\x1b[0m\n`);

	// Group by severity
	const high = violations.filter((v) => v.severity === "high");
	const medium = violations.filter((v) => v.severity === "medium");
	const low = violations.filter((v) => v.severity === "low");

	if (high.length > 0) {
		console.log("\x1b[0;31m❌ High Priority:\x1b[0m");
		high.forEach((v) => {
			console.log(`  - ${v.type}`);
			if (v.direction) console.log(`    Current: ${v.direction}`);
			console.log(`    Recommendation: ${v.recommendation}`);
			console.log(`    Why: ${v.rationale}`);
			console.log("");
		});
	}

	if (medium.length > 0) {
		console.log("\x1b[1;33m⚠️  Medium Priority:\x1b[0m");
		medium.forEach((v) => {
			console.log(`  - ${v.type}`);
			if (v.direction) console.log(`    Current: ${v.direction}`);
			console.log(`    Recommendation: ${v.recommendation}`);
			console.log(`    Why: ${v.rationale}`);
			console.log("");
		});
	}

	if (low.length > 0) {
		console.log("\x1b[0;36mℹ️  Low Priority (Recommendations):\x1b[0m");
		low.forEach((v) => {
			console.log(`  - ${v.type}`);
			if (v.direction) console.log(`    Current: ${v.direction}`);
			console.log(`    Recommendation: ${v.recommendation}`);
			console.log(`    Why: ${v.rationale}`);
			console.log("");
		});
	}

	console.log(
		"\x1b[0;36mNote:\x1b[0m Mobile optimization suggestions are recommendations, not requirements."
	);
	console.log("Use TD layout when vertical hierarchy is semantically important.");
}

/**
 * Main function
 */
function main(): void {
	const args = process.argv.slice(2);

	if (args.length !== 1) {
		console.log("Usage: node mobile-optimizer.ts <diagram-code|file-path>");
		console.log("");
		console.log("Examples:");
		console.log('  node mobile-optimizer.ts "graph TD\\n  A --> B"');
		console.log("  node mobile-optimizer.ts src/data/diagrams.ts");
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

	const violations = validateMobileOptimization(diagramCode);
	printViolations(violations);
}

// Run if called directly (ESM check)
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
	main();
}

export { validateMobileOptimization };
export type { LayoutViolation };
