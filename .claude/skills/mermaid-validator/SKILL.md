---
description: |
  Validates Mermaid diagrams (mermaid diagram, diagram syntax, diagram errors, mermaid validation) using mmdc for ~95% syntax accuracy.
  Enforces best practices (double quotes, proper escaping), mobile optimization (LR layout ≤390px), TypeScript integration
  (diagram/definition/diagramDefinition properties), and component requirements (expand, debug, error handling).
allowed-tools: [Read, Grep, Bash]
---

# Mermaid Validator Skill

Validates Mermaid diagram correctness and compliance by enforcing syntax standards, best practices, mobile optimization, and component integration requirements using mmdc (Mermaid CLI) for server-side validation.

## Capabilities

### 1. Syntax Validation with mmdc

- **Server-side validation** using `@mermaid-js/mermaid-cli` (~95% accuracy)
- **No browser dependencies** - works in Node.js/CLI environments
- **Production reliability** - mmdc-validated diagrams render correctly in browsers
- **CI/CD integration** - perfect for automated validation pipelines

**Usage**:

```bash
# Validate single markdown file
node scripts/validate-diagram.ts docs/README.md

# Validate TypeScript file with diagrams
node scripts/validate-diagram.ts src/data/diagrams.ts

# Validate directory recursively
node scripts/validate-diagram.ts src/data/
```

### 2. Best Practice Enforcement

Validates diagrams against [MERMAID-STANDARDS.md](../../../docs/standards/MERMAID-STANDARDS.md):

- ✅ **Double quote all text** - Prevents parsing errors with special characters
- ✅ **Prefer raw characters** - Use `<`, `>`, `&` instead of HTML entities
- ✅ **Escape special characters** - Use `\"` for quotes within text
- ✅ **Consistent bracket syntax** - Proper `[]`, `()`, `{}`, `[[]]`, `[()]`
- ✅ **Link text format** - All link text in double quotes

**Usage**:

```bash
node scripts/best-practices-check.ts src/data/diagrams.ts
```

### 3. Mobile Optimization & Context-Aware Layout

- **Prefer LR layout** for mobile (≤390px viewport)
- **Warn on TD layouts** unless vertical hierarchy is semantically important
- **Subgraph direction inheritance** - warns that subgraphs inherit parent direction (cannot override)
- **Visual balance detection** - flags imbalanced subgraph node distribution (3x+ difference)
- **Complexity warnings** - suggests splitting diagrams with >10 nodes or >4 subgraphs
- **Test diagrams** at mobile viewport width

**Context-Aware Features**:

- **Subgraph Direction Awareness**: Validates that developers understand Mermaid's limitation where subgraphs always inherit the parent diagram's direction. If different layouts are needed for different sections, recommends creating separate diagrams instead.
- **Visual Balance**: Detects when one subgraph has significantly more nodes than others (3x+ imbalance), which can create poor visual hierarchy on mobile.
- **Reference**: [Mermaid Subgraph Direction Documentation](https://docs.mermaidchart.com/mermaid-oss/syntax/flowchart.html#direction-in-subgraphs)

**Usage**:

```bash
node scripts/mobile-optimizer.ts src/data/diagrams.ts
```

**Example Warnings**:

- "Subgraphs inherit parent direction (LR) and cannot override it"
- "Subgraph imbalance detected: largest has 12 nodes, smallest has 3 nodes (4.0x difference)"
- "Diagram has 6 subgraphs - consider splitting into multiple focused diagrams"

### 4. TypeScript Integration

Validates diagram property naming conventions:

- ✅ Valid: `diagram`, `definition`, `diagramDefinition`
- ❌ Invalid: `diagramCode`, `mermaid`, `content`

### 5. Component Integration

Validates Mermaid components implement:

- Expand functionality (`showExpandButton` prop + Dialog modal)
- Debug mode (`debug` prop + URL parameter check)
- Error handling (try-catch + fallback UI)
- Orphaned element cleanup
- Accessibility (ARIA labels)

## Auto-Trigger Conditions

This skill activates when:

- Creating/modifying files with Mermaid diagrams
- Creating/updating Mermaid component implementations
- Before content publication (draft → final transition)
- During build process (pre-commit, CI/CD)

## Validation Report Format

When issues found, provides actionable fixes:

```markdown
## Mermaid Validation Report

### File: src/data/diagrams.ts

#### Syntax Errors (BLOCKING)

- Variable 'authFlow.diagram' - Line 15
  mmdc error: Parse error on line 3: Expecting 'SOLID', 'SEMI', got 'INVALID'
  Fix: Review syntax at line 18

#### Best Practice Violations

- Missing quotes on node text
  Current: A[User Login]
  Fix: A["User Login"]
  Line: 16

#### Mobile Optimization (Recommendation)

- Layout direction: graph TD
  Recommendation: graph LR
  Rationale: Better mobile reflow (≤390px)
```

## Integration

Works with:

- **content-guardian** - Validates diagram blocks in lesson content
- **validation-enforcer** - Mermaid validation in tier 1 validation
- **component-integration-guardian** - Validates Mermaid component implementations

## Success Criteria

1. ✅ 100% of diagrams pass mmdc validation
2. ✅ All diagrams follow best practices (quotes, escaping, brackets)
3. ✅ Diagrams use LR layout unless vertical hierarchy essential
4. ✅ All diagram properties follow naming conventions
5. ✅ All Mermaid components implement required features
6. ✅ Zero Mermaid rendering errors in production

## References

- [MERMAID-STANDARDS.md](../../../docs/standards/MERMAID-STANDARDS.md) - Complete syntax standards
- [Mermaid.js Documentation](https://mermaid.js.org/) - Official reference (v11.11.0)
- [MermaidDiagram.svelte](../../../src/lib/components/demo/MermaidDiagram.svelte) - Reference component
