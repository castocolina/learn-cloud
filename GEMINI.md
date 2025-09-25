# Gemini Agent Rules

> **📚 Complete Documentation:** All agent rules and implementation guidelines are maintained in [CLAUDE.md](CLAUDE.md)

This file serves as a clear entry point for Gemini-based agents while avoiding documentation duplication.

## Quick Reference

For complete agent implementation guidelines, project rules, and technical specifications, please refer to **[CLAUDE.md](CLAUDE.md)**.

## Platform-Specific Notes for Gemini

- All conversational interactions **must be in English**
- All core rules apply as specified in CLAUDE.md
- Follow the same architectural patterns and quality standards
- **Three-Tiered Validation Strategy**: Performance-optimized approach for efficient development:
  - **Tier 1 (~5-15s)**: `make check-wip` for modified/untracked files only
  - **Tier 2 (~30-45s)**: `pnpm run format` + `pnpm run lint` for complete project code quality
  - **Tier 3 (~1-3m)**: `pnpm run test` + `pnpm run check` for comprehensive testing and TypeScript validation

## Structure Overview

The main documentation in CLAUDE.md includes:

- Project foundation and core mission
- Technical architecture and SvelteKit rules
- Content creation workflows and quality assurance
- Agent implementation guidelines
- Mermaid diagram critical rendering rules
- Development tooling and execution standards

**⚠️ Important:** Always refer to CLAUDE.md as the authoritative source. This file exists only to provide a clear reference point and avoid loading duplicate context.
