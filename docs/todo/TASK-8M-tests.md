# TASK 8M: Search - Test Development

## Objective

Comprehensive unit and E2E testing for search component to ensure quality, reliability, and regression protection.

## Dependencies

**Requires:**

- TASK-8M-search.md (implementation must be complete)
- @docs/TESTING.md (testing guide and patterns)

## Test Deliverables

- [ ] Unit tests: `src/test/components/**/*.test.ts` or `src/test/stores/**/*.test.ts`
- [ ] E2E tests: `src/test/e2e/search.spec.ts`
- [ ] Playwright snapshots (if visual component) - committed to git
- [ ] Test coverage report (≥90% for component logic)
- [ ] All tests passing with 99%+ success rate (no flaky tests)

---

## Test Requirements

### Testing Requirements

**Unit Tests (Vitest)**:

- ✅ SearchBox component rendering (input field, search icon, clear button)

- ✅ State management and reactivity (Svelte 5 runes: $state, $derived, $props)

- ✅ Pre-built Lunr.js index loading (lunr.Index.load from search-index.ts)

- ✅ Search query execution (index.search, result scoring, relevance ranking)

- ✅ Debounced input handling (search trigger delay, performance optimization)

- ✅ Result enrichment (metadata mapping, content type grouping)

- ✅ Event handlers and callbacks (search trigger, result click, keyboard shortcuts)

- ✅ Edge cases and error conditions (empty query, no results, malformed index, special characters)

- ✅ TypeScript interface compliance (SearchResult, SearchIndexItem interface validation)

- ✅ Accessibility attributes (ARIA labels, search role, combobox semantics)

- ✅ Integration with Dialog component (openDialog/closeDialog coordination)

- ✅ Integration with Navigation system (navigateToContent on result click)

- ✅ Test coverage ≥90% for search logic

- ✅ Test file: `src/test/components/search/Search.test.ts`

**End-to-End Tests (Playwright)**:

- ✅ User interaction flows (type query, view results, click result, navigate to content)

- ✅ Mobile viewport testing (≤390px) - full-screen modal, touch interactions, virtual keyboard handling

- ✅ Desktop viewport testing (≥1024px) - keyboard shortcuts (Ctrl/Cmd+K), hover states, result previews

- ✅ Keyboard navigation (Tab through results, Enter to select, Escape to close, Arrow keys for navigation)

- ✅ Focus management and tab order (focus search input on open, trap within modal, return on close)

- ✅ Integration with unified navigation (atomic updates: Dialog close + Sidebar highlight + Breadcrumb update + Content load + URL hash + Progress tracking)

- ✅ Visual regression checks (result highlighting, grouped content types, loading states)

- ✅ Performance benchmarks (search latency < 100ms for 129 items, debounce delay 300ms, result render < 200ms)

- ✅ Test file: `src/test/e2e/search.spec.ts`

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
- [ ] All E2E tests pass: `pnpm run test:e2e src/test/e2e/search.spec.ts`
- [ ] Test coverage ≥90% for component logic
- [ ] No flaky tests (99%+ pass rate across 10 runs)
- [ ] Snapshots committed to git (if applicable): `src/test/e2e/*.spec.ts-snapshots/`
- [ ] Mobile testing (≤390px) included in E2E tests
- [ ] Accessibility testing (keyboard nav, ARIA) included

## References

- **Testing Guide:** @docs/TESTING.md
- **Implementation:** TASK-8M-search.md
- **E2E Patterns:** @docs/TESTING.md#e2e-testing
- **Flakiness Prevention:** @docs/TESTING.md#e2e-flakiness-prevention
- **Unit Test Patterns:** @docs/TESTING.md#unit-testing

---

**Last Updated:** 2025-01-08
**Status:** Ready for test development (requires implementation completion)
