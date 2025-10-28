<!--
	StickyHeader Component - Responsive Navigation Header

	Sticky navigation header with hybrid adaptive breadcrumb display, integrated search,
	and theme controls. Follows mobile-first responsive design principles.

	HYBRID ADAPTIVE BREADCRUMB STRATEGY:
	- Ultra-Mobile (≤390px): Unit emoji only with tooltip showing shortName
	  * Space-constrained design (44×44px WCAG-compliant touch target)
	  * Tooltip reveals unit shortName on hover/tap
	- Tablet (391-767px): Unit emoji + shortName
	  * Compact representation (e.g., "🐍 Python")
	  * Balances space and context
	- Desktop (≥768px): Full breadcrumb trail
	  * Complete navigation path (Home → Unit → Chapter)
	  * Maximum navigation context

	RESPONSIVE BEHAVIOR:
	- Mobile (<768px): Hybrid adaptive unit breadcrumb, search icon placeholder, theme toggle
	- Tablet (768-1023px): Full breadcrumb trail, inline search (320px)
	- Desktop (≥1024px): Full breadcrumb trail, inline search (400-480px)

	FEATURES:
	- Breadcrumb integration from breadcrumbStore
	- Unit data from contentMenu (shortName, emoji)
	- Responsive SearchBox (icon on mobile, input on desktop)
	- Theme toggle (always visible)
	- Mobile trigger (hamburger menu)
	- Proper z-index hierarchy (var(--z-header))
	- Semantic color variables (theme-aware)
	- WCAG 2.1 AA compliance (≥44px touch targets)

	ARCHITECTURE:
	- Task 8B: Sticky Header Component with Hybrid Adaptive Breadcrumb
	- Integrates with Task 4 (SPA Navigation)
	- Uses breadcrumbStore (auto-updated by navigateToContent)
	- Uses contentMenu for unit metadata (shortName, emoji)
	- Mobile-first CSS with progressive enhancement

	@component StickyHeader
-->
<script lang="ts">
	import { breadcrumbStore } from "$lib/stores/breadcrumb";
	import { contentMenu } from "$data/generated/content-menu";
	import SearchBox from "$lib/components/search/SearchBox.svelte";
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";
	import MobileTrigger from "$lib/components/navigation/MobileTrigger.svelte";
	import BreadcrumbSheet from "$lib/components/navigation/BreadcrumbSheet.svelte";
	import { Search } from "lucide-svelte";
	import type { BreadcrumbItem } from "$types";
	import { getFullBreadcrumbHierarchy } from "$lib/utils/navigationHelpers";

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
	 * Current chapter (last breadcrumb item) - for BreadcrumbSheet
	 */
	const currentChapter = $derived<BreadcrumbItem | null>(
		breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null
	);

	/**
	 * Breadcrumb data for BreadcrumbSheet component
	 *
	 * ARCHITECTURE: CSS-First Progressive Disclosure (Material Design 3)
	 * - Extract unit emoji, shortName, and chapter title
	 * - Pass as separate props to BreadcrumbSheet
	 * - BreadcrumbSheet handles responsive display with CSS media queries
	 * - No JavaScript viewport detection needed (performance + standards)
	 *
	 * RESPONSIVE LOGIC (handled by BreadcrumbSheet CSS):
	 * - Mobile ≤480px: Show emoji + chapter only
	 * - Tablet 481-767px: Show emoji + shortName + chapter (if chapter < 30 chars)
	 * - Desktop ≥768px: Show all with intelligent truncation
	 */
	const breadcrumbData = $derived.by(() => {
		if (!currentChapter) return null;

		// Get unit info for emoji and shortName
		const unitBreadcrumb = breadcrumbs.find((crumb) => crumb.label.startsWith("Unit "));
		let unitEmoji = "";
		let unitShortName = "";

		if (unitBreadcrumb) {
			const unitMatch = unitBreadcrumb.label.match(/^Unit (\d+):/);
			if (unitMatch) {
				const unitNumber = parseInt(unitMatch[1], 10);
				const unit = contentMenu.units.find((u) => u.unitNumber === unitNumber);
				if (unit) {
					unitEmoji = unit.emoji || "";
					unitShortName = unit.shortName || "";
				}
			}
		}

		const chapterTitle = currentChapter.label;

		return {
			emoji: unitEmoji,
			shortName: unitShortName,
			chapterTitle,
			isShortChapter: chapterTitle.length < 30
		};
	});

	/**
	 * Full breadcrumb hierarchy with emoji enrichment for Sheet
	 */
	const fullHierarchy = $derived<BreadcrumbItem[]>(getFullBreadcrumbHierarchy(breadcrumbs));
</script>

<!--
  REGRESSION FIX: Solid opaque background required for sticky header.
  DO NOT add transparency (bg-background/95) or blur (backdrop-blur-md) classes.
  Previous glassmorphism effect caused readability issues - header must be 100% opaque.
  See: Sticky Header Transparency Bug (recurring issue)
-->
<!-- Sticky Header Container -->
<header
	class="sticky-header-enhanced sticky top-0 flex min-h-16 items-center gap-2 border-b-2 border-slate-400 bg-background px-2 md:gap-4 md:px-4 dark:border-slate-600 {className}"
	style:z-index="var(--z-header)"
>
	<!-- Mobile Trigger (Hamburger) - Visible only on mobile <768px -->
	<MobileTrigger class="md:hidden" />

	<!--
		UNIFIED BREADCRUMB STRATEGY (All screen sizes):
		- Progressive Disclosure Pattern (Material Design 3)
		- CSS-First responsive display (no JavaScript)
		- Priority: Chapter title always visible
		- Tap opens Sheet with full hierarchy + quick navigation
		- Sheet slides from bottom (WCAG 44px touch targets)
	-->

	<!-- BreadcrumbSheet: Universal navigation with CSS-based responsive display -->
	{#if breadcrumbData}
		<div class="flex min-w-0 flex-1 items-center">
			<BreadcrumbSheet
				emoji={breadcrumbData.emoji}
				shortName={breadcrumbData.shortName}
				chapterTitle={breadcrumbData.chapterTitle}
				isShortChapter={breadcrumbData.isShortChapter}
				breadcrumbs={fullHierarchy}
			/>
		</div>
	{/if}

	<!-- Search: Adaptive display with aggressive compression on narrow viewports -->
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

		<!-- Adaptive SearchBox: Single component with CSS-driven responsive width -->
		<div class="hidden md:block">
			<SearchBox
				placeholder="Search..."
				class="adaptive-search-box w-full min-w-[100px] md:max-w-[120px] md:min-[851px]:max-w-[160px] md:min-[951px]:max-w-80 lg:max-w-96 xl:max-w-[480px]"
			/>
		</div>
	</div>

	<!-- Theme Toggle (always visible) -->
	<ThemeToggle />
</header>
