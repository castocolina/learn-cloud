<script lang="ts">
	/**
	 * Content Router Component
	 *
	 * Central routing component that:
	 * - Listens to hash changes for navigation
	 * - Loads content dynamically based on chapterUrl
	 * - Selects appropriate renderer based on chapterType
	 * - Manages loading and error states
	 *
	 * ARCHITECTURE:
	 * - Integrates with navigationStore for current chapter
	 * - Uses contentLoader for dynamic imports
	 * - Delegates rendering to type-specific components
	 * - Handles browser back/forward via hashchange
	 *
	 * RENDERER MAPPING:
	 * - overview → OverviewRenderer
	 * - lesson → LessonRenderer
	 * - study_guide → StudyGuideRenderer
	 * - quiz → QuizRenderer
	 * - exam → ExamRenderer
	 * - project → ProjectRenderer
	 *
	 * @component ContentRouter
	 */

	import { onMount } from "svelte";
	import { navigationStore } from "$lib/stores/spaNavigation.js";
	import { flatNavigation } from "$data/generated/flatnav.js";
	import { loadChapterContent, preloadAdjacent } from "$lib/utils/contentLoader.js";
	import { navigateToContent } from "$lib/utils/spaNavigation.js";
	import { parseHash } from "$lib/utils/hashRouter.js";
	import { SETTINGS } from "$config/settings.js";
	import type {
		AnyContent,
		FlatNavEntry,
		OverviewContent,
		LessonContent,
		StudyGuideContent,
		QuizContent,
		ExamContent,
		ProjectContent
	} from "$types";

	// Renderer imports
	import OverviewRenderer from "./renderers/OverviewRenderer.svelte";
	import LessonRenderer from "./renderers/LessonRenderer.svelte";
	import StudyGuideRenderer from "./renderers/StudyGuideRenderer.svelte";
	import QuizRenderer from "./renderers/QuizRenderer.svelte";
	import ExamRenderer from "./renderers/ExamRenderer.svelte";
	import ProjectRenderer from "./renderers/ProjectRenderer.svelte";

	// State
	let currentContent = $state<AnyContent | null>(null);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	// Subscribe to writable store with $ prefix
	const navState = $derived($navigationStore);
	const currentEntry = $derived(
		navState.currentId ? flatNavigation.sequenceMap.get(navState.currentId) : null
	);

	// Merge local error with navigationStore error for display
	const displayError = $derived(error || navState.error);

	// Load content when entry changes
	$effect(() => {
		if (currentEntry) {
			loadContent(currentEntry);
		}
	});

	async function loadContent(entry: FlatNavEntry) {
		console.log("[ContentRouter] Loading content:", {
			id: entry.id,
			filePath: entry.filePath,
			chapterType: entry.chapterType,
			chapterUrl: entry.chapterUrl
		});

		isLoading = true;
		error = null;

		try {
			const content = await loadChapterContent(entry.filePath, entry.id);

			if (content) {
				console.log("[ContentRouter] Content loaded successfully:", {
					id: entry.id,
					type: content.type,
					title: content.title
				});
				currentContent = content;

				// Preload adjacent for smooth navigation
				await preloadAdjacent(navState.previousEntry, navState.nextEntry);
			} else {
				error = `Content not found: ${entry.filePath}`;
				console.error("[ContentRouter] Content load failed:", {
					id: entry.id,
					filePath: entry.filePath,
					reason: "loadChapterContent returned null"
				});
			}
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : "Unknown error loading content";
			error = `Failed to load ${entry.filePath}: ${errorMessage}`;
			console.error("[ContentRouter] Content load error:", {
				id: entry.id,
				filePath: entry.filePath,
				error: e
			});
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		// Handle initial hash or navigate to book overview
		const hash = window.location.hash;
		console.log("[ContentRouter] onMount - initial hash:", hash || "(empty)");

		// Treat empty, "#", and "#/" as navigation to home (book overview)
		if (!hash || hash === "#/" || hash === "#") {
			// Navigate to book overview (home page)
			console.log("[ContentRouter] No valid hash - navigating to book overview");
			const bookOverview = SETTINGS.scripts.flatNav.bookOverview;
			// Clear hash first to ensure clean state
			window.location.hash = "";
			navigateToContent({
				type: "navigate",
				target: bookOverview.chapterUrl,
				source: bookOverview.defaultSource,
				data: { chapterId: bookOverview.id, unitId: null },
				timestamp: new Date()
			});
		} else {
			// Process existing hash (could be valid content or error)
			console.log("[ContentRouter] Processing existing hash");
			handleHashChange();
		}

		// Listen for hash changes (browser back/forward)
		window.addEventListener("hashchange", handleHashChange);
		return () => window.removeEventListener("hashchange", handleHashChange);
	});

	function handleHashChange() {
		const hash = window.location.hash;
		console.log("[ContentRouter] Hash changed:", hash);

		// If navigating to home, clear and reload
		if (!hash || hash === "#/" || hash === "#") {
			console.log("[ContentRouter] Hash is home - navigating to book overview");
			const bookOverview = SETTINGS.scripts.flatNav.bookOverview;
			navigateToContent({
				type: "navigate",
				target: bookOverview.chapterUrl,
				source: bookOverview.defaultSource,
				data: { chapterId: bookOverview.id, unitId: null },
				timestamp: new Date()
			});
			return;
		}

		const lookup = parseHash(hash);
		console.log("[ContentRouter] Hash lookup result:", lookup);

		if (lookup.isFound && lookup.flatNavEntry) {
			const entry: FlatNavEntry = lookup.flatNavEntry as FlatNavEntry;
			console.log("[ContentRouter] Navigating to entry from hash:", {
				id: entry.id,
				chapterUrl: entry.chapterUrl
			});
			navigateToContent({
				type: "navigate",
				target: entry.chapterUrl,
				source: "direct",
				data: {
					chapterId: entry.id,
					unitId: entry.unitId
				},
				timestamp: new Date()
			});
		} else {
			// Hash lookup failed - show error to user
			const cleanHash = hash.replace("#/", "");
			error = `Page not found: "${cleanHash}". This URL does not exist in the navigation structure.`;
			console.error("[ContentRouter] Hash lookup failed:", {
				hash,
				cleanHash,
				lookupResult: lookup
			});
		}
	}

	// Debug logging for navigation state changes
	$effect(() => {
		console.log("[ContentRouter] Navigation state updated:", {
			currentId: navState.currentId,
			currentChapterUrl: navState.currentChapterUrl,
			error: navState.error,
			isLoading: navState.isLoading,
			hasCurrentEntry: currentEntry !== null,
			hasCurrentContent: currentContent !== null
		});
	});

	// Debug logging for displayError
	$effect(() => {
		console.log("[ContentRouter] Display error state:", {
			displayError,
			localError: error,
			navError: navState.error,
			willShowError: !!displayError
		});
	});
