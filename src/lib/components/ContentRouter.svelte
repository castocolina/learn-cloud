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
	import type { AnyContent, FlatNavEntry } from "$types";

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

	// Derived from store
	const navState = $derived($navigationStore);
	const currentEntry = $derived(
		navState.currentId ? flatNavigation.sequenceMap.get(navState.currentId) : null
	);

	// Load content when entry changes
	$effect(() => {
		if (currentEntry) {
			loadContent(currentEntry);
		}
	});

	async function loadContent(entry: FlatNavEntry) {
		isLoading = true;
		error = null;

		try {
			const content = await loadChapterContent(entry.filePath, entry.id);

			if (content) {
				currentContent = content;

				// Preload adjacent for smooth navigation
				await preloadAdjacent(navState.previousEntry, navState.nextEntry);
			} else {
				error = "Content not found";
			}
		} catch (e) {
			error = e instanceof Error ? e.message : "Unknown error loading content";
			console.error("Content load error:", e);
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		// Handle initial hash or navigate to first chapter
		const hash = window.location.hash;

		if (hash && hash !== "#/" && hash !== "#") {
			handleHashChange();
		} else {
			// Navigate to first chapter
			const firstEntry = flatNavigation.entries[0];
			if (firstEntry) {
				navigateToContent({
					type: "navigate",
					target: firstEntry.chapterUrl,
					source: "direct",
					data: { chapterId: firstEntry.id, unitId: firstEntry.unitId },
					timestamp: new Date()
				});
			}
		}

		// Listen for hash changes (browser back/forward)
		window.addEventListener("hashchange", handleHashChange);
		return () => window.removeEventListener("hashchange", handleHashChange);
	});

	function handleHashChange() {
		const hash = window.location.hash;
		if (!hash || hash === "#/" || hash === "#") return;

		const lookup = parseHash(hash);
		if (lookup.isFound && lookup.flatNavEntry) {
			const entry: FlatNavEntry = lookup.flatNavEntry as FlatNavEntry;
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
		}
	}
</script>

<div class="content-router">
	{#if isLoading}
		<div class="loading-state">
			<div class="loading-spinner"></div>
			<p>Loading content...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<h2>Error Loading Content</h2>
			<p>{error}</p>
			<button onclick={() => (error = null)}>Dismiss</button>
		</div>
	{:else if currentContent && currentEntry}
		{#if currentEntry.chapterType === "overview"}
			<OverviewRenderer content={currentContent} />
		{:else if currentEntry.chapterType === "lesson"}
			<LessonRenderer content={currentContent} />
		{:else if currentEntry.chapterType === "study_guide"}
			<StudyGuideRenderer content={currentContent} />
		{:else if currentEntry.chapterType === "quiz"}
			<QuizRenderer content={currentContent} />
		{:else if currentEntry.chapterType === "exam"}
			<ExamRenderer content={currentContent} />
		{:else if currentEntry.chapterType === "project"}
			<ProjectRenderer content={currentContent} />
		{:else}
			<div class="error-state">
				<h2>Unknown Content Type</h2>
				<p>Content type "{currentEntry.chapterType}" is not supported.</p>
			</div>
		{/if}
	{:else}
		<div class="empty-state">
			<p>No content loaded</p>
		</div>
	{/if}
</div>
