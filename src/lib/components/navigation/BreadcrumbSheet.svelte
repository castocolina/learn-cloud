<!--
	BreadcrumbSheet Component - CSS-First Progressive Disclosure

	Responsive breadcrumb navigation using Material Design 3 principles.
	Displays breadcrumb with CSS-based progressive hiding for mobile.

	ARCHITECTURE (Material Design 3):
	- CSS-First responsive (no JavaScript viewport detection)
	- Progressive disclosure via media queries
	- Priority: Chapter title always visible
	- Bottom sheet for full hierarchy (WCAG compliant)

	RESPONSIVE STRATEGY:
	- Mobile ≤480px: Show emoji + chapter only (shortName hidden)
	- Tablet 481-767px: Show emoji + shortName + chapter (if chapter is short)
	- Desktop ≥768px: Show all with intelligent truncation

	BEST PRACTICES:
	- Nielsen Norman: Content-first on mobile
	- iOS HIG: Minimize navigation chrome
	- Material Design 3: Progressive disclosure pattern

	@component BreadcrumbSheet
-->
<script lang="ts">
	import * as Sheet from "$lib/components/ui/sheet";
	import { ChevronDown, ChevronUp } from "lucide-svelte";
	import type { BreadcrumbItem } from "$types";

	interface Props {
		/** Unit emoji (always visible) */
		emoji: string;
		/** Unit shortName (responsive visibility via CSS) */
		shortName: string;
		/** Chapter title (always visible, priority #1) */
		chapterTitle: string;
		/** Flag: Chapter is short (< 30 chars) - allows showing shortName on tablet */
		isShortChapter: boolean;
		/** Full breadcrumb hierarchy for sheet */
		breadcrumbs: BreadcrumbItem[];
	}

	let { emoji, shortName, chapterTitle, isShortChapter, breadcrumbs }: Props = $props();

	// Sheet open/closed state
	let open = $state(false);

	/**
	 * Navigate to a URL and close the sheet
	 */
	function navigateToUrl(url: string): void {
		if (url) {
			window.location.hash = url;
			open = false;
		}
	}
</script>

<Sheet.Root bind:open>
	<!--
		Trigger Button: Tailwind Inline + CSS-First Progressive Disclosure

		ARCHITECTURE (Material Design 3 + SVELTEKIT-GUIDE compliant):
		- Tailwind inline classes (compatible with shadcn-svelte Sheet.Trigger)
		- Progressive disclosure via responsive utilities (md:, lg:)
		- No scoped CSS (avoids shadcn component style conflicts)

		RESPONSIVE STRATEGY:
		- Mobile <768px: hidden → emoji + chapter only
		- Tablet 768-1023px (short chapters): md:inline → emoji + shortName + chapter
		- Desktop ≥1024px: lg:inline → all elements visible

		INTERACTIVE FEEDBACK (SVELTEKIT-GUIDE.md compliance):
		- cursor-pointer for click indication
		- hover:scale-[1.01] + hover:bg-accent for visual feedback
		- active:scale-[0.99] for tactile response
		- transition-all for smooth animations
	-->
	<Sheet.Trigger
		class="flex h-11 max-w-[min(calc(100vw-10rem),48rem)] min-w-0 flex-1 cursor-pointer items-center gap-2
		       rounded-md px-3 py-2 text-lg font-bold text-foreground
		       transition-all hover:scale-[1.01] hover:bg-accent
		       active:scale-[0.99]"
	>
		<!-- Emoji: Always visible, visual anchor -->
		{#if emoji}
			<span class="flex-shrink-0 text-xl" aria-hidden="true">{emoji}</span>
		{/if}

		<!--
			ShortName: CSS Progressive Disclosure
			- Mobile (<768px): hidden
			- Tablet (768-1023px) if short chapter: md:inline
			- Desktop (≥1024px): lg:inline
		-->
		{#if shortName}
			<span
				class="hidden flex-shrink-0 text-base font-semibold
			             {isShortChapter ? 'md:inline' : 'lg:inline'}"
			>
				{shortName}
			</span>
			<span
				class="hidden flex-shrink-0 opacity-60
			             {isShortChapter ? 'md:inline' : 'lg:inline'}"
				aria-hidden="true">•</span
			>
		{/if}

		<!-- Chapter: Always visible, truncates with ellipsis (priority #1) -->
		<span class="min-w-0 flex-1 truncate text-left">{chapterTitle}</span>

		<!-- Chevron icon: Always visible, indicates sheet state -->
		{#if open}
			<ChevronUp class="h-4 w-4 flex-shrink-0 transition-transform duration-200" />
		{:else}
			<ChevronDown class="h-4 w-4 flex-shrink-0 transition-transform duration-200" />
		{/if}
	</Sheet.Trigger>

	<!-- Sheet Content (slides from bottom) -->
	<Sheet.Content
		side="bottom"
		class="h-auto max-h-[90vh] overflow-y-auto px-4 md:mx-auto md:max-w-2xl"
	>
		<Sheet.Header>
			<Sheet.Title class="text-lg font-semibold">📍 You are here</Sheet.Title>
			<Sheet.Description class="text-sm text-foreground/80">
				Full navigation path and quick links
			</Sheet.Description>
		</Sheet.Header>

		<!-- Full Breadcrumb Hierarchy -->
		<nav aria-label="Full breadcrumb navigation" class="mt-2">
			<ol class="space-y-0" role="list">
				{#each breadcrumbs as crumb, index (crumb.id)}
					<li>
						<button
							type="button"
							onclick={() => navigateToUrl(crumb.url)}
							class="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left transition-colors md:px-3 md:py-2 {crumb.isActive
								? 'bg-accent font-semibold text-primary'
								: 'hover:bg-accent/50'}"
							aria-current={crumb.isActive ? "page" : undefined}
						>
							{#if crumb.emoji}
								<span class="text-lg" aria-hidden="true">{crumb.emoji}</span>
							{/if}
							<span class="flex-1 text-sm font-medium text-foreground">{crumb.label}</span>
						</button>
					</li>

					<!-- Separator: Simple horizontal line (only between items) -->
					{#if index < breadcrumbs.length - 1}
						<li class="mx-3 my-2" role="presentation">
							<div class="h-px w-full bg-slate-200 dark:bg-slate-700"></div>
						</li>
					{/if}
				{/each}
			</ol>
		</nav>

		<Sheet.Footer class="mt-3">
			<Sheet.Close
				class="h-10 w-full cursor-pointer rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold transition-all hover:scale-[1.02] hover:border-slate-400 hover:bg-slate-200 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500 dark:hover:bg-slate-700"
			>
				Close
			</Sheet.Close>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