</script>

<div class="content-router">
	{#if isLoading}
		<div class="loading-state">
			<div class="loading-spinner"></div>
			<p>Loading content...</p>
		</div>
	{:else if displayError}
		<div class="error-state">
			<h2>Error Loading Content</h2>
			<p class="error-message">{displayError}</p>
			{#if navState.error}
				<p class="error-context">
					Unable to navigate to: <code>{navState.currentChapterUrl || "unknown URL"}</code>
				</p>
			{/if}
			<div class="error-actions">
				<button
					onclick={() => {
						error = null;
						window.location.hash = "#/";
					}}>Go to Home</button
				>
				{#if error}
					<button onclick={() => (error = null)}>Dismiss</button>
				{/if}
			</div>
		</div>
	{:else if currentContent && currentEntry}
		{#if currentEntry.chapterType === "overview"}
			<OverviewRenderer content={currentContent as OverviewContent} />
		{:else if currentEntry.chapterType === "lesson"}
			<LessonRenderer content={currentContent as LessonContent} />
		{:else if currentEntry.chapterType === "study_guide"}
			<StudyGuideRenderer content={currentContent as StudyGuideContent} />
		{:else if currentEntry.chapterType === "quiz"}
			<QuizRenderer content={currentContent as QuizContent} />
		{:else if currentEntry.chapterType === "exam"}
			<ExamRenderer content={currentContent as ExamContent} />
		{:else if currentEntry.chapterType === "project"}
			<ProjectRenderer content={currentContent as ProjectContent} />
		{:else}
			<div class="error-state">
				<h2>Unknown Content Type</h2>
				<p>Content type "{currentEntry.chapterType}" is not supported.</p>
			</div>
		{/if}
	{:else}
		<div class="empty-state">
			<p class="empty-state-title">No content available</p>
			{#if !navState.currentId}
				<p class="empty-state-message">
					No content selected. Please select a chapter from the navigation menu.
				</p>
			{:else if !currentEntry}
				<p class="empty-state-message">
					Chapter not found: <code>{navState.currentId}</code>
				</p>
			{:else}
				<p class="empty-state-message">Content is being loaded...</p>
			{/if}
			<button
				onclick={() => {
					window.location.hash = "#/";
				}}>Go to Home</button
			>
		</div>
	{/if}
</div>
