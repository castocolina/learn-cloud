<script lang="ts">
	/**
	 * BreadcrumbSheet Component - Mobile Progressive Disclosure
	 *
	 * Implements Strategy A: Smart Abbreviation + Progressive Disclosure
	 * using shadcn Sheet component for bottom drawer navigation.
	 *
	 * Features:
	 * - Abbreviated breadcrumb trigger button
	 * - Full hierarchy display (Home → Unit → Chapter)
	 * - Quick navigation (prev/next chapter, unit overview)
	 * - WCAG 2.1 AA compliant (≥44x44px touch targets)
	 * - Keyboard accessible (Tab, Enter, Escape)
	 *
	 * @component BreadcrumbSheet
	 */

	import * as Sheet from "$lib/components/ui/sheet";
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import { ChevronDown, ChevronUp, Home, ChevronLeft, ChevronRight, ArrowUp } from "lucide-svelte";
	import type { BreadcrumbItem, AdjacentChapters, UnitOverviewLink } from "$types";
	import { getFullBreadcrumbHierarchy } from "$lib/utils/breadcrumbAbbreviator";

	interface Props {
		/** Abbreviated title for mobile display (from abbreviateChapterTitle) */
		abbreviatedTitle: string;

		/** Full breadcrumb hierarchy (Home → Unit → Chapter) */
		breadcrumbs: BreadcrumbItem[];

		/** Previous chapter for quick navigation */
		previousChapter?: AdjacentChapters["previousChapter"];

		/** Next chapter for quick navigation */
		nextChapter?: AdjacentChapters["nextChapter"];

		/** Unit overview link for quick navigation */
		unitOverview?: UnitOverviewLink;
	}

	let { abbreviatedTitle, breadcrumbs, previousChapter, nextChapter, unitOverview }: Props =
		$props();

	let open = $state(false);

	const fullHierarchy = $derived(getFullBreadcrumbHierarchy(breadcrumbs));

	function navigateToUrl(url: string): void {
		window.location.hash = url;
		open = false;
	}
</script>

<Sheet.Root bind:open>
	<!-- Trigger: Abbreviated breadcrumb button -->
	<Sheet.Trigger>
		<button
			class="flex min-w-0 flex-1 items-center justify-start gap-2 truncate rounded-md px-2 py-1 text-sm font-semibold transition-colors hover:bg-accent hover:text-primary"
			aria-label="Show full navigation: {abbreviatedTitle}"
			aria-expanded={open}
			aria-haspopup="dialog"
		>
			<span class="truncate">{abbreviatedTitle}</span>
			{#if open}
				<ChevronUp class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
			{:else}
				<ChevronDown class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
			{/if}
		</button>
	</Sheet.Trigger>

	<!-- Sheet Content: Full breadcrumb hierarchy + quick navigation -->
	<Sheet.Content side="bottom" class="h-auto max-h-[80vh]">
		<Sheet.Header>
			<Sheet.Title class="flex items-center gap-2 text-base">
				<span class="text-lg">📍</span>
				You are here:
			</Sheet.Title>
		</Sheet.Header>

		<!-- Full Breadcrumb Hierarchy -->
		<nav aria-label="Full breadcrumb navigation" class="mt-4">
			<ol class="space-y-2" role="list">
				{#each fullHierarchy as crumb, index (crumb.id)}
					<li role="listitem">
						<Button
							variant={crumb.isActive ? "secondary" : "ghost"}
							class="w-full justify-start gap-2 text-left {crumb.isActive ? 'font-bold' : ''}"
							onclick={() => navigateToUrl(crumb.url)}
							aria-current={crumb.isActive ? "page" : undefined}
							aria-label="Navigate to {crumb.label}"
						>
							{#if index === 0}
								<Home class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
							{:else}
								<span class="flex-shrink-0 text-base" aria-hidden="true">
									{crumb.emoji || "📖"}
								</span>
							{/if}
							<span class="flex-1 truncate">{crumb.label}</span>
						</Button>
					</li>
				{/each}
			</ol>
		</nav>

		<!-- Quick Navigation -->
		{#if previousChapter || nextChapter || unitOverview}
			<Separator class="my-4" />

			<div class="space-y-2" role="navigation" aria-label="Quick navigation to adjacent chapters">
				<p class="text-sm font-medium text-muted-foreground">⚡ Quick Navigation</p>

				{#if previousChapter}
					<Button
						variant="outline"
						class="w-full justify-start gap-2 text-left"
						onclick={() => navigateToUrl(previousChapter.url)}
						aria-label="Previous chapter: {previousChapter.title}"
					>
						<ChevronLeft class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
						<span class="flex-1 truncate">{previousChapter.title}</span>
					</Button>
				{/if}

				{#if nextChapter}
					<Button
						variant="outline"
						class="w-full justify-start gap-2 text-left"
						onclick={() => navigateToUrl(nextChapter.url)}
						aria-label="Next chapter: {nextChapter.title}"
					>
						<ChevronRight class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
						<span class="flex-1 truncate">{nextChapter.title}</span>
					</Button>
				{/if}

				{#if unitOverview}
					<Button
						variant="outline"
						class="w-full justify-start gap-2 text-left"
						onclick={() => navigateToUrl(unitOverview.url)}
						aria-label="Unit overview: {unitOverview.title}"
					>
						<ArrowUp class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
						<span class="flex-1 truncate">{unitOverview.title}</span>
					</Button>
				{/if}
			</div>
		{/if}

		<Sheet.Footer class="mt-4">
			<Sheet.Close>
				<Button variant="outline" class="w-full">Close</Button>
			</Sheet.Close>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
