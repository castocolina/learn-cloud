<script lang="ts">
	import { onMount } from "svelte";
	import { Search, Filter, X, Code2, BarChart3, Tag } from "lucide-svelte";
	import CodeBlock from "./ui/CodeBlock.svelte";
	import type { CodeExample, Language, Complexity } from "$data/demo/content/code/code-examples";
	import { codeExamples } from "$data/demo/content/code/code-examples";

	// Props interface for type safety
	interface Props {
		/** Whether to show statistics */
		showStats?: boolean;
		/** Custom CSS class */
		className?: string;
	}

	let { showStats = true, className = "" }: Props = $props();

	// State variables
	let searchQuery = $state("");
	let selectedLanguages = $state<Language[]>([]);
	let selectedComplexities = $state<Complexity[]>([]);
	let filteredExamples = $state<CodeExample[]>([]);
	let showFilters = $state(false);
	let searchInput: HTMLInputElement | undefined;

	// Statistics
	let stats = $derived({
		total: codeExamples.length,
		byLanguage: getStatsByLanguage(),
		byComplexity: getStatsByComplexity(),
		filtered: filteredExamples.length
	});

	// Available options for filtering
	let availableLanguages = $derived(
		[...new Set(codeExamples.map((ex: CodeExample) => ex.language))].sort()
	);
	let availableComplexities = $derived(
		[...new Set(codeExamples.map((ex: CodeExample) => ex.complexity))].sort()
	);

	// Initialize filtered examples
	onMount(() => {
		filteredExamples = codeExamples;
	});

	// Filter examples based on search and filters
	$effect(() => {
		let results = [...codeExamples];

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			results = results.filter(
				(example) =>
					example.title.toLowerCase().includes(query) ||
					example.description.toLowerCase().includes(query) ||
					example.language.toLowerCase().includes(query)
			);
		}

		// Apply language filters
		if (selectedLanguages.length > 0) {
			results = results.filter((example) => selectedLanguages.includes(example.language));
		}

		// Apply complexity filters
		if (selectedComplexities.length > 0) {
			results = results.filter((example) => selectedComplexities.includes(example.complexity));
		}

		filteredExamples = results;
	});

	// Statistics calculation functions
	function getStatsByLanguage() {
		const stats: Record<Language, number> = {} as Record<Language, number>;
		codeExamples.forEach((example: CodeExample) => {
			stats[example.language] = (stats[example.language] || 0) + 1;
		});
		return stats;
	}

	function getStatsByComplexity() {
		const stats: Record<Complexity, number> = {} as Record<Complexity, number>;
		codeExamples.forEach((example: CodeExample) => {
			stats[example.complexity] = (stats[example.complexity] || 0) + 1;
		});
		return stats;
	}

	// Event handlers
	function handleSearch(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;
	}

	function toggleLanguageFilter(language: Language) {
		if (selectedLanguages.includes(language)) {
			selectedLanguages = selectedLanguages.filter((l) => l !== language);
		} else {
			selectedLanguages = [...selectedLanguages, language];
		}
	}

	function toggleComplexityFilter(complexity: Complexity) {
		if (selectedComplexities.includes(complexity)) {
			selectedComplexities = selectedComplexities.filter((c) => c !== complexity);
		} else {
			selectedComplexities = [...selectedComplexities, complexity];
		}
	}

	function clearAllFilters() {
		searchQuery = "";
		selectedLanguages = [];
		selectedComplexities = [];
		if (searchInput) {
			searchInput.value = "";
		}
	}

	function toggleFilters() {
		showFilters = !showFilters;
	}

	// Utility functions
	function getLanguageDisplayName(language: Language): string {
		const displayNames: Record<Language, string> = {
			typescript: "TypeScript",
			svelte: "Svelte",
			javascript: "JavaScript",
			python: "Python",
			go: "Go",
			java: "Java",
			rust: "Rust",
			php: "PHP",
			hcl: "HCL/Terraform",
			yaml: "YAML",
			dockerfile: "Dockerfile",
			bash: "Bash",
			sql: "SQL",
			graphql: "GraphQL",
			cypher: "Cypher",
			json: "JSON",
			proto: "Protocol Buffers",
			dynamodb: "DynamoDB"
		};
		return displayNames[language] || language;
	}

	function getComplexityDisplayName(complexity: Complexity): string {
		return complexity.charAt(0).toUpperCase() + complexity.slice(1);
	}

	function getComplexityColor(complexity: Complexity): string {
		switch (complexity) {
			case "beginner":
				return "demo-code-complexity-beginner";
			case "intermediate":
				return "demo-code-complexity-intermediate";
			case "advanced":
				return "demo-code-complexity-advanced";
			default:
				return "demo-code-complexity-beginner";
		}
	}
</script>

