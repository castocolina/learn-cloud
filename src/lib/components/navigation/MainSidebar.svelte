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
	import { ChevronRight, ChevronDown, BookOpen, CircleDot, X } from "lucide-svelte";
	import * as Sidebar from "$lib/components/ui/sidebar";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { useSidebar } from "$lib/components/ui/sidebar/context.svelte.js";
	import { navigationStore } from "$lib/stores/spaNavigation.js";
	import { navigateToContent } from "$lib/utils/spaNavigation.js";
	import { contentMenu } from "$data/generated/content-menu.js";
	import { SETTINGS } from "$config/settings.js";
	import type { MenuUnit, MenuChapter } from "$types";
	import IconButton from "$lib/components/shared/IconButton.svelte";

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

	// Get sidebar context to detect collapsed state
	const sidebar = useSidebar();

	// Subscribe to writable store with $ prefix
	const currentId = $derived($navigationStore.currentId);

	// Track expanded unit (accordion behavior - only one unit open at a time)
	let expandedUnitId = $state<string | null>(null);

	/**
	 * Truncate text to max 15 characters (12 + "..." if longer)
	 * Used for footer text in desktop collapsed mode only
	 */
	function truncateText(text: string, maxLength: number = 15): string {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength - 3) + "...";
	}

	// Footer text with truncation only in desktop collapsed mode
	const footerText = $derived(
		!sidebar.isMobile && sidebar.state === "collapsed"
			? truncateText(contentMenu.metadata.title)
			: contentMenu.metadata.title
	);

	// Show tooltip only in desktop collapsed mode
	const showFooterTooltip = $derived(!sidebar.isMobile && sidebar.state === "collapsed");

	/**
	 * Handle chevron click - ONLY toggle accordion expansion
	 * Does NOT navigate or close sidebar (allows exploring without navigation)
	 */
	function handleUnitToggle(unitId: string, event?: MouseEvent): void {
		event?.stopPropagation(); // Prevent triggering navigation on parent (if mouse event)
		// Accordion behavior: clicking same unit collapses it, clicking different unit expands it
		expandedUnitId = expandedUnitId === unitId ? null : unitId;
	}

	/**
	 * Handle unit title/emoji click - Toggle expansion, navigate to overview, and close mobile sidebar
	 */
	function handleUnitNavigate(unit: MenuUnit): void {
		// Toggle expansion (accordion behavior)
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

			// Auto-close sidebar on mobile after navigation
			if (sidebar.isMobile) {
				sidebar.setOpenMobile(false);
			}
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

		// Auto-close sidebar on mobile after navigation
		if (sidebar.isMobile) {
			sidebar.setOpenMobile(false);
		}
	}

	/**
	 * Check if chapter is currently active
	 */
	function isChapterActive(chapterId: string): boolean {
		return currentId === chapterId;
	}
</script>

