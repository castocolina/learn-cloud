<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { fly, fade } from "svelte/transition";
	import type { SearchResult, SearchFilters } from "$lib/types/search.js";
	import SearchBox from "./SearchBox.svelte";
	import SearchFiltersComponent from "./SearchFilters.svelte";
	import SearchResults from "./SearchResults.svelte";
	import XIcon from "lucide-svelte/icons/x";
	import SlidersIcon from "lucide-svelte/icons/sliders-horizontal";

	interface Props {
		isOpen: boolean;
		initialQuery?: string;
		class?: string;
	}

	let { isOpen = false, initialQuery = "", class: className = "" }: Props = $props();

	const dispatch = createEventDispatcher<{
		close: void;
		select: { result: SearchResult };
		search: { query: string; results: SearchResult[] };
	}>();

	// Modal state
	let modalElement: HTMLDivElement | undefined = $state();
	let searchQuery = $state(initialQuery);
	let searchResults = $state<SearchResult[]>([]);
	let searchFilters = $state<SearchFilters>({});
	let showFilters = $state(false);
	let isLoading = $state(false);

	// Handle modal events
	function handleClose() {
		dispatch("close");
	}

	function handleSearch(event: CustomEvent<{ query: string; results: SearchResult[] }>) {
		searchQuery = event.detail.query;
		searchResults = event.detail.results;
		dispatch("search", event.detail);
	}

	function handleResultSelect(event: CustomEvent<{ result: SearchResult }>) {
		dispatch("select", event.detail);
		handleClose();
	}

	function handleFiltersChange(event: CustomEvent<SearchFilters>) {
		searchFilters = event.detail;
	}

	function handleFiltersClear() {
		searchFilters = {};
	}

	function toggleFilters() {
		showFilters = !showFilters;
	}

	// Keyboard shortcuts
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			event.preventDefault();
			handleClose();
		}
	}

	// Trap focus within modal
	function trapFocus(event: KeyboardEvent) {
		if (event.key !== "Tab") return;

		const focusableElements = modalElement?.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		if (!focusableElements || focusableElements.length === 0) return;

		const firstElement = focusableElements[0] as HTMLElement;
		const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

		if (event.shiftKey) {
			if (document.activeElement === firstElement) {
				event.preventDefault();
				lastElement.focus();
			}
		} else {
			if (document.activeElement === lastElement) {
				event.preventDefault();
				firstElement.focus();
			}
		}
	}

	// Handle backdrop click
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	// Auto-focus search input when modal opens
	$effect(() => {
		if (isOpen && modalElement) {
			const searchInput = modalElement.querySelector('input[type="text"]') as HTMLInputElement;
			searchInput?.focus();
		}
	});

	// Handle initial query
	$effect(() => {
		if (initialQuery && initialQuery !== searchQuery) {
			searchQuery = initialQuery;
		}
	});
</script>

<!-- Modal Backdrop and Container -->
{#if isOpen}
	<div
		class="fixed inset-0 z-[110] flex items-start justify-center px-2 pt-20 sm:px-4 sm:pt-16"
		transition:fade={{ duration: 200 }}
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="search-modal-title"
	>
		<!-- Backdrop -->
		<div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

		<!-- Modal Content -->
		<div
			bind:this={modalElement}
			class="relative flex max-h-[80vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-900 {className}"
			transition:fly={{ y: -20, duration: 300 }}
			onkeydown={trapFocus}
		>
			<!-- Modal Header -->
			<div
				class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700"
			>
				<h2 id="search-modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
					Search
				</h2>

				<div class="flex items-center gap-2">
					<!-- Toggle Filters Button -->
					<button
						type="button"
						class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 {showFilters
							? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
							: ''}"
						onclick={toggleFilters}
						aria-label="Toggle search filters"
						aria-pressed={showFilters}
					>
						<SlidersIcon class="h-5 w-5" />
					</button>

					<!-- Close Button -->
					<button
						type="button"
						class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
						onclick={handleClose}
						aria-label="Close search modal"
					>
						<XIcon class="h-5 w-5" />
					</button>
				</div>
			</div>

			<!-- Search Input -->
			<div class="border-b border-gray-200 p-4 dark:border-gray-700">
				<SearchBox
					filters={searchFilters}
					autoFocus={true}
					showSuggestions={false}
					on:search={handleSearch}
					on:select={handleResultSelect}
				/>
			</div>

			<!-- Content Area -->
			<div class="flex min-h-0 flex-1">
				<!-- Filters Sidebar -->
				{#if showFilters}
					<div
						class="w-72 border-r border-gray-200 bg-gray-50 sm:w-64 dark:border-gray-700 dark:bg-gray-800/50"
						transition:fly={{ x: -20, duration: 200 }}
					>
						<div class="h-full overflow-y-auto p-3 sm:p-4">
							<SearchFiltersComponent
								filters={searchFilters}
								on:change={handleFiltersChange}
								on:clear={handleFiltersClear}
							/>
						</div>
					</div>
				{/if}

				<!-- Results Area -->
				<div class="min-w-0 flex-1">
					<div class="h-full overflow-y-auto p-4">
						<SearchResults
							results={searchResults}
							query={searchQuery}
							{isLoading}
							on:select={handleResultSelect}
						/>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
				<div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
					<div class="flex items-center gap-4">
						<span
							>Press <kbd class="rounded bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-gray-700">↵</kbd>
							to select</span
						>
						<span
							>Press <kbd class="rounded bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-gray-700">↑↓</kbd
							> to navigate</span
						>
						<span
							>Press <kbd class="rounded bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-gray-700"
								>Esc</kbd
							> to close</span
						>
					</div>

					{#if searchResults.length > 0}
						<span>
							{searchResults.length} result{searchResults.length === 1 ? "" : "s"}
						</span>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Custom scrollbar for modal content */
	.overflow-y-auto::-webkit-scrollbar {
		width: 6px;
	}

	.overflow-y-auto::-webkit-scrollbar-track {
		background: transparent;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb {
		background-color: rgba(156, 163, 175, 0.3);
		border-radius: 3px;
	}

	.dark .overflow-y-auto::-webkit-scrollbar-thumb {
		background-color: rgba(75, 85, 99, 0.3);
	}

	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background-color: rgba(156, 163, 175, 0.5);
	}

	.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background-color: rgba(75, 85, 99, 0.5);
	}

	/* Keyboard shortcut styling */
	kbd {
		font-family:
			ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
		font-weight: 500;
	}

	/* Modal backdrop blur effect */
	.backdrop-blur-sm {
		backdrop-filter: blur(4px);
	}

	/* Focus trap styling */
	[role="dialog"] {
		outline: none;
	}

	/* Ensure modal content is above backdrop */
	.relative {
		z-index: 10;
	}
</style>
