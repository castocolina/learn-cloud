/**
 * Shared Components
 *
 * This module exports shared components including wrapper components that demonstrate
 * the wrapper pattern for shadcn-svelte components and production-ready content components.
 *
 * Wrapper Components (add union types, SETTINGS, theme defaults):
 * - Button: Basic wrapper with union types
 * - Dialog: Complex wrapper with SETTINGS and z-index hierarchy
 * - Progress: Configuration wrapper with theme integration
 *
 * Content Components (production-ready with advanced features):
 * - CodeBlock: Syntax highlighting with Shiki, copy/download/expand features (Task 8F)
 * - MermaidDiagram: Diagram rendering with GitHub-style zoom controls (Task 8G)
 * - MermaidFullView: Full-screen diagram viewer for Dialog integration
 * - ContentHeader: Type-specific headers for lesson/guide/reference content
 *
 * Usage:
 * ```typescript
 * import { Button, Dialog, MermaidDiagram, CodeBlock } from "$lib/components/shared";
 * ```
 *
 * Related Documentation:
 * - docs/WRAPPER-PATTERN-GUIDE.md (comprehensive wrapper patterns)
 * - docs/SVELTEKIT-INDEX.md (architecture standards)
 */

export { default as Button } from "./Button.svelte";
export { default as CodeBlock } from "./CodeBlock.svelte";
export { default as ContentHeader } from "./ContentHeader.svelte";
export { default as Dialog } from "./Dialog.svelte";
export { default as MermaidDiagram } from "./MermaidDiagram.svelte";
export { default as MermaidFullView } from "./MermaidFullView.svelte";
export { default as Progress } from "./Progress.svelte";
