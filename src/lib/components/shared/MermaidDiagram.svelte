<script lang="ts">
	/**
	 * MermaidDiagram Component (Task 8G)
	 *
	 * Production-ready diagram renderer with GitHub-style zoom controls.
	 *
	 * FEATURES:
	 * - GitHub-style zoom controls (50%-200% range, 25% steps)
	 * - IconGrid integration for consistent action buttons
	 * - Dialog expansion for full-screen viewing
	 * - Mermaid validator integration (optional)
	 * - Mobile-responsive with touch gestures
	 * - Separate inline/Dialog state (follows CodeBlock pattern)
	 *
	 * ARCHITECTURE:
	 * - Svelte 5 runes syntax ($state, $derived, $props)
	 * - SETTINGS integration (zero hardcoded values)
	 * - Type-safe props from $types
	 * - Modular CSS (NO <style> block with @apply)
	 * - IconGrid composition (not custom buttons)
	 *
	 * USAGE:
	 * ```svelte
	 * <MermaidDiagram
	 *   diagram={`flowchart LR\n  A --> B`}
	 *   title="Example Diagram"
	 *   showZoomControls={true}
	 *   showExpandButton={true}
	 * />
	 * ```
	 */
	import { onMount } from "svelte";
	// eslint-disable-next-line import/default, import/no-named-as-default, import/no-named-as-default-member
	import mermaid from "mermaid";
	import {
		ZoomIn,
		ZoomOut,
		Maximize2,
		Expand,
		Copy,
		Check,
		CloudDownload,
		ImageDown,
		MonitorDown,
		Images,
		BookCopy,
		ArrowUp,
		ArrowDown,
		ArrowLeft,
		ArrowRight
	} from "lucide-svelte";
	import type { MermaidDiagramProps, IconItem } from "$types";
	import { SETTINGS } from "$config/settings.js";
	import IconGrid from "$lib/components/shared/IconGrid.svelte";
	import { openDialog, dialogStore } from "$lib/stores/dialog";
	import MermaidFullView from "$lib/components/shared/MermaidFullView.svelte";
	import { updateZoom, resetZoom } from "$lib/stores/zoom.js";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte.js";
	import {
		saveDiagramState,
		loadDiagramState,
		getStorageKeyForDiagram
	} from "$lib/stores/diagram-persistence.js";

	/**
	 * Convert string to base64 encoding (UTF-8 safe, modern approach)
	 * Replaces deprecated pattern: btoa(unescape(encodeURIComponent(str)))
	 * @param str - String to encode
	 * @returns Base64 encoded string
	 */
	function encodeBase64(str: string): string {
		// Modern approach using TextEncoder for UTF-8 compliance
		const bytes = new TextEncoder().encode(str);
		const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
		return btoa(binString);
	}

	// Extract settings configuration (ZERO hardcoded values)
	const { mermaid: mermaidSettings } = SETTINGS.ui;

	// Responsive button defaults (mobile vs desktop discrimination)
	const isMobile = new IsMobile(); // < 768px
	const buttonDefaults = $derived(
		isMobile.current ? mermaidSettings.buttons.mobile : mermaidSettings.buttons.desktop
	);

	// Props with responsive defaults from SETTINGS (mobile vs desktop)
	// Props always have priority over SETTINGS defaults
	// NOTE: Use undefined defaults + $derived to enable reactive defaults (Svelte 5 pattern)
	let {
		diagram,
		title,
		debug = false,
		showExpandButton: _showExpandButton = undefined,
		showZoomControls: _showZoomControls = undefined,
		showDownloadButton: _showDownloadButton = undefined,
		showDownloadPngButton: _showDownloadPngButton = undefined,
		showDownloadJpgButton: _showDownloadJpgButton = undefined,
		showCopySvgButton: _showCopySvgButton = undefined,
		showCopyPngButton: _showCopyPngButton = undefined,
		showCopyCodeButton: _showCopyCodeButton = undefined,
		showValidationStatus: _showValidationStatus = false,
		validationResult: _validationResult,
		actionGridOrientation: _actionGridOrientation = undefined,
		class: className = "",
		id = undefined,
		enableStatePersistence = undefined,
		storageKey = undefined,
		statePersistenceScope = undefined
	}: MermaidDiagramProps = $props();

	// Reactive button visibility - Props as "feature enable flags"
	// ARCHITECTURE: Component ALWAYS applies viewport discrimination (mobile/desktop)
	// - If prop = undefined/true: Feature enabled, component consults buttonDefaults for viewport
	// - If prop = false: Feature explicitly disabled everywhere
	// - Logic: (prop !== false) && buttonDefaults.X
	//   → Ensures SETTINGS mobile/desktop discrimination is ALWAYS respected
	const showExpandButton = $derived(_showExpandButton !== false && buttonDefaults.showExpandButton);
	const showZoomControls = $derived(_showZoomControls !== false && buttonDefaults.showZoomControls);
	const showDownloadButton = $derived(
		_showDownloadButton !== false && buttonDefaults.showDownloadButton
	);
	const showDownloadPngButton = $derived(
		_showDownloadPngButton !== false && buttonDefaults.showDownloadPngButton
	);
	const showDownloadJpgButton = $derived(
		_showDownloadJpgButton !== false && buttonDefaults.showDownloadJpgButton
	);
	const showCopySvgButton = $derived(
		_showCopySvgButton !== false && buttonDefaults.showCopySvgButton
	);
	const showCopyPngButton = $derived(
		_showCopyPngButton !== false && buttonDefaults.showCopyPngButton
	);
	const showCopyCodeButton = $derived(
		_showCopyCodeButton !== false && buttonDefaults.showCopyCodeButton
	);

	// State persistence configuration
	const statePersistenceEnabled = $derived(
		enableStatePersistence !== false && mermaidSettings.statePersistence.enabled
	);
	const persistenceScope = $derived(
		statePersistenceScope || mermaidSettings.statePersistence.scope
	);

	// Storage key for persistence (hybrid strategy: storageKey > id > auto-hash)
	let persistenceKey = $state("");
	const { zoom: zoomConfig, pan: panConfig, actionButtons: btnConfig } = mermaidSettings;

	// State management (Svelte 5 runes)
	let highlightedDiagram = $state("");
	let isLoading = $state(true);
	let renderError = $state<string | null>(null);

	// Inline mode zoom state (separate from Dialog)
	let zoomLevel = $state(zoomConfig.defaultLevel);
	let panOffset = $state({ x: 0, y: 0 });

	// Dialog mode zoom state (separate state like CodeBlock copy feedback)
	let dialogZoomLevel = $state(zoomConfig.defaultLevel);
	let dialogPanOffset = $state({ x: 0, y: 0 });

	// Inline mode copy state (separate state for each copy operation)
	let copySvgSuccess = $state(false);
	let copyPngSuccess = $state(false);
	let copyCodeSuccess = $state(false);

	// Dialog mode copy state (separate state for each copy operation)
	let dialogCopySvgSuccess = $state(false);
	let dialogCopyPngSuccess = $state(false);
	let dialogCopyCodeSuccess = $state(false);

	// Derived inline mode copy feedback state
	let _copySvgIcon = $derived(copySvgSuccess ? Check : Copy);
	let _copySvgLabel = $derived(copySvgSuccess ? "Copied!" : "Copy SVG");
	let copySvgState = $derived<"success" | "default">(copySvgSuccess ? "success" : "default");

	let _copyPngIcon = $derived(copyPngSuccess ? Check : Copy);
	let _copyPngLabel = $derived(copyPngSuccess ? "Copied!" : "Copy PNG");
	let copyPngState = $derived<"success" | "default">(copyPngSuccess ? "success" : "default");

	let _copyCodeIcon = $derived(copyCodeSuccess ? Check : Copy);
	let _copyCodeLabel = $derived(copyCodeSuccess ? "Copied!" : "Copy Code");
	let copyCodeState = $derived<"success" | "default">(copyCodeSuccess ? "success" : "default");

	// Derived Dialog mode copy feedback state
	// Uses format-specific icons for better visual distinction
	let dialogCopySvgIcon = $derived(dialogCopySvgSuccess ? Check : Copy);
	let dialogCopySvgLabel = $derived(dialogCopySvgSuccess ? "Copied!" : "Copy SVG");
	let dialogCopySvgState = $derived<"success" | "default">(
		dialogCopySvgSuccess ? "success" : "default"
	);

	let dialogCopyPngIcon = $derived(dialogCopyPngSuccess ? Check : Images);
	let dialogCopyPngLabel = $derived(dialogCopyPngSuccess ? "Copied!" : "Copy PNG");
	let dialogCopyPngState = $derived<"success" | "default">(
		dialogCopyPngSuccess ? "success" : "default"
	);

	let dialogCopyCodeIcon = $derived(dialogCopyCodeSuccess ? Check : BookCopy);
	let dialogCopyCodeLabel = $derived(dialogCopyCodeSuccess ? "Copied!" : "Copy Code");
	let dialogCopyCodeState = $derived<"success" | "default">(
		dialogCopyCodeSuccess ? "success" : "default"
	);

	// Derived zoom transform for inline mode
	// CRITICAL: translate() BEFORE scale() so pan is independent of zoom level
	const zoomTransform = $derived(
		`translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel / 100})`
	);

	// Unique element ID for Mermaid rendering
	const mermaidElementId = $derived(id || `mermaid-${Math.random().toString(36).slice(2, 9)}`);

	/**
	 * Initialize Mermaid on component mount
	 */
	onMount(async () => {
		try {
			// Generate storage key for persistence
			persistenceKey = getStorageKeyForDiagram({
				diagram,
				title,
				id,
				storageKey,
				statePersistenceScope: persistenceScope
			});

			// Load persisted state if enabled
			if (statePersistenceEnabled) {
				const savedState = loadDiagramState(persistenceKey);
				if (savedState) {
					zoomLevel = savedState.zoomLevel;
					panOffset = savedState.panOffset;

					if (debug || mermaidSettings.debug) {
						console.info(
							`[MermaidDiagram] Restored state: zoom=${savedState.zoomLevel}%, pan=(${savedState.panOffset.x}, ${savedState.panOffset.y})`
						);
					}
				}
			}

			// Initialize Mermaid with settings
			// Production: Only fatal errors (suppress warnings/logs for mobile performance)
			// Development: Full debug mode for troubleshooting
			const isDev = typeof window !== "undefined" && window.location.hostname === "localhost";
			mermaid.initialize({
				startOnLoad: false,
				theme: "default",
				securityLevel: "loose",
				fontFamily: "inherit",
				fontSize: 14,
				logLevel: isDev ? "debug" : "fatal",
				suppressErrorRendering: !isDev,
				flowchart: { useMaxWidth: true, htmlLabels: true },
				sequence: { useMaxWidth: true, wrap: true }
			});

			await renderDiagram();
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : "Unknown error";
			console.error(`[MermaidDiagram] Initialization failed: ${errorMsg}`);
			renderError = `Diagram rendering failed: ${errorMsg}`;
		} finally {
			isLoading = false;
		}
	});

	/**
	 * Auto-save state on zoom/pan changes (debounced 1s)
	 * Uses $effect for reactive tracking of zoomLevel and panOffset
	 */
	let saveTimeout: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		// Skip if persistence disabled or diagram not yet loaded
		if (!statePersistenceEnabled || !persistenceKey || isLoading) return;

		// Track reactive dependencies (zoom/pan)
		const currentZoom = zoomLevel;
		const currentPan = panOffset;

		// Debounced save (1s delay after last change)
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			saveDiagramState(persistenceKey, {
				zoomLevel: currentZoom,
				panOffset: currentPan
			});

			if (debug || mermaidSettings.debug) {
				console.info(
					`[MermaidDiagram] Auto-saved state: zoom=${currentZoom}%, pan=(${currentPan.x}, ${currentPan.y})`
				);
			}
		}, 1000);

		// Cleanup on effect teardown
		return () => {
			clearTimeout(saveTimeout);
		};
	});

	/**
	 * Render diagram with Mermaid
	 * Uses stateless mermaid.render() API
	 */
	async function renderDiagram() {
		try {
			// Render diagram to SVG
			const { svg } = await mermaid.render(mermaidElementId, diagram);
			highlightedDiagram = svg;

			// Cleanup: Remove orphaned DOM elements created by Mermaid
			const orphanedElement = document.getElementById(mermaidElementId);
			if (orphanedElement) {
				orphanedElement.remove();
			}
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : "Unknown error";
			console.error(`[MermaidDiagram] Rendering failed: ${errorMsg}`);
			renderError = `Invalid diagram syntax: ${errorMsg}`;
			throw error;
		}
	}

	/**
	 * Zoom In Handler (inline mode)
	 */
	function handleZoomIn() {
		zoomLevel = Math.min(zoomLevel + zoomConfig.step, zoomConfig.maxLevel);
	}

	/**
	 * Zoom Out Handler (inline mode)
	 */
	function handleZoomOut() {
		zoomLevel = Math.max(zoomLevel - zoomConfig.step, zoomConfig.minLevel);
	}

	/**
	 * Reset Zoom Handler (inline mode)
	 */
	function handleZoomReset() {
		zoomLevel = zoomConfig.defaultLevel;
		panOffset = { x: 0, y: 0 };
	}

	/**
	 * Pan Up Handler (inline mode)
	 * User presses ↑ → shows upper part of diagram → viewport goes up → diagram moves down
	 */
	function handlePanUp() {
		panOffset = {
			...panOffset,
			y: Math.min(panOffset.y + panConfig.step, panConfig.maxOffset)
		};
	}

	/**
	 * Pan Down Handler (inline mode)
	 * User presses ↓ → shows lower part of diagram → viewport goes down → diagram moves up
	 */
	function handlePanDown() {
		panOffset = {
			...panOffset,
			y: Math.max(panOffset.y - panConfig.step, -panConfig.maxOffset)
		};
	}

	/**
	 * Pan Left Handler (inline mode)
	 * User presses ← → shows left part of diagram → viewport goes left → diagram moves right
	 */
	function handlePanLeft() {
		panOffset = {
			...panOffset,
			x: Math.min(panOffset.x + panConfig.step, panConfig.maxOffset)
		};
	}

	/**
	 * Pan Right Handler (inline mode)
	 * User presses → → shows right part of diagram → viewport goes right → diagram moves left
	 */
	function handlePanRight() {
		panOffset = {
			...panOffset,
			x: Math.max(panOffset.x - panConfig.step, -panConfig.maxOffset)
		};
	}

	// =========================================================================================
	// PINCH-TO-ZOOM GESTURE HANDLERS (Task 8G - Mobile Touch Interactions)
	// =========================================================================================

	/**
	 * Pinch-to-zoom state tracking
	 * - Tracks initial touch points for distance calculation
	 * - Tracks initial zoom level to apply delta
	 */
	let touchState = $state<{
		initialDistance: number | null;
		initialZoom: number | null;
	}>({
		initialDistance: null,
		initialZoom: null
	});

	/**
	 * Calculate distance between two touch points (Pythagorean theorem)
	 */
	function getTouchDistance(touch1: Touch, touch2: Touch): number {
		const dx = touch1.clientX - touch2.clientX;
		const dy = touch1.clientY - touch2.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	/**
	 * Handle pinch-to-zoom start (touchstart with 2 fingers)
	 */
	function handleTouchStart(event: TouchEvent) {
		if (!zoomConfig.enablePinchGestures) return;

		// Only handle two-finger touches for pinch
		if (event.touches.length === 2) {
			event.preventDefault();

			const touch1 = event.touches[0];
			const touch2 = event.touches[1];

			touchState.initialDistance = getTouchDistance(touch1, touch2);
			touchState.initialZoom = zoomLevel;
		}
	}

	/**
	 * Handle pinch-to-zoom move (touchmove with 2 fingers)
	 * Applies zoom based on distance delta with sensitivity factor
	 */
	function handleTouchMove(event: TouchEvent) {
		if (!zoomConfig.enablePinchGestures) return;

		if (event.touches.length === 2 && touchState.initialDistance && touchState.initialZoom) {
			event.preventDefault();

			const touch1 = event.touches[0];
			const touch2 = event.touches[1];
			const currentDistance = getTouchDistance(touch1, touch2);

			// Calculate zoom delta based on distance change
			// Sensitivity: 0.5 = moderate (100px distance change = 50% zoom change)
			const sensitivity = 0.5;
			const distanceDelta = currentDistance - touchState.initialDistance;
			const zoomDelta = (distanceDelta / touchState.initialDistance) * 100 * sensitivity;

			// Apply zoom with limits
			const newZoom = touchState.initialZoom + zoomDelta;
			zoomLevel = Math.max(zoomConfig.minLevel, Math.min(zoomConfig.maxLevel, newZoom));
		}
	}

	/**
	 * Handle pinch-to-zoom end (touchend)
	 * Resets touch state
	 */
	function handleTouchEnd() {
		if (!zoomConfig.enablePinchGestures) return;

		touchState.initialDistance = null;
		touchState.initialZoom = null;
	}

	// =========================================================================================
	// MOUSE WHEEL ZOOM HANDLER (Task 8G - Desktop Interactions)
	// =========================================================================================

	/**
	 * Handle mouse wheel zoom (desktop)
	 * Standard UX: Ctrl+Wheel = zoom, Wheel = scroll
	 * Sensitivity: 10 delta units = 1% zoom change
	 */
	function handleWheel(event: WheelEvent) {
		if (!zoomConfig.enableMouseWheel) return;

		// Only zoom when Ctrl key is pressed (standard pattern)
		if (event.ctrlKey || event.metaKey) {
			event.preventDefault();

			// Normalize wheel delta (different browsers use different scales)
			// Positive deltaY = wheel down = zoom out
			// Negative deltaY = wheel up = zoom in
			const sensitivity = 0.1; // 10 delta units = 1% zoom
			const zoomDelta = -event.deltaY * sensitivity;

			const newZoom = zoomLevel + zoomDelta;
			zoomLevel = Math.max(zoomConfig.minLevel, Math.min(zoomConfig.maxLevel, newZoom));
		}
	}

	// =========================================================================================
	// ZOOM LEVEL DISPLAY INDICATOR (Task 8G - Visual Feedback)
	// =========================================================================================

	/**
	 * Zoom indicator visibility state
	 * - Shows when zoom changes
	 * - Fades after 2 seconds
	 */
	let showZoomIndicator = $state(false);
	let zoomIndicatorTimeout: ReturnType<typeof setTimeout> | undefined;

	/**
	 * Effect to show zoom indicator when zoom level changes
	 * Auto-hides after 2 seconds
	 */
	$effect(() => {
		// Trigger on zoom level change (track dependency)
		const currentZoom = zoomLevel;

		// Skip indicator on initial mount (100% default)
		if (currentZoom === zoomConfig.defaultLevel && !zoomIndicatorTimeout) {
			return;
		}

		// Show indicator
		showZoomIndicator = true;

		// Clear existing timeout
		if (zoomIndicatorTimeout) {
			clearTimeout(zoomIndicatorTimeout);
		}

		// Hide after 2 seconds
		zoomIndicatorTimeout = setTimeout(() => {
			showZoomIndicator = false;
			zoomIndicatorTimeout = undefined;
		}, 2000);

		// Cleanup on effect disposal
		return () => {
			if (zoomIndicatorTimeout) {
				clearTimeout(zoomIndicatorTimeout);
			}
		};
	});

	// =========================================================================================
	// KEYBOARD CONTROLS HANDLER (Task 8G - Accessibility)
	// =========================================================================================

	/**
	 * Handle keyboard shortcuts for zoom and pan
	 * Zoom: +/= (in), -/_ (out), 0 (reset)
	 * Pan: Arrow keys (step), Shift+Arrow (faster)
	 */
	function handleKeyDown(event: KeyboardEvent) {
		// Only handle if diagram container or child has focus
		const target = event.target as HTMLElement;
		const diagramContainer = target.closest(".mermaid-diagram-container");
		if (!diagramContainer) return;

		const key = event.key;
		const shiftPressed = event.shiftKey;

		// Zoom controls
		if (key === "+" || key === "=") {
			event.preventDefault();
			handleZoomIn();
		} else if (key === "-" || key === "_") {
			event.preventDefault();
			handleZoomOut();
		} else if (key === "0") {
			event.preventDefault();
			handleZoomReset();
		}
		// Pan controls (with Shift modifier for faster panning)
		else if (key === "ArrowUp") {
			event.preventDefault();
			const step = shiftPressed ? panConfig.step * 2 : panConfig.step;
			panOffset = {
				...panOffset,
				y: Math.min(panOffset.y + step, panConfig.maxOffset)
			};
		} else if (key === "ArrowDown") {
			event.preventDefault();
			const step = shiftPressed ? panConfig.step * 2 : panConfig.step;
			panOffset = {
				...panOffset,
				y: Math.max(panOffset.y - step, -panConfig.maxOffset)
			};
		} else if (key === "ArrowLeft") {
			event.preventDefault();
			const step = shiftPressed ? panConfig.step * 2 : panConfig.step;
			panOffset = {
				...panOffset,
				x: Math.min(panOffset.x + step, panConfig.maxOffset)
			};
		} else if (key === "ArrowRight") {
			event.preventDefault();
			const step = shiftPressed ? panConfig.step * 2 : panConfig.step;
			panOffset = {
				...panOffset,
				x: Math.max(panOffset.x - step, -panConfig.maxOffset)
			};
		}
	}

	/**
	 * Zoom In Handler (Dialog mode)
	 * Updates zoom store for reactive propagation to MermaidFullView
	 */
	function handleDialogZoomIn() {
		const newLevel = Math.min(dialogZoomLevel + zoomConfig.step, zoomConfig.maxLevel);
		dialogZoomLevel = newLevel;
		updateZoom({ level: newLevel });
		updateDialogActionButtons();
	}

	/**
	 * Zoom Out Handler (Dialog mode)
	 * Updates zoom store for reactive propagation to MermaidFullView
	 */
	function handleDialogZoomOut() {
		const newLevel = Math.max(dialogZoomLevel - zoomConfig.step, zoomConfig.minLevel);
		dialogZoomLevel = newLevel;
		updateZoom({ level: newLevel });
		updateDialogActionButtons();
	}

	/**
	 * Reset Zoom Handler (Dialog mode)
	 * Updates zoom store for reactive propagation to MermaidFullView
	 */
	function handleDialogZoomReset() {
		dialogZoomLevel = zoomConfig.defaultLevel;
		dialogPanOffset = { x: 0, y: 0 };
		resetZoom();
		updateDialogActionButtons();
	}

	/**
	 * Pan Up Handler (Dialog mode)
	 * User presses ↑ → shows upper part of diagram → viewport goes up → diagram moves down
	 * Updates zoom store for reactive propagation to MermaidFullView
	 */
	function handleDialogPanUp() {
		const newY = Math.min(dialogPanOffset.y + panConfig.step, panConfig.maxOffset);
		dialogPanOffset = { ...dialogPanOffset, y: newY };
		updateZoom({ panOffset: dialogPanOffset });
		updateDialogActionButtons();
	}

	/**
	 * Pan Down Handler (Dialog mode)
	 * User presses ↓ → shows lower part of diagram → viewport goes down → diagram moves up
	 * Updates zoom store for reactive propagation to MermaidFullView
	 */
	function handleDialogPanDown() {
		const newY = Math.max(dialogPanOffset.y - panConfig.step, -panConfig.maxOffset);
		dialogPanOffset = { ...dialogPanOffset, y: newY };
		updateZoom({ panOffset: dialogPanOffset });
		updateDialogActionButtons();
	}

	/**
	 * Pan Left Handler (Dialog mode)
	 * User presses ← → shows left part of diagram → viewport goes left → diagram moves right
	 * Updates zoom store for reactive propagation to MermaidFullView
	 */
	function handleDialogPanLeft() {
		const newX = Math.min(dialogPanOffset.x + panConfig.step, panConfig.maxOffset);
		dialogPanOffset = { ...dialogPanOffset, x: newX };
		updateZoom({ panOffset: dialogPanOffset });
		updateDialogActionButtons();
	}

	/**
	 * Pan Right Handler (Dialog mode)
	 * User presses → → shows right part of diagram → viewport goes right → diagram moves left
	 * Updates zoom store for reactive propagation to MermaidFullView
	 */
	function handleDialogPanRight() {
		const newX = Math.max(dialogPanOffset.x - panConfig.step, -panConfig.maxOffset);
		dialogPanOffset = { ...dialogPanOffset, x: newX };
		updateZoom({ panOffset: dialogPanOffset });
		updateDialogActionButtons();
	}

	/**
	 * Update Dialog action buttons with current reactive state
	 * Dual-group mode: Updates BOTH topActionButtons (copy feedback) AND bottomActionButtons (zoom/pan)
	 */
	function updateDialogActionButtons() {
		dialogStore.update((state) => {
			let updatedState = { ...state };

			// Update top action buttons (Download + Copy buttons with success feedback)
			if (state.topActionButtons) {
				const updatedTopIcons = state.topActionButtons.icons
					.map((btn) => {
						if (!btn) return null; // Handle null cells in grid

						if (btn.id === "copy-svg") {
							return {
								...btn,
								icon: dialogCopySvgIcon,
								label: dialogCopySvgLabel,
								state: dialogCopySvgState
							};
						}
						if (btn.id === "copy-png") {
							return {
								...btn,
								icon: dialogCopyPngIcon,
								label: dialogCopyPngLabel,
								state: dialogCopyPngState
							};
						}
						if (btn.id === "copy-code") {
							return {
								...btn,
								icon: dialogCopyCodeIcon,
								label: dialogCopyCodeLabel,
								state: dialogCopyCodeState
							};
						}
						return btn;
					})
					.filter((btn): btn is IconItem => btn !== null);

				updatedState = {
					...updatedState,
					topActionButtons: {
						...state.topActionButtons,
						icons: updatedTopIcons
					}
				};
			}

			// Update bottom action buttons (3×3 grid) - Rebuild using factory for DRY compliance
			if (state.bottomActionButtons) {
				const updatedBottomIcons = buildZoomPanButtons("dialog");

				updatedState = {
					...updatedState,
					bottomActionButtons: {
						...state.bottomActionButtons,
						icons: updatedBottomIcons
					}
				};
			}

			return updatedState;
		});
	}

	/**
	 * Download diagram as SVG file
	 */
	function handleDownload() {
		const blob = new Blob([highlightedDiagram], { type: "image/svg+xml" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = title ? `${title.replace(/\s+/g, "-").toLowerCase()}.svg` : "diagram.svg";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	/**
	 * Download diagram as PNG file
	 * Uses convertSvgToPngBlob helper for SVG → Canvas → PNG conversion
	 */
	async function handleDownloadPng() {
		try {
			const pngBlob = await convertSvgToPngBlob();
			const url = URL.createObjectURL(pngBlob);
			const a = document.createElement("a");
			a.href = url;
			a.download = title ? `${title.replace(/\s+/g, "-").toLowerCase()}.png` : "diagram.png";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to download PNG:", error);
		}
	}

	/**
	 * Download diagram as JPG file
	 * Uses convertSvgToImageBlob helper for SVG → Canvas → JPG conversion
	 * JPG format offers smaller file sizes but no transparency (white background)
	 */
	async function handleDownloadJpg() {
		try {
			const jpgBlob = await convertSvgToJpgBlob();
			const url = URL.createObjectURL(jpgBlob);
			const a = document.createElement("a");
			a.href = url;
			a.download = title ? `${title.replace(/\s+/g, "-").toLowerCase()}.jpg` : "diagram.jpg";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to download JPG:", error);
		}
	}

	/**
	 * Copy diagram as SVG text to clipboard (inline mode)
	 * SVG can be pasted into code editors, XML tools, etc.
	 */
	async function handleCopySvg() {
		try {
			await navigator.clipboard.writeText(highlightedDiagram);
			copySvgSuccess = true;

			// Reset after configured duration
			setTimeout(() => {
				copySvgSuccess = false;
			}, mermaidSettings.copyFeedback.duration);
		} catch (error) {
			console.error("Failed to copy SVG:", error);
		}
	}

	/**
	 * Copy diagram as PNG image to clipboard (inline mode)
	 * Requires SVG → Canvas → Blob conversion
	 *
	 * NOTE: Feature detection via isClipboardImageSupported()
	 * PNG is the only sanitized image format supported by ClipboardItem API
	 */
	async function handleCopyPng() {
		if (!isClipboardImageSupported()) {
			console.warn("Clipboard image copy not supported in this browser");
			return;
		}

		try {
			const pngBlob = await convertSvgToPngBlob();

			// Copy to clipboard using ClipboardItem API
			await navigator.clipboard.write([
				new ClipboardItem({
					"image/png": pngBlob
				})
			]);

			copyPngSuccess = true;

			// Reset after configured duration
			setTimeout(() => {
				copyPngSuccess = false;
			}, mermaidSettings.copyFeedback.duration);
		} catch (error) {
			console.error("Failed to copy PNG:", error);
		}
	}

	/**
	 * Copy Mermaid DSL source code to clipboard (inline mode)
	 * Allows users to copy the diagram definition for editing/sharing
	 */
	async function handleCopyCode() {
		try {
			await navigator.clipboard.writeText(diagram);
			copyCodeSuccess = true;

			// Reset after configured duration
			setTimeout(() => {
				copyCodeSuccess = false;
			}, mermaidSettings.copyFeedback.duration);
		} catch (error) {
			console.error("Failed to copy code:", error);
		}
	}

	/**
	 * Copy SVG to clipboard (Dialog mode)
	 * Updates dialogStore to trigger reactive UI changes
	 */
	async function handleDialogCopySvg() {
		try {
			await navigator.clipboard.writeText(highlightedDiagram);
			dialogCopySvgSuccess = true;

			// Update dialogStore to reflect success state
			updateDialogActionButtons();

			// Reset after configured duration
			setTimeout(() => {
				dialogCopySvgSuccess = false;
				updateDialogActionButtons();
			}, mermaidSettings.copyFeedback.duration);
		} catch (error) {
			console.error("Failed to copy SVG:", error);
		}
	}

	/**
	 * Copy PNG to clipboard (Dialog mode)
	 */
	async function handleDialogCopyPng() {
		if (!isClipboardImageSupported()) {
			console.warn("Clipboard image copy not supported in this browser");
			return;
		}

		try {
			const pngBlob = await convertSvgToPngBlob();

			await navigator.clipboard.write([
				new ClipboardItem({
					"image/png": pngBlob
				})
			]);

			dialogCopyPngSuccess = true;
			updateDialogActionButtons();

			setTimeout(() => {
				dialogCopyPngSuccess = false;
				updateDialogActionButtons();
			}, mermaidSettings.copyFeedback.duration);
		} catch (error) {
			console.error("Failed to copy PNG:", error);
		}
	}

	/**
	 * Copy Code to clipboard (Dialog mode)
	 */
	async function handleDialogCopyCode() {
		try {
			await navigator.clipboard.writeText(diagram);
			dialogCopyCodeSuccess = true;

			updateDialogActionButtons();

			setTimeout(() => {
				dialogCopyCodeSuccess = false;
				updateDialogActionButtons();
			}, mermaidSettings.copyFeedback.duration);
		} catch (error) {
			console.error("Failed to copy code:", error);
		}
	}

	/**
	 * Helper: Convert SVG to PNG blob
	 * Uses data URL instead of blob URL to avoid CORS issues
	 * Shared by copy and download PNG functions
	 *
	 * CRITICAL FIX: Data URLs prevent canvas tainting from Mermaid SVG
	 * which can contain foreignObject elements or external references
	 *
	 * @returns PNG Blob for clipboard or download
	 */
	async function convertSvgToPngBlob(): Promise<Blob> {
		// Parse SVG to get dimensions
		const parser = new DOMParser();
		const svgDoc = parser.parseFromString(highlightedDiagram, "image/svg+xml");
		const svgElement = svgDoc.querySelector("svg");

		if (!svgElement) {
			throw new Error("Invalid SVG element");
		}

		// Extract dimensions (use viewBox or width/height attributes)
		const viewBox = svgElement.getAttribute("viewBox");
		let width = 800; // Default fallback
		let height = 600;

		if (viewBox) {
			const [, , w, h] = viewBox.split(" ").map(Number);
			width = w;
			height = h;
		} else {
			width = parseInt(svgElement.getAttribute("width") || "800");
			height = parseInt(svgElement.getAttribute("height") || "600");
		}

		// Create canvas with 2x scale for retina displays
		const scale = 2;
		const canvas = document.createElement("canvas");
		canvas.width = width * scale;
		canvas.height = height * scale;
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("Canvas context not available");
		}

		// Scale for high DPI
		ctx.scale(scale, scale);

		// Create image from SVG using data URL (avoids CORS tainting)
		const img = new Image();
		const svgString = new XMLSerializer().serializeToString(svgElement);
		const svgDataUrl = `data:image/svg+xml;base64,${encodeBase64(svgString)}`;

		// Wait for image to load
		await new Promise<void>((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = () => reject(new Error("Failed to load SVG image"));
			img.src = svgDataUrl; // Data URL instead of blob URL
		});

		// Draw image to canvas
		ctx.drawImage(img, 0, 0, width, height);

		// Convert canvas to PNG blob
		const blob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(blob) => {
					if (blob) resolve(blob);
					else reject(new Error("Failed to create PNG blob"));
				},
				"image/png" // Always PNG
			);
		});

		return blob;
	}

	/**
	 * Helper: Convert SVG to JPG blob
	 * Similar to convertSvgToPngBlob but with white background (JPG has no transparency)
	 * Uses data URL instead of blob URL to avoid CORS issues
	 *
	 * @returns JPG Blob for download
	 */
	async function convertSvgToJpgBlob(): Promise<Blob> {
		// Parse SVG to get dimensions
		const parser = new DOMParser();
		const svgDoc = parser.parseFromString(highlightedDiagram, "image/svg+xml");
		const svgElement = svgDoc.querySelector("svg");

		if (!svgElement) {
			throw new Error("Invalid SVG element");
		}

		// Extract dimensions (use viewBox or width/height attributes)
		const viewBox = svgElement.getAttribute("viewBox");
		let width = 800; // Default fallback
		let height = 600;

		if (viewBox) {
			const [, , w, h] = viewBox.split(" ").map(Number);
			width = w;
			height = h;
		} else {
			width = parseInt(svgElement.getAttribute("width") || "800");
			height = parseInt(svgElement.getAttribute("height") || "600");
		}

		// Create canvas with 2x scale for retina displays
		const scale = 2;
		const canvas = document.createElement("canvas");
		canvas.width = width * scale;
		canvas.height = height * scale;
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("Canvas context not available");
		}

		// Scale for high DPI
		ctx.scale(scale, scale);

		// Fill white background (JPG doesn't support transparency)
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, width, height);

		// Create image from SVG using data URL (avoids CORS tainting)
		const img = new Image();
		const svgString = new XMLSerializer().serializeToString(svgElement);
		const svgDataUrl = `data:image/svg+xml;base64,${encodeBase64(svgString)}`;

		// Wait for image to load
		await new Promise<void>((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = () => reject(new Error("Failed to load SVG image"));
			img.src = svgDataUrl; // Data URL instead of blob URL
		});

		// Draw image to canvas (on top of white background)
		ctx.drawImage(img, 0, 0, width, height);

		// Convert canvas to JPG blob with quality 0.9
		const blob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(blob) => {
					if (blob) resolve(blob);
					else reject(new Error("Failed to create JPG blob"));
				},
				"image/jpeg", // JPG format
				0.9 // Quality: 0.0 to 1.0 (0.9 = high quality, smaller than PNG)
			);
		});

		return blob;
	}

	/**
	 * Feature detection: Check if clipboard image copy is supported
	 * PNG copy requires ClipboardItem API with image/png support
	 *
	 * @returns true if browser supports copying PNG to clipboard
	 */
	function isClipboardImageSupported(): boolean {
		return (
			"ClipboardItem" in window &&
			typeof ClipboardItem.supports === "function" &&
			ClipboardItem.supports("image/png")
		);
	}

	/**
	 * Factory function: Build top action buttons (copy/download for all formats)
	 * Single source of truth for both inline and dialog modes
	 * Respects responsive visibility props (mobile/desktop discrimination)
	 *
	 * @param mode - 'inline' or 'dialog' (affects reactive state references)
	 * @param includeExpand - Whether to include Expand button (only for inline mode)
	 * @returns Array of IconItem or null (null = empty cell for grid layout)
	 */
	function buildTopActionButtons(options: {
		mode: "inline" | "dialog";
		includeExpand: boolean;
	}): (IconItem | null)[] {
		const { mode, includeExpand } = options;
		const buttons: (IconItem | null)[] = [];

		// Row 1: SVG Format - Copy | Download
		if (showCopySvgButton) {
			buttons.push({
				id: "copy-svg",
				icon: mode === "inline" ? (copySvgSuccess ? Check : Copy) : dialogCopySvgIcon,
				label: mode === "inline" ? (copySvgSuccess ? "Copied!" : "Copy SVG") : dialogCopySvgLabel,
				onClick: mode === "inline" ? handleCopySvg : handleDialogCopySvg,
				variant: "subtle" as const,
				state: mode === "inline" ? copySvgState : dialogCopySvgState,
				badge: "SVG",
				badgeLayer: "behind",
				badgeOffset: "12px"
			});
		}

		if (showDownloadButton) {
			buttons.push({
				id: "download-svg",
				icon: CloudDownload,
				label: "Download SVG",
				onClick: handleDownload,
				variant: "subtle" as const,
				badge: "SVG",
				badgeLayer: "behind",
				badgeOffset: "12px"
			});
		}

		// Row 2: PNG Format - Copy | Download
		if (showCopyPngButton) {
			buttons.push({
				id: "copy-png",
				icon: mode === "inline" ? (copyPngSuccess ? Check : Images) : dialogCopyPngIcon,
				label: mode === "inline" ? (copyPngSuccess ? "Copied!" : "Copy PNG") : dialogCopyPngLabel,
				onClick: mode === "inline" ? handleCopyPng : handleDialogCopyPng,
				variant: "subtle" as const,
				state: mode === "inline" ? copyPngState : dialogCopyPngState,
				disabled: !isClipboardImageSupported(),
				badge: "PNG",
				badgeLayer: "behind",
				badgeOffset: "12px"
			});
		}

		if (showDownloadPngButton) {
			buttons.push({
				id: "download-png",
				icon: ImageDown,
				label: "Download PNG",
				onClick: handleDownloadPng,
				variant: "subtle" as const,
				badge: "PNG",
				badgeLayer: "behind",
				badgeOffset: "12px"
			});
		}

		// Row 3: Code Format - Copy | JPG Download
		if (showCopyCodeButton) {
			buttons.push({
				id: "copy-code",
				icon: mode === "inline" ? (copyCodeSuccess ? Check : BookCopy) : dialogCopyCodeIcon,
				label:
					mode === "inline" ? (copyCodeSuccess ? "Copied!" : "Copy Code") : dialogCopyCodeLabel,
				onClick: mode === "inline" ? handleCopyCode : handleDialogCopyCode,
				variant: "subtle" as const,
				state: mode === "inline" ? copyCodeState : dialogCopyCodeState,
				badge: "CODE",
				badgeLayer: "behind",
				badgeOffset: "12px"
			});
		}

		if (showDownloadJpgButton) {
			buttons.push({
				id: "download-jpg",
				icon: MonitorDown,
				label: "Download JPG",
				onClick: handleDownloadJpg,
				variant: "subtle" as const,
				badge: "JPG",
				badgeLayer: "behind",
				badgeOffset: "12px"
			});
		}

		// Row 4: Empty | Expand (only inline mode)
		if (includeExpand) {
			buttons.push(null); // Empty cell for grid layout
			if (showExpandButton) {
				buttons.push({
					id: "expand",
					icon: Expand,
					label: "Expand Diagram",
					onClick: handleExpand,
					variant: "subtle" as const
				});
			}
		}

		return buttons;
	}

	/**
	 * Factory function: Build zoom/pan 3×3 grid buttons
	 * Single source of truth for both inline and dialog modes
	 * Respects showZoomControls prop (returns empty if disabled)
	 *
	 * @param mode - 'inline' or 'dialog' (affects state and handlers)
	 * @returns 3×3 grid array with null cells for layout structure
	 */
	function buildZoomPanButtons(mode: "inline" | "dialog"): (IconItem | null)[] {
		// Respect showZoomControls prop - return empty if disabled
		if (!showZoomControls) return [];

		// Select appropriate state based on mode
		const currentZoomLevel = mode === "inline" ? zoomLevel : dialogZoomLevel;
		const currentPanOffset = mode === "inline" ? panOffset : dialogPanOffset;

		// Select appropriate handlers based on mode
		const handlers =
			mode === "inline"
				? {
						panUp: handlePanUp,
						panDown: handlePanDown,
						panLeft: handlePanLeft,
						panRight: handlePanRight,
						zoomIn: handleZoomIn,
						zoomOut: handleZoomOut,
						zoomReset: handleZoomReset
					}
				: {
						panUp: handleDialogPanUp,
						panDown: handleDialogPanDown,
						panLeft: handleDialogPanLeft,
						panRight: handleDialogPanRight,
						zoomIn: handleDialogZoomIn,
						zoomOut: handleDialogZoomOut,
						zoomReset: handleDialogZoomReset
					};

		// GitHub-style 3×3 grid layout:
		// Row 1: [empty], pan-up, zoom-in
		// Row 2: pan-left, zoom-reset, pan-right
		// Row 3: [empty], pan-down, zoom-out
		return [
			// Row 1
			null,
			{
				id: "pan-up",
				icon: ArrowUp,
				label: "Pan Up",
				onClick: handlers.panUp,
				variant: "subtle" as const,
				disabled: currentPanOffset.y >= panConfig.maxOffset
			},
			{
				id: "zoom-in",
				icon: ZoomIn,
				label: "Zoom In (+25%)",
				onClick: handlers.zoomIn,
				variant: "subtle" as const,
				disabled: currentZoomLevel >= zoomConfig.maxLevel
			},
			// Row 2
			{
				id: "pan-left",
				icon: ArrowLeft,
				label: "Pan Left",
				onClick: handlers.panLeft,
				variant: "subtle" as const,
				disabled: currentPanOffset.x >= panConfig.maxOffset
			},
			{
				id: "zoom-reset",
				icon: Maximize2,
				label: "Reset Zoom (100%)",
				onClick: handlers.zoomReset,
				variant: "subtle" as const,
				disabled:
					currentZoomLevel === zoomConfig.defaultLevel &&
					currentPanOffset.x === 0 &&
					currentPanOffset.y === 0
			},
			{
				id: "pan-right",
				icon: ArrowRight,
				label: "Pan Right",
				onClick: handlers.panRight,
				variant: "subtle" as const,
				disabled: currentPanOffset.x <= -panConfig.maxOffset
			},
			// Row 3
			null,
			{
				id: "pan-down",
				icon: ArrowDown,
				label: "Pan Down",
				onClick: handlers.panDown,
				variant: "subtle" as const,
				disabled: currentPanOffset.y <= -panConfig.maxOffset
			},
			{
				id: "zoom-out",
				icon: ZoomOut,
				label: "Zoom Out (-25%)",
				onClick: handlers.zoomOut,
				variant: "subtle" as const,
				disabled: currentZoomLevel <= zoomConfig.minLevel
			}
		];
	}

	/**
	 * Expand diagram to full-screen Dialog
	 * Follows CodeBlock.svelte handleExpand() pattern exactly
	 *
	 * CRITICAL: Initialize zoom store before opening Dialog to establish
	 * reactive connection between parent state and Dialog content
	 */
	function handleExpand() {
		// Initialize zoom store with current state
		updateZoom({ level: dialogZoomLevel, panOffset: dialogPanOffset });

		// Build action buttons for Dialog using factory functions
		// Respects responsive visibility props (mobile/desktop discrimination)
		const topDialogButtons = buildTopActionButtons({
			mode: "dialog",
			includeExpand: false // No Expand button in dialog (already fullscreen)
		});

		// Dynamic orientation strategy (same rule as inline mode)
		// Rule: >4 buttons = Grid 2×N, ≤4 buttons = Vertical
		const topDialogButtonsCount = topDialogButtons.length;
		const topDialogOrientation = topDialogButtonsCount > 4 ? "grid" : "vertical";
		const topDialogGridConfig =
			topDialogButtonsCount > 4
				? { columns: 2, rows: Math.ceil(topDialogButtonsCount / 2) }
				: undefined;

		// Build zoom/pan buttons using factory function
		// Respects showZoomControls prop (empty array if disabled)
		const bottomDialogButtons = buildZoomPanButtons("dialog");

		// Open Dialog with MermaidFullView (dual-group mode)
		openDialog({
			title: title || "Diagram Viewer",
			content: MermaidFullView,
			size: "full",
			props: {
				diagram: highlightedDiagram,
				zoomLevel: dialogZoomLevel,
				panOffset: dialogPanOffset
			},
			// Top action buttons: Dynamic layout (Vertical ≤4, Grid 2×N >4)
			topActionButtons: {
				icons: topDialogButtons,
				orientation: topDialogOrientation,
				gridConfig: topDialogGridConfig,
				gap: btnConfig.gap,
				iconSize: btnConfig.iconSize,
				showTooltips: true
			},
			// Bottom action buttons: Grid 3×3 (zoom/pan)
			bottomActionButtons: {
				icons: bottomDialogButtons,
				orientation: "grid",
				gridConfig: { columns: 3, rows: 3 },
				gap: btnConfig.gap,
				iconSize: btnConfig.iconSize,
				showTooltips: true
			}
		});
	}

	/**
	 * Build IconGrid action icons for inline mode - Grid 2×4
	 * Format-specific icons for better visual distinction:
	 * - FileCode2 (SVG vector format)
	 * - ImageIcon (PNG raster format)
	 * - FileText (Mermaid code)
	 * - Download (download action)
	 * - Expand (fullscreen dialog)
	 *
	 * Grid Layout (2 columns × 4 rows) - ORGANIZED BY FORMAT:
	 * Row 1: Copy SVG      | Download SVG
	 * Row 2: Copy PNG      | Download PNG
	 * Row 3: Copy Code     | Download JPG
	 * Row 4: [empty]       | Expand Dialog
	 *
	 * Each format (SVG, PNG, JPG, Code) has Copy/Download side-by-side
	 * Expand button in bottom-right corner
	 */
	let topActionIcons = $derived(
		buildTopActionButtons({
			mode: "inline",
			includeExpand: true // Include Expand button for inline mode
		})
	);

	/**
	 * Dynamic orientation strategy for topActionIcons
	 * Rule: >4 buttons = Grid 2×N (preserve format organization), ≤4 buttons = Vertical (maximize diagram space)
	 * This applies to both mobile and desktop viewports
	 */
	const topActionIconsCount = $derived(topActionIcons.filter((icon) => icon !== null).length);
	const topActionOrientation = $derived(topActionIconsCount > 4 ? "grid" : "vertical");
	const topActionGridConfig = $derived(
		topActionIconsCount > 4 ? { columns: 2, rows: "auto" as const } : undefined
	);

	/**
	 * Build IconGrid navigation icons for inline mode - BOTTOM GROUP (3×3 Grid)
	 * Uses factory function for consistency with dialog mode
	 * Respects showZoomControls prop (empty array if disabled)
	 */
	let bottomNavigationIcons = $derived(buildZoomPanButtons("inline"));
