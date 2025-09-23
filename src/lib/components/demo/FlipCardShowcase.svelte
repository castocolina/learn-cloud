<script lang="ts">
	import { Search, Filter, RotateCcw, Trophy, Brain } from "lucide-svelte";
	import FlipCard from "./FlipCard.svelte";
	import type {
		FlipCard as FlipCardType,
		FlipCardCategory,
		FlipCardComplexity
	} from "$data/demo/content/flipcards/concept-cards.js";
	import {
		conceptCards,
		getFlipCardsByCategory,
		getFlipCardsByComplexity,
		searchFlipCards,
		getFlipCardStats
	} from "$data/demo/content/flipcards/concept-cards.js";

	// Props interface
	interface Props {
		className?: string;
		showStats?: boolean;
		maxCards?: number;
		defaultCategory?: FlipCardCategory | "all";
		defaultComplexity?: FlipCardComplexity | "all";
	}

	let {
		className = "",
		showStats = true,
		maxCards = 20,
		defaultCategory = "all",
		defaultComplexity = "all"
	}: Props = $props();

	// Svelte 5 state management
	let searchQuery = $state("");
	let selectedCategory = $state<FlipCardCategory | "all">(defaultCategory);
	let selectedComplexity = $state<FlipCardComplexity | "all">(defaultComplexity);
	let showFilters = $state(false);
	let masteredCards = $state<Set<string>>(new Set());
	let cardProgress = $state<Map<string, Record<string, unknown>>>(new Map());

	// Get statistics
	let stats = $derived(getFlipCardStats());

	// Get unique categories and complexities for filters
	let categories = $derived<FlipCardCategory[]>([
		...new Set(conceptCards.map((card) => card.category))
	]);
	let complexities = $derived<FlipCardComplexity[]>([
		...new Set(conceptCards.map((card) => card.complexity))
	]);

	// Filtered cards based on search and filters
	let filteredCards = $derived.by(() => {
		let cards: FlipCardType[] = conceptCards;

		// Apply search filter
		if (searchQuery.trim()) {
			cards = searchFlipCards(searchQuery.trim());
		}

		// Apply category filter
		if (selectedCategory !== "all") {
			cards = cards.filter((card) => card.category === selectedCategory);
		}

		// Apply complexity filter
		if (selectedComplexity !== "all") {
			cards = cards.filter((card) => card.complexity === selectedComplexity);
		}

		// Limit results
		return cards.slice(0, maxCards);
	});

	// Progress statistics
	let progressStats = $derived.by(() => {
		const totalCards = filteredCards.length;
		const viewedCards = filteredCards.filter((card) => cardProgress.get(card.id)?.viewed).length;
		const flippedCards = filteredCards.filter((card) => cardProgress.get(card.id)?.flipped).length;
		const masteredCardsCount = masteredCards.size;

		return {
			total: totalCards,
			viewed: viewedCards,
			flipped: flippedCards,
			mastered: masteredCardsCount,
			viewedPercentage: totalCards > 0 ? Math.round((viewedCards / totalCards) * 100) : 0,
			flippedPercentage: totalCards > 0 ? Math.round((flippedCards / totalCards) * 100) : 0,
			masteredPercentage: totalCards > 0 ? Math.round((masteredCardsCount / totalCards) * 100) : 0
		};
	});

	// Handle card flip events
	function handleCardFlip(cardId: string, isFlipped: boolean) {
		const current = cardProgress.get(cardId) || {};
		cardProgress.set(cardId, {
			...current,
			flipped: isFlipped || (current.flipped as boolean),
			viewed: true,
			viewCount: ((current.viewCount as number) || 0) + 1,
			lastViewed: new Date()
		});
	}

	// Handle mastered toggle
	function handleCardMastered(cardId: string, mastered: boolean) {
		if (mastered) {
			masteredCards.add(cardId);
		} else {
			masteredCards.delete(cardId);
		}
		masteredCards = new Set(masteredCards); // Trigger reactivity
	}

	// Clear all filters
	function clearFilters() {
		searchQuery = "";
		selectedCategory = "all";
		selectedComplexity = "all";
	}

	// Reset all progress
	function resetProgress() {
		cardProgress.clear();
		masteredCards.clear();
		cardProgress = new Map(); // Trigger reactivity
		masteredCards = new Set(); // Trigger reactivity
	}

	// Format category for display
	function formatCategory(category: string): string {
		return category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
	}

	// Format complexity for display
	function formatComplexity(complexity: string): string {
		return complexity.charAt(0).toUpperCase() + complexity.slice(1);
	}
</script>

