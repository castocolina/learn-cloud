# TASK 10A: Comprehensive Code Audit and Cleanup

## Objective

Develop comprehensive code audit and cleanup following DOCS/SVELTE-INDEX.md patterns with mobile-first design (≤390px) and comprehensive testing.

## Dependencies

**Requires:**

- TASK 10: QA pipeline (completed)

**Referenced by:**

- TASK-10A-tests.md (test development for this component)

## Deliverables

- [ ] Component implementation
- [ ] Type definitions
- [ ] Documentation
- [ ] Mobile-first validation (≤390px tested BEFORE desktop)
- [ ] TypeScript compliance (0 errors, 0 warnings)
- [ ] Component tests passing (see TASK-10A-tests.md)

---

## Implementation Details

### Agent Responsibility

Conduct a comprehensive code audit to eliminate technical debt. Research automated dead code detection tools FIRST, then review ESLint suppressions, remove unused code, and document all findings. Goal: achieve `eslint.config.js` compliance + zero unused code per CLAUDE.md quality standards.

### Technical Documents to Review

- `CLAUDE.md` - Quality standards and library vetting process

- `eslint.config.js` - Current linting rules

- `DOCS/SVELTE-INDEX.md` - Code quality standards

- `package.json` and `Makefile` - Available scripts

### Prerequisites

- TASK 10: Quality Assurance & Validation Pipeline completed

- All prior development tasks completed

### Implementation Workflow

#### Phase 1: Automated Dead Code Detection Research

**Objective**: Identify and recommend automated tooling for dead code detection

**Tool Evaluation Criteria** (per CLAUDE.md Library Vetting):

- Check native TypeScript/ESLint solutions FIRST

- Last publish ≤6 months ago, 10k+ weekly downloads

- Verify peer dependency compatibility (ESLint v9+, TypeScript 5.7+)

- Use WebSearch to research alternatives

**Candidate Tools** (research and evaluate):

- `ts-prune` - Find unused exports in TypeScript projects

- `unimported` - Find unused files and dependencies

- `depcheck` - Check unused dependencies

- `eslint-plugin-unused-imports` - ESLint integration

- TypeScript compiler flags: `--noUnusedLocals`, `--noUnusedParameters`

**Deliverables**:

1. Test 2-3 top candidates in project environment

2. Compare accuracy, performance, and integration complexity

3. Recommend best tool(s) with installation instructions

4. Propose `package.json` script and Makefile target: `make audit-deadcode`

#### Phase 2: ESLint Suppression Audit

**Objective**: Review all `eslint-disable` comments (~23 instances in `src/**/*.ts` and `src/**/*.svelte`)

**Process**:

1. Identify all suppressions: `grep -rn "eslint-disable" src/ --include="*.ts" --include="*.svelte"`

2. For each suppression, decide:
   - **Fix**: Resolve underlying issue and remove suppression

   - **Justify**: Add inline comment explaining valid reason

   - **Configure**: Move to `eslint.config.js` if project-wide exception

3. Document in `tmp/reports/eslint-suppression-audit.md`:

```markdown
| File | Line | Rule | Action Taken | Justification |

| ---- | ---- | ---- | ------------ | ------------- |
```

#### Phase 3: Dead Code Removal

**Objective**: Use automated tools from Phase 1 + manual verification

**Automated Detection**:

- Run recommended tool(s) from Phase 1

- Generate initial list of unused code

**Manual Verification** (edge cases automated tools may miss):

- Unused components: `.svelte` files not imported anywhere

- Unused scripts: `src/bash/`, `src/python/` not referenced in `Makefile` or `package.json`

- Unused configuration: Orphaned config files in project root

- Unused Makefile targets: Not called by any automation

**Actions**:

- Remove verified unused code

- Document valid retention reasons (e.g., future use, external references)

- Verify removal: `pnpm run test` (must pass 100%)

#### Phase 4: Comprehensive Audit Report

**Report Location**: `tmp/reports/code-audit-report.md`

**Required Sections**:

##### Executive Summary

- ESLint suppressions: Total reviewed, fixed, justified, remaining

- Dead code: Files/functions identified, removed, retained (with justification)

- Scripts: Bash/Python/Makefile audited, unused removed

- Recommended tool: Name, installation, integration instructions

##### Detailed Findings

- Section 1: ESLint Suppression Audit (table with all actions)

- Section 2: Dead Code Removal (categorized by type: imports, functions, components, scripts)

- Section 3: Automated Tool Evaluation (comparison table, pros/cons)

- Section 4: Quality Metrics (before/after comparison)

##### Quality Metrics

**Before Audit**:

- ESLint suppressions: [X]

- Unused exports: [X]

- Test coverage: [X]%

**After Audit**:

- ESLint suppressions: [X] (reduction: [X]%)

- Unused exports: 0 ✅

- Test coverage: [X]%

- Code quality: eslint.config.js compliance + 100% tests ✅

##### Recommendations

- Immediate actions (priority fixes)

- Preventive measures (avoid future technical debt)

- CI/CD integration (automated checks)

##### Appendices

- A. Complete ESLint suppression table

- B. Removed code inventory (files, functions, lines deleted)

- C. Tool evaluation matrix (detailed comparison)

### Expected Output

- `tmp/reports/code-audit-report.md` - Comprehensive findings

- `tmp/reports/eslint-suppression-audit.md` - Detailed ESLint review

- Cleaned codebase with reduced technical debt

- Recommended dead code detection tool with integration plan

- Updated inline documentation for retained suppressions

### Testing Requirements

**Validation After Cleanup**:

- ✅ Three-tier validation: `make check-wip` → `pnpm run test` → `pnpm run format/lint/check`

- ✅ All tests pass: 100% pass rate

- ✅ No new ESLint errors or warnings

- ✅ TypeScript compilation successful

**Regression Prevention**:

- ✅ Verify removed code truly unused (grep search across codebase)

- ✅ Check git blame for context on suppression decisions

- ✅ Review PR history for technical debt rationale

### Final Validations

- ✅ CLAUDE.md quality standards met

- ✅ All ESLint suppressions reviewed (fixed or justified with inline comments)

- ✅ Zero unused code (or documented exceptions)

- ✅ Dead code detection tool researched and recommended

- ✅ Comprehensive audit report generated with all required sections

- ✅ No functionality broken by cleanup

### Success Criteria

**Code Quality Metrics**:

- ESLint suppressions reduced by ≥50% (or all justified)

- Zero unused exports/imports (verified by automated tool)

- 100% test pass rate maintained

- All scripts referenced in Makefile/package.json

**Documentation Completeness**:

- Detailed audit report with all findings

- Every retained suppression has justification comment

- Dead code detection tool evaluation complete

- Integration plan provided for recommended tool

**Maintainability Improvements**:

- Cleaner codebase with reduced technical debt

- Automated dead code detection integrated

- Clear guidelines for future suppression usage

- Preventive measures documented

---

---

## Validation Criteria

- [ ] Tier 1: `make check-wip` passes (5-15s) - modified files only
- [ ] Tier 2: Unit tests pass - `pnpm run test src/test/...` (see TASK-10A-tests.md)
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
