## Mermaid Validator - Reference Documentation

### Standards and Guidelines

- **[MERMAID-STANDARDS.md](../../../docs/standards/MERMAID-STANDARDS.md)** - Complete Mermaid syntax rules and best practices
- **[CONTENT-STANDARDS.md](../../../docs/standards/CONTENT-STANDARDS.md)** - Educational context and integration guidelines
- **[Mermaid.js Documentation](https://mermaid.js.org/)** - Official syntax reference (v11.11.0)

### Component Reference

- **[MermaidDiagram.svelte](../../../src/lib/components/demo/MermaidDiagram.svelte)** - Reference component implementation
- **[Component Integration Guardian](../../agents/component-integration-guardian.md)** - Component validation agent

### Validation Scripts

#### validate-diagram.ts

Main validation script using mmdc for syntax checking.

**Features**:

- Validates Markdown files (```mermaid blocks)
- Validates TypeScript files (diagram properties)
- Supports directory recursive scanning
- ~95% syntax accuracy with mmdc

**Usage**:

```bash
# Single file
node scripts/validate-diagram.ts docs/README.md

# Directory
node scripts/validate-diagram.ts src/data/

# TypeScript files
node scripts/validate-diagram.ts src/data/diagrams.ts
```

#### best-practices-check.ts

Validates diagrams against MERMAID-STANDARDS.md best practices.

**Checks**:

1. Double quote all text
2. Prefer raw special characters (< > &)
3. Escape quotes within text
4. Consistent bracket syntax
5. Link text format

**Usage**:

```bash
node scripts/best-practices-check.ts src/data/diagrams.ts
```

#### mobile-optimizer.ts

Validates layout optimization for mobile devices (≤390px).

**Checks**:

- Layout direction (prefer LR over TD)
- Diagram complexity (warn if >10 nodes)
- Mobile viewport compatibility

**Usage**:

```bash
node scripts/mobile-optimizer.ts src/data/diagrams.ts
```

### Integration with Validation Tiers

**Tier 1 (check-wip)**: Syntax validation with mmdc
**Tier 2 (tests)**: Best practices validation
**Tier 3 (full)**: Mobile optimization + component integration

### Related Agents

- **content-guardian** - Validates diagram blocks in lesson content
- **validation-enforcer** - Orchestrates validation tiers
- **component-integration-guardian** - Validates Mermaid component implementations
- **doc-sync-specialist** - Updates MERMAID-STANDARDS when patterns change

### Diagram Type Selection Guide

| Use Case               | Recommended Type        | Alternative           |
| ---------------------- | ----------------------- | --------------------- |
| Process flows          | `graph LR`              | `flowchart LR`        |
| API interactions       | `sequenceDiagram`       | `zenuml`              |
| Object-oriented design | `classDiagram`          | -                     |
| Database schema        | `erDiagram`             | -                     |
| State transitions      | `stateDiagram-v2`       | -                     |
| System architecture    | `block`, `architecture` | `C4Context` (caution) |
| Development workflow   | `gitgraph`              | `gantt`               |
| User experience        | `journey`               | -                     |
| Data flows             | `sankey`                | `graph LR`            |

### Success Criteria

- ✅ 100% of diagrams pass mmdc validation
- ✅ All diagrams follow best practices (quotes, escaping, brackets)
- ✅ Diagrams use LR layout unless vertical hierarchy essential
- ✅ All diagram properties follow naming conventions (diagram/definition/diagramDefinition)
- ✅ All Mermaid components implement required features
- ✅ Zero Mermaid rendering errors in production
