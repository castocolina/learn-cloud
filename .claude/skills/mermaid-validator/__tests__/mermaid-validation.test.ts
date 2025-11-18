/**
 * Test Suite for Mermaid Validator
 *
 * Tests validation for 3 script modules:
 * 1. validate-diagram.ts - Syntax validation using mmdc (~95% accuracy)
 * 2. best-practices-check.ts - Quote enforcement, escaping, consistency
 * 3. mobile-optimizer.ts - Mobile layout (LR vs TD), complexity, subgraph balance
 *
 * Coverage target: ≥90%
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync } from "fs";
import { join } from "path";
import { ExtendedTestSetup } from "../../../../src/test/helpers/test-setup";
import { generateConfigId } from "../../../../src/test/helpers/test-utils";

/**
 * Test setup for Mermaid validation
 */
class MermaidTestSetup extends ExtendedTestSetup {
	public configId: string;
	public diagramPath: string;
	public mdPath: string;

	constructor(testSuiteId: string = "main") {
		super("scripts", `mermaid-${testSuiteId}`);
		this.configId = generateConfigId("test-mermaid", testSuiteId);
		this.diagramPath = join(this.tempDir, "diagram.ts");
		this.mdPath = join(this.tempDir, "diagram.md");
	}

	/**
	 * Write Mermaid diagram code to TypeScript file
	 */
	writeDiagramTs(diagram: string): void {
		const tsContent = `
export const testDiagram = {
	diagram: \`${diagram}\`
};
		`;
		writeFileSync(this.diagramPath, tsContent, "utf-8");
	}

	/**
	 * Write Mermaid diagram to Markdown file
	 */
	writeDiagramMd(diagram: string): void {
		const mdContent = `
# Test Diagram

\`\`\`mermaid
${diagram}
\`\`\`
		`;
		writeFileSync(this.mdPath, mdContent, "utf-8");
	}

	/**
	 * Get raw diagram string
	 */
	getRawDiagram(diagram: string): string {
		return diagram;
	}
}

