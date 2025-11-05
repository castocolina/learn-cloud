<!--
FlipCard Component Showcase

Interactive demonstration page for the production FlipCard component.
Displays various flipcard examples with different configurations and features.

URL: /showcase/flipcard

Features demonstrated:
- 3D flip animations
- Touch gestures (mobile)
- Keyboard navigation
- Dialog modal expansion
- Progress tracking
- Metadata display
-->

<script lang="ts">
	import FlipCard from "$lib/components/content/FlipCard.svelte";
	import { conceptCards } from "$data/demo/content/flipcards/concept-cards.js";
	import { flipCardProgressStore, calculateProgressStats } from "$lib/stores/flipcard-progress";
	import type { FlipCard as ProductionFlipCard } from "$types";

	// State for interaction tracking
	let totalFlips = $state(0);
	let lastFlippedCard = $state("");
	let completedCards = $state(new Set<string>());
	let masteredCards = $state(new Set<string>());

	// Adapter function to convert demo FlipCard to production FlipCard
	function adaptDemoCard(demoCard: (typeof conceptCards)[0]): ProductionFlipCard {
		return {
			id: demoCard.id,
			front: demoCard.front,
			back: demoCard.back,
			category: demoCard.category,
			education: {
				learningObjectives: demoCard.education.learningObjectives,
				prerequisites: demoCard.education.prerequisites,
				relatedConcepts: demoCard.education.relatedConcepts,
				estimatedTime: demoCard.education.estimatedLearningTime,
				difficulty: demoCard.complexity as "beginner" | "intermediate" | "advanced",
				keywords: demoCard.tags,
				tags: demoCard.tags,
				additionalResources: demoCard.education.additionalResources?.map((r) => ({
					...r,
					estimatedTime: undefined
				}))
			},
			animation: demoCard.animation,
			interaction: demoCard.interaction
				? {
						clickToInteract: demoCard.interaction.clickToFlip,
						touchGestures: demoCard.interaction.touchToFlip,
						keyboardNavigation: demoCard.interaction.keyboardNav,
						autoReset: demoCard.interaction.autoFlipBack,
						hoverToInteract: demoCard.interaction.hoverToFlip,
						focusToInteract: true
					}
				: undefined
		};
	}

	// Get sample cards for display (converted to production format)
	const sampleCards = conceptCards.slice(0, 6).map(adaptDemoCard);

	// Calculate progress statistics
	let progressStats = $derived(calculateProgressStats(sampleCards.length, $flipCardProgressStore));

	// Event handlers
	function handleFlip(cardId: string, isFlipped: boolean) {
		totalFlips++;
		lastFlippedCard = cardId;
		console.log(`Card ${cardId} flipped to ${isFlipped ? "back" : "front"}`);
	}

	function handleComplete(cardId: string) {
		completedCards.add(cardId);
		console.log(`Card ${cardId} completed`);
	}

	function handleMastered(cardId: string, mastered: boolean) {
		if (mastered) {
			masteredCards.add(cardId);
		} else {
			masteredCards.delete(cardId);
		}
		console.log(`Card ${cardId} mastered: ${mastered}`);
	}
</script>

<svelte:head>
	<title>FlipCard Component Showcase</title>
	<meta
		name="description"
		content="Interactive demonstration of the FlipCard component with 3D animations, touch gestures, and progress tracking"
	/>
</svelte:head>

