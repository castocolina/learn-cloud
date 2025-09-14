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
	import { initializeFromHash, loadContentFromHash } from "$lib/utils/contentLoader.js";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";

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
		<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
			<Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item class="hidden md:block">
						<Breadcrumb.Link href="#">Building Your Application</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator class="hidden md:block" />
					<Breadcrumb.Item>
						<Breadcrumb.Page>Data Fetching</Breadcrumb.Page>
					</Breadcrumb.Item>
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
