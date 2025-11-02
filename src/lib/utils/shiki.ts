/**
 * Shiki Highlighter Singleton (Task 8F - Memory Fix v3: HMR-Resistant)
 *
 * Purpose: Provide shared Shiki highlighter instance with lazy language loading.
 *
 * PROBLEM SOLVED:
 * - Before: Each CodeBlock created its own highlighter → 10+ instances → WebAssembly OOM
 * - V2: Single shared instance but HMR resets module state → Still causes OOM in dev
 * - V3: globalThis persistence + retry limits → Survives HMR, graceful degradation
 *
 * Architecture:
 * - Lazy initialization (creates on first use)
 * - Lazy language loading (loads languages on-demand)
 * - HMR-resistant (uses globalThis for persistence)
 * - Retry limits (prevents infinite OOM loops)
 * - Promise-based API (async initialization)
 * - Type-safe with SETTINGS integration
 *
 * Memory Optimization:
 * - Initial load: Only themes (~500KB)
 * - Per-language: ~100-200KB loaded on first use of that language
 * - Total maximum: ~2MB (vs ~6MB loading all languages upfront)
 *
 * Usage:
 * ```typescript
 * import { getHighlighter } from '$lib/utils/shiki';
 *
 * const highlighter = await getHighlighter();
 * const html = highlighter.codeToHtml(code, { lang: 'typescript', ... });
 * ```
 */

import { createHighlighter, type Highlighter, type BundledLanguage } from "shiki";
import { SETTINGS } from "$config/settings";

// Global namespace for HMR-persistent state
declare global {
	var __shikiHighlighter: Highlighter | null;

	var __shikiInitPromise: Promise<Highlighter> | null;

	var __shikiLoadedLanguages: Set<string>;

	var __shikiInitCount: number;

	var __shikiFailedAttempts: number;
}

// Initialize global state if not present (survives HMR)
if (typeof globalThis.__shikiHighlighter === "undefined") {
	globalThis.__shikiHighlighter = null;
	globalThis.__shikiInitPromise = null;
	globalThis.__shikiLoadedLanguages = new Set<string>();
	globalThis.__shikiInitCount = 0;
	globalThis.__shikiFailedAttempts = 0;
}

// Constants
const MAX_RETRY_ATTEMPTS = 3;
const DISABLE_AFTER_FAILURES = true;

/**
 * Get or create shared Shiki highlighter instance
 *
 * Returns cached instance if available, otherwise creates new one.
 * Uses lazy language loading to minimize WebAssembly memory usage.
 * HMR-resistant via globalThis persistence.
 * Implements retry limits to prevent infinite OOM loops.
 *
 * @returns Promise<Highlighter> - Shared highlighter instance
 * @throws Error if initialization fails after max retries
 */