<Sidebar.Root {collapsible} class="main-sidebar {className || ''}" role="navigation">
	<Sidebar.Content class="main-sidebar-content">
		<!-- Navigation Header with Integrated Trigger -->
		<Sidebar.Header class="main-sidebar-header">
			<!-- Header Title Row: Icon + Title + Trigger/Close -->
			<div class="sidebar-header-row">
				<!-- Icon (clickeable to toggle sidebar) - tooltip only on desktop -->
				{#if sidebar.isMobile}
					<!-- Mobile: Book icon button (IconButton for consistent interactivity) -->
					<IconButton
						icon={BookOpen}
						label="Toggle sidebar"
						onClick={() => sidebar.toggle()}
						size={20}
						variant="ghost"
						class="sidebar-header-icon"
					/>
				{:else}
					<!-- Desktop: Button with tooltip -->
					<Tooltip.Root>
						<Tooltip.Trigger
							type="button"
							class="sidebar-header-icon"
							onclick={() => sidebar.toggle()}
							aria-label="Toggle sidebar"
						>
							<BookOpen class="size-5" />
						</Tooltip.Trigger>
						<Tooltip.Content side="right">
							{SETTINGS.ui.sidebar.header.title}
						</Tooltip.Content>
					</Tooltip.Root>
				{/if}

				<!-- Title + Trigger (desktop) / Title + X (mobile) -->
				<div class="sidebar-header-title-group">
					<h2 class="sidebar-title">{SETTINGS.ui.sidebar.header.title}</h2>

					{#if sidebar.isMobile}
						<!-- Mobile: X close button (IconButton with default robust styling) -->
						<IconButton
							icon={X}
							label="Close sidebar"
							onClick={() => sidebar.toggle()}
							size={20}
							class="sidebar-header-close"
						/>
					{:else}
						<!-- Desktop: Collapse trigger -->
						<Sidebar.Trigger class="sidebar-header-trigger" />
					{/if}
				</div>
			</div>

			<!-- Progress Row: Icon + Stats -->
			<div class="sidebar-progress-row">
				<!-- Progress Icon - tooltip only on desktop -->
				{#if sidebar.isMobile}
					<!-- Mobile: Direct icon without tooltip -->
					<div class="sidebar-progress-icon" aria-label="Progress indicator">
						<CircleDot class="size-4" />
					</div>
				{:else}
					<!-- Desktop: Icon with tooltip -->
					<Tooltip.Root>
						<Tooltip.Trigger class="sidebar-progress-icon" aria-label="Progress indicator">
							<CircleDot class="size-4" />
						</Tooltip.Trigger>
						<Tooltip.Content side="right">
							Progress: {contentMenu.metadata.totalUnits} units •
							{contentMenu.metadata.totalChapters} chapters
						</Tooltip.Content>
					</Tooltip.Root>
				{/if}

				<!-- Progress Text (hidden in collapsed mode via CSS) -->
				<p class="sidebar-description">
					{SETTINGS.ui.sidebar.header.description
						.replace("{units}", String(contentMenu.metadata.totalUnits))
						.replace("{chapters}", String(contentMenu.metadata.totalChapters))}
				</p>
			</div>
		</Sidebar.Header>

		<!-- Units Navigation -->
		<Sidebar.Group class="sidebar-units-group">
			<Sidebar.GroupContent>
				<Sidebar.Menu class="sidebar-units-menu !gap-2">
					{#each contentMenu.units as unit (unit.id)}
						<Sidebar.MenuItem class="sidebar-unit-item">
							<!-- Unit Header Button with Tooltip for Icon Mode -->
							<Tooltip.Root>
								<Tooltip.Trigger>
									<Sidebar.MenuButton
										onclick={() => handleUnitNavigate(unit)}
										class="sidebar-unit-header !h-auto !min-h-14 !items-start !p-4 {expandedUnitId ===
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

										<!-- Expansion Toggle Button - IconButton for consistent interactivity -->
										{@const chevronIcon = expandedUnitId === unit.id ? ChevronDown : ChevronRight}
										{@const chevronLabel = `${expandedUnitId === unit.id ? "Collapse" : "Expand"} unit`}
										<IconButton
											icon={chevronIcon}
											label={chevronLabel}
											onClick={(e) => handleUnitToggle(unit.id, e)}
											size={16}
											variant="ghost"
											aria-expanded={expandedUnitId === unit.id}
											class="sidebar-unit-toggle-button"
										/>
									</Sidebar.MenuButton>
								</Tooltip.Trigger>

								<!-- Tooltip Content - Shows full title in icon mode -->
								<Tooltip.Content side="right" class="font-semibold">
									{unit.title}
								</Tooltip.Content>
							</Tooltip.Root>

							<!-- Chapters List (Collapsible) -->
							{#if expandedUnitId === unit.id}
								<Sidebar.MenuSub class="sidebar-chapters-list !gap-1.5">
									{#each unit.chapters as chapter (chapter.id)}
										{@const isActive = isChapterActive(chapter.id)}

										<Sidebar.MenuSubItem class="sidebar-chapter-item">
											<Sidebar.MenuSubButton
												onclick={() => handleChapterClick(chapter, unit)}
												class="sidebar-chapter-button !h-auto !min-h-12 !items-start !p-3.5 {isActive
													? 'sidebar-chapter-button--active'
													: ''}"
											>
												<!-- Chapter Icon -->
												<span class="sidebar-chapter-icon" aria-hidden="true">
													{chapter.emoji || "📄"}
												</span>

												<!-- Chapter Title (with text wrapping) -->
												<span class="sidebar-chapter-title !overflow-visible !whitespace-normal">
													{chapter.title}
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
				{#if showFooterTooltip}
					<!-- Desktop collapsed mode: Show truncated text with tooltip -->
					<Tooltip.Root>
						<Tooltip.Trigger>
							<p class="sidebar-footer-text">
								{footerText}
							</p>
						</Tooltip.Trigger>
						<Tooltip.Content side="right" class="max-w-xs">
							{contentMenu.metadata.title}
						</Tooltip.Content>
					</Tooltip.Root>
				{:else}
					<!-- Mobile or desktop expanded: Show full text -->
					<p class="sidebar-footer-text">
						{footerText}
					</p>
				{/if}
				<p class="sidebar-footer-version">v{SETTINGS.ui.sidebar.footer.version}</p>
			</div>
		</Sidebar.Footer>
	</Sidebar.Content>
</Sidebar.Root>
