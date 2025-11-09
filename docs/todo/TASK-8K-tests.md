# TASK 8K: Progress Tracking - Test Development

## Objective

Comprehensive unit and E2E testing for progress tracking component to ensure quality, reliability, and regression protection.

## Dependencies

**Requires:**

- TASK-8K-progress-tracking.md (implementation must be complete)
- @docs/TESTING.md (testing guide and patterns)

## Test Deliverables

- [ ] Unit tests: `src/test/components/**/*.test.ts` or `src/test/stores/**/*.test.ts`
- [ ] E2E tests: `src/test/e2e/progress-tracking.spec.ts`
- [ ] Playwright snapshots (if visual component) - committed to git
- [ ] Test coverage report (≥90% for component logic)
- [ ] All tests passing with 99%+ success rate (no flaky tests)

---

## Test Requirements

### Testing Requirements

**Unit Tests (Vitest)**:

- ✅ Progress store state management (visitUnit, completeLesson, resetProgress)

- ✅ Derived stores reactivity (globalProgress, unitProgress auto-calculation)

- ✅ Learning streak calculation (same day visit, consecutive days, gap reset logic)

- ✅ Time tracking accuracy (fake timers for chapter duration, total time)

- ✅ Export/import functions (JSON serialization, data preservation for Sets/Maps/Dates)

- ✅ Edge cases and error conditions (invalid import data, localStorage quota, corrupted data)

- ✅ TypeScript interface compliance (ProgressState interface validation)

- ✅ localStorage persistence (save/load, migration, cleanup)

- ✅ Achievement system (milestone triggers, badge unlocking)

- ✅ Test coverage ≥95% for store logic

- ✅ Test file: `src/test/stores/progress.test.ts`

**End-to-End Tests (Playwright)**:

- ✅ User interaction flows (visit chapters, complete lessons, view dashboard, reset progress)

- ✅ Mobile viewport testing (≤390px) - dashboard cards responsive, touch-friendly buttons ≥44px

- ✅ Desktop viewport testing (≥1024px) - grid layout, hover states, export/import controls

- ✅ Progress persistence (reload page, verify progress retained from localStorage)

- ✅ Integration with Popover component (reset confirmation workflow)

- ✅ Integration with Navigation system (passive event notifications from 8L)

- ✅ Visual regression checks (progress bar animations, streak indicators, dashboard cards)

- ✅ Performance benchmarks (dashboard render < 200ms, store update < 50ms)

- ✅ Test file: `src/test/e2e/progress-dashboard.spec.ts`

---

## Testing Patterns Reference

**From @docs/TESTING.md:**

### Race Condition Prevention

- Use `generateConfigId()` for unique test identifiers
- Use `TestSetup` pattern for file isolation
- Never rely on files in `tmp/` persisting across runs

### E2E Flakiness Prevention

- NO hard-coded `page.waitForTimeout()` - use state-based waits
- Use `expect.poll()` for custom conditions
- Use `expect.toPass()` for retry logic
- Use helper functions from `src/test/e2e/helpers/wait-utilities.ts`:
  - `waitForScrollPosition()` - scroll with tolerance
  - `waitForStyleChange()` - CSS property changes
  - `waitForTransform()` - CSS transform values
  - `waitForAnimationComplete()` - transition completion
  - `retryClipboardOperation()` - clipboard with exponential backoff
  - `waitForElementActionable()` - visible + enabled + stable
  - `waitForFocusWithin()` - focus management

### Test Execution Strategy

- Test individually FIRST: `pnpm run test <file>` (2-5s)
- Then run full suite: `pnpm run test` (30-90s)
- E2E: `pnpm run test:e2e <file>` → `pnpm run test:e2e`

---

## Validation Criteria

- [ ] All unit tests pass: `pnpm run test src/test/...`
- [ ] All E2E tests pass: `pnpm run test:e2e src/test/e2e/progress-tracking.spec.ts`
- [ ] Test coverage ≥90% for component logic
- [ ] No flaky tests (99%+ pass rate across 10 runs)
- [ ] Snapshots committed to git (if applicable): `src/test/e2e/*.spec.ts-snapshots/`
- [ ] Mobile testing (≤390px) included in E2E tests
- [ ] Accessibility testing (keyboard nav, ARIA) included

## References

- **Testing Guide:** @docs/TESTING.md
- **Implementation:** TASK-8K-progress-tracking.md
- **E2E Patterns:** @docs/TESTING.md#e2e-testing
- **Flakiness Prevention:** @docs/TESTING.md#e2e-flakiness-prevention
- **Unit Test Patterns:** @docs/TESTING.md#unit-testing

---

**Last Updated:** 2025-01-08
**Status:** Ready for test development (requires implementation completion)
