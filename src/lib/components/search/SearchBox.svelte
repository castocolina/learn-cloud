<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { SearchResult, SearchFilters, ContentType } from "$types";
	import { searchConfig, getSearchableContent } from "$data/demo/search/search-index.js";
	import {
		defaultSearchEngine,
		getSearchSuggestions
	} from "$data/demo/search/search-algorithms.js";
	import {
		formatSearchResult,
		getEmptyStateForContext
	} from "$data/demo/search/search-templates.js";
	import SearchIcon from "lucide-svelte/icons/search";
	import XIcon from "lucide-svelte/icons/x";
	import LoaderIcon from "lucide-svelte/icons/loader-2";

	interface Props {
		placeholder?: string;
		filters?: SearchFilters;
		showSuggestions?: boolean;
		autoFocus?: boolean;
		class?: string;
	}

	let {
		placeholder = "Search components, lessons, code examples...",
		filters = {},
		showSuggestions = true,
		autoFocus = false,
		class: className = ""
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		search: { query: string; results: SearchResult[] };
		select: { result: SearchResult };
		clear: void;
		focus: void;
		blur: void;
	}>();

	// Reactive state using Svelte 5 runes
	let query = $state("");
	let isLoading = $state(false);
	let showResults = $state(false);
	let activeIndex = $state(-1);
	let searchInput: HTMLInputElement | undefined = $state();

	// Derived state for search functionality
	let searchableItems = $derived(getSearchableContent());

	let suggestions = $derived.by(() => {
		if (!showSuggestions || query.length < 2) return [];
		return getSearchSuggestions(searchableItems, query, 5);
	});

	let searchResults = $derived.by(() => {
		if (!query || query.length < searchConfig.minQueryLength) {
			return [];
		}

		const results = defaultSearchEngine.search(searchableItems, query, filters, {
			limit: searchConfig.maxResults,
			highlightMatches: true
		});

		return results;
	});

	let emptyState = $derived.by(() => {
		return getEmptyStateForContext(Boolean(query), query.length, searchResults.length > 0);
	});

	// Debounced search implementation
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function debounceSearch() {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		isLoading = true;

		debounceTimer = setTimeout(() => {
			isLoading = false;

			if (query.length >= searchConfig.minQueryLength) {
				dispatch("search", {
					query,
					results: searchResults
				});
			}
		}, searchConfig.debounceMs);
	}

	// Input event handlers
	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		query = target.value;
		activeIndex = -1;
		showResults = true;
		debounceSearch();
	}

	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				if (searchResults.length > 0) {
					activeIndex = Math.min(activeIndex + 1, searchResults.length - 1);
				} else if (suggestions.length > 0) {
					activeIndex = Math.min(activeIndex + 1, suggestions.length - 1);
				}
				break;

			case "ArrowUp":
				event.preventDefault();
				activeIndex = Math.max(activeIndex - 1, -1);
				break;

			case "Enter":
				event.preventDefault();
				if (activeIndex >= 0) {
					if (searchResults.length > 0 && activeIndex < searchResults.length) {
						selectResult(searchResults[activeIndex]);
					} else if (suggestions.length > 0 && activeIndex < suggestions.length) {
						applySuggestion(suggestions[activeIndex]);
					}
				} else if (query.length >= searchConfig.minQueryLength) {
					dispatch("search", { query, results: searchResults });
				}
				break;

			case "Escape":
				event.preventDefault();
				clearSearch();
				break;

			case "Tab":
				if (activeIndex >= 0 && suggestions.length > 0) {
					event.preventDefault();
					applySuggestion(suggestions[activeIndex]);
				}
				break;
		}
	}

	function handleFocus() {
		showResults = query.length > 0;
		dispatch("focus");
	}

	function handleBlur() {
		// Delay hiding results to allow for clicks
		setTimeout(() => {
			showResults = false;
			activeIndex = -1;
		}, 150);
		dispatch("blur");
	}

	function selectResult(result: SearchResult) {
		query = result.title;
		showResults = false;
		activeIndex = -1;

		// Track analytics
		defaultSearchEngine.trackResultClick(query, result.id);

		dispatch("select", { result });
	}

	function applySuggestion(suggestion: string) {
		query = suggestion;
		activeIndex = -1;
		debounceSearch();
		searchInput?.focus();
	}

	function clearSearch() {
		query = "";
		showResults = false;
		activeIndex = -1;
		isLoading = false;

		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		dispatch("clear");
		searchInput?.focus();
	}

	// Auto-focus if requested
	$effect(() => {
		if (autoFocus && searchInput) {
			searchInput.focus();
		}
	});
</script>

