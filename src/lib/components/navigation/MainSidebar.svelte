<!--
	MainSidebar Component - Production Navigation Sidebar

	Responsive sidebar navigation using shadcn-svelte Sidebar with:
	- Integration with content-menu.ts (129 chapters across 10 units)
	- Unified navigation system (navigateToContent from utils/spaNavigation)
	- Active chapter highlighting from navigationStore
	- Collapsible units (accordion behavior - one unit open at a time)
	- Text wrapping for long chapter titles (critical fix)
	- Mobile-first responsive design
	- Progress tracking integration

	Architecture: Complex Wrapper Pattern (WRAPPER-PATTERN-GUIDE.md)
	Integration: Task 4 SPA Navigation System
-->
<script lang="ts">
	import { ChevronRight, ChevronDown } from "lucide-svelte";
	import * as Sidebar from "$lib/components/ui/sidebar";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { useSidebar } from "$lib/components/ui/sidebar/context.svelte.js";
	import { navigationStore } from "$lib/stores/spaNavigation.js";
	import { navigateToContent } from "$lib/utils/spaNavigation.js";
	import { contentMenu } from "$data/generated/content-menu.js";
	import { SETTINGS } from "$config/settings.js";
	import type { MenuUnit, MenuChapter } from "$types";

	// Props interface
	interface Props {
		/**
		 * Collapsible mode for sidebar
		 * @default "icon" (from SETTINGS.ui.sidebar.collapsibleMode)
		 */
		collapsible?: "none" | "icon" | "offcanvas";

		/**
		 * Additional CSS classes
		 */
		class?: string;
	}

	let { collapsible = SETTINGS.ui.sidebar.collapsibleMode, class: className }: Props = $props();

	// Derive current ID from navigation store for active highlighting
	const currentId = $derived($navigationStore.currentId);

	// Track expanded unit (accordion behavior - only one unit open at a time)
	let expandedUnitId = $state<string | null>(null);

	// Sidebar state for adaptive header
	const sidebarContext = useSidebar();
	const isCollapsed = $derived(sidebarContext.state === "collapsed");

	// Progress tracking (placeholder - will be enhanced in future tasks)
	const currentChapterIndex = $state(1); // TODO: Calculate from navigationStore
	const totalChapters = contentMenu.metadata.totalChapters;
	const progressPercentage = $derived((currentChapterIndex / totalChapters) * 100);

	/**
	 * Handle unit header click - toggle expansion (accordion)
	 */
	function handleUnitClick(unit: MenuUnit): void {
		// Accordion behavior: clicking same unit collapses it, clicking different unit expands it
		expandedUnitId = expandedUnitId === unit.id ? null : unit.id;

		// Navigate to unit overview if available
		const overviewChapter = unit.chapters.find((ch) => ch.type === "overview");
		if (overviewChapter) {
			navigateToContent({
				type: "navigate",
				target: overviewChapter.chapterUrl,
				source: "sidebar",
				data: { unitId: unit.id, chapterId: overviewChapter.id },
				timestamp: new Date()
			});
		}
	}

	/**
	 * Handle chapter selection - navigate using unified navigation system
	 */
	function handleChapterClick(chapter: MenuChapter, unit: MenuUnit): void {
		navigateToContent({
			type: "navigate",
			target: chapter.chapterUrl,
			source: "sidebar",
			data: { unitId: unit.id, chapterId: chapter.id },
			timestamp: new Date()
		});
	}

	/**
	 * Check if chapter is currently active
	 */
	function isChapterActive(chapterId: string): boolean {
		return currentId === chapterId;
	}
</script>

