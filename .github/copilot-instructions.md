# GitHub Copilot Instructions

> **📚 Complete Documentation:** All project rules, coding standards, and implementation guidelines are maintained in [CLAUDE.md](../CLAUDE.md)

This file provides GitHub Copilot with project-specific instructions while referencing the complete documentation.

## Quick Reference for Copilot

For all project rules, technical specifications, and coding standards, refer to **[CLAUDE.md](../CLAUDE.md)**.

## Key Standards for Code Generation

- **SvelteKit + TypeScript**: All components use Svelte 5 runes syntax with TypeScript interfaces
- **Mobile-First Design**: Always prioritize mobile experience (≤390px) before desktop
- **shadcn-svelte Priority**: Use component library before building custom components
- **Tailwind CSS v4**: Centralized CSS architecture in `src/app.css` with `@layer components`
- **Data-Driven**: Consume JSON data from `src/data/` structure
- **Validation**: Run `pnpm run format`, `pnpm run check`, and `pnpm run lint` for code quality

## Critical Rules

- Follow Mermaid diagram syntax rules (double quotes for all text)
- Use TypeScript interfaces for all component props
- Never create vanilla HTML/CSS/JS files for new features
- Always test mobile experience before desktop implementation

## Project Structure

- `/src/lib/`: Reusable SvelteKit components
- `/src/routes/`: File-based routing structure
- `/src/data/`: JSON data sources
- `/src/app.css`: Centralized Tailwind CSS architecture

**⚠️ Important:** This file serves as a quick reference. Always consult [CLAUDE.md](../CLAUDE.md) for complete and authoritative project guidelines.