<div class="relative w-full {className}">
	<!-- Search Input -->
	<div class="relative">
		<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
			{#if isLoading}
				<LoaderIcon class="h-4 w-4 animate-spin text-gray-400" />
			{:else}
				<SearchIcon class="h-4 w-4 text-gray-400" />
			{/if}
		</div>

		<input
			bind:this={searchInput}
			type="text"
			value={query}
			{placeholder}
			class="block w-full rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-10 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
			oninput={handleInput}
			onkeydown={handleKeydown}
			onfocus={handleFocus}
			onblur={handleBlur}
			aria-label="Search"
			aria-haspopup="listbox"
			aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
			autocomplete="off"
			spellcheck="false"
		/>

		{#if query}
			<button
				type="button"
				class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
				onclick={clearSearch}
				aria-label="Clear search"
			>
				<XIcon class="h-4 w-4" />
			</button>
		{/if}
	</div>

	<!-- Search Results Dropdown -->
	{#if showResults}
		<div
			class="absolute z-[110] mt-1 max-h-96 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
			role="listbox"
		>
			{#if query.length < searchConfig.minQueryLength}
				<!-- Query too short -->
				<div class="p-4 text-center text-gray-500 dark:text-gray-400">
					<div class="mb-2 text-lg">{emptyState.icon}</div>
					<div class="font-medium">{emptyState.title}</div>
					<div class="mt-1 text-sm">{emptyState.description}</div>
				</div>
			{:else if isLoading}
				<!-- Loading state -->
				<div class="p-4 text-center text-gray-500 dark:text-gray-400">
					<LoaderIcon class="mx-auto mb-2 h-6 w-6 animate-spin" />
					<div>Searching...</div>
				</div>
			{:else if searchResults.length === 0}
				<!-- No results -->
				<div class="p-4 text-center text-gray-500 dark:text-gray-400">
					<div class="mb-2 text-lg">{emptyState.icon}</div>
					<div class="font-medium">{emptyState.title}</div>
					<div class="mt-1 text-sm">{emptyState.description}</div>

					{#if suggestions.length > 0}
						<div class="mt-3">
							<div class="mb-2 text-xs font-medium text-gray-600 dark:text-gray-300">
								Try these suggestions:
							</div>
							<div class="flex flex-wrap justify-center gap-1">
								{#each suggestions as suggestion}
									<button
										type="button"
										class="rounded bg-gray-100 px-2 py-1 text-xs transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
										onclick={() => applySuggestion(suggestion)}
									>
										{suggestion}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Search Results -->
				{#each searchResults as result, index}
					{@const { displayTitle, displayDescription, displayContent, template } =
						formatSearchResult(result)}
					<button
						type="button"
						id="search-result-{index}"
						class="w-full border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:bg-gray-700 {activeIndex ===
						index
							? 'bg-gray-50 dark:bg-gray-700'
							: ''}"
						onclick={() => selectResult(result)}
						role="option"
						aria-selected={activeIndex === index}
					>
						<div class="flex items-start gap-3">
							<!-- Type Icon -->
							<div class="mt-1 flex-shrink-0">
								<span class="text-lg" role="img" aria-label={result.type}>
									{template.icon}
								</span>
							</div>

							<!-- Content -->
							<div class="min-w-0 flex-1">
								<!-- Title and Badge -->
								<div class="mb-1 flex items-center gap-2">
									<h3 class="truncate font-medium text-gray-900 dark:text-white">
										{@html displayTitle}
									</h3>
									<span
										class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {template.badgeColor}"
									>
										{result.type}
									</span>
								</div>

								<!-- Description -->
								<p class="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
									{@html displayDescription}
								</p>

								<!-- Content Preview -->
								{#if displayContent && template.showContent}
									<p class="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
										{@html displayContent}
									</p>
								{/if}

								<!-- Tags -->
								{#if result.tags.length > 0}
									<div class="mt-2 flex flex-wrap gap-1">
										{#each result.tags.slice(0, 3) as tag}
											<span
												class="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700 dark:bg-gray-600 dark:text-gray-300"
											>
												{tag}
											</span>
										{/each}
										{#if result.tags.length > 3}
											<span class="text-xs text-gray-400">
												+{result.tags.length - 3} more
											</span>
										{/if}
									</div>
								{/if}
							</div>

							<!-- Score (for debugging) -->
							{#if import.meta.env.DEV}
								<div class="flex-shrink-0 text-xs text-gray-400">
									{result.score}
								</div>
							{/if}
						</div>
					</button>
				{/each}

				<!-- Show more results indicator -->
				{#if searchResults.length === searchConfig.maxResults}
					<div
						class="border-t border-gray-100 px-4 py-2 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400"
					>
						Showing first {searchConfig.maxResults} results
					</div>
				{/if}
			{/if}

			<!-- Search Suggestions (when no results but have suggestions) -->
			{#if searchResults.length === 0 && suggestions.length > 0 && query.length >= searchConfig.minQueryLength}
				<div class="border-t border-gray-100 dark:border-gray-700">
					<div
						class="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
					>
						Search suggestions:
					</div>
					{#each suggestions as suggestion, index}
						<button
							type="button"
							class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:hover:bg-gray-700 dark:focus:bg-gray-700 {activeIndex ===
							searchResults.length + index
								? 'bg-gray-50 dark:bg-gray-700'
								: ''}"
							onclick={() => applySuggestion(suggestion)}
						>
							<SearchIcon class="mr-2 inline h-3 w-3 text-gray-400" />
							{suggestion}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Custom scrollbar for results dropdown */
	.overflow-auto::-webkit-scrollbar {
		width: 6px;
	}

	.overflow-auto::-webkit-scrollbar-track {
		background: transparent;
	}

	.overflow-auto::-webkit-scrollbar-thumb {
		background-color: rgba(156, 163, 175, 0.5);
		border-radius: 3px;
	}

	.dark .overflow-auto::-webkit-scrollbar-thumb {
		background-color: rgba(75, 85, 99, 0.5);
	}

	.overflow-auto::-webkit-scrollbar-thumb:hover {
		background-color: rgba(156, 163, 175, 0.8);
	}

	.dark .overflow-auto::-webkit-scrollbar-thumb:hover {
		background-color: rgba(75, 85, 99, 0.8);
	}
</style>
