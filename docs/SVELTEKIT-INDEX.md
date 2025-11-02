# SvelteKit Guides: Master Index

**Complete technical architecture, development standards, and user experience guidelines for the Cloud-Native Learning Platform.**

> **📚 Related Project Documentation:**
>
> - [CLAUDE.md](../CLAUDE.md) - Core project rules and agent implementation guidelines
> - [CONTENT-STANDARDS.md](../CONTENT-STANDARDS.md) - Content creation workflows and quality assurance standards
> - [WRAPPER-PATTERN-GUIDE.md](./WRAPPER-PATTERN-GUIDE.md) - Component wrapper development patterns

---

## Quick Navigation

### Core Guides

| Guide                                                              | Description                                            | Size       | Topics Covered                                                          |
| ------------------------------------------------------------------ | ------------------------------------------------------ | ---------- | ----------------------------------------------------------------------- |
| **[SVELTE-ARCHITECTURE.md](./SVELTE-ARCHITECTURE.md)**             | Project setup, core architecture, and file structure   | ~500 lines | Tech stack, testing requirements, theme system, project structure       |
| **[SVELTE-STYLING.md](./SVELTE-STYLING.md)**                       | CSS architecture, Tailwind v4, theming, and layout     | ~450 lines | Modular CSS, layout architecture, z-index hierarchy, CSS precedence     |
| **[SVELTE-COMPONENTS.md](./SVELTE-COMPONENTS.md)**                 | Component development patterns and TypeScript          | ~550 lines | TypeScript interfaces, Svelte 5 runes, reactive collections, navigation |
| **[SVELTE-DEVELOPMENT.md](./SVELTE-DEVELOPMENT.md)**               | Modern development patterns, testing, and quality      | ~900 lines | Prettier integration, testing patterns, dependency evaluation, services |
| **[SVELTE-TROUBLESHOOTING-UX.md](./SVELTE-TROUBLESHOOTING-UX.md)** | Troubleshooting, UX standards, and demo implementation | ~350 lines | Common issues, mobile-first design, interactive components              |

---

## Complete Table of Contents

### 1. [Architecture & Setup](./SVELTE-ARCHITECTURE.md)

**Critical Testing & Project Foundation**

- **CRITICAL TESTING REQUIREMENT** - Mandatory validation cycle
- **Project Architecture** - Core technology stack
  - Framework: SvelteKit with Svelte 5
  - Svelte 5 Critical Syntax (runes)
  - Code Quality Requirements
  - Styling: Tailwind CSS v4 with Modular Architecture
  - UI Components: shadcn-svelte
  - Icons: lucide-svelte
  - Theme Management
- **Theme System Architecture** - Implementation details
  - Theme Store
  - ThemeToggle Component
  - CSS Variables Integration
  - Usage Pattern
- **File Structure Deep Dive** - Complete project organization
  - src/ directory structure
  - Key files explained
  - The src/lib directory strategy
  - Best practices

### 2. [Styling & Layout](./SVELTE-STYLING.md)

**CSS Architecture & Visual Design**

- **CSS Architecture Standards** - Modular organization (MANDATORY)
  - Core Principle
  - Required File Structure
  - CSS Import Order
  - SvelteKit Component Integration Rules
  - :global() Scoping Rules (CRITICAL)
  - SvelteKit-Specific Benefits
  - Z-Index Hierarchy Standards (CRITICAL ISSUE PREVENTION)
  - Stacking Context Issue Prevention
- **CSS Precedence & Override Hierarchy** (NEW SECTION)
  - File Load Order
  - Override Strategies
  - Browser vs Tailwind Class Precedence
  - Specific Precedence Patterns
  - !important Usage Guidelines
- **Flexbox + Grid Hybrid Layout Architecture**
  - Layout Philosophy
  - Configurable Layout Proportions
  - CSS Variable System
  - Layout Implementation Pattern
  - Responsive Breakpoints
  - Collapsed Sidebar State
  - shadcn/ui Sidebar Integration
  - Benefits of This Architecture
  - Testing Layout Changes
- **Theming & Styling**
  - Tailwind CSS v4 Integration
  - Theme Customization Strategy
  - Mobile-First Responsive Design
  - Ensuring Third-Party Component Theme Adoption

### 3. [Components & Types](./SVELTE-COMPONENTS.md)

