<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { SearchResult } from "$types";
	import {
		formatSearchResult,
		getEmptyStateForContext
	} from "$data/demo/search/search-templates.js";
	import { defaultSearchEngine } from "$data/demo/search/search-algorithms.js";
	import ExternalLinkIcon from "lucide-svelte/icons/external-link";
	import HashIcon from "lucide-svelte/icons/hash";

	interface Props {
		results: SearchResult[];
		query: string;
		isLoading?: boolean;
		showLoadMore?: boolean;
		totalResults?: number;
		class?: string;
	}

	let {
		results = [],
		query = "",
		isLoading = false,
		showLoadMore = false,
		totalResults,
		class: className = ""
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		select: { result: SearchResult };
		loadMore: void;
		trackClick: { result: SearchResult; query: string };
	}>();

	// Derived state
	let emptyState = $derived.by(() => {
		return getEmptyStateForContext(Boolean(query), query.length, results.length > 0);
	});

	function handleResultClick(result: SearchResult) {
		if (import.meta.env.DEV) {
			console.log("🎯 SearchResults: Result clicked!", result.title, result.nav.path);
		}

		// Track analytics
		defaultSearchEngine.trackResultClick(query, result.id);

		// Dispatch events
		dispatch("trackClick", { result, query });
		dispatch("select", { result });
	}

	function handleLoadMore() {
		dispatch("loadMore");
	}

	function getResultAriaLabel(result: SearchResult): string {
		const { template } = formatSearchResult(result);
		return `${template.titlePrefix || ""} ${result.title}. ${result.description}. Score: ${result.score}. ${template.actionLabel}`;
	}
</script>

<div class="space-y-4 {className}">
	<!-- Results Header -->
	{#if results.length > 0}
		<div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
			<div>
				{#if totalResults !== undefined}
					{totalResults} result{totalResults === 1 ? "" : "s"}
				{:else}
					{results.length} result{results.length === 1 ? "" : "s"}
				{/if}
				{#if query}
					for "<span class="font-medium text-gray-900 dark:text-white">{query}</span>"
				{/if}
			</div>

			{#if import.meta.env.DEV}
				<div class="text-xs">Sorted by relevance</div>
			{/if}
		</div>
	{/if}

	<!-- Loading State -->
	{#if isLoading}
		<div class="space-y-4">
			{#each Array(3) as _}
				<div class="animate-pulse">
					<div
						class="flex items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
					>
						<div class="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
						<div class="flex-1 space-y-2">
							<div class="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
							<div class="h-3 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
							<div class="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else if results.length === 0}
		<!-- Empty State -->
		<div class="py-12 text-center">
			<div class="mb-4 text-4xl" role="img" aria-label={emptyState.title}>
				{emptyState.icon}
			</div>
			<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
				{emptyState.title}
			</h3>
			<p class="mx-auto mb-6 max-w-md text-gray-600 dark:text-gray-400">
				{emptyState.description}
			</p>

			{#if emptyState.suggestions.length > 0}
				<div class="space-y-2">
					<h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Suggestions:</h4>
					<ul class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
						{#each emptyState.suggestions as suggestion}
							<li>{suggestion}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Search Results -->
		<div class="space-y-3">
			{#each results as result, index}
				{@const { displayTitle, displayDescription, displayContent, template } =
					formatSearchResult(result)}
				<button
					type="button"
					class="group w-full cursor-pointer rounded-lg border border-gray-200 p-4 text-left transition-all duration-200 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:hover:border-gray-600"
					onclick={() => handleResultClick(result)}
					aria-label={getResultAriaLabel(result)}
				>
					<div class="flex items-start gap-3">
						<!-- Type Icon -->
						<div class="mt-1 flex-shrink-0">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-gray-200 dark:bg-gray-700 dark:group-hover:bg-gray-600"
							>
								<span class="text-lg" role="img" aria-label={`${result.type} content`}>
									{template.icon}
								</span>
							</div>
						</div>

						<!-- Content -->
						<div class="min-w-0 flex-1">
							<!-- Title and Metadata -->
							<div class="mb-2 flex items-start justify-between gap-2">
								<div class="min-w-0 flex-1">
									<h2
										class="line-clamp-2 text-base font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
									>
										{@html displayTitle}
									</h2>
								</div>

								<div class="flex flex-shrink-0 items-center gap-2">
									<!-- Content Type Badge -->
									<span
										class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {template.badgeColor}"
									>
										{result.type}
									</span>

									<!-- External Link Icon -->
									<ExternalLinkIcon
										class="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-300"
									/>
								</div>
							</div>

							<!-- Description -->
							<p class="mb-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
								{@html displayDescription}
							</p>

							<!-- Content Preview -->
							{#if displayContent && template.showContent}
								<p
									class="mb-3 line-clamp-2 rounded bg-gray-50 p-2 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400"
								>
									{@html displayContent}
								</p>
							{/if}

							<!-- Metadata Row -->
							<div class="flex items-center justify-between gap-4">
								<!-- Tags -->
								<div class="flex flex-1 flex-wrap gap-1">
									{#each result.tags.slice(0, 4) as tag}
										<span
											class="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
										>
											<HashIcon class="mr-0.5 h-2.5 w-2.5" />
											{tag}
										</span>
									{/each}
									{#if result.tags.length > 4}
										<span class="text-xs text-gray-400">
											+{result.tags.length - 4}
										</span>
									{/if}
								</div>

								<!-- Score and Category (dev only) -->
								{#if import.meta.env.DEV}
									<div class="flex items-center gap-2 text-xs text-gray-400">
										<span>Score: {result.score}</span>
										<span>•</span>
										<span>{result.category}</span>
									</div>
								{/if}
							</div>

							<!-- Action Hint -->
							<div
								class="mt-2 text-xs text-gray-500 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-400"
							>
								Click to {template.actionLabel.toLowerCase()}
							</div>
						</div>
					</div>
				</button>
			{/each}
		</div>

		<!-- Load More Button -->
		{#if showLoadMore}
			<div class="pt-4 text-center">
				<button
					type="button"
					class="rounded-lg border border-blue-300 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
					onclick={handleLoadMore}
					disabled={isLoading}
				>
					{isLoading ? "Loading..." : "Load more results"}
				</button>
			</div>
		{/if}

		<!-- Results Summary -->
		{#if totalResults !== undefined && totalResults > results.length}
			<div
				class="border-t border-gray-200 pt-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400"
			>
				Showing {results.length} of {totalResults} results
			</div>
		{/if}
	{/if}
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Smooth hover transitions - updated for button elements */
	button {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	button:hover {
		transform: translateY(-1px);
	}

	/* Focus styles for accessibility */
	button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/* Animation for loading states */
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
