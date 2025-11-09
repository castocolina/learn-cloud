# TASK 10B: CSS Linting Infrastructure Exploration (Technical Debt)

## Objective

Develop css linting infrastructure exploration (technical debt) following DOCS/SVELTE-INDEX.md patterns with mobile-first design (≤390px) and comprehensive testing.

## Dependencies

**Requires:**

- TASK 10A: Code audit (completed)

**Referenced by:**

- TASK-10B-tests.md (test development for this component)

## Deliverables

- [ ] Component implementation
- [ ] Type definitions
- [ ] Documentation
- [ ] Mobile-first validation (≤390px tested BEFORE desktop)
- [ ] TypeScript compliance (0 errors, 0 warnings)
- [ ] Component tests passing (see TASK-10B-tests.md)

---

## Implementation Details

### Agent Responsibility

Explore and evaluate CSS linting library integration (Stylelint or alternatives) as a **supplement** (not replacement) to the existing `validate-theme.ts` script. Research modern CSS validation tools for syntax checking while maintaining our custom architectural validations.

### Context & Rationale

The `src/scripts/validate-theme.ts` script provides **unique architectural validations** that standard CSS linters cannot replicate:

- Tailwind v4 compatibility enforcement (@apply usage patterns)

- Theme system coherence (`:root` and `.dark` variable consistency)

- Z-index hierarchy management (enforcing `var(--z-*)` usage)

- Stacking context auditing (architecture-level validation)

- Modular CSS architecture compliance (no inline styles, component style blocks)

**Coverage Analysis**: 71% of current validations are framework/architecture-specific and **cannot be replicated** by standard CSS linters.

**Decision**: Defer CSS linter integration as optional supplement for syntax validation only.

### Technical Documents to Review

- `src/scripts/validate-theme.ts` (Current implementation - DO NOT deprecate)

- `DOCS/SVELTE-INDEX.md` (Tailwind v4 + Svelte 5 architecture)

- `.github/workflows/validation.yml` (Current CI/CD integration)

- `check-wip.sh` (Local validation workflow)

- **Analysis Reference**: See comprehensive feasibility study from 2025-10-31

### Prerequisites

- TASK 10A: Comprehensive Code Audit completed

- Stable Tailwind v4 + Svelte 5 codebase

- **Condition**: Only proceed if CSS syntax validation gaps identified during development

### Implementation Scope

#### Phase 1: Library Research & Evaluation

**Objective**: Identify actively-maintained CSS linting libraries compatible with Tailwind v4 + Svelte 5

**Evaluation Criteria** (per CLAUDE.md Library Vetting):

- Native framework solutions checked FIRST (Tailwind v4 plugins, Svelte 5 tools)

- Last publish ≤6 months ago, 10k+ weekly downloads OR official package

- Verify peer dependency compatibility

- Test Tailwind v4 compatibility (CSS nesting, @layer, @theme directives)

- Confirm Svelte 5 parsing support (`<style>` blocks in components)

**Candidate Libraries** (research and evaluate):

- `stylelint` v16+ (primary candidate, 25M+ weekly downloads)

- `stylelint-config-standard` (official standard rules)

- `postcss-html` (HTML/Svelte parsing)

- `stylelint-config-html` (Svelte integration - check Svelte 5 compatibility)

- Tailwind v4 specific plugins (if available)

**Deliverables**:

1. Maintenance status report (GitHub activity, npm downloads)

2. Tailwind v4 compatibility test results

3. Svelte 5 parsing verification

4. Performance benchmarking (impact on `make check-wip`)

#### Phase 2: Hybrid Architecture Design

**Objective**: Design integration strategy that **keeps** `validate-theme.ts` as primary validation

**Architecture Pattern**:

```

┌─────────────────────────────────────────┐

│ Tier 1: Fast Validation (5-15s)         │

├─────────────────────────────────────────┤

│ 1. Prettier (formatting)                 │

│ 2. ESLint (JavaScript/TypeScript)        │

│ 3. validate-theme.ts (architecture) ✅   │

│ 4. Stylelint (CSS syntax - OPTIONAL)    │

└─────────────────────────────────────────┘

```

