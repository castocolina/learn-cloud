/**
 * Mermaid Diagram State Persistence Store (Task 8G)
 *
 * localStorage-based persistence for zoom/pan state across page navigation.
 *
 * ARCHITECTURE:
 * - Hybrid key strategy: storageKey prop > id prop > auto-hash (location + content)
 * - Scope discrimination: 'location' (per-page) vs 'global' (cross-page)
 * - Automatic expiration: Entries older than SETTINGS.ui.mermaid.statePersistence.maxAgeDays removed
 * - Error-resilient: Handles localStorage quota, disabled storage, corrupted data
 *
 * STORAGE KEY FORMAT:
 * - mermaid-v1-{scope}-{identifier}
 * - v1: Schema versioning for future migrations
 * - scope: 'loc' (location) | 'glb' (global)
 * - identifier: storageKey | id | hash(location+content)
 *
 * USAGE:
 * ```typescript
 * // Save state
 * saveDiagramState(key, { zoomLevel: 150, panOffset: { x: 10, y: 20 } });
 *
 * // Load state
 * const state = loadDiagramState(key);
 * if (state) {
 *   zoomLevel = state.zoomLevel;
 *   panOffset = state.panOffset;
 * }
 *
 * // Cleanup on app mount
 * cleanupOldStates();
 * ```
 */

import { SETTINGS } from "$config/settings.js";
import type { MermaidDiagramProps } from "$types";

const STORAGE_PREFIX = "mermaid-v1-";

/**
 * Persisted diagram state structure
 */
export interface DiagramPersistedState {
	/** Zoom level percentage (50-200) */
	zoomLevel: number;
	/** Pan offset in pixels */
	panOffset: {
		x: number;
		y: number;
	};
	/** Timestamp when state was saved (for expiration) */
	timestamp: number;
}

/**
 * Simple hash function for generating storage keys
 * Uses FNV-1a algorithm for fast, collision-resistant hashing
 *
 * @param str - String to hash
 * @returns 8-character hexadecimal hash
 */
function hash(str: string): string {
	let hash = 2166136261; // FNV offset basis

	for (let i = 0; i < str.length; i++) {
		hash ^= str.charCodeAt(i);
		hash = Math.imul(hash, 16777619); // FNV prime
	}

	// Convert to unsigned 32-bit integer, then to hex (8 chars)
	return (hash >>> 0).toString(36).slice(0, 8);
}

/**
 * Generate storage key using hybrid strategy
 *
 * PRECEDENCE HIERARCHY:
 * 1. props.storageKey (explicit user control) - highest priority
 * 2. props.id (component-level identity) - secondary
 * 3. Auto-hash (location + content) - automatic fallback
 *
 * SCOPE DISCRIMINATION:
 * - 'location': Includes page hash/pathname in key (default)
 * - 'global': Omits location, uses content only
 *
 * @param options - Key generation options
 * @returns Storage key string
 */
export function generateStorageKey(options: {
	/** Mermaid diagram definition */
	diagram: string;
	/** Optional title/caption */
	title?: string;
	/** Optional explicit storage key (highest priority) */
	storageKey?: string;
	/** Optional component ID (secondary priority) */
	id?: string;
	/** Persistence scope */
	scope: "location" | "global";
}): string {
	const { diagram, title, storageKey, id, scope } = options;
	const scopePrefix = scope === "location" ? "loc" : "glb";

	// Strategy 1: Explicit storageKey (user control)
	if (storageKey) {
		return `${STORAGE_PREFIX}${scopePrefix}-${storageKey}`;
	}

	// Strategy 2: Component ID (with location discrimination if scope='location')
	if (id) {
		if (scope === "location") {
			// Include location for per-page independence
			const locationHash = hash(window.location.hash || window.location.pathname);
			return `${STORAGE_PREFIX}${scopePrefix}-${locationHash}-${id}`;
		} else {
			// Global scope: ID only
			return `${STORAGE_PREFIX}${scopePrefix}-${id}`;
		}
	}

	// Strategy 3: Auto-hash (location + content)
	const contentHash = hash(`${diagram}-${title || ""}`);

	if (scope === "location") {
		// Per-page state: location + content
		const locationHash = hash(window.location.hash || window.location.pathname);
		return `${STORAGE_PREFIX}${scopePrefix}-${locationHash}-${contentHash}`;
	} else {
		// Global state: content only
		return `${STORAGE_PREFIX}${scopePrefix}-${contentHash}`;
	}
}

