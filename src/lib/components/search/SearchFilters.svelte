<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { SearchFilters, ContentType } from "$lib/types/search.js";
	import { searchConfig } from "../../../data/demo/search/search-index.js";
	import { searchResultTemplates } from "../../../data/demo/search/search-templates.js";
	import FilterIcon from "lucide-svelte/icons/filter";
	import XIcon from "lucide-svelte/icons/x";
	import ChevronDownIcon from "lucide-svelte/icons/chevron-down";
	import CheckIcon from "lucide-svelte/icons/check";

	interface Props {
		filters: SearchFilters;
		showClearButton?: boolean;
		class?: string;
	}

	let { filters = {}, showClearButton = true, class: className = "" }: Props = $props();

	const dispatch = createEventDispatcher<{
		change: SearchFilters;
		clear: void;
	}>();

	// Reactive state
	let selectedContentType = $state<ContentType | undefined>(filters.contentType);
	let selectedCategory = $state<string | undefined>(filters.category);
	let selectedTags = $state<string[]>(filters.tags || []);

	// Custom dropdown state
	let showContentTypeDropdown = $state(false);
	let showCategoryDropdown = $state(false);

	// Available options derived from configuration
	let contentTypes = $derived.by(() => {
		return Object.entries(searchResultTemplates).map(([type, template]) => ({
			value: type as ContentType,
			label: template.titlePrefix?.replace(":", "") || type,
			icon: template.icon,
			color: template.badgeColor
		}));
	});

	let categories = $derived.by(() => {
		return searchConfig.categories;
	});

	// Popular tags (could be derived from search index)
	let availableTags = $derived.by(() => {
		return [
			"shadcn",
			"accessible",
			"responsive",
			"form",
			"validation",
			"animation",
			"performance",
			"security",
			"testing",
			"beginner",
			"intermediate",
			"advanced",
			"api",
			"data",
			"layout",
			"navigation",
			"interactive",
			"mobile"
		];
	});

	// Update filters when internal state changes
	$effect(() => {
		const newFilters: SearchFilters = {
			contentType: selectedContentType,
			category: selectedCategory === "all" ? undefined : selectedCategory,
			tags: selectedTags.length > 0 ? selectedTags : undefined
		};

		// Only dispatch if filters have actually changed
		const hasChanged =
			newFilters.contentType !== filters.contentType ||
			newFilters.category !== filters.category ||
			JSON.stringify(newFilters.tags) !== JSON.stringify(filters.tags);

		if (hasChanged) {
			dispatch("change", newFilters);
		}
	});

	function handleContentTypeSelect(value: ContentType | undefined) {
		selectedContentType = value;
		showContentTypeDropdown = false;
	}

	function handleCategorySelect(value: string | undefined) {
		selectedCategory = value;
		showCategoryDropdown = false;
	}

	function toggleContentTypeDropdown() {
		showContentTypeDropdown = !showContentTypeDropdown;
		showCategoryDropdown = false; // Close other dropdown
	}

	function toggleCategoryDropdown() {
		showCategoryDropdown = !showCategoryDropdown;
		showContentTypeDropdown = false; // Close other dropdown
	}

	function toggleTag(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	}

	function removeTag(tag: string) {
		selectedTags = selectedTags.filter((t) => t !== tag);
	}

	function clearAllFilters() {
		selectedContentType = undefined;
		selectedCategory = undefined;
		selectedTags = [];
		dispatch("clear");
	}

	// Close dropdowns when clicking outside
	function handleGlobalClick(event: MouseEvent) {
		const target = event.target as Element;
		if (!target.closest(".relative")) {
			showContentTypeDropdown = false;
			showCategoryDropdown = false;
		}
	}

	// Count active filters
	let activeFiltersCount = $derived.by(() => {
		let count = 0;
		if (selectedContentType) count++;
		if (selectedCategory && selectedCategory !== "all") count++;
		if (selectedTags.length > 0) count++;
		return count;
	});

	// Add global click listener to close dropdowns
	$effect(() => {
		if (typeof window !== "undefined") {
			document.addEventListener("click", handleGlobalClick);
			return () => {
				document.removeEventListener("click", handleGlobalClick);
			};
		}
	});
</script>