<Sidebar.Root {collapsible} class="main-sidebar {className || ''}">
	<Sidebar.Content class="main-sidebar-content">
		<!-- Progress & Stats Section (Adaptive) -->
		<Sidebar.Header class="main-sidebar-header">
			{#if isCollapsed}
				<!-- Collapsed Mode: Circular progress indicator -->
				<div class="flex justify-center">
					<div class="relative h-12 w-12">
						<!-- SVG circular progress (slate theme colors) -->
						<svg class="h-full w-full -rotate-90" viewBox="0 0 36 36">
							<!-- Background circle -->
							<circle
								cx="18"
								cy="18"
								r="15.5"
								fill="none"
								stroke="hsl(var(--muted, 215.4 16.3% 46.9%))"
								stroke-width="2"
								opacity="0.2"
							/>
							<!-- Progress circle -->
							<circle
								cx="18"
								cy="18"
								r="15.5"
								fill="none"
								stroke="hsl(var(--primary, 222.2 47.4% 11.2%))"
								stroke-width="2.5"
								stroke-dasharray="{progressPercentage} 100"
								stroke-linecap="round"
								class="transition-all duration-300"
							/>
						</svg>
						<!-- Center text: current chapter number -->
						<div class="absolute inset-0 flex items-center justify-center">
							<span class="text-xs font-bold text-foreground">{currentChapterIndex}</span>
						</div>
					</div>
				</div>
			{:else}
				<!-- Expanded Mode: Normal header with stats -->
				<div class="sidebar-header-content">
					<h2 class="sidebar-title">Navigation</h2>
					<p class="sidebar-description">
						{contentMenu.metadata.totalUnits} units • {contentMenu.metadata.totalChapters} chapters
					</p>
					<!-- TODO: Add linear progress bar here in future task -->
				</div>
			{/if}
		</Sidebar.Header>

		<!-- Units Navigation -->
		<Sidebar.Group class="sidebar-units-group">
			<Sidebar.GroupContent>
				<Sidebar.Menu class="sidebar-units-menu">
					{#each contentMenu.units as unit (unit.id)}
						<Sidebar.MenuItem class="sidebar-unit-item">
							<!-- Unit Header Button with Tooltip for Icon Mode -->
							<Tooltip.Root>
								<Tooltip.Trigger>
									<Sidebar.MenuButton
										onclick={() => handleUnitClick(unit)}
										class="sidebar-unit-header !h-auto !min-h-16 !items-start {expandedUnitId ===
										unit.id
											? 'sidebar-unit-header--expanded'
											: ''}"
									>
										<!-- Unit Icon (Emoji) - Always visible, prominent in icon mode -->
										<span class="sidebar-unit-icon" aria-hidden="true">
											{unit.emoji || unit.icon || "📦"}
										</span>

										<!-- Unit Info - Hidden in icon mode via CSS -->
										<div class="sidebar-unit-info">
											<span class="sidebar-unit-title">{unit.title}</span>
											<div class="sidebar-unit-meta">
												<span class="sidebar-unit-count">
													{unit.chapters.length} chapters
												</span>
												{#if unit.estimatedHours}
													<span class="sidebar-unit-duration">
														{unit.estimatedHours}h
													</span>
												{/if}
											</div>
										</div>

										<!-- Expansion Toggle - Hidden in icon mode via CSS -->
										<div class="sidebar-unit-toggle">
											{#if expandedUnitId === unit.id}
												<ChevronDown size={16} />
											{:else}
												<ChevronRight size={16} />
											{/if}
										</div>
									</Sidebar.MenuButton>
								</Tooltip.Trigger>

								<!-- Tooltip Content - Solid background with slate theme colors -->
								<Tooltip.Content
									side="right"
									class="border border-slate-700 bg-slate-900 font-semibold text-slate-50 shadow-xl"
								>
									{unit.title}
								</Tooltip.Content>
							</Tooltip.Root>

							<!-- Chapters List (Collapsible) -->
							{#if expandedUnitId === unit.id}
								<Sidebar.MenuSub class="sidebar-chapters-list">
									{#each unit.chapters as chapter (chapter.id)}
										{@const isActive = isChapterActive(chapter.id)}

										<Sidebar.MenuSubItem class="sidebar-chapter-item">
											<Sidebar.MenuSubButton
												onclick={() => handleChapterClick(chapter, unit)}
												class="sidebar-chapter-button {isActive
													? 'sidebar-chapter-button--active'
													: ''}"
											>
												<!-- Chapter Icon -->
												<span class="sidebar-chapter-icon" aria-hidden="true">
													{chapter.emoji || "📄"}
												</span>

												<!-- Chapter Title (with text wrapping) -->
												<span class="sidebar-chapter-title">
													{chapter.title}
												</span>

												<!-- Chapter Type Badge -->
												<span class="sidebar-chapter-type" aria-label={chapter.type}>
													{#if chapter.type === "lesson"}
														📖
													{:else if chapter.type === "quiz"}
														❓
													{:else if chapter.type === "study_guide"}
														📚
													{:else if chapter.type === "overview"}
														👁️
													{:else if chapter.type === "exam"}
														📝
													{:else if chapter.type === "project"}
														🚀
													{/if}
												</span>
											</Sidebar.MenuSubButton>
										</Sidebar.MenuSubItem>
									{/each}
								</Sidebar.MenuSub>
							{/if}
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<!-- Footer with metadata -->
		<Sidebar.Footer class="main-sidebar-footer">
			<div class="sidebar-footer-content">
				<p class="sidebar-footer-text">
					{contentMenu.metadata.title}
				</p>
				{#if contentMenu.metadata.version}
					<p class="sidebar-footer-version">v{contentMenu.metadata.version}</p>
				{/if}
			</div>
		</Sidebar.Footer>
	</Sidebar.Content>
</Sidebar.Root>
