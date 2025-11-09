# Task Documentation Index

**Cloud-Native Learning Platform - Development Tasks**

This directory contains all project tasks split from `PLAN-TODO-FEATURES.md` for better organization and parallel execution capability.

---

## Quick Navigation

### Active Development Tasks (TASK 8I - 8X)

| Task ID | Component                  | Implementation                                                         | Tests                                | Dependencies        |
| ------- | -------------------------- | ---------------------------------------------------------------------- | ------------------------------------ | ------------------- |
| **8I**  | Quiz/Exam Navigation       | [TASK-8I-quiz-navigation.md](TASK-8I-quiz-navigation.md)               | [TASK-8I-tests.md](TASK-8I-tests.md) | TASK 8H (FlipCard)  |
| **8J**  | Popover Component          | [TASK-8J-popover.md](TASK-8J-popover.md)                               | [TASK-8J-tests.md](TASK-8J-tests.md) | TASK 8E (Dialog)    |
| **8K**  | Enhanced Progress Tracking | [TASK-8K-progress-tracking.md](TASK-8K-progress-tracking.md)           | [TASK-8K-tests.md](TASK-8K-tests.md) | TASK 8J (Popover)   |
| **8L**  | Navigation Coordinator     | [TASK-8L-navigation-coordinator.md](TASK-8L-navigation-coordinator.md) | [TASK-8L-tests.md](TASK-8L-tests.md) | TASK 8A, 8B, 8C, 8J |
| **8M**  | Search Component           | [TASK-8M-search.md](TASK-8M-search.md)                                 | [TASK-8M-tests.md](TASK-8M-tests.md) | TASK 8A, 8C, 8E, 8L |
| **8N**  | Theme Switcher             | [TASK-8N-theme-switcher.md](TASK-8N-theme-switcher.md)                 | [TASK-8N-tests.md](TASK-8N-tests.md) | TASK 8M (Search)    |
| **8X**  | Component Integration      | [TASK-8X-integration.md](TASK-8X-integration.md)                       | [TASK-8X-tests.md](TASK-8X-tests.md) | All TASK 8A-8N      |

### Quality & Migration Tasks (TASK 9 - 11)

| Task ID | Purpose           | Document                                                     | Dependencies          |
| ------- | ----------------- | ------------------------------------------------------------ | --------------------- |
| **9**   | Content Migration | [TASK-9-content-migration.md](TASK-9-content-migration.md)   | TASK 8X (Integration) |
| **10**  | QA Pipeline       | [TASK-10-qa-pipeline.md](TASK-10-qa-pipeline.md)             | TASK 9 (Migration)    |
| **10A** | Code Audit        | [TASK-10A-code-audit.md](TASK-10A-code-audit.md)             | TASK 10 (QA Pipeline) |
| **10B** | CSS Linting       | [TASK-10B-css-linting.md](TASK-10B-css-linting.md)           | TASK 10A (Audit)      |
| **11**  | Production Polish | [TASK-11-production-polish.md](TASK-11-production-polish.md) | TASK 10 (QA Pipeline) |

### Content Development

| Task ID        | Purpose               | Document                                                               | Dependencies         |
| -------------- | --------------------- | ---------------------------------------------------------------------- | -------------------- |
| **EXISTING-1** | Unit 1 Python Content | [TASK-EXISTING-1-python-content.md](TASK-EXISTING-1-python-content.md) | TASK 11 (Production) |

### Completed Tasks Archive

| Document                                 | Purpose              | Contents                                         |
| ---------------------------------------- | -------------------- | ------------------------------------------------ |
| [COMPLETED-TASKS.md](COMPLETED-TASKS.md) | Historical Reference | All tasks completed before TASK 8I (4,665 lines) |

---

## Document Structure

### Implementation Task Documents

Each implementation task document follows this structure:

```markdown
# TASK {ID}: {Component Name}

## Objective

Clear, one-sentence goal

## Dependencies

- Prerequisite tasks with file references
- Referenced by (tasks that depend on this one)

## Deliverables

- Component files
- Type definitions
- Configuration updates
- Documentation

## Implementation Details

[Original task specification]

## Validation Criteria

- Tier 1: `make check-wip` (5-15s)
- Tier 2: Unit tests
- Tier 3: Full validation
- Mobile-first testing (≤390px)
- TypeScript compliance
- Accessibility

## References

- @docs/SVELTE-COMPONENTS.md
- @docs/SVELTE-DEVELOPMENT.md
- @docs/TESTING.md
- Test specifications (TASK-{ID}-tests.md)
```

### Test Task Documents

Each test task document follows this structure:

```markdown
# TASK {ID}: {Component Name} - Test Development

## Objective

Comprehensive unit and E2E testing

## Dependencies

- Implementation task (must be complete)
- @docs/TESTING.md

## Test Deliverables

- Unit tests
- E2E tests
- Playwright snapshots
- Test coverage report

## Test Requirements

[Unit and E2E test specifications]

## Testing Patterns Reference

- Race condition prevention
- E2E flakiness prevention
- Test execution strategy

## Validation Criteria

- All tests passing
- 99%+ success rate (no flaky tests)
- Test coverage ≥90%
- Snapshots committed to git
```

---

## Execution Guidelines

### Task Execution Order

**Component Development (TASK 8I-8N):**

1. Execute implementation FIRST
2. Execute tests IMMEDIATELY after implementation completes
3. Validate mobile-first (≤390px) BEFORE desktop
4. Run three-tier validation before moving to next task