<div class="space-y-4 {className}">
	<!-- Filter Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<FilterIcon class="h-4 w-4 text-gray-500" />
			<h3 class="text-sm font-medium text-gray-900 dark:text-white">Filters</h3>
			{#if activeFiltersCount > 0}
				<span
					class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
				>
					{activeFiltersCount}
				</span>
			{/if}
		</div>

		{#if showClearButton && activeFiltersCount > 0}
			<button
				type="button"
				class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
				onclick={clearAllFilters}
			>
				Clear all
			</button>
		{/if}
	</div>

	<!-- Content Type Filter -->
	<div class="relative space-y-2">
		<label
			for="content-type-dropdown"
			class="block text-xs font-medium text-gray-700 dark:text-gray-300"
		>
			Content Type
		</label>
		<div class="relative">
			<button
				id="content-type-dropdown"
				type="button"
				onclick={toggleContentTypeDropdown}
				aria-label="Select content type filter"
				aria-expanded={showContentTypeDropdown}
				aria-haspopup="listbox"
				class="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
			>
				<span class="flex items-center gap-2">
					{#if selectedContentType}
						{@const selectedType = contentTypes.find((t) => t.value === selectedContentType)}
						{#if selectedType}
							<span>{selectedType.icon}</span>
							<span>{selectedType.label}</span>
						{/if}
					{:else}
						All types
					{/if}
				</span>
				<ChevronDownIcon class="h-4 w-4 text-gray-500" />
			</button>

			{#if showContentTypeDropdown}
				<div
					class="absolute z-[120] mt-1 w-full max-w-[280px] rounded-md border border-gray-200 bg-white shadow-lg sm:max-w-[200px] dark:border-gray-700 dark:bg-gray-800"
				>
					<div class="max-h-[300px] overflow-y-auto py-1">
						<button
							type="button"
							onclick={() => handleContentTypeSelect(undefined)}
							class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
						>
							{#if !selectedContentType}
								<CheckIcon class="h-4 w-4 text-blue-600" />
							{:else}
								<div class="h-4 w-4"></div>
							{/if}
							All types
						</button>
						{#each contentTypes as contentType}
							<button
								type="button"
								onclick={() => handleContentTypeSelect(contentType.value)}
								class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
							>
								{#if selectedContentType === contentType.value}
									<CheckIcon class="h-4 w-4 text-blue-600" />
								{:else}
									<div class="h-4 w-4"></div>
								{/if}
								<span>{contentType.icon}</span>
								<span>{contentType.label}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Category Filter -->
	<div class="relative space-y-2">
		<label
			for="category-dropdown"
			class="block text-xs font-medium text-gray-700 dark:text-gray-300"
		>
			Category
		</label>
		<div class="relative">
			<button
				id="category-dropdown"
				type="button"
				onclick={toggleCategoryDropdown}
				aria-label="Select category filter"
				aria-expanded={showCategoryDropdown}
				aria-haspopup="listbox"
				class="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
			>
				<span>
					{#if selectedCategory}
						{@const selectedCat = categories.find((c) => c.id === selectedCategory)}
						{selectedCat?.name || "All categories"}
					{:else}
						All categories
					{/if}
				</span>
				<ChevronDownIcon class="h-4 w-4 text-gray-500" />
			</button>

			{#if showCategoryDropdown}
				<div
					class="absolute z-[120] mt-1 w-full max-w-[280px] rounded-md border border-gray-200 bg-white shadow-lg sm:max-w-[200px] dark:border-gray-700 dark:bg-gray-800"
				>
					<div class="max-h-[300px] overflow-y-auto py-1">
						<button
							type="button"
							onclick={() => handleCategorySelect(undefined)}
							class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
						>
							{#if !selectedCategory}
								<CheckIcon class="h-4 w-4 text-blue-600" />
							{:else}
								<div class="h-4 w-4"></div>
							{/if}
							All categories
						</button>
						{#each categories as category}
							<button
								type="button"
								onclick={() => handleCategorySelect(category.id)}
								class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
							>
								{#if selectedCategory === category.id}
									<CheckIcon class="h-4 w-4 text-blue-600" />
								{:else}
									<div class="h-4 w-4"></div>
								{/if}
								<span>{category.name}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Selected Tags -->
	{#if selectedTags.length > 0}
		<div class="space-y-2">
			<label
				for="selected-tags-area"
				class="block text-xs font-medium text-gray-700 dark:text-gray-300"
			>
				Selected Tags
			</label>
			<div id="selected-tags-area" class="flex flex-wrap gap-1">
				{#each selectedTags as tag}
					<span
						class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
					>
						{tag}
						<button
							type="button"
							class="hover:text-blue-600 dark:hover:text-blue-400"
							onclick={() => removeTag(tag)}
							aria-label="Remove {tag} filter"
						>
							<XIcon class="h-3 w-3" />
						</button>
					</span>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Available Tags -->
	<div class="space-y-2">
		<label for="tag-filter-area" class="block text-xs font-medium text-gray-700 dark:text-gray-300">
			Filter by Tags
		</label>
		<div id="tag-filter-area" class="flex max-h-32 flex-wrap gap-1 overflow-y-auto">
			{#each availableTags as tag}
				{@const isSelected = selectedTags.includes(tag)}
				<button
					type="button"
					class="rounded-full border px-2 py-1 text-xs transition-colors {isSelected
						? 'border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-200'
						: 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
					onclick={() => toggleTag(tag)}
					aria-pressed={isSelected}
				>
					{tag}
				</button>
			{/each}
		</div>
	</div>

	<!-- Filter Summary -->
	{#if activeFiltersCount > 0}
		<div class="border-t border-gray-200 pt-2 dark:border-gray-700">
			<div class="text-xs text-gray-500 dark:text-gray-400">
				{activeFiltersCount} filter{activeFiltersCount === 1 ? "" : "s"} active
			</div>
		</div>
	{/if}
</div>

<style>
	/* Custom scrollbar for tags */
	.overflow-y-auto::-webkit-scrollbar {
		width: 4px;
	}

	.overflow-y-auto::-webkit-scrollbar-track {
		background: transparent;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb {
		background-color: rgba(156, 163, 175, 0.5);
		border-radius: 2px;
	}

	.dark .overflow-y-auto::-webkit-scrollbar-thumb {
		background-color: rgba(75, 85, 99, 0.5);
	}

	/* Mobile optimizations for dropdown components */
	@media (max-width: 640px) {
		/* Ensure dropdown content doesn't extend past viewport */
		:global([data-bits-dropdown-menu-content]) {
			max-width: calc(100vw - 2rem);
			left: 1rem !important;
			right: 1rem !important;
		}
	}
</style>