**Component Development & Type System**

- **TypeScript Interface Standards** - Svelte 5 Runes Syntax
- **Unified TypeScript Architecture** (`src/lib/types/`)
  - Type System Structure
  - SvelteKit Path Aliases
  - Critical Import Pattern
  - Union Type-First Architecture
  - Domain Integration
  - Refactoring Steps
  - Type Safety
  - Refactoring Best Practices
  - Critical Refactoring Rules
  - Refactoring Workflow
  - Documentation Updates
  - Critical Integration Notes
  - Component Implementation Example
  - Key Benefits
- **Svelte 5 Reactive Collections**: SvelteMap and SvelteSet
  - Problem with Regular Collections
  - Solution with SvelteMap
  - Import Pattern
  - Derived Reactivity
  - TypeScript Interface Support
  - When to Use SvelteMap/SvelteSet
  - Benefits
- **Component Architecture Patterns**
  - Single Responsibility Components
  - Event-Driven Communication
- **Custom vs Third-Party Components**
  - Decision Matrix
  - Integration Strategy
- **Global Configuration Strategy**
  - Centralized Settings Architecture
  - Configuration File Structure
  - Type Definitions
  - Usage in Components
  - Benefits
  - Configuration Groups
- **Global Navigation Architecture**
  - Overview
  - Key Components (Navigation Store, FloatingNav, Swipe Gesture Action)
  - Integration Pattern
  - Navigation Flow
  - State Management Philosophy
  - Performance Considerations
  - Accessibility Features
  - Testing & Future Extensions

### 4. [Development Patterns & Testing](./SVELTE-DEVELOPMENT.md)

**Modern Development Practices**

- **Development Standards** - Component rules and quality
  - Component Development Rules
  - Code Quality Standards
  - Security Considerations
- **Prettier Integration Patterns** - Central formatting utility
  - Central Formatting Utility
  - Configuration Resolution
  - Anti-Patterns to Avoid
  - Production vs Development Modes
- **Configuration Management** (CRITICAL RULE)
  - No Hardcoded Configurations
  - Configuration Architecture
  - Correct vs Incorrect Usage
  - Creating New Configuration Categories
  - Type Safety
  - When to Use settings.ts
- **Settings Configuration Patterns**
  - Modern Destructuring Pattern
  - Performance Optimization in Tests
  - Dynamic Settings for Test Isolation
- **Test Isolation & TestSetup Patterns**
  - TestSetup Class Architecture
  - Usage Pattern in Tests
  - Race Condition Prevention
  - Critical Rule: No Hardcoded Paths
  - Why This Matters
  - Mandatory Cleanup
  - Cleanup Implementation Pattern
  - Why Cleanup Matters
- **Type Safety & Import Patterns**
  - Centralized Type Imports
  - Content Data Imports
  - Union Type Consistency
- **Service Layer Architecture Patterns**
  - Separation of Concerns
  - Shared Service Integration
- **Error Prevention & Path Resolution Patterns**
  - Path Duplication Prevention
  - Safe File Operations
  - Validation Pipeline Patterns
- **Dependency Evaluation & Installation Process** (MANDATORY)
  - Research Before Installing
  - Step-by-Step Evaluation Process
  - Community Support & Maintenance
  - Alternative Research
  - Framework Compatibility
  - Native Solutions First (Critical Priority)
  - Decision Matrix
  - Real-World Example
  - Documentation Requirements
  - Anti-Pattern to Avoid
- **Integration Guidelines**
  - Consistent Pattern Application
  - Migration from Legacy Patterns

### 5. [Troubleshooting & UX](./SVELTE-TROUBLESHOOTING-UX.md)

**Common Issues & User Experience Standards**

- **Common Troubleshooting**
  - Tailwind CSS v4 Issues
  - Svelte 5 Migration Issues
  - Performance Issues
- **USER EXPERIENCE STANDARDS**
  - Mobile-First Design
  - Interactive Components
  - Navigation Standards
  - Interactive Element Requirements (MANDATORY)
  - Quiz System
  - Theming Standards
- **Demo Implementation Plan**
  - Demo Data Architecture
  - Key Structure
  - Import Examples
  - Core Interfaces
  - Organization Strategy
  - Target Component Set

---

## Keyword Index

**Quick reference for specific topics:**

