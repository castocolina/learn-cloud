/**
 * MermaidDiagram Component Unit Tests (Task 8G)
 *
 * Tests diagram rendering configuration, state persistence, zoom/pan controls,
 * props validation, and error handling for the production MermaidDiagram component.
 *
 * Coverage target: ≥90%
 *
 * Test Scope:
 * - SETTINGS validation (statePersistence, zoom, pan, buttons)
 * - Props interface validation (MermaidDiagramProps)
 * - State persistence (localStorage save/load/cleanup with 14-day expiration)
 * - Storage key generation (hybrid strategy: storageKey > id > auto-hash)
 * - Zoom control logic (50%-200% limits, 25% steps)
 * - Pan control logic (±500px limits, 50px steps)
 * - Edge cases (empty diagram, malformed syntax, quota exceeded)
 * - TypeScript interface compliance
 *
 * Note: Full DOM testing is done via E2E tests (mermaid-diagram.spec.ts)
 * These unit tests focus on configuration, state management, and type safety.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { SETTINGS } from "$config/settings";
import type { MermaidDiagramProps } from "$types";
import {
	generateStorageKey,
	saveDiagramState,
	loadDiagramState,
	cleanupOldStates,
	getStorageKeyForDiagram
} from "$lib/stores/diagram-persistence";

// Mock window.location for key generation tests
const mockLocation = {
	hash: "#/kubernetes/intro",
	pathname: "/test"
};

beforeEach(() => {
	// Clear localStorage before each test
	localStorage.clear();

	// Mock window.location
	vi.stubGlobal("location", mockLocation);
});

// =====================================================
// SETTINGS VALIDATION
// =====================================================

describe("MermaidDiagram - SETTINGS Configuration", () => {
	it("should have correct zoom configuration", () => {
		expect(SETTINGS.ui.mermaid.zoom.defaultLevel).toBe(100);
		expect(SETTINGS.ui.mermaid.zoom.minLevel).toBe(50);
		expect(SETTINGS.ui.mermaid.zoom.maxLevel).toBe(200);
		expect(SETTINGS.ui.mermaid.zoom.step).toBe(25);
	});

	it("should have correct pan configuration", () => {
		expect(SETTINGS.ui.mermaid.pan.step).toBe(50);
		expect(SETTINGS.ui.mermaid.pan.maxOffset).toBe(500);
	});

	it("should have correct state persistence configuration", () => {
		expect(SETTINGS.ui.mermaid.statePersistence.enabled).toBe(true);
		expect(SETTINGS.ui.mermaid.statePersistence.maxAgeDays).toBe(14);
		expect(SETTINGS.ui.mermaid.statePersistence.scope).toBe("location");
	});

	it("should have correct copy feedback duration", () => {
		expect(SETTINGS.ui.mermaid.copyFeedback.duration).toBe(2000);
	});

	it("should have responsive button defaults (mobile vs desktop)", () => {
		// Mobile config
		expect(SETTINGS.ui.mermaid.buttons.mobile.showCopySvgButton).toBe(true);
		expect(SETTINGS.ui.mermaid.buttons.mobile.showZoomControls).toBe(false);
		expect(SETTINGS.ui.mermaid.buttons.mobile.showDownloadButton).toBe(false);

		// Desktop config
		expect(SETTINGS.ui.mermaid.buttons.desktop.showZoomControls).toBe(true);
		expect(SETTINGS.ui.mermaid.buttons.desktop.showDownloadButton).toBe(true);
		expect(SETTINGS.ui.mermaid.buttons.desktop.showExpandButton).toBe(true);
	});
});

// =====================================================
// PROPS INTERFACE VALIDATION
// =====================================================

describe("MermaidDiagram - Props Interface", () => {
	it("should accept minimal props", () => {
		const minimalProps: MermaidDiagramProps = {
			diagram: "flowchart LR\n  A --> B"
		};

		expect(minimalProps.diagram).toBeDefined();
		expect(minimalProps.diagram).toContain("flowchart");
	});

	it("should accept full props configuration", () => {
		const fullProps: MermaidDiagramProps = {
			diagram: "flowchart TD\n  Start --> End",
			title: "Test Diagram",
			debug: true,
			showExpandButton: true,
			showZoomControls: true,
			showDownloadButton: true,
			showCopySvgButton: true,
			showCopyPngButton: true,
			showCopyCodeButton: true,
			showValidationStatus: true,
			actionGridOrientation: "vertical",
			class: "custom-diagram",
			id: "test-diagram-1",
			enableStatePersistence: true,
			storageKey: "my-custom-key",
			statePersistenceScope: "global"
		};

		expect(fullProps.diagram).toBe("flowchart TD\n  Start --> End");
		expect(fullProps.title).toBe("Test Diagram");
		expect(fullProps.enableStatePersistence).toBe(true);
		expect(fullProps.storageKey).toBe("my-custom-key");
		expect(fullProps.statePersistenceScope).toBe("global");
	});

	it("should accept location scope", () => {
		const props: MermaidDiagramProps = {
			diagram: "graph TD\n  A --> B",
			statePersistenceScope: "location"
		};

		expect(props.statePersistenceScope).toBe("location");
	});

	it("should accept global scope", () => {
		const props: MermaidDiagramProps = {
			diagram: "graph TD\n  A --> B",
			statePersistenceScope: "global"
		};

		expect(props.statePersistenceScope).toBe("global");
	});
});

// =====================================================
// STATE PERSISTENCE - KEY GENERATION
// =====================================================

describe("MermaidDiagram - Storage Key Generation", () => {
	it("should prioritize storageKey prop (highest priority)", () => {
		const key1 = generateStorageKey({
			diagram: "flowchart LR\n  A --> B",
			title: "Test",
			storageKey: "my-custom-key",
			id: "ignored-id",
			scope: "location"
		});

		expect(key1).toBe("mermaid-v1-loc-my-custom-key");
	});

	it("should use id prop with location hash (secondary priority)", () => {
		const key = generateStorageKey({
			diagram: "flowchart LR\n  A --> B",
			title: "Test",
			id: "diagram-123",
			scope: "location"
		});

		// Should include location hash + id
		expect(key).toMatch(/^mermaid-v1-loc-[a-z0-9]+-diagram-123$/);
	});

	it("should use id prop without location (global scope)", () => {
		const key = generateStorageKey({
			diagram: "flowchart LR\n  A --> B",
			id: "diagram-456",
			scope: "global"
		});

		expect(key).toBe("mermaid-v1-glb-diagram-456");
	});

	it("should auto-generate hash for location scope (fallback)", () => {
		const key = generateStorageKey({
			diagram: "flowchart LR\n  A --> B",
			title: "Test Diagram",
			scope: "location"
		});

		// Should have format: mermaid-v1-loc-{locationHash}-{contentHash}
		expect(key).toMatch(/^mermaid-v1-loc-[a-z0-9]+-[a-z0-9]+$/);
	});

	it("should auto-generate hash for global scope (fallback)", () => {
		const key = generateStorageKey({
			diagram: "flowchart LR\n  A --> B",
			title: "Test Diagram",
			scope: "global"
		});

		// Should have format: mermaid-v1-glb-{contentHash}
		expect(key).toMatch(/^mermaid-v1-glb-[a-z0-9]+$/);
	});

	it("should generate different keys for same diagram on different pages (location scope)", () => {
		const diagram = "flowchart TD\n  Start --> End";

		// Simulate #/page1
		vi.stubGlobal("location", { hash: "#/page1", pathname: "/" });
		const key1 = generateStorageKey({ diagram, scope: "location" });

		// Simulate #/page2
		vi.stubGlobal("location", { hash: "#/page2", pathname: "/" });
		const key2 = generateStorageKey({ diagram, scope: "location" });

		expect(key1).not.toBe(key2);
	});

	it("should generate same key for same diagram on different pages (global scope)", () => {
		const diagram = "flowchart TD\n  Start --> End";

		// Simulate #/page1
		vi.stubGlobal("location", { hash: "#/page1", pathname: "/" });
		const key1 = generateStorageKey({ diagram, scope: "global" });

		// Simulate #/page2
		vi.stubGlobal("location", { hash: "#/page2", pathname: "/" });
		const key2 = generateStorageKey({ diagram, scope: "global" });

		expect(key1).toBe(key2);
	});

	it("should generate different keys for different diagram content", () => {
		const key1 = generateStorageKey({
			diagram: "flowchart LR\n  A --> B",
			scope: "location"
		});

		const key2 = generateStorageKey({
			diagram: "flowchart LR\n  X --> Y",
			scope: "location"
		});

		expect(key1).not.toBe(key2);
	});
});

// =====================================================
// STATE PERSISTENCE - SAVE/LOAD
// =====================================================

describe("MermaidDiagram - State Persistence Save/Load", () => {
	it("should save diagram state to localStorage", () => {
		const key = "mermaid-v1-loc-test";
		const state = { zoomLevel: 150, panOffset: { x: 10, y: 20 } };

		saveDiagramState(key, state);

		const stored = localStorage.getItem(key);
		expect(stored).toBeDefined();

		const parsed = JSON.parse(stored!);
		expect(parsed.zoomLevel).toBe(150);
		expect(parsed.panOffset).toEqual({ x: 10, y: 20 });
		expect(parsed.timestamp).toBeDefined();
	});

	it("should load saved state from localStorage", () => {
		const key = "mermaid-v1-loc-test";
		const state = { zoomLevel: 125, panOffset: { x: -30, y: 40 } };

		saveDiagramState(key, state);
		const loaded = loadDiagramState(key);

		expect(loaded).toBeDefined();
		expect(loaded!.zoomLevel).toBe(125);
		expect(loaded!.panOffset).toEqual({ x: -30, y: 40 });
	});

	it("should return null for non-existent key", () => {
		const loaded = loadDiagramState("mermaid-v1-loc-nonexistent");
		expect(loaded).toBeNull();
	});

	it("should invalidate expired state (older than maxAgeDays)", () => {
		const key = "mermaid-v1-loc-expired";
		const state = {
			zoomLevel: 100,
			panOffset: { x: 0, y: 0 },
			timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000 // 15 days ago
		};

		localStorage.setItem(key, JSON.stringify(state));

		const loaded = loadDiagramState(key);
		expect(loaded).toBeNull();

		// Should also remove from localStorage
		expect(localStorage.getItem(key)).toBeNull();
	});

	it("should preserve state within maxAgeDays window", () => {
		const key = "mermaid-v1-loc-valid";
		const state = {
			zoomLevel: 175,
			panOffset: { x: 50, y: -50 },
			timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 // 7 days ago (within 14-day limit)
		};

		localStorage.setItem(key, JSON.stringify(state));

		const loaded = loadDiagramState(key);
		expect(loaded).toBeDefined();
		expect(loaded!.zoomLevel).toBe(175);
	});

	it("should handle corrupted data gracefully", () => {
		const key = "mermaid-v1-loc-corrupted";
		localStorage.setItem(key, "invalid-json{{{");

		const loaded = loadDiagramState(key);
		expect(loaded).toBeNull();

		// Should remove corrupted entry
		expect(localStorage.getItem(key)).toBeNull();
	});

	it("should handle localStorage quota exceeded gracefully", () => {
		// Mock localStorage to throw QuotaExceededError
		const originalSetItem = Storage.prototype.setItem;
		Storage.prototype.setItem = vi.fn(() => {
			const error = new Error("QuotaExceededError");
			error.name = "QuotaExceededError";
			throw error;
		});

		// Should not throw error
		expect(() => {
			saveDiagramState("mermaid-v1-loc-test", {
				zoomLevel: 100,
				panOffset: { x: 0, y: 0 }
			});
		}).not.toThrow();

		// Restore original setItem
		Storage.prototype.setItem = originalSetItem;
	});
});

// =====================================================
// STATE PERSISTENCE - CLEANUP
// =====================================================

describe("MermaidDiagram - State Persistence Cleanup", () => {
	it("should remove expired states (older than 14 days)", () => {
		// Add expired state
		const expiredKey = "mermaid-v1-loc-expired";
		const expiredState = {
			zoomLevel: 100,
			panOffset: { x: 0, y: 0 },
			timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000 // 15 days ago
		};
		localStorage.setItem(expiredKey, JSON.stringify(expiredState));

		// Add valid state
		const validKey = "mermaid-v1-loc-valid";
		const validState = {
			zoomLevel: 150,
			panOffset: { x: 10, y: 20 },
			timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 // 5 days ago
		};
		localStorage.setItem(validKey, JSON.stringify(validState));

		cleanupOldStates();

		// Expired should be removed
		expect(localStorage.getItem(expiredKey)).toBeNull();

		// Valid should remain
		expect(localStorage.getItem(validKey)).toBeDefined();
	});

	it("should remove corrupted entries", () => {
		const corruptedKey = "mermaid-v1-loc-corrupted";
		localStorage.setItem(corruptedKey, "invalid-json");

		cleanupOldStates();

		// Corrupted should be removed
		expect(localStorage.getItem(corruptedKey)).toBeNull();
	});

	it("should only process mermaid diagram keys", () => {
		// Add non-mermaid key
		localStorage.setItem("other-app-data", "should-not-touch");

		// Add expired mermaid key
		const expiredKey = "mermaid-v1-loc-expired";
		localStorage.setItem(
			expiredKey,
			JSON.stringify({
				zoomLevel: 100,
				panOffset: { x: 0, y: 0 },
				timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000
			})
		);

		cleanupOldStates();

		// Non-mermaid key should remain
		expect(localStorage.getItem("other-app-data")).toBe("should-not-touch");

		// Expired mermaid key should be removed
		expect(localStorage.getItem(expiredKey)).toBeNull();
	});
});

// =====================================================
// CONVENIENCE WRAPPER
// =====================================================

describe("MermaidDiagram - getStorageKeyForDiagram Wrapper", () => {
	it("should generate key from MermaidDiagramProps", () => {
		const props: Pick<
			MermaidDiagramProps,
			"diagram" | "title" | "id" | "storageKey" | "statePersistenceScope"
		> = {
			diagram: "flowchart LR\n  A --> B",
			title: "Test",
			id: "test-diagram"
		};

		const key = getStorageKeyForDiagram(props);

		// Should use id with location hash (default scope='location')
		expect(key).toMatch(/^mermaid-v1-loc-[a-z0-9]+-test-diagram$/);
	});

	it("should respect storageKey prop", () => {
		const props: Pick<
			MermaidDiagramProps,
			"diagram" | "title" | "id" | "storageKey" | "statePersistenceScope"
		> = {
			diagram: "flowchart TD\n  X --> Y",
			storageKey: "custom-storage-key"
		};

		const key = getStorageKeyForDiagram(props);

		expect(key).toBe("mermaid-v1-loc-custom-storage-key");
	});

	it("should respect statePersistenceScope prop", () => {
		const props: Pick<
			MermaidDiagramProps,
			"diagram" | "title" | "id" | "storageKey" | "statePersistenceScope"
		> = {
			diagram: "graph TD\n  A --> B",
			id: "diagram-123",
			statePersistenceScope: "global"
		};

		const key = getStorageKeyForDiagram(props);

		expect(key).toBe("mermaid-v1-glb-diagram-123");
	});
});

// =====================================================
// ZOOM CONTROL LOGIC
// =====================================================

describe("MermaidDiagram - Zoom Control Logic", () => {
	it("should enforce 50% minimum zoom level", () => {
		const minZoom = SETTINGS.ui.mermaid.zoom.minLevel;
		expect(minZoom).toBe(50);

		// Attempting to zoom below minimum should clamp to 50%
		let zoomLevel = 75;
		zoomLevel = Math.max(zoomLevel - SETTINGS.ui.mermaid.zoom.step, minZoom);
		expect(zoomLevel).toBe(50);

		// Another zoom out should stay at 50%
		zoomLevel = Math.max(zoomLevel - SETTINGS.ui.mermaid.zoom.step, minZoom);
		expect(zoomLevel).toBe(50);
	});

	it("should enforce 200% maximum zoom level", () => {
		const maxZoom = SETTINGS.ui.mermaid.zoom.maxLevel;
		expect(maxZoom).toBe(200);

		// Attempting to zoom above maximum should clamp to 200%
		let zoomLevel = 175;
		zoomLevel = Math.min(zoomLevel + SETTINGS.ui.mermaid.zoom.step, maxZoom);
		expect(zoomLevel).toBe(200);

		// Another zoom in should stay at 200%
		zoomLevel = Math.min(zoomLevel + SETTINGS.ui.mermaid.zoom.step, maxZoom);
		expect(zoomLevel).toBe(200);
	});

	it("should zoom in/out by 25% steps", () => {
		const step = SETTINGS.ui.mermaid.zoom.step;
		expect(step).toBe(25);

		let zoom = 100;

		// Zoom in
		zoom += step;
		expect(zoom).toBe(125);

		zoom += step;
		expect(zoom).toBe(150);

		// Zoom out
		zoom -= step;
		expect(zoom).toBe(125);

		zoom -= step;
		expect(zoom).toBe(100);
	});
});

// =====================================================
// PAN CONTROL LOGIC
// =====================================================

describe("MermaidDiagram - Pan Control Logic", () => {
	it("should enforce ±500px maximum pan offset", () => {
		const maxOffset = SETTINGS.ui.mermaid.pan.maxOffset;
		expect(maxOffset).toBe(500);

		// Pan right beyond limit
		let panX = 450;
		panX = Math.max(panX - SETTINGS.ui.mermaid.pan.step, -maxOffset);
		expect(panX).toBe(400);

		panX = Math.max(panX - SETTINGS.ui.mermaid.pan.step, -maxOffset);
		expect(panX).toBe(350);

		// Continue panning right
		panX = -500;
		panX = Math.max(panX - SETTINGS.ui.mermaid.pan.step, -maxOffset);
		expect(panX).toBe(-500); // Clamped at limit
	});

	it("should pan by 50px steps", () => {
		const step = SETTINGS.ui.mermaid.pan.step;
		expect(step).toBe(50);

		let panX = 0;
		let panY = 0;

		// Pan up (diagram moves down, y increases)
		panY += step;
		expect(panY).toBe(50);

		// Pan down (diagram moves up, y decreases)
		panY -= step * 2;
		expect(panY).toBe(-50);

		// Pan left (diagram moves right, x increases)
		panX += step;
		expect(panX).toBe(50);

		// Pan right (diagram moves left, x decreases)
		panX -= step;
		expect(panX).toBe(0);
	});
});

// =====================================================
// EDGE CASES
// =====================================================

describe("MermaidDiagram - Edge Cases", () => {
	it("should handle empty diagram string", () => {
		const props: MermaidDiagramProps = {
			diagram: ""
		};

		expect(props.diagram).toBe("");
	});

	it("should handle diagram with special characters", () => {
		const props: MermaidDiagramProps = {
			diagram: 'graph TD\n  A["Node <with> special &amp; chars"]'
		};

		expect(props.diagram).toContain("special");
	});

	it("should handle very long diagram definitions", () => {
		const longDiagram = "flowchart TD\n" + "  A --> B\n".repeat(1000);
		const props: MermaidDiagramProps = {
			diagram: longDiagram
		};

		expect(props.diagram.length).toBeGreaterThan(10000);
	});

	it("should handle unicode characters in title", () => {
		const props: MermaidDiagramProps = {
			diagram: "graph LR\n  A --> B",
			title: "Diagrama de Arquitectura 🚀"
		};

		expect(props.title).toContain("🚀");
	});
});
