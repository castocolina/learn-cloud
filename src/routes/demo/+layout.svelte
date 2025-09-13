<script lang="ts">
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { page } from "$app/stores";

	let { children } = $props();

	// Get the current route to set breadcrumb
	const currentPath = $derived($page.url.pathname);
	const breadcrumbTitle = $derived(getBreadcrumbTitle(currentPath));

	function getBreadcrumbTitle(path: string): string {
		if (path === "/demo") return "Interactive Demo";
		if (path === "/demo/lesson") return "Container Orchestration Lesson";
		if (path === "/demo/quiz") return "Cloud-Native Quiz";
		if (path === "/demo/study-guide") return "Architecture Study Guide";
		return "Demo";
	}
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
			<Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item class="hidden md:block">
						<Breadcrumb.Link href="/demo">Cloud-Native Demo</Breadcrumb.Link>
					</Breadcrumb.Item>
					{#if currentPath !== "/demo"}
						<Breadcrumb.Separator class="hidden md:block" />
						<Breadcrumb.Item>
							<Breadcrumb.Page>{breadcrumbTitle}</Breadcrumb.Page>
						</Breadcrumb.Item>
					{/if}
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4">
			{@render children?.()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