export async function getHighlighter(): Promise<Highlighter> {
	// Check if Shiki has been disabled due to repeated failures
	if (DISABLE_AFTER_FAILURES && globalThis.__shikiFailedAttempts >= MAX_RETRY_ATTEMPTS) {
		const error = new Error(
			`Shiki disabled after ${MAX_RETRY_ATTEMPTS} failed attempts. Using fallback rendering.`
		);
		console.error("[Shiki] Permanently disabled due to repeated failures:", error);
		throw error;
	}

	// Return cached instance if available (from globalThis, survives HMR)
	if (globalThis.__shikiHighlighter) {
		console.log(`[Shiki] Using cached highlighter (init count: ${globalThis.__shikiInitCount})`);
		return globalThis.__shikiHighlighter;
	}

	// If initialization is in progress, wait for it
	if (globalThis.__shikiInitPromise) {
		console.log("[Shiki] Waiting for in-progress initialization...");
		return globalThis.__shikiInitPromise;
	}

	// Start initialization (ONLY themes, NO languages yet)
	globalThis.__shikiInitCount++;
	console.log(`[Shiki] Initializing highlighter (attempt ${globalThis.__shikiInitCount})...`);

	// CRITICAL: Dispose any existing instance BEFORE creating new one
	// This releases WebAssembly memory and prevents OOM errors
	if (globalThis.__shikiHighlighter) {
		console.log("[Shiki] Disposing existing highlighter before re-initialization...");
		try {
			const existingHighlighter = globalThis.__shikiHighlighter as Highlighter;
			existingHighlighter.dispose?.();
			globalThis.__shikiHighlighter = null;
			globalThis.__shikiLoadedLanguages.clear();
		} catch (disposeError) {
			console.warn("[Shiki] Error disposing existing highlighter:", disposeError);
		}
	}

	globalThis.__shikiInitPromise = (async () => {
		try {
			// Small delay to allow WebAssembly garbage collection
			await new Promise((resolve) => setTimeout(resolve, 100));

			const highlighter = await createHighlighter({
				themes: [
					SETTINGS.ui.codeBlock.syntax.themes.light,
					SETTINGS.ui.codeBlock.syntax.themes.dark
				],
				langs: [] // EMPTY - languages loaded on-demand
			});

			// Cache the instance in globalThis (survives HMR)
			globalThis.__shikiHighlighter = highlighter;
			// Reset failed attempts counter on success
			globalThis.__shikiFailedAttempts = 0;

			console.log("[Shiki] Highlighter initialized successfully");
			return highlighter;
		} catch (error) {
			// Increment failure counter
			globalThis.__shikiFailedAttempts++;

			// Reset initialization promise to allow retry (up to MAX_RETRY_ATTEMPTS)
			globalThis.__shikiInitPromise = null;

			console.error(
				`[Shiki] Initialization failed (attempt ${globalThis.__shikiInitCount}, ` +
					`failures: ${globalThis.__shikiFailedAttempts}/${MAX_RETRY_ATTEMPTS}):`,
				error
			);

			throw error;
		}
	})();

	return globalThis.__shikiInitPromise;
}

/**
 * Ensure language is loaded in highlighter
 *
 * Loads language grammar if not already loaded.
 * Idempotent - safe to call multiple times for same language.
 * Uses globalThis for HMR-resistant state.
 *
 * @param highlighter - Shiki highlighter instance
 * @param language - Language to load
 * @returns Promise<void>
 */
export async function ensureLanguageLoaded(
	highlighter: Highlighter,
	language: string
): Promise<void> {
	// Skip if already loaded (check globalThis)
	if (globalThis.__shikiLoadedLanguages.has(language)) {
		return;
	}

	try {
		console.log(`[Shiki] Loading language: ${language}`);
		// Load language grammar
		await highlighter.loadLanguage(language as BundledLanguage);

		// Mark as loaded in globalThis (survives HMR)
		globalThis.__shikiLoadedLanguages.add(language);
		console.log(
			`[Shiki] Language loaded: ${language} (total: ${globalThis.__shikiLoadedLanguages.size})`
		);
	} catch (error) {
		console.warn(`[Shiki] Failed to load language "${language}":`, error);
		// Don't throw - fallback to plain text rendering
	}
}

/**
 * Dispose shared highlighter instance
 *
 * Releases WebAssembly memory and resets globalThis cache.
 * Should be called when application unmounts or to force reset.
 *
 * @example
 * ```typescript
 * import { onDestroy } from 'svelte';
 * import { disposeHighlighter } from '$lib/utils/shiki';
 *
 * onDestroy(() => {
 *   disposeHighlighter();
 * });
 * ```
 */
export function disposeHighlighter(): void {
	if (globalThis.__shikiHighlighter) {
		console.log("[Shiki] Disposing highlighter...");
		// Shiki highlighter cleanup (releases WebAssembly memory)
		globalThis.__shikiHighlighter.dispose?.();
		globalThis.__shikiHighlighter = null;
		globalThis.__shikiInitPromise = null;
		globalThis.__shikiLoadedLanguages.clear();
		console.log("[Shiki] Highlighter disposed");
	}
}