| Keyword                  | Guide                                                | Section                              |
| ------------------------ | ---------------------------------------------------- | ------------------------------------ |
| `@apply` issues          | [STYLING](./SVELTE-STYLING.md)                       | CSS Architecture Standards           |
| `@layer components`      | [STYLING](./SVELTE-STYLING.md)                       | CSS Architecture Standards           |
| `:global()` scoping      | [STYLING](./SVELTE-STYLING.md)                       | CSS Architecture Standards           |
| Accessibility            | [TROUBLESHOOTING-UX](./SVELTE-TROUBLESHOOTING-UX.md) | Interactive Element Requirements     |
| Breadcrumbs              | [TROUBLESHOOTING-UX](./SVELTE-TROUBLESHOOTING-UX.md) | Navigation Standards                 |
| CSS precedence           | [STYLING](./SVELTE-STYLING.md)                       | CSS Precedence & Override Hierarchy  |
| CSS variables            | [STYLING](./SVELTE-STYLING.md)                       | CSS Variable System                  |
| Dark mode                | [ARCHITECTURE](./SVELTE-ARCHITECTURE.md)             | Theme System Architecture            |
| Dependencies             | [DEVELOPMENT](./SVELTE-DEVELOPMENT.md)               | Dependency Evaluation & Installation |
| Derived state            | [COMPONENTS](./SVELTE-COMPONENTS.md)                 | Svelte 5 Reactive Collections        |
| File structure           | [ARCHITECTURE](./SVELTE-ARCHITECTURE.md)             | File Structure Deep Dive             |
| Flexbox + Grid           | [STYLING](./SVELTE-STYLING.md)                       | Flexbox + Grid Hybrid Layout         |
| Import patterns          | [DEVELOPMENT](./SVELTE-DEVELOPMENT.md)               | Type Safety & Import Patterns        |
| Inline styles            | [STYLING](./SVELTE-STYLING.md)                       | CSS Architecture Standards           |
| Layout proportions       | [STYLING](./SVELTE-STYLING.md)                       | Configurable Layout Proportions      |
| lucide-svelte            | [ARCHITECTURE](./SVELTE-ARCHITECTURE.md)             | Icons                                |
| Mobile-first             | [TROUBLESHOOTING-UX](./SVELTE-TROUBLESHOOTING-UX.md) | Mobile-First Design                  |
| Modals                   | [TROUBLESHOOTING-UX](./SVELTE-TROUBLESHOOTING-UX.md) | Modal System                         |
| Navigation               | [COMPONENTS](./SVELTE-COMPONENTS.md)                 | Global Navigation Architecture       |
| Prettier                 | [DEVELOPMENT](./SVELTE-DEVELOPMENT.md)               | Prettier Integration Patterns        |
| Props                    | [COMPONENTS](./SVELTE-COMPONENTS.md)                 | TypeScript Interface Standards       |
| Runes ($state, $derived) | [ARCHITECTURE](./SVELTE-ARCHITECTURE.md)             | Svelte 5 Critical Syntax             |
| Settings configuration   | [COMPONENTS](./SVELTE-COMPONENTS.md)                 | Global Configuration Strategy        |
| shadcn-svelte            | [ARCHITECTURE](./SVELTE-ARCHITECTURE.md)             | UI Components                        |
| Sidebar                  | [STYLING](./SVELTE-STYLING.md)                       | shadcn/ui Sidebar Integration        |
| Stacking context         | [STYLING](./SVELTE-STYLING.md)                       | Z-Index Hierarchy Standards          |
| SvelteMap                | [COMPONENTS](./SVELTE-COMPONENTS.md)                 | Svelte 5 Reactive Collections        |
| Tailwind CSS v4          | [STYLING](./SVELTE-STYLING.md)                       | CSS Architecture Standards           |
| Testing                  | [DEVELOPMENT](./SVELTE-DEVELOPMENT.md)               | Test Isolation & TestSetup Patterns  |
| Theme system             | [ARCHITECTURE](./SVELTE-ARCHITECTURE.md)             | Theme System Architecture            |
| TypeScript types         | [COMPONENTS](./SVELTE-COMPONENTS.md)                 | Unified TypeScript Architecture      |
| Validation               | [ARCHITECTURE](./SVELTE-ARCHITECTURE.md)             | CRITICAL TESTING REQUIREMENT         |
| Z-index                  | [STYLING](./SVELTE-STYLING.md)                       | Z-Index Hierarchy Standards          |