**Key Principles**:

- `validate-theme.ts` remains **mandatory** (architectural validation)

- Stylelint is **optional supplement** (CSS syntax only)

- No performance degradation (use caching, parallel CI execution)

- Disabled by default via `ENABLE_STYLELINT_CHECK=false` flag

#### Phase 3: Configuration & Integration (If Proceeding)

**Configuration File**: `.stylelintrc.json`

```json
{
	"extends": ["stylelint-config-standard", "stylelint-config-html/svelte"],

	"customSyntax": "postcss-html",

	"rules": {
		"at-rule-no-unknown": [
			true,

			{
				"ignoreAtRules": ["tailwind", "apply", "layer", "theme"]
			}
		],

		"selector-class-pattern": null
	}
}
```

**Integration Points**:

- **Local**: `check-wip.sh` with opt-in flag

- **Pre-commit**: Optional (performance-sensitive)

- **CI/CD**: Parallel matrix job (zero time penalty)

#### Phase 4: Testing & Documentation

**Testing Requirements**:

- CSS syntax validation accuracy

- False positive rate assessment

- Performance impact measurement

- Tailwind v4 directive compatibility

**Documentation Updates**:

- `DOCS/SVELTE-INDEX.md` - CSS validation architecture

- `CLAUDE.md` - Update quality standards if integrated

- Inline documentation in configuration files

### Expected Output (If Implementation Proceeds)

- **Research Report**: `tmp/reports/css-linting-evaluation.md`

- **Configuration**: `.stylelintrc.json` (optional)

- **Integration Scripts**: Updated `check-wip.sh` with opt-in flag

- **CI/CD Updates**: `.github/workflows/validation.yml` parallel job

- **Performance Report**: Before/after benchmarks

### Success Criteria

**Research Phase (MINIMUM DELIVERABLE)**:

- ✅ Library maintenance status verified

- ✅ Tailwind v4 + Svelte 5 compatibility assessed

- ✅ Performance impact estimated

- ✅ Decision documented: integrate vs defer

**Implementation Phase (ONLY IF DECISION = INTEGRATE)**:

- ✅ `validate-theme.ts` remains primary validator (no deprecation)

- ✅ Stylelint integration is opt-in (disabled by default)

- ✅ Zero performance degradation on `make check-wip`

- ✅ CI/CD runs in parallel (no time penalty)

- ✅ False positive rate acceptable (<5%)

### Decision Points

**Proceed with Integration IF**:

- CSS syntax errors frequently slip through current validation

- Team size grows (standardization becomes valuable)

- Tailwind v4 + Svelte 5 ecosystem support is mature

**Defer Integration IF**:

- Current validation is sufficient (likely scenario)

- Performance impact is significant

- Ecosystem compatibility is immature

- Team prefers lean tooling

### Notes

- This is **technical debt exploration**, not a critical path item

- `validate-theme.ts` provides irreplaceable value (71% unique validations)

- Only pursue if clear benefit identified during development

- Document decision rationale regardless of outcome

---

## Validation Criteria

- [ ] Tier 1: `make check-wip` passes (5-15s) - modified files only
- [ ] Tier 2: Unit tests pass - `pnpm run test src/test/...` (see TASK-10B-tests.md)
- [ ] Tier 3: Full validation - `pnpm run format` && `pnpm run lint` && `pnpm run check`
- [ ] Mobile-first: Tested at ≤390px BEFORE desktop testing
- [ ] TypeScript: 0 errors, 0 warnings
- [ ] Accessibility: Focus management, keyboard navigation, ARIA attributes

## References

- **Implementation Guide:** @docs/SVELTE-COMPONENTS.md
- **Development Patterns:** @docs/SVELTE-DEVELOPMENT.md
- **Testing Guide:** @docs/TESTING.md

- **Architecture:** @docs/SVELTE-ARCHITECTURE.md
- **Styling:** @docs/SVELTE-STYLING.md

---

**Last Updated:** 2025-01-08
**Status:** Ready for implementation
