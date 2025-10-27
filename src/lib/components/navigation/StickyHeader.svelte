<!--
	StickyHeader Component - Responsive Navigation Header

	Sticky navigation header with adaptive breadcrumb display, integrated search,
	and theme controls. Follows mobile-first responsive design principles.

	RESPONSIVE BEHAVIOR:
	- Mobile (<768px): Abbreviated chapter title + Sheet, search icon placeholder, theme toggle
	- Tablet (768-1023px): Abbreviated chapter title, inline search (320px)
	- Desktop (≥1024px): Abbreviated chapter title, inline search (400-480px)

	FEATURES:
	- Breadcrumb integration from breadcrumbStore
	- Responsive SearchBox (icon on mobile, input on desktop)
	- Theme toggle (always visible)
	- Mobile trigger (hamburger menu)
	- Proper z-index hierarchy (var(--z-header))
	- Semantic color variables (theme-aware)
	- Text truncation for long titles

	ARCHITECTURE:
	- Task 8B: Sticky Header Component
	- Integrates with Task 4 (SPA Navigation)
	- Uses breadcrumbStore (auto-updated by navigateToContent)
	- Mobile-first CSS with progressive enhancement

	@component StickyHeader
-->
<script lang="ts">
	import { breadcrumbStore } from "$lib/stores/breadcrumb";
	import SearchBox from "$lib/components/search/SearchBox.svelte";
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";
	import MobileTrigger from "$lib/components/navigation/MobileTrigger.svelte";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { Search } from "lucide-svelte";
	import type { BreadcrumbItem } from "$types";
	import BreadcrumbSheet from "$lib/components/navigation/BreadcrumbSheet.svelte";
	import { abbreviateChapterTitle } from "$lib/utils/breadcrumbAbbreviator";
	import { getAdjacentChapters, getUnitOverview } from "$lib/utils/navigationHelpers";

	interface Props {
		/**
		 * Additional CSS classes
		 */
		class?: string;
	}

	let { class: className = "" }: Props = $props();

	// Get breadcrumbs from store (auto-updated by navigation system)
	const breadcrumbs = $derived($breadcrumbStore);

	/**
	 * Current chapter: Show only the current chapter (last breadcrumb item)
	 * Used for both mobile and desktop to avoid cluttering the header
	 * Full hierarchy is available via BreadcrumbSheet on mobile
	 */
	const currentChapter = $derived<BreadcrumbItem | null>(
		breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null
	);

	/**
	 * Abbreviated title: Smart abbreviation for display (mobile + desktop)
	 */
	const abbreviatedTitle = $derived<string>(
		currentChapter ? abbreviateChapterTitle(currentChapter) : ""
	);

	/**
	 * Quick navigation: Get previous/next chapters and unit overview
	 */
	const quickNav = $derived(() => {
		if (!currentChapter) return { prev: undefined, next: undefined, unit: undefined };

		const { previousChapter, nextChapter } = getAdjacentChapters(currentChapter.id);
		const unitOverviewData = getUnitOverview(breadcrumbs);

		return {
			prev: previousChapter,
			next: nextChapter,
			unit: unitOverviewData
		};
	});
</script>

<!--
  REGRESSION FIX: Solid opaque background required for sticky header.
  DO NOT add transparency (bg-background/95) or blur (backdrop-blur-md) classes.
  Previous glassmorphism effect caused readability issues - header must be 100% opaque.
  See: Sticky Header Transparency Bug (recurring issue)
-->
<!-- Sticky Header Container -->
<header
	class="sticky top-0 flex min-h-16 items-center gap-2 border-b border-border bg-background px-4 md:gap-4 {className}"
	style:z-index="var(--z-header)"
>
	<!-- Mobile Trigger (Hamburger) - Visible only on mobile <768px -->
	<MobileTrigger class="md:hidden" />

	<!-- Mobile Breadcrumb: Abbreviated title + Sheet (<768px) -->
	{#if currentChapter}
		<div class="flex min-w-0 flex-1 items-center md:hidden">
			<BreadcrumbSheet
				{abbreviatedTitle}
				{breadcrumbs}
				previousChapter={quickNav().prev}
				nextChapter={quickNav().next}
				unitOverview={quickNav().unit}
			/>
		</div>
	{/if}

	<!-- Desktop Breadcrumb: Current chapter only (≥768px) -->
	{#if currentChapter}
		<nav class="hidden min-w-[200px] flex-1 flex-shrink-1 md:flex" aria-label="Breadcrumb">
			<Tooltip.Root>
				<Tooltip.Trigger>
					<span
						class="truncate rounded-md bg-accent/50 px-2 py-1 text-sm font-semibold text-primary"
						aria-current="page"
					>
						{abbreviatedTitle}
					</span>
				</Tooltip.Trigger>
				<Tooltip.Content side="bottom" class="max-w-xs">
					<p>{currentChapter.label}</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</nav>
	{/if}

	<!-- Search: Adaptive display -->
	<div class="flex flex-shrink-[3]">
		<!-- Mobile: Search icon placeholder (functionality pending) -->
		<button
			type="button"
			class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent md:hidden"
			aria-label="Search (coming soon)"
			disabled
		>
			<Search class="h-5 w-5 text-muted-foreground" />
		</button>

		<!-- Tablet: Flexible search (160-320px) - Compresses first -->
		<div class="hidden md:block lg:hidden">
			<SearchBox placeholder="Search..." class="w-full max-w-80 min-w-[160px]" />
		</div>

		<!-- Desktop: Flexible search (180-384px) - Compresses aggressively -->
		<div class="hidden lg:block xl:hidden">
			<SearchBox placeholder="Search lessons..." class="w-full max-w-96 min-w-[180px]" />
		</div>

		<!-- Wide Desktop: Flexible search (200-480px) - Maintains usability -->
		<div class="hidden xl:block">
			<SearchBox placeholder="Search lessons, code..." class="w-full max-w-[480px] min-w-[200px]" />
		</div>
	</div>

	<!-- Theme Toggle (always visible) -->
	<ThemeToggle />
</header>
