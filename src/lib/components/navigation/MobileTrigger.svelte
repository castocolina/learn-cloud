<!--
	MobileTrigger Component - Mobile Hamburger Menu Button

	Custom sidebar trigger for mobile devices using shadcn-svelte pattern.
	Displays hamburger menu icon (☰) instead of default PanelLeft icon (⟨).

	IMPORTANT: Must be rendered INSIDE Sidebar.Provider context.
	Follows official shadcn-svelte custom trigger pattern:
	https://shadcn-svelte.com/docs/components/sidebar#custom-trigger

	Usage:
	<MobileTrigger class="md:hidden" />
-->
<script lang="ts">
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";
	import { Menu } from "lucide-svelte";

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

	// Get sidebar context (must be inside Sidebar.Provider)
	const sidebar = useSidebar();
</script>

<button
	type="button"
	class="mobile-trigger {className || ''}"
	onclick={() => sidebar.toggle()}
	aria-label="Open navigation menu"
>
	<Menu class="size-5" />
</button>
