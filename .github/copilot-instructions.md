# GitHub Copilot Instructions

> **📚 Complete Documentation:** All project rules, coding standards, and implementation guidelines are maintained in [CLAUDE.md](../CLAUDE.md)

This file provides GitHub Copilot with project-specific instructions while referencing the complete documentation.

## Core Philosophy

**Two Rowers in the Same Boat:** User and Copilot are equal partners rowing toward a shared destination. Distinguish between inquiry (questions) and instructions (imperatives). See [CLAUDE.md](../CLAUDE.md) for complete collaborative intelligence model.

## Quick Reference for Copilot

For all project rules, technical specifications, and coding standards, refer to **[CLAUDE.md](../CLAUDE.md)**.

## Tech Stack (Mandatory Versions)

- **Svelte 5** - MUST use runes syntax (`$state`, `$derived`, `$props`)
- **SvelteKit** - Latest stable, file-based routing
- **TypeScript** - Strict mode mandatory
- **Tailwind CSS v4** - CSS-based configuration, modular architecture
- **shadcn-svelte** - Check FIRST before building custom components
- **Vitest** - Unit tests
- **Playwright** - E2E tests (MANDATORY for visual/critical changes)

## Quality Standards

**Definition:** Project quality = `eslint.config.js` compliance + 100% test pass rate

**Validation (3-Tier Strategy):**

- **Tier 1 (5-15s):** `make check-wip` - modified files only
- **Tier 2 (30-90s):** `pnpm run test` - unit tests
- **Tier 3 (1-3m):** `pnpm run format` + `pnpm run lint` + `pnpm run check`

**E2E Testing:** MANDATORY for visual changes, layout modifications, navigation, critical flows

## Key Standards

- **Mobile-First**: Test mobile (≤390px) BEFORE desktop
- **TypeScript**: Use interfaces for all component props, centralized imports from `$types`
- **Data-Driven**: Consume TypeScript data from `$data/` (alias for `src/data/`)
- **Zero Hardcoded Values**: All config in `src/config/settings.ts`
- **Library Vetting**: Check native framework solutions FIRST, verify activity (≤6 months), 10k+ weekly downloads
- **English Only**: All interactions and content MUST be in English

## Project Structure

- `/src/lib/`: Reusable SvelteKit components
- `/src/routes/`: File-based routing structure
- `$data/`: TypeScript/JSON data sources (alias for `/src/data/`)
- `/src/app.css`: Centralized Tailwind CSS architecture

**⚠️ Important:** This file serves as a quick reference. Always consult [CLAUDE.md](../CLAUDE.md) for complete and authoritative project guidelines.
