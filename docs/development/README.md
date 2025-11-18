# Development Guide

**Modern development practices, patterns, dependency management, and quality standards for the Cloud-Native Learning Platform.**

> **📚 This guide has been segmented for better navigation and agent consumption. Each section is optimized for specific development aspects.**

---

## Quick Navigation

| Document                                                   | Target Audience                  | Description                                         | Lines |
| ---------------------------------------------------------- | -------------------------------- | --------------------------------------------------- | ----- |
| **[standards.md](./standards.md)**                         | All developers                   | Development standards, code quality, security       | ~150  |
| **[configuration.md](./configuration.md)**                 | All developers                   | Settings management, CRITICAL no-hardcoding rule    | ~200  |
| **[prettier-integration.md](./prettier-integration.md)**   | ts-refactor-master, developers   | Central formatting utility, writeFormattedFile      | ~100  |
| **[dependency-evaluation.md](./dependency-evaluation.md)** | dependency-evaluator, architects | MANDATORY npm package vetting process               | ~300  |
| **[patterns.md](./patterns.md)**                           | All developers                   | Type safety, service architecture, error prevention | ~150  |
| **[hooks-strategy.md](./hooks-strategy.md)**               | All developers, hook creators    | Hooks architecture: skills vs commands              | ~340  |

---

## Overview

This guide documents established modern development patterns used throughout the project. These patterns ensure consistency, performance, and maintainability across all scripts and components.

### Core Principles

1. **Zero Hardcoded Values**: All configuration in `src/config/settings.ts`
2. **Type Safety First**: Centralized types from `$types` alias
3. **Test Isolation**: TestSetup patterns, generateConfigId()
4. **Dependency Vetting**: Research before installing ANY npm package
5. **Prettier Everywhere**: Use `writeFormattedFile()` utility

---

## Getting Started

### For New Developers

1. **Start here:** [standards.md](./standards.md) - Understand development rules and quality standards
2. **Configuration:** [configuration.md](./configuration.md) - Learn CRITICAL no-hardcoding rule
3. **Patterns:** [patterns.md](./patterns.md) - Type safety, imports, service architecture
4. **Dependencies:** [dependency-evaluation.md](./dependency-evaluation.md) - MANDATORY vetting before installing

### For Specific Tasks

| Task                        | Document                                                         |
| --------------------------- | ---------------------------------------------------------------- |
| Code quality requirements   | [standards.md](./standards.md#code-quality-standards)            |
| Adding configuration values | [configuration.md](./configuration.md)                           |
| Formatting code output      | [prettier-integration.md](./prettier-integration.md)             |
| Installing npm packages     | [dependency-evaluation.md](./dependency-evaluation.md)           |
| Type imports                | [patterns.md](./patterns.md#type-safety--import-patterns)        |
| Service architecture        | [patterns.md](./patterns.md#service-layer-architecture-patterns) |
| Understanding hooks         | [hooks-strategy.md](./hooks-strategy.md)                         |
| Creating new hooks          | [hooks-strategy.md](./hooks-strategy.md#creating-new-hooks)      |

---

## Key Workflows

### Three-Tiered Validation Strategy

Performance-optimized approach for efficient development workflow:

- **Tier 1 (Fast WIP Check ~5-15s):** `make check-wip` - validates only modified/untracked files
- **Tier 2 (Quality Checks ~30-90s):** `make validate-quality` - theme + unit tests
- **Tier 3 (Comprehensive ~1-3m):** `pnpm run format` + `pnpm run lint` + `pnpm run check`

**See**: [Testing Guide - Validation Strategy](../testing/validation-strategy.md)

### Adding New Configuration

```typescript
// src/config/settings.ts
export const SETTINGS: AppSettings = {
	ui: {
		// UI component configurations
	},
	scripts: {
		// Script and tooling configurations
	},
	api: {
		// 🆕 New category
		baseUrl: "https://api.example.com",
		timeout: 5000
	}
};
```

**See**: [configuration.md - Creating New Categories](./configuration.md#creating-new-configuration-categories)

### Installing Dependencies

**MANDATORY process before installing ANY npm package:**

1. Check native framework solutions FIRST
2. Verify version compatibility (Zod v4, Svelte 5, etc.)
3. Check community support (downloads, last update)
4. Compare alternatives via WebSearch
5. Document decision in commit/PR

**See**: [dependency-evaluation.md](./dependency-evaluation.md)

---

## Related Documentation

- **[Testing Guide](../testing/README.md)** - Testing strategies and patterns
- **[SvelteKit Guides](../guides/SVELTEKIT-INDEX.md)** - Architecture, components, styling
- **[Standards](../standards/)** - Content and component standards
- **[Agent Specs](../agents/)** - Agent-specific guidelines

---

**Last Updated**: 2025-01-17
