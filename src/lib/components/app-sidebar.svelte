<script lang="ts">
	import SearchForm from "./search-form.svelte";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import BookOpenIcon from "@lucide/svelte/icons/book-open";
	import MinusIcon from "@lucide/svelte/icons/minus";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import type { ComponentProps } from "svelte";
	import { getIconComponent } from "$lib/utils/icon-mapping.js";
	import { contentMenu } from "$lib/../data/content-menu.js";
	import { loadUnitContent, loadChapterContent, showWelcome } from "$lib/utils/contentLoader.js";

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	// Track which units are open - start with first unit open
	let openUnits = $state<Set<number>>(new Set([0]));

	function toggleUnit(unitIndex: number) {
		if (openUnits.has(unitIndex)) {
			openUnits.delete(unitIndex);
		} else {
			openUnits.add(unitIndex);
		}
		openUnits = new Set(openUnits);
	}

	// Content loading functions
	function handleUnitClick(unit: any, unitIndex: number) {
		// Always toggle the unit (open if closed, close if open)
		toggleUnit(unitIndex);
		// Load unit content with hash
		loadUnitContent(unit.unit_data, unit.unit_link);
	}

	function handleChapterClick(chapterData: string, chapterLink: string) {
		loadChapterContent(chapterData, chapterLink);
	}

	function handleHomeClick() {
		showWelcome();
	}
</script>

<Sidebar.Root bind:ref {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<button {...props} onclick={handleHomeClick}>
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
							>
								<BookOpenIcon class="size-4" />
							</div>
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="font-medium">{contentMenu.metadata.title}</span>
							</div>
						</button>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
		<SearchForm />
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.Menu>
				{#each contentMenu.units as unit, unitIndex (unit.title)}
					<Collapsible.Root open={openUnits.has(unitIndex)} class="group/collapsible">
						<Sidebar.MenuItem>
							<div class="flex items-center gap-1">
								<!-- Unit title as clickeable button -->
								<button
									onclick={() => handleUnitClick(unit, unitIndex)}
									class="flex flex-1 items-center gap-3 rounded-md px-3 py-3 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
								>
									{#if getIconComponent(unit.icon)}
										{@const IconComponent = getIconComponent(unit.icon)}
										<IconComponent class="size-5" />
									{/if}
									<span class="text-sm leading-tight font-medium">{unit.title}</span>
								</button>

								<!-- Separate collapse/expand button -->
								<Collapsible.Trigger>
									{#snippet child({ props })}
										<button
											{...props}
											onclick={() => toggleUnit(unitIndex)}
											class="flex h-10 w-10 items-center justify-center rounded-md hover:bg-sidebar-accent cursor-pointer"
											aria-label={openUnits.has(unitIndex) ? "Collapse unit" : "Expand unit"}
										>
											<PlusIcon class="size-5 group-data-[state=open]/collapsible:hidden" />
											<MinusIcon class="size-5 group-data-[state=closed]/collapsible:hidden" />
										</button>
									{/snippet}
								</Collapsible.Trigger>
							</div>
							{#if unit.chapters?.length}
								<Collapsible.Content>
									<Sidebar.MenuSub>
										{#each unit.chapters as chapter (chapter.title)}
											<Sidebar.MenuSubItem>
												<Sidebar.MenuSubButton>
													{#snippet child({ props })}
														<button
															onclick={() =>
																handleChapterClick(chapter.chapter_data, chapter.chapter_link)}
															{...props}
															class="flex w-full items-center gap-3 px-3 py-2 cursor-pointer"
														>
															{#if getIconComponent(chapter.icon)}
																{@const ChapterIconComponent = getIconComponent(chapter.icon)}
																<ChapterIconComponent class="size-4" />
															{/if}
															<span class="flex-1 text-sm leading-relaxed">{chapter.title}</span>
															{#if chapter.type === "quiz"}
																<span class="ml-auto text-sm text-muted-foreground">Quiz</span>
															{:else if chapter.type === "study_guide"}
																<span class="ml-auto text-sm text-muted-foreground">Study</span>
															{:else if chapter.type === "exam"}
																<span class="ml-auto text-sm text-muted-foreground">Exam</span>
															{:else if chapter.type === "project"}
																<span class="ml-auto text-sm text-muted-foreground">Project</span>
															{/if}
														</button>
													{/snippet}
												</Sidebar.MenuSubButton>
											</Sidebar.MenuSubItem>
										{/each}
									</Sidebar.MenuSub>
								</Collapsible.Content>
							{/if}
						</Sidebar.MenuItem>
					</Collapsible.Root>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
