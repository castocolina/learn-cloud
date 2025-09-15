<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	export let className: string = "";
	export let breadcrumbData: any;
	export let navigateToUnit: (() => void) | undefined;
</script>

<header
	class={`bg-background sticky top-0 z-30 flex h-16 w-full items-center border-b px-4 shadow-sm ${className}`}
	aria-label="Site Header"
>
	<div class="flex flex-1 items-center gap-2">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item>
					{#if breadcrumbData?.isHomepage}
						<Breadcrumb.Page id="bread-1-unit">{breadcrumbData.unitName}</Breadcrumb.Page>
					{:else if breadcrumbData?.canNavigateToUnit}
						<Breadcrumb.Link
							id="bread-1-unit"
							href={breadcrumbData.unitHref || "#"}
							onclick={navigateToUnit}
						>
							{breadcrumbData.unitName}
						</Breadcrumb.Link>
					{:else if breadcrumbData?.showUnit}
						<Breadcrumb.Page id="bread-1-unit">{breadcrumbData.unitName}</Breadcrumb.Page>
					{:else}
						<Breadcrumb.Page id="bread-1-unit">{breadcrumbData.unitName}</Breadcrumb.Page>
					{/if}
				</Breadcrumb.Item>
				{#if breadcrumbData?.showChapter}
					<Breadcrumb.Separator />
					<Breadcrumb.Item>
						<Breadcrumb.Page id="bread-2-chapter">{breadcrumbData.chapterName}</Breadcrumb.Page>
					</Breadcrumb.Item>
				{/if}
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>
</header>

<style>
	header {
		position: sticky;
		top: 0;
		width: 100%;
		background: var(--background, #fff);
		z-index: 30;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
	}
	@media (max-width: 390px) {
		header {
			height: 56px;
			padding-left: 0.5rem;
			padding-right: 0.5rem;
		}
	}
</style>