<div class="container mx-auto max-w-7xl space-y-12 p-6">
	<!-- Header -->
	<header class="space-y-4">
		<h1 class="text-4xl font-bold">FlipCard Component Showcase</h1>
		<p class="text-lg text-muted-foreground">
			Interactive learning cards with 3D flip animations, touch gestures, keyboard navigation, and
			global progress tracking.
		</p>
	</header>

	<!-- Progress Statistics -->
	<section
		class="rounded-lg border border-border bg-muted/30 p-6"
		data-testid="progress-statistics"
	>
		<h2 class="mb-4 text-xl font-semibold">Progress Statistics</h2>
		<div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
			<div class="rounded-lg bg-background p-4">
				<p class="text-sm text-muted-foreground">Total Cards</p>
				<p class="text-2xl font-bold">{progressStats.totalCards}</p>
			</div>
			<div class="rounded-lg bg-background p-4">
				<p class="text-sm text-muted-foreground">Viewed</p>
				<p class="text-info text-2xl font-bold">
					{progressStats.viewedCards}
					<span class="text-sm font-normal">({progressStats.viewedPercentage}%)</span>
				</p>
			</div>
			<div class="rounded-lg bg-background p-4">
				<p class="text-sm text-muted-foreground">Completed</p>
				<p class="text-success text-2xl font-bold">
					{progressStats.completedCards}
					<span class="text-sm font-normal">({progressStats.completedPercentage}%)</span>
				</p>
			</div>
			<div class="rounded-lg bg-background p-4">
				<p class="text-sm text-muted-foreground">Mastered</p>
				<p class="text-2xl font-bold text-primary">
					{progressStats.masteredCards}
					<span class="text-sm font-normal">({progressStats.masteredPercentage}%)</span>
				</p>
			</div>
		</div>

		<div class="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
			<p>Total Flips: <span class="font-semibold text-foreground">{totalFlips}</span></p>
			{#if lastFlippedCard}
				<p>Last Flipped: <span class="font-semibold text-foreground">{lastFlippedCard}</span></p>
			{/if}
			{#if progressStats.averageTimePerCard > 0}
				<p>
					Avg Time: <span class="font-semibold text-foreground"
						>{progressStats.averageTimePerCard}s</span
					>
				</p>
			{/if}
		</div>
	</section>

	<!-- Instructions -->
	<section class="space-y-3 rounded-lg border border-border bg-accent/50 p-6">
		<h2 class="text-lg font-semibold">How to Use</h2>
		<ul class="space-y-2 text-sm text-muted-foreground">
			<li class="flex items-start gap-2">
				<span class="mt-0.5">🖱️</span>
				<span
					><strong>Desktop:</strong> Click card to flip, hover for controls, use keyboard (Space/Enter)</span
				>
			</li>
			<li class="flex items-start gap-2">
				<span class="mt-0.5">📱</span>
				<span><strong>Mobile:</strong> Tap card to flip, tap controls for actions</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="mt-0.5">⌨️</span>
				<span><strong>Keyboard:</strong> Tab to focus, Space/Enter to flip</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="mt-0.5">🔍</span>
				<span><strong>Expand:</strong> Click expand button for full-screen modal view</span>
			</li>
		</ul>
	</section>

	<!-- FlipCard Grid -->
	<section class="space-y-6">
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-semibold">Interactive Cards</h2>
			<p class="text-sm text-muted-foreground">
				{sampleCards.length} cards • Click to flip • Hover for controls
			</p>
		</div>

		<div
			class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
			data-testid="flipcard-grid"
		>
			{#each sampleCards as card (card.id)}
				<FlipCard
					{card}
					showMetadata={true}
					showProgress={true}
					onFlip={handleFlip}
					onComplete={handleComplete}
					onMastered={handleMastered}
				/>
			{/each}
		</div>
	</section>

	<!-- Features Section -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Component Features</h2>
		<div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
			<div class="space-y-2 rounded-lg border border-border p-4">
				<h3 class="font-semibold">🎨 3D Flip Animation</h3>
				<p class="text-sm text-muted-foreground">
					Smooth CSS-based 3D flip with backface-visibility for performance
				</p>
			</div>
			<div class="space-y-2 rounded-lg border border-border p-4">
				<h3 class="font-semibold">👆 Touch Gestures</h3>
				<p class="text-sm text-muted-foreground">
					Mobile-optimized touch handling with double-tap zoom prevention
				</p>
			</div>
			<div class="space-y-2 rounded-lg border border-border p-4">
				<h3 class="font-semibold">⌨️ Keyboard Navigation</h3>
				<p class="text-sm text-muted-foreground">
					Full keyboard support with Space/Enter to flip and Tab to navigate
				</p>
			</div>
			<div class="space-y-2 rounded-lg border border-border p-4">
				<h3 class="font-semibold">📊 Progress Tracking</h3>
				<p class="text-sm text-muted-foreground">
					Global localStorage-based progress with viewed, completed, and mastered states
				</p>
			</div>
			<div class="space-y-2 rounded-lg border border-border p-4">
				<h3 class="font-semibold">🔍 Modal Expansion</h3>
				<p class="text-sm text-muted-foreground">
					Full-screen Dialog integration for detailed study mode
				</p>
			</div>
			<div class="space-y-2 rounded-lg border border-border p-4">
				<h3 class="font-semibold">♿ Accessibility</h3>
				<p class="text-sm text-muted-foreground">
					WCAG 2.1 AA compliant with proper ARIA labels and 44px touch targets
				</p>
			</div>
		</div>
	</section>

	<!-- Technical Details -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Technical Implementation</h2>
		<div class="space-y-3 rounded-lg border border-border bg-muted/20 p-6 text-sm">
			<div>
				<strong>Component:</strong>
				<code class="ml-2 rounded bg-muted px-2 py-1">
					src/lib/components/content/FlipCard.svelte
				</code>
			</div>
			<div>
				<strong>Progress Store:</strong>
				<code class="ml-2 rounded bg-muted px-2 py-1">src/lib/stores/flipcard-progress.ts</code>
			</div>
			<div>
				<strong>Data Source:</strong>
				<code class="ml-2 rounded bg-muted px-2 py-1">
					src/data/demo/content/flipcards/concept-cards.ts
				</code>
			</div>
			<div>
				<strong>CSS Styles:</strong>
				<code class="ml-2 rounded bg-muted px-2 py-1">src/styles/components.css</code>
			</div>
		</div>
	</section>

	<!-- Dev Info -->
	<section class="rounded-lg border border-border bg-accent/30 p-6 text-sm text-muted-foreground">
		<p>
			<strong class="text-foreground">Test Data:</strong> Using
			{conceptCards.length} sample cards from cloud-native concepts
		</p>
		<p class="mt-2">
			<strong class="text-foreground">Storage:</strong> Progress persisted to localStorage under key
			<code class="rounded bg-muted px-1">demo-flipcard-progress</code>
		</p>
	</section>
</div>

<style>
	/* Ensure proper text color classes work */
	.text-info {
		color: hsl(var(--info));
	}

	.text-success {
		color: hsl(var(--success));
	}

	.text-primary {
		color: hsl(var(--primary));
	}
</style>
