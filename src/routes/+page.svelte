<script lang="ts">
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	// Import content store and components
	import { contentStore } from "$lib/stores/content.js";
	import {
		isLessonContent,
		isQuizContent,
		isStudyGuideContent,
		isExamContent,
		isProjectContent
	} from "$lib/utils/contentLoader.js";

	// Import content renderer components
	import LessonRenderer from "$lib/components/content/LessonRenderer.svelte";
	import QuizRenderer from "$lib/components/content/QuizRenderer.svelte";
	import StudyGuideRenderer from "$lib/components/content/StudyGuideRenderer.svelte";

	// Import content loading functions for deep linking
	import {
		initializeFromHash,
		loadContentFromHash,
		loadUnitContent
	} from "$lib/utils/contentLoader.js";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import { contentMenu } from "$lib/../data/content-menu.js";

	// Navigate to unit overview
	function navigateToUnit() {
		const state = $contentStore;
		if (!state.currentHash) return;

		const hashParts = state.currentHash.split("/");
		if (hashParts.length >= 3 && hashParts[0] === "book" && hashParts[1] === "unit") {
			const unitNumber = parseInt(hashParts[2]);
			const unit = contentMenu.units[unitNumber - 1]; // Units are 1-indexed in hash

			if (unit) {
				// Navigate to unit overview using unit_data and unit_link
				loadUnitContent(unit.unit_data, unit.unit_link);
			}
		}
	}

	// Get breadcrumb data based on current state
	function getBreadcrumbData() {
		const state = $contentStore;

		if (state.showWelcome || !state.currentHash) {
			// Homepage: Show site title only, no links
			return {
				showUnit: false,
				showChapter: false,
				unitName: contentMenu.metadata.title,
				chapterName: "",
				canNavigateToUnit: false,
				isHomepage: true
			};
		}

		// Parse hash to get unit and chapter info
		const hashParts = state.currentHash.split("/");

		if (hashParts.length >= 3 && hashParts[0] === "book" && hashParts[1] === "unit") {
			const unitNumber = parseInt(hashParts[2]);
			const unit = contentMenu.units[unitNumber - 1]; // Units are 1-indexed in hash

			if (hashParts.length >= 4) {
				const filename = hashParts[3];

				// Check if this is a unit overview page (filename starts with "0_unit_")
				if (filename.startsWith("0_unit_")) {
					// Unit overview page: Show unit title only, not clickable (like homepage)
					return {
						showUnit: true,
						showChapter: false,
						unitName: unit?.title || `Unit ${unitNumber}`,
						chapterName: "",
						canNavigateToUnit: false,
						isHomepage: false
					};
				} else {
					// Content page (chapter/lesson/quiz/etc): Show unit link + chapter title
					const chapter = unit?.chapters?.find((ch) => ch.chapter_link.endsWith(filename));

					return {
						showUnit: true,
						showChapter: true,
						unitName: unit?.title || `Unit ${unitNumber}`,
						chapterName: chapter?.title || "Chapter",
						canNavigateToUnit: true,
						unitHref: unit?.unit_link ? `#${unit.unit_link}` : "#",
						isHomepage: false
					};
				}
			} else {
				// Unit path without filename: Show unit title only, not clickable
				return {
					showUnit: true,
					showChapter: false,
					unitName: unit?.title || `Unit ${unitNumber}`,
					chapterName: "",
					canNavigateToUnit: false,
					isHomepage: false
				};
			}
		}

		// Fallback
		return {
			showUnit: false,
			showChapter: false,
			unitName: contentMenu.metadata.title,
			chapterName: "",
			canNavigateToUnit: false,
			isHomepage: true
		};
	}

	const breadcrumbData = $derived(getBreadcrumbData());

	// Initialize content from hash on page load
	onMount(() => {
		initializeFromHash();

		// Listen for hash changes for browser navigation
		if (browser) {
			const handleHashChange = () => {
				const hash = window.location.hash.slice(1);
				if (hash) {
					loadContentFromHash(hash);
				}
			};

			window.addEventListener("hashchange", handleHashChange);

			return () => {
				window.removeEventListener("hashchange", handleHashChange);
			};
		}
	});
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<header class="sticky flex h-16 shrink-0 items-center gap-2 border-b px-4">
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
			<Breadcrumb.Root>
				<Breadcrumb.List>
					<!-- First breadcrumb segment -->
					<Breadcrumb.Item>
						{#if breadcrumbData.isHomepage}
							<!-- Homepage: Site title only, disabled link -->
							<Breadcrumb.Page id="bread-1-unit">{breadcrumbData.unitName}</Breadcrumb.Page>
						{:else if breadcrumbData.canNavigateToUnit}
							<!-- Content page: Unit name is clickable, goes to unit overview -->
							<Breadcrumb.Link id="bread-1-unit" href={breadcrumbData.unitHref || "#"} onclick={navigateToUnit}>
								{breadcrumbData.unitName}
							</Breadcrumb.Link>
						{:else if breadcrumbData.showUnit}
							<!-- Unit overview: Unit name is current page -->
							<Breadcrumb.Page id="bread-1-unit">{breadcrumbData.unitName}</Breadcrumb.Page>
						{:else}
							<!-- Fallback: Show site title -->
							<Breadcrumb.Page id="bread-1-unit">{breadcrumbData.unitName}</Breadcrumb.Page>
						{/if}
					</Breadcrumb.Item>

					<!-- Second breadcrumb segment (only on content pages) -->
					{#if breadcrumbData.showChapter}
						<Breadcrumb.Separator />
						<Breadcrumb.Item>
							<Breadcrumb.Page id="bread-2-chapter">{breadcrumbData.chapterName}</Breadcrumb.Page>
						</Breadcrumb.Item>
					{/if}
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</header>
		<div id="content" class="flex flex-1 flex-col gap-4 p-4">
			{#if $contentStore.showWelcome}
				<!-- Welcome Screen -->
				<div class="flex flex-1 flex-col items-center justify-center p-8">
					<div class="max-w-2xl text-center">
						<h1
							class="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent"
						>
							Welcome to Cloud-Native Technologies
						</h1>
						<p class="mb-8 text-lg text-muted-foreground">
							A comprehensive guide to modern cloud-native development covering Python and Go
							backend development, DevOps practices, infrastructure as code, security, and
							real-world project implementations.
						</p>
						<div class="mx-auto grid max-w-md gap-4 md:grid-cols-2">
							<div class="rounded-lg border p-4">
								<h3 class="mb-2 font-semibold">📚 Interactive Learning</h3>
								<p class="text-sm text-muted-foreground">Lessons, quizzes, and study guides</p>
							</div>
							<div class="rounded-lg border p-4">
								<h3 class="mb-2 font-semibold">🚀 Hands-on Projects</h3>
								<p class="text-sm text-muted-foreground">Real-world implementations</p>
							</div>
						</div>
						<p class="mt-8 text-sm text-muted-foreground">
							👈 Select a topic from the sidebar to begin learning
						</p>
					</div>
				</div>
			{:else if $contentStore.isLoading}
				<!-- Loading State -->
				<div class="flex flex-1 items-center justify-center p-8">
					<div class="text-center">
						<div
							class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
						></div>
						<p class="text-lg text-muted-foreground">Loading content...</p>
					</div>
				</div>
			{:else if $contentStore.error}
				<!-- Error State -->
				<div class="flex flex-1 items-center justify-center p-8">
					<div class="max-w-md text-center">
						<div class="mb-4 text-6xl text-red-500">⚠️</div>
						<h2 class="mb-4 text-2xl font-bold">Content Loading Error</h2>
						<p class="mb-4 text-muted-foreground">{$contentStore.error}</p>
						<button
							onclick={() => contentStore.set({ ...$contentStore, error: null, showWelcome: true })}
							class="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
						>
							← Back to Welcome
						</button>
					</div>
				</div>
			{:else if $contentStore.currentContent}
				<!-- Content Display -->
				<div class="flex-1">
					{#if isLessonContent($contentStore.currentContent)}
						<LessonRenderer content={$contentStore.currentContent} />
					{:else if isQuizContent($contentStore.currentContent)}
						<QuizRenderer content={$contentStore.currentContent} />
					{:else if isStudyGuideContent($contentStore.currentContent)}
						<StudyGuideRenderer content={$contentStore.currentContent} />
					{:else if isExamContent($contentStore.currentContent)}
						<!-- Placeholder for ExamRenderer -->
						<div class="rounded-lg border-2 border-dashed border-gray-300 p-8">
							<h2 class="mb-4 text-2xl font-bold">📝 Exam Content</h2>
							<p class="mb-4 text-muted-foreground">
								Exam renderer is being developed. Content loaded successfully:
							</p>
							<div class="rounded-lg bg-muted p-4">
								<h3 class="font-semibold">{$contentStore.currentContent.title}</h3>
								<p class="mt-2 text-sm text-muted-foreground">
									{$contentStore.currentContent.summary}
								</p>
							</div>
							<p class="mt-4 text-sm text-muted-foreground">
								Type: {$contentStore.currentContent.type}
							</p>
						</div>
					{:else if isProjectContent($contentStore.currentContent)}
						<!-- Placeholder for ProjectRenderer -->
						<div class="rounded-lg border-2 border-dashed border-gray-300 p-8">
							<h2 class="mb-4 text-2xl font-bold">🚀 Project Content</h2>
							<p class="mb-4 text-muted-foreground">
								Project renderer is being developed. Content loaded successfully:
							</p>
							<div class="rounded-lg bg-muted p-4">
								<h3 class="font-semibold">{$contentStore.currentContent.title}</h3>
								<p class="mt-2 text-sm text-muted-foreground">
									{$contentStore.currentContent.summary}
								</p>
							</div>
							<p class="mt-4 text-sm text-muted-foreground">
								Type: {$contentStore.currentContent.type}
							</p>
						</div>
					{:else}
						<!-- Unknown content type -->
						<div class="rounded-lg border-2 border-dashed border-red-300 p-8">
							<h2 class="mb-4 text-2xl font-bold">❓ Unknown Content Type</h2>
							<p class="text-muted-foreground">This content type is not yet supported.</p>
							<details class="mt-4 rounded bg-muted p-4">
								<summary class="cursor-pointer">Debug Information</summary>
								<pre class="mt-2 max-h-96 overflow-auto text-xs">{JSON.stringify(
										$contentStore.currentContent,
										null,
										2
									)}</pre>
							</details>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