<!-- Code Examples Showcase Container -->
<div class="demo-code-showcase {className}">
	<!-- Header -->
	<div class="demo-code-showcase-header">
		<div class="demo-code-showcase-title-section">
			<h2 class="demo-code-showcase-title">
				<Code2 size={24} />
				Interactive Code Examples Showcase
			</h2>
			<p class="demo-code-showcase-description">
				Explore our comprehensive library of {stats.total} code examples across multiple programming
				languages and technologies. Filter by language, complexity, or search for specific topics.
			</p>
		</div>

		<!-- Search and Filter Controls -->
		<div class="demo-code-showcase-controls">
			<!-- Search Bar -->
			<div class="demo-code-search-container">
				<Search size={16} />
				<input
					bind:this={searchInput}
					class="demo-code-search-input"
					type="text"
					placeholder="Search examples..."
					oninput={handleSearch}
				/>
			</div>

			<!-- Filter Toggle -->
			<button
				class="demo-code-filter-toggle"
				class:active={showFilters}
				onclick={toggleFilters}
				title="Toggle filters"
			>
				<Filter size={16} />
				Filters
				{#if selectedLanguages.length + selectedComplexities.length > 0}
					<span class="demo-code-active-filters">
						{selectedLanguages.length + selectedComplexities.length}
					</span>
				{/if}
			</button>

			<!-- Clear Filters -->
			{#if searchQuery || selectedLanguages.length > 0 || selectedComplexities.length > 0}
				<button class="demo-code-clear-filters" onclick={clearAllFilters} title="Clear all filters">
					<X size={16} />
					Clear
				</button>
			{/if}
		</div>
	</div>

	<!-- Statistics -->
	{#if showStats}
		<div class="demo-code-stats">
			<div class="demo-code-stat-item">
				<Code2 size={16} />
				<span class="demo-code-stat-value">{stats.filtered}</span>
				<span class="demo-code-stat-label">
					{stats.filtered === stats.total ? "Total" : "Filtered"} Examples
				</span>
			</div>

			<div class="demo-code-stat-item">
				<BarChart3 size={16} />
				<span class="demo-code-stat-value">{availableLanguages.length}</span>
				<span class="demo-code-stat-label">Languages</span>
			</div>

			<div class="demo-code-stat-item">
				<Tag size={16} />
				<span class="demo-code-stat-value">{availableComplexities.length}</span>
				<span class="demo-code-stat-label">Complexity Levels</span>
			</div>
		</div>
	{/if}

	<!-- Filters Panel -->
	{#if showFilters}
		<div class="demo-code-filters">
			<!-- Language Filters -->
			<div class="demo-code-filter-group">
				<h3 class="demo-code-filter-title">Languages</h3>
				<div class="demo-code-filter-options">
					{#each availableLanguages as language (language)}
						<button
							class="demo-code-filter-option"
							class:active={selectedLanguages.includes(language)}
							onclick={() => toggleLanguageFilter(language)}
						>
							{getLanguageDisplayName(language)}
							<span class="demo-code-filter-count">
								{stats.byLanguage[language as Language]}
							</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Complexity Filters -->
			<div class="demo-code-filter-group">
				<h3 class="demo-code-filter-title">Complexity</h3>
				<div class="demo-code-filter-options">
					{#each availableComplexities as complexity (complexity)}
						<button
							class="demo-code-filter-option {getComplexityColor(complexity)}"
							class:active={selectedComplexities.includes(complexity)}
							onclick={() => toggleComplexityFilter(complexity)}
						>
							{getComplexityDisplayName(complexity)}
							<span class="demo-code-filter-count">
								{stats.byComplexity[complexity as Complexity]}
							</span>
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Results -->
	<div class="demo-code-results">
		{#if filteredExamples.length === 0}
			<div class="demo-code-no-results">
				<Code2 size={48} />
				<h3>No examples found</h3>
				<p>Try adjusting your search terms or filters to find code examples.</p>
				<button class="demo-code-clear-filters-btn" onclick={clearAllFilters}>
					Clear all filters
				</button>
			</div>
		{:else}
			<div class="demo-code-grid">
				{#each filteredExamples as example (example.title + example.language)}
					<div class="demo-code-item">
						<CodeBlock {example} showLineNumbers={true} showCopyButton={true} showMetadata={true} />
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	/* Main Container */
	.demo-code-showcase {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	/* Header */
	.demo-code-showcase-header {
		margin-bottom: 2rem;
	}

	.demo-code-showcase-title-section {
		margin-bottom: 1.5rem;
	}

	.demo-code-showcase-title {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.75rem 0;
		color: hsl(var(--foreground));
	}

	.demo-code-showcase-description {
		font-size: 1.125rem;
		color: hsl(var(--muted-foreground));
		margin: 0;
		line-height: 1.6;
	}

	/* Controls */
	.demo-code-showcase-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.demo-code-search-container {
		position: relative;
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 250px;
	}

	.demo-code-search-container > :global(svg) {
		position: absolute;
		left: 1rem;
		color: hsl(var(--muted-foreground));
		pointer-events: none;
	}

	.demo-code-search-input {
		width: 100%;
		padding: 0.75rem 1rem 0.75rem 2.5rem;
		border: 1px solid hsl(var(--border));
		border-radius: 8px;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		font-size: 0.9rem;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.demo-code-search-input:focus {
		outline: none;
		border-color: hsl(var(--primary));
		box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
	}

	.demo-code-filter-toggle,
	.demo-code-clear-filters {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border: 1px solid hsl(var(--border));
		border-radius: 8px;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.demo-code-filter-toggle:hover,
	.demo-code-clear-filters:hover {
		background: hsl(var(--primary) / 0.1);
		color: hsl(var(--primary));
		border-color: hsl(var(--primary) / 0.3);
	}

	.demo-code-filter-toggle.active {
		background: hsl(var(--primary) / 0.1);
		color: hsl(var(--primary));
		border-color: hsl(var(--primary) / 0.3);
	}

	.demo-code-active-filters {
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border-radius: 50%;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.demo-code-clear-filters {
		background: hsl(var(--destructive) / 0.1);
		color: hsl(var(--destructive));
		border-color: hsl(var(--destructive) / 0.3);
	}

	.demo-code-clear-filters:hover {
		background: hsl(var(--destructive) / 0.2);
	}

	/* Statistics */
	.demo-code-stats {
		display: flex;
		gap: 2rem;
		padding: 1.5rem;
		background: hsl(var(--muted) / 0.3);
		border-radius: 12px;
		margin-bottom: 2rem;
	}

	.demo-code-stat-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.demo-code-stat-item > :global(svg) {
		color: hsl(var(--primary));
	}

	.demo-code-stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: hsl(var(--foreground));
	}

	.demo-code-stat-label {
		font-size: 0.9rem;
		color: hsl(var(--muted-foreground));
	}

	/* Filters */
	.demo-code-filters {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.demo-code-filter-group {
		margin-bottom: 1.5rem;
	}

	.demo-code-filter-group:last-child {
		margin-bottom: 0;
	}

	.demo-code-filter-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: hsl(var(--foreground));
	}

	.demo-code-filter-options {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.demo-code-filter-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.85rem;
	}

	.demo-code-filter-option:hover {
		background: hsl(var(--primary) / 0.1);
		color: hsl(var(--primary));
		border-color: hsl(var(--primary) / 0.3);
	}

	.demo-code-filter-option.active {
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border-color: hsl(var(--primary));
	}

	.demo-code-filter-count {
		font-size: 0.75rem;
		opacity: 0.8;
	}

	/* Complexity colors for filter options */
	.demo-code-filter-option.demo-code-complexity-beginner.active {
		background: hsl(142 76% 36%);
		border-color: hsl(142 76% 36%);
	}

	.demo-code-filter-option.demo-code-complexity-intermediate.active {
		background: hsl(38 92% 50%);
		border-color: hsl(38 92% 50%);
	}

	.demo-code-filter-option.demo-code-complexity-advanced.active {
		background: hsl(0 84% 60%);
		border-color: hsl(0 84% 60%);
	}

	/* Results */
	.demo-code-results {
		min-height: 400px;
	}

	.demo-code-grid {
		display: grid;
		gap: 2rem;
		grid-template-columns: 1fr;
	}

	.demo-code-item {
		animation: demo-code-fade-in 0.3s ease-out;
	}

	@keyframes demo-code-fade-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* No Results */
	.demo-code-no-results {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 4rem 2rem;
		color: hsl(var(--muted-foreground));
	}

	.demo-code-no-results > :global(svg) {
		margin-bottom: 1.5rem;
		opacity: 0.5;
	}

	.demo-code-no-results h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: hsl(var(--foreground));
	}

	.demo-code-no-results p {
		margin: 0 0 1.5rem 0;
		line-height: 1.6;
	}

	.demo-code-clear-filters-btn {
		padding: 0.75rem 1.5rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: background-color 0.2s ease;
		font-weight: 500;
	}

	.demo-code-clear-filters-btn:hover {
		background: hsl(var(--primary) / 0.9);
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.demo-code-showcase {
			padding: 1rem;
		}

		.demo-code-showcase-title {
			font-size: 1.5rem;
		}

		.demo-code-showcase-description {
			font-size: 1rem;
		}

		.demo-code-showcase-controls {
			flex-direction: column;
			align-items: stretch;
		}

		.demo-code-search-container {
			min-width: auto;
		}

		.demo-code-stats {
			flex-direction: column;
			gap: 1rem;
		}

		.demo-code-filter-options {
			justify-content: flex-start;
		}
	}

	@media (max-width: 480px) {
		.demo-code-showcase {
			padding: 0.5rem;
		}

		.demo-code-showcase-title {
			font-size: 1.25rem;
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.demo-code-filters {
			padding: 1rem;
		}

		.demo-code-filter-options {
			gap: 0.25rem;
		}

		.demo-code-filter-option {
			font-size: 0.8rem;
			padding: 0.4rem 0.6rem;
		}
	}
</style>