---

## Which Guide Should I Use?

**Choose based on your current task:**

| Task                      | Recommended Guide                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| Setting up new project    | [SVELTE-ARCHITECTURE.md](./SVELTE-ARCHITECTURE.md)                                                |
| Installing dependencies   | [SVELTE-DEVELOPMENT.md](./SVELTE-DEVELOPMENT.md) → Dependency Evaluation                          |
| Creating new component    | [SVELTE-COMPONENTS.md](./SVELTE-COMPONENTS.md) → Component Architecture Patterns                  |
| Styling component         | [SVELTE-STYLING.md](./SVELTE-STYLING.md) → CSS Architecture Standards                             |
| Layout issues             | [SVELTE-STYLING.md](./SVELTE-STYLING.md) → Flexbox + Grid Hybrid Layout                           |
| Z-index conflicts         | [SVELTE-STYLING.md](./SVELTE-STYLING.md) → Z-Index Hierarchy Standards                            |
| CSS precedence problems   | [SVELTE-STYLING.md](./SVELTE-STYLING.md) → CSS Precedence & Override Hierarchy                    |
| TypeScript errors         | [SVELTE-COMPONENTS.md](./SVELTE-COMPONENTS.md) → TypeScript Interface Standards                   |
| Type imports              | [SVELTE-COMPONENTS.md](./SVELTE-COMPONENTS.md) → Unified TypeScript Architecture                  |
| Writing tests             | [SVELTE-DEVELOPMENT.md](./SVELTE-DEVELOPMENT.md) → Test Isolation & TestSetup                     |
| Configuration values      | [SVELTE-COMPONENTS.md](./SVELTE-COMPONENTS.md) → Global Configuration Strategy                    |
| Build failures            | [SVELTE-TROUBLESHOOTING-UX.md](./SVELTE-TROUBLESHOOTING-UX.md) → Common Troubleshooting           |
| Mobile responsive         | [SVELTE-TROUBLESHOOTING-UX.md](./SVELTE-TROUBLESHOOTING-UX.md) → Mobile-First Design              |
| Accessibility             | [SVELTE-TROUBLESHOOTING-UX.md](./SVELTE-TROUBLESHOOTING-UX.md) → Interactive Element Requirements |
| Svelte 5 migration        | [SVELTE-TROUBLESHOOTING-UX.md](./SVELTE-TROUBLESHOOTING-UX.md) → Svelte 5 Migration Issues        |
| Theme customization       | [SVELTE-STYLING.md](./SVELTE-STYLING.md) → Theming & Styling                                      |
| Navigation implementation | [SVELTE-COMPONENTS.md](./SVELTE-COMPONENTS.md) → Global Navigation Architecture                   |

---

## Validation & Quality Assurance

**Three-Tiered Validation Strategy:**

- **Tier 1 (Fast WIP Check ~5-15s):** `make check-wip` - Modified files only
- **Tier 2 (Quality Checks ~30-90s):** `make validate-quality` - Theme + unit tests
- **Tier 3 (Comprehensive ~1-3m):** `pnpm run format` + `pnpm run lint` + `pnpm run check`

**See [SVELTE-DEVELOPMENT.md](./SVELTE-DEVELOPMENT.md)** for complete quality standards and testing strategies.

---

## Getting Started

**For new developers:**

1. Start with [SVELTE-ARCHITECTURE.md](./SVELTE-ARCHITECTURE.md) to understand the project foundation
2. Review [SVELTE-STYLING.md](./SVELTE-STYLING.md) for CSS architecture rules
3. Reference [SVELTE-COMPONENTS.md](./SVELTE-COMPONENTS.md) when building components
4. Follow [SVELTE-DEVELOPMENT.md](./SVELTE-DEVELOPMENT.md) for development best practices
5. Keep [SVELTE-TROUBLESHOOTING-UX.md](./SVELTE-TROUBLESHOOTING-UX.md) handy for common issues

**For specific tasks:**

Use the **"Which Guide Should I Use?"** table above to jump directly to relevant documentation.

---

**Last Updated:** 2025-11-01
**Maintained By:** Cloud-Native Learning Platform Team