<div class="demo-flipcard-showcase {className}">
	<!-- Header Section -->
	<div class="demo-flipcard-showcase-header">
		<div class="demo-flipcard-showcase-title-section">
			<h2 class="demo-flipcard-showcase-title">Interactive Flip Card Learning</h2>
			<p class="demo-flipcard-showcase-description">
				Master cloud-native concepts with interactive flip cards. Click any card to reveal detailed
				explanations, learning objectives, and track your progress.
			</p>
		</div>

		{#if showStats}
			<div class="demo-flipcard-showcase-stats">
				<div class="demo-flipcard-stat-card">
					<div class="demo-flipcard-stat-number">{stats.total}</div>
					<div class="demo-flipcard-stat-label">Total Concepts</div>
				</div>
				<div class="demo-flipcard-stat-card">
					<div class="demo-flipcard-stat-number">{stats.categories}</div>
					<div class="demo-flipcard-stat-label">Categories</div>
				</div>
				<div class="demo-flipcard-stat-card">
					<div class="demo-flipcard-stat-number">{stats.averageLearningTime}m</div>
					<div class="demo-flipcard-stat-label">Avg. Time</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Search and Filter Controls -->
	<div class="demo-flipcard-showcase-controls">
		<div class="demo-flipcard-search-section">
			<div class="demo-flipcard-search-input-wrapper">
				<Search size={18} class="demo-flipcard-search-icon" />
				<input
					type="text"
					placeholder="Search flip cards..."
					class="demo-flipcard-search-input"
					bind:value={searchQuery}
					aria-label="Search flip cards"
				/>
			</div>
		</div>

		<div class="demo-flipcard-filter-section">
			<button
				type="button"
				class="demo-flipcard-filter-toggle"
				onclick={() => (showFilters = !showFilters)}
				aria-expanded={showFilters}
			>
				<Filter size={16} />
				Filters
			</button>

			{#if showFilters}
				<div class="demo-flipcard-filter-panel">
					<!-- Category Filter -->
					<div class="demo-flipcard-filter-group">
						<label for="category-filter" class="demo-flipcard-filter-label">Category</label>
						<select
							id="category-filter"
							class="demo-flipcard-filter-select"
							bind:value={selectedCategory}
						>
							<option value="all">All Categories</option>
							{#each categories as category (category)}
								<option value={category}>{formatCategory(category)}</option>
							{/each}
						</select>
					</div>

					<!-- Complexity Filter -->
					<div class="demo-flipcard-filter-group">
						<label for="complexity-filter" class="demo-flipcard-filter-label">Complexity</label>
						<select
							id="complexity-filter"
							class="demo-flipcard-filter-select"
							bind:value={selectedComplexity}
						>
							<option value="all">All Levels</option>
							{#each complexities as complexity (complexity)}
								<option value={complexity}>{formatComplexity(complexity)}</option>
							{/each}
						</select>
					</div>

					<div class="demo-flipcard-filter-actions">
						<button type="button" class="demo-flipcard-clear-filters-btn" onclick={clearFilters}>
							<RotateCcw size={14} />
							Clear
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Progress Overview -->
	{#if progressStats.total > 0}
		<div class="demo-flipcard-progress-overview">
			<div class="demo-flipcard-progress-stats">
				<div class="demo-flipcard-progress-stat">
					<Brain size={16} />
					<span class="demo-flipcard-progress-label">Viewed:</span>
					<span class="demo-flipcard-progress-value">
						{progressStats.viewed}/{progressStats.total} ({progressStats.viewedPercentage}%)
					</span>
				</div>
				<div class="demo-flipcard-progress-stat">
					<RotateCcw size={16} />
					<span class="demo-flipcard-progress-label">Flipped:</span>
					<span class="demo-flipcard-progress-value">
						{progressStats.flipped}/{progressStats.total} ({progressStats.flippedPercentage}%)
					</span>
				</div>
				<div class="demo-flipcard-progress-stat">
					<Trophy size={16} />
					<span class="demo-flipcard-progress-label">Mastered:</span>
					<span class="demo-flipcard-progress-value">
						{progressStats.mastered}/{progressStats.total} ({progressStats.masteredPercentage}%)
					</span>
				</div>
			</div>
			<button type="button" class="demo-flipcard-reset-progress-btn" onclick={resetProgress}>
				Reset Progress
			</button>
		</div>
	{/if}

	<!-- Results Count -->
	<div class="demo-flipcard-results-header">
		<h3 class="demo-flipcard-results-count">
			{filteredCards.length} card{filteredCards.length !== 1 ? "s" : ""} found
		</h3>
		{#if searchQuery || selectedCategory !== "all" || selectedComplexity !== "all"}
			<button type="button" class="demo-flipcard-clear-search-btn" onclick={clearFilters}>
				Clear filters
			</button>
		{/if}
	</div>

	<!-- Flip Cards Grid -->
	<div class="demo-flipcard-container">
		{#each filteredCards as card (card.id)}
			<FlipCard
				{card}
				onFlip={handleCardFlip}
				onMastered={handleCardMastered}
				showMetadata={true}
				showProgress={true}
			/>
		{/each}
	</div>

	<!-- No Results Message -->
	{#if filteredCards.length === 0}
		<div class="demo-flipcard-no-results">
			<div class="demo-flipcard-no-results-icon">🔍</div>
			<h3 class="demo-flipcard-no-results-title">No cards found</h3>
			<p class="demo-flipcard-no-results-message">
				Try adjusting your search terms or filters to find more cards.
			</p>
			<button type="button" class="demo-flipcard-no-results-button" onclick={clearFilters}>
				Clear all filters
			</button>
		</div>
	{/if}
</div>
