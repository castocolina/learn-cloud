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

	// Track which unit is open - accordion behavior (only one open at a time)
	let openUnit = $state<number | null>(0);

	function toggleUnit(unitIndex: number) {
		// If clicking the same unit, close it. Otherwise, open the new unit.
		openUnit = openUnit === unitIndex ? null : unitIndex;
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
						<button {...props} onclick={handleHomeClick} class="cursor-pointer">
							<div
								class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
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
					<Collapsible.Root open={openUnit === unitIndex} class="group/collapsible">
						<Sidebar.MenuItem>
							<div class="flex items-center gap-1">
								<!-- Unit title as clickeable button -->
								<button
									onclick={() => handleUnitClick(unit, unitIndex)}
									class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-1 cursor-pointer items-center gap-3 rounded-md px-3 py-3 text-sm font-medium"
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
											class="hover:bg-sidebar-accent flex h-10 w-10 cursor-pointer items-center justify-center rounded-md"
											aria-label={openUnit === unitIndex ? "Collapse unit" : "Expand unit"}
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
															class="flex w-full cursor-pointer items-center gap-3 px-3 py-2"
														>
															{#if getIconComponent(chapter.icon)}
																{@const ChapterIconComponent = getIconComponent(chapter.icon)}
																<ChapterIconComponent class="size-4" />
															{/if}
															<span class="flex-1 text-sm leading-relaxed">{chapter.title}</span>
															{#if chapter.type === "quiz"}
																<span class="text-muted-foreground ml-auto text-sm">Quiz</span>
															{:else if chapter.type === "study_guide"}
																<span class="text-muted-foreground ml-auto text-sm">Study</span>
															{:else if chapter.type === "exam"}
																<span class="text-muted-foreground ml-auto text-sm">Exam</span>
															{:else if chapter.type === "project"}
																<span class="text-muted-foreground ml-auto text-sm">Project</span>
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
