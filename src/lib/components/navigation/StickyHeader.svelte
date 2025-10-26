<!--
	StickyHeader Component - Responsive Navigation Header

	Sticky navigation header with adaptive breadcrumb display, integrated search,
	and theme controls. Follows mobile-first responsive design principles.

	RESPONSIVE BEHAVIOR:
	- Mobile (<768px): Current chapter title, search icon placeholder, theme toggle
	- Tablet (768-1023px): Home → Unit breadcrumb, inline search (320px)
	- Desktop (≥1024px): Full breadcrumb trail, inline search (400-480px)

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
	import { ChevronRight, Search } from "lucide-svelte";
	import type { BreadcrumbItem } from "$types";

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
	 * Mobile breadcrumb: Show only the current chapter (last breadcrumb item)
	 * Provides context without cluttering the mobile header
	 */
	const mobileBreadcrumb = $derived<BreadcrumbItem | null>(
		breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null
	);

	/**
	 * Desktop breadcrumb: Show full trail
	 * Provides complete navigation context
	 */
	const desktopBreadcrumb = $derived<BreadcrumbItem[]>(breadcrumbs);

	/**
	 * Navigate to breadcrumb URL
	 */
	function handleBreadcrumbClick(url: string): void {
		if (url) {
			window.location.hash = url;
		}
	}
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

	<!-- Mobile Breadcrumb: Current chapter only (<768px) -->
	{#if mobileBreadcrumb}
		<div class="flex min-w-0 flex-1 items-center md:hidden">
			<Tooltip.Root>
				<Tooltip.Trigger>
					<button
						type="button"
						onclick={() => handleBreadcrumbClick(mobileBreadcrumb.url)}
						class="min-w-0 cursor-pointer truncate rounded-md px-2 py-1 text-sm font-semibold text-foreground transition-all hover:bg-accent hover:text-primary"
						aria-label="Current chapter: {mobileBreadcrumb.label}"
					>
						{mobileBreadcrumb.label}
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content side="bottom" class="max-w-xs">
					<p>{mobileBreadcrumb.label}</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
	{/if}

	<!-- Desktop Breadcrumb: Full trail (≥768px) -->
	<nav class="hidden min-w-[200px] flex-1 flex-shrink-1 md:flex" aria-label="Breadcrumb">
		<ol class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm lg:flex-nowrap">
			{#each desktopBreadcrumb as crumb, index (crumb.id)}
				<li
					class="breadcrumb-item flex min-w-0 items-center gap-2"
					data-priority={index === desktopBreadcrumb.length - 1
						? "high"
						: index === desktopBreadcrumb.length - 2
							? "medium"
							: "low"}
				>
					{#if index > 0}
						<ChevronRight class="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
					{/if}

					{#if crumb.isClickable}
						<Tooltip.Root>
							<Tooltip.Trigger>
								<button
									type="button"
									onclick={() => handleBreadcrumbClick(crumb.url)}
									class="breadcrumb-link cursor-pointer truncate rounded-md px-2 py-1 text-sm font-medium text-foreground transition-all hover:bg-accent hover:text-primary hover:underline hover:decoration-2 hover:underline-offset-4"
									aria-current={crumb.isActive ? "page" : undefined}
								>
									{crumb.label}
								</button>
							</Tooltip.Trigger>
							<Tooltip.Content side="bottom" class="max-w-xs">
								<p>{crumb.label}</p>
							</Tooltip.Content>
						</Tooltip.Root>
					{:else}
						<Tooltip.Root>
							<Tooltip.Trigger>
								<span
									class="breadcrumb-text truncate rounded-md bg-accent/50 px-2 py-1 text-sm font-semibold text-primary"
									aria-current="page"
								>
									{crumb.label}
								</span>
							</Tooltip.Trigger>
							<Tooltip.Content side="bottom" class="max-w-xs">
								<p>{crumb.label}</p>
							</Tooltip.Content>
						</Tooltip.Root>
					{/if}
				</li>
			{/each}
		</ol>
	</nav>

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
