# CI/CD Considerations

**Clean environment requirements, server management, and snapshot handling for CI/CD pipelines.**

> **📚 Part of [Testing Guide](./README.md)** - See also: [e2e-testing.md](./e2e-testing.md), [validation-strategy.md](./validation-strategy.md)

---

## Clean Environment Requirements

**CI/CD runs tests in fresh clones without pre-existing state**. Your tests must:

1. **Never rely on files in `tmp/`** - they don't exist in fresh clones
2. **Create all needed test data** - don't assume anything exists
3. **Use TestSetup for isolation** - prevents cross-test contamination
4. **Be idempotent** - running twice produces same results

---

## Server Management

**Playwright automatically starts the dev server**:

```typescript
// playwright.config.ts
webServer: {
  command: "pnpm run dev",
  url: "http://localhost:5173",
  reuseExistingServer: !process.env.CI, // Fresh server in CI
  timeout: 120 * 1000 // 2 minutes to start
}
```

**In CI**:

- Server starts fresh for every test run
- Port 5173 is assumed available
- If port is busy, tests fail with `ERR_CONNECTION_REFUSED`

**Solution**: Always use `page.goto()` with relative URLs, never hardcode ports.

---

## Snapshot Management

**Playwright snapshots must be committed to git**:

```bash
# Snapshots location
src/test/e2e/{test}.spec.ts-snapshots/*.png

# Check status
git status src/test/e2e/

# Commit new/updated snapshots
git add src/test/e2e/**/*-snapshots/
git commit -m "test: update visual snapshots for dialog component"
```

### When snapshots change:

1. Review the diff carefully (visual changes)
2. If intentional: commit the updated snapshots
3. If unintentional: investigate and fix the code

### Updating snapshots:

```bash
# Update all snapshots
pnpm run test:e2e --update-snapshots

# Update snapshots for specific test
pnpm run test:e2e src/test/e2e/dialog.spec.ts --update-snapshots

# Review changes
git diff src/test/e2e/
```

---

## Common CI/CD Issues

### Issue 1: Tests Pass Locally but Fail in CI

**Symptom**: All tests pass on your machine but fail in GitHub Actions.

**Common Causes**:

1. **Missing snapshots in git**: Commit all files in `*.spec.ts-snapshots/` directories
2. **Hardcoded paths**: Using absolute paths that don't exist in CI
3. **Environment differences**: Different screen sizes, fonts, or rendering
4. **Timing issues**: CI may be slower - increase timeouts for legitimate slow operations

**Solution**:

```bash
# Check for uncommitted snapshots
git status src/test/e2e/

# Commit them if missing
git add src/test/e2e/**/*-snapshots/
git commit -m "test: add missing E2E snapshots"
```

### Issue 2: Port Conflict in CI

**Symptom**: `page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173`

**Cause**: Dev server not started or port conflict.

**Solutions**:

1. Ensure `playwright.config.ts` has `webServer` configured
2. Use relative URLs: `page.goto("/")` not `page.goto("http://localhost:5173/")`
3. Check CI logs for server startup errors

### Issue 3: Flaky Tests in CI

**Symptom**: Tests pass locally but fail intermittently in CI.

**Causes**:

1. **Hard-coded timeouts** - CI is slower, needs longer waits
2. **Race conditions** - Parallel tests interfering with each other
3. **Network delays** - Slower network in CI environment

**Solutions**:

1. Replace `page.waitForTimeout()` with state-based waits (see [e2e-testing.md](./e2e-testing.md#e2e-flakiness-prevention))
2. Use `generateConfigId()` for unique test identifiers (see [unit-testing.md](./unit-testing.md#race-condition-prevention))
3. Increase timeouts for legitimate slow operations (e.g., Shiki initialization)

### Issue 4: Visual Snapshot Differences

**Symptom**: `expect(page).toHaveScreenshot()` fails with pixel differences in CI.

**Causes**:

1. **Font rendering differences** - CI uses different fonts
2. **Browser version mismatch** - Different Chromium version
3. **Screen resolution differences** - CI uses different viewport

**Solutions**:

1. **Configure threshold**:

   ```typescript
   await expect(page).toHaveScreenshot("screenshot.png", {
   	maxDiffPixels: 100 // Allow small differences
   });
   ```

2. **Update snapshots in CI environment**:

   ```bash
   # Run CI with update flag
   pnpm run test:e2e --update-snapshots
   # Commit updated snapshots
   ```

3. **Use consistent browser versions**:
   ```typescript
   // playwright.config.ts
   use: {
     channel: 'chromium', // Use specific channel
   }
   ```

---

## Best Practices for CI/CD

### ✅ DO

1. **Commit all snapshots to git**
2. **Use relative URLs in tests**
3. **Use state-based waits, not timeouts**
4. **Test in CI environment before merging**
5. **Keep test artifacts organized** (snapshots in proper directories)

### ❌ AVOID

1. **Relying on files in `tmp/`** - won't exist in CI
2. **Hardcoding absolute paths** - different in CI
3. **Using `page.waitForTimeout()`** - unreliable in CI
4. **Ignoring snapshot changes** - review carefully before committing
5. **Assuming fast execution** - CI is slower than local

---

## CI/CD Checklist

Before pushing to CI:

- [ ] All snapshots committed: `git status src/test/e2e/`
- [ ] Tests use relative URLs: `page.goto("/path")`
- [ ] No hardcoded paths in tests
- [ ] No `page.waitForTimeout()` (use state-based waits)
- [ ] Tests pass locally: `pnpm run test && pnpm run test:e2e`
- [ ] All validation tiers pass: `make check-wip && pnpm run lint && pnpm run check`

---

## Related Documentation

- **[E2E Testing](./e2e-testing.md)** - Playwright configuration, flakiness prevention
- **[Unit Testing](./unit-testing.md)** - TestSetup patterns for isolation
- **[Validation Strategy](./validation-strategy.md)** - 3-tier validation workflow
- **[Troubleshooting](./troubleshooting.md)** - Common CI/CD issues

---

**Last Updated**: 2025-01-17