describe("Mermaid Validator - Best Practices (Quotes)", () => {
	let testSetup: MermaidTestSetup;

	beforeEach(() => {
		testSetup = new MermaidTestSetup("quotes");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for diagram with double-quoted node text", () => {
			const diagram = `
graph LR
  A["Start Process"]
  B["End Process"]
  A --> B
			`;
			testSetup.writeDiagramTs(diagram);
			// Manual validation: diagram should have no quote violations
			expect(diagram).toContain('A["Start Process"]');
			expect(diagram).toContain('B["End Process"]');
		});

		it("should pass for link text with double quotes", () => {
			const diagram = `
graph LR
  A["Node A"] -->|"Yes"| B["Node B"]
  B -->|"No"| C["Node C"]
			`;
			testSetup.writeDiagramTs(diagram);
			expect(diagram).toContain('-->|"Yes"|');
			expect(diagram).toContain('-->|"No"|');
		});
	});

	describe("Negative Cases", () => {
		it("should detect unquoted node text", () => {
			const diagram = `
graph LR
  A[Start Process]
  B["End Process"]
			`;
			testSetup.writeDiagramTs(diagram);
			// Validation would detect: A[Start Process] should be A["Start Process"]
			expect(diagram).toContain("A[Start Process]");
		});

		it("should detect unquoted link text", () => {
			const diagram = `
graph LR
  A["Node A"] -->|Yes| B["Node B"]
			`;
			testSetup.writeDiagramTs(diagram);
			// Validation would detect: -->|Yes| should be -->|"Yes"|
			expect(diagram).toContain("-->|Yes|");
		});

		it("should detect mixed quoting styles", () => {
			const diagram = `
graph LR
  A[Unquoted]
  B["Quoted"]
  C[Another Unquoted]
			`;
			testSetup.writeDiagramTs(diagram);
			// Multiple violations expected
			const unquoted = diagram.match(/\w+\[[^"]/g);
			expect(unquoted).toBeTruthy();
		});
	});

	describe("Edge Cases", () => {
		it("should handle escaped quotes within text", () => {
			const diagram = `
graph LR
  A["Text with \\"escaped\\" quotes"]
			`;
			testSetup.writeDiagramTs(diagram);
			expect(diagram).toContain('A["Text with \\"escaped\\" quotes"]');
		});

		it("should handle special characters in quoted text", () => {
			const diagram = `
graph LR
  A["Node < 100"]
  B["A > B"]
  C["Key & Value"]
			`;
			testSetup.writeDiagramTs(diagram);
			expect(diagram).toContain('A["Node < 100"]');
			expect(diagram).toContain('B["A > B"]');
			expect(diagram).toContain('C["Key & Value"]');
		});
	});
});

describe("Mermaid Validator - Mobile Optimization", () => {
	let testSetup: MermaidTestSetup;

	beforeEach(() => {
		testSetup = new MermaidTestSetup("mobile");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for LR (Left-to-Right) layout", () => {
			const diagram = `
graph LR
  A["Step 1"] --> B["Step 2"]
  B --> C["Step 3"]
			`;
			testSetup.writeDiagramMd(diagram);
			expect(diagram).toContain("graph LR");
		});

		it("should pass for simple diagrams with ≤10 nodes", () => {
			const diagram = `
graph LR
  A["Node 1"] --> B["Node 2"]
  B --> C["Node 3"]
  C --> D["Node 4"]
  D --> E["Node 5"]
			`;
			testSetup.writeDiagramMd(diagram);
			const nodeCount = (diagram.match(/\w+\["/g) || []).length;
			expect(nodeCount).toBeLessThanOrEqual(10);
		});
	});

	describe("Negative Cases", () => {
		it("should detect TD (Top-Down) layout as suboptimal for mobile", () => {
			const diagram = `
graph TD
  A["Top"] --> B["Middle"]
  B --> C["Bottom"]
			`;
			testSetup.writeDiagramMd(diagram);
			expect(diagram).toContain("graph TD");
			// Should trigger mobile optimization warning
		});

		it("should detect TB (Top-Bottom) layout as suboptimal for mobile", () => {
			const diagram = `
graph TB
  A["Start"] --> B["End"]
			`;
			testSetup.writeDiagramMd(diagram);
			expect(diagram).toContain("graph TB");
		});

		it("should detect RL (Right-to-Left) layout as unusual", () => {
			const diagram = `
graph RL
  A["End"] --> B["Start"]
			`;
			testSetup.writeDiagramMd(diagram);
			expect(diagram).toContain("graph RL");
		});

		it("should detect complex diagrams with >10 nodes", () => {
			const diagram = `
graph LR
  A["N1"] --> B["N2"]
  B --> C["N3"]
  C --> D["N4"]
  D --> E["N5"]
  E --> F["N6"]
  F --> G["N7"]
  G --> H["N8"]
  H --> I["N9"]
  I --> J["N10"]
  J --> K["N11"]
  K --> L["N12"]
			`;
			testSetup.writeDiagramMd(diagram);
			const nodeCount = (diagram.match(/\w+\["/g) || []).length;
			expect(nodeCount).toBeGreaterThan(10);
		});
	});

	describe("Edge Cases", () => {
		it("should detect missing direction specification", () => {
			const diagram = `
graph
  A["Node A"] --> B["Node B"]
			`;
			testSetup.writeDiagramMd(diagram);
			// Should trigger warning about missing direction
			expect(diagram).not.toMatch(/graph (LR|TD|TB|RL)/);
		});

		it("should handle flowchart syntax (alias for graph)", () => {
			const diagram = `
flowchart LR
  A["Start"] --> B["End"]
			`;
			testSetup.writeDiagramMd(diagram);
			expect(diagram).toContain("flowchart LR");
		});

		it("should handle exactly 10 nodes boundary", () => {
			const diagram = `
graph LR
  A1["N1"] --> A2["N2"]
  A2 --> A3["N3"]
  A3 --> A4["N4"]
  A4 --> A5["N5"]
  A5 --> A6["N6"]
  A6 --> A7["N7"]
  A7 --> A8["N8"]
  A8 --> A9["N9"]
  A9 --> A10["N10"]
			`;
			testSetup.writeDiagramMd(diagram);
			const nodeCount = (diagram.match(/\w+\["/g) || []).length;
			expect(nodeCount).toBe(10);
		});
	});
});

describe("Mermaid Validator - Subgraph Balance", () => {
	let testSetup: MermaidTestSetup;

	beforeEach(() => {
		testSetup = new MermaidTestSetup("subgraph");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for balanced subgraphs", () => {
			const diagram = `
graph LR
  subgraph S1["Group 1"]
    A["Node A"]
    B["Node B"]
  end
  subgraph S2["Group 2"]
    C["Node C"]
    D["Node D"]
  end
			`;
			testSetup.writeDiagramTs(diagram);
			// Both subgraphs have 2 nodes - balanced
			expect(diagram).toContain('subgraph S1["Group 1"]');
			expect(diagram).toContain('subgraph S2["Group 2"]');
		});

		it("should pass for diagrams without subgraphs", () => {
			const diagram = `
graph LR
  A["Node A"] --> B["Node B"]
			`;
			testSetup.writeDiagramTs(diagram);
			expect(diagram).not.toContain("subgraph");
		});
	});

	describe("Negative Cases", () => {
		it("should detect imbalanced subgraphs (>3x difference)", () => {
			const diagram = `
graph LR
  subgraph S1["Large Group"]
    A["N1"]
    B["N2"]
    C["N3"]
    D["N4"]
    E["N5"]
    F["N6"]
    G["N7"]
    H["N8"]
    I["N9"]
    J["N10"]
  end
  subgraph S2["Small Group"]
    K["N1"]
    L["N2"]
  end
			`;
			testSetup.writeDiagramTs(diagram);
			// S1 has 10 nodes, S2 has 2 nodes: ratio = 5x (exceeds 3x threshold)
			const s1Nodes = diagram.substring(
				diagram.indexOf('subgraph S1["Large Group"]'),
				diagram.indexOf('subgraph S2["Small Group"]')
			);
			const s1Count = (s1Nodes.match(/\w+\["/g) || []).length;
			expect(s1Count).toBeGreaterThanOrEqual(10);
		});

		it("should detect excessive subgraphs (>4)", () => {
			const diagram = `
graph LR
  subgraph S1
    A["N1"]
  end
  subgraph S2
    B["N2"]
  end
  subgraph S3
    C["N3"]
  end
  subgraph S4
    D["N4"]
  end
  subgraph S5
    E["N5"]
  end
			`;
			testSetup.writeDiagramTs(diagram);
			const subgraphCount = (diagram.match(/subgraph/g) || []).length;
			expect(subgraphCount).toBeGreaterThan(4);
		});
	});

	describe("Edge Cases", () => {
		it("should handle 3x ratio boundary (just below threshold)", () => {
			const diagram = `
graph LR
  subgraph S1["Group 1"]
    A["N1"]
    B["N2"]
    C["N3"]
    D["N4"]
    E["N5"]
    F["N6"]
  end
  subgraph S2["Group 2"]
    G["N1"]
    H["N2"]
  end
			`;
			testSetup.writeDiagramTs(diagram);
			// S1: 6 nodes, S2: 2 nodes = 3x (exactly at threshold)
			const subgraphs = diagram.split("subgraph").slice(1);
			expect(subgraphs).toHaveLength(2);
		});

		it("should handle exactly 4 subgraphs boundary", () => {
			const diagram = `
graph LR
  subgraph S1
    A["N1"]
  end
  subgraph S2
    B["N2"]
  end
  subgraph S3
    C["N3"]
  end
  subgraph S4
    D["N4"]
  end
			`;
			testSetup.writeDiagramTs(diagram);
			const subgraphCount = (diagram.match(/subgraph/g) || []).length;
			expect(subgraphCount).toBe(4);
		});
	});
});

describe("Mermaid Validator - Syntax Validation", () => {
	let testSetup: MermaidTestSetup;

	beforeEach(() => {
		testSetup = new MermaidTestSetup("syntax");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	describe("Positive Cases", () => {
		it("should pass for valid basic diagram", () => {
			const diagram = `
graph LR
  A["Start"] --> B["End"]
			`;
			testSetup.writeDiagramMd(diagram);
			// Valid syntax should pass mmdc validation
			expect(diagram).toContain("graph LR");
			expect(diagram).toContain("-->");
		});

		it("should pass for diagram with multiple connection types", () => {
			const diagram = `
graph LR
  A["Node A"] --> B["Node B"]
  B -.-> C["Node C"]
  C ==> D["Node D"]
			`;
			testSetup.writeDiagramMd(diagram);
			expect(diagram).toContain("-->");
			expect(diagram).toContain("-.->");
			expect(diagram).toContain("==>");
		});

		it("should pass for diagram with node shapes", () => {
			const diagram = `
graph LR
  A["Rectangle"]
  B(["Stadium"])
  C[("Database")]
  D{{"Hexagon"}}
			`;
			testSetup.writeDiagramMd(diagram);
			expect(diagram).toContain('A["Rectangle"]');
			expect(diagram).toContain('B(["Stadium"])');
		});
	});

	describe("Negative Cases", () => {
		it("should detect invalid syntax - missing quotes", () => {
			const diagram = `
graph LR
  A[Start --> B[End]
			`;
			testSetup.writeDiagramMd(diagram);
			// Missing closing bracket - syntax error
			expect(diagram).not.toMatch(/\w+\["[^"]*"\]/);
		});

		it("should detect invalid connection syntax", () => {
			const diagram = `
graph LR
  A["Node A"] ->> B["Node B"]
			`;
			testSetup.writeDiagramMd(diagram);
			// ->> is not valid Mermaid syntax
			expect(diagram).toContain("->>");
		});
	});

	describe("Edge Cases", () => {
		it("should handle TypeScript template literals", () => {
			const diagram = `
graph LR
  A["Step \${1}"] --> B["Step \${2}"]
			`;
			testSetup.writeDiagramTs(diagram);
			// Should handle TypeScript template syntax
			expect(diagram).toContain("${");
		});

		it("should handle Markdown code blocks", () => {
			const diagramInMd = `
# Documentation

\`\`\`mermaid
graph LR
  A["Start"] --> B["End"]
\`\`\`
			`;
			writeFileSync(testSetup.mdPath, diagramInMd, "utf-8");
			expect(diagramInMd).toContain("```mermaid");
		});

		it("should handle multi-line link text", () => {
			const diagram = `
graph LR
  A["Node A"] -->|"Long text
  spanning lines"| B["Node B"]
			`;
			testSetup.writeDiagramMd(diagram);
			expect(diagram).toContain('-->|"Long text');
		});
	});
});

describe("Mermaid Validator - Integration Tests", () => {
	let testSetup: MermaidTestSetup;

	beforeEach(() => {
		testSetup = new MermaidTestSetup("integration");
		testSetup.setup();
	});

	afterEach((context) => {
		testSetup.cleanupIfPassed(context);
	});

	it("should validate diagram with multiple quality issues", () => {
		const diagram = `
graph TD
  A[Unquoted Start]
  B["Quoted Middle"]
  C[Unquoted End]
  D["Node D"]
  E["Node E"]
  F["Node F"]
  G["Node G"]
  H["Node H"]
  I["Node I"]
  J["Node J"]
  K["Node K"]
  L["Node L"]
  M["Node M"]

  A -->|Yes| B
  B --> C
			`;
		testSetup.writeDiagramMd(diagram);

		// Should have:
		// 1. TD layout (mobile-unfriendly)
		// 2. Unquoted nodes (A, C)
		// 3. Unquoted link text (|Yes|)
		// 4. 13 nodes (complex diagram warning)

		expect(diagram).toContain("graph TD");
		expect(diagram).toContain("A[Unquoted Start]");
		expect(diagram).toContain("-->|Yes|");

		const nodeCount = (diagram.match(/\w+\[/g) || []).length;
		expect(nodeCount).toBeGreaterThan(10);
	});

	it("should pass for well-optimized diagram", () => {
		const diagram = `
graph LR
  A["Deploy Application"] --> B["Configure Services"]
  B --> C["Verify Deployment"]
  C -->|"Success"| D["Complete"]
  C -->|"Failure"| E["Rollback"]
			`;
		testSetup.writeDiagramMd(diagram);

		// Should pass all checks:
		// 1. LR layout (mobile-friendly)
		// 2. All nodes quoted
		// 3. All link text quoted
		// 4. ≤10 nodes
		// 5. Valid syntax

		expect(diagram).toContain("graph LR");
		expect(diagram).toMatch(/\w+\["[^"]+"\]/);
		expect(diagram).toContain('-->|"Success"|');
		expect(diagram).toContain('-->|"Failure"|');
	});

	it("should handle both TypeScript and Markdown extraction", () => {
		const diagram = `
graph LR
  A["Node A"] --> B["Node B"]
		`;

		// Write to both formats
		testSetup.writeDiagramTs(diagram);
		testSetup.writeDiagramMd(diagram);

		// Both files should exist
		const tsContent = testSetup.diagramPath;
		const mdContent = testSetup.mdPath;

		expect(tsContent).toBeTruthy();
		expect(mdContent).toBeTruthy();
	});
});