</script>

<!-- Wrapper: Ensures single root element for proper spacing in parent contexts -->
<div class="mermaid-diagram-wrapper">
	<!-- Header: Title -->
	{#if title}
		<div class="mermaid-diagram-header">
			<h3 class="mermaid-diagram-title">{title}</h3>
		</div>
	{/if}

	<!-- Diagram Container -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="mermaid-diagram-container {className}"
		{id}
		role="application"
		aria-label={title || "Mermaid diagram"}
		aria-roledescription="Interactive diagram with zoom and pan controls"
		tabindex="0"
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
		onwheel={handleWheel}
		onkeydown={handleKeyDown}
	>
		<!-- Top Action Buttons (Dynamic: Vertical ≤4 buttons, Grid 2×N >4 buttons) -->
		{#if topActionIcons.length > 0}
			<IconGrid
				icons={topActionIcons}
				positioning="absolute"
				position={btnConfig.inline.position}
				orientation={topActionOrientation}
				gridConfig={topActionGridConfig}
				gap={btnConfig.gap}
				iconSize={btnConfig.iconSize}
				showTooltips={true}
			/>
		{/if}

		<!-- Bottom Navigation Buttons (Zoom, Pan) - 3×3 Grid -->
		{#if bottomNavigationIcons.length > 0}
			<IconGrid
				icons={bottomNavigationIcons}
				positioning="absolute"
				position={btnConfig.inline.bottomPosition}
				orientation="grid"
				gridConfig={{ columns: 3, rows: 3 }}
				gap={btnConfig.gap}
				iconSize={btnConfig.iconSize}
				showTooltips={true}
			/>
		{/if}

		<!-- Loading Skeleton -->
		{#if isLoading}
			<div class="mermaid-diagram-skeleton" aria-label="Loading diagram">
				<div class="skeleton-line"></div>
				<div class="skeleton-line"></div>
				<div class="skeleton-line"></div>
			</div>
		{:else if renderError}
			<!-- Error State -->
			<div class="mermaid-diagram-error" role="alert">
				<p class="error-message">{renderError}</p>
				{#if debug || mermaidSettings.debug}
					<details class="error-details">
						<summary>Diagram Source</summary>
						<pre class="diagram-source">{diagram}</pre>
					</details>
				{/if}
			</div>
		{:else if _showValidationStatus && _validationResult && !_validationResult.isValid}
			<!-- Validation Error State (Task 8G) -->
			<div class="mermaid-diagram-validation-error" role="alert">
				<!-- Error Message -->
				<p class="error-message">
					{#if _validationResult.errors && _validationResult.errors.length > 0}
						{_validationResult.errors[0]}
					{:else}
						Validation failed
					{/if}
				</p>

				<!-- Validation Errors (Debug Mode) -->
				{#if (debug || mermaidSettings.debug) && _validationResult.errors && _validationResult.errors.length > 0}
					<details class="error-details">
						<summary>Validation Errors ({_validationResult.errors.length})</summary>
						<pre class="validation-details">{_validationResult.errors.join("\n")}

Diagram Source:
{diagram}</pre>
					</details>
				{/if}
			</div>
		{:else}
			<!-- Rendered Diagram with Zoom Transform -->
			<div class="mermaid-diagram-content">
				<div
					class="mermaid-diagram-zoom-wrapper"
					style="transform: {zoomTransform}; transform-origin: center; transition: transform 0.2s ease;"
				>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html highlightedDiagram}
				</div>
			</div>

			<!-- Zoom Level Indicator (Task 8G) -->
			{#if showZoomIndicator}
				<div
					class="zoom-indicator"
					role="status"
					aria-live="polite"
					aria-atomic="true"
					style="
						position: absolute;
						bottom: 1rem;
						right: 1rem;
						background-color: rgba(0, 0, 0, 0.75);
						color: white;
						padding: 0.5rem 0.75rem;
						border-radius: 0.375rem;
						font-size: 0.875rem;
						font-weight: 600;
						pointer-events: none;
						z-index: 10;
						animation: fadeIn 0.2s ease-in-out;
					"
				>
					{Math.round(zoomLevel)}%
				</div>
			{/if}
		{/if}
	</div>
</div>
