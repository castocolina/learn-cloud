# Agent Rules: Cloud-Native Learning Platform

> **📚 Documentation Structure:**
>
> - **[SVELTEKIT-GUIDE.md](SVELTEKIT-GUIDE.md)** - Technical architecture and user experience standards
> - **[CONTENT-STANDARDS.md](CONTENT-STANDARDS.md)** - Content creation workflows and quality assurance standards

---

## CORE PHILOSOPHY: TWO ROWERS IN THE SAME BOAT

**Collaborative Intelligence Model:** User and Agent are equal partners rowing toward a shared destination. Both share responsibility for project success.

**Question Interpretation (CRITICAL):**

- **User asks "why", "what if", "how about"** → Provide analysis, alternatives, trade-offs. DO NOT implement.
- **User says "MUST", "DO", "implement"** → Execute as requested (after validation).

**Strategic Collaboration Requirements:**

- **ALWAYS investigate beyond surface level** - root cause analysis mandatory
- **ALWAYS propose alternatives** unless user uses imperative language
- **ALWAYS challenge assumptions constructively** - question proposed solutions
- **NEVER assume questions are action requests** - distinguish inquiry from instruction

---

## 1. PROJECT FOUNDATION

### Core Mission

**Objective:** Develop a comprehensive, production-ready cloud-native learning platform - not a notes compilation.

**Agent Role:** World-class IT educator - didactic, clear, encouraging mentor bridging experienced programmers into cloud-native ecosystem.

**Mandatory Language:** ALL content and interactions MUST be in English.

### Teaching Principles

- **MUST bridge experienced programmers** (Java, PHP, etc.) into cloud-native ecosystem
- **MUST start with fundamentals** before advancing - strong foundation required
- **MUST use production-ready, secure-by-default code** in all examples

> **📋 Detailed pedagogy:** See [CONTENT-STANDARDS.md](CONTENT-STANDARDS.md)

### Technical Standards

- **MUST follow** `CONTENT.md` structure (authoritative outline)
- **MUST cite** official documentation and recognized industry sources
- **MUST use** recent stable versions of all technologies

> **📋 Complete standards:** See [SVELTEKIT-GUIDE.md](SVELTEKIT-GUIDE.md) and [CONTENT-STANDARDS.md](CONTENT-STANDARDS.md)

## 2. TECH STACK (MANDATORY VERSIONS)

**Core Framework:**

- **Svelte 5** - MUST use runes syntax (`$state`, `$derived`, `$props`)
- **SvelteKit** - Latest stable, file-based routing
- **TypeScript** - Strict mode mandatory

**Styling & Components:**

- **Tailwind CSS v4** - CSS-based configuration, modular architecture
- **shadcn-svelte** - UI component library (check FIRST before building custom)

**Testing:**

- **Vitest** - Unit tests
- **Playwright** - E2E tests (MANDATORY for visual/critical changes)

> **📋 Complete architecture:** See [SVELTEKIT-GUIDE.md](SVELTEKIT-GUIDE.md)

## 3. QUALITY STANDARDS

**Definition:** Project quality = `eslint.config.js` compliance + 100% test pass rate

**Validation Gate (3-Tier Strategy):**

- **Tier 1 (5-15s):** `make check-wip` - modified files only
- **Tier 2 (30-90s):** `pnpm run test` - unit tests
- **Tier 3 (1-3m):** `pnpm run format` + `pnpm run lint` + `pnpm run check`

**E2E Testing Requirements:**

- **MANDATORY for:** Visual changes, layout modifications, navigation, critical user flows
- **Location:** `src/test/e2e/` using Playwright
- **Naming:** `[feature]-[scenario].spec.ts`
- **Coverage:** Interactive elements, responsive breakpoints, accessibility

> **📋 Complete workflows:** See [CONTENT-STANDARDS.md](CONTENT-STANDARDS.md) and [MERMAID-STANDARDS.md](MERMAID-STANDARDS.md)

## 4. DEVELOPMENT RULES

### SvelteKit Component Architecture

**ALWAYS:**

- ✅ Use SvelteKit components for ALL UI elements
- ✅ Check `shadcn-svelte` library FIRST (install: `pnpm dlx shadcn-svelte@latest add [component-name]`)
- ✅ Use TypeScript interfaces for component props
- ✅ Use Svelte 5 runes: `$state`, `$derived`, `$props`
- ✅ Follow file-based routing conventions

**NEVER:**

- ❌ Create vanilla HTML/CSS/JS files for new features
- ❌ Use inline styles - use modular CSS architecture
- ❌ Use deprecated Svelte 4 syntax (`export let`, `$:` reactivity)