**Integration Checkpoint (TASK 8X):**

- CRITICAL: All TASK 8A-8N must be complete
- Verifies all components work together
- Creates scaffold verification page

**Quality Pipeline (TASK 9-11):**

- Execute sequentially (9 → 10 → 10A/10B → 11)
- Each task builds on previous quality work

### Validation Strategy

**Tier 1 (5-15s):** Quick validation of modified files

```bash
make check-wip
```

**Tier 2 (30-90s):** Unit tests

```bash
# Test individually during development
pnpm run test <file>

# Full suite before commit
pnpm run test
```

**Tier 3 (1-3m):** Full validation

```bash
pnpm run format && pnpm run lint && pnpm run check
```

**E2E Tests (1-3m):** Visual and integration tests

```bash
# Test individually during development
pnpm run test:e2e <file>

# Full suite before push
pnpm run test:e2e
```

### Mobile-First Mandate

**CRITICAL:** Test mobile (≤390px) BEFORE desktop for ALL component tasks.

This is non-negotiable and enforced in validation criteria.

---

## Task Dependencies Graph

```
TASK 8H (FlipCard - COMPLETED)
         ↓
TASK 8I (Quiz Navigation) → TASK 8I-tests
         ↓
TASK 8J (Popover) → TASK 8J-tests
         ↓
TASK 8K (Progress Tracking) → TASK 8K-tests
         ↓
TASK 8L (Navigation Coordinator) ← (8A, 8B, 8C, 8J) → TASK 8L-tests
         ↓
TASK 8M (Search) ← (8A, 8C, 8E, 8L) → TASK 8M-tests
         ↓
TASK 8N (Theme Switcher) → TASK 8N-tests
         ↓
TASK 8X (Integration) ← (All 8A-8N) → TASK 8X-tests
         ↓
TASK 9 (Content Migration)
         ↓
TASK 10 (QA Pipeline)
         ↓
TASK 10A (Code Audit) & TASK 10B (CSS Linting - deferred)
         ↓
TASK 11 (Production Polish)
         ↓
EXISTING-1 (Python Content Development)
```

---

## Document Statistics

| Category                     | Count | Total Size |
| ---------------------------- | ----- | ---------- |
| **Implementation Documents** | 13    | ~110 KB    |
| **Test Documents**           | 7     | ~30 KB     |
| **Archive Document**         | 1     | 168 KB     |
| **Index (this file)**        | 1     | ~8 KB      |
| **TOTAL**                    | 22    | ~316 KB    |

**Original Source:** PLAN-TODO-FEATURES.md (265 KB, 7,036 lines)
**Split Date:** 2025-01-08
**Tool:** `tmp/bash/split-plan-tasks.py`

---

## Testing Reference

All test tasks reference **[@docs/TESTING.md](../../docs/TESTING.md)** for:

- Test infrastructure and setup
- Race condition prevention
- E2E flakiness prevention patterns
- TestSetup pattern usage
- Validation strategies
- Common troubleshooting

### Key Testing Patterns

**Unit Tests (Vitest):**

- Use TestSetup for file isolation
- Use generateConfigId() for unique IDs
- Run individually during development
- Achieve ≥90% coverage for component logic

**E2E Tests (Playwright):**

- NO hard-coded `page.waitForTimeout()`
- Use helper functions from `src/test/e2e/helpers/wait-utilities.ts`
- Test mobile (≤390px) and desktop viewports
- Commit snapshots to git (`*.spec.ts-snapshots/`)
- 99%+ pass rate (no flaky tests)

---

## Cross-References

### Documentation

- **SvelteKit Guides:** [@docs/SVELTEKIT-INDEX.md](../../docs/SVELTEKIT-INDEX.md)
  - Architecture: [@docs/SVELTE-ARCHITECTURE.md](../../docs/SVELTE-ARCHITECTURE.md)
  - Components: [@docs/SVELTE-COMPONENTS.md](../../docs/SVELTE-COMPONENTS.md)
  - Development: [@docs/SVELTE-DEVELOPMENT.md](../../docs/SVELTE-DEVELOPMENT.md)
  - Styling: [@docs/SVELTE-STYLING.md](../../docs/SVELTE-STYLING.md)
  - Troubleshooting: [@docs/SVELTE-TROUBLESHOOTING-UX.md](../../docs/SVELTE-TROUBLESHOOTING-UX.md)
- **Testing Guide:** [@docs/TESTING.md](../../docs/TESTING.md)
- **Content Standards:** [@CONTENT-STANDARDS.md](../../CONTENT-STANDARDS.md)
- **Agent Rules:** [@CLAUDE.md](../../CLAUDE.md)

### Reference Components

**Location:** `src/lib/components/demo/`

**⚠️ CRITICAL:**

- DO NOT modify original reference files
- DO NOT import reference components into production code
- Study patterns, then implement production versions

---

## Notes

### Parallel Execution Capability

The task splitting enables:

- **Parallel development:** Different developers/sessions can work on different tasks
- **Test-driven development:** Tests can be developed before/after/parallel to implementation
- **Clear completion criteria:** Each task has explicit deliverables and validation
- **Easier progress tracking:** Granular task completion visibility

### Task Isolation

Each task document is self-contained with:

- Clear objectives
- Explicit dependencies
- Complete implementation specifications
- Validation criteria
- Cross-references to documentation

---

**Last Updated:** 2025-01-08
**Maintained By:** Project automation (split-plan-tasks.py)
