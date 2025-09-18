<script lang="ts">
	import { onMount } from "svelte";
	import MermaidDiagram from "./MermaidDiagram.svelte";
	import {
		mermaidExamples,
		searchDiagrams,
		getDiagramStats,
		type MermaidExample,
		type MermaidDiagramType,
		type ComplexityLevel,
		type DiagramCategory
	} from "../../../data/demo/content/diagrams/mermaid-examples.js";

	interface Props {
		initialFilter?: string;
		showStats?: boolean;
	}

	let { initialFilter = "all", showStats = true }: Props = $props();

	// Reactive state
	let filteredDiagrams: MermaidExample[] = $state(mermaidExamples);
	let searchQuery = $state("");
	let selectedType: MermaidDiagramType | "all" = $state("all");
	let selectedComplexity: ComplexityLevel | "all" = $state("all");
	let selectedCategory: DiagramCategory | "all" = $state("all");
	let isLoading = $state(true);

	// Computed values
	let stats = $derived(getDiagramStats());

	// Filter diagrams based on current filters
	function applyFilters() {
		let filtered = mermaidExamples;

		// Apply search query
		if (searchQuery.trim()) {
			filtered = searchDiagrams(searchQuery.trim());
		}

		// Apply type filter
		if (selectedType !== "all") {
			filtered = filtered.filter((diagram: MermaidExample) => diagram.type === selectedType);
		}

		// Apply complexity filter
		if (selectedComplexity !== "all") {
			filtered = filtered.filter(
				(diagram: MermaidExample) => diagram.complexity === selectedComplexity
			);
		}

		// Apply category filter
		if (selectedCategory !== "all") {
			filtered = filtered.filter(
				(diagram: MermaidExample) => diagram.category === selectedCategory
			);
		}

		filteredDiagrams = filtered;
	}

	// React to filter changes
	$effect(() => {
		applyFilters();
	});

	// Reset all filters
	function resetFilters() {
		searchQuery = "";
		selectedType = "all";
		selectedComplexity = "all";
		selectedCategory = "all";
	}

	// Initialize component
	onMount(() => {
		// Apply initial filter if provided
		if (initialFilter !== "all") {
			selectedType = initialFilter as MermaidDiagramType;
		}
		isLoading = false;
	});
</script>

<div class="demo-mermaid-showcase">
	<!-- Header and Stats -->
	<div class="demo-showcase-header">
		<div>
			<h2 class="demo-showcase-title">Mermaid Diagram Showcase</h2>
			<p class="demo-showcase-description">
				Comprehensive collection of educational Mermaid diagrams for cloud-native learning
			</p>
		</div>

		{#if showStats}
			<div class="demo-showcase-stats">
				<div class="demo-stat-item">
					<span class="demo-stat-number">{stats.total}</span>
					<span class="demo-stat-label">Total Diagrams</span>
				</div>
				<div class="demo-stat-item">
					<span class="demo-stat-number">{Object.keys(stats.byType).length}</span>
					<span class="demo-stat-label">Diagram Types</span>
				</div>
				<div class="demo-stat-item">
					<span class="demo-stat-number">{filteredDiagrams.length}</span>
					<span class="demo-stat-label">Filtered Results</span>
				</div>
			</div>
		{/if}
	</div>

	<!-- Search and Filters -->
	<div class="demo-showcase-controls">
		<!-- Search Input -->
		<div class="demo-search-container">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search diagrams by title, description, or tags..."
				class="demo-search-input"
			/>
		</div>

		<!-- Filter Controls -->
		<div class="demo-filter-controls">
			<!-- Type Filter -->
			<select bind:value={selectedType} class="demo-filter-select">
				<option value="all">All Types</option>
				<option value="flowchart">Flowcharts</option>
				<option value="sequence">Sequence Diagrams</option>
				<option value="class">Class Diagrams</option>
				<option value="er">ER Diagrams</option>
				<option value="state">State Diagrams</option>
				<option value="gitgraph">Git Graphs</option>
				<option value="journey">Journey Maps</option>
			</select>

			<!-- Complexity Filter -->
			<select bind:value={selectedComplexity} class="demo-filter-select">
				<option value="all">All Complexity</option>
				<option value="basic">Basic</option>
				<option value="intermediate">Intermediate</option>
				<option value="advanced">Advanced</option>
			</select>

			<!-- Category Filter -->
			<select bind:value={selectedCategory} class="demo-filter-select">
				<option value="all">All Categories</option>
				<option value="system-architecture">System Architecture</option>
				<option value="database-design">Database Design</option>
				<option value="workflow">Workflow</option>
				<option value="development">Development</option>
				<option value="user-experience">User Experience</option>
				<option value="business-logic">Business Logic</option>
				<option value="security">Security</option>
			</select>

			<!-- Reset Button -->
			<button onclick={resetFilters} class="demo-reset-button"> Reset Filters </button>
		</div>
	</div>

	<!-- Loading State -->
	{#if isLoading}
		<div class="demo-showcase-loading">
			<div class="demo-loading-spinner"></div>
			<span>Loading diagrams...</span>
		</div>
	{:else}
		<!-- Results -->
		{#if filteredDiagrams.length === 0}
			<div class="demo-showcase-empty">
				<div class="demo-empty-icon">🔍</div>
				<h3>No diagrams found</h3>
				<p>Try adjusting your search terms or filters.</p>
				<button onclick={resetFilters} class="demo-empty-reset"> Reset All Filters </button>
			</div>
		{:else}
			<!-- Diagram List - Single Column Vertical Layout -->
			<div class="demo-diagram-list">
				{#each filteredDiagrams as diagram (diagram.id)}
					<div class="demo-diagram-card">
						<!-- Card Header -->
						<div class="demo-card-header">
							<h3 class="demo-card-title">{diagram.title}</h3>
							<div class="demo-card-badges">
								<span class="demo-badge demo-badge-type">{diagram.type}</span>
								<span class="demo-badge demo-badge-complexity demo-badge-{diagram.complexity}">
									{diagram.complexity}
								</span>
							</div>
						</div>

						<!-- Card Description -->
						<p class="demo-card-description">{diagram.description}</p>

						<!-- Tags -->
						{#if diagram.tags.length > 0}
							<div class="demo-card-tags">
								{#each diagram.tags.slice(0, 3) as tag, index (index)}
									<span class="demo-tag">{tag}</span>
								{/each}
								{#if diagram.tags.length > 3}
									<span class="demo-tag demo-tag-more">+{diagram.tags.length - 3} more</span>
								{/if}
							</div>
						{/if}

						<!-- Diagram Rendering -->
						<div class="demo-card-diagram">
							<MermaidDiagram
								diagram={diagram.diagram}
								title={diagram.title}
								className="demo-card-mermaid"
							/>
						</div>

						<!-- Learning Objectives -->
						{#if diagram.learningObjectives.length > 0}
							<details class="demo-card-objectives">
								<summary>Learning Objectives</summary>
								<ul>
									{#each diagram.learningObjectives as objective, index (index)}
										<li>{objective}</li>
									{/each}
								</ul>
							</details>
						{/if}

						<!-- Use Cases -->
						{#if diagram.useCases.length > 0}
							<details class="demo-card-usecases">
								<summary>Use Cases</summary>
								<ul>
									{#each diagram.useCases as useCase, index (index)}
										<li>{useCase}</li>
									{/each}
								</ul>
							</details>
						{/if}

						<!-- Explanation -->
						<details class="demo-card-explanation">
							<summary>Explanation</summary>
							<p>{diagram.explanation}</p>
						</details>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