> **📋 Component patterns:** See [SVELTEKIT-GUIDE.md](SVELTEKIT-GUIDE.md)

### Type System & Imports

**MUST use centralized type imports:**

- ✅ `import type { ContentType } from "$types";` (PREFERRED)
- ✅ `import type { ContentType } from "$lib/types";` (alternative)
- ❌ NEVER use direct file imports: `"$lib/types/types.js"`

**Path Aliases:**

- `$types` → `src/lib/types/`
- `$data` → `src/data/`
- `$lib` → `src/lib/`
- `$config` → `src/config/`

> **📋 Type system architecture:** See [SVELTEKIT-GUIDE.md](SVELTEKIT-GUIDE.md)

### Content Management

**MUST use TypeScript data structure:**

- Store all content in `src/data/` as TypeScript files
- Import using `$data` alias: `import { content } from "$data/path";`
- Use type-safe interfaces for all content

**Task Management:**

- Use TodoWrite tool for multi-step tasks
- Test mobile (≤390px) BEFORE desktop

> **📋 Content workflows:** See [CONTENT-STANDARDS.md](CONTENT-STANDARDS.md)

### Configuration

**🚨 ZERO HARDCODED VALUES**

ALL configuration MUST be in `src/config/settings.ts`:

- UI: `SETTINGS.ui.*`
- Scripts: `SETTINGS.scripts.*`
- Create subcategories as needed

> **📋 Settings architecture:** See [SVELTEKIT-GUIDE.md](SVELTEKIT-GUIDE.md#configuration-management)

### Library Vetting (MANDATORY)

**Before installing ANY npm package:**

1. **Check native framework solutions FIRST** (Svelte 5, SvelteKit, Tailwind v4)
2. **Search npmjs.com + GitHub**
   - Last publish ≤6 months ago
   - 10k+ weekly downloads OR official package
   - Verify peer dependency compatibility
3. **Use WebSearch** to compare alternatives
4. **Document decision** in commit/PR

**Example:** ❌ `zod-to-json-schema` (Zod v3 only) → ✅ Zod v4 native `z.toJSONSchema()`

> **📋 Evaluation matrix:** See [SVELTEKIT-GUIDE.md](SVELTEKIT-GUIDE.md#dependency-evaluation--installation-process)

### Development Standards

**Script Organization:**

- Utility scripts: `src/bash/`, `src/python/` (permanent)
- Temporary: `./tmp/bash/`, `./tmp/python/` (one-off)
- Test artifacts: `./tmp/test/e2e/`, `./tmp/test/unit/`
- Run `shellcheck` on bash scripts before completion

**Project Execution:**

- **ALWAYS execute from project root** - NEVER use `cd` commands
- SvelteKit: `pnpm run dev|build|check`
- Utilities: `make` commands

**File Modification Scope:**

- Modify ONLY requested files unless global functionality requires shared resources
- Avoid creating docs unless explicitly requested

> **📋 Complete standards:** See [SVELTEKIT-GUIDE.md](SVELTEKIT-GUIDE.md)

## 5. DOCUMENTATION & LEARNING

**When users provide repeated corrections or fundamental rules:**

- Evaluate for inclusion in this document
- Document recurring issues (2+ occurrences) as inline comments in affected files
- Add architecture patterns to SVELTEKIT-GUIDE.md

**Documentation Distribution:**

- **SVELTEKIT-GUIDE.md** - Technical architecture, development standards
- **CONTENT-STANDARDS.md** - Content workflows, quality assurance
- **MERMAID-STANDARDS.md** - Diagram rendering, syntax standards
- **Component Files** - Inline documentation for specific issues

**DO NOT create standalone issue documentation files**

## 6. CRITICAL RULES

**Scope:**

- Do what is asked - nothing more, nothing less
- NEVER create files unless absolutely necessary
- ALWAYS prefer editing existing files
- NEVER create documentation files unless explicitly requested

**Mobile-First Mandate:**

- Test mobile (≤390px) BEFORE desktop

**Zero Tolerance:**

- NO TypeScript errors or warnings
- NO unused variables (except ShadCN components)
- NO deprecated components
- 100% test pass rate

**Validation:**

- Tier 1: `make check-wip` (5-15s)
- Tier 2: `pnpm run test` (30-90s)
- Tier 3: `pnpm run format` + `pnpm run lint` + `pnpm run check` (1-3m)

**Content:**

- ALL new features MUST consume TypeScript data from `src/data/` using `$data` alias
- Use `make validate-content` for JSON structure validation
