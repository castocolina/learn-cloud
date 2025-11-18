# Dependency Evaluation & Installation Process

**MANDATORY research and vetting process before installing any npm package or external library for the Cloud-Native Learning Platform.**

> **📚 Part of [Development Guide](./README.md)**

---

## 🚨 MANDATORY: Research Before Installing Dependencies

Before installing any npm package or external library, agents **MUST** perform due diligence research to avoid compatibility issues and technical debt.

### Why This Matters

- **Compatibility Issues**: Outdated packages may not support current framework versions
- **Security Vulnerabilities**: Unmaintained packages may have known security issues
- **Bundle Size**: Unnecessary dependencies bloat the application
- **Technical Debt**: Poor library choices create maintenance burden
- **Native Solutions**: Framework often provides built-in functionality

---

## Step-by-Step Evaluation Process

### 1. Native Solutions First (Critical Priority)

**ALWAYS check if the framework provides native functionality FIRST.**

- Built-in solutions guarantee compatibility and better long-term maintenance
- Zero additional bundle size
- Official documentation and support
- Framework version compatibility guaranteed

**Examples:**

```typescript
// ❌ WRONG: Installing external library
pnpm add zod-to-json-schema

// ✅ CORRECT: Using native Zod v4 functionality
import { z } from "zod";
const jsonSchema = z.object({ name: z.string() }).toJSONSchema();
```

**Research Steps:**

1. Check framework documentation (Svelte 5, SvelteKit, Zod, etc.)
2. Search official APIs for native solutions
3. Review recent version release notes for new features
4. Only proceed to external packages if native solution doesn't exist

---

### 2. Version Compatibility Research

Verify compatibility with current project dependencies:

```bash
# Check current project dependencies
cat package.json | grep "dependency-name"

# Research latest stable version
npm info package-name version
npm info package-name versions --json | tail -10

# Check peer dependencies for compatibility
npm info package-name peerDependencies
```

**Critical Checks:**

- **Zod**: Library must support Zod v4.x (not just v3.x)
- **Svelte**: Must support Svelte 5 runes syntax
- **SvelteKit**: Compatible with latest SvelteKit version
- **Tailwind**: Compatible with Tailwind v4 CSS-based config
- **Node.js**: Verify compatibility with project's Node version

**Example Analysis:**

```bash
# Check zod-to-json-schema compatibility
npm info zod-to-json-schema peerDependencies
# Output: { "zod": "^3.24.1" }
# ❌ INCOMPATIBLE: Our project uses Zod v4.1.11

# ✅ SOLUTION: Use native Zod v4 z.toJSONSchema()
```

---

### 3. Community Support & Maintenance

Evaluate package health and community support:

**Minimum Requirements:**

- **Weekly Downloads**: 10k+ weekly downloads (verify on npmjs.com)
  - **Exception**: Official packages (e.g., @sveltejs/\*, @anthropic/\*)
- **Last Published**: Updated within last 6 months
- **GitHub Activity**: Active issues/PRs, responsive maintainers
- **TypeScript Support**: Native TypeScript or high-quality @types package

**Research Commands:**

```bash
# Check package stats
npm info package-name

# Check GitHub activity
# Visit: https://github.com/[owner]/[repo]/pulse

# Check issues and PRs
# Visit: https://github.com/[owner]/[repo]/issues
```

---

### 4. Alternative Research

Use WebSearch to compare alternatives and find best-in-class solutions:

```bash
# Use WebSearch to find alternatives
WebSearch: "alternative to [package-name] 2025 typescript"
WebSearch: "[technology] best libraries 2025"
WebSearch: "[package-name] vs [alternative] comparison"
```

**Evaluation Questions:**

- What alternatives exist for this functionality?
- Which library has better community support?
- Which has better TypeScript support?
- Which is more actively maintained?
- Which has better documentation?

---

## Decision Matrix

| Criterion                    | Weight       | Minimum Threshold                 | Notes                           |
| ---------------------------- | ------------ | --------------------------------- | ------------------------------- |
| Native Alternative Available | **BLOCKER**  | Use native if exists              | External library not needed     |
| Version Compatibility        | **Critical** | Must match project major versions | Breaking changes cause failures |
| Weekly Downloads             | High         | 10k+ weekly                       | Indicates active usage          |
| Last Update                  | High         | Within 6 months                   | Maintained project              |
| TypeScript Support           | High         | Native or @types                  | Type safety required            |
| Framework Support            | **Critical** | Explicit compatibility            | Must work with our stack        |
| Security                     | **Critical** | No known vulnerabilities          | Run `npm audit`                 |

### Weight Definitions