/**
 * Save diagram state to localStorage
 *
 * Error-resilient: Handles quota exceeded, disabled storage
 *
 * @param key - Storage key (from generateStorageKey)
 * @param state - Diagram state (zoom/pan)
 */
export function saveDiagramState(
	key: string,
	state: { zoomLevel: number; panOffset: { x: number; y: number } }
): void {
	try {
		const persistedState: DiagramPersistedState = {
			...state,
			timestamp: Date.now()
		};

		localStorage.setItem(key, JSON.stringify(persistedState));
	} catch (error) {
		// Quota exceeded or localStorage disabled
		// Silently fail (non-critical feature)
		if (error instanceof Error && error.name === "QuotaExceededError") {
			console.warn("[MermaidDiagram] localStorage quota exceeded, state not persisted");
		} else {
			console.warn("[MermaidDiagram] Failed to save state:", error);
		}
	}
}

/**
 * Load diagram state from localStorage
 *
 * Validates expiration using SETTINGS.ui.mermaid.statePersistence.maxAgeDays
 * Removes expired entries automatically
 *
 * @param key - Storage key (from generateStorageKey)
 * @returns Persisted state or null if not found/expired/invalid
 */
export function loadDiagramState(key: string): DiagramPersistedState | null {
	try {
		const stored = localStorage.getItem(key);
		if (!stored) return null;

		const state: DiagramPersistedState = JSON.parse(stored);

		// Validate expiration
		const maxAgeMs = SETTINGS.ui.mermaid.statePersistence.maxAgeDays * 24 * 60 * 60 * 1000;
		const ageMs = Date.now() - state.timestamp;

		if (ageMs > maxAgeMs) {
			// Expired: remove and return null
			localStorage.removeItem(key);
			return null;
		}

		return state;
	} catch {
		// JSON parse error or localStorage access error
		// Remove corrupted entry
		try {
			localStorage.removeItem(key);
		} catch {
			// Silently fail if removal fails
		}
		return null;
	}
}

/**
 * Clean up expired diagram states from localStorage
 *
 * Iterates through all mermaid-v1-* keys and removes expired entries
 * Should be called on app mount to prevent localStorage bloat
 *
 * PERFORMANCE: O(n) where n = total localStorage keys
 * Typical execution: <10ms for 100 keys
 */
export function cleanupOldStates(): void {
	try {
		const keys = Object.keys(localStorage);
		const maxAgeMs = SETTINGS.ui.mermaid.statePersistence.maxAgeDays * 24 * 60 * 60 * 1000;
		const now = Date.now();

		let removedCount = 0;

		for (const key of keys) {
			// Only process mermaid diagram states
			if (!key.startsWith(STORAGE_PREFIX)) continue;

			try {
				const stored = localStorage.getItem(key);
				if (!stored) continue;

				const state: DiagramPersistedState = JSON.parse(stored);

				// Check expiration
				if (now - state.timestamp > maxAgeMs) {
					localStorage.removeItem(key);
					removedCount++;
				}
			} catch {
				// Corrupted data: remove
				localStorage.removeItem(key);
				removedCount++;
			}
		}

		if (removedCount > 0) {
			console.info(
				`[MermaidDiagram] Cleaned up ${removedCount} expired diagram state${removedCount > 1 ? "s" : ""}`
			);
		}
	} catch (error) {
		// localStorage access error (disabled, quota, etc.)
		console.warn("[MermaidDiagram] Failed to cleanup old states:", error);
	}
}

/**
 * Generate storage key for MermaidDiagram component
 * Convenience wrapper around generateStorageKey with MermaidDiagramProps
 *
 * @param props - MermaidDiagramProps
 * @returns Storage key string
 */
export function getStorageKeyForDiagram(
	props: Pick<
		MermaidDiagramProps,
		"diagram" | "title" | "id" | "storageKey" | "statePersistenceScope"
	>
): string {
	const scope = props.statePersistenceScope || SETTINGS.ui.mermaid.statePersistence.scope;

	return generateStorageKey({
		diagram: props.diagram,
		title: props.title,
		id: props.id,
		storageKey: props.storageKey,
		scope
	});
}
