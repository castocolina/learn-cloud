# Agent Architecture Reference

## Overview

This document serves as a **historical reference** for the agent architecture design process (Phases 1-3). The executable implementation is now located in `.claude/` (Phase 4).

**For current implementation details, see:**

- **[.claude/AGENT-ARCHITECTURE-SUMMARY.md](../../.claude/AGENT-ARCHITECTURE-SUMMARY.md)** - Complete architecture documentation
- **[.claude/skills/](../../.claude/skills/)** - 4 executable skills with validation scripts
- **[.claude/agents/](../../.claude/agents/)** - 5 executable subagents
- **[.claude/hooks/](../../.claude/hooks/)** - 3 event-triggered hooks

---

## Architecture Philosophy

Specialized agents with clear responsibilities, automated triggers, and collaborative workflows. Each component reads specific documentation to maintain consistency and enforce project standards.

---

## Implemented Components

### Skills (Auto-Discovered Validators)

1. **mermaid-validator** - Mermaid diagram validation with mmdc
2. **test-quality-auditor** - Test pattern enforcement
3. **content-guardian** - Educational content validation
4. **component-integration-guardian** - Svelte component quality

### Subagents (Complex Reasoning)

1. **validation-enforcer** - 3-tier validation strategy
2. **test-architect** - Test generation (unit + E2E)
3. **requirements-engineer** - Task decomposition
4. **doc-sync-specialist** - Documentation synchronization
5. **ts-refactor-master** - AST-based refactoring

### Hooks (Event Automation)

1. **post-edit-format.cjs** - Auto-format after edits
2. **pre-write-validation.cjs** - Block protected files
3. **session-start.cjs** - Display project context

### MCPs (External Integration)

1. **svelte** - Svelte 5 documentation and autofixer
2. **memory** - Knowledge graph for educational tracking
3. **sequential-thinking** - Step-by-step problem solving
4. **npm-helper** - Package management
5. **filesystem** - Secure file operations

---

## Historical Context

This directory originally contained detailed specifications for each agent (Phases 1-3: design and planning). Those specifications have been:

- ✅ **Implemented** as executable components in `.claude/`
- ✅ **Tested** and validated
- ✅ **Documented** in AGENT-ARCHITECTURE-SUMMARY.md

The individual specification files have been removed to avoid redundancy and maintain a single source of truth.

---

**Last Updated:** 2025-01-18 (Phase 4 completion)