- **BLOCKER**: Must meet requirement, no exceptions
- **Critical**: Must meet requirement unless exceptional circumstances
- **High**: Strongly prefer meeting requirement, justify if not met

---

## Real-World Example: Zod to JSON Schema

### ❌ INCORRECT EVALUATION

**Package**: `zod-to-json-schema`

**Investigation revealed:**

```bash
npm info zod-to-json-schema peerDependencies
# { "zod": "^3.24.1" }

# Our project: "zod": "^4.1.11"
# ❌ INCOMPATIBLE: Peer dependency mismatch
```

**Consequences:**

- Broken conversion functionality
- Oversimplified schemas losing validation constraints
- Wasted development time debugging compatibility issues
- Additional dependency in package.json
- Increased bundle size

### ✅ CORRECT EVALUATION

**Native Solution**: Zod v4 built-in `z.toJSONSchema()`

**Research found:**

```typescript
// Zod v4 native functionality (no external dependency needed)
import { z } from "zod";

const schema = z.object({
	name: z.string(),
	age: z.number().min(0)
});

const jsonSchema = schema.toJSONSchema();
// Full compatibility guaranteed (same library)
```

**Benefits:**

- Built-in to Zod v4 (no external dependency)
- Full compatibility guaranteed (same library)
- Better maintenance (maintained by Zod team)
- Comprehensive documentation in Zod docs
- Zero additional bundle size
- Native support for all Zod features

---

## Documentation Requirements

When adding a dependency, document the evaluation in commit message or PR:

```markdown
## Dependency Addition: [package-name]

**Evaluation Summary:**

- Native alternative: [Yes/No - explain why not used]
- Version compatibility: [Verified against package.json]
- Community support: [X downloads/week, last update YYYY-MM-DD]
- Alternatives considered: [list with reasons for rejection]
- Framework compatibility: [SvelteKit/Svelte 5/etc verified]

**Decision Rationale:**
[Why this package was chosen over alternatives]

**Examples:**

- If native: "Zod v4 provides native z.toJSONSchema() - no external dependency needed"
- If external: "Compared @tanstack/svelte-query vs swr-svelte. Chose TanStack Query for better TypeScript support (weekly: 2.5M, last update: 2025-01-10)"
```

---

## Anti-Patterns to Avoid

### ❌ Installing Without Research

```bash
# ❌ WRONG: Installing without research
pnpm add some-library
# (Later discovers incompatibility, wasted time debugging)
```

### ❌ Ignoring Version Compatibility

```bash
# ❌ WRONG: Installing despite peer dependency warnings
pnpm add package@latest --force
# (Creates runtime errors and breaking changes)
```

### ❌ Choosing Based on Name Alone

```bash
# ❌ WRONG: "This looks like what I need"
pnpm add first-google-result
# (May be outdated, unmaintained, or inferior to alternatives)
```

---

## ✅ Correct Process

```bash
# 1. Check framework native solutions
# Read Zod docs, SvelteKit docs, etc.

# 2. If external package needed, research compatibility
npm info package-name peerDependencies
npm info package-name version

# 3. Compare alternatives via WebSearch
WebSearch: "best [functionality] library for svelte 2025"

# 4. Verify community support
# Check npmjs.com downloads, GitHub activity, last update

# 5. Document decision
# Add evaluation summary to commit message

# 6. Install with verification
pnpm add verified-library
pnpm run check  # Verify no type errors
pnpm run lint   # Verify no linting issues
```

---

## Evaluation Checklist

### Before Installing ANY Package

- [ ] Checked native framework solutions (Svelte 5, SvelteKit, Zod v4, etc.)
- [ ] Verified version compatibility with package.json dependencies
- [ ] Checked peer dependencies for conflicts
- [ ] Verified 10k+ weekly downloads OR official package
- [ ] Confirmed last update within 6 months
- [ ] Reviewed GitHub activity (issues, PRs, maintainer responsiveness)
- [ ] Compared alternatives via WebSearch
- [ ] Verified TypeScript support (native or @types)
- [ ] Ran `npm audit` for security vulnerabilities
- [ ] Documented decision rationale

### After Installing Package

- [ ] Added evaluation summary to commit message
- [ ] Ran `pnpm run check` to verify no type errors
- [ ] Ran `pnpm run lint` to verify no linting issues
- [ ] Ran `pnpm run test` to verify no test failures
- [ ] Updated documentation if needed

---

## Related Documentation

- **[Standards](./standards.md)** - Code quality and development standards
- **[Configuration](./configuration.md)** - Settings management patterns
- **[Patterns](./patterns.md)** - Integration guidelines and consistent patterns
- **[SVELTE-DEVELOPMENT.md](../SVELTE-DEVELOPMENT.md)** - Library vetting section

---

**Last Updated**: 2025-01-17
